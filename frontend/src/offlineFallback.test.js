import test from 'node:test';
import assert from 'node:assert/strict';
import zlib from 'node:zlib';
import { handleOfflineRequest, resetOfflineState } from './offlineFallback.js';

test('offlineFallback: /health and /schemes return 200 citizens, 100 KA pool, 15 schemes, 5 Jevify recipes', async () => {
  resetOfflineState();
  const h = await handleOfflineRequest('/health');
  assert.equal(h.status, 'OPERATIONAL');
  assert.equal(h.citizens_loaded, 200);
  assert.equal(h.ka_100_cohort_size, 100);
  assert.equal(h.schemes_loaded, 15);
  assert.equal(h.ai_subsystems.jevify.recipes_available, 5);

  const s = await handleOfflineRequest('/schemes');
  assert.equal(s.total, 15);
  assert.equal(s.schemes[0].id, 'SCH-01');
  assert.ok(s.knowledge_graph.edges.length >= 30);
});

test('offlineFallback: /match/cohort on ka_100 flags exactly 18 of 100 eligible and 7 HITL cases', async () => {
  resetOfflineState();
  const res = await handleOfflineRequest('/match/cohort', {
    method: 'POST',
    body: JSON.stringify({ scheme_id: 'SCH-01', cohort: 'ka_100' }),
  });
  assert.equal(res.total_queried, 100);
  assert.equal(res.eligible_count, 18);
  assert.equal(res.headline_badge, '18 of 100 FLAGGED ELIGIBLE');
  assert.equal(res.hitl_review_queue_count, 7);
  assert.equal(res.privacy_architecture.raw_bank_statements_stored, 0);
});

test('offlineFallback: /ai/jevify/probe returns all fields required by KnowledgeGraphView.jsx across all 5 recipes', async () => {
  const recipesRes = await handleOfflineRequest('/ai/jevify/recipes');
  assert.equal(recipesRes.recipes.length, 5);

  const probeBonsai = await handleOfflineRequest('/ai/jevify/probe?recipe=ternary-bonsai-2-27b.llamacpp', { method: 'POST' });
  assert.equal(probeBonsai.status, 'PROBED_AND_VERIFIED');
  assert.equal(probeBonsai.selected_readout_rung, 'named_token_logprobs');
  assert.equal(probeBonsai.recipe.backend, 'llama.cpp (PrismML)');
  assert.ok(probeBonsai.telemetry_contract.includes('x_jevify/1.0'));
  assert.ok(probeBonsai.prefix_cache_warmup.warmup_ms > 0);

  const probeBart = await handleOfflineRequest('/ai/jevify/probe?recipe=bart-large-mnli.local', { method: 'POST' });
  assert.equal(probeBart.selected_readout_rung, 'encoder_entailment_head');
  assert.equal(probeBart.recipe.median_latency_ms, 8);
});

test('offlineFallback: /policy/ingest and /policy/upload-pdf extract PDF text (including FlateDecode) and reject corrupted PDFs', async () => {
  // 1. Plain PDF stream with Tj literal
  const validPdf =
    '%PDF-1.4\n1 0 obj\n<< /Length 120 >>\nstream\n' +
    'BT /F1 12 Tf 72 712 Td (Every cultivating farmer in Karnataka holding less than 1.8 Hectares with KCC and income below 2,00,000) Tj ET\n' +
    'endstream\nendobj\n%%EOF';

  const r1 = await handleOfflineRequest('/policy/ingest', {
    method: 'POST',
    body: JSON.stringify({ raw_text: validPdf, title: 'Gazette PDF Test' }),
  });
  assert.equal(r1.status, 'INGESTED_TO_KNOWLEDGE_GRAPH');
  assert.ok(!r1.gazette.excerpt.includes('%PDF'));
  assert.ok(r1.gazette.excerpt.includes('Karnataka'));
  assert.equal(r1.jevify_readout.answers.sector_classification.choice, 'agriculture');

  // 2. FlateDecode compressed PDF stream via FormData upload
  const compressedPayload = zlib.deflateSync(
    Buffer.from('BT (Every enrolled student in Madhya Pradesh with household income below 2,00,000 scholarship) Tj ET', 'utf-8')
  );
  const pdfHeader = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Filter /FlateDecode >>\nstream\n', 'latin1');
  const pdfFooter = Buffer.from('\nendstream\nendobj\n%%EOF', 'latin1');
  const fullPdfBytes = Buffer.concat([pdfHeader, compressedPayload, pdfFooter]);

  const form = new FormData();
  form.append('file', new File([fullPdfBytes], 'scholarship_gazette.pdf', { type: 'application/pdf' }));
  form.append('jevify_recipe', 'gemma-4-e4b-it.llamacpp');

  const r2 = await handleOfflineRequest('/policy/upload-pdf', {
    method: 'POST',
    body: form,
  });
  assert.equal(r2.uploaded_filename, 'scholarship_gazette.pdf');
  assert.ok(r2.gazette.excerpt.includes('scholarship'));
  assert.equal(r2.jevify_readout.answers.sector_classification.choice, 'education');
  assert.ok(r2.jevify_readout.answers.land_ceiling_present.noul < 0.5);

  // 3. Corrupted binary PDF must throw
  await assert.rejects(
    () =>
      handleOfflineRequest('/policy/ingest', {
        method: 'POST',
        body: JSON.stringify({ raw_text: '%PDF-1.4 \x00\x01\x02stream binary endstream' }),
      }),
    /Corrupted or unreadable binary PDF/
  );
});

