import { generateText } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import {
  prepareMedicineForAIAnalysis,
  generateSafetyContext,
  type SafetyAnalysis,
} from '@/lib/ai-safety-analyzer';

export async function POST(request: Request) {
  try {
    const { medicineName, uses, sideEffects, warnings, expiryStatus } =
      await request.json();

    if (!medicineName || !uses || !sideEffects || !warnings) {
      return Response.json(
        { error: 'Missing required medicine information' },
        { status: 400 }
      );
    }

    const groq = createGroq({ apiKey: process.env.GROQ_API_KEY || '' });

    const medicineContext = prepareMedicineForAIAnalysis(
      medicineName,
      uses,
      sideEffects,
      warnings,
      expiryStatus
    );

    const systemPrompt = generateSafetyContext(medicineName, expiryStatus);

    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      system: systemPrompt + '\nAlways respond with valid JSON only, no markdown, no code blocks.',
      prompt: `${medicineContext}

Return ONLY a raw JSON object with these keys:
{
  "safetyWarnings": ["warning 1", "warning 2", "warning 3"],
  "interactionRisks": ["risk 1", "risk 2", "risk 3"],
  "populationWarnings": ["population warning 1", "population warning 2"],
  "simplifiedExplanation": "simple 2-3 sentence explanation of how this medicine works",
  "confidenceScore": 0.9
}

${expiryStatus === 'expired' ? 'IMPORTANT: Include that this medicine is EXPIRED as the first safety warning.' : ''}
Use simple, non-technical language throughout.`,
    });

    let parsed: any;
    try {
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error('Safety analysis JSON parse failed:', text);
      return Response.json({ error: 'Failed to parse safety analysis' }, { status: 500 });
    }

    const analysis: SafetyAnalysis = {
      safetyWarnings: parsed.safetyWarnings || [],
      interactionRisks: parsed.interactionRisks || [],
      populationWarnings: parsed.populationWarnings || [],
      simplifiedExplanation: parsed.simplifiedExplanation || '',
      confidenceScore: parsed.confidenceScore || 0.8,
      disclaimers: [
        'This AI-generated analysis is for educational purposes only.',
        'Always consult with a healthcare professional before taking any medication.',
        'Do not use this as a substitute for professional medical advice.',
        'If experiencing severe side effects, seek immediate medical attention.',
      ],
    };

    return Response.json(analysis);
  } catch (error) {
    console.error('[MedAware] Safety Analysis Error:', error);
    return Response.json(
      { error: 'Failed to generate safety analysis' },
      { status: 500 }
    );
  }
}
