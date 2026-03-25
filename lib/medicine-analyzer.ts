import {
  searchMedicine,
  simplifyMedicalText,
  checkExpiryStatus,
  type Medicine,
  medicineDatabase,
} from '@/lib/medicine-database';
import { extractMedicineInfo } from '@/lib/ocr-utils';
import {
  findBestMedicineMatch,
  formatMedicineNotFoundError,
  extractMedicineNameFromText,
} from '@/lib/medicine-matcher';

export interface AnalysisResult {
  medicineName: string;
  medicineData: Medicine | null;
  extractedText: string;
  expiryStatus: {
    status: 'valid' | 'near-expiry' | 'expired';
    message: string;
  };
  simplifiedInfo: {
    uses: string[];
    sideEffects: string[];
    warnings: string[];
  };
  confidence: number;
  timestamp: string;
  matchSuggestions?: Array<{ name: string; similarity: number }>;
  matchError?: string;
}

/**
 * Main analysis function that processes OCR text and returns medicine information
 * Now with fuzzy matching for better name detection
 */
export function analyzeMedicineText(
  extractedText: string,
  confidence: number
): AnalysisResult | null {
  if (!extractedText || confidence < 0.3) {
    return null;
  }

  const { medicineName, expiryDate, rawText } = extractMedicineInfo(extractedText);

  if (!medicineName) {
    return null;
  }

  // Try exact match first
  let medicineData = searchMedicine(medicineName);
  let matchError: string | undefined;
  let matchSuggestions: Array<{ name: string; similarity: number }> | undefined;

  // If no exact match, try fuzzy matching
  if (!medicineData) {
    const availableMedicines = Object.values(medicineDatabase)
      .map((m) => m.name)
      .concat(
        Object.values(medicineDatabase).flatMap((m) => m.aliases)
      );

    const matchResult = findBestMedicineMatch(medicineName, availableMedicines);

    if (matchResult.match && matchResult.similarity > 0.6) {
      // Found a good fuzzy match
      medicineData = searchMedicine(matchResult.match);
    } else if (matchResult.suggestions.length > 0) {
      // Found suggestions but no confident match
      matchError = formatMedicineNotFoundError(
        medicineName,
        matchResult.suggestions
      );
      matchSuggestions = matchResult.suggestions;
    } else {
      // No match found at all
      matchError = `Medicine "${medicineName}" not found in database. Please check the spelling on the packaging.`;
    }
  }

  // Return null if still no medicine found
  if (!medicineData && !matchSuggestions) {
    return null;
  }

  const expiryStatus = expiryDate
    ? checkExpiryStatus(expiryDate)
    : { status: 'valid' as const, message: 'No expiry date found' };

  const simplifiedInfo = medicineData
    ? {
        uses: medicineData.uses.map((u) => simplifyMedicalText(u)),
        sideEffects: medicineData.sideEffects.map((s) =>
          simplifyMedicalText(s)
        ),
        warnings: medicineData.warnings.map((w) => simplifyMedicalText(w)),
      }
    : {
        uses: [],
        sideEffects: [],
        warnings: [],
      };

  return {
    medicineName: medicineData?.name || medicineName,
    medicineData: medicineData || null,
    extractedText: rawText,
    expiryStatus,
    simplifiedInfo,
    confidence: Math.min(confidence, 1),
    timestamp: new Date().toISOString(),
    matchSuggestions,
    matchError,
  };
}

/**
 * Validate analysis result
 */
export function isValidAnalysisResult(result: AnalysisResult | null): result is AnalysisResult {
  return result !== null && result.medicineData !== null;
}

/**
 * Generate summary for display
 */
export function generateMedicineSummary(result: AnalysisResult): string {
  const lines = [
    `Medicine: ${result.medicineName}`,
    `Confidence: ${Math.round(result.confidence * 100)}%`,
    `Status: ${result.expiryStatus.status}`,
    '',
    'Main Uses:',
    ...result.simplifiedInfo.uses.slice(0, 3).map(u => `• ${u}`),
    '',
    'Common Side Effects:',
    ...result.simplifiedInfo.sideEffects.slice(0, 3).map(s => `• ${s}`),
    '',
    'Important Warnings:',
    ...result.simplifiedInfo.warnings.slice(0, 3).map(w => `• ${w}`)
  ];

  return lines.join('\n');
}
