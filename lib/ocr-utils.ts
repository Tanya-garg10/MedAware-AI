/**
 * OCR and text extraction utilities using Tesseract.js.
 * All OCR runs client-side in the browser — no server upload needed.
 */

export async function extractTextFromImage(imageSource: string | File): Promise<{
  text: string;
  confidence: number;
  error?: string;
}> {
  try {
    // Dynamic import avoids SSR issues — Tesseract only runs in the browser
    const Tesseract = (await import('tesseract.js')).default;

    const worker = await Tesseract.createWorker();

    let source = imageSource;

    if (imageSource instanceof File) {
      source = URL.createObjectURL(imageSource);
    }

    const result = await worker.recognize(source);

    await worker.terminate();

    return {
      text: result.data.text,
      confidence: result.data.confidence
    };
  } catch (error) {
    return {
      text: '',
      confidence: 0,
      error: error instanceof Error ? error.message : 'Unknown OCR error'
    };
  }
}

/**
 * Extract medicine name and expiry date from OCR text
 */
export function extractMedicineInfo(text: string): {
  medicineName: string | null;
  expiryDate: string | null;
  rawText: string;
} {
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);

  // Look for expiry date patterns
  const expiryPatterns = [
    /exp(?:iry|\.|\s)?[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
    /expiry[:\s]*([a-zA-Z]+\s*\d{1,2},?\s*\d{4})/i,
    /mfg[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
    /batch[:\s]*([a-zA-Z0-9]+)/i,
    /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/
  ];

  let expiryDate: string | null = null;

  for (const pattern of expiryPatterns) {
    const match = text.match(pattern);
    if (match) {
      expiryDate = match[1];
      break;
    }
  }

  // Medicine names are typically in the first few lines and in uppercase
  const medicineName = lines
    .slice(0, 5)
    .find(line =>
      line.length > 3 &&
      line.length < 50 &&
      !line.includes('mg') &&
      !line.includes('tablet') &&
      !line.includes('capsule')
    ) || null;

  return {
    medicineName,
    expiryDate,
    rawText: text
  };
}

/**
 * Clean and normalize extracted text
 */
export function cleanExtractedText(text: string): string {
  return text
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s\-\.\/]/g, '')
    .trim();
}

/**
 * Convert image file to base64 for API transmission
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Validate image file before processing.
 * Checks MIME type and file size to fail fast before OCR.
 */
export function validateImage(file: File): {
  valid: boolean;
  error?: string;
} {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];

  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Please upload a valid image file (JPEG, PNG, or WebP)'
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Image size must be less than 5MB'
    };
  }

  return { valid: true };
}
