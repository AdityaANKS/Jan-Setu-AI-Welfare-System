import SCHEMES from './data/schemes.json';

function simpleHash(input) {
  let h1 = 0xdeadbeef ^ input.length;
  let h2 = 0x41c6ce57 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const hex1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const hex2 = (h2 >>> 0).toString(16).padStart(8, '0');
  return `${hex1}${hex2}${hex1}`;
}

function zkpCommitment(citizenId, attribute, value) {
  return '0x' + simpleHash(`DEPA-ZKP-v1::${citizenId}::${attribute}::${value}::SALT_INDIA_STACK_2026`).slice(0, 24);
}

function generateCitizens() {
  const citizens = [
    {
      id: 'CIT-001',
      name: 'Ramesh Kumar',
      name_local: 'रमेश कुमार',
      age: 38,
      gender: 'Male',
      state: 'UP',
      district: 'Varanasi',
      panchayat: 'Sevapuri Gram Panchayat',
      preferred_language: 'hi',
      dialect: 'Bhojpuri / Hindi',
      occupation: 'Farmer',
      social_category: 'OBC',
      land_holding_ha: 1.25,
      annual_income_inr: 135000,
      kcc_active: true,
      ration_card_type: 'PHH-BPL',
      aadhaar_masked: 'XXXX-XXXX-4829',
      abha_id: '91-4829-1102-7741',
      digilocker_uri: 'in.gov.digilocker://citizen/CIT-001',
      bank_account_masked: 'SBI •••• 7741 (NPCI Aadhaar Mapped)',
      phone_masked: '+91 94150 •••21',
      in_ka_100_pool: false,
      is_hero: true,
      hero_tag: 'Slide 03 Hero — PM-KUSUM ₹15,000 Solar Pump Subsidy',
      verifiable_credentials: [
        { vc_type: 'in.gov.nabard.kcc.credential', issuer: 'NABARD / Kashi Gomti Samyut Gramin Bank', verified_at: '2026-02-10' },
        { vc_type: 'in.gov.up.bhulekh.khatauni', issuer: 'Board of Revenue, Uttar Pradesh', verified_at: '2026-01-19' },
        { vc_type: 'in.gov.nad.income.certificate', issuer: 'e-District UP', verified_at: '2026-01-05' },
        { vc_type: 'in.gov.uidai.aadhaar.kyc', issuer: 'UIDAI', verified_at: '2026-02-01' },
      ],
      hitl_flag: null,
    },
    {
      id: 'CIT-002',
      name: 'Basavaraj Gowda',
      name_local: 'ಬಸವರಾಜ ಗೌಡ',
      age: 36,
      gender: 'Male',
      state: 'KA',
      district: 'Mandya',
      panchayat: 'Srirangapatna Rural Panchayat',
      preferred_language: 'kn',
      dialect: 'Kannada (Old Mysuru)',
      occupation: 'Farmer',
      social_category: 'OBC',
      land_holding_ha: 1.4,
      annual_income_inr: 148000,
      kcc_active: true,
      ration_card_type: 'BPL',
      aadhaar_masked: 'XXXX-XXXX-7712',
      abha_id: '91-7712-3390-1844',
      digilocker_uri: 'in.gov.digilocker://citizen/CIT-002',
      bank_account_masked: 'Canara Bank •••• 1844 (NPCI Aadhaar Mapped)',
      phone_masked: '+91 94480 •••88',
      in_ka_100_pool: true,
      is_hero: true,
      hero_tag: 'Slide 05 Hero — Karnataka Krishi Sanjeevani ₹18,000 & PM-KUSUM',
      verifiable_credentials: [
        { vc_type: 'in.gov.karnataka.bhoomi.rtc.v2', issuer: 'Bhoomi Monitoring Cell, Govt. of Karnataka', verified_at: '2026-02-14' },
        { vc_type: 'in.gov.nabard.kcc.credential', issuer: 'Kaveri Grameena Bank', verified_at: '2026-02-08' },
        { vc_type: 'in.gov.nad.income.certificate', issuer: 'Nadakacheri Atalji Janasnehi Kendra', verified_at: '2026-01-22' },
        { vc_type: 'in.gov.uidai.aadhaar.kyc', issuer: 'UIDAI', verified_at: '2026-02-01' },
      ],
      hitl_flag: null,
    },
    {
      id: 'CIT-003',
      name: 'Lakshmi Devi',
      name_local: 'ಲಕ್ಷ್ಮಿ ದೇವಿ',
      age: 29,
      gender: 'Female',
      state: 'KA',
      district: 'Mysuru',
      panchayat: 'Nanjangud Gram Panchayat',
      preferred_language: 'kn',
      dialect: 'Kannada',
      occupation: 'Artisan',
      social_category: 'SC',
      land_holding_ha: 0.45,
      annual_income_inr: 118000,
      kcc_active: false,
      ration_card_type: 'Antyodaya-AAY',
      aadhaar_masked: 'XXXX-XXXX-3094',
      abha_id: '91-3094-6612-9012',
      digilocker_uri: 'in.gov.digilocker://citizen/CIT-003',
      bank_account_masked: 'Karnataka Gramin Bank •••• 9012',
      phone_masked: '+91 98451 •••19',
      in_ka_100_pool: true,
      is_hero: true,
      hero_tag: 'Gruha Lakshmi ₹24k + PM Vishwakarma ₹15k + Stand-Up India ₹35k',
      verifiable_credentials: [
        { vc_type: 'in.gov.karnataka.ahara.rationcard', issuer: 'Dept. of Food & Civil Supplies, KA', verified_at: '2026-01-30' },
        { vc_type: 'in.gov.msme.udyam.artisan', issuer: 'Ministry of MSME', verified_at: '2026-02-03' },
        { vc_type: 'in.gov.nad.caste.certificate', issuer: 'Nadakacheri Karnataka', verified_at: '2025-12-11' },
        { vc_type: 'in.gov.nad.income.certificate', issuer: 'Nadakacheri Karnataka', verified_at: '2026-01-12' },
      ],
      hitl_flag: null,
    },
    {
      id: 'CIT-004',
      name: 'Sunita Patil',
      name_local: 'सुनीता पाटील',
      age: 33,
      gender: 'Female',
      state: 'MH',
      district: 'Nashik',
      panchayat: 'Niphad Gram Panchayat',
      preferred_language: 'mr',
      dialect: 'Marathi',
      occupation: 'Farmer',
      social_category: 'OBC',
      land_holding_ha: 1.1,
      annual_income_inr: 162000,
      kcc_active: true,
      ration_card_type: 'Saffron-PHH',
      aadhaar_masked: 'XXXX-XXXX-8541',
      abha_id: '91-8541-2209-4430',
      digilocker_uri: 'in.gov.digilocker://citizen/CIT-004',
      bank_account_masked: 'Bank of Maharashtra •••• 4430',
      phone_masked: '+91 98220 •••64',
      in_ka_100_pool: false,
      is_hero: true,
      hero_tag: 'Majhi Ladki Bahin ₹18,000 + PM-KUSUM ₹15,000 + PMMVY',
      verifiable_credentials: [
        { vc_type: 'in.gov.maharashtra.domicile.vc', issuer: 'Aaple Sarkar Maharashtra', verified_at: '2026-01-15' },
        { vc_type: 'in.gov.nabard.kcc.credential', issuer: 'NDCC Bank Nashik', verified_at: '2026-01-28' },
        { vc_type: 'in.gov.nad.income.certificate', issuer: 'MahaOnline', verified_at: '2026-01-18' },
      ],
      hitl_flag: null,
    },
    {
      id: 'CIT-005',
      name: 'Ananya Verma',
      name_local: 'अनन्या वर्मा',
      age: 20,
      gender: 'Female',
      state: 'MP',
      district: 'Bhopal',
      panchayat: 'Phanda Block Ward 04',
      preferred_language: 'hi',
      dialect: 'Hindi (Malwi/Bundeli)',
      occupation: 'Student',
      social_category: 'SC',
      land_holding_ha: 0.0,
      annual_income_inr: 112000,
      kcc_active: false,
      ration_card_type: 'BPL',
      aadhaar_masked: 'XXXX-XXXX-6190',
      abha_id: '91-6190-5501-3120',
      digilocker_uri: 'in.gov.digilocker://citizen/CIT-005',
      bank_account_masked: 'Central Bank of India •••• 3120',
      phone_masked: '+91 97550 •••42',
      in_ka_100_pool: false,
      is_hero: true,
      hero_tag: 'National Post-Matric Scholarship ₹20,000 + Sukanya Seed ₹12,000',
      verifiable_credentials: [
        { vc_type: 'in.gov.nad.academic.marksheet', issuer: 'National Academic Depository (NAD)', verified_at: '2026-02-01' },
        { vc_type: 'in.gov.nad.caste.certificate', issuer: 'MP e-District', verified_at: '2025-11-19' },
        { vc_type: 'in.gov.nad.income.certificate', issuer: 'MP e-District', verified_at: '2026-01-08' },
      ],
      hitl_flag: null,
    },
  ];

  const kaDistricts = [
    ['Mandya', 'Srirangapatna Rural Panchayat'],
    ['Mysuru', 'Hunsur Gram Panchayat'],
    ['Belagavi', 'Gokak Rural Panchayat'],
    ['Dharwad', 'Navalgund Gram Panchayat'],
    ['Raichur', 'Sindhanur Rural Panchayat'],
    ['Hassan', 'Channarayapatna Panchayat'],
    ['Tumakuru', 'Tiptur Gram Panchayat'],
    ['Shivamogga', 'Bhadravathi Rural Panchayat'],
    ['Kalaburagi', 'Sedam Gram Panchayat'],
    ['Haveri', 'Ranebennur Rural Panchayat'],
  ];

  const kaNamesMale = [
    ['Mallikarjun Patil', 'ಮಲ್ಲಿಕಾರ್ಜುನ ಪಾಟೀಲ್'],
    ['Shivanand Poojary', 'ಶಿವಾನಂದ ಪೂಜಾರಿ'],
    ['Ningappa Kuruba', 'ನಿಂಗಪ್ಪ ಕುರುಬ'],
    ['Mahantesh Biradar', 'ಮಹಾಂತೇಶ ಬಿರಾದಾರ'],
    ['Raghavendra Hegde', 'ರಾಘವೇಂದ್ರ ಹೆಗ್ಡೆ'],
    ['Siddaramaiah Shetty', 'ಸಿದ್ದರಾಮಯ್ಯ ಶೆಟ್ಟಿ'],
    ['Kallappa Naik', 'ಕಲ್ಲಪ್ಪ ನಾಯ್ಕ್'],
    ['Hanumanthappa Meti', 'ಹನುಮಂತಪ್ಪ ಮೇಟಿ'],
    ['PrakashReddy Nadagouda', 'ಪ್ರಕಾಶ್ ರೆಡ್ಡಿ ನಾಡಗೌಡ'],
    ['Venkatesh Murthy', 'ವೆಂಕಟೇಶ್ ಮೂರ್ತಿ'],
  ];

  const kaNamesFemale = [
    ['Shanthamma Gowda', 'ಶಾಂತಮ್ಮ ಗೌಡ'],
    ['Gangamma Kamble', 'ಗಂಗಮ್ಮ ಕಾಂಬಳೆ'],
    ['Renuka Deshpande', 'ರೇಣುಕಾ ದೇಶಪಾಂಡೆ'],
    ['Parvathamma Halli', 'ಪಾರ್ವತಮ್ಮ ಹಳ್ಳಿ'],
    ['Savitha Kumari', 'ಸವಿತಾ ಕುಮಾರಿ'],
    ['Chennamma Hiremath', 'ಚೆನ್ನಮ್ಮ ಹಿರೇಮಠ'],
    ['Roopa Bai Rathod', 'ರೂಪಾ ಬಾಯಿ ರಾಠೋಡ್'],
    ['Bhagyalakshmi Rao', 'ಭಾಗ್ಯಲಕ್ಷ್ಮಿ ರಾವ್'],
    ['Kavitha Devadiga', 'ಕವಿತಾ ದೇವಾಡಿಗ'],
    ['Suma Hosamani', 'ಸುಮಾ ಹೊಸಮನಿ'],
  ];

  const socialCategories = ['OBC', 'SC', 'ST', 'General'];

  for (let idx = 6; idx < 23; idx++) {
    const cid = `CIT-${String(idx).padStart(3, '0')}`;
    const isFemale = idx % 3 === 0;
    const namePair = isFemale ? kaNamesFemale[idx % kaNamesFemale.length] : kaNamesMale[idx % kaNamesMale.length];
    const [dist, panchayat] = kaDistricts[idx % kaDistricts.length];
    const land = Number((0.55 + ((idx * 13) % 130) / 100.0).toFixed(2));
    const income = 98000 + ((idx * 7300) % 135000);
    const age = 24 + (idx % 34);
    const cat = socialCategories[idx % socialCategories.length];

    citizens.push({
      id: cid,
      name: `${namePair[0]} (${dist})`,
      name_local: namePair[1],
      age,
      gender: isFemale ? 'Female' : 'Male',
      state: 'KA',
      district: dist,
      panchayat,
      preferred_language: 'kn',
      dialect: 'Kannada',
      occupation: 'Farmer',
      social_category: cat,
      land_holding_ha: land,
      annual_income_inr: income,
      kcc_active: true,
      ration_card_type: 'BPL',
      aadhaar_masked: `XXXX-XXXX-${3000 + idx}`,
      abha_id: `91-${3000 + idx}-8821-${1000 + idx}`,
      digilocker_uri: `in.gov.digilocker://citizen/${cid}`,
      bank_account_masked: `State Bank of India •••• ${4000 + idx}`,
      phone_masked: `+91 9448${idx % 10} •••${String(idx).padStart(2, '0')}`,
      in_ka_100_pool: true,
      is_hero: false,
      hero_tag: null,
      verifiable_credentials: [
        { vc_type: 'in.gov.karnataka.bhoomi.rtc.v2', issuer: 'Bhoomi Monitoring Cell, KA', verified_at: '2026-02-11' },
        { vc_type: 'in.gov.nabard.kcc.credential', issuer: 'NABARD / Grameena Bank', verified_at: '2026-01-29' },
        { vc_type: 'in.gov.nad.income.certificate', issuer: 'Nadakacheri Karnataka', verified_at: '2026-01-14' },
      ],
      hitl_flag: null,
    });
  }

  const hitlScenarios = [
    {
      id: 'CIT-023',
      name: 'Kallappa Naik',
      name_local: 'ಕಲ್ಲಪ್ಪ ನಾಯ್ಕ್',
      age: 44,
      gender: 'Male',
      district: 'Belagavi',
      panchayat: 'Gokak Rural Panchayat',
      occupation: 'Farmer',
      social_category: 'ST',
      land_holding_ha: 2.06,
      annual_income_inr: 142000,
      kcc_active: true,
      hitl_flag: {
        case_id: 'HITL-KA-2026-01',
        target_scheme_id: 'SCH-01',
        target_scheme_name: 'Karnataka Krishi Sanjeevani Scheme',
        failed_clause: 'Clause 4.2(b): Land_Holding_Ha < 2.0 (Recorded: 2.06 Ha)',
        discrepancy_type: 'Unpartitioned Joint Family RTC Mutation Pending',
        explanation: 'Bhoomi RTC Survey #114/B shows 2.06 Ha jointly across two brothers; actual cultivated share verified by Village Accountant is 1.03 Ha.',
        jevify_urgency_score: 'critical',
        jevify_confidence: 0.96,
        status: 'PENDING_PANCHAYAT_REVIEW',
        assigned_officer: 'PDO — Gokak Rural Gram Panchayat',
      },
    },
    {
      id: 'CIT-024',
      name: 'Gangamma Kamble',
      name_local: 'ಗಂಗಮ್ಮ ಕಾಂಬಳೆ',
      age: 41,
      gender: 'Female',
      district: 'Kalaburagi',
      panchayat: 'Sedam Gram Panchayat',
      occupation: 'Farmer',
      social_category: 'SC',
      land_holding_ha: 1.15,
      annual_income_inr: 131000,
      kcc_active: false,
      hitl_flag: {
        case_id: 'HITL-KA-2026-02',
        target_scheme_id: 'SCH-01',
        target_scheme_name: 'Karnataka Krishi Sanjeevani Scheme',
        failed_clause: 'Clause 4.2(c): KCC_Active == true (Recorded: false)',
        discrepancy_type: 'Rural Bank CBS Sync Latency on Renewed KCC',
        explanation: 'Citizen renewed Kisan Credit Card on 2026-02-04 at Krishna Grameena Bank; physical passbook stamped, NABARD API sync pending.',
        jevify_urgency_score: 'high',
        jevify_confidence: 0.94,
        status: 'PENDING_PANCHAYAT_REVIEW',
        assigned_officer: 'PDO — Sedam Gram Panchayat',
      },
    },
    {
      id: 'CIT-025',
      name: 'Ningappa Kuruba',
      name_local: 'ನಿಂಗಪ್ಪ ಕುರುಬ',
      age: 51,
      gender: 'Male',
      district: 'Raichur',
      panchayat: 'Sindhanur Rural Panchayat',
      occupation: 'Farmer',
      social_category: 'OBC',
      land_holding_ha: 1.6,
      annual_income_inr: 254500,
      kcc_active: true,
      hitl_flag: {
        case_id: 'HITL-KA-2026-03',
        target_scheme_id: 'SCH-01',
        target_scheme_name: 'Karnataka Krishi Sanjeevani Scheme',
        failed_clause: 'Clause 4.2(c): Annual_Income_INR < ₹2,50,000 (Recorded: ₹2,54,500)',
        discrepancy_type: 'One-Time Crop Insurance Indemnity Counted as Income',
        explanation: 'Annual income includes a one-time ₹38,000 PMFBY flood compensation credit; net recurring agricultural income is ₹2,16,500.',
        jevify_urgency_score: 'high',
        jevify_confidence: 0.92,
        status: 'PENDING_PANCHAYAT_REVIEW',
        assigned_officer: 'Tahshildar / PDO — Sindhanur',
      },
    },
    {
      id: 'CIT-026',
      name: 'Parvathamma Halli',
      name_local: 'ಪಾರ್ವತಮ್ಮ ಹಳ್ಳಿ',
      age: 34,
      gender: 'Female',
      district: 'Dharwad',
      panchayat: 'Navalgund Gram Panchayat',
      occupation: 'Farmer',
      social_category: 'OBC',
      land_holding_ha: 2.12,
      annual_income_inr: 124000,
      kcc_active: true,
      hitl_flag: {
        case_id: 'HITL-KA-2026-04',
        target_scheme_id: 'SCH-01',
        target_scheme_name: 'Karnataka Krishi Sanjeevani Scheme',
        failed_clause: 'Clause 4.2(b): Land_Holding_Ha < 2.0 (Recorded: 2.12 Ha gross)',
        discrepancy_type: "'A-Kharab' Uncultivable Land Included in Gross RTC Area",
        explanation: 'RTC includes 0.24 Ha of rocky A-Kharab land; net cultivable area is 1.88 Ha (< 2.0 Ha statutory threshold).',
        jevify_urgency_score: 'critical',
        jevify_confidence: 0.97,
        status: 'PENDING_PANCHAYAT_REVIEW',
        assigned_officer: 'PDO — Navalgund Gram Panchayat',
      },
    },
    {
      id: 'CIT-027',
      name: 'Hanumanthappa Meti',
      name_local: 'ಹನುಮಂತಪ್ಪ ಮೇಟಿ',
      age: 48,
      gender: 'Male',
      district: 'Haveri',
      panchayat: 'Ranebennur Rural Panchayat',
      occupation: 'Agricultural Laborer',
      social_category: 'ST',
      land_holding_ha: 1.3,
      annual_income_inr: 109000,
      kcc_active: true,
      hitl_flag: {
        case_id: 'HITL-KA-2026-05',
        target_scheme_id: 'SCH-01',
        target_scheme_name: 'Karnataka Krishi Sanjeevani Scheme',
        failed_clause: "Clause 4.2(a): Occupation == 'Farmer' (e-Shram lists 'Agricultural Laborer')",
        discrepancy_type: 'Cross-Portal Occupation Taxonomy Mismatch (e-Shram vs FRUITS)',
        explanation: "Citizen holds valid FRUITS Farmer ID and 1.30 Ha RTC, but 2022 e-Shram card lists 'Agricultural Laborer'.",
        jevify_urgency_score: 'medium',
        jevify_confidence: 0.89,
        status: 'PENDING_PANCHAYAT_REVIEW',
        assigned_officer: 'PDO — Ranebennur Rural Panchayat',
      },
    },
    {
      id: 'CIT-028',
      name: 'Roopa Bai Rathod',
      name_local: 'ರೂಪಾ ಬಾಯಿ ರಾಠೋಡ್',
      age: 27,
      gender: 'Female',
      district: 'Shivamogga',
      panchayat: 'Bhadravathi Rural Panchayat',
      occupation: 'Farmer',
      social_category: 'SC',
      land_holding_ha: 1.45,
      annual_income_inr: 156000,
      kcc_active: false,
      hitl_flag: {
        case_id: 'HITL-KA-2026-06',
        target_scheme_id: 'SCH-01',
        target_scheme_name: 'Karnataka Krishi Sanjeevani Scheme',
        failed_clause: 'Clause 4.2(c): KCC_Active == true (Spouse KCC under succession)',
        discrepancy_type: 'Spousal Virasat / Succession Pending on KCC Account',
        explanation: 'Land RTC already mutated to widow Roopa Bai Rathod; KCC account name transfer from late spouse is in final bank stage.',
        jevify_urgency_score: 'critical',
        jevify_confidence: 0.98,
        status: 'PENDING_PANCHAYAT_REVIEW',
        assigned_officer: 'PDO — Bhadravathi Rural Panchayat',
      },
    },
    {
      id: 'CIT-029',
      name: 'Mahantesh Biradar',
      name_local: 'ಮಹಾಂತೇಶ ಬಿರಾದಾರ',
      age: 39,
      gender: 'Male',
      district: 'Tumakuru',
      panchayat: 'Tiptur Gram Panchayat',
      occupation: 'Farmer',
      social_category: 'OBC',
      land_holding_ha: 2.02,
      annual_income_inr: 168000,
      kcc_active: true,
      hitl_flag: {
        case_id: 'HITL-KA-2026-07',
        target_scheme_id: 'SCH-01',
        target_scheme_name: 'Karnataka Krishi Sanjeevani Scheme',
        failed_clause: 'Clause 4.2(b): Land_Holding_Ha < 2.0 (Recorded: 2.02 Ha)',
        discrepancy_type: 'NHAI Road Acquisition Deduction Not Yet Reflected in Bhoomi',
        explanation: '0.18 Ha acquired for highway widening in 2025 (Award Copy in DigiLocker); actual remaining holding is 1.84 Ha.',
        jevify_urgency_score: 'high',
        jevify_confidence: 0.93,
        status: 'PENDING_PANCHAYAT_REVIEW',
        assigned_officer: 'PDO — Tiptur Gram Panchayat',
      },
    },
  ];

  for (const h of hitlScenarios) {
    const idx = parseInt(h.id.split('-')[1], 10);
    citizens.push({
      id: h.id,
      name: h.name,
      name_local: h.name_local,
      age: h.age,
      gender: h.gender,
      state: 'KA',
      district: h.district,
      panchayat: h.panchayat,
      preferred_language: 'kn',
      dialect: 'Kannada',
      occupation: h.occupation,
      social_category: h.social_category,
      land_holding_ha: h.land_holding_ha,
      annual_income_inr: h.annual_income_inr,
      kcc_active: h.kcc_active,
      ration_card_type: 'BPL',
      aadhaar_masked: `XXXX-XXXX-${3000 + idx}`,
      abha_id: `91-${3000 + idx}-7740-${1000 + idx}`,
      digilocker_uri: `in.gov.digilocker://citizen/${h.id}`,
      bank_account_masked: `Canara Bank •••• ${4000 + idx}`,
      phone_masked: `+91 9480${idx % 10} •••${String(idx).padStart(2, '0')}`,
      in_ka_100_pool: true,
      is_hero: false,
      hero_tag: 'Tier 03 HITL Review Candidate',
      verifiable_credentials: [
        { vc_type: 'in.gov.karnataka.bhoomi.rtc.v2', issuer: 'Bhoomi Monitoring Cell, KA', verified_at: '2026-02-09' },
        { vc_type: 'in.gov.nad.income.certificate', issuer: 'Nadakacheri Karnataka', verified_at: '2026-01-17' },
        { vc_type: 'in.gov.uidai.aadhaar.kyc', issuer: 'UIDAI', verified_at: '2026-02-01' },
      ],
      hitl_flag: h.hitl_flag,
    });
  }

  const nonSch01Occupations = ['Artisan', 'Student', 'Homemaker', 'Weaver', 'Farmer', 'Daily Wage Worker'];
  for (let idx = 30; idx < 104; idx++) {
    const cid = `CIT-${String(idx).padStart(3, '0')}`;
    const isFemale = idx % 2 === 0;
    const namePair = isFemale ? kaNamesFemale[idx % kaNamesFemale.length] : kaNamesMale[idx % kaNamesMale.length];
    const [dist, panchayat] = kaDistricts[idx % kaDistricts.length];
    const occ = nonSch01Occupations[idx % nonSch01Occupations.length];
    const cat = socialCategories[idx % socialCategories.length];

    let age = 22 + (idx % 35);
    let land = Number(((idx % 5) * 0.25).toFixed(2));
    let income = 105000 + ((idx * 2900) % 130000);
    let kcc = false;

    if (occ === 'Student') {
      age = 18 + (idx % 7);
      land = 0.0;
      income = 95000 + ((idx * 3100) % 120000);
      kcc = false;
    } else if (occ === 'Farmer') {
      age = 28 + (idx % 30);
      if (idx % 3 === 0) {
        land = Number((2.25 + (idx % 15) * 0.15).toFixed(2));
        income = 175000 + idx * 900;
        kcc = true;
      } else {
        land = Number((0.8 + (idx % 9) * 0.1).toFixed(2));
        income = 275000 + idx * 1200;
        kcc = false;
      }
    }

    citizens.push({
      id: cid,
      name: `${namePair[0]} #${idx}`,
      name_local: namePair[1],
      age,
      gender: isFemale ? 'Female' : 'Male',
      state: 'KA',
      district: dist,
      panchayat,
      preferred_language: 'kn',
      dialect: 'Kannada',
      occupation: occ,
      social_category: cat,
      land_holding_ha: land,
      annual_income_inr: income,
      kcc_active: kcc,
      ration_card_type: income < 200000 ? 'BPL' : 'APL',
      aadhaar_masked: `XXXX-XXXX-${3000 + idx}`,
      abha_id: `91-${3000 + idx}-6610-${1000 + idx}`,
      digilocker_uri: `in.gov.digilocker://citizen/${cid}`,
      bank_account_masked: `Karnataka Bank •••• ${4000 + idx}`,
      phone_masked: `+91 9449${idx % 10} •••${String(idx % 100).padStart(2, '0')}`,
      in_ka_100_pool: true,
      is_hero: false,
      hero_tag: null,
      verifiable_credentials: [
        { vc_type: 'in.gov.karnataka.ahara.rationcard', issuer: 'Dept. of Food & Civil Supplies, KA', verified_at: '2026-01-20' },
        { vc_type: 'in.gov.nad.income.certificate', issuer: 'Nadakacheri Karnataka', verified_at: '2026-01-12' },
        { vc_type: 'in.gov.uidai.aadhaar.kyc', issuer: 'UIDAI', verified_at: '2026-02-01' },
      ],
      hitl_flag: null,
    });
  }

  const nationalConfigs = [
    ['UP', 'Varanasi', 'Sevapuri Gram Panchayat', 'hi', 'Bhojpuri / Hindi', 'रमेश / सुरेश यादव', ['Ramnath Yadav', 'Geeta Devi', 'Brijesh Maurya', 'Kusum Lata']],
    ['BR', 'Muzaffarpur', 'Kurhani Gram Panchayat', 'bho', 'Bhojpuri / Maithili', 'बिनोद पासवान', ['Binod Paswan', 'Champa Devi', 'Santosh Thakur', 'Poonam Kumari']],
    ['MH', 'Nashik', 'Sinnar Gram Panchayat', 'mr', 'Marathi', 'मंगेश जाधव', ['Mangesh Jadhav', 'Vaishali Shinde', 'TukaramMore', 'Rekha Pawar']],
    ['TN', 'Madurai', 'Melur Panchayat Union', 'ta', 'Tamil', 'மீனாட்சி அம்மாள்', ['Murugan Selvam', 'Meenakshi Ammal', 'Karthikraja P', 'Selvi Muthu']],
    ['MP', 'Sehore', 'Ashta Janpad Panchayat', 'hi', 'Hindi (Malwi)', 'कमल सिंह चौहान', ['Kamal Singh Chouhan', 'Rekha Bai', 'Dinesh Ahirwar', 'Kavita Solanki']],
    ['RJ', 'Jodhpur', 'Osian Gram Panchayat', 'hi', 'Marwari / Hindi', 'भंवरलाल बिश्नोई', ['Bhanwarlal Bishnoi', 'Kamla Devi', 'Ratanaram Meghwal', 'Pushpa Kanwar']],
  ];
  const natOccupations = ['Farmer', 'Artisan', 'Student', 'Farmer', 'Daily Wage Worker', 'Homemaker'];

  for (let idx = 104; idx <= 200; idx++) {
    const cid = `CIT-${String(idx).padStart(3, '0')}`;
    const [stateCode, dist, panchayat, lang, dialect, localSample, namesList] =
      nationalConfigs[idx % nationalConfigs.length];
    const baseName = namesList[Math.floor(idx / nationalConfigs.length) % namesList.length];
    const isFemale = /(Devi|Ammal|Bai|Kumari|Lata|Shinde|Pawar|Muthu|Solanki|Kanwar)/.test(baseName);
    const occ = natOccupations[idx % natOccupations.length];
    const cat = socialCategories[idx % socialCategories.length];

    let age = 21 + (idx % 32);
    let land = Number(((idx % 4) * 0.3).toFixed(2));
    let income = 108000 + ((idx * 2100) % 120000);
    let kcc = false;

    if (occ === 'Student') {
      age = 18 + (idx % 6);
      land = 0.0;
      income = 92000 + ((idx * 1900) % 110000);
      kcc = false;
    } else if (occ === 'Farmer') {
      age = 26 + (idx % 34);
      land = Number((0.65 + ((idx * 11) % 160) / 100.0).toFixed(2));
      income = 115000 + ((idx * 2300) % 125000);
      kcc = idx % 2 === 0;
    }

    citizens.push({
      id: cid,
      name: `${baseName} (${dist})`,
      name_local: localSample,
      age,
      gender: isFemale ? 'Female' : 'Male',
      state: stateCode,
      district: dist,
      panchayat,
      preferred_language: lang,
      dialect,
      occupation: occ,
      social_category: cat,
      land_holding_ha: land,
      annual_income_inr: income,
      kcc_active: kcc,
      ration_card_type: income < 210000 ? 'PHH-BPL' : 'APL',
      aadhaar_masked: `XXXX-XXXX-${5000 + idx}`,
      abha_id: `91-${5000 + idx}-9912-${2000 + idx}`,
      digilocker_uri: `in.gov.digilocker://citizen/${cid}`,
      bank_account_masked: `Punjab National Bank •••• ${6000 + idx}`,
      phone_masked: `+91 9810${idx % 10} •••${String(idx % 100).padStart(2, '0')}`,
      in_ka_100_pool: false,
      is_hero: false,
      hero_tag: null,
      verifiable_credentials: [
        { vc_type: 'in.gov.land.record.vc', issuer: `State Land Registry (${stateCode})`, verified_at: '2026-01-25' },
        { vc_type: 'in.gov.nad.income.certificate', issuer: `e-District (${stateCode})`, verified_at: '2026-01-10' },
        { vc_type: 'in.gov.uidai.aadhaar.kyc', issuer: 'UIDAI', verified_at: '2026-02-01' },
      ],
      hitl_flag: null,
    });
  }

  for (const c of citizens) {
    c.zkp_commitments = {
      income_proof: zkpCommitment(c.id, 'annual_income_inr', c.annual_income_inr),
      land_proof: zkpCommitment(c.id, 'land_holding_ha', c.land_holding_ha),
      domicile_proof: zkpCommitment(c.id, 'state', c.state),
      occupation_proof: zkpCommitment(c.id, 'occupation', c.occupation),
      kcc_proof: zkpCommitment(c.id, 'kcc_active', c.kcc_active),
    };
  }

  return citizens;
}

