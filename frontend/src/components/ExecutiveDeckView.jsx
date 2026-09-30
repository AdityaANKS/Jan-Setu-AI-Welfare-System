import React from 'react';
import {
  Globe2,
  ShieldCheck,
  Layers,
  Cpu,
  Milestone,
  ArrowRight,
  Lock,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';

export default function ExecutiveDeckView({ onJumpToStudio }) {
  return (
    <div className="space-y-8">
      {/* SLIDE 01 & 02: THE REACTIVE WELFARE PARADOX & GLOBAL PRECEDENT */}
      <section className="bg-ivory dark:bg-navy-surface border border-hairline dark:border-navy-muted rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-hairline dark:border-navy-muted pb-6">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-terracotta font-semibold">
              SLIDE 01 &amp; 02 — PROBLEM &amp; GLOBAL PRECEDENT
            </span>
            <h1 className="font-serif text-3xl md:text-5xl text-ink-primary dark:text-parchment mt-1">
              The Reactive Welfare Paradox:{' '}
              <span className="italic text-terracotta">From “Apply &amp; Pray” to “Policy Finds People.”</span>
            </h1>
          </div>
          <button
            type="button"
            onClick={onJumpToStudio}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-terracotta text-white text-xs font-semibold inline-flex items-center gap-2 shrink-0"
          >
            <span>Launch 4-Step Live Pipeline Studio</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 7 Cols: Indian Reality */}
          <div className="lg:col-span-7 space-y-4">
            <div className="font-mono text-xs uppercase text-ink-mono dark:text-ochre font-semibold">
              THE INDIAN REALITY (THREE RECORDS, THREE PORTALS)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-navy-deep text-parchment border border-navy-muted">
                <div className="text-xs font-mono uppercase text-ochre">ANNUAL WELFARE BUDGET</div>
                <div className="font-serif text-4xl text-white mt-1 tabular-nums">₹3.5+ Trn</div>
                <p className="text-xs text-stone/80 mt-2">
                  Allocated annually across 1,200+ Central and State welfare programs.
                </p>
              </div>
              <div className="p-5 rounded-xl bg-parchment dark:bg-navy-deep border border-terracotta/50 card-rule-terracotta">
                <div className="text-xs font-mono uppercase text-terracotta font-bold">THE FRICTION GAP</div>
                <div className="font-serif text-4xl text-terracotta mt-1 tabular-nums">Up to 40%</div>
                <p className="text-xs text-ink-secondary dark:text-stone/80 mt-2">
                  Eligible marginalized citizens never receive benefits due to form complexity, low literacy, and middlemen.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-stone/60 dark:bg-navy-deep border border-hairline dark:border-navy-muted space-y-2">
              <div className="font-serif text-xl text-ink-primary dark:text-white">
                Data Silos Across World-Class DPI Rails
              </div>
              <p className="text-xs text-ink-secondary dark:text-stone/80 leading-relaxed">
                India has world-class transactional rails (Aadhaar, UPI, DigiLocker, Account Aggregator), yet a citizen’s{' '}
                <strong>Caste Certificate</strong> sits on DigiLocker, <strong>Land Records</strong> sit on state portals
                (Bhoomi/Bhulekh), and <strong>Income/Bank status</strong> sits on PM-KISAN or ABHA. No single system
                proactively orchestrates combined eligibility.
              </p>
            </div>
          </div>

          {/* Right 5 Cols: Global Benchmark (Shanghai & Shenzhen Yiwangban) */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-forest text-white flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-ochre">
                <span>GLOBAL BENCHMARK • SHANGHAI &amp; SHENZHEN</span>
                <Globe2 className="w-4 h-4" />
              </div>
              <h2 className="font-serif text-3xl text-white leading-snug">
                “Policy Finds People” (<span className="text-ochre">政策找人</span> — Zhengce Zhaoren)
              </h2>
              <p className="text-xs text-stone/90 leading-relaxed">
                Powered by <strong>Yiwangban (一网通办 — “One Network Handles All”)</strong>, municipal algorithmic
                engines cross-match life-event triggers and tax/demographic records against public budgets, pushing
                pre-approved maternity, enterprise, and low-income subsidies directly to citizens with zero paperwork.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-black/25 border border-white/15 space-y-1.5">
              <div className="text-xs font-mono uppercase text-ochre font-bold">
                THE JAN-SETU INDIA STACK ADAPTATION
              </div>
              <p className="text-xs text-stone/95 leading-relaxed">
                Adapts proactive algorithmic matching for India’s high-diversity, low-literacy landscape by pairing{' '}
                <strong>DEPA Zero-Knowledge Proofs</strong> with <strong>AI4Bharat Bhashini</strong> voice-first
                outreach in 22 scheduled languages.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SLIDE 04: THREE-TIER ETHICAL AI & DPDP ACT 2023 TRUST FRAMEWORK */}
      <section className="bg-ivory dark:bg-navy-surface border border-hairline dark:border-navy-muted rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-forest dark:text-ochre font-semibold">
            SLIDE 04 — ETHICAL AI, DEPA COMPLIANCE, AUDITABILITY
          </span>
          <h2 className="font-serif text-3xl md:text-4xl text-ink-primary dark:text-white mt-1">
            Built for Public Trust,{' '}
            <span className="italic text-forest dark:text-ochre">Not Just Speed.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 rounded-xl bg-parchment dark:bg-navy-deep border border-hairline dark:border-navy-muted card-rule-forest space-y-3">
            <span className="font-mono text-xs text-forest dark:text-ochre font-bold">
              TIER 01 • EXPLAINABILITY
            </span>
            <h3 className="font-serif text-2xl text-ink-primary dark:text-white">
              No “Black Box” Decisions
            </h3>
            <p className="text-xs text-ink-secondary dark:text-stone/80 leading-relaxed">
              LLMs (OpenAI SIWC) and <strong>Jevify (`jevify`)</strong> are restricted strictly to text parsing and
              single-pass logprob readouts. Actual eligibility matching runs on a deterministic boolean rule engine with
              an auditable <strong>Chain of Entitlement</strong> citing the exact Gazette paragraph and clause number.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-navy-deep text-parchment border border-navy-muted card-rule-terracotta space-y-3">
            <span className="font-mono text-xs text-ochre font-bold">
              TIER 02 • PRIVACY BY DESIGN
            </span>
            <h3 className="font-serif text-2xl text-white">
              DPDP Act 2023 Alignment
            </h3>
            <p className="text-xs text-stone/85 leading-relaxed">
              Zero-Knowledge Proof (ZKP) principles verify <code className="text-ochre">Income &lt; ₹2.5 Lakh</code>{' '}
              without storing or exposing raw bank statements. Explicit purpose-bound DEPA Consent Artefacts are
              automatically revoked the second the DBT application resolves.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-parchment dark:bg-navy-deep border border-hairline dark:border-navy-muted card-rule-ochre space-y-3">
            <span className="font-mono text-xs text-terracotta font-bold">
              TIER 03 • HUMAN IN THE LOOP
            </span>
            <h3 className="font-serif text-2xl text-ink-primary dark:text-white">
              Exclusion Safeguards
            </h3>
            <p className="text-xs text-ink-secondary dark:text-stone/80 leading-relaxed">
              Algorithmic non-eligibility flags require human-in-the-loop review by local Panchayat / Ward
              administrative officers before benefits are withheld or modified.{' '}
              <em className="font-semibold">“The algorithm proposes; the state disposes — under a paper trail.”</em>
            </p>
          </div>
        </div>
      </section>

      {/* SLIDE 05 TECH STACK & SLIDE 06 12-MONTH ROADMAP TO UMANG */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tech Stack (5 Cols) */}
        <div className="lg:col-span-5 bg-navy-deep text-parchment rounded-2xl p-6 border border-navy-muted space-y-4">
          <div className="text-xs font-mono uppercase text-ochre font-bold">
            SLIDE 05 — FULL SOVEREIGN DPI TECHNOLOGY STACK
          </div>
          <div className="space-y-3 text-xs">
            {[
              {
                layer: 'BACKEND & ENGINE',
                stack: 'FastAPI • Python 3.11+ • Celery • Deterministic AST Engine',
              },
              {
                layer: 'AI & KNOWLEDGE GRAPH',
                stack: 'Mistral-7B / Llama-3 • Neo4j GraphRAG • Jevify Single-Pass Readout • OpenAI SIWC',
              },
              {
                layer: 'VOICE & MULTILINGUAL NLP',
                stack: 'AI4Bharat Bhashini • IndicWav2Vec (ASR) • IndicBART • IndicTTS',
              },
              {
                layer: 'PRIVACY & INDIA STACK',
                stack: 'MeitY DEPA v1.2 • DigiLocker VCs • Pedersen SHA-256 ZKP • PFMS DBT',
              },
              {
                layer: 'FRONTEND WORKBENCH',
                stack: 'React 18 • Tailwind CSS • Bilingual Panchayat Monitoring Dashboard',
              },
            ].map((item, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-navy-surface border border-navy-muted">
                <div className="font-mono text-ochre font-bold">{item.layer}</div>
                <div className="text-white mt-0.5">{item.stack}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 12-Month 3-Phase Deployment Roadmap (7 Cols) */}
        <div className="lg:col-span-7 bg-ivory dark:bg-navy-surface border border-hairline dark:border-navy-muted rounded-2xl p-6 card-rule-forest space-y-4">
          <div className="text-xs font-mono uppercase text-forest dark:text-ochre font-bold">
            SLIDE 06 — 3-PHASE DEPLOYMENT ROADMAP (12 MONTHS): FROM PROTOTYPE TO BACKGROUND DAEMON
          </div>
          <h2 className="font-serif text-3xl text-ink-primary dark:text-white">
            Path to Native Integration on UMANG &amp; State Portals
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-parchment dark:bg-navy-deep border border-hairline dark:border-navy-muted space-y-2">
              <span className="px-2.5 py-0.5 rounded bg-terracotta text-white font-mono text-xs font-bold">
                PHASE 01 • NOW
              </span>
              <h3 className="font-serif text-xl text-ink-primary dark:text-white">
                Prototype, in the Open
              </h3>
              <p className="text-xs text-ink-secondary dark:text-stone/80 leading-relaxed">
                15 Central &amp; State schemes tested across agriculture, women’s welfare, and education over 200
                anonymized citizen profiles in 6 Indian languages.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-parchment dark:bg-navy-deep border border-hairline dark:border-navy-muted space-y-2">
              <span className="px-2.5 py-0.5 rounded bg-forest text-white font-mono text-xs font-bold">
                PHASE 02 • 6 MONTHS
              </span>
              <h3 className="font-serif text-xl text-ink-primary dark:text-white">
                Pilot in Aspirational Districts
              </h3>
              <p className="text-xs text-ink-secondary dark:text-stone/80 leading-relaxed">
                Partner with District Rural Development Agencies (DRDA) and Common Service Centers (CSCs) for assisted
                Bhashini voice-consent onboarding.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-parchment dark:bg-navy-deep border border-hairline dark:border-navy-muted space-y-2">
              <span className="px-2.5 py-0.5 rounded bg-navy-deep text-ochre font-mono text-xs font-bold">
                PHASE 03 • 12 MONTHS
              </span>
              <h3 className="font-serif text-xl text-ink-primary dark:text-white">
                Native to UMANG Daemon
              </h3>
              <p className="text-xs text-ink-secondary dark:text-stone/80 leading-relaxed">
                Deploy as an automated background eligibility daemon on UMANG and state portals (Seva Sindhu /
                MahaDBT) — shifting welfare from search-based to push-based.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
