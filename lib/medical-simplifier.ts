/**
 * Medical Text Simplifier
 * Converts complex medical terminology into simple, easy-to-understand explanations
 * designed for non-medical users and lay audience
 */

interface MedicalTerm {
  medical: string;
  simple: string;
  explanation?: string;
}

// Comprehensive medical term dictionary with lay explanations
const medicalDictionary: MedicalTerm[] = [
  // Conditions and Diseases
  { medical: 'hypertension', simple: 'high blood pressure', explanation: 'when your blood pushes too hard against your artery walls' },
  { medical: 'hypotension', simple: 'low blood pressure', explanation: 'when your blood pressure is too low' },
  { medical: 'tachycardia', simple: 'fast heartbeat', explanation: 'when your heart beats too quickly' },
  { medical: 'bradycardia', simple: 'slow heartbeat', explanation: 'when your heart beats too slowly' },
  { medical: 'myocardial infarction', simple: 'heart attack', explanation: 'when blood flow to the heart is blocked' },
  { medical: 'cerebrovascular accident', simple: 'stroke', explanation: 'when blood flow to the brain is blocked' },
  { medical: 'gastroesophageal reflux', simple: 'acid reflux', explanation: 'when stomach acid backs up into your throat' },
  { medical: 'gerd', simple: 'acid reflux disease', explanation: 'frequent acid reflux that damages your throat' },
  { medical: 'pharyngitis', simple: 'sore throat', explanation: 'inflammation of your throat' },
  { medical: 'rhinitis', simple: 'nasal inflammation', explanation: 'swelling inside your nose' },
  { medical: 'sinusitis', simple: 'sinus infection', explanation: 'infection in the air pockets in your face' },
  { medical: 'otitis', simple: 'ear infection', explanation: 'infection in your ear' },
  { medical: 'dyspnea', simple: 'difficulty breathing', explanation: 'shortness of breath or trouble breathing' },
  { medical: 'apnea', simple: 'breathing stops', explanation: 'when you stop breathing for short periods' },
  { medical: 'asthma', simple: 'airway narrowing', explanation: 'when airways in your lungs tighten making breathing hard' },
  { medical: 'pneumonia', simple: 'lung infection', explanation: 'infection in your lungs that fills them with fluid' },
  { medical: 'bronchitis', simple: 'airway infection', explanation: 'infection in the tubes that carry air to your lungs' },
  { medical: 'hepatitis', simple: 'liver inflammation', explanation: 'swelling and inflammation of your liver' },
  { medical: 'cirrhosis', simple: 'liver scarring', explanation: 'scarring of liver tissue that damages the liver' },
  { medical: 'nephritis', simple: 'kidney inflammation', explanation: 'swelling of your kidneys' },
  { medical: 'renal insufficiency', simple: 'kidney problems', explanation: 'when your kidneys don\'t work properly' },
  { medical: 'diabetes mellitus', simple: 'diabetes', explanation: 'when your body can\'t control blood sugar levels' },
  { medical: 'arthritis', simple: 'joint inflammation', explanation: 'swelling and pain in your joints' },
  { medical: 'osteoporosis', simple: 'weak bones', explanation: 'when your bones become fragile and break easily' },
  { medical: 'anemia', simple: 'low red blood cells', explanation: 'not enough healthy red blood cells to carry oxygen' },
  { medical: 'leukemia', simple: 'blood cancer', explanation: 'cancer of the blood cells' },
  { medical: 'melanoma', simple: 'skin cancer', explanation: 'a serious type of cancer that starts in skin cells' },
  { medical: 'dermatitis', simple: 'skin inflammation', explanation: 'swelling, redness, or irritation of the skin' },
  { medical: 'psoriasis', simple: 'skin condition', explanation: 'a condition where skin becomes red, thick, and scaly' },
  { medical: 'eczema', simple: 'itchy skin condition', explanation: 'inflamed skin that\'s itchy and easily irritated' },
  { medical: 'anxiety disorder', simple: 'excessive worry', explanation: 'when worry and fear interfere with daily life' },
  { medical: 'depression', simple: 'persistent sadness', explanation: 'lasting feelings of sadness and hopelessness' },
  { medical: 'bipolar disorder', simple: 'mood swings', explanation: 'extreme shifts between very high and very low moods' },
  { medical: 'schizophrenia', simple: 'thought disorder', explanation: 'difficulty distinguishing reality from imagination' },
  { medical: 'ptsd', simple: 'trauma response', explanation: 'ongoing stress reaction after a traumatic event' },
  { medical: 'ocd', simple: 'obsessive thinking', explanation: 'unwanted repetitive thoughts and urges to do things' },
  { medical: 'dementia', simple: 'memory loss', explanation: 'progressive loss of memory and thinking abilities' },
  { medical: 'alzheimers', simple: 'progressive memory loss', explanation: 'a form of dementia that worsens over time' },
  { medical: 'parkinson\'s', simple: 'movement disorder', explanation: 'a disease that causes shaking and difficulty moving' },

  // Medical Procedures and Actions
  { medical: 'prophylaxis', simple: 'prevention', explanation: 'taking action to prevent disease' },
  { medical: 'diagnosis', simple: 'identification of illness', explanation: 'determining what disease or condition someone has' },
  { medical: 'prognosis', simple: 'likely outcome', explanation: 'what doctors expect will happen with your condition' },
  { medical: 'biopsy', simple: 'tissue sample', explanation: 'removing a small piece of tissue to examine' },
  { medical: 'endoscopy', simple: 'camera examination', explanation: 'using a thin camera to look inside your body' },
  { medical: 'colonoscopy', simple: 'colon screening', explanation: 'using a camera to examine your large intestine' },
  { medical: 'ct scan', simple: 'detailed x-ray image', explanation: 'special x-rays that create 3d pictures inside your body' },
  { medical: 'mri', simple: 'body image scan', explanation: 'using magnets to take detailed pictures of your body' },
  { medical: 'ultrasound', simple: 'sound wave imaging', explanation: 'using sound waves to see inside your body' },
  { medical: 'ecg', simple: 'heart rhythm test', explanation: 'measuring the electrical activity of your heart' },
  { medical: 'ekg', simple: 'heart activity test', explanation: 'recording your heart\'s electrical signals' },
  { medical: 'biopsy', simple: 'tissue test', explanation: 'taking a sample to check for disease' },
  { medical: 'resection', simple: 'surgical removal', explanation: 'surgically removing part of the body' },
  { medical: 'ablation', simple: 'tissue destruction', explanation: 'destroying tissue, usually using heat or cold' },
  { medical: 'amputation', simple: 'limb removal', explanation: 'surgically removing an arm or leg' },
  { medical: 'dialysis', simple: 'blood filtering', explanation: 'using a machine to clean your blood when kidneys fail' },
  { medical: 'intubation', simple: 'breathing tube', explanation: 'placing a tube in the airway to help with breathing' },
  { medical: 'sedation', simple: 'medical sleep', explanation: 'medications that make you drowsy or unconscious' },
  { medical: 'anesthesia', simple: 'surgical sleep', explanation: 'medications that put you to sleep for surgery' },
  { medical: 'vaccination', simple: 'immunization shot', explanation: 'a shot that teaches your immune system to fight disease' },
  { medical: 'chemotherapy', simple: 'cancer drug treatment', explanation: 'powerful medicines used to kill cancer cells' },
  { medical: 'radiation therapy', simple: 'cancer radiation', explanation: 'using radiation beams to destroy cancer cells' },
  { medical: 'immunotherapy', simple: 'immune system boosting', explanation: 'using medicines to strengthen your immune system' },

  // Drug-Related Terms
  { medical: 'contraindicated', simple: 'should not be used', explanation: 'when a medicine is not safe for a specific person' },
  { medical: 'adverse reaction', simple: 'bad reaction', explanation: 'an unwanted or harmful effect from a medicine' },
  { medical: 'side effect', simple: 'unwanted effect', explanation: 'an unintended effect from taking a medicine' },
  { medical: 'efficacy', simple: 'effectiveness', explanation: 'how well a medicine works' },
  { medical: 'potency', simple: 'strength', explanation: 'how strong or powerful a medicine is' },
  { medical: 'bioavailability', simple: 'how much gets used', explanation: 'the amount of medicine your body actually uses' },
  { medical: 'metabolism', simple: 'body processing', explanation: 'how your body breaks down and uses food and medicine' },
  { medical: 'hepatotoxic', simple: 'liver damaging', explanation: 'can cause damage to the liver' },
  { medical: 'nephrotoxic', simple: 'kidney damaging', explanation: 'can cause damage to the kidneys' },
  { medical: 'ototoxic', simple: 'hearing damaging', explanation: 'can cause damage to hearing' },
  { medical: 'teratogenic', simple: 'birth defect causing', explanation: 'can cause birth defects if used during pregnancy' },
  { medical: 'mutagenic', simple: 'gene damaging', explanation: 'can cause genetic mutations' },
  { medical: 'carcinogenic', simple: 'cancer causing', explanation: 'can cause cancer' },
  { medical: 'interactions', simple: 'medicine conflicts', explanation: 'when two medicines don\'t work well together' },
  { medical: 'contraindication', simple: 'warning against use', explanation: 'a medical reason not to use a medicine' },
  { medical: 'tolerance', simple: 'reduced effectiveness', explanation: 'when a medicine becomes less effective over time' },
  { medical: 'dependence', simple: 'physical need', explanation: 'when your body depends on a medicine to function' },
  { medical: 'addiction', simple: 'compulsive use', explanation: 'an inability to stop using something despite harm' },
  { medical: 'withdrawal', simple: 'stopping side effects', explanation: 'unpleasant symptoms when stopping a medicine' },
  { medical: 'overdose', simple: 'too much medicine', explanation: 'taking more than the safe amount' },
  { medical: 'toxicity', simple: 'poisoning', explanation: 'harmful or poisonous effects from a substance' },

  // Body Systems and Anatomy
  { medical: 'cardiac', simple: 'heart-related', explanation: 'involving the heart' },
  { medical: 'pulmonary', simple: 'lung-related', explanation: 'involving the lungs' },
  { medical: 'hepatic', simple: 'liver-related', explanation: 'involving the liver' },
  { medical: 'renal', simple: 'kidney-related', explanation: 'involving the kidneys' },
  { medical: 'cerebral', simple: 'brain-related', explanation: 'involving the brain' },
  { medical: 'vascular', simple: 'blood vessel-related', explanation: 'involving blood vessels' },
  { medical: 'metabolic', simple: 'body processing-related', explanation: 'involving how your body processes substances' },
  { medical: 'endocrine', simple: 'hormone-related', explanation: 'involving hormone production' },
  { medical: 'immune', simple: 'infection-fighting-related', explanation: 'involving the body\'s defense system' },
  { medical: 'gastrointestinal', simple: 'digestive-related', explanation: 'involving the stomach and intestines' },
  { medical: 'neurological', simple: 'nerve-related', explanation: 'involving the nerves and brain' },
  { medical: 'orthopedic', simple: 'bone and joint-related', explanation: 'involving bones and joints' },
  { medical: 'hematologic', simple: 'blood-related', explanation: 'involving the blood' },
  { medical: 'dermatologic', simple: 'skin-related', explanation: 'involving the skin' },
  { medical: 'ophthalmic', simple: 'eye-related', explanation: 'involving the eyes' },
  { medical: 'otic', simple: 'ear-related', explanation: 'involving the ears' },

  // General Medical Terms
  { medical: 'acute', simple: 'sudden and severe', explanation: 'happening quickly and intensely' },
  { medical: 'chronic', simple: 'long-lasting', explanation: 'lasting for a long time or permanently' },
  { medical: 'inflammation', simple: 'swelling and heat', explanation: 'redness, swelling, warmth, and pain in body parts' },
  { medical: 'infection', simple: 'germ invasion', explanation: 'when harmful germs enter and multiply in your body' },
  { medical: 'syndrome', simple: 'group of symptoms', explanation: 'a set of symptoms that occur together' },
  { medical: 'symptom', simple: 'sign of illness', explanation: 'something you feel that indicates you\'re unwell' },
  { medical: 'manifestation', simple: 'visible sign', explanation: 'a clear sign or indication of something' },
  { medical: 'etiology', simple: 'cause', explanation: 'the reason why something happens' },
  { medical: 'pathology', simple: 'disease process', explanation: 'the way a disease develops and affects the body' },
  { medical: 'remission', simple: 'symptom improvement', explanation: 'a period when symptoms improve or disappear' },
  { medical: 'relapse', simple: 'return of illness', explanation: 'when a disease comes back after improvement' },
  { medical: 'exacerbation', simple: 'worsening', explanation: 'when symptoms get worse' },
  { medical: 'complication', simple: 'new problem', explanation: 'a new problem that develops from an existing condition' },
  { medical: 'comorbidity', simple: 'multiple conditions', explanation: 'having more than one health condition at the same time' },
  { medical: 'prognosis', simple: 'outlook', explanation: 'the expected course or outcome of a disease' },
  { medical: 'palliative', simple: 'comfort focused', explanation: 'treatment focused on comfort rather than cure' },
  { medical: 'curative', simple: 'healing-focused', explanation: 'treatment designed to cure or eliminate disease' },
  { medical: 'asymptomatic', simple: 'no symptoms', explanation: 'having a condition but not feeling sick' },
  { medical: 'symptomatic', simple: 'showing symptoms', explanation: 'having noticeable signs of illness' },
  { medical: 'subclinical', simple: 'not yet noticeable', explanation: 'disease present but not causing obvious symptoms' },
  { medical: 'clinical', simple: 'noticeable', explanation: 'noticeable symptoms of disease' },
];

