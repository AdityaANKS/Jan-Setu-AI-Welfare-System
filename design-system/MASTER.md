# Design System Master: Jan-Setu AI (जन-सेतु)
**Subtitle:** Zero-Click Proactive Entitlement Delivery System on the India Stack  
**Design Paradigm:** Editorial Civic-Tech ("The Sovereign Gazette meets Modern DPI")

---

## 1. Visual Identity & Color System

Inspired by official sovereign gazettes, editorial data journalism, and high-trust Digital Public Infrastructure (Aadhaar, DigiLocker, DEPA, Bhashini), combined with `ui-ux-pro-max` scannable data hierarchy guidelines.

### Core Surfaces (Warm Gazette Light Mode — Default)
| Token | Hex | Usage |
| :--- | :--- | :--- |
| `--bg-parchment` | `#EFECE3` | Primary application background (warm gazette paper) |
| `--bg-stone` | `#E3DEC9` | Secondary card surface, knowledge graph panels, subtle containers |
| `--bg-surface-elevated` | `#F7F5EE` | Elevated modals, citizen credential cards, input surfaces |
| `--border-hairline` | `#CEC7B4` | Editorial hairline dividers (`1px solid`), table borders |
| `--border-strong` | `#131B2E` | Top accent bars and high-contrast structural rules |

### Sovereign Dark Surfaces (Command & Contrast Panels)
| Token | Hex | Usage |
| :--- | :--- | :--- |
| `--bg-navy-deep` | `#131B2E` | Primary dark contrast cards (Macro KPIs, DPDP ZKP Vault, Jevify Readout Telemetry, Backend Stack, Daemon View) |
| `--bg-navy-surface` | `#1B253B` | Elevated dark cards, code/rule blocks, terminal logs |

### Semantic & Pillar Accents
| Token | Hex | Pillar / Semantic Meaning |
| :--- | :--- | :--- |
| `--accent-terracotta` | `#C85A32` | **Primary Brand & Pillar 03 (Bhashini Voice / Action):** Outbound IVR cards, primary CTAs, Hindi Devanagari script (`जन-सेतु`), live voice indicators |
| `--accent-forest` | `#2C4A3E` | **Pillar 01 (Policy Knowledge Graph & Global Benchmark):** Gazette ingestion, boolean rule verified badges, eligible status |
| `--accent-ochre` | `#C59B38` | **Stage 04 (DBT Dispatch & Coverage Expansion):** PFMS credit triggers, warning/human-in-the-loop review badges |
| `--text-primary` | `#131B2E` | Primary editorial ink for headings and body copy |
| `--text-secondary` | `#4A505C` | Muted editorial slate for captions and secondary explanations |
| `--text-mono` | `#6E6A5F` | Technical metadata, clause citations, DEPA artefact IDs |

---

## 2. Typography System

- **Editorial Display Serif (`Instrument Serif` / `Newsreader`):**
  - Used for page headers, hero statements, macro numbers (`₹3.5+ Trn`, `Up to 40%`, `90s`), and italicized emphasis (*"Policy Finds People"*, *"built and demoed"*).
- **Primary UI Sans (`Plus Jakarta Sans` + `Noto Sans Devanagari` + `Noto Sans Kannada`):**
  - Clean, high-legibility geometric sans for dense tables, citizen profiles, and multilingual vernacular rendering (`जन-सेतु`, `ಜನ-ಸೇತು`, Hindi, Kannada, Tamil, Marathi).
- **Technical Monospace (`JetBrains Mono`):**
  - Used for section kickers (`STAGE 01 — POLICY INGESTION ENGINE`), boolean eligibility ASTs (`IF (Land_Holding < 2 Ha AND State = "KA") -> PM-KUSUM_Tier_1`), ZKP hashes, DEPA consent tokens, and `x_jevify` readout telemetry.

---

## 3. AI Subsystem UI Patterns (SIWC & Jevify)

1. **OpenAI Sign in with ChatGPT (SIWC) Component:**
   - Follows OpenAI SIWC UI/UX guidelines (`https://developers.openai.com/siwc`): clean OAuth 2.0 + PKCE (`S256`) authentication card showing partner emblem (`Jan-Setu DPI`), ChatGPT logo badge, user plan tier (`ChatGPT Plus / Pro / Gov Enterprise`), eligible model routing (`gpt-4o`, `o3-mini`), and instant session revocation.
2. **Jevify (`jevify` / JEV AI) Single-Pass Typed Readout Cards:**
   - Displays warmed state token count (`cached_tokens`), single-pass next-token logprob distributions for typed questions (`choice`, `score`, `noul`), readout rung badge (`named_token_logprobs`), median latency (`8–32 ms`), and cryptographic recipe hash (`x_jevify.recipe_hash`).

---

## 4. Layout & Structural Rules

1. **Top Accent Rule Cards:** Every architectural stage and pillar card features a `3px` top border coded by domain (`#2C4A3E` Forest for Policy KG, `#131B2E` Navy for DEPA/ZKP Consent, `#C85A32` Terracotta for Bhashini Voice, `#C59B38` Ochre for DBT Dispatch).
2. **Editorial Header Bar:** Top horizontal rule with left-aligned project identifier (`JAN-SETU AI • जन-सेतु`) and right-aligned track/stage indicator (`TRACK 1 — DPI & GOVERNANCE`).
3. **Deterministic Chain of Entitlement:** Every matched scheme card must expose an expandable, human-auditable boolean trace citing the exact Gazette Notification ID, Section, and Clause alongside the Zero-Knowledge Proof verification badge.
4. **Accessibility & Touch Targets:** Minimum `44x44px` interactive targets, `4.5:1+` contrast ratio across all parchment, navy, forest, and terracotta surfaces, tabular numerals (`font-variant-numeric: tabular-nums`) on all financial and demographic metrics, and zero emoji icons (strictly crisp SVG icons).