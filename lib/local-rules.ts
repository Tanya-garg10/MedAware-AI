/**
 * LOCAL INTELLIGENCE ENGINE
 * Rule-based logic that runs client/server-side WITHOUT any AI API call.
 * This is what makes MedAware different from "just ChatGPT" —
 * expiry detection and drug warnings fire instantly, with zero cost.
 */

export interface LocalExpiryResult {
  found: boolean;
  rawDate: string | null;
  formatted: string | null;
  status: 'valid' | 'near-expiry' | 'expired' | 'unknown';
  daysUntilExpiry: number;
  message: string;
}

export interface LocalDrugRule {
  flag: 'critical' | 'warning' | 'info';
  message: string;
}

export interface FakeDetectionResult {
  suspected: boolean;
  reason: string[];
  riskLevel: 'none' | 'low' | 'high';
}

export interface LocalAnalysis {
  expiry: LocalExpiryResult;
  drugRules: LocalDrugRule[];
  detectedKeywords: string[];
  fakeDetection: FakeDetectionResult;
}

// ─── EXPIRY DATE PATTERNS ────────────────────────────────────────────────────
// Covers: EXP 06/2027 | Exp: Jun 2027 | Use Before 06-27 | BB: 2027-06 etc.
// Patterns are ordered from most specific to least specific to reduce false positives.
const EXPIRY_PATTERNS: RegExp[] = [
  /(?:exp(?:iry)?(?:\s*date)?|use\s*before|use\s*by|best\s*before|bb)[:\s.]*(\d{1,2}[\/\-]\d{4})/gi,
  /(?:exp(?:iry)?(?:\s*date)?|use\s*before|use\s*by|best\s*before|bb)[:\s.]*([A-Za-z]{3}\.?\s*\d{4})/gi,
  /(?:exp(?:iry)?(?:\s*date)?|use\s*before|use\s*by|best\s*before|bb)[:\s.]*(\d{4}[\/\-]\d{1,2})/gi,
  /(?:exp(?:iry)?(?:\s*date)?|use\s*before|use\s*by|best\s*before|bb)[:\s.]*(\d{1,2}[\/\-]\d{2})\b/gi,
  // Standalone date patterns that look like expiry
  /\bexp\.?\s*(\d{1,2}[\/\-]\d{2,4})\b/gi,
  /\b(\d{2}[\/]\d{4})\b/g,
  /\b([A-Za-z]{3,9}\.?\s+\d{4})\b/g,
];

const MONTHS: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
  january: 1, february: 2, march: 3, april: 4, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
};

function parseExpiryDate(raw: string): Date | null {
  const s = raw.trim().toLowerCase();

  // MM/YYYY or MM-YYYY
  let m = s.match(/^(\d{1,2})[\/\-](\d{4})$/);
  if (m) return new Date(parseInt(m[2]), parseInt(m[1]) - 1, 1);

  // YYYY/MM or YYYY-MM
  m = s.match(/^(\d{4})[\/\-](\d{1,2})$/);
  if (m) return new Date(parseInt(m[1]), parseInt(m[2]) - 1, 1);

  // MM/YY
  m = s.match(/^(\d{1,2})[\/\-](\d{2})$/);
  if (m) {
    const yr = parseInt(m[2]) + 2000;
    return new Date(yr, parseInt(m[1]) - 1, 1);
  }

  // "Jun 2027" or "June 2027"
  m = s.match(/^([a-z]{3,9})\.?\s+(\d{4})$/);
  if (m && MONTHS[m[1]]) return new Date(parseInt(m[2]), MONTHS[m[1]] - 1, 1);

  return null;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

export function extractExpiryLocally(ocrText: string): LocalExpiryResult {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const candidates: string[] = [];
  for (const pattern of EXPIRY_PATTERNS) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(ocrText)) !== null) {
      const cap = match[1] || match[0];
      if (cap) candidates.push(cap.trim());
    }
  }

  // Try each candidate until we get a valid parse
  for (const raw of candidates) {
    const parsed = parseExpiryDate(raw);
    if (!parsed || isNaN(parsed.getTime())) continue;
    // Sanity check: between 2000 and 2045
    if (parsed.getFullYear() < 2000 || parsed.getFullYear() > 2045) continue;

    const diffMs = parsed.getTime() - today.getTime();
    const days = Math.round(diffMs / (1000 * 60 * 60 * 24));
    const formatted = formatDate(parsed);

    let status: 'valid' | 'near-expiry' | 'expired';
    let message: string;

    if (days < 0) {
      status = 'expired';
      message = `⛔ This medicine expired ${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''} ago (${formatted}). Do NOT use it.`;
    } else if (days <= 60) {
      status = 'near-expiry';
      message = `⚠️ Expires in ${days} day${days !== 1 ? 's' : ''} (${formatted}). Use soon or consult pharmacist.`;
    } else {
      status = 'valid';
      message = `✅ Valid for ${days} more days — expires ${formatted}.`;
    }

    return { found: true, rawDate: raw, formatted, status, daysUntilExpiry: days, message };
  }

  return {
    found: false,
    rawDate: null,
    formatted: null,
    status: 'unknown',
    daysUntilExpiry: 9999,
    message: 'No expiry date found in the scanned text.',
  };
}

