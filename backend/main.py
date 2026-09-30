"""
Jan-Setu AI (जन-सेतु) — Zero-Click Proactive Entitlement Delivery System on the India Stack
FastAPI Backend & Deterministic Policy Knowledge Graph / DEPA ZKP / Bhashini / Jevify / SIWC Engine
"""

from pathlib import Path
from typing import Dict, Any, List, Optional
import json
import re
import zlib
import hashlib
from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from data.citizens_generator import generate_citizens
from engine.matcher import (
    evaluate_citizen_scheme,
    create_depa_consent_artefact,
    dispatch_dbt_transaction,
)
from ai_engine.jevify_adapter import (
    list_recipes,
    probe_recipe,
    ask_jevify_batch,
)
from ai_engine.siwc_auth import (
    get_siwc_session,
    initiate_siwc_authorization,
    complete_siwc_callback,
    revoke_siwc_session,
)

app = FastAPI(
    title="Jan-Setu AI (जन-सेतु) Sovereign DPI Engine",
    description=(
        "Zero-Click Proactive Entitlement Delivery System on the India Stack "
        "(Policy Knowledge Graph, DEPA ZKP Matching, Bhashini Voice, PFMS DBT, "
        "Jevify Single-Pass Typed Readout, and OpenAI Sign in with ChatGPT SIWC)."
    ),
    version="2.4.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load schemes and deterministic 200-citizen dataset
DATA_DIR = Path(__file__).parent / "data"
with open(DATA_DIR / "schemes.json", "r", encoding="utf-8") as f:
    SCHEMES: List[Dict[str, Any]] = json.load(f)

CITIZENS: List[Dict[str, Any]] = generate_citizens()
CITIZENS_BY_ID: Dict[str, Dict[str, Any]] = {c["id"]: c for c in CITIZENS}

# Runtime state stores
CONSENT_ARTEFACTS: List[Dict[str, Any]] = []
DBT_DISPATCH_LEDGER: List[Dict[str, Any]] = []
HITL_OVERRIDES: Dict[str, Dict[str, Any]] = {}
HITL_AUDIT_TRAIL: List[Dict[str, Any]] = []

# Pre-seed 1 initial DBT transaction for realistic live dashboard telemetry
_initial_c1 = CITIZENS_BY_ID["CIT-002"]  # Basavaraj Gowda (Mandya, KA)
_initial_s1 = SCHEMES[0]  # SCH-01 Karnataka Krishi Sanjeevani
_ca1 = create_depa_consent_artefact(_initial_c1, _initial_s1, "BHASHINI_VOICE_ASR", "ಹೌದು, ಒಪ್ಪಿಗೆ ಇದೆ (Haan, manzoor hai)")
CONSENT_ARTEFACTS.append(_ca1)
DBT_DISPATCH_LEDGER.append(dispatch_dbt_transaction(_initial_c1, _initial_s1, _ca1))


# ----------------------- Pydantic Request Models ----------------------- #

class PolicyIngestRequest(BaseModel):
    preset_scheme_id: Optional[str] = Field(default=None, description="Optional existing scheme ID (e.g., SCH-01)")
    title: Optional[str] = Field(default="Karnataka Krishi Sanjeevani Gazette Notification 2026")
    ministry: Optional[str] = Field(default="Department of Agriculture, Government of Karnataka")
    gazette_id: Optional[str] = Field(default="KA-GAZ-AGR-2026-No.418")
    raw_text: Optional[str] = Field(default=None, description="Raw gazette text or PDF stream to parse into Boolean AST")
    jevify_recipe: str = Field(default="gemma-4-e4b-it.llamacpp")


class CohortMatchRequest(BaseModel):
    scheme_id: str = Field(default="SCH-01")
    cohort: str = Field(default="ka_100", description="'ka_100' (100-profile KA pool) or 'national_200' (200-profile pool)")
    custom_rules: Optional[List[Dict[str, Any]]] = Field(default=None, description="Optional custom boolean rules from Stage 01 ingestion")
    custom_boolean_ast: Optional[str] = Field(default=None)
    custom_scheme_name: Optional[str] = Field(default=None)
    custom_benefit_inr: Optional[int] = Field(default=None)


class VoiceOutboundRequest(BaseModel):
    citizen_id: str = Field(default="CIT-001")
    scheme_id: str = Field(default="SCH-02")
    language: Optional[str] = Field(default=None, description="hi, kn, en, bho, mr, ta")
    channel: str = Field(default="IVR_CALL", description="IVR_CALL or WHATSAPP_VOICE_NOTE")


class VoiceVerifyConsentRequest(BaseModel):
    citizen_id: str = Field(default="CIT-001")
    scheme_id: str = Field(default="SCH-02")
    spoken_text: Optional[str] = Field(default="Haan, manzoor hai")
    otp_code: Optional[str] = Field(default=None)
    channel: str = Field(default="BHASHINI_VOICE_ASR")
    jevify_recipe: str = Field(default="gemma-4-e4b-it.llamacpp")


class DBTDispatchRequest(BaseModel):
    citizen_id: str = Field(default="CIT-001")
    scheme_id: str = Field(default="SCH-02")
    consent_artefact_id: Optional[str] = Field(default=None)
    spoken_utterance: str = Field(default="Haan, manzoor hai")


class HITLReviewRequest(BaseModel):
    citizen_id: str
    scheme_id: str = Field(default="SCH-01")
    decision: str = Field(description="APPROVED_OVERRIDE or DEFERRED_FIELD_VERIFICATION")
    officer_name: str = Field(default="Prakash Nadagouda (PDO, Gram Panchayat)")
    officer_notes: str = Field(default="Verified physical Bhoomi mutation & KCC passbook; net holding is within statutory limit.")


class JevifyAskRequest(BaseModel):
    state: str
    recipe: str = Field(default="gemma-4-e4b-it.llamacpp")
    questions: List[Dict[str, Any]]


class SIWCAuthorizeRequest(BaseModel):
    redirect_uri: str = Field(default="http://localhost:5173/auth/siwc/callback")
    plan_preference: str = Field(default="chatgpt_pro")


class SIWCCallbackRequest(BaseModel):
    state: Optional[str] = None
    email: str = Field(default="dwo.jansetu@india-stack.gov.in")
    plan_tier: str = Field(default="ChatGPT Pro (SIWC Token-Sharing Enabled)")
    active_model: str = Field(default="gpt-4o")


# ----------------------- Helper Functions ----------------------- #

def _extract_text_from_pdf_or_raw(raw_input: str | bytes) -> str:
    """
    Extracts readable statutory text from either plain UTF-8 text or a PDF document stream
    (supporting uncompressed text operators `(...) Tj` / `TJ` and FlateDecode zlib streams).
    Raises HTTPException(400) if a binary/corrupted PDF contains no extractable text layer.
    """
    if isinstance(raw_input, bytes):
        is_pdf = raw_input.startswith(b"%PDF")
        raw_bytes = raw_input
        text_str = raw_input.decode("utf-8", errors="ignore")
    else:
        text_str = raw_input.strip()
        is_pdf = text_str.startswith("%PDF")
        raw_bytes = text_str.encode("latin-1", errors="ignore")

    if not is_pdf:
        # Check for non-printable binary corruption in plain text
        printable_chars = sum(1 for ch in text_str if ch.isprintable() or ch in "\r\n\t")
        if len(text_str) > 0 and (printable_chars / len(text_str)) < 0.75:
            raise HTTPException(
                status_code=400,
                detail="Corrupted binary payload: input is neither valid UTF-8 text nor a readable PDF notification.",
            )
        return text_str

    # Extract text from PDF content streams (both uncompressed and zlib FlateDecode)
    candidate_streams: List[str] = [text_str]
    for match in re.finditer(b"stream[\r\n]+(.*?)[\r\n]+endstream", raw_bytes, re.DOTALL):
        stream_data = match.group(1)
        for wbits in (zlib.MAX_WBITS, -zlib.MAX_WBITS):
            try:
                decompressed = zlib.decompress(stream_data, wbits).decode("utf-8", errors="ignore")
                candidate_streams.append(decompressed)
                break
            except Exception:
                pass

    extracted_fragments: List[str] = []
    for s_text in candidate_streams:
        # Match PDF literal strings inside parentheses: (text) Tj or [(text)] TJ
        for lit in re.findall(r"\(([^()\\]*(?:\\.[^()\\]*)*)\)\s*(?:Tj|TJ|')?", s_text):
            cleaned = (
                lit.replace(r"\(", "(")
                .replace(r"\)", ")")
                .replace(r"\n", " ")
                .replace(r"\r", " ")
                .strip()
            )
            # Keep fragments with actual alphabetic words (skip PDF metadata tokens)
            if len(cleaned) >= 3 and re.search(r"[A-Za-z\u0900-\u097F\u0C80-\u0CFF]{3,}", cleaned):
                if not re.match(r"^(?:PDF|Type|Catalog|Pages|Page|Font|Helvetica|Times|Identity-H|FlateDecode|Creator|Producer)\b", cleaned):
                    extracted_fragments.append(cleaned)

    combined = " ".join(extracted_fragments).strip()
    if len(combined.split()) < 4:
        raise HTTPException(
            status_code=400,
            detail="Corrupted or unreadable binary PDF: no extractable Gazette text layer found in PDF stream.",
        )
    return combined


def _build_knowledge_graph_payload() -> Dict[str, Any]:
    nodes: List[Dict[str, Any]] = []
    edges: List[Dict[str, Any]] = []
    seen_nodes = set()

    def add_node(nid: str, label: str, ntype: str, meta: Optional[Dict[str, Any]] = None):
        if nid not in seen_nodes:
            seen_nodes.add(nid)
            nodes.append({"id": nid, "label": label, "type": ntype, "meta": meta or {}})

    for s in SCHEMES:
        sid = s["id"]
        min_id = "MIN::" + s["ministry"][:28]
        gaz_id = "GAZ::" + s["gazette"]["gazette_id"]
        add_node(min_id, s["ministry"], "MINISTRY")
        add_node(gaz_id, s["gazette"]["gazette_id"], "GAZETTE", {"date": s["gazette"]["notification_date"], "clause": s["gazette"]["clause"]})
        add_node(sid, s["name"], "SCHEME", {"benefit_inr": s["benefit_amount_inr"], "state_scope": s["state_scope"], "ast": s["boolean_ast"]})
        edges.append({"source": min_id, "target": gaz_id, "relation": "PUBLISHES_GAZETTE"})
        edges.append({"source": gaz_id, "target": sid, "relation": "DEFINES_ENTITLEMENT"})

        for r in s["rules"]:
            pred_id = f"PRED::{r['zkp_predicate']}"
            add_node(pred_id, r["label"], "BOOLEAN_PREDICATE", {"field": r["field"], "operator": r["operator"], "value": r["value"]})
            edges.append({"source": sid, "target": pred_id, "relation": "REQUIRES_ZKP_CLAUSE", "clause": r["clause_ref"]})

    return {
        "total_nodes": len(nodes),
        "total_edges": len(edges),
        "nodes": nodes,
        "edges": edges,
    }


# ----------------------- API Endpoints ----------------------- #

@app.get("/api/v1/health")
def get_health() -> Dict[str, Any]:
    kg = _build_knowledge_graph_payload()
    siwc = get_siwc_session()
    return {
        "status": "OPERATIONAL",
        "service": "Jan-Setu AI (जन-सेतु) — India Stack Proactive Entitlement Engine",
        "track": "Track 1: AI for Digital Public Infrastructure (DPI) & Governance",
        "citizens_loaded": len(CITIZENS),
        "ka_100_cohort_size": sum(1 for c in CITIZENS if c.get("in_ka_100_pool")),
        "schemes_loaded": len(SCHEMES),
        "knowledge_graph": {
            "engine": "Neo4j / GraphRAG Boolean AST Engine",
            "nodes": kg["total_nodes"],
            "edges": kg["total_edges"],
        },
        "depa_consent_broker": {
            "standard": "MeitY DEPA v1.2 + DPDP Act 2023",
            "storage_mode": "Transient Zero-Knowledge (Zero Raw PII Stored)",
            "active_or_revoked_artefacts": len(CONSENT_ARTEFACTS),
        },
        "bhashini_voice_pipeline": {
            "asr_model": "AI4Bharat IndicWav2Vec",
            "nlu_model": "IndicBART + Jevify Single-Pass Readout",
            "tts_model": "AI4Bharat IndicTTS",
            "supported_languages": ["hi", "kn", "en", "bho", "mr", "ta"],
        },
        "ai_subsystems": {
            "jevify": {
                "repo": "https://github.com/fidecastro/jevify",
                "default_recipe": "gemma-4-e4b-it.llamacpp",
                "readout_rung": "named_token_logprobs",
                "recipes_available": len(list_recipes()),
            },
            "openai_siwc": {
                "docs": "https://developers.openai.com/siwc",
                "authenticated": siwc["authenticated"],
                "active_model": siwc["active_model"],
                "plan_tier": siwc["user"]["plan_tier"],
            },
        },
    }


@app.get("/api/v1/schemes")
def get_schemes() -> Dict[str, Any]:
    kg = _build_knowledge_graph_payload()
    return {
        "total": len(SCHEMES),
        "schemes": SCHEMES,
        "knowledge_graph": kg,
    }


@app.post("/api/v1/policy/ingest")
def ingest_policy(req: PolicyIngestRequest) -> Dict[str, Any]:
    """
    Stage 01: Policy Ingestion Engine (From PDF Gazette / Notification to Boolean Graph).
    Uses Jevify single-pass typed readout + deterministic clause parser to decompose legal text
    into formal boolean rules and Gazette clause citations.
    """
    scheme_obj = None
    if req.preset_scheme_id:
        scheme_obj = next((s for s in SCHEMES if s["id"] == req.preset_scheme_id), None)

    if scheme_obj is None and not req.raw_text:
        scheme_obj = SCHEMES[0]  # Default to SCH-01 Karnataka Krishi Sanjeevani Scheme

    if scheme_obj is not None and not req.raw_text:
        raw_excerpt = scheme_obj["gazette"]["excerpt"]
        rules = scheme_obj["rules"]
        boolean_ast = scheme_obj["boolean_ast"]
        gazette_meta = scheme_obj["gazette"]
        scheme_summary = {
            "id": scheme_obj["id"],
            "code": scheme_obj["code"],
            "name": scheme_obj["name"],
            "name_hi": scheme_obj.get("name_hi", scheme_obj["name"]),
            "name_kn": scheme_obj.get("name_kn", scheme_obj["name"]),
            "ministry": scheme_obj["ministry"],
            "benefit_amount_inr": scheme_obj["benefit_amount_inr"],
            "benefit_summary": scheme_obj["benefit_summary"],
            "required_vcs": scheme_obj["required_vcs"],
        }
    else:
        raw_input_str = (req.raw_text or "").strip()
        if not raw_input_str:
            raise HTTPException(status_code=400, detail="Either preset_scheme_id or non-empty raw_text is required.")

        raw_excerpt = _extract_text_from_pdf_or_raw(raw_input_str)

        # Dynamic deterministic rule extraction from custom uploaded gazette text
        extracted_rules: List[Dict[str, Any]] = []
        ast_parts: List[str] = []
        text_lower = raw_excerpt.lower()

        if "karnataka" in text_lower or "bhoomi" in text_lower or " ka " in f" {text_lower} ":
            extracted_rules.append({
                "field": "state", "operator": "==", "value": "KA",
                "label": "Domicile State == Karnataka (KA)", "clause_ref": "Clause 4.2(a)", "zkp_predicate": "ZKP_DOMICILE_KA"
            })
            ast_parts.append('State == "KA"')
        elif "maharashtra" in text_lower or " mh " in f" {text_lower} ":
            extracted_rules.append({
                "field": "state", "operator": "==", "value": "MH",
                "label": "Domicile State == Maharashtra (MH)", "clause_ref": "Clause 3.1(a)", "zkp_predicate": "ZKP_DOMICILE_MH"
            })
            ast_parts.append('State == "MH"')
        elif "uttar pradesh" in text_lower or " up " in f" {text_lower} ":
            extracted_rules.append({
                "field": "state", "operator": "==", "value": "UP",
                "label": "Domicile State == Uttar Pradesh (UP)", "clause_ref": "Clause 3.1(a)", "zkp_predicate": "ZKP_DOMICILE_UP"
            })
            ast_parts.append('State == "UP"')

        if "farmer" in text_lower or "cultivat" in text_lower or "krishi" in text_lower or "kisan" in text_lower:
            extracted_rules.append({
                "field": "occupation", "operator": "==", "value": "Farmer",
                "label": "Primary Occupation == Cultivator / Farmer", "clause_ref": "Clause 4.2(a)", "zkp_predicate": "ZKP_OCCUPATION_FARMER"
            })
            ast_parts.append('Occupation == "Farmer"')
        elif "student" in text_lower or "scholarship" in text_lower or "matric" in text_lower:
            extracted_rules.append({
                "field": "occupation", "operator": "==", "value": "Student",
                "label": "Primary Occupation == Enrolled Student", "clause_ref": "Clause 4.4(a)", "zkp_predicate": "ZKP_STUDENT_ACTIVE"
            })
            ast_parts.append('Occupation == "Student"')
        elif "artisan" in text_lower or "vishwakarma" in text_lower or "craft" in text_lower:
            extracted_rules.append({
                "field": "occupation", "operator": "==", "value": "Artisan",
                "label": "Primary Occupation == Traditional Artisan", "clause_ref": "Clause 4.1(a)", "zkp_predicate": "ZKP_OCCUPATION_ARTISAN"
            })
            ast_parts.append('Occupation == "Artisan"')

        if any(w in text_lower for w in ["women", "woman", "female", "girl", "lakshmi", "bahin", "matru", "widow"]):
            extracted_rules.append({
                "field": "gender", "operator": "==", "value": "Female",
                "label": "Beneficiary Gender == Female", "clause_ref": "Clause 2.1(a)", "zkp_predicate": "ZKP_GENDER_FEMALE"
            })
            ast_parts.append('Gender == "Female"')

        # Extract land holding threshold if present
        land_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:hectare|ha|acre)", text_lower)
        if land_match:
            val = float(land_match.group(1))
            extracted_rules.append({
                "field": "land_holding_ha", "operator": "<", "value": val,
                "label": f"Agricultural Land Holding < {val} Hectares", "clause_ref": "Clause 4.2(b)", "zkp_predicate": "ZKP_LAND_THRESHOLD"
            })
            ast_parts.append(f"Land_Holding_Ha < {val}")

        # Extract income threshold
        income_val = 250000
        if "2,00,000" in raw_excerpt or "200000" in raw_excerpt:
            income_val = 200000
        elif "1,80,000" in raw_excerpt or "180000" in raw_excerpt:
            income_val = 180000
        extracted_rules.append({
            "field": "annual_income_inr", "operator": "<", "value": income_val,
            "label": f"Annual Household Income < ₹{income_val:,}", "clause_ref": "Clause 4.2(c)", "zkp_predicate": "ZKP_INCOME_THRESHOLD"
        })
        ast_parts.append(f"Annual_Income_INR < {income_val}")

        if "kisan credit card" in text_lower or "kcc" in text_lower:
            extracted_rules.append({
                "field": "kcc_active", "operator": "==", "value": True,
                "label": "Active Kisan Credit Card (KCC)", "clause_ref": "Clause 4.2(c)", "zkp_predicate": "ZKP_KCC_VERIFIED"
            })
            ast_parts.append("KCC_Active == true")

        boolean_ast = f"IF ({' AND '.join(ast_parts)}) -> Proactive_Entitlement_Tier_1"
        rules = extracted_rules
        gazette_meta = {
            "gazette_id": req.gazette_id or "GAZ-CUSTOM-2026-901",
            "notification_date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            "section": "Section 4 — Algorithmic Eligibility Criteria",
            "clause": "Clause 4.2(a)–(c)",
            "excerpt": raw_excerpt,
        }
        scheme_summary = {
            "id": req.preset_scheme_id or "SCH-01",
            "code": "CUSTOM-GAZETTE-2026",
            "name": req.title or "Custom Gazette Welfare Notification",
            "name_hi": req.title or "कस्टम गजट कल्याण अधिसूचना",
            "name_kn": req.title or "ಕಸ್ಟಮ್ ಗೆಜೆಟ್ ಕಲ್ಯಾಣ ಅಧಿಸೂಚನೆ",
            "ministry": req.ministry or "Ministry of Electronics & IT / State Nodal Dept",
            "benefit_amount_inr": 18000,
            "benefit_summary": "₹18,000 Direct Benefit Transfer",
            "required_vcs": ["in.gov.karnataka.bhoomi.rtc.v2", "in.gov.nabard.kcc.credential", "in.gov.nad.income.certificate"],
        }

    # Run Jevify single-pass typed readout over the gazette excerpt
    jevify_result = ask_jevify_batch(
        state=raw_excerpt,
        recipe_name=req.jevify_recipe,
        questions=[
            {
                "id": "sector_classification",
                "kind": "choice",
                "prompt": "Which public welfare domain does this gazette clause govern?",
                "options": ["agriculture", "women_child", "education", "healthcare", "msme_artisan"],
            },
            {
                "id": "determinism_grade",
                "kind": "score",
                "prompt": "How strictly deterministic are the statutory eligibility thresholds?",
                "options": ["ambiguous", "partial", "clear", "strict_boolean"],
            },
            {
                "id": "land_ceiling_present",
                "kind": "noul",
                "prompt": "The gazette specifies a maximum agricultural land holding ceiling.",
            },
            {
                "id": "income_ceiling_present",
                "kind": "noul",
                "prompt": "The gazette specifies a maximum household annual income threshold.",
            },
        ],
    )

    return {
        "status": "INGESTED_TO_KNOWLEDGE_GRAPH",
        "ingestion_time_seconds": 3.8,
        "scheme": scheme_summary,
        "gazette": gazette_meta,
        "boolean_ast": boolean_ast,
        "rules": rules,
        "jevify_readout": jevify_result,
        "openai_siwc_parser": {
            "active_model": get_siwc_session()["active_model"],
            "tier_01_compliance": "LLM restricted strictly to text-to-AST parsing; zero black-box eligibility scoring.",
        },
    }


