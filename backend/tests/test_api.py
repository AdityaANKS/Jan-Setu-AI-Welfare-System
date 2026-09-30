"""
Comprehensive automated test suite for Jan-Setu AI (जन-सेतु) FastAPI Backend.
Tests happy paths, deterministic 18/100 Karnataka cohort matching, ZKP privacy guarantees,
DEPA token revocation, Jevify single-pass typed readout (choice, score, noul, negation flips),
OpenAI SIWC OAuth PKCE flow, Bhashini multilingual voice, DBT PID-777 dispatch,
Tier 03 Panchayat HITL review, and error/edge cases.
"""

import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from main import app, HITL_OVERRIDES

client = TestClient(app)


def test_health_and_counts():
    r = client.get("/api/v1/health")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "OPERATIONAL"
    assert data["citizens_loaded"] == 200
    assert data["ka_100_cohort_size"] == 100
    assert data["schemes_loaded"] == 15
    assert data["knowledge_graph"]["nodes"] > 20
    assert data["ai_subsystems"]["jevify"]["readout_rung"] == "named_token_logprobs"
    assert "openai_siwc" in data["ai_subsystems"]


def test_schemes_and_knowledge_graph():
    r = client.get("/api/v1/schemes")
    assert r.status_code == 200
    data = r.json()
    assert data["total"] == 15
    assert len(data["schemes"]) == 15
    sch01 = data["schemes"][0]
    assert sch01["id"] == "SCH-01"
    assert sch01["name"] == "Karnataka Krishi Sanjeevani Scheme"
    assert "boolean_ast" in sch01
    assert len(data["knowledge_graph"]["edges"]) >= 30


def test_karnataka_100_cohort_flags_exactly_18_eligible():
    # Ensure clean HITL overrides before checking baseline 18/100
    HITL_OVERRIDES.clear()
    r = client.post("/api/v1/match/cohort", json={"scheme_id": "SCH-01", "cohort": "ka_100"})
    assert r.status_code == 200
    data = r.json()
    assert data["total_queried"] == 100
    assert data["eligible_count"] == 18
    assert data["headline_badge"] == "18 of 100 FLAGGED ELIGIBLE"
    assert data["hitl_review_queue_count"] == 7
    assert data["privacy_architecture"]["raw_bank_statements_stored"] == 0
    for cand in data["eligible_candidates"]:
        assert "zkp_commitments" in cand
        assert "chain_of_entitlement" in cand


def test_policy_ingest_preset_and_custom_text():
    # 1. Preset scheme ingestion
    r1 = client.post("/api/v1/policy/ingest", json={"preset_scheme_id": "SCH-01"})
    assert r1.status_code == 200
    d1 = r1.json()
    assert d1["status"] == "INGESTED_TO_KNOWLEDGE_GRAPH"
    assert len(d1["rules"]) == 5
    assert "jevify_readout" in d1
    assert d1["jevify_readout"]["answers"]["sector_classification"]["choice"] == "agriculture"

    # 2. Custom raw gazette text ingestion
    custom_gazette = (
        "Every cultivating farmer in Karnataka holding less than 1.75 Hectares of agricultural land "
        "with an active Kisan Credit Card and annual income below 2,00,000 shall receive ₹18,000."
    )
    r2 = client.post("/api/v1/policy/ingest", json={"raw_text": custom_gazette, "title": "Custom Gazette Test"})
    assert r2.status_code == 200
    d2 = r2.json()
    fields = [rule["field"] for rule in d2["rules"]]
    assert "state" in fields
    assert "occupation" in fields
    assert "land_holding_ha" in fields
    assert "annual_income_inr" in fields
    assert "kcc_active" in fields

    # 3. Empty custom text should return 400 when preset_scheme_id is not matched
    r3 = client.post("/api/v1/policy/ingest", json={"preset_scheme_id": "NON-EXISTENT", "raw_text": "   "})
    assert r3.status_code == 400