// ─── RULE-BASED DRUG WARNINGS ────────────────────────────────────────────────
interface DrugRuleEntry {
  keywords: string[];
  rules: LocalDrugRule[];
}

const DRUG_RULES: DrugRuleEntry[] = [
  {
    keywords: ['paracetamol', 'acetaminophen', 'paracip', 'calpol', 'dolo'],
    rules: [
      { flag: 'critical', message: '⚠️ Max dose: 4000mg/day (8 tablets of 500mg). Exceeding this can cause fatal liver damage.' },
      { flag: 'warning', message: 'Do not combine with alcohol — increases liver toxicity risk.' },
      { flag: 'info', message: 'One of the safest pain relievers when taken at correct dose.' },
    ],
  },
  {
    keywords: ['ibuprofen', 'brufen', 'advil', 'combiflam'],
    rules: [
      { flag: 'warning', message: 'Take with food to avoid stomach irritation or ulcers.' },
      { flag: 'warning', message: 'Avoid if you have kidney disease, heart disease, or are pregnant.' },
      { flag: 'info', message: 'Anti-inflammatory — reduces pain, fever, and swelling.' },
    ],
  },
  {
    keywords: ['aspirin', 'disprin', 'ecosprin'],
    rules: [
      { flag: 'critical', message: '⚠️ Never give aspirin to children under 16 — risk of Reye\'s syndrome.' },
      { flag: 'warning', message: 'Increases bleeding risk. Avoid before surgery.' },
      { flag: 'warning', message: 'Do not combine with blood thinners (warfarin, heparin).' },
    ],
  },
  {
    keywords: ['metformin', 'glucophage', 'glycomet'],
    rules: [
      { flag: 'warning', message: 'Take with meals to reduce stomach upset.' },
      { flag: 'warning', message: 'Stop before contrast dye procedures (CT scans, angiograms).' },
      { flag: 'info', message: 'First-line diabetes medicine — does not cause low blood sugar alone.' },
    ],
  },
  {
    keywords: ['amoxicillin', 'amoxil', 'mox', 'novamox'],
    rules: [
      { flag: 'critical', message: '⚠️ Check for penicillin allergy before use. Can cause severe allergic reaction (anaphylaxis).' },
      { flag: 'warning', message: 'Complete the full course even if you feel better.' },
      { flag: 'info', message: 'Antibiotic — effective only against bacterial infections, not viral.' },
    ],
  },
  {
    keywords: ['warfarin', 'coumadin', 'warf'],
    rules: [
      { flag: 'critical', message: '⚠️ High bleeding risk. Regular INR blood tests are mandatory.' },
      { flag: 'critical', message: 'Many foods and drugs interact with warfarin — always check before adding any medicine.' },
      { flag: 'warning', message: 'Avoid vitamin K-rich foods (green vegetables) in large amounts.' },
    ],
  },
  {
    keywords: ['methotrexate', 'folitrax', 'mexate'],
    rules: [
      { flag: 'critical', message: '⚠️ WEEKLY dose — taking daily is a fatal overdose. Double-check dosing schedule.' },
      { flag: 'critical', message: 'Can cause severe lung, liver, and bone marrow toxicity.' },
    ],
  },
  {
    keywords: ['digoxin', 'lanoxin'],
    rules: [
      { flag: 'critical', message: '⚠️ Very narrow safe range. Too little = ineffective, too much = toxic.' },
      { flag: 'warning', message: 'Low potassium levels increase toxicity risk.' },
    ],
  },
  {
    keywords: ['insulin', 'lantus', 'humalog', 'novolog', 'tresiba'],
    rules: [
      { flag: 'critical', message: '⚠️ Risk of hypoglycemia (low blood sugar). Always have sugar/glucose ready.' },
      { flag: 'warning', message: 'Store in refrigerator (2–8°C). Do not freeze.' },
      { flag: 'info', message: 'Inject as prescribed — dose timing is critical for blood sugar control.' },
    ],
  },
  {
    keywords: ['sitagliptin', 'januvia', 'teneligliptin', 'vildagliptin'],
    rules: [
      { flag: 'info', message: 'DPP-4 inhibitor for Type 2 diabetes — works by increasing insulin release after meals.' },
      { flag: 'warning', message: 'Report any joint pain, skin blistering, or pancreatitis symptoms immediately.' },
    ],
  },
];