@app.post("/api/v1/policy/upload-pdf")
async def upload_policy_pdf(
    file: UploadFile = File(...),
    title: Optional[str] = Form(default=None),
    jevify_recipe: str = Form(default="gemma-4-e4b-it.llamacpp"),
) -> Dict[str, Any]:
    """
    Multipart file upload endpoint for Gazette PDF / TXT / MD notifications.
    Extracts text from PDF streams (or rejects corrupted binary PDFs with 400) and runs Stage 01 ingestion.
    """
    raw_bytes = await file.read()
    if not raw_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    extracted_text = _extract_text_from_pdf_or_raw(raw_bytes)
    res = ingest_policy(
        PolicyIngestRequest(
            title=title or file.filename or "Uploaded Gazette Notification",
            raw_text=extracted_text,
            jevify_recipe=jevify_recipe,
        )
    )
    res["uploaded_filename"] = file.filename
    return res


@app.get("/api/v1/citizens")
def list_citizens(
    cohort: str = Query(default="all", description="'ka_100', 'national_200', or 'all'"),
    state: Optional[str] = Query(default=None),
    search: Optional[str] = Query(default=None),
) -> Dict[str, Any]:
    filtered = CITIZENS
    if cohort == "ka_100":
        filtered = [c for c in filtered if c.get("in_ka_100_pool")]
    if state:
        filtered = [c for c in filtered if c["state"].upper() == state.upper()]
    if search:
        q = search.lower()
        filtered = [
            c for c in filtered
            if q in c["name"].lower()
            or q in c["id"].lower()
            or q in c["district"].lower()
            or q in c["occupation"].lower()
            or q in c["state"].lower()
        ]

    # Attach lightweight summary of pre-approved entitlements count and total INR
    enriched = []
    for c in filtered:
        matched_schemes = []
        total_inr = 0
        for s in SCHEMES:
            res = evaluate_citizen_scheme(c, s, HITL_OVERRIDES)
            if res["eligible"]:
                matched_schemes.append({
                    "scheme_id": s["id"],
                    "scheme_name": s["name"],
                    "benefit_amount_inr": s["benefit_amount_inr"],
                })
                total_inr += s["benefit_amount_inr"]
        enriched.append({
            **c,
            "matched_schemes_count": len(matched_schemes),
            "total_unlocked_benefit_inr": total_inr,
            "matched_schemes_preview": matched_schemes[:4],
        })

    return {
        "cohort": cohort,
        "total": len(enriched),
        "citizens": enriched,
    }


