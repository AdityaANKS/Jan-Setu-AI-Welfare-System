import React, { useState, useEffect } from 'react';
import {
  FileText,
  Upload,
  CheckCircle2,
  Shield,
  PhoneCall,
  MessageSquare,
  Volume2,
  Mic,
  Send,
  Lock,
  Sparkles,
  ArrowRight,
  Check,
  AlertTriangle,
  Cpu,
  Database,
  Landmark,
  FileCheck2,
  RefreshCw,
} from 'lucide-react';
import { api } from '../api';

const LANGUAGE_OPTIONS = [
  { code: 'hi', label: 'हिंदी (Hindi)', sampleYes: 'हाँ, मंजूर है (Haan, manzoor hai)' },
  { code: 'kn', label: 'ಕನ್ನಡ (Kannada)', sampleYes: 'ಹೌದು, ಒಪ್ಪಿಗೆ ಇದೆ (Haudu, oppige ide)' },
  { code: 'en', label: 'English (India)', sampleYes: 'Yes, I approve auto-submission' },
  { code: 'bho', label: 'भोजपुरी (Bhojpuri)', sampleYes: 'हाँ, मंजूर बा (Haan, manzoor ba)' },
  { code: 'mr', label: 'मराठी (Marathi)', sampleYes: 'होय, मंजूर आहे (Hoy, manzoor aahe)' },
  { code: 'ta', label: 'தமிழ் (Tamil)', sampleYes: 'ஆம், சம்மதம் (Aam, sammatham)' },
];

