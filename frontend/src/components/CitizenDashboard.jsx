import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Search,
  ShieldCheck,
  Landmark,
  Volume2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  FileBadge,
  Lock,
  Sparkles,
} from 'lucide-react';
import { api } from '../api';

export default function CitizenDashboard({ onGlobalRefresh }) {
  const [citizens, setCitizens] = useState([]);
  const [heroCitizens, setHeroCitizens] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCitizenId, setSelectedCitizenId] = useState('CIT-001');
  const [entitlementData, setEntitlementData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedSchemeId, setExpandedSchemeId] = useState('SCH-02');
  const [showOtherSchemes, setShowOtherSchemes] = useState(false);
  const [claimingSchemeId, setClaimingSchemeId] = useState(null);
  const [claimToast, setClaimToast] = useState(null);

  useEffect(() => {
    loadCitizensList('', true);
  }, []);

  useEffect(() => {
    if (selectedCitizenId) {
      loadCitizenDetail(selectedCitizenId);
    }
  }, [selectedCitizenId]);

  const loadCitizensList = async (search, isInitial = false) => {
    try {
      const res = await api.getCitizens({ cohort: 'all', search });
      const list = res.citizens || [];
      setCitizens(list);
      if (isInitial || (!search && heroCitizens.length === 0)) {
        setHeroCitizens(list.slice(0, 5));
      }
    } catch (e) {
      console.error('Error loading citizens:', e);
    }
  };

  const loadCitizenDetail = async (cid) => {
    setLoading(true);
    try {
      const res = await api.getCitizenEntitlements(cid);
      setEntitlementData(res);
      if (res.pre_approved_entitlements?.length > 0) {
        setExpandedSchemeId(res.pre_approved_entitlements[0].scheme_id);
      }
    } catch (e) {
      console.error('Error loading entitlements:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleOneClickClaim = async (schemeId) => {
    setClaimingSchemeId(schemeId);
    try {
      const res = await api.dispatchDBT({
        citizen_id: selectedCitizenId,
        scheme_id: schemeId,
        spoken_utterance: '1-Click Citizen Portal Consent (DigiLocker Verified)',
      });
      setClaimToast(res.dbt_receipt);
      await loadCitizenDetail(selectedCitizenId);
      if (onGlobalRefresh) onGlobalRefresh();
    } catch (e) {
      console.error('Claim error:', e);
    } finally {
      setClaimingSchemeId(null);
    }
  };

  const handlePlayVoicePrompt = (text, langCode = 'hi') => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const map = { hi: 'hi-IN', kn: 'kn-IN', en: 'en-IN', mr: 'mr-IN', ta: 'ta-IN', bho: 'hi-IN' };
      u.lang = map[langCode] || 'hi-IN';
      window.speechSynthesis.speak(u);
    }
  };

  const citizen = entitlementData?.citizen;
  const summary = entitlementData?.summary;

  return (
    <div className="space-y-8">
      {/* Hero Persona Bar */}
      <div className="bg-ivory dark:bg-navy-surface border border-hairline dark:border-navy-muted rounded-2xl p-6 card-rule-terracotta shadow-sm space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-terracotta font-semibold">
              MODULE 03 — CITIZEN ENTITLEMENT WALLET (“POLICY FINDS PEOPLE”)
            </span>
            <h1 className="font-serif text-3xl md:text-4xl text-ink-primary dark:text-parchment mt-1">
              Pre-Approved Sovereign Entitlements —{' '}
              <span className="italic text-terracotta">Zero Forms, Single-Click Claim.</span>
            </h1>
          </div>

          {/* Search across all 200 Citizens */}
          <div className="flex items-center gap-2 w-full lg:w-96">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-ink-secondary absolute left-3 top-3.5" />
              <input
                type="text"
                placeholder="Search 200 citizens by name, ID, district..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  loadCitizensList(e.target.value);
                }}
                aria-label="Search 200 citizens"
                className="w-full min-h-[44px] pl-9 pr-3 py-2 rounded-xl border border-hairline dark:border-navy-muted bg-parchment dark:bg-navy-deep text-xs text-ink-primary dark:text-white"
              />
            </div>
            <select
              aria-label="Select citizen profile"
              value={selectedCitizenId}
              onChange={(e) => setSelectedCitizenId(e.target.value)}
              className="min-h-[44px] px-3 py-2 rounded-xl border border-hairline dark:border-navy-muted bg-parchment dark:bg-navy-deep text-xs font-mono text-ink-primary dark:text-white max-w-[185px]"
            >
              {citizens.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id}: {c.name} ({c.state})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 5 Hero Persona Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {heroCitizens.map((hc) => {
            const active = hc.id === selectedCitizenId;
            return (
              <button
                key={hc.id}
                type="button"
                onClick={() => setSelectedCitizenId(hc.id)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  active
                    ? 'bg-navy-deep text-white border-navy-deep shadow-md'
                    : 'bg-parchment dark:bg-navy-deep/60 text-ink-primary dark:text-stone border-hairline dark:border-navy-muted hover:bg-stone/60'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono mb-1">
                  <span className={active ? 'text-ochre font-bold' : 'text-ink-mono dark:text-stone/70'}>{hc.id}</span>
                  <span className="px-1.5 py-0.5 rounded bg-forest/20 text-forest dark:text-emerald-300 font-semibold">
                    {hc.state}
                  </span>
                </div>
                <div className="font-semibold text-sm truncate">{hc.name}</div>
                <div className={`text-xs truncate ${active ? 'text-stone/80' : 'text-ink-secondary dark:text-stone/70'}`}>
                  {hc.name_local} • {hc.occupation}
                </div>
                <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                  <span>{hc.matched_schemes_count} Schemes</span>
                  <span className={active ? 'text-ochre font-bold tabular-nums' : 'text-forest dark:text-emerald-400 font-bold tabular-nums'}>
                    ₹{hc.total_unlocked_benefit_inr?.toLocaleString('en-IN')}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Claim Toast Alert */}
      {claimToast && (
        <div className="p-4 rounded-2xl bg-forest text-white flex flex-wrap items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-ochre shrink-0" />
            <div>
              <div className="text-sm font-bold">
                Direct Benefit Transfer Disbursed — {claimToast.scheme_name} (₹{claimToast.amount_credited_inr.toLocaleString('en-IN')})
              </div>
              <div className="text-xs font-mono text-stone/90">
                Audit ID: {claimToast.audit_record_id} • UTR: {claimToast.utr_number} • Bank: {claimToast.bank_account_masked} • DEPA Token: {claimToast.depa_token_status}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setClaimToast(null)}
            className="min-h-[40px] px-3 py-1.5 rounded-lg bg-white/15 text-xs font-mono"
          >
            Dismiss
          </button>
        </div>
      )}

      {citizen && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 4 Columns: Citizen DigiLocker & ZKP Privacy Vault */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-navy-deep text-parchment rounded-2xl p-6 border border-navy-muted space-y-4 shadow-md">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase text-ochre">DIGILOCKER &amp; DEPA PROFILE</span>
                <span className="px-2.5 py-0.5 rounded bg-forest text-white text-xs font-mono">
                  ZKP VERIFIED
                </span>
              </div>

              <div>
                <h2 className="font-serif text-3xl text-white">
                  {citizen.name} <span className="text-lg text-ochre">({citizen.name_local})</span>
                </h2>
                <p className="text-xs font-mono text-stone/80 mt-1">
                  {citizen.panchayat}, {citizen.district}, {citizen.state} • {citizen.dialect}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 p-3.5 rounded-xl bg-navy-surface border border-navy-muted text-xs font-mono">
                <div>
                  <span className="text-stone/60 block">Unlocked Annual Benefit</span>
                  <span className="text-xl font-serif text-ochre font-bold tabular-nums">
                    ₹{summary?.total_annual_entitlement_inr?.toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-stone/60 block">Pre-Approved Schemes</span>
                  <span className="text-xl font-serif text-emerald-400 font-bold tabular-nums">
                    {summary?.pre_approved_count} / {summary?.total_schemes_evaluated}
                  </span>
                </div>
                <div>
                  <span className="text-stone/60 block">Aadhaar Vault</span>
                  <span className="text-white">{citizen.aadhaar_masked}</span>
                </div>
                <div>
                  <span className="text-stone/60 block">NPCI DBT Bank</span>
                  <span className="text-white truncate block">{citizen.bank_account_masked}</span>
                </div>
              </div>

              {/* Zero-Knowledge Commitments */}
              <div className="space-y-2">
                <div className="text-xs font-mono uppercase text-ochre flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Zero-Knowledge Attribute Commitments</span>
                </div>
                <div className="space-y-1.5 text-xs font-mono bg-navy-surface p-3 rounded-xl border border-navy-muted">
                  <div className="flex justify-between">
                    <span className="text-stone/70">Income (&lt; ₹2.5L):</span>
                    <span className="text-emerald-300">{citizen.zkp_commitments?.income_proof}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone/70">Land ({citizen.land_holding_ha} Ha):</span>
                    <span className="text-emerald-300">{citizen.zkp_commitments?.land_proof}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone/70">KCC Active ({String(citizen.kcc_active)}):</span>
                    <span className="text-emerald-300">{citizen.zkp_commitments?.kcc_proof}</span>
                  </div>
                </div>
              </div>

              {/* Verified DigiLocker Credentials */}
              <div className="space-y-2">
                <div className="text-xs font-mono uppercase text-stone/80">
                  DigiLocker Verifiable Credentials
                </div>
                <div className="space-y-1.5">
                  {citizen.verifiable_credentials?.map((vc, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-navy-surface border border-navy-muted text-xs flex items-center justify-between">
                      <div>
                        <div className="font-mono text-white font-semibold">{vc.vc_type}</div>
                        <div className="text-stone/70">{vc.issuer}</div>
                      </div>
                      <FileBadge className="w-4 h-4 text-ochre shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right 8 Columns: Pre-Approved Entitlements with Chain of Entitlement Citations */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl text-ink-primary dark:text-white">
                Pre-Approved Entitlements ({entitlementData?.pre_approved_entitlements?.length || 0})
              </h2>
              <span className="text-xs font-mono text-forest dark:text-ochre font-semibold">
                EVERY MATCH BACKED BY GAZETTE CLAUSE CITATION
              </span>
            </div>

            {entitlementData?.pre_approved_entitlements?.map((item) => {
              const isExpanded = expandedSchemeId === item.scheme_id;
              const alreadyDisbursed = entitlementData?.dbt_disbursement_ledger?.some(
                (tx) => tx.scheme_id === item.scheme_id
              );

              return (
                <div
                  key={item.scheme_id}
                  className="bg-ivory dark:bg-navy-surface border border-hairline dark:border-navy-muted rounded-2xl p-5 card-rule-forest shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-forest text-white font-semibold">
                          {item.scheme_id} • PRE-APPROVED
                        </span>
                        <span className="font-mono text-xs text-ink-mono dark:text-ochre">
                          {item.chain_of_entitlement?.gazette_id}
                        </span>
                      </div>
                      <h3 className="font-serif text-2xl text-ink-primary dark:text-white">
                        {item.scheme_name}
                      </h3>
                      <p className="text-xs text-ink-secondary dark:text-stone/80">
                        {item.ministry} • {item.benefit_summary}
                      </p>
                    </div>

                    <div className="flex sm:flex-col items-end justify-between gap-2 shrink-0">
                      <div className="font-serif text-3xl text-forest dark:text-emerald-400 font-bold tabular-nums">
                        ₹{item.benefit_amount_inr.toLocaleString('en-IN')}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handlePlayVoicePrompt(item.personalized_voice_prompt, citizen.preferred_language)}
                          aria-label={`Play Bhashini Voice Prompt for ${item.scheme_name}`}
                          className="min-h-[44px] px-3 py-2 rounded-xl border border-hairline dark:border-navy-muted bg-parchment dark:bg-navy-deep text-ink-primary dark:text-white text-xs font-semibold inline-flex items-center gap-1.5"
                        >
                          <Volume2 className="w-4 h-4 text-terracotta" />
                          <span>Voice</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOneClickClaim(item.scheme_id)}
                          disabled={claimingSchemeId === item.scheme_id}
                          className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 ${
                            alreadyDisbursed
                              ? 'bg-forest text-white'
                              : 'bg-terracotta hover:bg-terracotta-dark text-white shadow-sm'
                          }`}
                        >
                          <Landmark className="w-4 h-4" />
                          <span>
                            {claimingSchemeId === item.scheme_id
                              ? 'Crediting...'
                              : alreadyDisbursed
                              ? 'Credited (Re-Verify)'
                              : '1-Click Claim DBT'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Chain of Entitlement */}
                  <div className="pt-3 border-t border-hairline dark:border-navy-muted">
                    <button
                      type="button"
                      onClick={() => setExpandedSchemeId(isExpanded ? null : item.scheme_id)}
                      className="w-full min-h-[38px] flex items-center justify-between text-xs font-mono font-semibold text-ink-primary dark:text-ochre"
                    >
                      <span>
                        DETERMINISTIC CHAIN OF ENTITLEMENT ({item.passed_clauses_count}/{item.total_clauses_count} ZKP CLAUSES VERIFIED)
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-3 p-4 rounded-xl bg-parchment dark:bg-navy-deep border border-hairline dark:border-navy-muted space-y-3 text-xs">
                        <div className="font-mono text-ink-mono dark:text-ochre">
                          {item.chain_of_entitlement?.section} — {item.chain_of_entitlement?.clause}
                        </div>
                        <p className="italic text-ink-secondary dark:text-stone">
                          “{item.chain_of_entitlement?.excerpt}”
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {item.clause_traces?.map((ct, idx) => (
                            <div
                              key={idx}
                              className="p-2.5 rounded-lg bg-ivory dark:bg-navy-surface border border-hairline dark:border-navy-muted flex items-center justify-between font-mono"
                            >
                              <span className="text-forest dark:text-emerald-300 font-semibold truncate">
                                ✓ {ct.label}
                              </span>
                              <span className="text-ink-mono dark:text-stone/60 ml-2 shrink-0">
                                {ct.zkp_proof_hash.slice(0, 12)}…
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Collapsible Other Evaluated Schemes (Transparent "No Black Box" Exclusion Audit) */}
            {entitlementData?.other_evaluated_schemes?.length > 0 && (
              <div className="bg-ivory dark:bg-navy-surface border border-hairline dark:border-navy-muted rounded-2xl p-5 space-y-3">
                <button
                  type="button"
                  onClick={() => setShowOtherSchemes(!showOtherSchemes)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <div>
                    <span className="font-mono text-xs uppercase text-ink-mono dark:text-ochre font-semibold">
                      TRANSPARENT STATUTORY AUDIT • ZERO BLACK BOX
                    </span>
                    <h3 className="font-serif text-lg text-ink-primary dark:text-white">
                      Other Evaluated Schemes ({entitlementData.other_evaluated_schemes.length} Not Applicable — View Exact Clause Trace)
                    </h3>
                  </div>
                  {showOtherSchemes ? (
                    <ChevronUp className="w-4 h-4 text-ink-secondary" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-ink-secondary" />
                  )}
                </button>

                {showOtherSchemes && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2 border-t border-hairline dark:border-navy-muted">
                    {entitlementData.other_evaluated_schemes.map((os) => (
                      <div
                        key={os.scheme_id}
                        className="p-3 rounded-xl bg-parchment/70 dark:bg-navy-deep border border-hairline dark:border-navy-muted text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between font-mono font-semibold text-ink-primary dark:text-white">
                          <span>{os.scheme_id}: {os.scheme_name}</span>
                          <span className="text-terracotta">
                            {os.passed_clauses_count}/{os.total_clauses_count} clauses
                          </span>
                        </div>
                        <div className="text-ink-secondary dark:text-stone/70 font-mono">
                          Unsatisfied: {os.clause_traces?.filter((c) => !c.passed).map((c) => c.label).join(' • ')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