/**
 * Simplifies complex medical text into easy-to-understand language
 * @param text - The medical text to simplify
 * @returns Simplified version of the text
 */
export function simplifyMedicalDescription(text: string): string {
  if (!text) return '';

  let simplified = text;

  // Replace medical terms (case-insensitive)
  medicalDictionary.forEach(({ medical, simple }) => {
    const regex = new RegExp(`\\b${medical}\\b`, 'gi');
    simplified = simplified.replace(regex, simple);
  });

  // Clean up multiple spaces
  simplified = simplified.replace(/\s+/g, ' ').trim();

  return simplified;
}

/**
 * Converts medical descriptions into simple, complete sentences
 * @param medicalText - The medical description
 * @returns Array of simple sentences
 */
export function convertToSimpleSentences(medicalText: string): string[] {
  const simplified = simplifyMedicalDescription(medicalText);
  
  // Split into sentences
  const sentences = simplified.split(/(?<=[.!?])\s+/).filter(s => s.trim());
  
  return sentences.map(sentence => {
    // Capitalize first letter
    return sentence.charAt(0).toUpperCase() + sentence.slice(1);
  });
}

/**
 * Creates a user-friendly explanation of what a medicine does
 * @param uses - Array of medical use descriptions
 * @returns Simple explanation for non-medical users
 */
