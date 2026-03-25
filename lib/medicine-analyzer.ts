import {
  searchMedicine,
  simplifyMedicalText,
  checkExpiryStatus,
  type Medicine
} from '@/lib/medicine-database';
import { extractMedicineInfo } from '@/lib/ocr-utils';

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
}

/**
 * Main analysis function that processes OCR text and returns medicine information
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

  const medicineData = searchMedicine(medicineName);

  if (!medicineData) {
    return null;
  }

  const expiryStatus = expiryDate 
    ? checkExpiryStatus(expiryDate)
    : { status: 'valid' as const, message: 'No expiry date found' };

  const simplifiedInfo = {
    uses: medicineData.uses.map(u => simplifyMedicalText(u)),
    sideEffects: medicineData.sideEffects.map(s => simplifyMedicalText(s)),
    warnings: medicineData.warnings.map(w => simplifyMedicalText(w))
  };

  return {
    medicineName: medicineData.name,
    medicineData,
    extractedText: rawText,
    expiryStatus,
    simplifiedInfo,
    confidence: Math.min(confidence, 1),
    timestamp: new Date().toISOString()
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
