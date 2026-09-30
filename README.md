# Jan-Setu AI (जन-सेतु • ಜನ-ಸೇತು)

Proactive welfare delivery built on top of the India Stack.

---

## Why we built this

India has incredible public digital rails right now — Aadhaar, UPI, DigiLocker, DEPA, Bhashini, PFMS. We move trillions of rupees every year across more than 1,200 central and state welfare schemes.

Yet the actual last-mile experience for a farmer or daily-wage worker hasn't changed much: **welfare is still reactive**. You have to know a scheme exists, figure out if a 40-page government gazette applies to you, travel to a Common Service Centre (CSC), pay a middleman to fill out forms, and wait weeks hoping a clerk doesn't reject your application over a spelling mismatch between two portals. Because of that friction, roughly 35–40% of eligible households never end up receiving money that was already budgeted for them.

Cities like Shanghai and Shenzhen solved a similar problem a few years ago by flipping the model under their *"Policy Finds People" (政策找人)* program — instead of waiting for citizens to apply, the system checks eligibility in the background and messages the citizen: *"You qualify for this grant. Reply YES to receive it."*

**Jan-Setu AI** brings that exact idea to the India Stack, without sacrificing privacy or letting an LLM hallucinate who gets public money.

---

## How it works (in plain English)

We split the system into four stages so that **AI only handles language and document parsing**, while **actual eligibility and money movement stay 100% deterministic**:

```text
[ Government Gazette PDF / Notification ]
                   │
                   ▼
1. Policy Parser (GraphRAG AST + Jevify + OpenAI SIWC)
   Turns dense legal clauses into strict boolean rules:
   IF (State == "KA" AND Occupation == "Farmer" AND Land < 2.0 Ha
       AND Income < ₹2.5L AND KCC == true) -> Eligible
                   │
                   ▼
2. Privacy-Preserving Matchmaker (MeitY DEPA + Zero-Knowledge Proofs)
   Checks yes/no predicates ("Is income < ₹2.5L?") without storing raw
   bank statements. In our 100-citizen Karnataka test pool, 18 match
   automatically and 7 borderline cases get sent to a human officer.
                   │
                   ▼
3. Outbound Voice Call (AI4Bharat Bhashini)
   The system calls or sends a WhatsApp voice note in the citizen's own
   language (Hindi, Kannada, Bhojpuri, Marathi, Tamil, or English):
   "Namaste Ramesh-ji, you're pre-approved for ₹15,000 under PM-KUSUM.
    Say 'Haan, manzoor hai' or press 1 to submit via DigiLocker."
                   │
                   ▼
4. Instant DBT & Token Revocation (PFMS + DigiLocker VCs)
   Attaches the required DigiLocker credentials, logs the PFMS transfer
   receipt (PID-777), and immediately revokes the temporary DEPA token.
```

### A note on where we use AI (and where we don't)

A common mistake in AI-for-governance projects is asking a language model *"Is this person eligible?"* That's dangerous — LLMs hallucinate, and you can't audit a black-box prompt when public funds are involved.

