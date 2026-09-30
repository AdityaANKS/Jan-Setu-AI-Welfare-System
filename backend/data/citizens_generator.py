"""
Deterministic generator for the 200-citizen anonymized India Stack dataset.
Guarantees:
1. Total citizens: 200 (CIT-001 to CIT-200) across KA, UP, BR, MH, TN, MP, RJ.
2. Dedicated 100-profile Karnataka test cohort (`in_ka_100_pool == True`) where
   EXACTLY 18 of 100 profiles deterministically satisfy all boolean clauses of
   `SCH-01` (Karnataka Krishi Sanjeevani Scheme), matching Slide 05 of the pitch deck.
3. 7 edge-case profiles flagged for Tier 03 Panchayat Human-in-the-Loop (HITL) Review.
"""

from typing import List, Dict, Any
import hashlib


def _zkp_commitment(citizen_id: str, attribute: str, value: Any) -> str:
    payload = f"DEPA-ZKP-v1::{citizen_id}::{attribute}::{value}::SALT_INDIA_STACK_2026"
    return "0x" + hashlib.sha256(payload.encode("utf-8")).hexdigest()[:24]


def generate_citizens() -> List[Dict[str, Any]]:
    citizens: List[Dict[str, Any]] = []

    # 1. Hero Personas (CIT-001 to CIT-005)
    hero_profiles = [
        {
            "id": "CIT-001",
            "name": "Ramesh Kumar",
            "name_local": "रमेश कुमार",
            "age": 38,
            "gender": "Male",
            "state": "UP",
            "district": "Varanasi",
            "panchayat": "Sevapuri Gram Panchayat",
            "preferred_language": "hi",
            "dialect": "Bhojpuri / Hindi",
            "occupation": "Farmer",
            "social_category": "OBC",
            "land_holding_ha": 1.25,
            "annual_income_inr": 135000,
            "kcc_active": True,
            "ration_card_type": "PHH-BPL",
            "aadhaar_masked": "XXXX-XXXX-4829",
            "abha_id": "91-4829-1102-7741",
            "digilocker_uri": "in.gov.digilocker://citizen/CIT-001",
            "bank_account_masked": "SBI •••• 7741 (NPCI Aadhaar Mapped)",
            "phone_masked": "+91 94150 •••21",
            "in_ka_100_pool": False,
            "is_hero": True,
            "hero_tag": "Slide 03 Hero — PM-KUSUM ₹15,000 Solar Pump Subsidy",
            "verifiable_credentials": [
                {"vc_type": "in.gov.nabard.kcc.credential", "issuer": "NABARD / Kashi Gomti Samyut Gramin Bank", "verified_at": "2026-02-10"},
                {"vc_type": "in.gov.up.bhulekh.khatauni", "issuer": "Board of Revenue, Uttar Pradesh", "verified_at": "2026-01-19"},
                {"vc_type": "in.gov.nad.income.certificate", "issuer": "e-District UP", "verified_at": "2026-01-05"},
                {"vc_type": "in.gov.uidai.aadhaar.kyc", "issuer": "UIDAI", "verified_at": "2026-02-01"},
            ],
            "hitl_flag": None,
        },
        {
            "id": "CIT-002",
            "name": "Basavaraj Gowda",
            "name_local": "ಬಸವರಾಜ ಗೌಡ",
            "age": 36,
            "gender": "Male",
            "state": "KA",
            "district": "Mandya",
            "panchayat": "Srirangapatna Rural Panchayat",
            "preferred_language": "kn",
            "dialect": "Kannada (Old Mysuru)",
            "occupation": "Farmer",
            "social_category": "OBC",
            "land_holding_ha": 1.40,
            "annual_income_inr": 148000,
            "kcc_active": True,
            "ration_card_type": "BPL",
            "aadhaar_masked": "XXXX-XXXX-7712",
            "abha_id": "91-7712-3390-1844",
            "digilocker_uri": "in.gov.digilocker://citizen/CIT-002",
            "bank_account_masked": "Canara Bank •••• 1844 (NPCI Aadhaar Mapped)",
            "phone_masked": "+91 94480 •••88",
            "in_ka_100_pool": True,
            "is_hero": True,
            "hero_tag": "Slide 05 Hero — Karnataka Krishi Sanjeevani ₹18,000 & PM-KUSUM",
            "verifiable_credentials": [
                {"vc_type": "in.gov.karnataka.bhoomi.rtc.v2", "issuer": "Bhoomi Monitoring Cell, Govt. of Karnataka", "verified_at": "2026-02-14"},
                {"vc_type": "in.gov.nabard.kcc.credential", "issuer": "Kaveri Grameena Bank", "verified_at": "2026-02-08"},
                {"vc_type": "in.gov.nad.income.certificate", "issuer": "Nadakacheri Atalji Janasnehi Kendra", "verified_at": "2026-01-22"},
                {"vc_type": "in.gov.uidai.aadhaar.kyc", "issuer": "UIDAI", "verified_at": "2026-02-01"},
            ],
            "hitl_flag": None,
        },
        {
            "id": "CIT-003",
            "name": "Lakshmi Devi",
            "name_local": "ಲಕ್ಷ್ಮಿ ದೇವಿ",
            "age": 29,
            "gender": "Female",
            "state": "KA",
            "district": "Mysuru",
            "panchayat": "Nanjangud Gram Panchayat",
            "preferred_language": "kn",
            "dialect": "Kannada",
            "occupation": "Artisan",
            "social_category": "SC",
            "land_holding_ha": 0.45,
            "annual_income_inr": 118000,
            "kcc_active": False,
            "ration_card_type": "Antyodaya-AAY",
            "aadhaar_masked": "XXXX-XXXX-3094",
            "abha_id": "91-3094-6612-9012",
            "digilocker_uri": "in.gov.digilocker://citizen/CIT-003",
            "bank_account_masked": "Karnataka Gramin Bank •••• 9012",
            "phone_masked": "+91 98451 •••19",
            "in_ka_100_pool": True,
            "is_hero": True,
            "hero_tag": "Gruha Lakshmi ₹24k + PM Vishwakarma ₹15k + Stand-Up India ₹35k",
            "verifiable_credentials": [
                {"vc_type": "in.gov.karnataka.ahara.rationcard", "issuer": "Dept. of Food & Civil Supplies, KA", "verified_at": "2026-01-30"},
                {"vc_type": "in.gov.msme.udyam.artisan", "issuer": "Ministry of MSME", "verified_at": "2026-02-03"},
                {"vc_type": "in.gov.nad.caste.certificate", "issuer": "Nadakacheri Karnataka", "verified_at": "2025-12-11"},
                {"vc_type": "in.gov.nad.income.certificate", "issuer": "Nadakacheri Karnataka", "verified_at": "2026-01-12"},
            ],
            "hitl_flag": None,
        },
        {
            "id": "CIT-004",
            "name": "Sunita Patil",
            "name_local": "सुनीता पाटील",
            "age": 33,
            "gender": "Female",
            "state": "MH",
            "district": "Nashik",
            "panchayat": "Niphad Gram Panchayat",
            "preferred_language": "mr",
            "dialect": "Marathi",
            "occupation": "Farmer",
            "social_category": "OBC",
            "land_holding_ha": 1.10,
            "annual_income_inr": 162000,
            "kcc_active": True,
            "ration_card_type": "Saffron-PHH",
            "aadhaar_masked": "XXXX-XXXX-8541",
            "abha_id": "91-8541-2209-4430",
            "digilocker_uri": "in.gov.digilocker://citizen/CIT-004",
            "bank_account_masked": "Bank of Maharashtra •••• 4430",
            "phone_masked": "+91 98220 •••64",
            "in_ka_100_pool": False,
            "is_hero": True,
            "hero_tag": "Majhi Ladki Bahin ₹18,000 + PM-KUSUM ₹15,000 + PMMVY",
            "verifiable_credentials": [
                {"vc_type": "in.gov.maharashtra.domicile.vc", "issuer": "Aaple Sarkar Maharashtra", "verified_at": "2026-01-15"},
                {"vc_type": "in.gov.nabard.kcc.credential", "issuer": "NDCC Bank Nashik", "verified_at": "2026-01-28"},
                {"vc_type": "in.gov.nad.income.certificate", "issuer": "MahaOnline", "verified_at": "2026-01-18"},
            ],
            "hitl_flag": None,
        },
        {
            "id": "CIT-005",
            "name": "Ananya Verma",
            "name_local": "अनन्या वर्मा",
            "age": 20,
            "gender": "Female",
            "state": "MP",
            "district": "Bhopal",
            "panchayat": "Phanda Block Ward 04",
            "preferred_language": "hi",
            "dialect": "Hindi (Malwi/Bundeli)",
            "occupation": "Student",
            "social_category": "SC",
            "land_holding_ha": 0.0,
            "annual_income_inr": 112000,
            "kcc_active": False,
            "ration_card_type": "BPL",
            "aadhaar_masked": "XXXX-XXXX-6190",
            "abha_id": "91-6190-5501-3120",
            "digilocker_uri": "in.gov.digilocker://citizen/CIT-005",
            "bank_account_masked": "Central Bank of India •••• 3120",
            "phone_masked": "+91 97550 •••42",
            "in_ka_100_pool": False,
            "is_hero": True,
            "hero_tag": "National Post-Matric Scholarship ₹20,000 + Sukanya Seed ₹12,000",
            "verifiable_credentials": [
                {"vc_type": "in.gov.nad.academic.marksheet", "issuer": "National Academic Depository (NAD)", "verified_at": "2026-02-01"},
                {"vc_type": "in.gov.nad.caste.certificate", "issuer": "MP e-District", "verified_at": "2025-11-19"},
                {"vc_type": "in.gov.nad.income.certificate", "issuer": "MP e-District", "verified_at": "2026-01-08"},
            ],
            "hitl_flag": None,
        },
    ]

    citizens.extend(hero_profiles)

    # Now let's build the remaining 98 Karnataka cohort profiles so that `in_ka_100_pool`
    # has 100 profiles total (CIT-002, CIT-003, plus CIT-006..CIT-103 -> 100 KA profiles).
    # Among those 100 KA profiles:
    # - CIT-002 is ALREADY eligible for SCH-01 (1st match).
    # - We make CIT-006 through CIT-022 (17 profiles) also satisfy SCH-01:
    #   state="KA", occupation="Farmer", land_holding_ha < 2.0, annual_income_inr < 250000, kcc_active=True.
    #   1 + 17 = 18 EXACT matches in the 100-profile KA cohort!
    # - And we make all other 81 KA profiles fail at least one clause of SCH-01
    #   (e.g., non-Farmer occupation, or land_holding_ha >= 2.0, or annual_income_inr >= 250000, or kcc_active=False),
    #   including 7 edge-case profiles routed to the Tier 03 HITL Review Queue!

    ka_districts = [
        ("Mandya", "Srirangapatna Rural Panchayat"),
        ("Mysuru", "Hunsur Gram Panchayat"),
        ("Belagavi", "Gokak Rural Panchayat"),
        ("Dharwad", "Navalgund Gram Panchayat"),
        ("Raichur", "Sindhanur Rural Panchayat"),
        ("Hassan", "Channarayapatna Panchayat"),
        ("Tumakuru", "Tiptur Gram Panchayat"),
        ("Shivamogga", "Bhadravathi Rural Panchayat"),
        ("Kalaburagi", "Sedam Gram Panchayat"),
        ("Haveri", "Ranebennur Rural Panchayat"),
    ]

    ka_names_male = [
        ("Mallikarjun Patil", "ಮಲ್ಲಿಕಾರ್ಜುನ ಪಾಟೀಲ್"),
        ("Shivanand Poojary", "ಶಿವಾನಂದ ಪೂಜಾರಿ"),
        ("Ningappa Kuruba", "ನಿಂಗಪ್ಪ ಕುರುಬ"),
        ("Mahantesh Biradar", "ಮಹಾಂತೇಶ ಬಿರಾದಾರ"),
        ("Raghavendra Hegde", "ರಾಘವೇಂದ್ರ ಹೆಗ್ಡೆ"),
        ("Siddaramaiah Shetty", "ಸಿದ್ದರಾಮಯ್ಯ ಶೆಟ್ಟಿ"),
        ("Kallappa Naik", "ಕಲ್ಲಪ್ಪ ನಾಯ್ಕ್"),
        ("Hanumanthappa Meti", "ಹನುಮಂತಪ್ಪ ಮೇಟಿ"),
        ("PrakashReddy Nadagouda", "ಪ್ರಕಾಶ್ ರೆಡ್ಡಿ ನಾಡಗೌಡ"),
        ("Venkatesh Murthy", "ವೆಂಕಟೇಶ್ ಮೂರ್ತಿ"),
    ]

    ka_names_female = [
        ("Shanthamma Gowda", "ಶಾಂತಮ್ಮ ಗೌಡ"),
        ("Gangamma Kamble", "ಗಂಗಮ್ಮ ಕಾಂಬಳೆ"),
        ("Renuka Deshpande", "ರೇಣುಕಾ ದೇಶಪಾಂಡೆ"),
        ("Parvathamma Halli", "ಪಾರ್ವತಮ್ಮ ಹಳ್ಳಿ"),
        ("Savitha Kumari", "ಸವಿತಾ ಕುಮಾರಿ"),
        ("Chennamma Hiremath", "ಚೆನ್ನಮ್ಮ ಹಿರೇಮಠ"),
        ("Roopa Bai Rathod", "ರೂಪಾ ಬಾಯಿ ರಾಠೋಡ್"),
        ("Bhagyalakshmi Rao", "ಭಾಗ್ಯಲಕ್ಷ್ಮಿ ರಾವ್"),
        ("Kavitha Devadiga", "ಕವಿತಾ ದೇವಾಡಿಗ"),
        ("Suma Hosamani", "ಸುಮಾ ಹೊಸಮನಿ"),
    ]

    social_categories = ["OBC", "SC", "ST", "General"]

    # 17 more SCH-01 eligible KA farmers (CIT-006 to CIT-022) -> total 18 in KA-100 pool
    for idx in range(6, 23):
        cid = f"CIT-{idx:03d}"
        is_female = (idx % 3 == 0)
        name_pair = ka_names_female[idx % len(ka_names_female)] if is_female else ka_names_male[idx % len(ka_names_male)]
        dist, panchayat = ka_districts[idx % len(ka_districts)]
        land = round(0.55 + ((idx * 13) % 130) / 100.0, 2)  # strictly < 2.0 (0.55 to 1.85)
        income = 98000 + ((idx * 7300) % 135000)  # strictly < 250000
        age = 24 + (idx % 34)
        cat = social_categories[idx % len(social_categories)]

        citizens.append({
            "id": cid,
            "name": f"{name_pair[0]} ({dist})",
            "name_local": name_pair[1],
            "age": age,
            "gender": "Female" if is_female else "Male",
            "state": "KA",
            "district": dist,
            "panchayat": panchayat,
            "preferred_language": "kn",
            "dialect": "Kannada",
            "occupation": "Farmer",
            "social_category": cat,
            "land_holding_ha": land,
            "annual_income_inr": income,
            "kcc_active": True,
            "ration_card_type": "BPL",
            "aadhaar_masked": f"XXXX-XXXX-{3000 + idx:04d}",
            "abha_id": f"91-{3000 + idx:04d}-8821-{1000 + idx:04d}",
            "digilocker_uri": f"in.gov.digilocker://citizen/{cid}",
            "bank_account_masked": f"State Bank of India •••• {4000 + idx:04d}",
            "phone_masked": f"+91 9448{idx % 10} •••{idx:02d}",
            "in_ka_100_pool": True,
            "is_hero": False,
            "hero_tag": None,
            "verifiable_credentials": [
                {"vc_type": "in.gov.karnataka.bhoomi.rtc.v2", "issuer": "Bhoomi Monitoring Cell, KA", "verified_at": "2026-02-11"},
                {"vc_type": "in.gov.nabard.kcc.credential", "issuer": "NABARD / Grameena Bank", "verified_at": "2026-01-29"},
                {"vc_type": "in.gov.nad.income.certificate", "issuer": "Nadakacheri Karnataka", "verified_at": "2026-01-14"},
            ],
            "hitl_flag": None,
        })

    # 7 Tier-03 Human-in-the-Loop Edge-Case Profiles in the KA-100 pool (CIT-023 to CIT-029)
    # Note: None of these 7 satisfy SCH-01 strictly in the automated pass (so automated SCH-01 eligible stays 18/100),
    # because Tier 03 routes algorithmic non-eligibility edge cases to the Panchayat Officer for human review!
    hitl_scenarios = [
        {
            "id": "CIT-023",
            "name": "Kallappa Naik",
            "name_local": "ಕಲ್ಲಪ್ಪ ನಾಯ್ಕ್",
            "age": 44,
            "gender": "Male",
            "district": "Belagavi",
            "panchayat": "Gokak Rural Panchayat",
            "occupation": "Farmer",
            "social_category": "ST",
            "land_holding_ha": 2.06,  # 0.06 Ha over 2.0 Ha limit due to unpartitioned joint family Khata!
            "annual_income_inr": 142000,
            "kcc_active": True,
            "hitl_flag": {
                "case_id": "HITL-KA-2026-01",
                "target_scheme_id": "SCH-01",
                "target_scheme_name": "Karnataka Krishi Sanjeevani Scheme",
                "failed_clause": "Clause 4.2(b): Land_Holding_Ha < 2.0 (Recorded: 2.06 Ha)",
                "discrepancy_type": "Unpartitioned Joint Family RTC Mutation Pending",
                "explanation": "Bhoomi RTC Survey #114/B shows 2.06 Ha jointly across two brothers; actual cultivated share verified by Village Accountant is 1.03 Ha.",
                "jevify_urgency_score": "critical",
                "jevify_confidence": 0.96,
                "status": "PENDING_PANCHAYAT_REVIEW",
                "assigned_officer": "PDO — Gokak Rural Gram Panchayat",
            },
        },
        {
            "id": "CIT-024",
            "name": "Gangamma Kamble",
            "name_local": "ಗಂಗಮ್ಮ ಕಾಂಬಳೆ",
            "age": 41,
            "gender": "Female",
            "district": "Kalaburagi",
            "panchayat": "Sedam Gram Panchayat",
            "occupation": "Farmer",
            "social_category": "SC",
            "land_holding_ha": 1.15,
            "annual_income_inr": 131000,
            "kcc_active": False,  # KCC renewal approved at branch but CBS sync delayed
            "hitl_flag": {
                "case_id": "HITL-KA-2026-02",
                "target_scheme_id": "SCH-01",
                "target_scheme_name": "Karnataka Krishi Sanjeevani Scheme",
                "failed_clause": "Clause 4.2(c): KCC_Active == true (Recorded: false)",
                "discrepancy_type": "Rural Bank CBS Sync Latency on Renewed KCC",
                "explanation": "Citizen renewed Kisan Credit Card on 2026-02-04 at Krishna Grameena Bank; physical passbook stamped, NABARD API sync pending.",
                "jevify_urgency_score": "high",
                "jevify_confidence": 0.94,
                "status": "PENDING_PANCHAYAT_REVIEW",
                "assigned_officer": "PDO — Sedam Gram Panchayat",
            },
        },
        {
            "id": "CIT-025",
            "name": "Ningappa Kuruba",
            "name_local": "ನಿಂಗಪ್ಪ ಕುರುಬ",
            "age": 51,
            "gender": "Male",
            "district": "Raichur",
            "panchayat": "Sindhanur Rural Panchayat",
            "occupation": "Farmer",
            "social_category": "OBC",
            "land_holding_ha": 1.60,
            "annual_income_inr": 254500,  # ₹4,500 above ₹2.5L due to one-time PMFBY crop loss compensation
            "kcc_active": True,
            "hitl_flag": {
                "case_id": "HITL-KA-2026-03",
                "target_scheme_id": "SCH-01",
                "target_scheme_name": "Karnataka Krishi Sanjeevani Scheme",
                "failed_clause": "Clause 4.2(c): Annual_Income_INR < ₹2,50,000 (Recorded: ₹2,54,500)",
                "discrepancy_type": "One-Time Crop Insurance Indemnity Counted as Income",
                "explanation": "Annual income includes a one-time ₹38,000 PMFBY flood compensation credit; net recurring agricultural income is ₹2,16,500.",
                "jevify_urgency_score": "high",
                "jevify_confidence": 0.92,
                "status": "PENDING_PANCHAYAT_REVIEW",
                "assigned_officer": "Tahshildar / PDO — Sindhanur",
            },
        },
        {
            "id": "CIT-026",
            "name": "Parvathamma Halli",
            "name_local": "ಪಾರ್ವತಮ್ಮ ಹಳ್ಳಿ",
            "age": 34,
            "gender": "Female",
            "district": "Dharwad",
            "panchayat": "Navalgund Gram Panchayat",
            "occupation": "Farmer",
            "social_category": "OBC",
            "land_holding_ha": 2.12,  # 0.22 Ha is barren uncultivable Kharab land
            "annual_income_inr": 124000,
            "kcc_active": True,
            "hitl_flag": {
                "case_id": "HITL-KA-2026-04",
                "target_scheme_id": "SCH-01",
                "target_scheme_name": "Karnataka Krishi Sanjeevani Scheme",
                "failed_clause": "Clause 4.2(b): Land_Holding_Ha < 2.0 (Recorded: 2.12 Ha gross)",
                "discrepancy_type": "'A-Kharab' Uncultivable Land Included in Gross RTC Area",
                "explanation": "RTC includes 0.24 Ha of rocky A-Kharab land; net cultivable area is 1.88 Ha (< 2.0 Ha statutory threshold).",
                "jevify_urgency_score": "critical",
                "jevify_confidence": 0.97,
                "status": "PENDING_PANCHAYAT_REVIEW",
                "assigned_officer": "PDO — Navalgund Gram Panchayat",
            },
        },
        {
            "id": "CIT-027",
            "name": "Hanumanthappa Meti",
            "name_local": "ಹನುಮಂತಪ್ಪ ಮೇಟಿ",
            "age": 48,
            "gender": "Male",
            "district": "Haveri",
            "panchayat": "Ranebennur Rural Panchayat",
            "occupation": "Agricultural Laborer",  # Tenant cultivator on oral lease
            "social_category": "ST",
            "land_holding_ha": 1.30,
            "annual_income_inr": 109000,
            "kcc_active": True,
            "hitl_flag": {
                "case_id": "HITL-KA-2026-05",
                "target_scheme_id": "SCH-01",
                "target_scheme_name": "Karnataka Krishi Sanjeevani Scheme",
                "failed_clause": "Clause 4.2(a): Occupation == 'Farmer' (e-Shram lists 'Agricultural Laborer')",
                "discrepancy_type": "Cross-Portal Occupation Taxonomy Mismatch (e-Shram vs FRUITS)",
                "explanation": "Citizen holds valid FRUITS Farmer ID and 1.30 Ha RTC, but 2022 e-Shram card lists 'Agricultural Laborer'.",
                "jevify_urgency_score": "medium",
                "jevify_confidence": 0.89,
                "status": "PENDING_PANCHAYAT_REVIEW",
                "assigned_officer": "PDO — Ranebennur Rural Panchayat",
            },
        },
        {
            "id": "CIT-028",
            "name": "Roopa Bai Rathod",
            "name_local": "ರೂಪಾ ಬಾಯಿ ರಾಠೋಡ್",
            "age": 27,
            "gender": "Female",
            "district": "Shivamogga",
            "panchayat": "Bhadravathi Rural Panchayat",
            "occupation": "Farmer",
            "social_category": "SC",
            "land_holding_ha": 1.45,
            "annual_income_inr": 156000,
            "kcc_active": False,  # Widow succession transfer on deceased spouse KCC
            "hitl_flag": {
                "case_id": "HITL-KA-2026-06",
                "target_scheme_id": "SCH-01",
                "target_scheme_name": "Karnataka Krishi Sanjeevani Scheme",
                "failed_clause": "Clause 4.2(c): KCC_Active == true (Spouse KCC under succession)",
                "discrepancy_type": "Spousal Virasat / Succession Pending on KCC Account",
                "explanation": "Land RTC already mutated to widow Roopa Bai Rathod; KCC account name transfer from late spouse is in final bank stage.",
                "jevify_urgency_score": "critical",
                "jevify_confidence": 0.98,
                "status": "PENDING_PANCHAYAT_REVIEW",
                "assigned_officer": "PDO — Bhadravathi Rural Panchayat",
            },
        },
        {
            "id": "CIT-029",
            "name": "Mahantesh Biradar",
            "name_local": "ಮಹಾಂತೇಶ ಬಿರಾದಾರ",
            "age": 39,
            "gender": "Male",
            "district": "Tumakuru",
            "panchayat": "Tiptur Gram Panchayat",
            "occupation": "Farmer",
            "social_category": "OBC",
            "land_holding_ha": 2.02,  # Highway acquisition deducted 0.15 Ha
            "annual_income_inr": 168000,
            "kcc_active": True,
            "hitl_flag": {
                "case_id": "HITL-KA-2026-07",
                "target_scheme_id": "SCH-01",
                "target_scheme_name": "Karnataka Krishi Sanjeevani Scheme",
                "failed_clause": "Clause 4.2(b): Land_Holding_Ha < 2.0 (Recorded: 2.02 Ha)",
                "discrepancy_type": "NHAI Road Acquisition Deduction Not Yet Reflected in Bhoomi",
                "explanation": "0.18 Ha acquired for highway widening in 2025 (Award Copy in DigiLocker); actual remaining holding is 1.84 Ha.",
                "jevify_urgency_score": "high",
                "jevify_confidence": 0.93,
                "status": "PENDING_PANCHAYAT_REVIEW",
                "assigned_officer": "PDO — Tiptur Gram Panchayat",
            },
        },
    ]

    for h in hitl_scenarios:
        cid = h["id"]
        idx = int(cid.split("-")[1])
        citizens.append({
            "id": cid,
            "name": h["name"],
            "name_local": h["name_local"],
            "age": h["age"],
            "gender": h["gender"],
            "state": "KA",
            "district": h["district"],
            "panchayat": h["panchayat"],
            "preferred_language": "kn",
            "dialect": "Kannada",
            "occupation": h["occupation"],
            "social_category": h["social_category"],
            "land_holding_ha": h["land_holding_ha"],
            "annual_income_inr": h["annual_income_inr"],
            "kcc_active": h["kcc_active"],
            "ration_card_type": "BPL",
            "aadhaar_masked": f"XXXX-XXXX-{3000 + idx:04d}",
            "abha_id": f"91-{3000 + idx:04d}-7740-{1000 + idx:04d}",
            "digilocker_uri": f"in.gov.digilocker://citizen/{cid}",
            "bank_account_masked": f"Canara Bank •••• {4000 + idx:04d}",
            "phone_masked": f"+91 9480{idx % 10} •••{idx:02d}",
            "in_ka_100_pool": True,
            "is_hero": False,
            "hero_tag": "Tier 03 HITL Review Candidate",
            "verifiable_credentials": [
                {"vc_type": "in.gov.karnataka.bhoomi.rtc.v2", "issuer": "Bhoomi Monitoring Cell, KA", "verified_at": "2026-02-09"},
                {"vc_type": "in.gov.nad.income.certificate", "issuer": "Nadakacheri Karnataka", "verified_at": "2026-01-17"},
                {"vc_type": "in.gov.uidai.aadhaar.kyc", "issuer": "UIDAI", "verified_at": "2026-02-01"},
            ],
            "hitl_flag": h["hitl_flag"],
        })

    # Remaining 74 KA profiles in the 100-profile KA cohort (CIT-030 to CIT-103)
    # Must NOT satisfy all 5 clauses of SCH-01 so that SCH-01 eligible count in `ka_100` is strictly 18/100.
    # Many of them WILL satisfy Gruha Lakshmi (SCH-05), PM-KISAN (SCH-03), PM-JAY (SCH-06), Vishwakarma (SCH-07), Post-Matric (SCH-09), etc.!
    non_sch01_occupations = ["Artisan", "Student", "Homemaker", "Weaver", "Farmer", "Daily Wage Worker"]
    for idx in range(30, 104):
        cid = f"CIT-{idx:03d}"
        is_female = (idx % 2 == 0)
        name_pair = ka_names_female[idx % len(ka_names_female)] if is_female else ka_names_male[idx % len(ka_names_male)]
        dist, panchayat = ka_districts[idx % len(ka_districts)]
        occ = non_sch01_occupations[idx % len(non_sch01_occupations)]
        cat = social_categories[idx % len(social_categories)]

        if occ == "Student":
            age = 18 + (idx % 7)
            land = 0.0
            income = 95000 + ((idx * 3100) % 120000)
            kcc = False
        elif occ == "Farmer":
            age = 28 + (idx % 30)
            # Ensure they do NOT match SCH-01 (either land >= 2.2 Ha or KCC == False or income >= 265000)
            if idx % 3 == 0:
                land = round(2.25 + (idx % 15) * 0.15, 2)  # Larger landholder >= 2.25 Ha
                income = 175000 + (idx * 900)
                kcc = True
            else:
                land = round(0.80 + (idx % 9) * 0.10, 2)
                income = 275000 + (idx * 1200)  # Above 2.5L threshold
                kcc = False
        else:
            age = 22 + (idx % 35)
            land = round((idx % 5) * 0.25, 2)
            income = 105000 + ((idx * 2900) % 130000)
            kcc = False

        citizens.append({
            "id": cid,
            "name": f"{name_pair[0]} #{idx}",
            "name_local": name_pair[1],
            "age": age,
            "gender": "Female" if is_female else "Male",
            "state": "KA",
            "district": dist,
            "panchayat": panchayat,
            "preferred_language": "kn",
            "dialect": "Kannada",
            "occupation": occ,
            "social_category": cat,
            "land_holding_ha": land,
            "annual_income_inr": income,
            "kcc_active": kcc,
            "ration_card_type": "BPL" if income < 200000 else "APL",
            "aadhaar_masked": f"XXXX-XXXX-{3000 + idx:04d}",
            "abha_id": f"91-{3000 + idx:04d}-6610-{1000 + idx:04d}",
            "digilocker_uri": f"in.gov.digilocker://citizen/{cid}",
            "bank_account_masked": f"Karnataka Bank •••• {4000 + idx:04d}",
            "phone_masked": f"+91 9449{idx % 10} •••{idx % 100:02d}",
            "in_ka_100_pool": True,
            "is_hero": False,
            "hero_tag": None,
            "verifiable_credentials": [
                {"vc_type": "in.gov.karnataka.ahara.rationcard", "issuer": "Dept. of Food & Civil Supplies, KA", "verified_at": "2026-01-20"},
                {"vc_type": "in.gov.nad.income.certificate", "issuer": "Nadakacheri Karnataka", "verified_at": "2026-01-12"},
                {"vc_type": "in.gov.uidai.aadhaar.kyc", "issuer": "UIDAI", "verified_at": "2026-02-01"},
            ],
            "hitl_flag": None,
        })

    # Remaining 96 National Cohort Citizens (CIT-104 to CIT-200) across UP, BR, MH, TN, MP, RJ
    national_Configs = [
        ("UP", "Varanasi", "Sevapuri Gram Panchayat", "hi", "Bhojpuri / Hindi", "रमेश / सुरेश यादव", ["Ramnath Yadav", "Geeta Devi", "Brijesh Maurya", "Kusum Lata"]),
        ("BR", "Muzaffarpur", "Kurhani Gram Panchayat", "bho", "Bhojpuri / Maithili", "बिनोद पासवान", ["Binod Paswan", "Champa Devi", "Santosh Thakur", "Poonam Kumari"]),
        ("MH", "Nashik", "Sinnar Gram Panchayat", "mr", "Marathi", "मंगेश जाधव", ["Mangesh Jadhav", "Vaishali Shinde", "TukaramMore", "Rekha Pawar"]),
        ("TN", "Madurai", "Melur Panchayat Union", "ta", "Tamil", "மீனாட்சி அம்மாள்", ["Murugan Selvam", "Meenakshi Ammal", "Karthikraja P", "Selvi Muthu"]),
        ("MP", "Sehore", "Ashta Janpad Panchayat", "hi", "Hindi (Malwi)", "कमल सिंह चौहान", ["Kamal Singh Chouhan", "Rekha Bai", "Dinesh Ahirwar", "Kavita Solanki"]),
        ("RJ", "Jodhpur", "Osian Gram Panchayat", "hi", "Marwari / Hindi", "भंवरलाल बिश्नोई", ["Bhanwarlal Bishnoi", "Kamla Devi", "Ratanaram Meghwal", "Pushpa Kanwar"]),
    ]

    nat_occupations = ["Farmer", "Artisan", "Student", "Farmer", "Daily Wage Worker", "Homemaker"]

    for idx in range(104, 201):
        cid = f"CIT-{idx:03d}"
        st_cfg = national_Configs[idx % len(national_Configs)]
        state_code, dist, panchayat, lang, dialect, local_sample, names_list = st_cfg
        base_name = names_list[(idx // len(national_Configs)) % len(names_list)]
        is_female = ("Devi" in base_name or "Ammal" in base_name or "Bai" in base_name or "Kumari" in base_name or "Lata" in base_name or "Shinde" in base_name or "Pawar" in base_name or "Muthu" in base_name or "Solanki" in base_name or "Kanwar" in base_name)
        occ = nat_occupations[idx % len(nat_occupations)]
        cat = social_categories[idx % len(social_categories)]

        if occ == "Student":
            age = 18 + (idx % 6)
            land = 0.0
            income = 92000 + ((idx * 1900) % 110000)
            kcc = False
        elif occ == "Farmer":
            age = 26 + (idx % 34)
            land = round(0.65 + ((idx * 11) % 160) / 100.0, 2)
            income = 115000 + ((idx * 2300) % 125000)
            kcc = (idx % 2 == 0)
        else:
            age = 21 + (idx % 32)
            land = round((idx % 4) * 0.3, 2)
            income = 108000 + ((idx * 2100) % 120000)
            kcc = False

        citizens.append({
            "id": cid,
            "name": f"{base_name} ({dist})",
            "name_local": local_sample,
            "age": age,
            "gender": "Female" if is_female else "Male",
            "state": state_code,
            "district": dist,
            "panchayat": panchayat,
            "preferred_language": lang,
            "dialect": dialect,
            "occupation": occ,
            "social_category": cat,
            "land_holding_ha": land,
            "annual_income_inr": income,
            "kcc_active": kcc,
            "ration_card_type": "PHH-BPL" if income < 210000 else "APL",
            "aadhaar_masked": f"XXXX-XXXX-{5000 + idx:04d}",
            "abha_id": f"91-{5000 + idx:04d}-9912-{2000 + idx:04d}",
            "digilocker_uri": f"in.gov.digilocker://citizen/{cid}",
            "bank_account_masked": f"Punjab National Bank •••• {6000 + idx:04d}",
            "phone_masked": f"+91 9810{idx % 10} •••{idx % 100:02d}",
            "in_ka_100_pool": False,
            "is_hero": False,
            "hero_tag": None,
            "verifiable_credentials": [
                {"vc_type": "in.gov.land.record.vc", "issuer": f"State Land Registry ({state_code})", "verified_at": "2026-01-25"},
                {"vc_type": "in.gov.nad.income.certificate", "issuer": f"e-District ({state_code})", "verified_at": "2026-01-10"},
                {"vc_type": "in.gov.uidai.aadhaar.kyc", "issuer": "UIDAI", "verified_at": "2026-02-01"},
            ],
            "hitl_flag": None,
        })

    # Attach ZKP commitments for every citizen so raw PII never needs to be exposed in transit
    for c in citizens:
        c["zkp_commitments"] = {
            "income_proof": _zkp_commitment(c["id"], "annual_income_inr", c["annual_income_inr"]),
            "land_proof": _zkp_commitment(c["id"], "land_holding_ha", c["land_holding_ha"]),
            "domicile_proof": _zkp_commitment(c["id"], "state", c["state"]),
            "occupation_proof": _zkp_commitment(c["id"], "occupation", c["occupation"]),
            "kcc_proof": _zkp_commitment(c["id"], "kcc_active", c["kcc_active"]),
        }

    return citizens