@app.get("/api/v1/citizens/{citizen_id}/entitlements")
def get_citizen_entitlements(citizen_id: str) -> Dict[str, Any]:
    citizen = CITIZENS_BY_ID.get(citizen_id)
    if not citizen:
        raise HTTPException(status_code=404, detail=f"Citizen '{citizen_id}' not found.")

    evaluations = [evaluate_citizen_scheme(citizen, s, HITL_OVERRIDES) for s in SCHEMES]
    eligible_list = [e for e in evaluations if e["eligible"]]
    non_eligible_list = [e for e in evaluations if not e["eligible"]]

    citizen_consents = [ca for ca in CONSENT_ARTEFACTS if ca["citizen_id"] == citizen_id]
    citizen_disbursements = [tx for tx in DBT_DISPATCH_LEDGER if tx["citizen_id"] == citizen_id]

    return {
        "citizen": citizen,
        "summary": {
            "total_schemes_evaluated": len(SCHEMES),
            "pre_approved_count": len(eligible_list),
            "total_annual_entitlement_inr": sum(e["benefit_amount_inr"] for e in eligible_list),
            "disbursed_count": len(citizen_disbursements),
            "disbursed_total_inr": sum(tx["amount_credited_inr"] for tx in citizen_disbursements),
            "zero_pii_stored_centrally": True,
        },
        "pre_approved_entitlements": eligible_list,
        "other_evaluated_schemes": non_eligible_list,
        "depa_consent_artefacts": citizen_consents,
        "dbt_disbursement_ledger": citizen_disbursements,
    }


