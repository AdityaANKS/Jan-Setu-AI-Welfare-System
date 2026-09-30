import React, { useState, useEffect } from 'react';
import {
  Network,
  Sliders,
  CheckCircle2,
  XCircle,
  BookOpen,
  Cpu,
  Terminal,
  Sparkles,
  Play,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../api';

export default function KnowledgeGraphView({ schemes }) {
  const [selectedScheme, setSelectedScheme] = useState(schemes[0] || null);

  // "No Black Box" Deterministic Rule Simulator Sliders
  const [simState, setSimState] = useState('KA');
  const [simOccupation, setSimOccupation] = useState('Farmer');
  const [simGender, setSimGender] = useState('Male');
  const [simAge, setSimAge] = useState(36);
  const [simLandHa, setSimLandHa] = useState(1.4);
  const [simIncome, setSimIncome] = useState(145000);
  const [simKcc, setSimKcc] = useState(true);
  const [simCategory, setSimCategory] = useState('OBC');

  // Jevify Single-Pass Typed Readout Workbench State
  const [recipes, setRecipes] = useState([]);
  const [activeRecipe, setActiveRecipe] = useState('gemma-4-e4b-it.llamacpp');
  const [probeData, setProbeData] = useState(null);
  const [jevStateText, setJevStateText] = useState(
    'Every cultivating smallholder domiciled in Karnataka holding less than 2.0 Hectares of rainfed agricultural land under Bhoomi RTC records, with an annual household income below ₹2,50,000 and an active Kisan Credit Card, shall be entitled to a proactive grant of ₹18,000.'
  );
  const [jevReadout, setJevReadout] = useState(null);
  const [runningJev, setRunningJev] = useState(false);

  useEffect(() => {
    if (schemes?.length && !selectedScheme) {
      setSelectedScheme(schemes[0]);
    }
  }, [schemes]);

  useEffect(() => {
    api.getJevifyRecipes().then((res) => setRecipes(res.recipes || [])).catch(() => {});
    handleProbeAndAsk('gemma-4-e4b-it.llamacpp', jevStateText);
  }, []);

  const handleProbeAndAsk = async (recipeName, stateStr) => {
    setRunningJev(true);
    try {
      const [pRes, aRes] = await Promise.all([
        api.probeJevify(recipeName),
        api.askJevify({
          state: stateStr,
          recipe: recipeName,
          questions: [
            {
              id: 'dept',
              kind: 'choice',
              prompt: 'Which nodal department administers this policy?',
              options: ['agriculture', 'women_child', 'education', 'healthcare', 'msme_artisan'],
            },
            {
              id: 'determinism',
              kind: 'score',
              prompt: 'How strictly deterministic are the statutory eligibility thresholds?',
              options: ['ambiguous', 'partial', 'clear', 'strict_boolean'],
            },
            {
              id: 'land_ceiling',
              kind: 'noul',
              prompt: 'The policy specifies a maximum agricultural land holding ceiling.',
            },
            {
              id: 'income_ceiling',
              kind: 'noul',
              prompt: 'The policy specifies a maximum annual household income threshold.',
            },
          ],
        }),
      ]);
      setProbeData(pRes);
      setJevReadout(aRes);
    } catch (e) {
      console.error('Jevify workbench error:', e);
    } finally {
      setRunningJev(false);
    }
  };

  // Evaluate simulated citizen across all 15 schemes in real time
  const evaluateRule = (rule) => {
    const valMap = {
      state: simState,
      occupation: simOccupation,
      gender: simGender,
      age: simAge,
      land_holding_ha: simLandHa,
      annual_income_inr: simIncome,
      kcc_active: simKcc,
      social_category: simCategory,
    };
    const actual = valMap[rule.field];
    const exp = rule.value;
    switch (rule.operator) {
      case '==':
        return actual === exp;
      case '!=':
        return actual !== exp;
      case '<':
        return Number(actual) < Number(exp);
      case '<=':
        return Number(actual) <= Number(exp);
      case '>':
        return Number(actual) > Number(exp);
      case '>=':
        return Number(actual) >= Number(exp);
      case 'in':
        return Array.isArray(exp) && exp.includes(actual);
      default:
        return false;
    }
  };

  const activeScheme = selectedScheme || schemes[0];
  const evaluatedRules = (activeScheme?.rules || []).map((r) => ({
    ...r,
    passed: evaluateRule(r),
  }));
  const isSchemeEligible = evaluatedRules.every((r) => r.passed);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-ivory dark:bg-navy-surface border border-hairline dark:border-navy-muted rounded-2xl p-6 md:p-8 card-rule-forest shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-forest dark:text-ochre font-semibold">
              PILLAR 01 — AI POLICY KNOWLEDGE GRAPH &amp; JEVIFY SINGLE-PASS READOUT
            </span>
            <h1 className="font-serif text-3xl md:text-4xl text-ink-primary dark:text-parchment mt-1">
              Deterministic Ontology Engine —{' '}
              <span className="italic text-forest dark:text-ochre">Zero “Black Box” Decisions.</span>
            </h1>
            <p className="text-sm text-ink-secondary dark:text-stone/80 mt-2 max-w-3xl">
              LLMs and <strong>Jevify (`jevify`)</strong> are restricted strictly to decomposing dense legal gazettes
              into formal boolean logic rules. Every eligibility decision is evaluated deterministically and linked
              directly to the official Gazette paragraph and clause number.
            </p>
          </div>
          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="px-3 py-1.5 rounded-lg bg-forest text-white font-semibold">
              15 CENTRAL &amp; STATE SCHEMES
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-navy-deep text-ochre font-semibold">
              NEO4J + JEVIFY AST
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Knowledge Graph & Deterministic Rule Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Columns: Visual SVG Node-Edge Ontology Graph + Scheme Selector */}
        <div className="lg:col-span-7 bg-ivory dark:bg-navy-surface border border-hairline dark:border-navy-muted rounded-2xl p-6 space-y-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="font-mono text-xs uppercase text-ink-mono dark:text-ochre">
                INTERACTIVE ONTOLOGY GRAPH (MINISTRY → GAZETTE → BOOLEAN CLAUSES → ENTITLEMENT)
              </span>
              <h2 className="font-serif text-2xl text-ink-primary dark:text-white">
                {activeScheme?.name}
              </h2>
            </div>
            <select
              aria-label="Select scheme to inspect in Knowledge Graph"
              value={activeScheme?.id || 'SCH-01'}
              onChange={(e) => {
                const found = schemes.find((s) => s.id === e.target.value);
                if (found) {
                  setSelectedScheme(found);
                  setJevStateText(found.gazette?.excerpt || '');
                  handleProbeAndAsk(activeRecipe, found.gazette?.excerpt || '');
                }
              }}
              className="min-h-[44px] px-3 py-2 rounded-xl border border-hairline dark:border-navy-muted bg-parchment dark:bg-navy-deep text-xs font-medium text-ink-primary dark:text-white"
            >
              {schemes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id}: {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Interactive SVG Knowledge Graph Visualization */}
          <div className="rounded-xl bg-navy-deep p-4 border border-navy-muted overflow-x-auto">
            <svg viewBox="0 0 760 310" className="w-full h-auto min-w-[580px]" role="img" aria-label="Policy Knowledge Graph Node Diagram">
              {/* Edges */}
              <line x1="120" y1="70" x2="300" y2="70" stroke="#C59B38" strokeWidth="2" strokeDasharray="4 3" />
              <line x1="300" y1="70" x2="580" y2="70" stroke="#2C4A3E" strokeWidth="2.5" />

              {evaluatedRules.map((r, idx) => {
                const yPos = 155 + idx * 32;
                return (
                  <g key={idx}>
                    <line
                      x1="300"
                      y1="95"
                      x2="180"
                      y2={yPos}
                      stroke={r.passed ? '#34D399' : '#F87171'}
                      strokeWidth="1.8"
                    />
                    <line
                      x1="440"
                      y1={yPos}
                      x2="610"
                      y2="195"
                      stroke={r.passed ? '#34D399' : '#F87171'}
                      strokeWidth="1.8"
                    />
                  </g>
                );
              })}

              {/* Node 1: Ministry */}
              <rect x="20" y="42" width="165" height="56" rx="10" fill="#1B253B" stroke="#C59B38" strokeWidth="1.5" />
              <text x="32" y="63" fill="#C59B38" fontSize="10" fontFamily="JetBrains Mono">MINISTRY NODE</text>
              <text x="32" y="82" fill="#FFFFFF" fontSize="11" fontWeight="600">
                {activeScheme?.ministry?.slice(0, 22)}…
              </text>

              {/* Node 2: Gazette Notification */}
              <rect x="215" y="42" width="185" height="56" rx="10" fill="#1B253B" stroke="#34D399" strokeWidth="1.5" />
              <text x="228" y="63" fill="#34D399" fontSize="10" fontFamily="JetBrains Mono">
                {activeScheme?.gazette?.gazette_id}
              </text>
              <text x="228" y="82" fill="#EFECE3" fontSize="11">
                {activeScheme?.gazette?.clause}
              </text>

              {/* Node 3: Scheme Benefit Tier */}
              <rect x="445" y="42" width="290" height="56" rx="10" fill="#2C4A3E" stroke="#34D399" strokeWidth="2" />
              <text x="460" y="63" fill="#EFECE3" fontSize="10" fontFamily="JetBrains Mono">
                SCHEME ENTITLEMENT ({activeScheme?.id})
              </text>
              <text x="460" y="83" fill="#FFFFFF" fontSize="12" fontWeight="700">
                ₹{activeScheme?.benefit_amount_inr?.toLocaleString('en-IN')} • {activeScheme?.disbursement_rail}
              </text>

              {/* Predicate Clause Nodes */}
              {evaluatedRules.map((r, idx) => {
                const yPos = 138 + idx * 32;
                return (
                  <g key={idx}>
                    <rect
                      x="140"
                      y={yPos}
                      width="320"
                      height="26"
                      rx="6"
                      fill={r.passed ? '#16382C' : '#3B1D1D'}
                      stroke={r.passed ? '#34D399' : '#F87171'}
                      strokeWidth="1.2"
                    />
                    <text x="152" y={yPos + 17} fill="#FFFFFF" fontSize="11" fontFamily="JetBrains Mono">
                      {r.passed ? 'PASS' : 'FAIL'} | {r.label.slice(0, 36)}
                    </text>
                  </g>
                );
              })}

              {/* Output Decision Gate */}
              <rect
                x="520"
                y="162"
                width="215"
                height="68"
                rx="12"
                fill={isSchemeEligible ? '#2C4A3E' : '#C85A32'}
                stroke="#FFFFFF"
                strokeWidth="2"
              />
              <text x="536" y="187" fill="#EFECE3" fontSize="10" fontFamily="JetBrains Mono">
                DETERMINISTIC ENGINE VERDICT
              </text>
              <text x="536" y="210" fill="#FFFFFF" fontSize="14" fontWeight="700">
                {isSchemeEligible ? '✓ PRE-APPROVED ELIGIBLE' : '✕ CLAUSE UNSATISFIED'}
              </text>
            </svg>
          </div>

          {/* Gazette Citation & Boolean AST */}
          <div className="p-4 rounded-xl bg-stone/60 dark:bg-navy-deep border border-hairline dark:border-navy-muted space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-forest dark:text-ochre font-semibold">
              <span>CHAIN OF ENTITLEMENT CITATION: {activeScheme?.gazette?.gazette_id}</span>
              <span>{activeScheme?.gazette?.notification_date}</span>
            </div>
            <p className="text-xs italic text-ink-primary dark:text-stone">
              “{activeScheme?.gazette?.excerpt}”
            </p>
            <div className="p-2.5 rounded bg-navy-deep text-emerald-300 font-mono text-xs overflow-x-auto">
              {activeScheme?.boolean_ast}
            </div>
          </div>
        </div>

        {/* Right 5 Columns: Live "No Black Box" Citizen Demographic Slider Tester */}
        <div className="lg:col-span-5 bg-ivory dark:bg-navy-surface border border-hairline dark:border-navy-muted rounded-2xl p-6 card-rule-terracotta space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-mono text-xs uppercase text-terracotta font-semibold">
                INTERACTIVE BOOLEAN GATE TESTER
              </span>
              <h2 className="font-serif text-2xl text-ink-primary dark:text-white">
                Test Citizen Attributes Against Rules
              </h2>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
                isSchemeEligible ? 'bg-forest text-white' : 'bg-terracotta text-white'
              }`}
            >
              {isSchemeEligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-ink-secondary dark:text-stone mb-1" htmlFor="sim-state">
                Domicile State
              </label>
              <select
                id="sim-state"
                value={simState}
                onChange={(e) => setSimState(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 rounded-lg border border-hairline dark:border-navy-muted bg-parchment dark:bg-navy-deep text-ink-primary dark:text-white"
              >
                <option value="KA">Karnataka (KA)</option>
                <option value="UP">Uttar Pradesh (UP)</option>
                <option value="MH">Maharashtra (MH)</option>
                <option value="BR">Bihar (BR)</option>
                <option value="TN">Tamil Nadu (TN)</option>
                <option value="RJ">Rajasthan (RJ)</option>
                <option value="MP">Madhya Pradesh (MP)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-ink-secondary dark:text-stone mb-1" htmlFor="sim-occ">
                Occupation
              </label>
              <select
                id="sim-occ"
                value={simOccupation}
                onChange={(e) => setSimOccupation(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 rounded-lg border border-hairline dark:border-navy-muted bg-parchment dark:bg-navy-deep text-ink-primary dark:text-white"
              >
                <option value="Farmer">Farmer / Cultivator</option>
                <option value="Artisan">Artisan / Craftsperson</option>
                <option value="Self-Employed">Self-Employed</option>
                <option value="Student">Student</option>
                <option value="Homemaker">Homemaker</option>
                <option value="Agricultural Laborer">Agricultural Laborer</option>
                <option value="Construction Worker">Construction Worker</option>
                <option value="Handloom Weaver">Handloom Weaver</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-ink-secondary dark:text-stone mb-1" htmlFor="sim-gender">
                Gender
              </label>
              <select
                id="sim-gender"
                value={simGender}
                onChange={(e) => setSimGender(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 rounded-lg border border-hairline dark:border-navy-muted bg-parchment dark:bg-navy-deep text-ink-primary dark:text-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-ink-secondary dark:text-stone mb-1" htmlFor="sim-cat">
                Social Category
              </label>
              <select
                id="sim-cat"
                value={simCategory}
                onChange={(e) => setSimCategory(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 rounded-lg border border-hairline dark:border-navy-muted bg-parchment dark:bg-navy-deep text-ink-primary dark:text-white"
              >
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="General">General</option>
              </select>
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-3 pt-1">
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span>Citizen Age (Years):</span>
                <span className="font-bold text-terracotta tabular-nums">{simAge} Yrs</span>
              </div>
              <input
                type="range"
                min="18"
                max="75"
                step="1"
                value={simAge}
                onChange={(e) => setSimAge(parseInt(e.target.value, 10))}
                aria-label="Citizen Age in Years"
                className="w-full accent-terracotta"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span>Land Holding (Hectares):</span>
                <span className="font-bold text-terracotta tabular-nums">{simLandHa} Ha</span>
              </div>
              <input
                type="range"
                min="0"
                max="4.0"
                step="0.1"
                value={simLandHa}
                onChange={(e) => setSimLandHa(parseFloat(e.target.value))}
                aria-label="Land Holding in Hectares"
                className="w-full accent-terracotta"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span>Annual Household Income (INR):</span>
                <span className="font-bold text-terracotta tabular-nums">
                  ₹{simIncome.toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min="40000"
                max="350000"
                step="5000"
                value={simIncome}
                onChange={(e) => setSimIncome(parseInt(e.target.value, 10))}
                aria-label="Annual Household Income in INR"
                className="w-full accent-terracotta"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-semibold">Active Kisan Credit Card (KCC):</span>
              <button
                type="button"
                onClick={() => setSimKcc(!simKcc)}
                className={`min-h-[40px] px-4 py-1.5 rounded-lg text-xs font-mono font-bold ${
                  simKcc ? 'bg-forest text-white' : 'bg-stone text-ink-primary'
                }`}
              >
                {simKcc ? 'TRUE (VERIFIED)' : 'FALSE'}
              </button>
            </div>
          </div>

          {/* Clause-by-Clause Trace */}
          <div className="space-y-2 pt-2 border-t border-hairline dark:border-navy-muted">
            <div className="text-xs font-mono uppercase text-ink-mono dark:text-ochre">
              LIVE BOOLEAN CLAUSE EVALUATION
            </div>
            {evaluatedRules.map((r, i) => (
              <div
                key={i}
                className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                  r.passed
                    ? 'bg-forest/10 border-forest/40 text-ink-primary dark:text-white'
                    : 'bg-terracotta/10 border-terracotta/40 text-ink-primary dark:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  {r.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-forest dark:text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-terracotta shrink-0" />
                  )}
                  <span>{r.label}</span>
                </div>
                <span className="font-mono text-xs text-ink-mono dark:text-ochre ml-2 shrink-0">
                  {r.clause_ref}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Jevify Single-Pass Typed Readout Workbench (https://github.com/fidecastro/jevify) */}
      <section className="bg-navy-deep text-parchment rounded-2xl p-6 md:p-8 border border-navy-muted shadow-lg space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-navy-muted pb-4">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-ochre flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              <span>JEV AI / JEVIFY ENGINE WORKBENCH (fidecastro/jevify)</span>
            </div>
            <h2 className="font-serif text-2xl md:text-3xl text-white mt-1">
              Single-Pass Typed Readout over Cached Gazette State (<code className="text-ochre text-lg">choice</code>, <code className="text-ochre text-lg">score</code>, <code className="text-ochre text-lg">noul</code>)
            </h2>
            <p className="text-xs text-stone/80 mt-1">
              Sends the Gazette state once to warm the prefix cache, then reads typed answers directly off next-token logprobs in 8–32 ms with <code className="text-ochre">x_jevify</code> cryptographic recipe provenance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Select Jevify model recipe"
              value={activeRecipe}
              onChange={(e) => {
                setActiveRecipe(e.target.value);
                handleProbeAndAsk(e.target.value, jevStateText);
              }}
              className="min-h-[44px] px-3 py-2 rounded-xl bg-navy-surface border border-navy-muted text-xs font-mono text-white"
            >
              {recipes.map((r) => (
                <option key={r.name} value={r.name}>
                  {r.name} ({r.median_latency_ms}ms • {r.policy_29_accuracy})
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => handleProbeAndAsk(activeRecipe, jevStateText)}
              disabled={runningJev}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-terracotta text-white text-xs font-mono font-bold inline-flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{runningJev ? 'Probing...' : 'jevify ask'}</span>
            </button>
          </div>
        </div>

        {/* Interactive Gazette Prefix Cache State Input + Probe Rung Ladder */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 space-y-1.5">
            <label className="block text-xs font-mono uppercase text-ochre" htmlFor="jevify-state-input">
              Cached Gazette Prefix State (Editable — test custom clauses with jevify ask)
            </label>
            <textarea
              id="jevify-state-input"
              rows={2}
              value={jevStateText}
              onChange={(e) => setJevStateText(e.target.value)}
              className="w-full p-3 rounded-xl bg-navy-surface border border-navy-muted text-xs font-mono text-stone focus:outline-none focus:ring-1 focus:ring-ochre"
            />
          </div>
          {probeData && (
            <div className="lg:col-span-4 p-3 rounded-xl bg-navy-surface border border-navy-muted text-xs font-mono space-y-1">
              <div className="flex items-center justify-between text-ochre font-bold">
                <span>PROBE RUNG: {probeData.selected_readout_rung}</span>
                <span>{probeData.recipe?.backend}</span>
              </div>
              <div className="text-stone/80 truncate">
                Contract: {probeData.telemetry_contract} • Warmup: {probeData.prefix_cache_warmup?.warmup_ms}ms
              </div>
              <div className="text-emerald-300 truncate">
                Benchmark: {probeData.recipe?.policy_29_accuracy} (policy-29)
              </div>
            </div>
          )}
        </div>

        {jevReadout && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {jevReadout.answers_list?.map((ans) => (
              <div key={ans.id} className="p-4 rounded-xl bg-navy-surface border border-navy-muted flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-ochre mb-1">
                    <span>--{ans.kind} ({ans.id})</span>
                    <span>{ans.x_jevify?.latency_ms} ms</span>
                  </div>
                  <div className="text-xs text-stone/90 font-medium mb-2">{ans.prompt}</div>
                  <div className="text-base font-mono font-bold text-emerald-300">
                    {ans.kind === 'noul'
                      ? `p(true) = ${ans.noul}`
                      : `${ans.choice} (${Math.round((ans.confidence || 0) * 100)}%)`}
                  </div>
                </div>

                <div className="pt-2 border-t border-navy-muted text-xs font-mono text-stone/60 space-y-0.5">
                  <div>rung: {ans.x_jevify?.readout_rung}</div>
                  <div>cached: {ans.x_jevify?.cached_tokens} tok</div>
                  <div className="truncate">{ans.x_jevify?.recipe_hash}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