const CITIZENS = generateCitizens();
const CITIZENS_BY_ID = Object.fromEntries(CITIZENS.map((c) => [c.id, c]));

const CONSENT_ARTEFACTS = [];
const DBT_DISPATCH_LEDGER = [];
const HITL_OVERRIDES = {};
const HITL_AUDIT_TRAIL = [];

function evaluateOperator(actual, operator, expected) {
  if (actual === undefined || actual === null) return false;
  if (operator === '==') return actual === expected;
  if (operator === '!=') return actual !== expected;
  if (operator === '<') return Number(actual) < Number(expected);
  if (operator === '<=') return Number(actual) <= Number(expected);
  if (operator === '>') return Number(actual) > Number(expected);
  if (operator === '>=') return Number(actual) >= Number(expected);
  if (operator === 'in') {
    return Array.isArray(expected) ? expected.includes(actual) : String(expected).includes(String(actual));
  }
  return false;
}

function evaluateCitizenScheme(citizen, scheme, hitlOverrides = HITL_OVERRIDES) {
  const cid = citizen.id;
  const sid = scheme.id;
  const overrideRecord = hitlOverrides[`${cid}::${sid}`];
  const clauseTraces = [];
  let allPassed = true;

  for (const rule of scheme.rules || []) {
    const actual = citizen[rule.field];
    const passed = evaluateOperator(actual, rule.operator, rule.value);
    if (!passed) allPassed = false;
    clauseTraces.push({
      field: rule.field,
      operator: rule.operator,
      threshold: rule.value,
      label: rule.label || `${rule.field} ${rule.operator} ${rule.value}`,
      clause_ref: rule.clause_ref || 'Clause 1.1',
      zkp_predicate: rule.zkp_predicate || 'ZKP_PREDICATE',
      zkp_proof_hash: 'zkp_snark_' + simpleHash(`${cid}::${rule.field}::${rule.value}::${passed}`).slice(0, 20),
      raw_pii_exposed: false,
      passed,
    });
  }

  let hitlApplied = false;
  if (!allPassed && overrideRecord && overrideRecord.decision === 'APPROVED_OVERRIDE') {
    allPassed = true;
    hitlApplied = true;
  }

  const gazette = scheme.gazette || {};
  const chainOfEntitlement = {
    gazette_id: gazette.gazette_id || 'GAZ-2026-001',
    notification_date: gazette.notification_date || '2026-01-01',
    ministry: scheme.ministry || '',
    section: gazette.section || '',
    clause: gazette.clause || '',
    excerpt: gazette.excerpt || '',
    boolean_ast: scheme.boolean_ast || '',
    deterministic_engine: 'Jan-Setu RuleAST v2.4 (Zero LLM Hallucination)',
    hitl_override_applied: hitlApplied,
    hitl_audit: overrideRecord || null,
  };

  const lang = citizen.preferred_language || 'hi';
  const voiceScripts = scheme.voice_scripts || {};
  const scriptTemplate = voiceScripts[lang] || voiceScripts.hi || voiceScripts.en || '';
  const firstName = citizen.name.split(' (')[0].split(' #')[0];

  return {
    citizen_id: cid,
    citizen_name: citizen.name,
    scheme_id: sid,
    scheme_code: scheme.code,
    scheme_name: scheme.name,
    scheme_name_hi: scheme.name_hi || scheme.name,
    scheme_name_kn: scheme.name_kn || scheme.name,
    ministry: scheme.ministry,
    category: scheme.category,
    level: scheme.level,
    benefit_amount_inr: scheme.benefit_amount_inr,
    benefit_summary: scheme.benefit_summary,
    disbursement_rail: scheme.disbursement_rail,
    eligible: allPassed,
    hitl_override_applied: hitlApplied,
    passed_clauses_count: clauseTraces.filter((t) => t.passed).length,
    total_clauses_count: clauseTraces.length,
    clause_traces: clauseTraces,
    chain_of_entitlement: chainOfEntitlement,
    required_vcs: scheme.required_vcs || [],
    personalized_voice_prompt: scriptTemplate.replace('{name}', firstName),
  };
}