// ─── FUZZY OCR-TOLERANT MATCHING ────────────────────────────────────────────
// OCR corrupts letters: doubled letters, random caps, replaced chars.
// Strategy: lowercase + collapse repeated chars + strip non-alpha, then substring match.
// Fallback: sliding window checks if ≥80% of keyword chars appear in sequence.
function normalizeForMatch(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')       // keep only alphanumeric
    .replace(/(.)\1+/g, '$1');        // collapse repeated chars: "ammoo" → "amo"
}

// Check if keyword appears in text after normalization (tolerates OCR noise)
function fuzzyIncludes(ocrText: string, keyword: string): boolean {
  const normOcr = normalizeForMatch(ocrText);
  const normKey = normalizeForMatch(keyword);
  if (normOcr.includes(normKey)) return true;

  // Sliding window: check if ≥75% of keyword chars appear in sequence
  let ki = 0;
  for (let oi = 0; oi < normOcr.length && ki < normKey.length; oi++) {
    if (normOcr[oi] === normKey[ki]) ki++;
  }
  return ki / normKey.length >= 0.8;
}

export function applyDrugRules(ocrText: string): { rules: LocalDrugRule[]; detected: string[] } {
  const allRules: LocalDrugRule[] = [];
  const detected: string[] = [];

  for (const entry of DRUG_RULES) {
    const matched = entry.keywords.find(k => fuzzyIncludes(ocrText, k));
    if (matched) {
      detected.push(entry.keywords[0]);
      allRules.push(...entry.rules);
    }
  }

  return { rules: allRules, detected };
}

// ─── FAKE MEDICINE DETECTION ─────────────────────────────────────────────────
// Three-tier detection:
// 1. Explicit fake words in OCR text → HIGH risk
// 2. Structural red flags (no batch, unlicensed) → LOW risk
// 3. AI confidence below threshold or unknown medicine → escalates risk
const HIGH_RISK_FAKE_PATTERNS = [
  /\bfake\b/i,
  /\bcounterfeit\b/i,
  /\breplica\b/i,
  /\bspurious\b/i,
  /\bnot\s+genuine\b/i,
  /\bimitation\b/i,
  /\bfalse\s+medicine\b/i,
];

const LOW_RISK_FAKE_SIGNALS = [
  { pattern: /\bno\s+batch\b/i, reason: 'No batch number found on packaging' },
  { pattern: /\bno\s+mfg\b/i, reason: 'No manufacturing date found' },
  { pattern: /\bunlicensed\b/i, reason: 'Packaging claims unlicensed product' },
  { pattern: /\bnot\s+approved\b/i, reason: 'Packaging says "not approved"' },
];

export function detectFakeMedicine(ocrText: string, aiConfidence: number, knownMedicine = true): FakeDetectionResult {
  const reasons: string[] = [];
  let riskLevel: 'none' | 'low' | 'high' = 'none';

  // Check for explicit fake markers in OCR text
  for (const pattern of HIGH_RISK_FAKE_PATTERNS) {
    if (pattern.test(ocrText)) {
      reasons.push(`Packaging contains a suspicious word — possible counterfeit indicator`);
      riskLevel = 'high';
    }
  }

  // Check low-risk signals
  for (const signal of LOW_RISK_FAKE_SIGNALS) {
    if (signal.pattern.test(ocrText)) {
      reasons.push(signal.reason);
      if (riskLevel === 'none') riskLevel = 'low';
    }
  }

  // Medicine not recognised in AI's medical knowledge base
  if (!knownMedicine) {
    reasons.push('This medicine name is not recognised as a registered pharmaceutical product');
    if (riskLevel !== 'high') riskLevel = 'high';
  }

  // Very low AI confidence
  if (aiConfidence < 0.35) {
    reasons.push(`Identification confidence is very low (${Math.round(aiConfidence * 100)}%) — cannot verify this medicine`);
    if (riskLevel === 'none') riskLevel = 'low';
  } else if (aiConfidence < 0.55 && riskLevel !== 'none') {
    reasons.push(`AI confidence is also low (${Math.round(aiConfidence * 100)}%)`);
  }

  return {
    suspected: riskLevel !== 'none',
    reason: reasons,
    riskLevel,
  };
}

// ─── COMBINED LOCAL ANALYSIS ─────────────────────────────────────────────────
export function runLocalAnalysis(ocrText: string, aiConfidence = 1): LocalAnalysis {
  const expiry = extractExpiryLocally(ocrText);
  const { rules, detected } = applyDrugRules(ocrText);
  const fakeDetection = detectFakeMedicine(ocrText, aiConfidence);
  return { expiry, drugRules: rules, detectedKeywords: detected, fakeDetection };
}