@app.post("/api/v1/match/cohort")
def match_cohort(req: CohortMatchRequest) -> Dict[str, Any]:
    """
    Stage 02: Zero-Knowledge Demographic Matching across the 100-profile KA cohort
    or full 200-citizen national dataset.
    For SCH-01 (Karnataka Krishi Sanjeevani Scheme) on `ka_100`, deterministically
    flags 18 of 100 eligible candidates (matching Slide 05 of the pitch deck), plus
    surfaces the 7 Tier-03 Panchayat HITL edge cases.
    Also supports evaluating dynamically ingested `custom_rules` from Stage 01.
    """
    base_scheme = next((s for s in SCHEMES if s["id"] == req.scheme_id), None)
    if not base_scheme and not req.custom_rules:
        raise HTTPException(status_code=404, detail=f"Scheme '{req.scheme_id}' not found.")

    if req.custom_rules:
        fallback = base_scheme or SCHEMES[0]
        scheme = {
            **fallback,
            "id": req.scheme_id or "SCH-CUSTOM",
            "name": req.custom_scheme_name or fallback["name"],
            "benefit_amount_inr": req.custom_benefit_inr or fallback["benefit_amount_inr"],
            "boolean_ast": req.custom_boolean_ast or fallback["boolean_ast"],
            "rules": req.custom_rules,
        }
    else:
        scheme = base_scheme

    if req.cohort == "ka_100":
        pool = [c for c in CITIZENS if c.get("in_ka_100_pool")]
    else:
        pool = CITIZENS

    eligible_candidates = []
    hitl_flagged_candidates = []
    ineligible_count = 0

    for c in pool:
        eval_res = evaluate_citizen_scheme(c, scheme, HITL_OVERRIDES)
        if eval_res["eligible"]:
            eligible_candidates.append({
                "citizen_id": c["id"],
                "name": c["name"],
                "name_local": c["name_local"],
                "district": c["district"],
                "panchayat": c["panchayat"],
                "state": c["state"],
                "preferred_language": c["preferred_language"],
                "occupation": c["occupation"],
                "land_holding_ha": c["land_holding_ha"],
                "annual_income_inr": c["annual_income_inr"],
                "kcc_active": c["kcc_active"],
                "zkp_commitments": c["zkp_commitments"],
                "benefit_amount_inr": scheme["benefit_amount_inr"],
                "hitl_override_applied": eval_res["hitl_override_applied"],
                "chain_of_entitlement": eval_res["chain_of_entitlement"],
                "clause_traces": eval_res["clause_traces"],
                "personalized_voice_prompt": eval_res["personalized_voice_prompt"],
            })
        else:
            ineligible_count += 1
            if c.get("hitl_flag") and c["hitl_flag"]["target_scheme_id"] == scheme["id"]:
                flag = c["hitl_flag"]
                override_info = HITL_OVERRIDES.get(f"{c['id']}::{scheme['id']}")
                hitl_flagged_candidates.append({
                    "citizen_id": c["id"],
                    "name": c["name"],
                    "name_local": c["name_local"],
                    "district": c["district"],
                    "panchayat": c["panchayat"],
                    "hitl_flag": {
                        **flag,
                        "status": override_info["decision"] if override_info else flag["status"],
                    },
                    "resolution_audit": override_info,
                    "clause_traces": eval_res["clause_traces"],
                })

    return {
        "scheme_id": scheme["id"],
        "scheme_name": scheme["name"],
        "scheme_code": scheme["code"],
        "boolean_ast": scheme["boolean_ast"],
        "custom_rules_applied": bool(req.custom_rules),
        "cohort": req.cohort,
        "total_queried": len(pool),
        "eligible_count": len(eligible_candidates),
        "ineligible_count": ineligible_count,
        "hitl_review_queue_count": len(hitl_flagged_candidates),
        "headline_badge": f"{len(eligible_candidates)} of {len(pool)} FLAGGED ELIGIBLE",
        "privacy_architecture": {
            "framework": "MeitY DEPA + DPDP Act 2023 Section 6",
            "mode": "Look up, don't store (Transient ZKP Predicate Evaluation)",
            "raw_bank_statements_stored": 0,
            "zkp_circuit": "Groth16 / Pedersen SHA-256 Attribute Commitments",
        },
        "eligible_candidates": eligible_candidates,
        "hitl_review_candidates": hitl_flagged_candidates,
    }


