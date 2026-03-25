/**
 * Utility functions that use the medical simplifier
 * Provides easy-to-use functions for converting medical data into simple explanations
 */

import {
  simplifyMedicalDescription,
  convertToSimpleSentences,
  createSimpleExplanation,
  simplifySideEffects,
  simplifyPopulationWarnings,
  createComprehensiveExplanation,
} from './medical-simplifier';

/**
 * Format medicine information for display to non-medical users
 */
export function formatMedicineForLayperson(medicineData: {
  name: string;
  uses: string[];
  sideEffects: string[];
  dosage: string;
  warnings: string[];
}) {
  return {
    name: medicineData.name,
    whatItDoes: createSimpleExplanation(medicineData.uses),
    howToTakeIt: `Typical dose: ${simplifyMedicalDescription(medicineData.dosage)}`,
    possibleSideEffects: simplifySideEffects(medicineData.sideEffects),
    importantWarnings: simplifyPopulationWarnings(medicineData.warnings),
  };
}

/**
 * Create a simple, readable health tip from medical information
 */
export function createHealthTip(medicalStatement: string): string {
  const simplified = simplifyMedicalDescription(medicalStatement);
  const sentences = convertToSimpleSentences(simplified);
  
  return sentences
    .map(sentence => sentence.replace(/\b\w/g, char => char.toUpperCase()))
    .join(' ');
}

/**
 * Generate a simple explanation for why someone shouldn't take a medicine
 */
export function generateContraindication(reason: string): string {
  const simplified = simplifyMedicalDescription(reason);
  return `Don't take this medicine if ${simplified.toLowerCase()}.`;
}

/**
 * Format all medicine information comprehensively for a patient
 */
export function generatePatientInformation(medicineData: {
  name: string;
  uses: string[];
  sideEffects: string[];
  warnings: string[];
  dosage: string;
}): {
  title: string;
  whatItDoes: string;
  howToTakeIt: string;
  sideEffects: string[];
  importantWarnings: Record<string, string>;
  whenToSeekHelp: string[];
} {
  const sideEffects = simplifySideEffects(medicineData.sideEffects);
  
  return {
    title: `Understanding ${medicineData.name}`,
    whatItDoes: createSimpleExplanation(medicineData.uses),
    howToTakeIt: simplifyMedicalDescription(medicineData.dosage),
    sideEffects,
    importantWarnings: simplifyPopulationWarnings(medicineData.warnings),
    whenToSeekHelp: [
      'Severe allergic reaction (swelling, difficulty breathing)',
      'Unusual bleeding or bruising',
      'Severe chest pain or difficulty breathing',
      'Thoughts of self-harm or suicide',
      'Severe rash or skin reaction',
      'Signs of liver problems (yellowing skin, dark urine)',
    ],
  };
}

/**
 * Compare two medicines in simple terms
 */
export function compareMedicines(
  medicine1: { name: string; uses: string[] },
  medicine2: { name: string; uses: string[] }
): string {
  const uses1 = createSimpleExplanation(medicine1.uses);
  const uses2 = createSimpleExplanation(medicine2.uses);
  
  return `${medicine1.name} ${uses1.toLowerCase()} while ${medicine2.name} ${uses2.toLowerCase()}.`;
}

/**
 * Create a reminder for taking medicine
 */
export function createMedicationReminder(medicineData: {
  name: string;
  dosage: string;
}): string {
  const simpleDosage = simplifyMedicalDescription(medicineData.dosage);
  return `Time to take ${medicineData.name}. Dose: ${simpleDosage}`;
}