function createDepaConsentArtefact(citizen, scheme, consentChannel = 'BHASHINI_VOICE_ASR', utterance = 'Haan, manzoor hai') {
  const nowIso = new Date().toISOString();
  const seed = `${citizen.id}::${scheme.id}::${nowIso}::${utterance}`;
  return {
    artefact_id: 'DEPA-CA-' + simpleHash(seed).slice(0, 14).toUpperCase(),
    standard: 'MeitY DEPA v1.2 / DPDP Act 2023 Section 6',
    status: 'ACTIVE_PURPOSE_BOUND',
    citizen_id: citizen.id,
    citizen_digilocker_uri: citizen.digilocker_uri,
    fiduciary: 'Jan-Setu Sovereign Entitlement Broker (NIC)',
    data_user: scheme.ministry,
    purpose_code: `PROACTIVE_WELFARE_CLAIM::${scheme.code}`,
    consent_channel: consentChannel,
    spoken_utterance_verified: utterance,
    credentials_authorized: scheme.required_vcs || [],
    storage_policy: 'TRANSIENT_IN_MEMORY_ONLY (Zero Permanent PII Retention)',
    transient_access_token: 'depa_tok_' + simpleHash(seed + '::TOKEN').slice(0, 24),
    created_at: nowIso,
    revoked_at: null,
  };
}

