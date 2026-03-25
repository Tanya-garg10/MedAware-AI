/**
 * AI-powered safety analysis and simplified explanations
 * Uses Claude AI to generate context-aware warnings and easy-to-understand information
 */

export interface SafetyAnalysis {
  safetyWarnings: string[];
  interactionRisks: string[];
  populationWarnings: string[]; // Warnings for specific populations
  simplifiedExplanation: string;
  confidenceScore: number;
  disclaimers: string[];
}

/**
 * Prepares medicine data for AI analysis
 */
export function prepareMedicineForAIAnalysis(
  medicineName: string,
  uses: string[],
  sideEffects: string[],
  warnings: string[],
  expiryStatus: string
): string {
  return `
Medicine: ${medicineName}
Expiry Status: ${expiryStatus}

Clinical Uses:
${uses.map((u) => `- ${u}`).join('\n')}

Known Side Effects:
${sideEffects.map((s) => `- ${s}`).join('\n')}

Warnings and Precautions:
${warnings.map((w) => `- ${w}`).join('\n')}
`;
}

/**
 * Generate context for safety warnings based on medicine data
 */
export function generateSafetyContext(
  medicineName: string,
  expiryStatus: string
): string {
  const baseContext = `You are a medical safety AI assistant. Generate safety information for non-medical users about ${medicineName}.`;

  if (expiryStatus === 'expired') {
    return (
      baseContext + ' This medicine is EXPIRED - emphasize this is extremely important.'
    );
  }

  if (expiryStatus === 'near-expiry') {
    return baseContext + ' This medicine is nearing expiry - mention this in warnings.';
  }

  return baseContext;
}

/**
 * Generate interaction risk assessment
 */
export function generateInteractionPrompt(medicineName: string): string {
  return `List the top 3 common drug interactions or conflicts with other substances for ${medicineName}. 
Be specific but use simple language that a non-medical person would understand.
Format as a simple list.`;
}

/**
 * Generate population-specific warnings
 */
export function generatePopulationWarningsPrompt(medicineName: string): string {
  return `List specific warnings for these populations regarding ${medicineName}:
- Pregnant women
- Elderly people
- People with liver or kidney problems
- Children

Be very brief and use simple language. Format as a list.`;
}

/**
 * Generate simplified explanation prompt
 */
export function generateSimplifiedExplanationPrompt(
  medicineName: string,
  uses: string[]
): string {
  const usesText = uses.slice(0, 2).join(' and ');
  return `Explain what ${medicineName} does in the body in 2-3 simple sentences. 
Imagine explaining to someone with no medical background.
Focus on: how it works to help with ${usesText}.
Keep it friendly and non-technical.`;
}