def test_citizen_entitlements_and_404():
    # Hero citizen CIT-001 (Ramesh Kumar - UP Farmer)
    r1 = client.get("/api/v1/citizens/CIT-001/entitlements")
    assert r1.status_code == 200
    d1 = r1.json()
    assert d1["citizen"]["name"] == "Ramesh Kumar"
    assert d1["summary"]["pre_approved_count"] >= 4
    scheme_ids = [s["scheme_id"] for s in d1["pre_approved_entitlements"]]
    assert "SCH-02" in scheme_ids  # PM-KUSUM ₹15,000

    # Non-existent citizen returns 404
    r404 = client.get("/api/v1/citizens/CIT-999/entitlements")
    assert r404.status_code == 404


def test_bhashini_voice_outbound_and_consent_verification_with_negation_guard():
    # Outbound call in Hindi for Ramesh-ji (CIT-001) on PM-KUSUM (SCH-02)
    r_out = client.post(
        "/api/v1/voice/outbound",
        json={"citizen_id": "CIT-001", "scheme_id": "SCH-02", "language": "hi", "channel": "IVR_CALL"},
    )
    assert r_out.status_code == 200
    out_data = r_out.json()
    assert "Ramesh" in out_data["outbound_prompt_en"]
    assert "15,000" in out_data["outbound_prompt_local"]
    assert set(out_data["all_language_scripts"].keys()) >= {"hi", "kn", "en", "bho", "mr", "ta"}

    # Affirmative spoken consent ("Haan, manzoor hai")
    r_yes = client.post(
        "/api/v1/voice/verify-consent",
        json={"citizen_id": "CIT-001", "scheme_id": "SCH-02", "spoken_text": "हाँ, मंजूर है (Haan, manzoor hai)"},
    )
    assert r_yes.status_code == 200
    yes_data = r_yes.json()
    assert yes_data["consent_granted"] is True
    assert yes_data["depa_consent_artefact"] is not None
    assert yes_data["depa_consent_artefact"]["status"] == "ACTIVE_PURPOSE_BOUND"
    assert yes_data["jevify_nlu_readout"]["answers"]["consent_affirmative"]["noul"] >= 0.9

    # Negative / refusal spoken response ("Nahi, mat bhejiye / Do NOT submit")
    r_no = client.post(
        "/api/v1/voice/verify-consent",
        json={"citizen_id": "CIT-001", "scheme_id": "SCH-02", "spoken_text": "Nahi, do not submit my application"},
    )
    assert r_no.status_code == 200
    no_data = r_no.json()
    assert no_data["consent_granted"] is False
    assert no_data["depa_consent_artefact"] is None
    assert no_data["jevify_nlu_readout"]["answers"]["negation_flip_guard"]["noul"] >= 0.9


def test_dbt_dispatch_and_immediate_depa_token_revocation():
    # First create consent
    r_yes = client.post(
        "/api/v1/voice/verify-consent",
        json={"citizen_id": "CIT-001", "scheme_id": "SCH-02", "spoken_text": "Haan, manzoor hai"},
    )
    ca_id = r_yes.json()["depa_consent_artefact"]["artefact_id"]

    # Dispatch DBT
    r_dbt = client.post(
        "/api/v1/dbt/dispatch",
        json={"citizen_id": "CIT-001", "scheme_id": "SCH-02", "consent_artefact_id": ca_id},
    )
    assert r_dbt.status_code == 200
    dbt_data = r_dbt.json()
    assert dbt_data["status"] == "DISBURSED"
    assert dbt_data["dbt_receipt"]["pid_reference"] == "PID-777"
    assert dbt_data["dbt_receipt"]["amount_credited_inr"] == 15000
    assert dbt_data["dbt_receipt"]["intermediary_leakage_inr"] == 0
    assert dbt_data["revoked_consent_artefact"]["status"] == "REVOKED_POST_EXECUTION"
    assert dbt_data["revoked_consent_artefact"]["revoked_at"] is not None