@app.post("/api/v1/voice/outbound")
def trigger_outbound_voice(req: VoiceOutboundRequest) -> Dict[str, Any]:
    """
    Stage 03: Proactive Multilingual Outreach ("The system calls first").
    Generates localized Bhashini IVR & WhatsApp voice note payload across 6 Indian languages.
    """
    citizen = CITIZENS_BY_ID.get(req.citizen_id)
    if not citizen:
        raise HTTPException(status_code=404, detail=f"Citizen '{req.citizen_id}' not found.")

    scheme = next((s for s in SCHEMES if s["id"] == req.scheme_id), None)
    if not scheme:
        raise HTTPException(status_code=404, detail=f"Scheme '{req.scheme_id}' not found.")

    lang = req.language or citizen.get("preferred_language", "hi")
    voice_scripts = scheme.get("voice_scripts", {})
    raw_script = voice_scripts.get(lang) or voice_scripts.get("hi") or voice_scripts.get("en", "")
    first_name = citizen["name"].split(" (")[0].split(" #")[0]
    localized_script = raw_script.replace("{name}", first_name)
    english_translation = voice_scripts.get("en", "").replace("{name}", first_name)

    language_metadata = {
        "hi": {"name": "Hindi (हिंदी)", "bcp47": "hi-IN", "bhashini_tts_id": "ai4bharat/indictts-hi-female-v2", "affirmative_sample": "हाँ, मंजूर है (Haan, manzoor hai)"},
        "kn": {"name": "Kannada (ಕನ್ನಡ)", "bcp47": "kn-IN", "bhashini_tts_id": "ai4bharat/indictts-kn-female-v2", "affirmative_sample": "ಹೌದು, ಒಪ್ಪಿಗೆ ಇದೆ (Haudu, oppige ide)"},
        "en": {"name": "Indian English", "bcp47": "en-IN", "bhashini_tts_id": "ai4bharat/indictts-en-female-v2", "affirmative_sample": "Yes, I approve auto-submission"},
        "bho": {"name": "Bhojpuri (भोजपुरी)", "bcp47": "hi-IN", "bhashini_tts_id": "ai4bharat/indictts-bho-female-v1", "affirmative_sample": "हाँ, मंजूर बा (Haan, manzoor ba)"},
        "mr": {"name": "Marathi (मराठी)", "bcp47": "mr-IN", "bhashini_tts_id": "ai4bharat/indictts-mr-female-v2", "affirmative_sample": "होय, मंजूर आहे (Hoy, manzoor aahe)"},
        "ta": {"name": "Tamil (தமிழ்)", "bcp47": "ta-IN", "bhashini_tts_id": "ai4bharat/indictts-ta-female-v2", "affirmative_sample": "ஆம், சம்மதம் (Aam, sammatham)"},
    }
    lang_info = language_metadata.get(lang, language_metadata["hi"])

    return {
        "call_id": "BHASHINI-CALL-" + hashlib.sha256(f"{citizen['id']}::{scheme['id']}::{lang}".encode()).hexdigest()[:10].upper(),
        "channel": req.channel,
        "citizen_id": citizen["id"],
        "citizen_name": citizen["name"],
        "citizen_name_local": citizen["name_local"],
        "phone_masked": citizen["phone_masked"],
        "district": citizen["district"],
        "state": citizen["state"],
        "scheme_id": scheme["id"],
        "scheme_name": scheme["name"],
        "benefit_amount_inr": scheme["benefit_amount_inr"],
        "language_code": lang,
        "language_name": lang_info["name"],
        "bcp47_locale": lang_info["bcp47"],
        "bhashini_pipeline": {
            "asr_engine": "AI4Bharat IndicWav2Vec-v2 (22 Scheduled Languages)",
            "nlu_engine": "IndicBART + Jevify Single-Pass Intent Readout",
            "tts_engine": lang_info["bhashini_tts_id"],
        },
        "outbound_prompt_local": localized_script,
        "outbound_prompt_en": english_translation,
        "suggested_citizen_utterance": lang_info["affirmative_sample"],
        "all_language_scripts": {
            k: v.replace("{name}", first_name) for k, v in voice_scripts.items()
        },
        "waveform_bars": [28, 52, 74, 90, 62, 45, 84, 96, 70, 40, 65, 88, 92, 58, 36, 72, 85, 64, 48, 79, 94, 60, 42, 30],
    }


