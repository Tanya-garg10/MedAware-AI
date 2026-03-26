# MedAware AI — Medicine Safety Scanner

> **OCR + Rule Engine + AI — Not just a chatbot.**

MedAware AI is a Next.js medicine packaging scanner that combines **Tesseract.js OCR**, a **local rule-based intelligence engine**, and **Groq AI (Llama 3.3 70B)** to identify medicines from images and provide actionable safety information — not generic AI output.

---

## How It Works — The 4-Step Safety Pipeline

```
📷 Image → [OCR Scan] → [Local Rules] → [AI Analysis] → [Safety Score]
```

| Step | What Happens |
|------|-------------|
| **1. OCR Scan** | Tesseract.js reads all text from the medicine packaging (client-side, no server needed) |
| **2. Local Rules** | Regex patterns extract expiry dates; drug family rules fire instantly — no API call required |
| **3. AI Analysis** | Groq LLM (Llama 3.3 70B) identifies the medicine, fills missing info, and sets `knownMedicine` flag |
| **4. Safety Score** | Expiry status + warnings + AI confidence + known medicine → 0–100 score |

---

## Features

### Medicine Scanner
- **Upload or capture** medicine packaging images (JPEG, PNG, WebP up to 5MB)
- **Live camera** capture directly from device
- **OCR text extraction** via Tesseract.js (browser-based, works offline after first load)
- **Fuzzy OCR-tolerant matching** — handles garbled text like `"AmMOoXICi"` → Amoxicillin

### Expiry Detection
- **7 regex patterns** cover all common date formats: `EXP 06/2027`, `Jun 2027`, `Use Before 06-27`, `BB: 2027-06`, and more
- Local regex runs **before AI** — more reliable than AI guessing from noisy OCR text
- **Colour-coded expiry card**: red (expired), yellow (near-expiry ≤60 days), green (valid)
- Shows exact date found on packaging and days remaining

### Rule-Based Safety Alerts
Drug family rules fire locally with **zero AI cost** for 10 drug families:

| Drug Family | Key Warnings |
|-------------|-------------|
| Paracetamol / Acetaminophen | Max 4000mg/day — liver damage risk |
| Ibuprofen | Take with food; avoid in kidney/heart disease |
| Aspirin | Never give to children under 16 (Reye's syndrome) |
| Metformin | Stop before contrast dye procedures |
| Amoxicillin | Check penicillin allergy — anaphylaxis risk |
| Warfarin | Mandatory INR blood tests; many food/drug interactions |
| Methotrexate | **WEEKLY** dose — daily = fatal overdose |
| Digoxin | Very narrow therapeutic range |
| Insulin | Hypoglycemia risk; refrigerate 2–8°C |
| Sitagliptin / DPP-4 inhibitors | Report pancreatitis symptoms immediately |

### Fake & Counterfeit Medicine Detection
Three distinct warning levels:
- 🚨 **SUSPECTED COUNTERFEIT** — explicit fake words found in packaging text
- 🚫 **UNVERIFIED MEDICINE** — medicine name not recognised as a real pharmaceutical
- ⚠️ **VERIFICATION NEEDED** — low AI confidence, could not verify

For unverified medicines: drug warnings and info tabs are **hidden** to prevent misleading information.

### Drug Interaction Checker
- Enter any two medicine names
- Groq AI returns: risk level (safe/mild/moderate/severe), summary, details, and recommendation
- Pre-loaded example pairs to try

### Voice Assistant
- Tap **Listen** to hear medicine info read aloud via browser Text-to-Speech
- Reads: medicine name, expiry status, uses, side effects, warnings
- Perfect for elderly or visually impaired users

### Scan History
- Every scan saved to `localStorage` (up to 50 scans)
- Tap any history item to re-view full results
- Clear all or delete individual scans

### Health Safety Score (0–100)
Calculated from:
- Expiry status (−40 expired, −15 near-expiry)
- Number of warnings (up to −20)
- Number of side effects (up to −15)
- AI confidence (−5 to −30)
- Unknown/unrecognised medicine (−40)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) + React 19 || **Language** | TypeScript |
| **UI** | shadcn/ui + Radix UI + Tailwind CSS v4 |
| **OCR** | Tesseract.js v5 (browser-based, client-side) |
| **AI** | Groq API — `llama-3.3-70b-versatile` (free tier) |
| **AI SDK** | Vercel AI SDK v6 (`ai` + `@ai-sdk/groq`) |
| **Icons** | Lucide React |
| **Package Manager** | pnpm |

---

## Project Structure

