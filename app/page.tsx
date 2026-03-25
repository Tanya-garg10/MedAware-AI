'use client';

import { useState, Suspense } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { ImageUploader } from '@/components/image-uploader';
import { CameraCapture } from '@/components/camera-capture';
import { MedicineResultsEnhanced } from '@/components/medicine-results-enhanced';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import type { AnalysisResult } from '@/lib/medicine-analyzer';

export default function ScannerPage() {
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const handleImageSelect = async (file: File) => {
    try {
      setError('');
      setIsLoading(true);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Extract text using OCR
      const { extractTextFromImage } = await import('@/lib/ocr-utils');
      const ocrResult = await extractTextFromImage(file);

      if (ocrResult.error) {
        setError(`OCR Error: ${ocrResult.error}`);
        setIsLoading(false);
        return;
      }

      if (!ocrResult.text) {
        setError('No text found in image. Please try another image.');
        setIsLoading(false);
        return;
      }

      // Send to analysis API
      const formData = new FormData();
      formData.append('file', file);
      formData.append('extractedText', ocrResult.text);
      formData.append('confidence', ocrResult.confidence.toString());

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to analyze medicine');
        setIsLoading(false);
        return;
      }

      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCameraCapture = (file: File) => {
    setIsCameraOpen(false);
    handleImageSelect(file);
  };

  const handleNewScan = () => {
    setResult(null);
    setPreviewUrl('');
    setError('');
  };

  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              MedAware AI
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Medicine Analysis Results
            </p>
          </div>
          <MedicineResultsEnhanced result={result} onNewScan={handleNewScan} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <CameraCapture
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            MedAware AI
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
            Scan medicine packaging to get instant information
          </p>
          <div className="inline-block bg-blue-100 dark:bg-blue-950 rounded-full px-4 py-2 text-sm text-blue-700 dark:text-blue-300">
            AI-Powered Medicine Scanner
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Main Card */}
        <Card className="p-8 mb-6 shadow-lg">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Upload or Capture Medicine Image
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Take a clear photo of the medicine packaging. Make sure the text is visible and the image is well-lit.
            </p>
          </div>

          {/* Image Uploader */}
          <ImageUploader
            onImageSelect={handleImageSelect}
            isLoading={isLoading}
            previewUrl={previewUrl}
          />

          {/* Camera Button */}
          {isLoading ? (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                Processing medicine image with OCR...
              </span>
            </div>
          ) : (
            <div className="mt-4 text-center">
              <button
                onClick={() => setIsCameraOpen(true)}
                disabled={isLoading}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium disabled:opacity-50"
              >
                Or open camera for direct capture
              </button>
            </div>
          )}
        </Card>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              How it Works
            </h3>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <li>• Scan medicine packaging</li>
              <li>• AI extracts medicine information</li>
              <li>• Get uses, side effects & warnings</li>
              <li>• Check expiry status instantly</li>
            </ul>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Tips for Best Results
            </h3>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <li>• Ensure good lighting</li>
              <li>• Keep text in focus</li>
              <li>• Use clear, legible images</li>
              <li>• Try from different angles</li>
            </ul>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            Disclaimer: This app provides educational information only. 
            Always consult healthcare professionals for medical advice.
          </p>
        </div>
      </div>
    </div>
  );
}
