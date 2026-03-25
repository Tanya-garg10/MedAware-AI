// Comprehensive medicine database with common medicines
export interface Medicine {
  id: string;
  name: string;
  aliases: string[];
  uses: string[];
  sideEffects: string[];
  dosage: string;
  warnings: string[];
}

export const medicineDatabase: Record<string, Medicine> = {
  'aspirin': {
    id: 'aspirin',
    name: 'Aspirin',
    aliases: ['acetylsalicylic acid', 'asa'],
    uses: [
      'Pain relief',
      'Fever reduction',
      'Inflammation reduction',
      'Blood clot prevention'
    ],
    sideEffects: [
      'Upset stomach',
      'Heartburn',
      'Nausea',
      'Allergic reactions in sensitive individuals'
    ],
    dosage: 'Usually 500mg to 1000mg every 4-6 hours',
    warnings: [
      'Do not use if allergic to salicylates',
      'Avoid if on blood thinners',
      'Not recommended for children with fever'
    ]
  },
  'paracetamol': {
    id: 'paracetamol',
    name: 'Paracetamol (Acetaminophen)',
    aliases: ['tylenol', 'acetaminophen', 'apap'],
    uses: [
      'Pain relief',
      'Fever reduction',
      'Headache treatment',
      'General ache relief'
    ],
    sideEffects: [
      'Rare allergic reactions',
      'Rash',
      'Liver damage if overused'
    ],
    dosage: '500mg to 1000mg every 4-6 hours (max 4000mg/day)',
    warnings: [
      'Do not exceed recommended dose',
      'Avoid alcohol consumption',
      'Not suitable for liver disease patients'
    ]
  },
  'ibuprofen': {
    id: 'ibuprofen',
    name: 'Ibuprofen',
    aliases: ['advil', 'motrin', 'brufen', 'nurofen'],
    uses: [
      'Pain relief',
      'Fever reduction',
      'Inflammation reduction',
      'Menstrual pain relief'
    ],
    sideEffects: [
      'Stomach upset',
      'Heartburn',
      'Nausea',
      'Dizziness',
      'Allergic reactions'
    ],
    dosage: '200mg to 400mg every 4-6 hours',
    warnings: [
      'Take with food to reduce stomach upset',
      'Avoid if allergic to NSAIDs',
      'Not recommended for heart disease patients',
      'May cause stomach ulcers with long-term use'
    ]
  },
  'amoxicillin': {
    id: 'amoxicillin',
    name: 'Amoxicillin',
    aliases: ['amoxil', 'augmentin'],
    uses: [
      'Bacterial infection treatment',
      'Ear infection treatment',
      'Throat infection treatment',
      'Urinary tract infection treatment'
    ],
    sideEffects: [
      'Diarrhea',
      'Nausea',
      'Vomiting',
      'Rash',
      'Allergic reactions'
    ],
    dosage: 'Usually 250mg to 500mg three times daily',
    warnings: [
      'Complete full course of antibiotics',
      'Discontinue if severe allergic reaction occurs',
      'Not suitable for penicillin allergy',
      'May reduce birth control effectiveness'
    ]
  },
  'omeprazole': {
    id: 'omeprazole',
    name: 'Omeprazole',
    aliases: ['prilosec', 'losec'],
    uses: [
      'Acid reflux treatment',
      'Heartburn relief',
      'Ulcer treatment',
      'GERD management'
    ],
    sideEffects: [
      'Headache',
      'Diarrhea',
      'Nausea',
      'Abdominal pain',
      'Long-term deficiency risks'
    ],
    dosage: 'Usually 20mg to 40mg once daily',
    warnings: [
      'Long-term use may affect nutrient absorption',
      'Consult doctor before stopping',
      'May interact with other medications'
    ]
  },
  'metformin': {
    id: 'metformin',
    name: 'Metformin',
    aliases: ['glucophage', 'diabex'],
    uses: [
      'Type 2 diabetes management',
      'Blood sugar control',
      'PCOS treatment',
      'Prediabetes management'
    ],
    sideEffects: [
      'Stomach upset',
      'Diarrhea',
      'Nausea',
      'Metallic taste',
      'Vitamin B12 deficiency'
    ],
    dosage: 'Usually 500mg to 1000mg twice daily with meals',
    warnings: [
      'Take with food to reduce stomach upset',
      'Monitor kidney function regularly',
      'Avoid during acute illness',
      'May cause lactic acidosis in rare cases'
    ]
  },
  'lisinopril': {
    id: 'lisinopril',
    name: 'Lisinopril',
    aliases: ['prinivil', 'zestril'],
    uses: [
      'High blood pressure control',
      'Heart failure treatment',
      'Post-heart attack management',
      'Kidney disease protection'
    ],
    sideEffects: [
      'Dry cough',
      'Dizziness',
      'Low blood pressure',
      'Hyperkalemia',
      'Fatigue'
    ],
    dosage: 'Usually 10mg once daily',
    warnings: [
      'Monitor blood pressure regularly',
      'Avoid potassium supplements',
      'Not suitable during pregnancy',
      'May cause fainting if dose too high'
    ]
  },
  'sertraline': {
    id: 'sertraline',
    name: 'Sertraline',
    aliases: ['zoloft', 'lustral'],
    uses: [
      'Depression treatment',
      'Anxiety disorder management',
      'OCD treatment',
      'PTSD management'
    ],
    sideEffects: [
      'Sexual dysfunction',
      'Insomnia',
      'Drowsiness',
      'Nausea',
      'Weight changes'
    ],
    dosage: 'Usually 50mg once daily',
    warnings: [
      'Do not stop abruptly',
      'May increase suicidal thoughts in young adults',
      'Avoid alcohol',
      'May interact with other medications'
    ]
  },
  'atorvastatin': {
    id: 'atorvastatin',
    name: 'Atorvastatin',
    aliases: ['lipitor', 'torvast'],
    uses: [
      'Cholesterol reduction',
      'Heart disease prevention',
      'Stroke risk reduction',
      'LDL cholesterol lowering'
    ],
    sideEffects: [
      'Muscle pain',
      'Fatigue',
      'Liver enzyme elevation',
      'Memory issues',
      'Digestive problems'
    ],
    dosage: 'Usually 10mg to 80mg once daily',
    warnings: [
      'Monitor liver function regularly',
      'Avoid grapefruit juice',
      'Report muscle pain immediately',
      'May affect muscle tissue'
    ]
  },
  'levothyroxine': {
    id: 'levothyroxine',
    name: 'Levothyroxine',
    aliases: ['synthroid', 'levoxyl', 'thyroxine'],
    uses: [
      'Hypothyroidism treatment',
      'Thyroid hormone replacement',
      'Goiter management',
      'Thyroid cancer management'
    ],
    sideEffects: [
      'Tremor',
      'Anxiety',
      'Heart palpitations',
      'Hair loss',
      'Weight loss'
    ],
    dosage: 'Usually 25-200 mcg once daily',
    warnings: [
      'Take on empty stomach',
      'Consistent timing important',
      'Regular thyroid monitoring needed',
      'May interact with many medications'
    ]
  }
};

