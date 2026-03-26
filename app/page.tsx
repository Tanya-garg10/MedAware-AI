'use client';

import { useState, useEffect, useRef } from 'react';
import { AlertCircle, Loader2, Camera, Upload, Shield, Clock, Pill, ChevronRight, Trash2, ScanLine, History, Home, Zap } from 'lucide-react';
import { ImageUploader } from '@/components/image-uploader';
import { CameraCapture } from '@/components/camera-capture';
import { MedicineResults } from '@/components/medicine-results';
import { DrugInteraction } from '@/components/drug-interaction';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { AnalysisResult } from '@/lib/medicine-analyzer';

interface ScanHistoryItem {
  id: string;
  medicineName: string;
  expiryStatus: string;
  confidence: number;
  scannedAt: string;
  result: AnalysisResult;
}

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'scanner', label: 'Scanner', icon: ScanLine },
  { id: 'interactions', label: 'Interactions', icon: Zap },
  { id: 'history', label: 'History', icon: History },
];

export default function MedAwarePage() {
  const [activeSection, setActiveSection] = useState<'home' | 'scanner' | 'interactions' | 'history'>('home');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<ScanHistoryItem | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('medaware_history');
      if (stored) setHistory(JSON.parse(stored));
    } catch {}
  }, []);

  const saveToHistory = (scanResult: AnalysisResult) => {
    if (!scanResult.medicineData) return;
    const item: ScanHistoryItem = {
      id: Date.now().toString(),
      medicineName: scanResult.medicineName,
      expiryStatus: scanResult.expiryStatus.status,
      confidence: scanResult.confidence,
      scannedAt: new Date().toISOString(),
      result: scanResult,
    };
    const updated = [item, ...history].slice(0, 50);
    setHistory(updated);
    try {
      localStorage.setItem('medaware_history', JSON.stringify(updated));
    } catch {}
  };

  const deleteHistoryItem = (id: string) => {
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    if (selectedHistory?.id === id) setSelectedHistory(null);
    try {
      localStorage.setItem('medaware_history', JSON.stringify(updated));
    } catch {}
  };

  const clearHistory = () => {
    setHistory([]);
    setSelectedHistory(null);
    try {
      localStorage.removeItem('medaware_history');
    } catch {}
  };

  const handleImageSelect = async (file: File) => {
    try {
      setError('');
      setResult(null);
      setIsLoading(true);

      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target?.result as string);
      reader.readAsDataURL(file);

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

      const formData = new FormData();
      formData.append('file', file);
      formData.append('extractedText', ocrResult.text);
      formData.append('confidence', ocrResult.confidence.toString());

      const response = await fetch('/api/analyze', { method: 'POST', body: formData });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to analyze medicine');
        setIsLoading(false);
        return;
      }

      setResult(data.result);
      saveToHistory(data.result);
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

  const goToScanner = () => {
    setActiveSection('scanner');
    handleNewScan();
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) +
      ' at ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const expiryColor = (status: string) => {
    if (status === 'expired') return 'bg-red-100 text-red-700 border-red-200';
    if (status === 'near-expiry') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-green-100 text-green-700 border-green-200';
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <CameraCapture isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} onCapture={handleCameraCapture} />

      {/* Sticky Navbar */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Pill className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground text-base">MedAware AI</span>
          </div>
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id as any)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1">

        {/* ───── HOME SECTION ───── */}
        {activeSection === 'home' && (
          <div>
            {/* Hero */}
            <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b border-border px-4 py-16">
              <div className="max-w-3xl mx-auto text-center space-y-5">
                <div className="inline-flex items-center gap-2 bg-primary/15 text-primary px-3 py-1 rounded-full text-sm font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                  OCR + Rule Engine + AI — Not just a chatbot
                </div>
                <h1 className="text-5xl sm:text-6xl font-bold text-foreground tracking-tight">
                  MedAware <span className="text-primary">AI</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                  An AI-powered medicine safety engine that combines OCR, rule-based local intelligence, and structured health analysis to give you <strong>actionable, reliable warnings</strong> — not just generic AI output.
                </p>
                <div className="flex flex-wrap gap-3 justify-center pt-2">
                  <button
                    onClick={goToScanner}
                    className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-xl font-semibold text-base transition-colors"
                  >
                    <ScanLine className="w-5 h-5" />
                    Start Scanning
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveSection('interactions')}
                    className="flex items-center gap-2 bg-muted text-foreground hover:bg-muted/80 px-6 py-3 rounded-xl font-semibold text-base transition-colors"
                  >
                    <Zap className="w-5 h-5" />
                    Check Interactions
                  </button>
                </div>
              </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-14 space-y-14">

              {/* Processing Pipeline */}
              <div className="text-center space-y-6">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-foreground">How It Works — The Safety Pipeline</h2>
                  <p className="text-sm text-muted-foreground">Unlike generic AI tools, MedAware uses a 3-layer system for reliable results</p>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-left">
                  {[
                    { step: '1', icon: Camera, label: 'OCR Scan', sub: 'Tesseract.js reads packaging text client-side', color: 'bg-blue-600', light: 'bg-blue-50 border-blue-200' },
                    { step: '2', icon: Shield, label: 'Local Rules', sub: 'Regex + drug rules run instantly — no API call', color: 'bg-orange-500', light: 'bg-orange-50 border-orange-200' },
                    { step: '3', icon: Zap, label: 'AI Analysis', sub: 'Groq LLM identifies medicine & fills missing info', color: 'bg-purple-600', light: 'bg-purple-50 border-purple-200' },
                    { step: '4', icon: AlertCircle, label: 'Safety Score', sub: 'Expiry + rules + AI combined → 0–100 score', color: 'bg-green-600', light: 'bg-green-50 border-green-200' },
                  ].map((s, i) => (
                    <div key={i} className={`rounded-xl border p-4 ${s.light} flex flex-col gap-3`}>
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full ${s.color} flex items-center justify-center flex-shrink-0`}>
                          <s.icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xs font-bold text-muted-foreground">STEP {s.step}</span>
                      </div>
                      <div>
                        <p className="font-bold text-sm text-foreground">{s.label}</p>
                        <p className="text-xs text-muted-foreground mt-1 leading-snug">{s.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center space-y-3">
                <h2 className="text-3xl font-bold text-foreground">Key Features</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Every feature is designed around real patient safety — not just showing what ChatGPT would say.
                </p>
              </div>

              {/* Feature Cards */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[
                  {
                    icon: Camera,
                    title: 'Scan Instantly',
                    desc: 'Upload or capture a medicine image. OCR reads the text, AI identifies the medicine in seconds.',
                    color: 'text-blue-600 bg-blue-50',
                  },
                  {
                    icon: Shield,
                    title: 'Health Safety Score',
                    desc: 'Every medicine gets a safety score (0-100) based on expiry, side effects, and warnings.',
                    color: 'text-green-600 bg-green-50',
                  },
                  {
                    icon: Zap,
                    title: 'Drug Interaction Checker',
                    desc: 'Enter two medicine names and instantly know if they are safe to take together.',
                    color: 'text-yellow-600 bg-yellow-50',
                  },
                  {
                    icon: Upload,
                    title: 'Voice Assistant',
                    desc: 'Tap "Listen" to hear the medicine info read aloud — perfect for elderly users.',
                    color: 'text-purple-600 bg-purple-50',
                  },
                  {
                    icon: AlertCircle,
                    title: 'Fake Medicine Detection',
                    desc: 'Low-confidence scans trigger a warning so you can verify with a pharmacist.',
                    color: 'text-orange-600 bg-orange-50',
                  },
                  {
                    icon: Clock,
                    title: 'Scan History',
                    desc: 'Every scan is saved locally so you can revisit past medicines anytime.',
                    color: 'text-red-600 bg-red-50',
                  },
                ].map(({ icon: Icon, title, desc, color }) => (
                  <Card key={title} className="p-6 space-y-3 hover:shadow-md transition-shadow border border-border">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-foreground">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                  </Card>
                ))}
              </div>

              {/* How to Use */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-foreground text-center">How to Use</h2>
                <div className="space-y-4">
                  {[
                    { step: '1', title: 'Open the Scanner', desc: 'Click "Start Scanning" or go to the Scanner tab in the navigation.' },
                    { step: '2', title: 'Upload or Capture', desc: 'Drag & drop a medicine image, click to upload, or tap "Open Camera" to capture directly.' },
                    { step: '3', title: 'Get AI Analysis', desc: 'The app reads text via OCR and sends it to AI. You get uses, side effects, safety score, and expiry status.' },
                    { step: '4', title: 'Listen to Info', desc: 'Tap "Listen" to hear the medicine info read aloud — great for elderly or visually impaired users.' },
                    { step: '5', title: 'Check Interactions', desc: 'Go to the Interactions tab to check if two medicines are safe to take together.' },
                  ].map(({ step, title, desc }) => (
                    <div key={step} className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                        {step}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{title}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Disclaimer */}
              <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800 dark:text-amber-300 text-sm">
                  <span className="font-semibold">Medical Disclaimer: </span>
                  This app provides educational information only and is not a substitute for professional medical advice. Always consult a doctor or pharmacist before taking any medication.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        )}

        {/* ───── SCANNER SECTION ───── */}
        {activeSection === 'scanner' && (
          <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
            {result ? (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-foreground">Scan Results</h2>
                  <button
                    onClick={handleNewScan}
                    className="flex items-center gap-2 text-sm text-primary hover:underline font-medium"
                  >
                    <ScanLine className="w-4 h-4" />
                    New Scan
                  </button>
                </div>
                <MedicineResults result={result} onNewScan={handleNewScan} />
              </>
            ) : (
              <>
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-foreground">Scan a Medicine</h2>
                  <p className="text-muted-foreground text-sm">Upload a photo of the medicine packaging to get instant AI analysis.</p>
                </div>

                {error && (
                  <Alert variant="destructive" className="border-destructive/30 bg-destructive/5">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Card className="border-2 border-border shadow-sm overflow-hidden">
                  <div className="p-6 space-y-5">
                    <ImageUploader onImageSelect={handleImageSelect} isLoading={isLoading} previewUrl={previewUrl} />

                    {isLoading && (
                      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-center justify-center gap-3">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        <span className="text-primary font-medium text-sm">Processing with OCR and AI analysis...</span>
                      </div>
                    )}

                    {!isLoading && !previewUrl && (
                      <div className="text-center border-t border-border pt-5">
                        <p className="text-muted-foreground text-sm mb-3">Or use your device camera</p>
                        <button
                          onClick={() => setIsCameraOpen(true)}
                          className="flex items-center gap-2 mx-auto bg-muted text-foreground hover:bg-muted/80 px-5 py-2 rounded-lg font-medium text-sm transition-colors"
                        >
                          <Camera className="w-4 h-4" />
                          Open Camera
                        </button>
                      </div>
                    )}
                  </div>
                </Card>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Card className="border border-border p-5">
                    <h3 className="font-semibold text-foreground mb-3 text-sm">Tips for Best Results</h3>
                    <ul className="space-y-2">
                      {['Use bright, even lighting', 'Keep text clearly in frame', 'High resolution images work best', 'Capture expiry date clearly'].map(tip => (
                        <li key={tip} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </Card>
                  <Card className="border border-border p-5">
                    <h3 className="font-semibold text-foreground mb-3 text-sm">Supported Formats</h3>
                    <ul className="space-y-2">
                      {['JPEG / JPG images', 'PNG images', 'WebP images', 'Max file size: 5MB'].map(fmt => (
                        <li key={fmt} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="text-primary font-bold flex-shrink-0">•</span>
                          {fmt}
                        </li>
                      ))}
                    </ul>
                  </Card>
                </div>
              </>
            )}
          </div>
        )}

        {/* ───── INTERACTIONS SECTION ───── */}
        {activeSection === 'interactions' && (
          <div className="max-w-2xl mx-auto px-4 py-8">
            <DrugInteraction />
          </div>
        )}

        {/* ───── HISTORY SECTION ───── */}
        {activeSection === 'history' && (
          <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Scan History</h2>
                <p className="text-muted-foreground text-sm">{history.length} scan{history.length !== 1 ? 's' : ''} saved on this device</p>
              </div>
              {history.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear All
                </button>
              )}
            </div>

            {selectedHistory ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Scanned on {formatDate(selectedHistory.scannedAt)}</p>
                  <button onClick={() => setSelectedHistory(null)} className="text-sm text-primary hover:underline font-medium">
                    ← Back to History
                  </button>
                </div>
                <MedicineResults result={selectedHistory.result} />
              </div>
            ) : history.length === 0 ? (
              <Card className="border border-border p-12 text-center">
                <History className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-1">No scans yet</h3>
                <p className="text-sm text-muted-foreground mb-5">Your scan history will appear here after you scan a medicine.</p>
                <button
                  onClick={goToScanner}
                  className="flex items-center gap-2 mx-auto bg-primary text-primary-foreground hover:bg-primary/90 px-5 py-2 rounded-lg font-medium text-sm transition-colors"
                >
                  <ScanLine className="w-4 h-4" />
                  Scan a Medicine
                </button>
              </Card>
            ) : (
              <div className="space-y-3">
                {history.map(item => (
                  <Card
                    key={item.id}
                    className="border border-border hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer"
                    onClick={() => setSelectedHistory(item)}
                  >
                    <div className="p-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Pill className="w-5 h-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate">{item.medicineName}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{formatDate(item.scannedAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge className={`text-xs border ${expiryColor(item.expiryStatus)}`} variant="outline">
                          {item.expiryStatus.replace('-', ' ')}
                        </Badge>
                        <button
                          onClick={e => { e.stopPropagation(); deleteHistoryItem(item.id); }}
                          className="text-muted-foreground hover:text-red-500 transition-colors p-1 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        MedAware AI — For educational purposes only. Always consult a healthcare professional.
      </footer>
    </div>
  );
}