def test_tier_03_panchayat_hitl_review_override_and_validation():
    HITL_OVERRIDES.clear()
    # Before HITL override, CIT-023 (Kallappa Naik, 2.06 Ha joint RTC) is NOT eligible for SCH-01
    r_before = client.get("/api/v1/citizens/CIT-023/entitlements")
    sch01_before = next(s for s in r_before.json()["other_evaluated_schemes"] if s["scheme_id"] == "SCH-01")
    assert sch01_before["eligible"] is False

    # Panchayat officer approves override under a paper trail
    r_hitl = client.post(
        "/api/v1/admin/hitl-review",
        json={
            "citizen_id": "CIT-023",
            "scheme_id": "SCH-01",
            "decision": "APPROVED_OVERRIDE",
            "officer_name": "Prakash Nadagouda (PDO, Gokak)",
            "officer_notes": "Joint family RTC verified; individual cultivated share is 1.03 Ha.",
        },
    )
    assert r_hitl.status_code == 200
    hitl_data = r_hitl.json()
    assert hitl_data["updated_evaluation"]["eligible"] is True
    assert hitl_data["updated_evaluation"]["hitl_override_applied"] is True
    assert hitl_data["audit_entry"]["paper_trail_signature"].startswith("0x")

    # Invalid decision enum returns 400
    r_bad = client.post(
        "/api/v1/admin/hitl-review",
        json={"citizen_id": "CIT-023", "scheme_id": "SCH-01", "decision": "INVALID_DECISION"},
    )
    assert r_bad.status_code == 400

    # Reset HITL_OVERRIDES so baseline state remains clean
    HITL_OVERRIDES.clear()


def test_jevify_and_openai_siwc_endpoints():
    # Jevify probe
    r_probe = client.post("/api/v1/ai/jevify/probe?recipe=ternary-bonsai-2-27b.llamacpp")
    assert r_probe.status_code == 200
    probe_json = r_probe.json()
    assert probe_json["status"] == "PROBED_AND_VERIFIED"
    assert probe_json["selected_readout_rung"] == "named_token_logprobs"
    assert "x_jevify/1.0" in probe_json["telemetry_contract"]
    assert probe_json["prefix_cache_warmup"]["warmup_ms"] > 0
    assert probe_json["recipe"]["backend"] == "llama.cpp (PrismML)"

    # Jevify ask batch
    r_ask = client.post(
        "/api/v1/ai/jevify/ask",
        json={
            "state": "Small and marginal farmers holding under 2.0 Hectares in Karnataka with income < 2,50,000 qualify.",
            "recipe": "gemma-4-e4b-it.llamacpp",
            "questions": [
                {"id": "dept", "kind": "choice", "prompt": "Which department?", "options": ["agriculture", "health", "education"]},
                {"id": "urgency", "kind": "score", "prompt": "Urgency?", "options": ["low", "medium", "high"]},
                {"id": "land_clause", "kind": "noul", "prompt": "Contains land threshold in hectares."},
            ],
        },
    )
    assert r_ask.status_code == 200
    ask_data = r_ask.json()
    assert ask_data["answers"]["dept"]["choice"] == "agriculture"
    assert "x_jevify" in ask_data["answers"]["dept"]
    assert ask_data["answers"]["land_clause"]["noul"] >= 0.9

    # OpenAI SIWC PKCE authorize -> callback -> revoke -> re-enable
    r_auth = client.post("/api/v1/auth/siwc/authorize", json={"plan_preference": "chatgpt_pro"})
    assert r_auth.status_code == 200
    auth_data = r_auth.json()
    assert auth_data["pkce"]["code_challenge_method"] == "S256"
    state_tok = auth_data["state"]

    r_cb = client.post(
        "/api/v1/auth/siwc/callback",
        json={"state": state_tok, "email": "collector.mandya@karnataka.gov.in", "active_model": "o3-mini"},
    )
    assert r_cb.status_code == 200
    assert r_cb.json()["authenticated"] is True
    assert r_cb.json()["active_model"] == "o3-mini"

    r_rev = client.post("/api/v1/auth/siwc/revoke")
    assert r_rev.status_code == 200
    assert r_rev.json()["authenticated"] is False

    # Restore authenticated session for UI default
    client.post("/api/v1/auth/siwc/callback", json={"email": "dwo.jansetu@india-stack.gov.in", "active_model": "gpt-4o"})