test('offlineFallback: multilingual negation guard, clarification intent, and single-use DEPA token security', async () => {
  resetOfflineState();

  for (const negText of ['No, do not submit', 'हाँ लेकिन अभी नहीं चाहिए', 'नाही, नको', 'வேண்டாம்', 'ಇಲ್ಲ']) {
    const res = await handleOfflineRequest('/voice/verify-consent', {
      method: 'POST',
      body: JSON.stringify({ citizen_id: 'CIT-001', scheme_id: 'SCH-02', spoken_text: negText }),
    });
    assert.equal(res.consent_granted, false, `Should reject negative utterance: ${negText}`);
    assert.equal(res.depa_consent_artefact, null);
    assert.equal(res.jevify_nlu_readout.answers.intent_action.choice, 'abort_and_purge');
  }

  // Clarification utterance
  const clar = await handleOfflineRequest('/voice/verify-consent', {
    method: 'POST',
    body: JSON.stringify({ citizen_id: 'CIT-001', scheme_id: 'SCH-02', spoken_text: 'What is this scheme? Call me later' }),
  });
  assert.equal(clar.consent_granted, false);
  assert.equal(clar.jevify_nlu_readout.answers.intent_action.choice, 'request_clarification');

  // Affirmative consent -> DBT dispatch -> Purpose-binding check -> Single-use replay rejection
  const yes = await handleOfflineRequest('/voice/verify-consent', {
    method: 'POST',
    body: JSON.stringify({ citizen_id: 'CIT-001', scheme_id: 'SCH-02', spoken_text: 'Haan, manzoor hai' }),
  });
  assert.equal(yes.consent_granted, true);
  const caId = yes.depa_consent_artefact.artefact_id;

  // Cross-citizen hijack must fail
  await assert.rejects(
    () =>
      handleOfflineRequest('/dbt/dispatch', {
        method: 'POST',
        body: JSON.stringify({ citizen_id: 'CIT-002', scheme_id: 'SCH-02', consent_artefact_id: caId }),
      }),
    /purpose-bound to a different citizen or scheme/
  );

  // Legitimate dispatch succeeds and revokes token
  const dbt = await handleOfflineRequest('/dbt/dispatch', {
    method: 'POST',
    body: JSON.stringify({ citizen_id: 'CIT-001', scheme_id: 'SCH-02', consent_artefact_id: caId }),
  });
  assert.equal(dbt.status, 'DISBURSED');
  assert.equal(dbt.revoked_consent_artefact.status, 'REVOKED_POST_EXECUTION');

  // Replay attack with revoked token must fail
  await assert.rejects(
    () =>
      handleOfflineRequest('/dbt/dispatch', {
        method: 'POST',
        body: JSON.stringify({ citizen_id: 'CIT-001', scheme_id: 'SCH-02', consent_artefact_id: caId }),
      }),
    /already been revoked post-execution/
  );
});

test('offlineFallback: Tier 03 HITL override updates eligibility and rejects invalid decision values', async () => {
  resetOfflineState();

  const hitlRes = await handleOfflineRequest('/admin/hitl-review', {
    method: 'POST',
    body: JSON.stringify({
      citizen_id: 'CIT-023',
      scheme_id: 'SCH-01',
      decision: 'APPROVED_OVERRIDE',
      officer_name: 'Prakash Nadagouda (PDO)',
    }),
  });
  assert.equal(hitlRes.updated_evaluation.eligible, true);
  assert.equal(hitlRes.updated_evaluation.hitl_override_applied, true);

  await assert.rejects(
    () =>
      handleOfflineRequest('/admin/hitl-review', {
        method: 'POST',
        body: JSON.stringify({ citizen_id: 'CIT-023', scheme_id: 'SCH-01', decision: 'INVALID_DECISION' }),
      }),
    /decision must be/
  );

  resetOfflineState();
});