Here is how we keep it safe:
- **No black-box eligibility scoring:** Every yes/no eligibility check runs through a deterministic rule evaluator (`backend/engine/matcher.py`) backed by exact gazette clause citations.
- **Single-pass typed readouts ([Jevify](https://github.com/fidecastro/jevify)):** When we classify a gazette clause or check whether a citizen's spoken reply in Hindi/Kannada is an approval or a refusal, we use a `jevify`-style single-pass readout (`choice`, `score`, `noul` yes/no probability) with a strict negation-flip guard — so *"Haan, par abhi mat bhejo"* ("Yes, but don't send it right now") is caught as a refusal and never triggers a payout.
- **Human-in-the-loop (Tier 03 Panchayat Queue):** Real rural data is messy. A farmer might have 2.06 hectares on paper because a joint-family plot hasn't been partitioned yet, or a Kisan Credit Card renewal hasn't synced from the local rural bank. Instead of silently rejecting them, Jan-Setu routes those 7 edge cases to a local Panchayat Development Officer (PDO) dashboard so a human can verify the paper record and sign an override.
- **Sign in with ChatGPT ([OpenAI SIWC](https://developers.openai.com/siwc)):** Policy analysts can link their ChatGPT workspace via OAuth 2.0 + PKCE (`S256`) for drafting and parsing new gazette notifications, while citizen matching stays strictly air-gapped from generative overrides.

---

## Running it locally

### Fastest way (Windows PowerShell)
From the project root, run:
```powershell
.\start-jansetu.ps1
```
This spins up both the FastAPI backend on port `8000` and the Vite React frontend on port `5173`.

### Manual setup (Backend + Frontend)

**1. Start the Python backend (`http://127.0.0.1:8000`)**
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

**2. Start the React frontend (`http://localhost:5173`)**
```bash
cd frontend
npm install
npm run dev
```

**3. Run the backend test suite**
```bash
python -m pytest backend/tests/test_api.py -v
```

### Docker
If you prefer containers:
```bash
docker-compose up --build
```

---

## Deploying to Netlify

Yes — this repository is set up so you can push it straight to GitHub and deploy on **Netlify** with zero extra configuration.

1. **Root `netlify.toml` is already configured:**
   Netlify will automatically `cd` into `frontend/`, run `npm run build`, publish `frontend/dist`, and handle SPA routing.
2. **Built-in static fallback engine (`frontend/src/offlineFallback.js`):**
   Netlify hosts static sites and serverless functions, not a persistent Python `uvicorn` server. To make sure your live Netlify link works out-of-the-box for judges and reviewers, `frontend/src/api.js` automatically falls back to an in-browser deterministic engine whenever the Python backend isn't reachable. All 15 welfare schemes, all 200 citizen profiles (including the 18/100 Karnataka cohort matches and 7 Panchayat HITL cases), Bhashini voice synthesis, Jevify readouts, and PFMS DBT receipts work directly in the browser on Netlify.
3. **Connecting a live Python backend later (optional):**
   If you also deploy `backend/` on Render, Railway, or Fly.io, just add an environment variable in your Netlify dashboard:
   ```text
   VITE_API_BASE = https://your-backend-url.onrender.com/api/v1
   ```
   The frontend will automatically use your live FastAPI server first and keep the browser engine as a fallback.

---

## Project layout

```text
├── backend/
│   ├── main.py                     # FastAPI endpoints (health, schemes, ingest, match, voice, dbt, hitl)
│   ├── data/
│   │   ├── schemes.json            # 15 Central & State schemes with boolean rules & 6-language scripts
│   │   └── citizens_generator.py   # Deterministic 200-citizen dataset (100 KA cohort + 7 HITL cases)
│   ├── engine/
│   │   └── matcher.py              # Boolean rule evaluator, ZKP commitment hashes, DEPA & PFMS logic
│   ├── ai_engine/
│   │   ├── jevify_adapter.py       # Single-pass typed readout (choice, score, noul + negation guard)
│   │   └── siwc_auth.py            # OpenAI Sign in with ChatGPT (OAuth 2.0 + PKCE S256) broker
│   └── tests/
│       └── test_api.py             # End-to-end pytest suite
├── frontend/
│   └── src/
│       ├── components/             # 5 main views: Pipeline Studio, KG & Jevify, Citizen, Admin, Deck
│       ├── api.js                  # API client with automatic Netlify static fallback
│       └── offlineFallback.js      # In-browser deterministic engine for static hosting
├── design-system/
│   └── MASTER.md                   # "Sovereign Gazette" color, typography, and layout tokens
├── specs/
│   └── india_stack_depa_digilocker.yaml  # OpenAPI 3.1 spec for the DEPA / DigiLocker flows
└── netlify.toml                    # One-click Netlify build & SPA redirect config
```