def test_multilingual_negation_guard_and_clarification_utterances():
    # Even when scheme benefit summary contains "1" (₹15,000 / ₹18,000), negative or clarification inputs must NOT grant consent
    negative_utterances = [
        "No",
        "No, do not submit",
        "हाँ लेकिन अभी नहीं चाहिए",
        "नाही, नको",
        "வேண்டாம்",
        "ಇಲ್ಲ",
        "नइखे चाही",
    ]
    for text in negative_utterances:
        res = client.post(
            "/api/v1/voice/verify-consent",
            json={"citizen_id": "CIT-001", "scheme_id": "SCH-02", "spoken_text": text},
        )
        assert res.status_code == 200, f"Failed status for {text}"
        body = res.json()
        assert body["consent_granted"] is False, f"Falsely granted consent for negative utterance: {text}"
        assert body["depa_consent_artefact"] is None
        assert body["jevify_nlu_readout"]["answers"]["negation_flip_guard"]["noul"] >= 0.9
        assert body["jevify_nlu_readout"]["answers"]["intent_action"]["choice"] == "abort_and_purge"

    # Clarification / neutral question must NOT grant consent
    clar_res = client.post(
        "/api/v1/voice/verify-consent",
        json={"citizen_id": "CIT-001", "scheme_id": "SCH-02", "spoken_text": "What is this scheme? Call me later"},
    )
    assert clar_res.status_code == 200
    clar_body = clar_res.json()
    assert clar_body["consent_granted"] is False
    assert clar_body["depa_consent_artefact"] is None
    assert clar_body["jevify_nlu_readout"]["answers"]["intent_action"]["choice"] == "request_clarification"


def test_pdf_stream_extraction_and_corrupted_pdf_rejection():
    # 1. Valid PDF stream with Tj text operator via JSON ingest
    valid_pdf_str = (
        "%PDF-1.4\n1 0 obj\n<< /Length 120 >>\nstream\n"
        "BT /F1 12 Tf 72 712 Td (Every cultivating farmer in Karnataka holding less than 1.8 Hectares with KCC and income below 2,20,000) Tj ET\n"
        "endstream\nendobj\n%%EOF"
    )
    r_pdf = client.post("/api/v1/policy/ingest", json={"raw_text": valid_pdf_str, "title": "Gazette PDF Stream"})
    assert r_pdf.status_code == 200
    pdf_data = r_pdf.json()
    assert "%PDF" not in pdf_data["gazette"]["excerpt"]
    assert "Karnataka" in pdf_data["gazette"]["excerpt"]
    extracted_fields = [r["field"] for r in pdf_data["rules"]]
    assert "state" in extracted_fields and "land_holding_ha" in extracted_fields

    # 2. Multipart file upload endpoint (/api/v1/policy/upload-pdf) with valid PDF
    r_up = client.post(
        "/api/v1/policy/upload-pdf",
        files={"file": ("gazette_ka.pdf", valid_pdf_str.encode("utf-8"), "application/pdf")},
        data={"title": "Uploaded Gazette PDF", "jevify_recipe": "gemma-4-e4b-it.llamacpp"},
    )
    assert r_up.status_code == 200
    assert r_up.json()["uploaded_filename"] == "gazette_ka.pdf"

    # 3. Corrupted binary PDF with no readable text stream must return 400 Bad Request
    corrupted_pdf = b"%PDF-1.4\n\x00\xff\xfe\xfd\x89\x90\n%%EOF"
    r_bad_up = client.post(
        "/api/v1/policy/upload-pdf",
        files={"file": ("corrupted.pdf", corrupted_pdf, "application/pdf")},
    )
    assert r_bad_up.status_code == 400

    r_bad_json = client.post(
        "/api/v1/policy/ingest",
        json={"raw_text": "%PDF-1.4 \x00\x01\x02\x03stream binary endstream"},
    )
    assert r_bad_json.status_code == 400


