import { generateText, Output } from 'ai';
import { z } from 'zod';
import {
  prepareMedicineForAIAnalysis,
  generateSafetyContext,
  generateInteractionPrompt,
  generatePopulationWarningsPrompt,
  generateSimplifiedExplanationPrompt,
  type SafetyAnalysis,
} from '@/lib/ai-safety-analyzer';

// Define the safety analysis schema
const SafetySchema = z.object({
  safetyWarnings: z.array(z.string()).describe('List of critical safety warnings'),
  interactionRisks: z
    .array(z.string())
    .describe('Common drug interactions or conflicts'),
  populationWarnings: z
    .array(z.string())
    .describe('Warnings specific to vulnerable populations'),
  simplifiedExplanation: z
    .string()
    .describe('Simple explanation of how the medicine works'),
  confidenceScore: z
    .number()
    .min(0)
    .max(1)
    .describe('Confidence score for the analysis'),
});

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

    // Prepare context for AI analysis
    const medicineContext = prepareMedicineForAIAnalysis(
      medicineName,
      uses,
      sideEffects,
      warnings,
      expiryStatus
    );

    const systemPrompt = generateSafetyContext(medicineName, expiryStatus);

    // Generate comprehensive safety analysis using AI
    const result = await generateText({
      model: 'openai/gpt-4o-mini',
      system: systemPrompt,
      prompt: `${medicineContext}

Generate a comprehensive safety analysis in JSON format with:
1. Critical safety warnings (list top 3-4)
2. Common drug interactions or substance conflicts (list top 3)
3. Warnings for specific populations (pregnant women, elderly, children, etc.)
4. A simple explanation of how this medicine works (2-3 sentences for non-medical users)

Make all warnings and explanations use simple, non-technical language.
${expiryStatus === 'expired' ? 'IMPORTANT: This medicine is EXPIRED - this is a critical safety warning.' : ''}

Return as valid JSON object with keys: safetyWarnings (array), interactionRisks (array), populationWarnings (array), simplifiedExplanation (string), confidenceScore (0-1).`,
      output: Output.object({
        schema: SafetySchema,
      }),
    });

    // Parse and structure the response
    const analysis: SafetyAnalysis = {
      safetyWarnings: result.object.safetyWarnings || [],
      interactionRisks: result.object.interactionRisks || [],
      populationWarnings: result.object.populationWarnings || [],
      simplifiedExplanation: result.object.simplifiedExplanation || '',
      confidenceScore: result.object.confidenceScore || 0.8,
      disclaimers: [
        'This AI-generated analysis is for educational purposes only.',
        'Always consult with a healthcare professional before taking any medication.',
        'Do not use this as a substitute for professional medical advice.',
        'If experiencing severe side effects, seek immediate medical attention.',
      ],
    };

    return Response.json(analysis);
  } catch (error) {
    console.error('[v0] AI Safety Analysis Error:', error);
    return Response.json(
      { error: 'Failed to generate safety analysis' },
      { status: 500 }
    );
  }
}