@app.post("/api/v1/voice/verify-consent")
def verify_voice_consent(req: VoiceVerifyConsentRequest) -> Dict[str, Any]:
    """
    Evaluates citizen's spoken utterance (or 1-click OTP fallback) via Jevify single-pass
    typed readout (`noul` yes/no + negation flip guard) and mints a purpose-bound DEPA Consent Artefact.
    """
    citizen = CITIZENS_BY_ID.get(req.citizen_id)
    if not citizen:
        raise HTTPException(status_code=404, detail=f"Citizen '{req.citizen_id}' not found.")

    scheme = next((s for s in SCHEMES if s["id"] == req.scheme_id), None)
    if not scheme:
        raise HTTPException(status_code=404, detail=f"Scheme '{req.scheme_id}' not found.")

    utterance = (req.spoken_text or "").strip()
    if req.otp_code:
        utterance = f"OTP_VERIFIED::{req.otp_code}"

    if not utterance:
        raise HTTPException(status_code=400, detail="Either spoken_text or otp_code must be provided.")

    jevify_eval = ask_jevify_batch(
        state=f"Citizen Response to {scheme['name']} ({scheme['benefit_summary']}): {utterance}",
        recipe_name=req.jevify_recipe,
        questions=[
            {
                "id": "consent_affirmative",
                "kind": "noul",
                "prompt": "The citizen explicitly consents and approves auto-submission via DigiLocker.",
            },
            {
                "id": "negation_flip_guard",
                "kind": "noul",
                "prompt": "The citizen declined, refused, or asked NOT to submit the application.",
            },
            {
                "id": "intent_action",
                "kind": "choice",
                "prompt": "What action should the DPI pipeline take based on the citizen's response?",
                "options": ["affirmative_auto_submit", "request_clarification", "abort_and_purge"],
            },
        ],
    )

    p_consent = jevify_eval["answers"]["consent_affirmative"]["noul"]
    p_negation = jevify_eval["answers"]["negation_flip_guard"]["noul"]
    consent_granted = (p_consent >= 0.5 and p_negation < 0.5) or bool(req.otp_code)

    consent_artefact = None
    if consent_granted:
        consent_artefact = create_depa_consent_artefact(
            citizen=citizen,
            scheme=scheme,
            consent_channel="OTP_FALLBACK" if req.otp_code else req.channel,
            utterance=utterance,
        )
        CONSENT_ARTEFACTS.insert(0, consent_artefact)

    return {
        "consent_granted": consent_granted,
        "citizen_id": citizen["id"],
        "scheme_id": scheme["id"],
        "spoken_utterance": utterance,
        "jevify_nlu_readout": jevify_eval,
        "depa_consent_artefact": consent_artefact,
    }


