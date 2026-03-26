import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { createGroq } from '@ai-sdk/groq';

export async function POST(request: NextRequest) {
  try {
    const { medicine1, medicine2 } = await request.json();

    if (!medicine1 || !medicine2) {
      return NextResponse.json({ error: 'Please provide both medicine names.' }, { status: 400 });
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'AI not configured.' }, { status: 503 });
    }

    const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      system: `You are a clinical pharmacist expert in drug interactions. Always respond with valid JSON only, no markdown, no code blocks.`,
      prompt: `Analyze the drug interaction between "${medicine1}" and "${medicine2}".

Return ONLY a raw JSON object:
{
  "riskLevel": "safe|mild|moderate|severe",
  "summary": "one sentence summary of the interaction",
  "details": ["detail 1", "detail 2", "detail 3"],
  "recommendation": "what the patient should do",
  "canTakeTogether": true
}

riskLevel guide:
- safe: no known interaction, generally safe to take together
- mild: minor interaction, usually not harmful
- moderate: significant interaction, use with caution
- severe: dangerous combination, avoid taking together

canTakeTogether: false only if riskLevel is "severe"`,
    });

    let result: any;
    try {
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      result = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: 'Failed to parse interaction result.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('[MedAware] Drug Interaction API Error:', error);
    return NextResponse.json({ error: 'Failed to check interaction. Please try again.' }, { status: 500 });
  }
}
