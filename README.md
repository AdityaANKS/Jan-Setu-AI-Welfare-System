# Jan-Setu AI (जन-सेतु)

Jan-Setu AI is a proactive welfare delivery system built for the India Stack. Instead of making rural citizens hunt down government notifications, visit a Common Service Centre (CSC), and pay middlemen to fill out forms, the system flips the flow: **policy finds the citizen**.

---

## The problem we're solving

India already has the core digital rails (Aadhaar, DigiLocker, DEPA, Bhashini, PFMS) and moves trillions of rupees across 1,200+ central and state welfare schemes. Still, roughly 35-40% of eligible households miss out on benefits budgeted for them simply because applying is reactive. A smallholder farmer in Mandya or Varanasi rarely reads a 40-page state gazette PDF, and a single spelling mismatch between an e-Shram card and a land record can stall an application for weeks.

Cities like Shanghai and Shenzhen tackled this a few years ago with their *"Policy Finds People" (政策找人)* model, where the state checks eligibility in the background and sends a simple message: *"You qualify for this grant. Reply YES to claim it."*

Jan-Setu AI implements that workflow on India Stack protocols while keeping two strict rules:
1. **No raw PII stockpiling:** Demographic checks use MeitY DEPA consent tokens and zero-knowledge predicates (`Is land < 2.0 Ha?`) rather than copying bank statements into a central database.
2. **No LLM hallucinations on public money:** Language models are only used to parse gazette text into an Abstract Syntax Tree (AST) and to understand spoken citizen replies. Actual eligibility scoring is 100% deterministic and tied to exact gazette clause numbers.

---

## How the 4-stage pipeline works

```text
[ Gazette PDF / Notification ]
              │
              ▼
1. Policy Ingestion (GraphRAG AST + Jevify + OpenAI SIWC)
   Extracts strict boolean rules from legal text:
   IF (State == "KA" AND Occupation == "Farmer" AND Land < 2.0 Ha
       AND Income < ₹2.5L AND KCC == true) -> Eligible
              │
              ▼
2. Demographic Matching (MeitY DEPA + Zero-Knowledge Proofs)
   Evaluates yes/no predicates across the citizen pool without storing raw PII.
   In our 100-profile Karnataka test cohort, 18 farmers match automatically
   and 7 borderline cases get routed to a local Panchayat officer queue.
              │
              ▼
3. Outbound Voice Call (AI4Bharat Bhashini)
   Places an outbound IVR call or WhatsApp voice note in Hindi, Kannada,
   Bhojpuri, Marathi, Tamil, or English:
   "Namaste Ramesh-ji, you are pre-approved for ₹15,000 under PM-KUSUM.
    Say 'Haan, manzoor hai' or enter your OTP to submit via DigiLocker."
              │
              ▼
4. 1-Click DBT & Token Revocation (PFMS + DigiLocker VCs)
   Attaches DigiLocker Verifiable Credentials, dispatches the PFMS Direct
   Benefit Transfer (audit ref PID-777), and immediately revokes the single-use
   DEPA consent token.
```

### Key technical pieces