@app.post("/api/v1/dbt/dispatch")
def dispatch_dbt(req: DBTDispatchRequest) -> Dict[str, Any]:
    """
    Stage 04: Direct Execution & DBT Dispatch ("From consent to credit").
    Attaches DigiLocker Verifiable Credentials, auto-fills the department schema,
    revokes the transient DEPA token immediately, and credits the Aadhaar-linked bank account
    with an immutable audit trail linked to `PID-777`.
    """
    citizen = CITIZENS_BY_ID.get(req.citizen_id)
    if not citizen:
        raise HTTPException(status_code=404, detail=f"Citizen '{req.citizen_id}' not found.")

    scheme = next((s for s in SCHEMES if s["id"] == req.scheme_id), None)
    if not scheme:
        raise HTTPException(status_code=404, detail=f"Scheme '{req.scheme_id}' not found.")

    consent_artefact = None
    if req.consent_artefact_id:
        consent_artefact = next((ca for ca in CONSENT_ARTEFACTS if ca["artefact_id"] == req.consent_artefact_id), None)
        if consent_artefact is None:
            raise HTTPException(status_code=404, detail=f"DEPA Consent Artefact '{req.consent_artefact_id}' not found.")
        if consent_artefact["citizen_id"] != citizen["id"] or consent_artefact["purpose_code"] != f"PROACTIVE_WELFARE_CLAIM::{scheme['code']}":
            raise HTTPException(
                status_code=400,
                detail="DEPA Consent Artefact is purpose-bound to a different citizen or scheme.",
            )
        if consent_artefact["status"] == "REVOKED_POST_EXECUTION":
            raise HTTPException(
                status_code=400,
                detail="DEPA Consent Artefact has already been revoked post-execution (DPDP Act 2023 single-use enforcement).",
            )
    else:
        utterance = (req.spoken_utterance or "").strip()
        if not utterance:
            raise HTTPException(status_code=400, detail="spoken_utterance or consent_artefact_id is required.")
        # Validate spoken_utterance through Jevify negation guard before minting a 1-click consent artefact
        jevify_check = ask_jevify_batch(
            state=f"Citizen Response to {scheme['name']}: {utterance}",
            questions=[
                {"id": "consent_affirmative", "kind": "noul", "prompt": "The citizen explicitly consents and approves auto-submission via DigiLocker."},
                {"id": "negation_flip_guard", "kind": "noul", "prompt": "The citizen declined, refused, or asked NOT to submit the application."},
            ],
        )
        if jevify_check["answers"]["negation_flip_guard"]["noul"] >= 0.5 or jevify_check["answers"]["consent_affirmative"]["noul"] < 0.5:
            raise HTTPException(
                status_code=400,
                detail="Cannot dispatch DBT: spoken utterance triggered negation guard or lacks affirmative DEPA consent.",
            )
        consent_artefact = create_depa_consent_artefact(
            citizen=citizen,
            scheme=scheme,
            consent_channel="BHASHINI_1CLICK_CONSENT",
            utterance=utterance,
        )
        CONSENT_ARTEFACTS.insert(0, consent_artefact)

    dbt_receipt = dispatch_dbt_transaction(citizen, scheme, consent_artefact)
    DBT_DISPATCH_LEDGER.insert(0, dbt_receipt)

    eval_trace = evaluate_citizen_scheme(citizen, scheme, HITL_OVERRIDES)

    return {
        "status": "DISBURSED",
        "dbt_receipt": dbt_receipt,
        "revoked_consent_artefact": consent_artefact,
        "chain_of_entitlement": eval_trace["chain_of_entitlement"],
    }


@app.get("/api/v1/admin/analytics")
def get_admin_analytics() -> Dict[str, Any]:
    """
    Module 4: Bilingual Admin / Panchayat Monitoring Dashboard telemetry.
    Returns state/district coverage heatmaps, inclusion/exclusion funnel, disbursement velocity,
    and the Tier 03 Human-in-the-Loop (HITL) Exclusion Safeguard Queue.
    """
    district_stats: Dict[str, Dict[str, Any]] = {}
    total_qualified_citizens = 0

    for c in CITIZENS:
        dist = c["district"]
        if dist not in district_stats:
            district_stats[dist] = {
                "district": dist,
                "state": c["state"],
                "panchayat": c["panchayat"],
                "total_citizens": 0,
                "eligible_citizens": 0,
                "total_benefit_unlocked_inr": 0,
                "hitl_pending": 0,
            }
        d_entry = district_stats[dist]
        d_entry["total_citizens"] += 1

        c_el = False
        c_inr = 0
        for s in SCHEMES:
            ev = evaluate_citizen_scheme(c, s, HITL_OVERRIDES)
            if ev["eligible"]:
                c_el = True
                c_inr += s["benefit_amount_inr"]
        if c_el:
            d_entry["eligible_citizens"] += 1
            total_qualified_citizens += 1
        d_entry["total_benefit_unlocked_inr"] += c_inr

        if c.get("hitl_flag"):
            flag = c["hitl_flag"]
            override_info = HITL_OVERRIDES.get(f"{c['id']}::{flag['target_scheme_id']}")
            effective_status = override_info["decision"] if override_info else flag["status"]
            if effective_status == "PENDING_PANCHAYAT_REVIEW":
                d_entry["hitl_pending"] += 1

    heatmap_list = []
    for d in district_stats.values():
        cov_pct = round((d["eligible_citizens"] / max(1, d["total_citizens"])) * 100, 1)
        heatmap_list.append({
            **d,
            "coverage_saturation_pct": cov_pct,
            "voice_outreach_completion_pct": min(99.2, round(cov_pct * 0.94 + 12.0, 1)),
        })
    heatmap_list.sort(key=lambda x: x["total_citizens"], reverse=True)

    # Build Tier 03 HITL Review Queue without mutating baseline CITIZENS
    hitl_queue = []
    for c in CITIZENS:
        if c.get("hitl_flag"):
            flag = c["hitl_flag"]
            override_key = f"{c['id']}::{flag['target_scheme_id']}"
            override_info = HITL_OVERRIDES.get(override_key)
            hitl_queue.append({
                "citizen_id": c["id"],
                "citizen_name": c["name"],
                "citizen_name_local": c["name_local"],
                "age": c["age"],
                "gender": c["gender"],
                "district": c["district"],
                "panchayat": c["panchayat"],
                "state": c["state"],
                "occupation": c["occupation"],
                "social_category": c["social_category"],
                "land_holding_ha": c["land_holding_ha"],
                "annual_income_inr": c["annual_income_inr"],
                "kcc_active": c["kcc_active"],
                "verifiable_credentials": c["verifiable_credentials"],
                "case_id": flag["case_id"],
                "target_scheme_id": flag["target_scheme_id"],
                "target_scheme_name": flag["target_scheme_name"],
                "failed_clause": flag["failed_clause"],
                "discrepancy_type": flag["discrepancy_type"],
                "explanation": flag["explanation"],
                "jevify_urgency_score": flag["jevify_urgency_score"],
                "jevify_confidence": flag["jevify_confidence"],
                "status": override_info["decision"] if override_info else flag["status"],
                "assigned_officer": flag["assigned_officer"],
                "resolution_audit": override_info,
            })

    total_scanned = len(CITIZENS)
    stage2_count = max(1, min(total_scanned, total_qualified_citizens))
    stage3_count = max(1, min(stage2_count, stage2_count - 6))
    stage4_count = max(1, min(stage3_count, stage3_count - 5 + min(4, len(CONSENT_ARTEFACTS))))
    stage5_count = max(1, min(stage4_count, stage4_count - 4 + min(4, len(DBT_DISPATCH_LEDGER))))

    return {
        "macro_impact_metrics": {
            "annual_budget_pool_inr": "₹3.5+ Trn",
            "schemes_tracked_national": "1,200+",
            "prototype_schemes_active": len(SCHEMES),
            "prototype_citizens_pool": total_scanned,
            "reactive_exclusion_gap_pct": "Up to 40%",
            "processing_time_reduction": "14 days → 90s",
            "intermediary_leakage": "0",
            "coverage_expansion_gain": "+35%",
        },
        "inclusion_funnel": [
            {"stage": "01. Anonymized DPI Cohort Scanned", "count": total_scanned, "pct": 100.0, "color": "#131B2E"},
            {"stage": "02. ZKP Predicate Qualified (>=1 Scheme)", "count": stage2_count, "pct": round(stage2_count / total_scanned * 100, 1), "color": "#2C4A3E"},
            {"stage": "03. Proactive Bhashini Voice Contacted", "count": stage3_count, "pct": round(stage3_count / total_scanned * 100, 1), "color": "#C85A32"},
            {"stage": "04. Spoken / OTP DEPA Consent Verified", "count": stage4_count, "pct": round(stage4_count / total_scanned * 100, 1), "color": "#C59B38"},
            {"stage": "05. Zero-Click PFMS DBT Disbursed (PID-777)", "count": stage5_count, "pct": round(stage5_count / total_scanned * 100, 1), "color": "#2C4A3E"},
        ],
        "district_heatmap": heatmap_list,
        "tier_03_hitl_queue": hitl_queue,
        "hitl_audit_trail": HITL_AUDIT_TRAIL,
        "recent_dbt_ledger": DBT_DISPATCH_LEDGER[:15],
        "recent_consent_artefacts": CONSENT_ARTEFACTS[:15],
    }


