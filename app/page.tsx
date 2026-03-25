'use client';

import { useState, Suspense } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { ImageUploader } from '@/components/image-uploader';
import { CameraCapture } from '@/components/camera-capture';
import { MedicineResults } from '@/components/medicine-results';
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
          <MedicineResults result={result} onNewScan={handleNewScan} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <CameraCapture
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />

      <div className="relative">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 border-b border-border px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                AI-Powered Medicine Scanner
              </div>
              <h1 className="text-5xl font-bold text-foreground tracking-tight">
                MedAware AI
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl">
                Scan medicine packaging to get instant information powered by AI safety analysis
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-3xl mx-auto px-4 py-8">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-8 border-destructive/30 bg-destructive/5">
              <AlertCircle className="h-5 w-5" />
              <AlertDescription className="text-destructive">{error}</AlertDescription>
            </Alert>
          )}

          {/* Upload Section */}
          <Card className="border-2 border-border shadow-lg overflow-hidden mb-8">
            <div className="p-8">
              <div className="space-y-2 mb-8">
                <h2 className="text-3xl font-bold text-foreground">
                  Upload Medicine Image
                </h2>
                <p className="text-muted-foreground">
                  Capture a clear photo of medicine packaging with visible text and expiry date
                </p>
              </div>

              {/* Image Uploader */}
              <div className="mb-6">
                <ImageUploader
                  onImageSelect={handleImageSelect}
                  isLoading={isLoading}
                  previewUrl={previewUrl}
                />
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 flex items-center justify-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span className="text-primary font-medium">
                    Processing with OCR and AI analysis...
                  </span>
                </div>
              )}

              {/* Camera Fallback */}
              {!isLoading && !previewUrl && (
                <div className="text-center border-t border-border pt-6">
                  <p className="text-muted-foreground mb-4">Or use direct camera capture</p>
                  <button
                    onClick={() => setIsCameraOpen(true)}
                    disabled={isLoading}
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    Open Camera
                  </button>
                </div>
              )}
            </div>
          </Card>

          {/* Info Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* How It Works Card */}
            <Card className="border border-border p-6 hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-foreground">How It Works</h3>
                <ul className="space-y-3">
                  {[
                    'Capture medicine packaging photo',
                    'AI extracts medicine information',
                    'Get uses & side effects instantly',
                    'View AI safety warnings',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-muted-foreground">
                      <span className="text-primary font-bold mt-0.5">{i + 1}.</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>

            {/* Tips Card */}
            <Card className="border border-border p-6 hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-foreground">Tips for Best Results</h3>
                <ul className="space-y-3">
                  {[
                    'Ensure bright, even lighting',
                    'Focus on medicine packaging text',
                    'Use clear, high-resolution images',
                    'Capture expiry date clearly',
                  ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-3 text-muted-foreground">
                      <span className="text-accent font-bold mt-0.5">✓</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </div>

          {/* Disclaimer */}
          <Alert className="border-primary/30 bg-primary/5 mb-8">
            <AlertCircle className="h-4 w-4 text-primary" />
            <AlertDescription className="text-muted-foreground">
              <span className="font-semibold text-foreground">Disclaimer: </span>
              This app provides educational information only. Always consult healthcare professionals for medical advice. Not a substitute for professional medical guidance.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}
