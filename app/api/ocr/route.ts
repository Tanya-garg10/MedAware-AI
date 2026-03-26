import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file
    const { validateImage } = await import('@/lib/ocr-utils');
    const validation = validateImage(file);

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = await file.arrayBuffer();

    // Since we're using Tesseract.js (browser-based), we need to return the file
    // in a format the frontend can process
    // In production, you might want to use a server-side OCR like pytesseract

    return NextResponse.json({
      success: true,
      message: 'File received. Please use browser-based OCR for processing.',
      fileSize: buffer.byteLength,
      fileName: file.name,
      fileType: file.type
    });
  } catch (error) {
    console.error('OCR Error:', error);
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    );
  }
}