export function createSimpleExplanation(uses: string[]): string {
  if (!uses || uses.length === 0) return 'This medicine helps treat various medical conditions.';

  const simplifiedUses = uses.map(use => simplifyMedicalDescription(use));
  
  if (simplifiedUses.length === 1) {
    return `This medicine is used to treat ${simplifiedUses[0].toLowerCase()}.`;
  }

  const lastUse = simplifiedUses[simplifiedUses.length - 1];
  const otherUses = simplifiedUses.slice(0, -1).join(', ');

  return `This medicine is used to treat ${otherUses}, and ${lastUse.toLowerCase()}.`;
}

/**
 * Simplifies side effects into plain language
 * @param sideEffects - Array of side effect descriptions
 * @returns Simplified side effects with explanations
 */
export function simplifySideEffects(sideEffects: string[]): string[] {
  if (!sideEffects) return [];

  return sideEffects.map(effect => {
    const simplified = simplifyMedicalDescription(effect);
    
    // Add explanations for common side effects
    const explanations: Record<string, string> = {
      'stomach upset': 'your stomach may feel uncomfortable or painful',
      'nausea': 'you may feel like you want to vomit',
      'diarrhea': 'you may have loose or frequent bowel movements',
      'dizziness': 'you may feel lightheaded or unbalanced',
      'headache': 'you may experience head pain',
      'insomnia': 'you may have trouble sleeping',
      'drowsiness': 'you may feel very sleepy',
      'dry mouth': 'your mouth may feel parched',
      'rash': 'red or itchy patches may appear on your skin',
      'tremor': 'you may experience involuntary shaking',
      'fatigue': 'you may feel very tired',
    };

    const lowerEffec = simplified.toLowerCase();
    const explanation = Object.entries(explanations).find(([key]) => lowerEffec.includes(key));

    return explanation ? `${simplified} - ${explanation[1]}` : simplified;
  });
}

