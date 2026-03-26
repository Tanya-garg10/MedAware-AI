/**
 * Fuzzy matching utility for medicine name matching
 * Provides flexible medicine search with partial matches and typo tolerance
 */

/**
 * Calculate similarity between two strings using Levenshtein distance
 * Returns a score between 0 and 1 (1 = exact match, 0 = no match)
 */
export function calculateStringSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 1;
  if (s1.length === 0 || s2.length === 0) return 0;

  // Check if one string contains the other
  if (s1.includes(s2) || s2.includes(s1)) return 0.8;

  // Levenshtein distance algorithm
  const distances: number[][] = [];

  for (let i = 0; i <= s1.length; i++) {
    distances[i] = [i];
  }

  for (let j = 0; j <= s2.length; j++) {
    distances[0][j] = j;
  }

  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        distances[i][j] = distances[i - 1][j - 1];
      } else {
        distances[i][j] = Math.min(
          distances[i - 1][j] + 1,    // deletion
          distances[i][j - 1] + 1,    // insertion
          distances[i - 1][j - 1] + 1 // substitution
        );
      }
    }
  }

  const distance = distances[s1.length][s2.length];
  const maxLength = Math.max(s1.length, s2.length);

  // Convert distance to similarity score (0-1)
  return Math.max(0, 1 - distance / maxLength);
}

/**
 * Phonetic similarity for common drug name variations
 * e.g., "ibuprofen" vs "ibuprofen" (exact), "aspirin" vs "asprin" (typo)
 */
export function getPhoneticVariations(name: string): string[] {
  const normalized = name.toLowerCase().trim();
  const variations = [normalized];

  // Common OCR errors and variations
  const errorPatterns: Record<string, string[]> = {
    '0': ['O', 'o', 'l'],
    'l': ['1', 'I', 'i'],
    '5': ['S', 's'],
    '8': ['B', 'b'],
  };

  // Add common drug name abbreviations
  if (normalized.includes('hydrochloride') || normalized.includes('hcl')) {
    variations.push(normalized.replace(/hydrochloride|hcl/gi, '').trim());
  }

  if (normalized.includes('sulfate') || normalized.includes('sulfat')) {
    variations.push(normalized.replace(/sulfate|sulfat/gi, '').trim());
  }

  if (normalized.includes('acetate')) {
    variations.push(normalized.replace(/acetate/gi, '').trim());
  }

  return variations.filter((v) => v.length > 0);
}

/**
 * Find best matching medicine name with similarity score
 */
export interface MatchResult {
  match: string | null;
  similarity: number;
  suggestions: Array<{ name: string; similarity: number }>;
}

export function findBestMedicineMatch(
  extractedName: string,
  availableMedicines: string[]
): MatchResult {
  if (!extractedName || availableMedicines.length === 0) {
    return { match: null, similarity: 0, suggestions: [] };
  }

  const variations = getPhoneticVariations(extractedName);
  const scores: Array<{ name: string; similarity: number }> = [];

  // Score each available medicine against all variations
  for (const medicine of availableMedicines) {
    let maxSimilarity = 0;

    for (const variation of variations) {
      const similarity = calculateStringSimilarity(variation, medicine);
      maxSimilarity = Math.max(maxSimilarity, similarity);
    }

    if (maxSimilarity > 0) {
      scores.push({ name: medicine, similarity: maxSimilarity });
    }
  }

  // Sort by similarity (highest first)
  scores.sort((a, b) => b.similarity - a.similarity);

  const topMatch = scores[0];
  const suggestions = scores.slice(0, 3).filter((s) => s.similarity > 0.5);

  return {
    match: topMatch && topMatch.similarity > 0.6 ? topMatch.name : null,
    similarity: topMatch ? topMatch.similarity : 0,
    suggestions: suggestions.length > 0 ? suggestions : [],
  };
}

/**
 * Format error message with suggestions for user
 */
export function formatMedicineNotFoundError(
  extractedName: string,
  suggestions: Array<{ name: string; similarity: number }>
): string {
  let message = `"${extractedName}" not found in database.`;

  if (suggestions.length > 0) {
    const suggestionNames = suggestions
      .map((s) => `"${s.name}"`)
      .join(', ');
    message += ` Did you mean: ${suggestionNames}?`;
  } else {
    message += ` Try checking the spelling on the packaging.`;
  }

  return message;
}

/**
 * Check if extracted text quality is sufficient for matching
 */
export function isTextQualitySufficient(
  extractedText: string,
  confidence: number
): boolean {
  // Need reasonable confidence and text length
  return confidence >= 0.3 && extractedText.length >= 3;
}

/**
 * Extract medicine name from raw text with improved parsing
 */
export function extractMedicineNameFromText(text: string): string {
  const normalized = text
    .toLowerCase()
    .trim()
    .split(/[,;:\n|]/)[0]; // Take first segment

  // Remove common non-medicine words
  const stopWords = [
    'tablets',
    'capsules',
    'suspension',
    'syrup',
    'liquid',
    'cream',
    'lotion',
    'ointment',
    'drops',
    'gel',
    'spray',
    'powder',
    'mg',
    'mcg',
    'gm',
    'pack',
    'box',
    'bottle',
  ];

  let medicineText = normalized;
  for (const stopWord of stopWords) {
    medicineText = medicineText.replace(new RegExp(`\\b${stopWord}\\b`, 'gi'), '');
  }

  return medicineText.trim();
}