export function searchMedicine(query: string): Medicine | null {
  const lowerQuery = query.toLowerCase().trim();
  
  for (const [key, medicine] of Object.entries(medicineDatabase)) {
    if (
      key.includes(lowerQuery) ||
      medicine.name.toLowerCase().includes(lowerQuery) ||
      medicine.aliases.some(alias => alias.includes(lowerQuery))
    ) {
      return medicine;
    }
  }
  
  return null;
}

export function simplifyMedicalText(text: string): string {
  const replacements: Record<string, string> = {
    'hypertension': 'high blood pressure',
    'tachycardia': 'fast heartbeat',
    'bradycardia': 'slow heartbeat',
    'myocardial infarction': 'heart attack',
    'cerebrovascular accident': 'stroke',
    'gastroesophageal reflux': 'acid reflux',
    'pharyngitis': 'sore throat',
    'rhinitis': 'nasal inflammation',
    'dyspnea': 'difficulty breathing',
    'hepatic': 'liver-related',
    'renal': 'kidney-related',
    'pulmonary': 'lung-related',
    'cardiac': 'heart-related',
    'dermatitis': 'skin inflammation',
    'nephritis': 'kidney inflammation',
    'arthritis': 'joint inflammation',
    'contraindicated': 'should not be used',
    'prophylaxis': 'prevention',
    'adverse reaction': 'bad reaction',
    'efficacy': 'effectiveness'
  };

  let simplified = text.toLowerCase();
  
  Object.entries(replacements).forEach(([medical, simple]) => {
    const regex = new RegExp(`\\b${medical}\\b`, 'gi');
    simplified = simplified.replace(regex, simple);
  });

  return simplified;
}

export function checkExpiryStatus(expiryDate: string): {
  status: 'valid' | 'near-expiry' | 'expired';
  message: string;
} {
  try {
    const expiry = new Date(expiryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      return {
        status: 'expired',
        message: `This medicine expired ${Math.abs(daysUntilExpiry)} days ago. Do not use.`
      };
    } else if (daysUntilExpiry <= 30) {
      return {
        status: 'near-expiry',
        message: `This medicine expires in ${daysUntilExpiry} days. Use caution.`
      };
    } else {
      return {
        status: 'valid',
        message: `This medicine is valid until ${expiry.toLocaleDateString()}.`
      };
    }
  } catch {
    return {
      status: 'valid',
      message: 'Unable to determine expiry status.'
    };
  }
}