```
medaware-ai/
├── app/
│   ├── page.tsx                      # Main app — Home, Scanner, Interactions, History tabs
│   ├── layout.tsx                    # Root layout
│   ├── globals.css                   # Global styles
│   └── api/
│       ├── analyze/route.ts          # Main scan API (OCR text → local rules → Groq AI)
│       ├── drug-interaction/route.ts # Drug interaction checker API
│       └── ocr/route.ts              # Image validation endpoint
├── components/
│   ├── medicine-results.tsx          # Full results UI (expiry, safety score, tabs)
│   ├── drug-interaction.tsx          # Drug interaction checker UI
│   ├── image-uploader.tsx            # Drag-drop + file upload
│   ├── camera-capture.tsx            # Live camera capture
│   └── ui/                           # shadcn/ui component library
├── lib/
│   ├── local-rules.ts                # ⭐ Rule engine: expiry regex, drug rules, fake detection
│   ├── ocr-utils.ts                  # Tesseract.js OCR extraction
│   ├── medicine-analyzer.ts          # AnalysisResult type definitions
│   ├── medicine-database.ts          # Local medicine info (unused by main route)
│   └── utils.ts                      # Shared utilities
├── hooks/
│   ├── use-mobile.ts
│   └── use-toast.ts
├── package.json
├── tsconfig.json
└── next.config.mjs
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm
- A free [Groq API key](https://console.groq.com) — free tier is sufficient

### Installation

```bash
# Clone the repository
git clone https://github.com/Tanya-garg10/medaware-ai.git
cd medaware-ai

# Install dependencies
pnpm install

# Add your Groq API key
echo "GROQ_API_KEY=your_key_here" > .env.local

# Start development server
pnpm dev
```

Open [http://localhost:5000](http://localhost:5000) in your browser.

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | Yes | Free API key from [console.groq.com](https://console.groq.com) |

---

## API Reference

### `POST /api/analyze`
Main medicine analysis endpoint.

**Request** (FormData):
```
file          File    — medicine packaging image
extractedText string  — OCR text from Tesseract.js
confidence    number  — OCR confidence (0–100)
```

**Response**:
```json
{
  "success": true,
  "result": {
    "medicineName": "Paracetamol",
    "knownMedicine": true,
    "confidence": 0.95,
    "expiryStatus": {
      "status": "valid",
      "expiryDate": "06/2027",
      "expiryDateFormatted": "June 2027",
      "daysUntilExpiry": 450,
      "message": "✅ Valid for 450 more days — expires June 2027.",
      "source": "local-regex"
    },
    "localRules": {
      "drugWarnings": [{ "flag": "critical", "message": "..." }],
      "detectedDrugs": ["paracetamol"],
      "fakeDetection": { "suspected": false, "riskLevel": "none", "reason": [] }
    },
    "simplifiedInfo": {
      "uses": ["Pain relief", "Fever reduction"],
      "sideEffects": ["Nausea", "Liver damage at high doses"],
      "warnings": ["Do not exceed 4000mg per day"]
    }
  }
}
```

### `POST /api/drug-interaction`
Drug interaction checker.

**Request**:
```json
{ "medicine1": "Aspirin", "medicine2": "Warfarin" }
```

**Response**:
```json
{
  "result": {
    "riskLevel": "severe",
    "summary": "Dangerous combination — significantly increases bleeding risk.",
    "details": ["Both medicines thin the blood...", "..."],
    "recommendation": "Do not take together without medical supervision.",
    "canTakeTogether": false
  }
}
```

---

## Key Design Decisions

### Why local rules before AI?
OCR text is noisy. A regex that matches `06/2027` is **100% accurate** for expiry detection. AI may hallucinate or misread garbled text. Local rules run in milliseconds with zero cost.

### Why Groq / Llama 3.3 70B?
- Free tier available at [console.groq.com](https://console.groq.com)
- Extremely fast inference
- Strong medical knowledge for medicine identification

### Why `knownMedicine` matters?
The AI explicitly flags whether a medicine name is a **real approved pharmaceutical**. If `knownMedicine: false`, the frontend hides all drug warnings and info tabs — preventing misleading information for fake or made-up medicine names.

### Confidence vs OCR confidence
`result.confidence` = AI's certainty this is a real medicine it knows about.  
OCR confidence = text readability. These are **completely different** — a clearly-scanned fake medicine label has high OCR confidence but should have low AI confidence.

---

## Browser Support

| Browser | Support |
|---------|---------|
| Chrome / Edge 90+ | ✅ Full support |
| Firefox 88+ | ✅ Full support |
| Safari 14+ | ✅ Full support |
| Mobile (iOS/Android) | ✅ Camera + upload |

---

## Medical Disclaimer

This application provides **educational information only** and is not a substitute for professional medical advice, diagnosis, or treatment. Always:
- Consult a qualified doctor or pharmacist before taking medication
- Read medication labels carefully
- Follow prescribed dosage instructions
- Report side effects to your healthcare provider

The developers are not liable for any adverse effects from use of this application.

---

## License

MIT License — free to use, modify, and distribute.

---

**Author:** Tanya Garg — built for real patient safety, not just a demo.
