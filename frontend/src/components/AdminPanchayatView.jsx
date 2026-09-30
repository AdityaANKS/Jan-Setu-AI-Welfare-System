import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  ShieldAlert,
  CheckCircle2,
  Clock,
  MapPin,
  FileCheck,
  Languages,
  ArrowUpRight,
  Users,
  Landmark,
} from 'lucide-react';
import { api } from '../api';

const I18N = {
  en: {
    kicker: 'MODULE 04 — BILINGUAL PANCHAYAT & DISTRICT MONITORING DASHBOARD',
    title: 'Proactive Governance Velocity & Tier 03 Exclusion Safeguards',
    subtitle: '“The algorithm proposes; the state disposes — under a paper trail.” (DPDP Act 2023 & Slide 04)',
    heatmapTitle: 'District & Gram Panchayat Coverage Saturation Heatmap',
    funnelTitle: 'Proactive Entitlement Delivery Funnel (200-Citizen Cohort)',
    hitlTitle: 'Tier 03 Exclusion Safeguard — Human-in-the-Loop (HITL) Review Queue',
    approveBtn: 'Approve Override (Paper Trail)',
    deferBtn: 'Defer for Field Verification',
  },
  hi: {
    kicker: 'मॉड्यूल 04 — द्विभाषी पंचायत एवं जिला निगरानी डैशबोर्ड',
    title: 'सक्रिय कल्याण वितरण गति और टियर-03 बहिष्करण सुरक्षा',
    subtitle: '“एल्गोरिदम प्रस्तावित करता है; पंचायत अधिकारी कागजी रिकॉर्ड के साथ निर्णय लेता है।”',
    heatmapTitle: 'जिला और ग्राम पंचायत कवरेज हीटमैप',
    funnelTitle: 'सक्रिय पात्रता वितरण फ़नल (200-नागरिक समूह)',
    hitlTitle: 'टियर 03 बहिष्करण सुरक्षा — पंचायत अधिकारी समीक्षा कतार (HITL)',
    approveBtn: 'ओवरराइड स्वीकृत करें (कागजी प्रमाण)',
    deferBtn: 'भौतिक सत्यापन हेतु स्थगित करें',
  },
  kn: {
    kicker: 'ಮಾಡ್ಯೂಲ್ 04 — ದ್ವಿಭಾಷಾ ಪಂಚಾಯತ್ ಮತ್ತು ಜಿಲ್ಲಾ ಮೇಲ್ವಿಚಾರಣಾ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    title: 'ಸಕ್ರಿಯ ಕಲ್ಯಾಣ ವಿತರಣಾ ವೇಗ ಮತ್ತು ಟೈರ್-03 ಹೊರಗಿಡುವಿಕೆ ಸುರಕ್ಷತೆ',
    subtitle: '“ಅಲ್ಗಾರಿದಮ್ ಪ್ರಸ್ತಾಪಿಸುತ್ತದೆ; ಪಂಚಾಯತ್ ಅಧಿಕಾರಿ ದಾಖಲೆಯೊಂದಿಗೆ ನಿರ್ಧರಿಸುತ್ತಾರೆ.”',
    heatmapTitle: 'ಜಿಲ್ಲಾ ಮತ್ತು ಗ್ರಾಮ ಪಂಚಾಯತ್ ವ್ಯಾಪ್ತಿ ಹೀಟ್‌ಮ್ಯಾಪ್',
    funnelTitle: 'ಸಕ್ರಿಯ ಅರ್ಹತಾ ವಿತರಣಾ ಫನೆಲ್ (200 ನಾಗರಿಕರ ಗುಂಪು)',
    hitlTitle: 'ಟೈರ್ 03 ಹೊರಗಿಡುವಿಕೆ ಸುರಕ್ಷತೆ — ಪಂಚಾಯತ್ ಅಧಿಕಾರಿ ಪರಿಶೀಲನಾ ಪಟ್ಟಿ (HITL)',
    approveBtn: 'ಮೇಲ್ಮನವಿ ಅನುಮೋದಿಸಿ (ದಾಖಲೆ ಸಹಿತ)',
    deferBtn: 'ಕ್ಷೇತ್ರ ಪರಿಶೀಲನೆಗೆ ಮುಂದೂಡಿ',
  },
};