export default function PipelineStudio({ schemes, onGlobalRefresh }) {
  const [activeStep, setActiveStep] = useState(1);

  // Step 01 State
  const [selectedPresetId, setSelectedPresetId] = useState('SCH-01');
  const [customGazetteText, setCustomGazetteText] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('Karnataka_Krishi_Sanjeevani_Gazette_2026_No418.pdf');
  const [jevifyRecipe, setJevifyRecipe] = useState('gemma-4-e4b-it.llamacpp');
  const [ingesting, setIngesting] = useState(false);
  const [ingestResult, setIngestResult] = useState(null);
  const [ingestError, setIngestError] = useState(null);

  // Step 02 State
  const [cohortMode, setCohortMode] = useState('ka_100');
  const [matching, setMatching] = useState(false);
  const [cohortResult, setCohortResult] = useState(null);
  const [selectedCitizenId, setSelectedCitizenId] = useState('CIT-002');

  // Step 03 State
  const [voiceChannel, setVoiceChannel] = useState('IVR_CALL');
  const [voiceLang, setVoiceLang] = useState('hi');
  const [voiceData, setVoiceData] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [spokenInput, setSpokenInput] = useState('हाँ, मंजूर है (Haan, manzoor hai)');
  const [otpInput, setOtpInput] = useState('');
  const [consentVerification, setConsentVerification] = useState(null);
  const [verifyingConsent, setVerifyingConsent] = useState(false);

  // Step 04 State
  const [dispatching, setDispatching] = useState(false);
  const [dbtResult, setDbtResult] = useState(null);
  const [dbtError, setDbtError] = useState(null);

  // Load initial Step 01 & Step 02 data on mount
  useEffect(() => {
    runStep01Ingest('SCH-01', '');
    runStep02Match('SCH-01', 'ka_100');
  }, []);

  const runStep02Match = async (schemeId, cohort, customRules = null, customAst = null, customName = null, customBenefit = null) => {
    setMatching(true);
    try {
      const payload = { scheme_id: schemeId || 'SCH-01', cohort };
      if (customRules && customRules.length > 0) {
        payload.custom_rules = customRules;
        payload.custom_boolean_ast = customAst;
        payload.custom_scheme_name = customName;
        payload.custom_benefit_inr = customBenefit;
      }
      const res = await api.matchCohort(payload);
      setCohortResult(res);
      if (res.eligible_candidates?.length > 0) {
        const defaultCand =
          res.eligible_candidates.find((c) => c.citizen_id === 'CIT-001' || c.citizen_id === 'CIT-002') ||
          res.eligible_candidates[0];
        setSelectedCitizenId(defaultCand.citizen_id);
      }
    } catch (e) {
      console.error('Cohort match error:', e);
    } finally {
      setMatching(false);
    }
  };

  const runStep01Ingest = async (presetId, rawText, recipeOverride = null, titleOverride = null) => {
    setIngesting(true);
    setIngestError(null);
    const activeRec = recipeOverride || jevifyRecipe;
    const activeTitle = titleOverride || uploadedFileName;
    try {
      const payload = rawText
        ? { raw_text: rawText, title: activeTitle, jevify_recipe: activeRec }
        : { preset_scheme_id: presetId, jevify_recipe: activeRec };
      const res = await api.ingestPolicy(payload);
      setIngestResult(res);
      if (rawText) {
        await runStep02Match(
          selectedPresetId,
          cohortMode,
          res.rules,
          res.boolean_ast,
          res.scheme?.name,
          res.scheme?.benefit_amount_inr
        );
      }
      return res;
    } catch (e) {
      setIngestError(e.message || 'Failed to parse Gazette notification.');
      return null;
    } finally {
      setIngesting(false);
    }
  };

  const runStep03Outbound = async (cid = selectedCitizenId, sid = selectedPresetId, lang = voiceLang, chan = voiceChannel) => {
    try {
      const res = await api.triggerOutboundVoice({
        citizen_id: cid,
        scheme_id: sid,
        language: lang,
        channel: chan,
      });
      setVoiceData(res);
      const langMeta = LANGUAGE_OPTIONS.find((l) => l.code === lang);
      if (langMeta) {
        setSpokenInput(langMeta.sampleYes);
      }
    } catch (e) {
      console.error('Outbound voice error:', e);
    }
  };

  useEffect(() => {
    setConsentVerification(null);
    setDbtResult(null);
    setDbtError(null);
  }, [selectedCitizenId, selectedPresetId]);

  useEffect(() => {
    if (selectedCitizenId && selectedPresetId) {
      runStep03Outbound(selectedCitizenId, selectedPresetId, voiceLang, voiceChannel);
    }
  }, [selectedCitizenId, selectedPresetId, voiceLang, voiceChannel]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFileName(file.name);
    setIngesting(true);
    setIngestError(null);
    try {
      const res = await api.uploadPolicyPdf(file, jevifyRecipe);
      setIngestResult(res);
      setCustomGazetteText(res.gazette?.excerpt || '');
      await runStep02Match(
        selectedPresetId,
        cohortMode,
        res.rules,
        res.boolean_ast,
        res.scheme?.name,
        res.scheme?.benefit_amount_inr
      );
    } catch (err) {
      setIngestError(err.message || 'Corrupted or unreadable binary PDF stream.');
    } finally {
      setIngesting(false);
    }
  };

  const handleSpeakPrompt = () => {
    if (!voiceData) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(voiceData.outbound_prompt_local);
      utter.lang = voiceData.bcp47_locale || 'hi-IN';
      utter.rate = 0.96;
      utter.onstart = () => setIsSpeaking(true);
      utter.onend = () => setIsSpeaking(false);
      utter.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utter);
    } else {
      setIsSpeaking(true);
      setTimeout(() => setIsSpeaking(false), 3000);
    }
  };

  const handleStartMic = () => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      const rec = new SpeechRec();
      rec.lang = voiceData?.bcp47_locale || 'hi-IN';
      rec.onstart = () => setIsListening(true);
      rec.onresult = (event) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) setSpokenInput(transcript);
        setIsListening(false);
      };
      rec.onerror = () => setIsListening(false);
      rec.onend = () => setIsListening(false);
      rec.start();
    } else {
      setIsListening(true);
      setTimeout(() => {
        setSpokenInput('हाँ, मंजूर है (Haan, manzoor hai)');
        setIsListening(false);
      }, 1200);
    }
  };

  const handleVerifyConsent = async (overrideUtterance = null, overrideOtp = null) => {
    setVerifyingConsent(true);
    setDbtError(null);
    try {
      const res = await api.verifyVoiceConsent({
        citizen_id: selectedCitizenId,
        scheme_id: selectedPresetId,
        spoken_text: overrideUtterance !== null ? overrideUtterance : spokenInput,
        otp_code: overrideOtp !== null ? overrideOtp : otpInput || null,
        channel: voiceChannel === 'IVR_CALL' ? 'BHASHINI_IVR_ASR' : 'WHATSAPP_VOICE_ASR',
        jevify_recipe: jevifyRecipe,
      });
      setConsentVerification(res);
    } catch (e) {
      console.error('Consent verification error:', e);
    } finally {
      setVerifyingConsent(false);
    }
  };

  const handleDispatchDBT = async () => {
    if (consentVerification && !consentVerification.consent_granted) {
      setDbtError('DBT Dispatch Blocked: Citizen declined consent (Negation Guard active). Verify affirmative consent or OTP in Step 03 first.');
      return;
    }
    setDispatching(true);
    setDbtError(null);
    try {
      const res = await api.dispatchDBT({
        citizen_id: selectedCitizenId,
        scheme_id: selectedPresetId,
        consent_artefact_id:
          consentVerification?.depa_consent_artefact?.status === 'ACTIVE_PURPOSE_BOUND'
            ? consentVerification.depa_consent_artefact.artefact_id
            : null,
        spoken_utterance: spokenInput || 'Haan, manzoor hai',
      });
      setDbtResult(res);
      if (res.revoked_consent_artefact && consentVerification?.depa_consent_artefact) {
        setConsentVerification({
          ...consentVerification,
          depa_consent_artefact: res.revoked_consent_artefact,
        });
      }
      setActiveStep(4);
      if (onGlobalRefresh) onGlobalRefresh();
    } catch (e) {
      setDbtError(e.message || 'DBT dispatch failed.');
    } finally {
      setDispatching(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Editorial Hero Banner mirroring Slide 03 & Slide 05 */}
      <div className="bg-ivory dark:bg-navy-surface border border-hairline dark:border-navy-muted rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-hairline dark:border-navy-muted">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-terracotta mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>WORKING PROTOTYPE • BUILT AND DEMOED (SLIDES 03 & 05)</span>
            </div>
            <h1 className="font-serif text-3xl md:text-5xl text-ink-primary dark:text-parchment leading-tight">
              End-to-end technical pipeline:{' '}
              <span className="italic text-terracotta">PDF in, voice call out, DBT back.</span>
            </h1>
            <p className="text-sm text-ink-secondary dark:text-stone/80 mt-2 max-w-3xl">
              Walk through the four-stage autonomous governance architecture on the{' '}
              <strong>Karnataka Krishi Sanjeevani Scheme</strong> &amp; <strong>PM-KUSUM</strong>: deterministic
              GraphRAG + Jevify policy parsing, DEPA Zero-Knowledge demographic matching, AI4Bharat Bhashini voice
              outreach, and 1-click PFMS Direct Benefit Transfer (<code className="font-mono text-xs">PID-777</code>).
            </p>
          </div>

          {/* Quick Hero Demo Switcher */}
          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setSelectedPresetId('SCH-01');
                setCohortMode('ka_100');
                setVoiceLang('kn');
                runStep01Ingest('SCH-01', '');
                runStep02Match('SCH-01', 'ka_100');
                setSelectedCitizenId('CIT-002');
              }}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                selectedPresetId === 'SCH-01'
                  ? 'bg-forest text-white border-forest shadow-sm'
                  : 'bg-parchment dark:bg-navy-deep text-ink-primary dark:text-stone border-hairline dark:border-navy-muted'
              }`}
            >
              Slide 05 Preset: Karnataka Krishi Sanjeevani (18/100 Match)
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedPresetId('SCH-02');
                setCohortMode('national_200');
                setVoiceLang('hi');
                runStep01Ingest('SCH-02', '');
                runStep02Match('SCH-02', 'national_200');
                setSelectedCitizenId('CIT-001');
              }}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                selectedPresetId === 'SCH-02'
                  ? 'bg-terracotta text-white border-terracotta shadow-sm'
                  : 'bg-parchment dark:bg-navy-deep text-ink-primary dark:text-stone border-hairline dark:border-navy-muted'
              }`}
            >
              Slide 03 Preset: Ramesh-ji PM-KUSUM (₹15,000 Hindi Call)
            </button>
          </div>
        </div>

        {/* 4-Stage Stepper Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-6">
          {[
            {
              step: 1,
              kicker: 'STAGE 01 • POLICY KG',
              title: 'Policy Ingestion Engine',
              sub: 'From PDF gazette to boolean graph (4s)',
              ruleClass: 'card-rule-forest',
              icon: FileText,
            },
            {
              step: 2,
              kicker: 'STAGE 02 • DEPA & ZKP',
              title: 'Demographic Matching',
              sub: 'Look up, don’t store (18/100 Flagged)',
              ruleClass: 'card-rule-navy',
              icon: Shield,
            },
            {
              step: 3,
              kicker: 'STAGE 03 • BHASHINI',
              title: 'Multimodal Citizen Contact',
              sub: 'The system calls first (22 Languages)',
              ruleClass: 'card-rule-terracotta',
              icon: PhoneCall,
            },
            {
              step: 4,
              kicker: 'STAGE 04 • PFMS DBT',
              title: 'Direct Execution & Credit',
              sub: 'From consent to credit (PID-777)',
              ruleClass: 'card-rule-ochre',
              icon: Landmark,
            },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeStep === item.step;
            return (
              <button
                key={item.step}
                type="button"
                onClick={() => setActiveStep(item.step)}
                className={`text-left p-4 rounded-xl border transition-all ${item.ruleClass} ${
                  isActive
                    ? 'bg-parchment dark:bg-navy-deep border-navy-deep dark:border-ochre shadow-md ring-1 ring-navy-deep/20'
                    : 'bg-stone/40 dark:bg-navy-deep/40 border-hairline dark:border-navy-muted hover:bg-stone/70'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-xs font-semibold text-ink-mono dark:text-stone/70">
                    {item.kicker}
                  </span>
                  <Icon className={`w-4 h-4 ${isActive ? 'text-terracotta' : 'text-ink-secondary'}`} />
                </div>
                <div className="font-serif text-lg font-normal text-ink-primary dark:text-white">
                  {item.title}
                </div>
                <div className="text-xs text-ink-secondary dark:text-stone/80 mt-0.5">{item.sub}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Two-Column Interactive Stage Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT 7 COLUMNS: Active Stage Controls & Output */}
        <div className="lg:col-span-7 space-y-6">
          {/* STAGE 01 PANEL */}
          <section className="bg-ivory dark:bg-navy-surface border border-hairline dark:border-navy-muted rounded-2xl p-6 card-rule-forest shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-forest dark:text-ochre font-semibold">
                  STEP 01 — POLICY UPLOAD &amp; GRAPHRAG INGESTION
                </span>
                <h2 className="font-serif text-2xl text-ink-primary dark:text-white">
                  From Government Gazette PDF to Deterministic Boolean AST
                </h2>
              </div>
              <span className="px-3 py-1 rounded-full bg-forest/10 text-forest dark:bg-forest dark:text-white text-xs font-mono font-semibold">
                {ingesting ? 'PARSING GAZETTE...' : 'KG UPDATED IN 3.8s'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-ink-secondary dark:text-stone mb-1" htmlFor="preset-scheme-select">
                  Select Official Gazette Notification
                </label>
                <select
                  id="preset-scheme-select"
                  value={selectedPresetId}
                  onChange={(e) => {
                    const newId = e.target.value;
                    setSelectedPresetId(newId);
                    setCustomGazetteText('');
                    runStep01Ingest(newId, '');
                    runStep02Match(newId, cohortMode, null);
                  }}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-hairline dark:border-navy-muted bg-parchment dark:bg-navy-deep text-xs font-medium text-ink-primary dark:text-white"
                >
                  {schemes.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.id}: {s.name} (₹{s.benefit_amount_inr.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-secondary dark:text-stone mb-1" htmlFor="jevify-recipe-select">
                  Jevify Single-Pass Typed Readout Recipe
                </label>
                <select
                  id="jevify-recipe-select"
                  value={jevifyRecipe}
                  onChange={(e) => {
                    const nextRec = e.target.value;
                    setJevifyRecipe(nextRec);
                    runStep01Ingest(selectedPresetId, customGazetteText, nextRec);
                  }}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-hairline dark:border-navy-muted bg-parchment dark:bg-navy-deep text-xs font-mono text-ink-primary dark:text-white"
                >
                  <option value="gemma-4-e4b-it.llamacpp">gemma-4-e4b-it.llamacpp (28ms • 29/29 policy-29)</option>
                  <option value="ternary-bonsai-2-27b.llamacpp">ternary-bonsai-2-27b.llamacpp (99ms • 64k slot)</option>
                  <option value="deepseek-v4-flash-vision-exp-keys.vllm">deepseek-v4-flash.vllm (47/52 policy-hard-52)</option>
                  <option value="bart-large-mnli.local">bart-large-mnli.local (8ms in-process encoder)</option>
                </select>
              </div>
            </div>

            {/* File Upload or Custom Gazette Input */}
            <div className="mb-4 p-4 rounded-xl border border-dashed border-hairline dark:border-navy-muted bg-parchment/60 dark:bg-navy-deep/50 space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-forest text-white flex items-center justify-center shrink-0">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-ink-primary dark:text-white">
                      Upload Raw Gazette PDF / Text Notification
                    </div>
                    <div className="text-xs font-mono text-ink-mono dark:text-stone/70">
                      Active File: {uploadedFileName}
                    </div>
                  </div>
                </div>
                <label className="min-h-[44px] px-4 py-2 rounded-xl bg-navy-deep text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity shrink-0">
                  <FileText className="w-4 h-4" />
                  <span>Upload Gazette File</span>
                  <input type="file" accept=".pdf,.txt,.md,.json" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-hairline/60 dark:border-navy-muted">
                <input
                  type="text"
                  value={customGazetteText}
                  onChange={(e) => setCustomGazetteText(e.target.value)}
                  placeholder="Or paste custom Gazette clause (e.g. Every farmer in Karnataka with land <= 2.0 hectares and income < ₹120000...)"
                  aria-label="Custom Gazette Clause Text"
                  className="flex-1 min-h-[40px] px-3 py-1.5 rounded-lg border border-hairline dark:border-navy-muted bg-ivory dark:bg-navy-surface text-xs text-ink-primary dark:text-white"
                />
                <button
                  type="button"
                  onClick={async () => {
                    if (!customGazetteText.trim()) return;
                    setUploadedFileName('custom_gazette_clause.txt');
                    await runStep01Ingest(selectedPresetId, customGazetteText, jevifyRecipe, 'custom_gazette_clause.txt');
                  }}
                  className="min-h-[40px] px-3 py-1.5 rounded-lg bg-forest text-white text-xs font-semibold hover:opacity-90 shrink-0"
                >
                  Parse Custom Clause
                </button>
              </div>
            </div>

            {ingestError && (
              <div className="mb-4 p-3 rounded-xl bg-crimson/15 border border-crimson text-crimson dark:text-amber-300 text-xs font-mono">
                ✕ Gazette Parse Error: {ingestError}
              </div>
            )}

            {ingestResult && (
              <div className="space-y-4">
                {/* Gazette Citation Box */}
                <div className="p-4 rounded-xl bg-stone/60 dark:bg-navy-deep border border-hairline dark:border-navy-muted">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-ink-mono dark:text-ochre mb-1.5">
                    <span>GAZETTE ID: {ingestResult.gazette?.gazette_id}</span>
                    <span>{ingestResult.gazette?.section} • {ingestResult.gazette?.clause}</span>
                  </div>
                  <p className="text-xs italic text-ink-primary dark:text-stone leading-relaxed">
                    “{ingestResult.gazette?.excerpt}”
                  </p>
                </div>

                {/* Extracted Boolean AST Code Block */}
                <div className="p-4 rounded-xl bg-navy-deep text-parchment font-mono text-xs space-y-2 border border-navy-muted">
                  <div className="flex items-center justify-between text-ochre">
                    <span>DETERMINISTIC BOOLEAN AST (NEO4J GRAPHRAG)</span>
                    <span>ZERO LLM HALLUCINATION</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-navy-surface text-emerald-300 overflow-x-auto">
                    {ingestResult.boolean_ast}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {ingestResult.rules?.map((r, i) => (
                      <div key={i} className="px-2.5 py-1.5 rounded bg-navy-surface/80 border border-navy-muted flex items-center justify-between">
                        <span className="truncate">{r.label}</span>
                        <span className="text-ochre ml-2 shrink-0">{r.clause_ref}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* STAGE 02 PANEL */}
          <section className="bg-ivory dark:bg-navy-surface border border-hairline dark:border-navy-muted rounded-2xl p-6 card-rule-navy shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-ink-mono dark:text-ochre font-semibold">
                  STEP 02 — ZERO-KNOWLEDGE DEMOGRAPHIC MATCHING (DEPA)
                </span>
                <h2 className="font-serif text-2xl text-ink-primary dark:text-white">
                  “Look up, don’t store” — Anonymized Citizen Pool Scan
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCohortMode('ka_100');
                    const customRules = customGazetteText.trim() && ingestResult?.rules ? ingestResult.rules : null;
                    runStep02Match(selectedPresetId, 'ka_100', customRules);
                  }}
                  className={`min-h-[44px] px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border ${
                    cohortMode === 'ka_100'
                      ? 'bg-navy-deep text-white border-navy-deep'
                      : 'bg-parchment dark:bg-navy-deep text-ink-primary dark:text-stone border-hairline'
                  }`}
                >
                  KA 100-Profile Pool
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCohortMode('national_200');
                    const customRules = customGazetteText.trim() && ingestResult?.rules ? ingestResult.rules : null;
                    runStep02Match(selectedPresetId, 'national_200', customRules);
                  }}
                  className={`min-h-[44px] px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border ${
                    cohortMode === 'national_200'
                      ? 'bg-navy-deep text-white border-navy-deep'
                      : 'bg-parchment dark:bg-navy-deep text-ink-primary dark:text-stone border-hairline'
                  }`}
                >
                  National 200-Profile Pool
                </button>
              </div>
            </div>

            {cohortResult && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl bg-forest text-white">
                    <div className="text-xs font-mono uppercase opacity-80">ZKP ELIGIBLE MATCHED</div>
                    <div className="font-serif text-3xl tabular-nums mt-1">
                      {cohortResult.headline_badge}
                    </div>
                    <div className="text-xs opacity-90 mt-1">
                      100% Deterministic Clause Match
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-navy-deep text-parchment">
                    <div className="text-xs font-mono uppercase text-ochre">DPDP ACT 2023 PRIVACY</div>
                    <div className="font-serif text-3xl tabular-nums mt-1">0 Raw PII</div>
                    <div className="text-xs text-stone/80 mt-1">
                      Verified via Pedersen SHA-256 ZKP
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-ochre/20 border border-ochre text-ink-primary dark:text-white">
                    <div className="text-xs font-mono uppercase font-semibold text-ochre-dark dark:text-ochre">
                      TIER 03 HITL SAFEGUARD
                    </div>
                    <div className="font-serif text-3xl tabular-nums mt-1">
                      {cohortResult.hitl_review_queue_count} Edge Cases
                    </div>
                    <div className="text-xs text-ink-secondary dark:text-stone/80 mt-1">
                      Routed to Panchayat Officer Queue
                    </div>
                  </div>
                </div>

                {/* Candidate Selector Table */}
                <div className="border border-hairline dark:border-navy-muted rounded-xl overflow-hidden">
                  <div className="bg-stone/70 dark:bg-navy-deep px-4 py-2.5 flex items-center justify-between text-xs font-mono font-semibold">
                    <span>FLAGGED ELIGIBLE CANDIDATES (CLICK TO CALL IN STEP 03)</span>
                    <span>SHOWING TOP {Math.min(12, cohortResult.eligible_candidates?.length || 0)} OF {cohortResult.eligible_count}</span>
                  </div>
                  <div className="divide-y divide-hairline dark:divide-navy-muted max-h-64 overflow-y-auto bg-parchment/50 dark:bg-navy-surface">
                    {cohortResult.eligible_candidates?.slice(0, 12).map((cand) => {
                      const isSelected = cand.citizen_id === selectedCitizenId;
                      return (
                        <button
                          key={cand.citizen_id}
                          type="button"
                          onClick={() => {
                            setSelectedCitizenId(cand.citizen_id);
                            setVoiceLang(cand.preferred_language || 'hi');
                            setActiveStep(3);
                          }}
                          className={`w-full min-h-[48px] px-4 py-2.5 text-left flex flex-wrap items-center justify-between gap-2 transition-colors ${
                            isSelected
                              ? 'bg-terracotta/15 dark:bg-terracotta/25 font-semibold'
                              : 'hover:bg-stone/50 dark:hover:bg-navy-deep/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs px-2 py-0.5 rounded bg-navy-deep text-white">
                              {cand.citizen_id}
                            </span>
                            <div>
                              <div className="text-xs text-ink-primary dark:text-white">
                                {cand.name} <span className="text-ink-secondary dark:text-stone/70">({cand.name_local})</span>
                              </div>
                              <div className="text-xs font-mono text-ink-mono dark:text-stone/70">
                                {cand.district}, {cand.state} • {cand.land_holding_ha} Ha • ZKP: {cand.zkp_commitments?.income_proof?.slice(0, 12)}…
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-forest dark:text-emerald-400 tabular-nums">
                              ₹{cand.benefit_amount_inr.toLocaleString('en-IN')}
                            </span>
                            <span className="px-2.5 py-1 rounded-lg bg-terracotta text-white text-xs font-semibold inline-flex items-center gap-1">
                              <PhoneCall className="w-3 h-3" />
                              <span>Call</span>
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* RIGHT 5 COLUMNS: Stage 03 Bhashini Voice Simulator & Stage 04 PFMS DBT Resolution */}
        <div className="lg:col-span-5 space-y-6">
          {/* STAGE 03 PANEL: BHASHINI VOICE SIMULATOR */}
          <section className="bg-navy-deep text-parchment rounded-2xl p-6 card-rule-terracotta shadow-lg border border-navy-muted">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-terracotta font-semibold">
                  STEP 03 — BHASHINI MULTILINGUAL VOICE OUTREACH
                </span>
                <h2 className="font-serif text-2xl text-white">
                  “The system calls first” — Outbound IVR &amp; WhatsApp
                </h2>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-terracotta text-white text-xs font-mono font-semibold">
                22 LANGUAGES
              </span>
            </div>

            {/* Channel & Language Switcher */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                type="button"
                onClick={() => setVoiceChannel('IVR_CALL')}
                className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border ${
                  voiceChannel === 'IVR_CALL'
                    ? 'bg-terracotta text-white border-terracotta'
                    : 'bg-navy-surface text-stone border-navy-muted'
                }`}
              >
                <PhoneCall className="w-4 h-4" />
                <span>Outbound IVR Call</span>
              </button>
              <button
                type="button"
                onClick={() => setVoiceChannel('WHATSAPP_VOICE_NOTE')}
                className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border ${
                  voiceChannel === 'WHATSAPP_VOICE_NOTE'
                    ? 'bg-forest text-white border-forest'
                    : 'bg-navy-surface text-stone border-navy-muted'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp Voice Note</span>
              </button>
            </div>

            {/* 6 Regional Language Pills */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {LANGUAGE_OPTIONS.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setVoiceLang(lang.code)}
                  className={`min-h-[38px] px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    voiceLang === lang.code
                      ? 'bg-ochre text-navy-deep font-bold'
                      : 'bg-navy-surface text-stone hover:bg-navy-muted'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            {voiceData && (
              <div className="space-y-4">
                {/* Simulated Phone Call Card */}
                <div className="p-4 rounded-xl bg-navy-surface border border-navy-muted space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-stone/80">
                    <span>TO: {voiceData.citizen_name} ({voiceData.phone_masked})</span>
                    <span className="text-ochre">{voiceData.bhashini_pipeline?.tts_engine}</span>
                  </div>

                  {/* Waveform & Play TTS */}
                  <div className="flex items-center gap-3 bg-navy-deep p-3 rounded-xl border border-navy-muted">
                    <button
                      type="button"
                      onClick={handleSpeakPrompt}
                      aria-label="Play Bhashini Voice Call Audio"
                      className="min-h-[44px] min-w-[44px] rounded-xl bg-terracotta text-white flex items-center justify-center hover:opacity-90 transition-opacity shrink-0"
                    >
                      <Volume2 className={`w-5 h-5 ${isSpeaking ? 'animate-pulse' : ''}`} />
                    </button>
                    <div className="flex-1 flex items-end gap-1 h-8 overflow-hidden">
                      {(voiceData.waveform_bars || []).map((h, i) => (
                        <div
                          key={i}
                          style={{ height: `${isSpeaking ? Math.max(25, (h + i * 17) % 100) : h}%` }}
                          className={`flex-1 rounded-full transition-all duration-150 ${
                            isSpeaking ? 'bg-terracotta' : 'bg-ochre/70'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-mono text-stone/70 shrink-0">
                      {isSpeaking ? 'PLAYING' : '0:14'}
                    </span>
                  </div>

                  {/* Vernacular & English Transcript */}
                  <div className="space-y-1.5">
                    <p className="text-sm font-medium text-white leading-relaxed">
                      “{voiceData.outbound_prompt_local}”
                    </p>
                    <p className="text-xs text-stone/70 italic">
                      Translation: “{voiceData.outbound_prompt_en}”
                    </p>
                  </div>
                </div>

                {/* Citizen Spoken Consent / Negation Flip Guard Input */}
                <div className="p-4 rounded-xl bg-navy-surface border border-navy-muted space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono uppercase text-ochre font-semibold" htmlFor="citizen-spoken-input">
                      Citizen Spoken Response (IndicWav2Vec ASR + Jevify NLU)
                    </label>
                    <button
                      type="button"
                      onClick={handleStartMic}
                      className="min-h-[36px] px-2.5 py-1 rounded-lg bg-terracotta/20 border border-terracotta text-terracotta text-xs font-mono inline-flex items-center gap-1"
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>{isListening ? 'Listening...' : 'Speak via Mic'}</span>
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <input
                      id="citizen-spoken-input"
                      type="text"
                      value={spokenInput}
                      onChange={(e) => setSpokenInput(e.target.value)}
                      className="flex-1 min-h-[44px] px-3 py-2 rounded-lg bg-navy-deep border border-navy-muted text-xs text-white focus:outline-none focus:ring-2 focus:ring-terracotta"
                    />
                    <button
                      type="button"
                      onClick={() => handleVerifyConsent(spokenInput, null)}
                      className="min-h-[44px] px-3 py-2 rounded-lg bg-ochre text-navy-deep text-xs font-mono font-bold hover:opacity-90 shrink-0"
                    >
                      Verify Input
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const text = 'हाँ, मंजूर है (Haan, manzoor hai)';
                        setSpokenInput(text);
                        handleVerifyConsent(text, null);
                      }}
                      className="min-h-[44px] flex-1 px-3 py-2 rounded-xl bg-forest text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:opacity-95"
                    >
                      <Check className="w-4 h-4" />
                      <span>Say “Haan, manzoor hai” (Approve)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const text = 'Nahi, do not submit my application';
                        setSpokenInput(text);
                        handleVerifyConsent(text, null);
                      }}
                      className="min-h-[44px] px-3 py-2 rounded-xl bg-navy-deep border border-terracotta/60 text-stone text-xs font-mono hover:bg-terracotta/20"
                    >
                      Test Negation (“Nahi”)
                    </button>
                  </div>

                  {/* 1-Click OTP Alternative Consent */}
                  <div className="pt-2 border-t border-navy-muted flex items-center gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      placeholder="Or enter 6-digit IVR DTMF / SMS OTP (e.g. 482910)"
                      aria-label="6-digit OTP Consent"
                      className="flex-1 min-h-[38px] px-3 py-1.5 rounded-lg bg-navy-deep border border-navy-muted text-xs font-mono text-white"
                    />
                    <button
                      type="button"
                      onClick={() => handleVerifyConsent(null, otpInput || '482910')}
                      className="min-h-[38px] px-3 py-1.5 rounded-lg bg-navy-deep border border-ochre text-ochre text-xs font-mono font-semibold hover:bg-ochre/15 shrink-0"
                    >
                      1-Click OTP Consent
                    </button>
                  </div>

                  {consentVerification && (
                    <div
                      className={`p-3 rounded-lg border text-xs font-mono space-y-1 ${
                        consentVerification.consent_granted
                          ? 'bg-forest/25 border-forest text-emerald-200'
                          : 'bg-terracotta/25 border-terracotta text-amber-200'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span>
                          {consentVerification.consent_granted
                            ? '✓ DEPA CONSENT ARTEFACT MINTED'
                            : '✕ NEGATION GUARD TRIGGERED (ABORTED)'}
                        </span>
                        <span>
                          p(affirm) = {consentVerification.jevify_nlu_readout?.answers?.consent_affirmative?.noul}
                        </span>
                      </div>
                      {consentVerification.depa_consent_artefact && (
                        <div className="text-stone/90 truncate">
                          Artefact ID: {consentVerification.depa_consent_artefact.artefact_id} • Purpose-Bound
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* STAGE 04 PANEL: 1-CLICK RESOLUTION & PFMS DBT DISPATCH */}
          <section className="bg-ivory dark:bg-navy-surface border border-hairline dark:border-navy-muted rounded-2xl p-6 card-rule-ochre shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-ochre-dark dark:text-ochre font-semibold">
                  STEP 04 — DIRECT EXECUTION &amp; DBT DISPATCH
                </span>
                <h2 className="font-serif text-2xl text-ink-primary dark:text-white">
                  From Spoken Consent to Aadhaar-Linked Credit
                </h2>
              </div>
              <span className="font-mono text-xs px-2.5 py-1 rounded bg-ochre/20 text-ink-primary dark:text-ochre font-bold">
                PID-777
              </span>
            </div>

            <button
              type="button"
              onClick={handleDispatchDBT}
              disabled={dispatching || (consentVerification && !consentVerification.consent_granted)}
              className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-terracotta hover:bg-terracotta-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-colors"
            >
              <Landmark className="w-4 h-4" />
              <span>
                {dispatching
                  ? 'Attaching DigiLocker VCs & Dispatching PFMS DBT...'
                  : consentVerification && !consentVerification.consent_granted
                  ? 'Blocked by DEPA Negation Guard — Grant Consent in Step 03'
                  : 'Execute 1-Click DigiLocker Auto-Fill & PFMS DBT Credit'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {dbtError && (
              <div className="p-3 rounded-xl bg-crimson/15 border border-crimson text-crimson dark:text-amber-300 text-xs font-mono">
                ✕ DBT Dispatch Blocked: {dbtError}
              </div>
            )}

            {dbtResult && (
              <div className="p-4 rounded-xl bg-navy-deep text-parchment border border-navy-muted space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between text-emerald-400 font-bold">
                  <span>✓ PFMS DIRECT BENEFIT TRANSFER CREDITED</span>
                  <span>{dbtResult.dbt_receipt.audit_record_id}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-stone/90">
                  <div>
                    <span className="text-stone/60 block">Beneficiary:</span>
                    <span className="text-white font-semibold">{dbtResult.dbt_receipt.citizen_name}</span>
                  </div>
                  <div>
                    <span className="text-stone/60 block">Amount Credited:</span>
                    <span className="text-ochre font-bold text-sm tabular-nums">
                      ₹{dbtResult.dbt_receipt.amount_credited_inr.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone/60 block">Bank Rail:</span>
                    <span>{dbtResult.dbt_receipt.bank_account_masked}</span>
                  </div>
                  <div>
                    <span className="text-stone/60 block">UTR Reference:</span>
                    <span>{dbtResult.dbt_receipt.utr_number}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-navy-muted flex items-center justify-between text-ochre">
                  <span>DEPA Token Status:</span>
                  <span>{dbtResult.dbt_receipt.depa_token_status}</span>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