def test_custom_rules_cohort_matching():
    custom_rules = [
        {"field": "state", "operator": "==", "value": "KA", "clause_ref": "§4(1)(a)", "label": "Domicile State == Karnataka"},
        {"field": "occupation", "operator": "==", "value": "Farmer", "clause_ref": "§4(1)(b)", "label": "Occupation == Cultivating Farmer"},
        {"field": "land_holding_ha", "operator": "<=", "value": 1.0, "clause_ref": "§4(1)(c)", "label": "Land Holding <= 1.0 Hectares"},
    ]
    r = client.post(
        "/api/v1/match/cohort",
        json={"scheme_id": "SCH-01", "cohort": "ka_100", "custom_rules": custom_rules},
    )
    assert r.status_code == 200
    data = r.json()
    assert data["custom_rules_applied"] is True
    assert 0 < data["eligible_count"] < 18
    for cand in data["eligible_candidates"]:
        assert cand["land_holding_ha"] <= 1.0


def test_dbt_dispatch_security_guards():
    # 1. Mint a valid consent artefact for CIT-001 on SCH-02
    r_yes = client.post(
        "/api/v1/voice/verify-consent",
        json={"citizen_id": "CIT-001", "scheme_id": "SCH-02", "spoken_text": "Haan, manzoor hai"},
    )
    ca_id = r_yes.json()["depa_consent_artefact"]["artefact_id"]

    # 2. Cross-citizen token hijack attempt (using CIT-001's token for CIT-002) must fail with 400
    r_hijack = client.post(
        "/api/v1/dbt/dispatch",
        json={"citizen_id": "CIT-002", "scheme_id": "SCH-02", "consent_artefact_id": ca_id},
    )
    assert r_hijack.status_code == 400

    # 3. Legitimate first dispatch succeeds and revokes token
    r_ok = client.post(
        "/api/v1/dbt/dispatch",
        json={"citizen_id": "CIT-001", "scheme_id": "SCH-02", "consent_artefact_id": ca_id},
    )
    assert r_ok.status_code == 200

    # 4. Replay attack with already-revoked DEPA token must fail with 400
    r_replay = client.post(
        "/api/v1/dbt/dispatch",
        json={"citizen_id": "CIT-001", "scheme_id": "SCH-02", "consent_artefact_id": ca_id},
    )
    assert r_replay.status_code == 400

    # 5. Negative spoken utterance passed to DBT dispatch must fail with 400
    r_neg = client.post(
        "/api/v1/dbt/dispatch",
        json={"citizen_id": "CIT-001", "scheme_id": "SCH-02", "spoken_utterance": "Nahi, do not submit"},
    )
    assert r_neg.status_code == 400


def test_scheme_age_and_category_rules_and_analytics_invariants():
    r_sch = client.get("/api/v1/schemes").json()["schemes"]
    sch_map = {s["id"]: s for s in r_sch}

    # Verify SCH-08 has age <= 65, SCH-09 has age >= 18 and social_category in SC/ST/OBC, SCH-10 has age >= 19
    sch08_fields = [(r["field"], r["operator"], r["value"]) for r in sch_map["SCH-08"]["rules"]]
    assert ("age", "<=", 65) in sch08_fields

    sch09_fields = [(r["field"], r["operator"], r["value"]) for r in sch_map["SCH-09"]["rules"]]
    assert ("age", ">=", 18) in sch09_fields
    assert ("social_category", "in", ["SC", "ST", "OBC"]) in sch09_fields

    sch10_fields = [(r["field"], r["operator"], r["value"]) for r in sch_map["SCH-10"]["rules"]]
    assert ("age", ">=", 19) in sch10_fields

    # Verify analytics inclusion funnel is strictly monotonic even after multiple DBT dispatches
    r_an = client.get("/api/v1/admin/analytics")
    assert r_an.status_code == 200
    funnel = r_an.json()["inclusion_funnel"]
    counts = [stage["count"] for stage in funnel]
    for i in range(len(counts) - 1):
        assert counts[i] >= counts[i + 1], f"Funnel stage {i+1} ({counts[i+1]}) exceeded stage {i} ({counts[i]})"
        assert 0.0 <= funnel[i + 1]["pct"] <= 100.0