export default function AdminPanchayatView({ analytics, onRefresh }) {
  const [uiLang, setUiLang] = useState('en');
  const [officerName, setOfficerName] = useState('Prakash Nadagouda (PDO, Gram Panchayat)');
  const [processingCaseId, setProcessingCaseId] = useState(null);

  useEffect(() => {
    if (!analytics && onRefresh) {
      onRefresh();
    }
  }, [analytics]);

  const t = I18N[uiLang] || I18N.en;

  const handleHITLDecision = async (item, decision) => {
    setProcessingCaseId(item.case_id);
    try {
      await api.submitHITLReview({
        citizen_id: item.citizen_id,
        scheme_id: item.target_scheme_id,
        decision,
        officer_name: officerName,
        officer_notes:
          decision === 'APPROVED_OVERRIDE'
            ? `Verified supporting DigiLocker records (${item.discrepancy_type}); citizen satisfies statutory intent.`
            : `Assigned Village Accountant field inspection for ${item.discrepancy_type}.`,
      });
      if (onRefresh) await onRefresh();
    } catch (e) {
      console.error('HITL review error:', e);
    } finally {
      setProcessingCaseId(null);
    }
  };

  if (!analytics) {
    return (
      <div className="p-8 rounded-2xl bg-ivory dark:bg-navy-surface border border-hairline text-center text-sm">
        Loading Panchayat Monitoring Telemetry...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Bilingual / Trilingual Switcher */}
      <div className="bg-ivory dark:bg-navy-surface border border-hairline dark:border-navy-muted rounded-2xl p-6 md:p-8 card-rule-navy shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-terracotta font-semibold">
              {t.kicker}
            </span>
            <h1 className="font-serif text-3xl md:text-4xl text-ink-primary dark:text-parchment mt-1">
              {t.title}
            </h1>
            <p className="text-sm text-ink-secondary dark:text-stone/80 mt-1">{t.subtitle}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Languages className="w-4 h-4 text-terracotta" />
            {[
              { code: 'en', label: 'English' },
              { code: 'hi', label: 'हिंदी (Hindi)' },
              { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
            ].map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => setUiLang(l.code)}
                className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                  uiLang === l.code
                    ? 'bg-navy-deep text-white border-navy-deep'
                    : 'bg-parchment dark:bg-navy-deep text-ink-primary dark:text-stone border-hairline'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Slide 06 Macro Velocity KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-hairline dark:border-navy-muted">
          <div className="p-4 rounded-xl bg-terracotta text-white">
            <div className="text-xs font-mono uppercase opacity-85">PROCESSING TIME</div>
            <div className="font-serif text-3xl md:text-4xl tabular-nums mt-1">
              {analytics.macro_impact_metrics?.processing_time_reduction}
            </div>
            <div className="text-xs opacity-90 mt-1">
              End-to-end cycle from eligibility flag to DBT trigger
            </div>
          </div>

          <div className="p-4 rounded-xl bg-navy-deep text-parchment">
            <div className="text-xs font-mono uppercase text-ochre">INTERMEDIARY LEAKAGE</div>
            <div className="font-serif text-3xl md:text-4xl tabular-nums mt-1">
              {analytics.macro_impact_metrics?.intermediary_leakage}
            </div>
            <div className="text-xs text-stone/80 mt-1">
              Direct citizen-to-state channel via Bhashini + PFMS
            </div>
          </div>

          <div className="p-4 rounded-xl bg-ochre text-navy-deep">
            <div className="text-xs font-mono uppercase font-bold">COVERAGE EXPANSION</div>
            <div className="font-serif text-3xl md:text-4xl font-bold tabular-nums mt-1">
              {analytics.macro_impact_metrics?.coverage_expansion_gain}
            </div>
            <div className="text-xs font-medium mt-1">
              Projected uptake gain in low-literacy rural cohorts
            </div>
          </div>

          <div className="p-4 rounded-xl bg-forest text-white">
            <div className="text-xs font-mono uppercase opacity-85">INDIA BUDGET POOL</div>
            <div className="font-serif text-3xl md:text-4xl tabular-nums mt-1">
              {analytics.macro_impact_metrics?.annual_budget_pool_inr}
            </div>
            <div className="text-xs opacity-90 mt-1">
              Across 1,200+ Central &amp; State welfare schemes
            </div>
          </div>
        </div>
      </div>

      {/* Heatmap & Inclusion Funnel Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* District Coverage Heatmap (7 cols) */}
        <div className="lg:col-span-7 bg-ivory dark:bg-navy-surface border border-hairline dark:border-navy-muted rounded-2xl p-6 card-rule-forest shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl text-ink-primary dark:text-white">{t.heatmapTitle}</h2>
            <span className="text-xs font-mono text-forest dark:text-ochre font-semibold">
              REAL-TIME SATURATION
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
            {analytics.district_heatmap?.map((d) => (
              <div
                key={d.district}
                className="p-3.5 rounded-xl bg-parchment dark:bg-navy-deep border border-hairline dark:border-navy-muted space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-ink-primary dark:text-white">
                      {d.district} <span className="font-mono text-ink-mono dark:text-ochre">({d.state})</span>
                    </div>
                    <div className="text-xs text-ink-secondary dark:text-stone/70 truncate">
                      {d.panchayat}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-forest/15 text-forest dark:text-emerald-300 font-mono text-xs font-bold tabular-nums">
                    {d.coverage_saturation_pct}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 rounded-full bg-stone dark:bg-navy-surface overflow-hidden">
                  <div
                    className="h-full bg-forest dark:bg-emerald-400 rounded-full"
                    style={{ width: `${Math.min(100, d.coverage_saturation_pct)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-ink-mono dark:text-stone/80 tabular-nums">
                  <span>{d.eligible_citizens}/{d.total_citizens} Citizens</span>
                  <span>Voice: {d.voice_outreach_completion_pct}%</span>
                  <span className="text-terracotta font-semibold">
                    ₹{(d.total_benefit_unlocked_inr / 1000).toFixed(0)}k
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inclusion / Exclusion Funnel & Recent DBT Ledger (5 cols) */}
        <div className="lg:col-span-5 bg-ivory dark:bg-navy-surface border border-hairline dark:border-navy-muted rounded-2xl p-6 card-rule-terracotta shadow-sm space-y-5">
          <h2 className="font-serif text-2xl text-ink-primary dark:text-white">{t.funnelTitle}</h2>

          <div className="space-y-3">
            {analytics.inclusion_funnel?.map((f, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-semibold text-ink-primary dark:text-white">{f.stage}</span>
                  <span className="tabular-nums font-bold text-terracotta">
                    {f.count} ({f.pct}%)
                  </span>
                </div>
                <div className="w-full h-3 rounded-lg bg-stone dark:bg-navy-deep overflow-hidden">
                  <div
                    className="h-full rounded-lg transition-all duration-300"
                    style={{ width: `${f.pct}%`, backgroundColor: f.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Recent PID-777 DBT Audit Ledger */}
          <div className="pt-4 border-t border-hairline dark:border-navy-muted space-y-2">
            <div className="text-xs font-mono uppercase text-ink-mono dark:text-ochre font-semibold">
              RECENT PFMS DBT AUDIT TRAIL (PID-777)
            </div>
            <div className="space-y-2 max-h-44 overflow-y-auto">
              {analytics.recent_dbt_ledger?.slice(0, 5).map((tx, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-navy-deep text-parchment font-mono text-xs flex items-center justify-between"
                >
                  <div className="truncate pr-2">
                    <span className="text-ochre font-bold">{tx.audit_record_id}</span> • {tx.citizen_name}
                  </div>
                  <span className="text-emerald-400 font-bold shrink-0 tabular-nums">
                    ₹{tx.amount_credited_inr.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tier 03 Exclusion Safeguard — Human-in-the-Loop (HITL) Review Queue */}
      <section className="bg-ivory dark:bg-navy-surface border border-hairline dark:border-navy-muted rounded-2xl p-6 md:p-8 card-rule-ochre shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase text-ochre-dark dark:text-ochre font-bold">
              <ShieldAlert className="w-4 h-4" />
              <span>SLIDE 04 TRUST FRAMEWORK • TIER 03 EXCLUSION SAFEGUARD</span>
            </div>
            <h2 className="font-serif text-2xl md:text-3xl text-ink-primary dark:text-white mt-1">
              {t.hitlTitle}
            </h2>
            <p className="text-xs text-ink-secondary dark:text-stone/80 mt-1">
              Algorithmic non-eligibility flags on borderline cases are never silently rejected. Local Panchayat Development Officers (PDOs) inspect DigiLocker evidence and record an auditable decision.
            </p>
          </div>

          <div className="w-full md:w-72">
            <label className="block text-xs font-mono text-ink-mono dark:text-stone mb-1" htmlFor="pdo-officer-input">
              Reviewing Panchayat Officer Signature
            </label>
            <input
              id="pdo-officer-input"
              type="text"
              value={officerName}
              onChange={(e) => setOfficerName(e.target.value)}
              className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-hairline dark:border-navy-muted bg-parchment dark:bg-navy-deep text-xs font-mono text-ink-primary dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analytics.tier_03_hitl_queue?.map((item) => {
            const isApproved = item.status === 'APPROVED_OVERRIDE';
            const isDeferred = item.status === 'DEFERRED_FIELD_VERIFICATION';
            return (
              <div
                key={item.case_id}
                className="p-5 rounded-xl bg-parchment dark:bg-navy-deep border border-hairline dark:border-navy-muted flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-navy-deep text-ochre font-bold">
                      {item.case_id} • {item.citizen_id}
                    </span>
                    <span
                      className={`font-mono text-xs px-2.5 py-0.5 rounded font-bold ${
                        isApproved
                          ? 'bg-forest text-white'
                          : isDeferred
                          ? 'bg-ochre text-navy-deep'
                          : 'bg-terracotta text-white'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-serif text-xl text-ink-primary dark:text-white">
                      {item.citizen_name} <span className="text-sm text-ink-secondary">({item.citizen_name_local})</span>
                    </h3>
                    <div className="text-xs font-mono text-ink-mono dark:text-stone/70">
                      {item.panchayat}, {item.district} • Land: {item.land_holding_ha} Ha • Income: ₹{item.annual_income_inr.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-ivory dark:bg-navy-surface border border-hairline dark:border-navy-muted text-xs space-y-1">
                    <div className="font-mono text-terracotta font-semibold">
                      Flagged Clause: {item.failed_clause}
                    </div>
                    <div className="font-semibold text-ink-primary dark:text-white">
                      {item.discrepancy_type}
                    </div>
                    <p className="text-ink-secondary dark:text-stone/80 leading-relaxed">
                      {item.explanation}
                    </p>
                    <div className="pt-1 flex items-center justify-between font-mono text-ink-mono dark:text-ochre">
                      <span>Jevify Urgency: {item.jevify_urgency_score.toUpperCase()}</span>
                      <span>Confidence: {Math.round(item.jevify_confidence * 100)}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <button
                    type="button"
                    disabled={processingCaseId === item.case_id}
                    onClick={() => handleHITLDecision(item, 'APPROVED_OVERRIDE')}
                    className="min-h-[44px] flex-1 px-3 py-2 rounded-xl bg-forest hover:bg-forest-dark text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t.approveBtn}</span>
                  </button>
                  <button
                    type="button"
                    disabled={processingCaseId === item.case_id}
                    onClick={() => handleHITLDecision(item, 'DEFERRED_FIELD_VERIFICATION')}
                    className="min-h-[44px] px-3 py-2 rounded-xl border border-hairline dark:border-navy-muted bg-ivory dark:bg-navy-surface text-ink-primary dark:text-stone text-xs font-semibold"
                  >
                    {t.deferBtn}
                  </button>
                </div>

                {item.resolution_audit && (
                  <div className="p-2.5 rounded bg-forest/15 border border-forest/40 text-xs font-mono text-forest dark:text-emerald-300">
                    Paper Trail Hash: {item.resolution_audit.paper_trail_signature} • Signed by {item.resolution_audit.officer_name}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