function dispatchDbtTransaction(citizen, scheme, consentArtefact) {
  const nowIso = new Date().toISOString();
  consentArtefact.status = 'REVOKED_POST_EXECUTION';
  consentArtefact.revoked_at = nowIso;
  consentArtefact.transient_access_token = 'REVOKED_ZEROED_0x00000000';
  return {
    audit_record_id: `PID-777-${citizen.id.split('-')[1]}-${scheme.id.split('-')[1]}`,
    pid_reference: 'PID-777',
    utr_number: 'PFMS2026' + simpleHash(`${citizen.id}::${scheme.id}::${nowIso}`).slice(0, 10).toUpperCase(),
    status: 'DBT_CREDITED_SUCCESS',
    citizen_id: citizen.id,
    citizen_name: citizen.name,
    bank_account_masked: citizen.bank_account_masked,
    aadhaar_bridge_status: 'NPCI_APBS_ACTIVE',
    scheme_id: scheme.id,
    scheme_name: scheme.name,
    amount_credited_inr: scheme.benefit_amount_inr,
    disbursement_rail: scheme.disbursement_rail,
    attached_digilocker_vcs: scheme.required_vcs || [],
    depa_consent_artefact_id: consentArtefact.artefact_id,
    depa_token_status: 'IMMEDIATELY_REVOKED (DPDP Act 2023 Compliant)',
    processing_duration_seconds: 90,
    intermediary_leakage_inr: 0,
    dispatched_at: nowIso,
  };
}

// Seed initial transaction
const initialCa = createDepaConsentArtefact(CITIZENS_BY_ID['CIT-002'], SCHEMES[0], 'BHASHINI_VOICE_ASR', 'ಹೌದು, ಒಪ್ಪಿಗೆ ಇದೆ (Haan, manzoor hai)');
CONSENT_ARTEFACTS.push(initialCa);
DBT_DISPATCH_LEDGER.push(dispatchDbtTransaction(CITIZENS_BY_ID['CIT-002'], SCHEMES[0], initialCa));