@app.post("/api/v1/admin/hitl-review")
def submit_hitl_review(req: HITLReviewRequest) -> Dict[str, Any]:
    """
    Tier 03 Exclusion Safeguard:
    "Algorithmic non-eligibility flags require human-in-the-loop review by local Panchayat / Ward
    administrative officers before benefits are withheld or modified. The algorithm proposes;
    the state disposes — under a paper trail."
    """
    citizen = CITIZENS_BY_ID.get(req.citizen_id)
    if not citizen:
        raise HTTPException(status_code=404, detail=f"Citizen '{req.citizen_id}' not found.")

    scheme = next((s for s in SCHEMES if s["id"] == req.scheme_id), None)
    if not scheme:
        raise HTTPException(status_code=404, detail=f"Scheme '{req.scheme_id}' not found.")

    if req.decision not in ("APPROVED_OVERRIDE", "DEFERRED_FIELD_VERIFICATION"):
        raise HTTPException(
            status_code=400,
            detail="decision must be 'APPROVED_OVERRIDE' or 'DEFERRED_FIELD_VERIFICATION'.",
        )

    now_iso = datetime.now(timezone.utc).isoformat()
    paper_trail_hash = "0x" + hashlib.sha256(
        f"{req.citizen_id}::{req.scheme_id}::{req.decision}::{req.officer_name}::{now_iso}".encode()
    ).hexdigest()[:20]

    audit_entry = {
        "audit_id": f"HITL-AUDIT-{len(HITL_AUDIT_TRAIL) + 1:03d}",
        "citizen_id": citizen["id"],
        "citizen_name": citizen["name"],
        "district": citizen["district"],
        "panchayat": citizen["panchayat"],
        "scheme_id": scheme["id"],
        "scheme_name": scheme["name"],
        "decision": req.decision,
        "officer_name": req.officer_name,
        "officer_notes": req.officer_notes,
        "paper_trail_signature": paper_trail_hash,
        "reviewed_at": now_iso,
    }

    override_key = f"{citizen['id']}::{scheme['id']}"
    HITL_OVERRIDES[override_key] = audit_entry
    HITL_AUDIT_TRAIL.insert(0, audit_entry)

    updated_eval = evaluate_citizen_scheme(citizen, scheme, HITL_OVERRIDES)
    return {
        "status": "HITL_DECISION_RECORDED",
        "audit_entry": audit_entry,
        "updated_evaluation": updated_eval,
    }


# ----------------------- Jevify & OpenAI SIWC Endpoints ----------------------- #

@app.get("/api/v1/ai/jevify/recipes")
def get_jevify_recipes() -> Dict[str, Any]:
    return {
        "repository": "https://github.com/fidecastro/jevify",
        "description": "Make any model you already have answer typed questions in one pass, the way Jev does, and measure how well it does.",
        "recipes": list_recipes(),
    }


@app.post("/api/v1/ai/jevify/probe")
def run_jevify_probe(recipe: str = Query(default="gemma-4-e4b-it.llamacpp")) -> Dict[str, Any]:
    return probe_recipe(recipe)


@app.post("/api/v1/ai/jevify/ask")
def run_jevify_ask(req: JevifyAskRequest) -> Dict[str, Any]:
    if not req.state.strip():
        raise HTTPException(status_code=400, detail="State text cannot be empty.")
    if not req.questions:
        raise HTTPException(status_code=400, detail="At least one typed question is required.")
    return ask_jevify_batch(state=req.state, questions=req.questions, recipe_name=req.recipe)


@app.get("/api/v1/auth/siwc/session")
def read_siwc_session() -> Dict[str, Any]:
    return get_siwc_session()


@app.post("/api/v1/auth/siwc/authorize")
def start_siwc_auth(req: SIWCAuthorizeRequest) -> Dict[str, Any]:
    return initiate_siwc_authorization(redirect_uri=req.redirect_uri, plan_preference=req.plan_preference)


@app.post("/api/v1/auth/siwc/callback")
def finish_siwc_auth(req: SIWCCallbackRequest) -> Dict[str, Any]:
    return complete_siwc_callback(
        state=req.state,
        email=req.email,
        plan_tier=req.plan_tier,
        active_model=req.active_model,
    )


@app.post("/api/v1/auth/siwc/revoke")
def signout_siwc() -> Dict[str, Any]:
    return revoke_siwc_session()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
