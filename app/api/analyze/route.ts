import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { runLocalAnalysis, detectFakeMedicine } from '@/lib/local-rules';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const extractedText = formData.get('extractedText') as string;
    const ocrConfidence = parseFloat(formData.get('confidence') as string) || 0;

    if (!extractedText) {
      return NextResponse.json({ error: 'No text extracted from image' }, { status: 400 });
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'AI analysis is not configured. Please add a GROQ_API_KEY.' },
        { status: 503 }
      );
    }

    const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });
    const today = new Date().toISOString().split('T')[0];

    // ── STEP 1: LOCAL RULE-BASED ANALYSIS (runs before AI, zero cost) ─────
    const localAnalysis = runLocalAnalysis(extractedText);
    console.log('Local analysis:', JSON.stringify(localAnalysis));
    console.log('OCR text received:', extractedText);

    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      system: `You are an expert pharmacist and medicine identification specialist. Your job:
1. Identify medicines from OCR-scanned packaging — OCR text is often noisy, with doubled letters, wrong caps, or garbled characters (e.g. "AmMOoXICi" = Amoxicillin, "PaRaCeTaMoL" = Paracetamol, "MeTfOrMiN" = Metformin). Always try your best.
2. Extract expiry dates — look for EXP, Expiry, Use Before, Use By, Best Before, BB, or date patterns (MM/YYYY, MMM YYYY, DD/MM/YYYY).
3. If text says "FAKE", "counterfeit", or similar — still identify the base medicine, but note it in warnings.
Always respond with valid JSON only, no extra text. Today's date is ${today}.`,
      prompt: `OCR text from medicine packaging (may be noisy/garbled — try to interpret the medicine name):

OCR Text:
"""
${extractedText}
"""

Return ONLY a raw JSON object (no markdown, no code blocks):
{
  "medicineName": "name from packaging, or 'Unknown' if unrecognizable",
  "found": true,
  "knownMedicine": true,
  "uses": ["use 1", "use 2"],
  "sideEffects": ["side effect 1", "side effect 2"],
  "warnings": ["warning 1"],
  "dosage": "typical dosage info",
  "expiryDate": "e.g. '06/2027' or null",
  "expiryDateFormatted": "e.g. 'June 2027' or null",
  "expiryStatus": "valid",
  "expiryMessage": "friendly sentence about expiry",
  "daysUntilExpiry": 365,
  "confidence": 0.9
}

CRITICAL Rules:
- found: false ONLY if the text contains no pharmaceutical/medicine words at all (random text, food, non-medical product)
- found: true if there IS a medicine name present, even if garbled by OCR
- knownMedicine: true ONLY if this is a real, approved pharmaceutical product you recognise from your medical training (e.g. Paracetamol, Amoxicillin, Metformin). Set to false if: the name is completely made up, not a real drug, or you have no medical knowledge about it.
- confidence: your certainty that this is a REAL medicine you can provide verified info for. Low (0.1-0.3) for unrecognised/invented names, high (0.8-1.0) for well-known drugs.
- If knownMedicine is false: uses/sideEffects/dosage should be empty arrays/string, warnings should include "This medicine name is not recognised in our database."
- expiryStatus: "expired" if past ${today}, "near-expiry" if within 60 days, "valid" otherwise
- daysUntilExpiry: days from ${today} to expiry. Negative = expired. 9999 = no date found.`,
    });

    let ai: any;
    try {
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      ai = JSON.parse(cleaned);
    } catch {
      console.error('JSON parse failed, raw text:', text);
      return NextResponse.json(
        { error: 'Failed to parse AI response. Please try again.' },
        { status: 500 }
      );
    }

    if (!ai.found) {
      return NextResponse.json(
        {
          error: 'Could not identify a medicine from the image text. Please ensure the medicine name is clearly visible.',
          suggestion: 'Try a clearer image with the medicine name in full view.',
        },
        { status: 404 }
      );
    }

    const medicineData = {
      id: ai.medicineName.toLowerCase().replace(/\s+/g, '-'),
      name: ai.medicineName,
      aliases: [],
      uses: ai.uses || [],
      sideEffects: ai.sideEffects || [],
      dosage: ai.dosage || '',
      warnings: ai.warnings || [],
    };

    // ── STEP 3: MERGE — local regex data takes priority over AI for expiry ─
    // AI confidence = certainty this is a real medicine (not OCR readability).
    // Never inflate with OCR confidence — a clear fake label has high OCR but low AI confidence.
    const finalConfidence = ai.confidence ?? 0.5;
    const knownMedicine = ai.knownMedicine !== false; // default true unless AI explicitly says false
    const fakeDetection = detectFakeMedicine(extractedText, finalConfidence, knownMedicine);

    const finalExpiry = localAnalysis.expiry.found
      ? {
        status: localAnalysis.expiry.status === 'unknown' ? 'valid' : localAnalysis.expiry.status,
        message: localAnalysis.expiry.message,
        expiryDate: localAnalysis.expiry.rawDate,
        expiryDateFormatted: localAnalysis.expiry.formatted,
        daysUntilExpiry: localAnalysis.expiry.daysUntilExpiry,
        source: 'local-regex',
      }
      : {
        status: ai.expiryStatus || 'valid',
        message: ai.expiryMessage || 'No expiry date found on packaging.',
        expiryDate: ai.expiryDate || null,
        expiryDateFormatted: ai.expiryDateFormatted || null,
        daysUntilExpiry: ai.daysUntilExpiry ?? 9999,
        source: 'ai',
      };

    return NextResponse.json({
      success: true,
      result: {
        medicineName: ai.medicineName,
        medicineData,
        extractedText,
        expiryStatus: finalExpiry,
        localRules: {
          drugWarnings: localAnalysis.drugRules,
          detectedDrugs: localAnalysis.detectedKeywords,
          fakeDetection,
        },
        simplifiedInfo: {
          uses: ai.uses || [],
          sideEffects: ai.sideEffects || [],
          warnings: ai.warnings || [],
        },
        confidence: finalConfidence,
        knownMedicine,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('[MedAware] Analyze API Error:', error);
    const msg = error?.message || '';
    if (msg.includes('rate_limit') || msg.includes('429')) {
      return NextResponse.json(
        { error: 'Rate limit reached. Please wait a moment and try again.' },
        { status: 429 }
      );
    }
    if (msg.includes('invalid_api_key') || msg.includes('401')) {
      return NextResponse.json(
        { error: 'Invalid Groq API key. Please check your GROQ_API_KEY at console.groq.com.' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to analyze medicine image. Please try again.' },
      { status: 500 }
    );
  }
}