const JEVIFY_RECIPES = {
  'gemma-4-e4b-it.llamacpp': {
    name: 'gemma-4-e4b-it.llamacpp',
    model: 'Gemma 4 E4B (Q8_0)',
    kind: 'endpoint',
    dialect: 'llama.cpp',
    hardware_profile: 'Local GPU / Edge Node',
    readout_rung: 'named_token_logprobs',
    median_latency_ms: 28,
    policy_29_accuracy: '29/29 (100%)',
    policy_hard_52_accuracy: '45/52 (86.5%)',
    long_state_24: '6/6 at 2k (37 ms/question)',
    recipe_hash: 'sha256:8a4e91c7d2f04b18e6c2291a7f34e9b2',
    thinking_disabled_verified: true,
    prefix_cache_enabled: true,
  },
  'ternary-bonsai-2-27b.llamacpp': {
    name: 'ternary-bonsai-2-27b.llamacpp',
    model: 'Ternary Bonsai 2 27B (PQ2_0)',
    kind: 'endpoint',
    dialect: 'llama.cpp (PrismML raw prompt)',
    hardware_profile: 'NIC District Server (64k Context Slot)',
    readout_rung: 'named_token_logprobs',
    median_latency_ms: 99,
    policy_29_accuracy: '29/29 (100%)',
    policy_hard_52_accuracy: '46/52 (88.5%)',
    long_state_24: '24/24 up to 32k (136 ms/question, 33,946 tokens cached)',
    recipe_hash: 'sha256:3c9b14e0a72d85f1b44c9e02d11f77a8',
    thinking_disabled_verified: true,
    prefix_cache_enabled: true,
  },
  'deepseek-v4-flash-vision-exp-keys.vllm': {
    name: 'deepseek-v4-flash-vision-exp-keys.vllm',
    model: 'DeepSeek-V4-Flash (Vision + Long State)',
    kind: 'endpoint',
    dialect: 'vLLM',
    hardware_profile: 'State Data Center Cluster (LAN)',
    readout_rung: 'named_token_logprobs',
    median_latency_ms: 359,
    policy_29_accuracy: '28/29 (96.6%)',
    policy_hard_52_accuracy: '47/52 (90.4%)',
    long_state_24: '24/24 up to 32k (359 ms/question, 31,232 tokens cached)',
    recipe_hash: 'sha256:f17d40a8b92e55c3109d4e8a6b22c190',
    thinking_disabled_verified: true,
    prefix_cache_enabled: true,
  },
};

let ACTIVE_SIWC_SESSION = {
  authenticated: true,
  provider: 'OpenAI Sign in with ChatGPT (SIWC)',
  docs_url: 'https://developers.openai.com/siwc',
  client_id: 'client_jansetu_dpi_india_stack_01',
  host_id: 'vm-jansetu-nic-node-ka-01',
  user: {
    sub: 'oauth2|chatgpt|usr_9948102a',
    name: 'District Welfare Officer (Mandya / Varanasi DPI Node)',
    email: 'dwo.jansetu@india-stack.gov.in',
    plan_tier: 'ChatGPT Pro (SIWC Token-Sharing Enabled)',
    workspace: 'Jan-Setu Sovereign DPI Pilot',
  },
  scopes: ['openid', 'profile', 'email', 'openai.responses.read_write', 'openai.models.read'],
  pkce: {
    code_challenge_method: 'S256',
    code_challenge: 'E9Melhoa2OwvFrGMTJguCHaoeK1t8URWbuGJSstw-cM',
    verified: true,
  },
  eligible_models: [
    { id: 'gpt-4o', role: 'Multilingual Gazette Clause Parser (Strict AST Output)', status: 'READY' },
    { id: 'o3-mini', role: 'Boolean Logic Consistency Verifier', status: 'READY' },
    { id: 'gpt-4.1-mini', role: 'Bhashini Regional Dialect Fallback NLU', status: 'READY' },
  ],
  active_model: 'gpt-4o',
  connected_at: '2026-09-30T11:30:00Z',
  token_expires_in_sec: 3600,
  tier_01_guardrail: 'SIWC LLM calls are strictly sandboxed to Stage 01 Gazette text-to-AST parsing; eligibility decisions remain 100% deterministic.',
};

function buildKnowledgeGraph() {
  const nodes = [];
  const edges = [];
  const seen = new Set();
  const addNode = (id, label, type, meta = {}) => {
    if (!seen.has(id)) {
      seen.add(id);
      nodes.push({ id, label, type, meta });
    }
  };
  for (const s of SCHEMES) {
    const minId = 'MIN::' + s.ministry.slice(0, 28);
    const gazId = 'GAZ::' + s.gazette.gazette_id;
    addNode(minId, s.ministry, 'MINISTRY');
    addNode(gazId, s.gazette.gazette_id, 'GAZETTE', { date: s.gazette.notification_date, clause: s.gazette.clause });
    addNode(s.id, s.name, 'SCHEME', { benefit_inr: s.benefit_amount_inr, state_scope: s.state_scope, ast: s.boolean_ast });
    edges.push({ source: minId, target: gazId, relation: 'PUBLISHES_GAZETTE' });
    edges.push({ source: gazId, target: s.id, relation: 'DEFINES_ENTITLEMENT' });
    for (const r of s.rules) {
      const predId = `PRED::${r.zkp_predicate}`;
      addNode(predId, r.label, 'BOOLEAN_PREDICATE', { field: r.field, operator: r.operator, value: r.value });
      edges.push({ source: s.id, target: predId, relation: 'REQUIRES_ZKP_CLAUSE', clause: r.clause_ref });
    }
  }
  return { total_nodes: nodes.length, total_edges: edges.length, nodes, edges };
}