* **Deterministic Rule Engine (`backend/engine/matcher.py`):** Evaluates citizen attributes against statutory rules and outputs a full Chain of Entitlement trace (gazette ID, section, clause, and ZKP commitment hash).
* **Single-Pass Typed Readouts ([Jevify](https://github.com/fidecastro/jevify)):** Used in Stage 1 (policy classification) and Stage 3 (voice consent NLU). Reads `choice`, `score`, and `noul` (yes/no probability) in a single pass with a strict negation guard so responses like *"Haan, par abhi mat bhejo"* ("Yes, but don't send it right now") are caught as refusals and never trigger a payout.
* **Tier 03 Panchayat HITL Queue:** Rural records often lag behind reality (for example, an unpartitioned joint-family land plot showing 2.06 Ha on Bhoomi RTC, or a Kisan Credit Card renewal waiting on bank sync). Instead of silently rejecting borderline citizens, the system routes those 7 edge cases to a Panchayat Development Officer (PDO) dashboard for manual verification and signed paper-trail override.
* **Sign in with ChatGPT ([OpenAI SIWC](https://developers.openai.com/siwc)):** OAuth 2.0 + PKCE (`S256`) broker that lets policy analysts connect their ChatGPT workspace for Stage 1 gazette parsing while keeping citizen matching air-gapped.

---

## Running locally

### Quick start on Windows (PowerShell)
From the root folder:
```powershell
.\start-jansetu.ps1
```
This starts the FastAPI backend on `http://127.0.0.1:8000` and the Vite React frontend on `http://localhost:5173`.

### Manual setup

**1. Backend (`http://127.0.0.1:8000`)**
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

**2. Frontend (`http://localhost:5173`)**
```bash
cd frontend
npm install
npm run dev
```

**3. Run tests**
```bash
# Backend pytest suite (14 end-to-end tests)
python -m pytest backend/tests/test_api.py -v

# Frontend static engine test suite
cd frontend && npm test
```

### Docker
```bash
docker-compose up --build
```

---

## Is this project ready to push to Netlify?

**Yes, it is ready to deploy on Netlify right out of the box.**

Here is how it is set up so you don't run into broken API calls on static hosting:
1. **`netlify.toml` is pre-configured at the repo root:** Netlify automatically uses `base = "frontend"`, runs `npm run build`, publishes `frontend/dist`, and applies SPA routing (`/* -> /index.html`).
2. **Built-in browser fallback engine (`frontend/src/offlineFallback.js`):** Netlify hosts static frontend builds, not a persistent Python `uvicorn` process. When deployed on `*.netlify.app` without an external Python backend URL, `frontend/src/api.js` routes requests directly to the in-browser deterministic engine (backed by `sessionStorage` so your DBT dispatches and Panchayat HITL overrides persist across page refreshes). All 15 schemes, all 200 citizens (including the 18/100 Karnataka cohort matches and 7 HITL cases), PDF/text gazette parsing, Bhashini voice prompts, Jevify readouts, and PFMS `PID-777` receipts work on the live Netlify URL with zero console errors.
3. **Optional live Python backend:** If you also host `backend/` on Render, Railway, or Fly.io later, set `VITE_API_BASE=https://your-backend.onrender.com/api/v1` in Netlify's environment variables and the frontend will use your live FastAPI server first.

### Git remote & push commands
```bash
git remote add origin https://github.com/AdityaANKS/Jan-Setu-AI-Welfare-System.git
git branch -M main
git push -u origin main
```

---

## Repository structure

```text
├── backend/
│   ├── main.py                     # FastAPI app (health, schemes, ingest, upload-pdf, match, voice, dbt, hitl)
│   ├── data/
│   │   ├── schemes.json            # 15 Central & State schemes with boolean rules and 6-language voice scripts
│   │   └── citizens_generator.py   # Deterministic 200-citizen dataset (100 KA cohort + 7 HITL edge cases)
│   ├── engine/
│   │   └── matcher.py              # Deterministic rule evaluator, ZKP commitments, DEPA & PFMS receipts
│   ├── ai_engine/
│   │   ├── jevify_adapter.py       # Single-pass typed readout (choice, score, noul + negation guard)
│   │   └── siwc_auth.py            # OpenAI Sign in with ChatGPT (OAuth 2.0 + PKCE S256) broker
│   └── tests/
│       └── test_api.py             # Backend pytest suite
├── frontend/
│   └── src/
│       ├── components/             # PipelineStudio, KnowledgeGraphView, CitizenDashboard, AdminPanchayatView, Deck
│       ├── api.js                  # API client (auto-switches between FastAPI on localhost/VITE_API_BASE and static mode)
│       ├── offlineFallback.js      # In-browser deterministic engine with sessionStorage persistence for Netlify
│       └── offlineFallback.test.js # Node test suite for the static Netlify engine
├── design-system/
│   └── MASTER.md                   # Sovereign Gazette color palette, typography, and layout tokens
├── specs/
│   └── india_stack_depa_digilocker.yaml  # OpenAPI 3.1 specification for DEPA / DigiLocker / PFMS endpoints
└── netlify.toml                    # Netlify build settings and SPA redirect rules
```
