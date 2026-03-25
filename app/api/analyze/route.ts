import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const extractedText = formData.get('extractedText') as string;
    const confidence = parseFloat(formData.get('confidence') as string) || 0;

    if (!file || !extractedText) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Import here to avoid SSR issues
    const { analyzeMedicineText, isValidAnalysisResult } = await import('@/lib/medicine-analyzer');

    const result = analyzeMedicineText(extractedText, confidence);

    if (!isValidAnalysisResult(result)) {
      return NextResponse.json(
        { 
          error: 'Medicine not found in database or insufficient confidence',
          suggestion: 'Try uploading a clearer image or check the spelling of the medicine name'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      result: {
        medicineName: result.medicineName,
        medicineData: result.medicineData,
        extractedText: result.extractedText,
        expiryStatus: result.expiryStatus,
        simplifiedInfo: result.simplifiedInfo,
        confidence: result.confidence,
        timestamp: result.timestamp
      }
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze medicine image' },
      { status: 500 }
    );
  }
}