/**
 * Creates a simple explanation for drug interactions
 * @param medicines - Array of medicine names that interact
 * @returns Simple warning about interactions
 */
export function createInteractionWarning(medicines: string[]): string {
  if (medicines.length < 2) return '';

  const medicineList = medicines.slice(0, -1).join(', ') + (medicines.length > 1 ? ` and ${medicines[medicines.length - 1]}` : '');
  
  return `Do not take ${medicineList} together. These medicines don't work well when used at the same time.`;
}

/**
 * Creates population-specific warnings in simple language
 * @param warnings - Array of medical warnings
 * @returns Simple warnings for different groups
 */
export function simplifyPopulationWarnings(warnings: string[]): Record<string, string> {
  const simplified: Record<string, string> = {
    pregnant: '',
    elderly: '',
    children: '',
    breastfeeding: '',
    general: '',
  };

  if (!warnings) return simplified;

  warnings.forEach(warning => {
    const lower = warning.toLowerCase();
    const simple = simplifyMedicalDescription(warning);

    if (lower.includes('pregnant') || lower.includes('pregnancy')) {
      simplified.pregnant = `Pregnant women: ${simple}`;
    } else if (lower.includes('elderly') || lower.includes('older') || lower.includes('age')) {
      simplified.elderly = `Elderly people: ${simple}`;
    } else if (lower.includes('children') || lower.includes('child') || lower.includes('pediatric')) {
      simplified.children = `Children: ${simple}`;
    } else if (lower.includes('breastfeed') || lower.includes('nursing')) {
      simplified.breastfeeding = `Breastfeeding mothers: ${simple}`;
    } else {
      if (simplified.general) {
        simplified.general += ` Also, ${simple.toLowerCase()}`;
      } else {
        simplified.general = simple;
      }
    }
  });

  return Object.fromEntries(
    Object.entries(simplified).filter(([_, value]) => value)
  );
}

/**
 * Creates a complete non-medical explanation for a medicine
 */
export function createComprehensiveExplanation(medicineData: {
  name: string;
  uses: string[];
  sideEffects: string[];
  warnings: string[];
  dosage: string;
}): {
  whatItDoes: string;
  howToTakeIt: string;
  possibleSideEffects: string[];
  importantWarnings: string;
} {
  return {
    whatItDoes: createSimpleExplanation(medicineData.uses),
    howToTakeIt: `Typical dosage: ${medicineData.dosage}. Always follow your doctor's instructions.`,
    possibleSideEffects: simplifySideEffects(medicineData.sideEffects),
    importantWarnings: simplifyMedicalDescription(medicineData.warnings.join(' ').substring(0, 200)),
  };
}