function askJevifyBatch(state, questions, recipeName = 'gemma-4-e4b-it.llamacpp') {
  const recipe = JEVIFY_RECIPES[recipeName] || JEVIFY_RECIPES['gemma-4-e4b-it.llamacpp'];
  const cachedTokens = Math.max(24, Math.floor(state.split(/\s+/).length * 1.35));
  const uttLower = (state.includes(':') && state.toLowerCase().startsWith('citizen response') ? state.split(':').slice(1).join(':') : state).toLowerCase();
  const hasNeg = /(nahi|nahin|मत|नहीं|नाहीं|मना|do not|don't|dont|cancel|reject|refuse|declined|ಬೇಡ|ಇಲ್ಲ|नाही|नको|வேண்டாம்|\bno\b)/.test(uttLower);
  const hasAff = /(haan|manzoor|approve|मंजूर|हाँ|सहमत|ಒಪ್ಪಿಗೆ|ಹೌದು|haudu|होय|ஆம்|otp_verified|\byes\b|\b1\b)/.test(uttLower);

  const answersList = questions.map((q) => {
    const kind = (q.kind || 'choice').toLowerCase();
    const x_jevify = {
      recipe: recipe.name,
      kind: recipe.kind,
      readout_rung: recipe.readout_rung,
      cached_tokens: cachedTokens,
      question_tokens: 14,
      latency_ms: recipe.median_latency_ms,
      recipe_hash: recipe.recipe_hash,
      degraded: false,
    };
    if (kind === 'noul') {
      let pTrue = 0.96;
      if ((q.id || '').includes('negation') || (q.prompt || '').toLowerCase().includes('declined')) {
        pTrue = hasNeg ? 0.96 : 0.03;
      } else if ((q.id || '').includes('consent')) {
        pTrue = hasNeg ? 0.02 : hasAff ? 0.98 : 0.16;
      }
      const pFalse = Number((1 - pTrue).toFixed(4));
      return {
        id: q.id,
        kind: 'noul',
        prompt: q.prompt,
        noul: pTrue,
        choice: pTrue >= 0.5 ? 'true' : 'false',
        confidence: Math.max(pTrue, pFalse),
        probabilities: { true: pTrue, false: pFalse },
        x_jevify,
      };
    }
    const opts = q.options || ['agriculture', 'women_child', 'education'];
    const best = kind === 'score' ? opts[opts.length - 1] : hasNeg && opts.includes('abort_and_purge') ? 'abort_and_purge' : opts[0];
    const probs = Object.fromEntries(opts.map((o) => [o, o === best ? 0.88 : Number((0.12 / Math.max(1, opts.length - 1)).toFixed(4))]));
    return {
      id: q.id,
      kind,
      prompt: q.prompt,
      choice: best,
      score: kind === 'score' ? 0.94 : undefined,
      confidence: 0.88,
      probabilities: probs,
      x_jevify,
    };
  });

  return {
    protocol: 'jevify/1.0 (TypeSafe Jev API Compatible)',
    warm_state: { state_hash: 'sha256:' + simpleHash(state).slice(0, 16), cached_tokens: cachedTokens, warm_requests: 1, prefix_cache_hit: true },
    recipe: recipe.name,
    recipe_hash: recipe.recipe_hash,
    total_latency_ms: recipe.median_latency_ms * answersList.length,
    answers: Object.fromEntries(answersList.map((a) => [a.id, a])),
    answers_list: answersList,
  };
}

export async function handleOfflineRequest(path, options = {}) {
  const [pathname, queryString] = path.split('?');
  const params = new URLSearchParams(queryString || '');
  let body = {};
  let uploadedFilename = null;
  if (typeof options.body === 'string') {
    try {
      body = JSON.parse(options.body);
    } catch {
      body = {};
    }
  } else if (typeof FormData !== 'undefined' && options.body instanceof FormData) {
    const file = options.body.get('file');
    const recipe = options.body.get('jevify_recipe') || 'gemma-4-e4b-it.llamacpp';
    uploadedFilename = file?.name || 'uploaded_gazette.pdf';
    let rawText = '';
    if (file && typeof file.text === 'function') {
      rawText = await file.text();
    }
    body = {
      title: uploadedFilename,
      raw_text: rawText || 'Karnataka Krishi Sanjeevani farmer holding less than 2.0 hectares income below 2,50,000 KCC active',
      jevify_recipe: recipe,
    };
  }

  if (pathname === '/health') {
    const kg = buildKnowledgeGraph();
    return {
      status: 'OPERATIONAL',
      service: 'Jan-Setu AI (जन-सेतु) — India Stack Proactive Entitlement Engine',
      track: 'Track 1: AI for Digital Public Infrastructure (DPI) & Governance',
      citizens_loaded: CITIZENS.length,
      ka_100_cohort_size: CITIZENS.filter((c) => c.in_ka_100_pool).length,
      schemes_loaded: SCHEMES.length,
      knowledge_graph: { engine: 'Neo4j / GraphRAG Boolean AST Engine', nodes: kg.total_nodes, edges: kg.total_edges },
      depa_consent_broker: { standard: 'MeitY DEPA v1.2 + DPDP Act 2023', storage_mode: 'Transient Zero-Knowledge (Zero Raw PII Stored)', active_or_revoked_artefacts: CONSENT_ARTEFACTS.length },
      bhashini_voice_pipeline: { asr_model: 'AI4Bharat IndicWav2Vec', nlu_model: 'IndicBART + Jevify Single-Pass Readout', tts_model: 'AI4Bharat IndicTTS', supported_languages: ['hi', 'kn', 'en', 'bho', 'mr', 'ta'] },
      ai_subsystems: {
        jevify: { repo: 'https://github.com/fidecastro/jevify', default_recipe: 'gemma-4-e4b-it.llamacpp', readout_rung: 'named_token_logprobs', recipes_available: Object.keys(JEVIFY_RECIPES).length },
        openai_siwc: { docs: 'https://developers.openai.com/siwc', authenticated: ACTIVE_SIWC_SESSION.authenticated, active_model: ACTIVE_SIWC_SESSION.active_model, plan_tier: ACTIVE_SIWC_SESSION.user.plan_tier },
      },
    };
  }

  if (pathname === '/schemes') {
    return { total: SCHEMES.length, schemes: SCHEMES, knowledge_graph: buildKnowledgeGraph() };
  }

  if (pathname === '/policy/ingest' || pathname === '/policy/upload-pdf') {
    const schemeObj = SCHEMES.find((s) => s.id === body.preset_scheme_id) || SCHEMES[0];
    const hasCustomText = Boolean(body.raw_text && String(body.raw_text).trim());
    const excerpt = hasCustomText ? String(body.raw_text).trim() : schemeObj.gazette.excerpt;

    let rules = schemeObj.rules;
    let booleanAst = schemeObj.boolean_ast;
    if (hasCustomText) {
      const tl = excerpt.toLowerCase();
      const extracted = [];
      const astParts = [];
      if (tl.includes('karnataka') || tl.includes('bhoomi') || tl.includes(' ka ')) {
        extracted.push({ field: 'state', operator: '==', value: 'KA', label: 'Domicile State == Karnataka (KA)', clause_ref: 'Clause 4.2(a)', zkp_predicate: 'ZKP_DOMICILE_KA' });
        astParts.push('State == "KA"');
      } else if (tl.includes('maharashtra') || tl.includes(' mh ')) {
        extracted.push({ field: 'state', operator: '==', value: 'MH', label: 'Domicile State == Maharashtra (MH)', clause_ref: 'Clause 3.1(a)', zkp_predicate: 'ZKP_DOMICILE_MH' });
        astParts.push('State == "MH"');
      } else if (tl.includes('uttar pradesh') || tl.includes(' up ')) {
        extracted.push({ field: 'state', operator: '==', value: 'UP', label: 'Domicile State == Uttar Pradesh (UP)', clause_ref: 'Clause 3.1(a)', zkp_predicate: 'ZKP_DOMICILE_UP' });
        astParts.push('State == "UP"');
      }
      if (/(farmer|cultivat|krishi|kisan)/.test(tl)) {
        extracted.push({ field: 'occupation', operator: '==', value: 'Farmer', label: 'Primary Occupation == Cultivator / Farmer', clause_ref: 'Clause 4.2(a)', zkp_predicate: 'ZKP_OCCUPATION_FARMER' });
        astParts.push('Occupation == "Farmer"');
      } else if (/(student|scholarship|matric)/.test(tl)) {
        extracted.push({ field: 'occupation', operator: '==', value: 'Student', label: 'Primary Occupation == Enrolled Student', clause_ref: 'Clause 4.4(a)', zkp_predicate: 'ZKP_STUDENT_ACTIVE' });
        astParts.push('Occupation == "Student"');
      } else if (/(artisan|vishwakarma|craft)/.test(tl)) {
        extracted.push({ field: 'occupation', operator: '==', value: 'Artisan', label: 'Primary Occupation == Traditional Artisan', clause_ref: 'Clause 4.1(a)', zkp_predicate: 'ZKP_OCCUPATION_ARTISAN' });
        astParts.push('Occupation == "Artisan"');
      }
      if (/(women|woman|female|girl|lakshmi|bahin|matru|widow)/.test(tl)) {
        extracted.push({ field: 'gender', operator: '==', value: 'Female', label: 'Beneficiary Gender == Female', clause_ref: 'Clause 2.1(a)', zkp_predicate: 'ZKP_GENDER_FEMALE' });
        astParts.push('Gender == "Female"');
      }
      const landMatch = tl.match(/(\d+(?:\.\d+)?)\s*(?:hectare|ha|acre)/);
      if (landMatch) {
        const val = parseFloat(landMatch[1]);
        extracted.push({ field: 'land_holding_ha', operator: '<', value: val, label: `Agricultural Land Holding < ${val} Hectares`, clause_ref: 'Clause 4.2(b)', zkp_predicate: 'ZKP_LAND_THRESHOLD' });
        astParts.push(`Land_Holding_Ha < ${val}`);
      }
      let incomeVal = 250000;
      if (excerpt.includes('2,00,000') || excerpt.includes('200000')) incomeVal = 200000;
      else if (excerpt.includes('1,80,000') || excerpt.includes('180000')) incomeVal = 180000;
      extracted.push({ field: 'annual_income_inr', operator: '<', value: incomeVal, label: `Annual Household Income < ₹${incomeVal.toLocaleString('en-IN')}`, clause_ref: 'Clause 4.2(c)', zkp_predicate: 'ZKP_INCOME_THRESHOLD' });
      astParts.push(`Annual_Income_INR < ${incomeVal}`);
      if (tl.includes('kisan credit card') || tl.includes('kcc')) {
        extracted.push({ field: 'kcc_active', operator: '==', value: true, label: 'Active Kisan Credit Card (KCC)', clause_ref: 'Clause 4.2(c)', zkp_predicate: 'ZKP_KCC_VERIFIED' });
        astParts.push('KCC_Active == true');
      }
      rules = extracted;
      booleanAst = `IF (${astParts.join(' AND ')}) -> Proactive_Entitlement_Tier_1`;
    }

    return {
      status: 'INGESTED_TO_KNOWLEDGE_GRAPH',
      ingestion_time_seconds: 3.8,
      uploaded_filename: uploadedFilename || undefined,
      scheme: {
        id: schemeObj.id,
        code: hasCustomText ? 'CUSTOM-GAZETTE-2026' : schemeObj.code,
        name: body.title || schemeObj.name,
        name_hi: schemeObj.name_hi,
        name_kn: schemeObj.name_kn,
        ministry: body.ministry || schemeObj.ministry,
        benefit_amount_inr: schemeObj.benefit_amount_inr,
        benefit_summary: schemeObj.benefit_summary,
        required_vcs: schemeObj.required_vcs,
      },
      gazette: { ...schemeObj.gazette, excerpt },
      boolean_ast: booleanAst,
      rules,
      jevify_readout: askJevifyBatch(excerpt, [
        { id: 'sector_classification', kind: 'choice', prompt: 'Which public welfare domain does this gazette clause govern?', options: ['agriculture', 'women_child', 'education', 'healthcare', 'msme_artisan'] },
        { id: 'determinism_grade', kind: 'score', prompt: 'How strictly deterministic are the statutory eligibility thresholds?', options: ['ambiguous', 'partial', 'clear', 'strict_boolean'] },
        { id: 'land_ceiling_present', kind: 'noul', prompt: 'The gazette specifies a maximum agricultural land holding ceiling.' },
        { id: 'income_ceiling_present', kind: 'noul', prompt: 'The gazette specifies a maximum household annual income threshold.' },
      ], body.jevify_recipe),
      openai_siwc_parser: { active_model: ACTIVE_SIWC_SESSION.active_model, tier_01_compliance: 'LLM restricted strictly to text-to-AST parsing; zero black-box eligibility scoring.' },
    };
  }

  if (pathname === '/citizens') {
    const cohort = params.get('cohort') || 'all';
    const state = params.get('state') || '';
    const search = (params.get('search') || '').toLowerCase();
    let filtered = CITIZENS;
    if (cohort === 'ka_100') filtered = filtered.filter((c) => c.in_ka_100_pool);
    if (state) filtered = filtered.filter((c) => c.state.toUpperCase() === state.toUpperCase());
    if (search) {
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(search) ||
          c.id.toLowerCase().includes(search) ||
          c.district.toLowerCase().includes(search) ||
          c.occupation.toLowerCase().includes(search) ||
          c.state.toLowerCase().includes(search)
      );
    }
    const enriched = filtered.map((c) => {
      const matched = [];
      let totalInr = 0;
      for (const s of SCHEMES) {
        const ev = evaluateCitizenScheme(c, s);
        if (ev.eligible) {
          matched.push({ scheme_id: s.id, scheme_name: s.name, benefit_amount_inr: s.benefit_amount_inr });
          totalInr += s.benefit_amount_inr;
        }
      }
      return { ...c, matched_schemes_count: matched.length, total_unlocked_benefit_inr: totalInr, matched_schemes_preview: matched.slice(0, 4) };
    });
    return { cohort, total: enriched.length, citizens: enriched };
  }

  if (pathname.startsWith('/citizens/') && pathname.endsWith('/entitlements')) {
    const citizenId = decodeURIComponent(pathname.split('/')[2]);
    const citizen = CITIZENS_BY_ID[citizenId] || CITIZENS[0];
    const evals = SCHEMES.map((s) => evaluateCitizenScheme(citizen, s));
    const eligibleList = evals.filter((e) => e.eligible);
    const nonEligibleList = evals.filter((e) => !e.eligible);
    const consents = CONSENT_ARTEFACTS.filter((ca) => ca.citizen_id === citizen.id);
    const dbs = DBT_DISPATCH_LEDGER.filter((tx) => tx.citizen_id === citizen.id);
    return {
      citizen,
      summary: {
        total_schemes_evaluated: SCHEMES.length,
        pre_approved_count: eligibleList.length,
        total_annual_entitlement_inr: eligibleList.reduce((acc, e) => acc + e.benefit_amount_inr, 0),
        disbursed_count: dbs.length,
        disbursed_total_inr: dbs.reduce((acc, tx) => acc + tx.amount_credited_inr, 0),
        zero_pii_stored_centrally: true,
      },
      pre_approved_entitlements: eligibleList,
      other_evaluated_schemes: nonEligibleList,
      depa_consent_artefacts: consents,
      dbt_disbursement_ledger: dbs,
    };
  }

  if (pathname === '/match/cohort') {
    const baseScheme = SCHEMES.find((s) => s.id === (body.scheme_id || 'SCH-01')) || SCHEMES[0];
    const scheme = body.custom_rules
      ? { ...baseScheme, rules: body.custom_rules, boolean_ast: body.custom_boolean_ast || baseScheme.boolean_ast }
      : baseScheme;
    const pool = (body.cohort || 'ka_100') === 'ka_100' ? CITIZENS.filter((c) => c.in_ka_100_pool) : CITIZENS;
    const eligibleCandidates = [];
    const hitlFlaggedCandidates = [];
    let ineligibleCount = 0;

    for (const c of pool) {
      const ev = evaluateCitizenScheme(c, scheme);
      if (ev.eligible) {
        eligibleCandidates.push({
          citizen_id: c.id,
          name: c.name,
          name_local: c.name_local,
          district: c.district,
          panchayat: c.panchayat,
          state: c.state,
          preferred_language: c.preferred_language,
          occupation: c.occupation,
          land_holding_ha: c.land_holding_ha,
          annual_income_inr: c.annual_income_inr,
          kcc_active: c.kcc_active,
          zkp_commitments: c.zkp_commitments,
          benefit_amount_inr: scheme.benefit_amount_inr,
          hitl_override_applied: ev.hitl_override_applied,
          chain_of_entitlement: ev.chain_of_entitlement,
          clause_traces: ev.clause_traces,
          personalized_voice_prompt: ev.personalized_voice_prompt,
        });
      } else {
        ineligibleCount++;
        if (c.hitl_flag && c.hitl_flag.target_scheme_id === scheme.id) {
          const overrideInfo = HITL_OVERRIDES[`${c.id}::${scheme.id}`];
          hitlFlaggedCandidates.push({
            citizen_id: c.id,
            name: c.name,
            name_local: c.name_local,
            district: c.district,
            panchayat: c.panchayat,
            hitl_flag: { ...c.hitl_flag, status: overrideInfo ? overrideInfo.decision : c.hitl_flag.status },
            resolution_audit: overrideInfo || null,
            clause_traces: ev.clause_traces,
          });
        }
      }
    }

    return {
      scheme_id: scheme.id,
      scheme_name: scheme.name,
      scheme_code: scheme.code,
      boolean_ast: scheme.boolean_ast,
      custom_rules_applied: Boolean(body.custom_rules),
      cohort: body.cohort || 'ka_100',
      total_queried: pool.length,
      eligible_count: eligibleCandidates.length,
      ineligible_count: ineligibleCount,
      hitl_review_queue_count: hitlFlaggedCandidates.length,
      headline_badge: `${eligibleCandidates.length} of ${pool.length} FLAGGED ELIGIBLE`,
      privacy_architecture: {
        framework: 'MeitY DEPA + DPDP Act 2023 Section 6',
        mode: "Look up, don't store (Transient ZKP Predicate Evaluation)",
        raw_bank_statements_stored: 0,
        zkp_circuit: 'Groth16 / Pedersen SHA-256 Attribute Commitments',
      },
      eligible_candidates: eligibleCandidates,
      hitl_review_candidates: hitlFlaggedCandidates,
    };
  }

  if (pathname === '/voice/outbound') {
    const citizen = CITIZENS_BY_ID[body.citizen_id] || CITIZENS[0];
    const scheme = SCHEMES.find((s) => s.id === body.scheme_id) || SCHEMES[0];
    const lang = body.language || citizen.preferred_language || 'hi';
    const scripts = scheme.voice_scripts || {};
    const firstName = citizen.name.split(' (')[0].split(' #')[0];
    const langMeta = {
      hi: { name: 'Hindi (हिंदी)', bcp47: 'hi-IN', bhashini_tts_id: 'ai4bharat/indictts-hi-female-v2', affirmative_sample: 'हाँ, मंजूर है (Haan, manzoor hai)' },
      kn: { name: 'Kannada (ಕನ್ನಡ)', bcp47: 'kn-IN', bhashini_tts_id: 'ai4bharat/indictts-kn-female-v2', affirmative_sample: 'ಹೌದು, ಒಪ್ಪಿಗೆ ಇದೆ (Haudu, oppige ide)' },
      en: { name: 'Indian English', bcp47: 'en-IN', bhashini_tts_id: 'ai4bharat/indictts-en-female-v2', affirmative_sample: 'Yes, I approve auto-submission' },
      bho: { name: 'Bhojpuri (भोजपुरी)', bcp47: 'hi-IN', bhashini_tts_id: 'ai4bharat/indictts-bho-female-v1', affirmative_sample: 'हाँ, मंजूर बा (Haan, manzoor ba)' },
      mr: { name: 'Marathi (मराठी)', bcp47: 'mr-IN', bhashini_tts_id: 'ai4bharat/indictts-mr-female-v2', affirmative_sample: 'होय, मंजूर आहे (Hoy, manzoor aahe)' },
      ta: { name: 'Tamil (தமிழ்)', bcp47: 'ta-IN', bhashini_tts_id: 'ai4bharat/indictts-ta-female-v2', affirmative_sample: 'ஆம், சம்மதம் (Aam, sammatham)' },
    }[lang] || { name: 'Hindi (हिंदी)', bcp47: 'hi-IN', bhashini_tts_id: 'ai4bharat/indictts-hi-female-v2', affirmative_sample: 'हाँ, मंजूर है (Haan, manzoor hai)' };

    return {
      call_id: 'BHASHINI-CALL-' + simpleHash(`${citizen.id}::${scheme.id}::${lang}`).slice(0, 10).toUpperCase(),
      channel: body.channel || 'IVR_CALL',
      citizen_id: citizen.id,
      citizen_name: citizen.name,
      citizen_name_local: citizen.name_local,
      phone_masked: citizen.phone_masked,
      district: citizen.district,
      state: citizen.state,
      scheme_id: scheme.id,
      scheme_name: scheme.name,
      benefit_amount_inr: scheme.benefit_amount_inr,
      language_code: lang,
      language_name: langMeta.name,
      bcp47_locale: langMeta.bcp47,
      bhashini_pipeline: {
        asr_engine: 'AI4Bharat IndicWav2Vec-v2 (22 Scheduled Languages)',
        nlu_engine: 'IndicBART + Jevify Single-Pass Intent Readout',
        tts_engine: langMeta.bhashini_tts_id,
      },
      outbound_prompt_local: (scripts[lang] || scripts.hi || '').replace('{name}', firstName),
      outbound_prompt_en: (scripts.en || '').replace('{name}', firstName),
      suggested_citizen_utterance: langMeta.affirmative_sample,
      all_language_scripts: Object.fromEntries(Object.entries(scripts).map(([k, v]) => [k, v.replace('{name}', firstName)])),
      waveform_bars: [28, 52, 74, 90, 62, 45, 84, 96, 70, 40, 65, 88, 92, 58, 36, 72, 85, 64, 48, 79, 94, 60, 42, 30],
    };
  }

  if (pathname === '/voice/verify-consent') {
    const citizen = CITIZENS_BY_ID[body.citizen_id] || CITIZENS[0];
    const scheme = SCHEMES.find((s) => s.id === body.scheme_id) || SCHEMES[0];
    const utterance = body.otp_code ? `OTP_VERIFIED::${body.otp_code}` : (body.spoken_text || 'Haan, manzoor hai').trim();
    const jevifyEval = askJevifyBatch(
      `Citizen Response to ${scheme.name}: ${utterance}`,
      [
        { id: 'consent_affirmative', kind: 'noul', prompt: 'The citizen explicitly consents and approves auto-submission via DigiLocker.' },
        { id: 'negation_flip_guard', kind: 'noul', prompt: 'The citizen declined, refused, or asked NOT to submit the application.' },
        { id: 'intent_action', kind: 'choice', prompt: 'What action should the DPI pipeline take?', options: ['affirmative_auto_submit', 'request_clarification', 'abort_and_purge'] },
      ],
      body.jevify_recipe
    );
    const consentGranted = (jevifyEval.answers.consent_affirmative.noul >= 0.5 && jevifyEval.answers.negation_flip_guard.noul < 0.5) || Boolean(body.otp_code);
    let ca = null;
    if (consentGranted) {
      ca = createDepaConsentArtefact(citizen, scheme, body.otp_code ? 'OTP_FALLBACK' : body.channel || 'BHASHINI_VOICE_ASR', utterance);
      CONSENT_ARTEFACTS.unshift(ca);
    }
    return {
      consent_granted: consentGranted,
      citizen_id: citizen.id,
      scheme_id: scheme.id,
      spoken_utterance: utterance,
      jevify_nlu_readout: jevifyEval,
      depa_consent_artefact: ca,
    };
  }

  if (pathname === '/dbt/dispatch') {
    const citizen = CITIZENS_BY_ID[body.citizen_id] || CITIZENS[0];
    const scheme = SCHEMES.find((s) => s.id === body.scheme_id) || SCHEMES[0];
    let ca = null;
    if (body.consent_artefact_id) {
      ca = CONSENT_ARTEFACTS.find((c) => c.artefact_id === body.consent_artefact_id);
      if (!ca) {
        throw new Error(`DEPA Consent Artefact '${body.consent_artefact_id}' not found.`);
      }
      if (ca.status === 'REVOKED_POST_EXECUTION') {
        throw new Error('DEPA Consent Artefact has already been revoked post-execution (DPDP Act 2023 single-use enforcement).');
      }
    } else {
      const utterance = (body.spoken_utterance || 'Haan, manzoor hai').trim();
      const check = askJevifyBatch(`Citizen Response to ${scheme.name}: ${utterance}`, [
        { id: 'consent_affirmative', kind: 'noul', prompt: 'The citizen explicitly consents and approves auto-submission via DigiLocker.' },
        { id: 'negation_flip_guard', kind: 'noul', prompt: 'The citizen declined, refused, or asked NOT to submit the application.' },
      ]);
      if (check.answers.negation_flip_guard.noul >= 0.5 || check.answers.consent_affirmative.noul < 0.5) {
        throw new Error('Cannot dispatch DBT: spoken utterance triggered negation guard or lacks affirmative DEPA consent.');
      }
      ca = createDepaConsentArtefact(citizen, scheme, 'BHASHINI_1CLICK_CONSENT', utterance);
      CONSENT_ARTEFACTS.unshift(ca);
    }
    const receipt = dispatchDbtTransaction(citizen, scheme, ca);
    DBT_DISPATCH_LEDGER.unshift(receipt);
    const ev = evaluateCitizenScheme(citizen, scheme);
    return { status: 'DISBURSED', dbt_receipt: receipt, revoked_consent_artefact: ca, chain_of_entitlement: ev.chain_of_entitlement };
  }

  if (pathname === '/admin/analytics') {
    const districtStats = {};
    let totalQualified = 0;
    for (const c of CITIZENS) {
      if (!districtStats[c.district]) {
        districtStats[c.district] = { district: c.district, state: c.state, panchayat: c.panchayat, total_citizens: 0, eligible_citizens: 0, total_benefit_unlocked_inr: 0, hitl_pending: 0 };
      }
      const d = districtStats[c.district];
      d.total_citizens++;
      let cEl = false;
      let cInr = 0;
      for (const s of SCHEMES) {
        const ev = evaluateCitizenScheme(c, s);
        if (ev.eligible) {
          cEl = true;
          cInr += s.benefit_amount_inr;
        }
      }
      if (cEl) {
        d.eligible_citizens++;
        totalQualified++;
      }
      d.total_benefit_unlocked_inr += cInr;
      if (c.hitl_flag) {
        const ov = HITL_OVERRIDES[`${c.id}::${c.hitl_flag.target_scheme_id}`];
        const st = ov ? ov.decision : c.hitl_flag.status;
        if (st === 'PENDING_PANCHAYAT_REVIEW') d.hitl_pending++;
      }
    }
    const heatmapList = Object.values(districtStats)
      .map((d) => {
        const cov = Number(((d.eligible_citizens / Math.max(1, d.total_citizens)) * 100).toFixed(1));
        return { ...d, coverage_saturation_pct: cov, voice_outreach_completion_pct: Math.min(99.2, Number((cov * 0.94 + 12.0).toFixed(1))) };
      })
      .sort((a, b) => b.total_citizens - a.total_citizens);

    const hitlQueue = CITIZENS.filter((c) => c.hitl_flag).map((c) => {
      const f = c.hitl_flag;
      const ov = HITL_OVERRIDES[`${c.id}::${f.target_scheme_id}`];
      return {
        citizen_id: c.id,
        citizen_name: c.name,
        citizen_name_local: c.name_local,
        age: c.age,
        gender: c.gender,
        district: c.district,
        panchayat: c.panchayat,
        state: c.state,
        occupation: c.occupation,
        social_category: c.social_category,
        land_holding_ha: c.land_holding_ha,
        annual_income_inr: c.annual_income_inr,
        kcc_active: c.kcc_active,
        verifiable_credentials: c.verifiable_credentials,
        ...f,
        status: ov ? ov.decision : f.status,
        resolution_audit: ov || null,
      };
    });

    const totalScanned = CITIZENS.length;
    const s2 = Math.max(1, Math.min(totalScanned, totalQualified));
    const s3 = Math.max(1, s2 - 6);
    const s4 = Math.max(1, s3 - 5 + Math.min(4, CONSENT_ARTEFACTS.length));
    const s5 = Math.max(1, s4 - 4 + Math.min(4, DBT_DISPATCH_LEDGER.length));

    return {
      macro_impact_metrics: {
        annual_budget_pool_inr: '₹3.5+ Trn',
        schemes_tracked_national: '1,200+',
        prototype_schemes_active: SCHEMES.length,
        prototype_citizens_pool: totalScanned,
        reactive_exclusion_gap_pct: 'Up to 40%',
        processing_time_reduction: '14 days → 90s',
        intermediary_leakage: '0',
        coverage_expansion_gain: '+35%',
      },
      inclusion_funnel: [
        { stage: '01. Anonymized DPI Cohort Scanned', count: totalScanned, pct: 100.0, color: '#131B2E' },
        { stage: '02. ZKP Predicate Qualified (>=1 Scheme)', count: s2, pct: Number(((s2 / totalScanned) * 100).toFixed(1)), color: '#2C4A3E' },
        { stage: '03. Proactive Bhashini Voice Contacted', count: s3, pct: Number(((s3 / totalScanned) * 100).toFixed(1)), color: '#C85A32' },
        { stage: '04. Spoken / OTP DEPA Consent Verified', count: s4, pct: Number(((s4 / totalScanned) * 100).toFixed(1)), color: '#C59B38' },
        { stage: '05. Zero-Click PFMS DBT Disbursed (PID-777)', count: s5, pct: Number(((s5 / totalScanned) * 100).toFixed(1)), color: '#2C4A3E' },
      ],
      district_heatmap: heatmapList,
      tier_03_hitl_queue: hitlQueue,
      hitl_audit_trail: HITL_AUDIT_TRAIL,
      recent_dbt_ledger: DBT_DISPATCH_LEDGER.slice(0, 15),
      recent_consent_artefacts: CONSENT_ARTEFACTS.slice(0, 15),
    };
  }

  if (pathname === '/admin/hitl-review') {
    const citizen = CITIZENS_BY_ID[body.citizen_id] || CITIZENS_BY_ID['CIT-023'];
    const scheme = SCHEMES.find((s) => s.id === (body.scheme_id || 'SCH-01')) || SCHEMES[0];
    const nowIso = new Date().toISOString();
    const auditEntry = {
      audit_id: `HITL-AUDIT-${String(HITL_AUDIT_TRAIL.length + 1).padStart(3, '0')}`,
      citizen_id: citizen.id,
      citizen_name: citizen.name,
      district: citizen.district,
      panchayat: citizen.panchayat,
      scheme_id: scheme.id,
      scheme_name: scheme.name,
      decision: body.decision || 'APPROVED_OVERRIDE',
      officer_name: body.officer_name || 'Prakash Nadagouda (PDO, Gram Panchayat)',
      officer_notes: body.officer_notes || 'Verified physical Bhoomi mutation & KCC passbook; net holding is within statutory limit.',
      paper_trail_signature: '0x' + simpleHash(`${citizen.id}::${scheme.id}::${nowIso}`).slice(0, 20),
      reviewed_at: nowIso,
    };
    HITL_OVERRIDES[`${citizen.id}::${scheme.id}`] = auditEntry;
    HITL_AUDIT_TRAIL.unshift(auditEntry);
    return { status: 'HITL_DECISION_RECORDED', audit_entry: auditEntry, updated_evaluation: evaluateCitizenScheme(citizen, scheme) };
  }

  if (pathname === '/ai/jevify/recipes') {
    return {
      repository: 'https://github.com/fidecastro/jevify',
      description: 'Make any model you already have answer typed questions in one pass, the way Jev does, and measure how well it does.',
      recipes: Object.values(JEVIFY_RECIPES),
    };
  }

  if (pathname === '/ai/jevify/probe') {
    const rName = params.get('recipe') || 'gemma-4-e4b-it.llamacpp';
    const recipe = JEVIFY_RECIPES[rName] || JEVIFY_RECIPES['gemma-4-e4b-it.llamacpp'];
    return {
      status: 'PROBED_AND_VERIFIED',
      command: `jevify probe recipes/${recipe.name}.yaml`,
      recipe,
      rungs_tested: [
        { rung: 'named_token_logprobs', supported: true, selected: true },
        { rung: 'grammar_post_sampling', supported: true, selected: false },
        { rung: 'top_k_logprobs', supported: true, selected: false },
      ],
      single_token_alphabet_verified: 26,
      invariants_contract: 'No free-form generation; answers read directly off next-token distribution in 1 pass.',
    };
  }

  if (pathname === '/ai/jevify/ask') {
    return askJevifyBatch(body.state || '', body.questions || [], body.recipe);
  }

  if (pathname === '/auth/siwc/session') {
    return ACTIVE_SIWC_SESSION;
  }

  if (pathname === '/auth/siwc/authorize') {
    return {
      status: 'PKCE_CHALLENGE_GENERATED',
      authorization_url: 'https://auth.openai.com/authorize?response_type=code&client_id=client_jansetu_dpi_india_stack_01&code_challenge_method=S256',
      state: 'siwc_state_demo',
      nonce: 'siwc_nonce_demo',
      client_id: 'client_jansetu_dpi_india_stack_01',
      pkce: { code_challenge: 'E9Melhoa2OwvFrGMTJguCHaoeK1t8URWbuGJSstw-cM', code_challenge_method: 'S256', code_verifier_preview: 'dBjftJeZ4CVP...' },
      scopes: ACTIVE_SIWC_SESSION.scopes,
    };
  }

  if (pathname === '/auth/siwc/callback') {
    ACTIVE_SIWC_SESSION = {
      ...ACTIVE_SIWC_SESSION,
      authenticated: true,
      active_model: body.active_model || 'gpt-4o',
      user: {
        ...ACTIVE_SIWC_SESSION.user,
        email: body.email || ACTIVE_SIWC_SESSION.user.email,
        plan_tier: body.plan_tier || ACTIVE_SIWC_SESSION.user.plan_tier,
      },
      connected_at: new Date().toISOString(),
    };
    return ACTIVE_SIWC_SESSION;
  }

  if (pathname === '/auth/siwc/revoke') {
    ACTIVE_SIWC_SESSION = { ...ACTIVE_SIWC_SESSION, authenticated: false };
    return { status: 'SIWC_SESSION_REVOKED', authenticated: false, message: 'Sign in with ChatGPT OAuth session revoked.' };
  }

  return { status: 'OK' };
}
