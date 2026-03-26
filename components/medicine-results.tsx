'use client';

import React, { useState, useCallback } from 'react';
import { AlertCircle, CheckCircle, Clock, Pill, AlertTriangle, Info, Volume2, VolumeX, Phone, ShieldCheck, ShieldAlert, ShieldX, AlertOctagon, Calendar, CalendarX, CalendarCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import type { AnalysisResult } from '@/lib/medicine-analyzer';

interface MedicineResultsProps {
  result: AnalysisResult;
  onNewScan?: () => void;
}

// Near-expiry threshold in days
const NEAR_EXPIRY_DAYS = 60;

function computeSafetyScore(result: AnalysisResult): { score: number; label: string; color: string; bg: string; icon: React.ElementType } {
  let score = 100;
  const status = result.expiryStatus.status;
  if (status === 'expired') score -= 40;
  else if (status === 'near-expiry') score -= 15;
  const warningCount = result.simplifiedInfo?.warnings?.length ?? 0;
  const sideEffectCount = result.simplifiedInfo?.sideEffects?.length ?? 0;
  score -= Math.min(warningCount * 5, 20);
  score -= Math.min(sideEffectCount * 3, 15);
  const confidence = result.confidence ?? 1;
  if (confidence < 0.35) score -= 30;
  else if (confidence < 0.55) score -= 15;
  else if (confidence < 0.7) score -= 5;
  if ((result as any).knownMedicine === false) score -= 40;
  score = Math.max(0, Math.min(100, score));

  if (score >= 80) return { score, label: 'Safe', color: 'text-green-700', bg: 'bg-green-50 border-green-200', icon: ShieldCheck };
  if (score >= 60) return { score, label: 'Moderate Risk', color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200', icon: ShieldAlert };
  if (score >= 40) return { score, label: 'Risky', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200', icon: ShieldAlert };
  return { score, label: 'High Risk', color: 'text-red-700', bg: 'bg-red-50 border-red-200', icon: ShieldX };
}

function getFakeDetection(result: AnalysisResult): { suspected: boolean; riskLevel: 'none' | 'low' | 'high'; reason: string[] } {
  const local = (result as any).localRules?.fakeDetection;
  if (local) return local;
  // Fallback: old confidence-based check
  const conf = result.confidence ?? 1;
  if (conf < 0.35) return { suspected: true, riskLevel: 'high', reason: [`Very low identification confidence (${Math.round(conf * 100)}%)`] };
  if (conf < 0.55) return { suspected: true, riskLevel: 'low', reason: [`Low identification confidence (${Math.round(conf * 100)}%)`] };
  return { suspected: false, riskLevel: 'none', reason: [] };
}

export function MedicineResults({ result, onNewScan }: MedicineResultsProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [doctorModalOpen, setDoctorModalOpen] = useState(false);

  const getExpiryBadgeColor = () => {
    switch (result.expiryStatus.status) {
      case 'expired': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'near-expiry': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
  };

  const speakMedicineInfo = useCallback(() => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in your browser.');
      return;
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const uses = result.simplifiedInfo?.uses?.join('. ') ?? '';
    const effects = result.simplifiedInfo?.sideEffects?.join('. ') ?? '';
    const warnings = result.simplifiedInfo?.warnings?.join('. ') ?? '';
    const script = `
      Medicine name: ${result.medicineName}.
      Expiry status: ${result.expiryStatus.message}.
      Uses: ${uses}.
      Common side effects: ${effects}.
      Important warnings: ${warnings}.
      Disclaimer: This information is for educational purposes only. Please consult a doctor.
    `;
    const utterance = new SpeechSynthesisUtterance(script);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  }, [result, isSpeaking]);

  if (!result.medicineData) {
    return (
      <div className="w-full space-y-4">
        {result.matchError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{result.matchError}</AlertDescription>
          </Alert>
        )}
        <Card className="p-8 text-center border-2 border-gray-200 dark:border-gray-700">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Medicine Not Found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Could not identify the medicine from the image. Try another image or check the text is clear.
          </p>
          {onNewScan && (
            <button onClick={onNewScan} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
              Try Another Medicine
            </button>
          )}
        </Card>
      </div>
    );
  }

  const safety = computeSafetyScore(result);
  const SafetyIcon = safety.icon;
  const fake = getFakeDetection(result);

  return (
    <div className="w-full space-y-5">

      {/* Fake / Counterfeit Medicine Warning */}
      {fake.suspected && (
        <Card className={`p-5 border-2 ${fake.riskLevel === 'high' ? 'bg-red-50 border-red-400' : 'bg-orange-50 border-orange-300'}`}>
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${fake.riskLevel === 'high' ? 'bg-red-100' : 'bg-orange-100'}`}>
              <AlertOctagon className={`w-5 h-5 ${fake.riskLevel === 'high' ? 'text-red-600' : 'text-orange-600'}`} />
            </div>
            <div className="flex-1">
              {(() => {
                const isUnknown = (result as any).knownMedicine === false;
                const hasFakeWord = fake.reason.some((r: string) => r.includes('suspicious word'));
                const label = hasFakeWord ? '🚨 SUSPECTED COUNTERFEIT' : isUnknown ? '🚫 UNVERIFIED MEDICINE' : '⚠️ VERIFICATION NEEDED';
                const message = hasFakeWord
                  ? 'This packaging shows signs of being counterfeit. Do NOT use this medicine.'
                  : isUnknown
                    ? 'This medicine name is not recognised as a real pharmaceutical product. It may be fake, mislabelled, or illegally manufactured.'
                    : 'Could not verify this medicine with high confidence. Please check with a pharmacist.';
                return (
                  <>
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${fake.riskLevel === 'high' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}`}>
                        {label}
                      </span>
                    </div>
                    <p className={`font-bold text-sm mb-2 ${fake.riskLevel === 'high' ? 'text-red-800' : 'text-orange-800'}`}>{message}</p>
                  </>
                );
              })()}
              {fake.reason.length > 0 && (
                <ul className="space-y-1">
                  {fake.reason.map((r, i) => (
                    <li key={i} className={`text-xs flex gap-1.5 items-start ${fake.riskLevel === 'high' ? 'text-red-700' : 'text-orange-700'}`}>
                      <span className="mt-0.5 flex-shrink-0">•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          {fake.riskLevel === 'high' && (
            <div className="mt-3 pt-3 border-t border-red-200">
              <p className="text-xs font-semibold text-red-700">
                Report suspected fake medicines to your nearest pharmacist, hospital, or the Central Drugs Standard Control Organisation (CDSCO).
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-2 border-blue-200 dark:border-blue-800">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 break-words">
              {result.medicineName}
            </h2>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline" className="bg-blue-600 text-white border-blue-600">
                {Math.round(result.confidence * 100)}% Match
              </Badge>
              <Badge className={getExpiryBadgeColor()}>
                {result.expiryStatus.status.replace('-', ' ').toUpperCase()}
              </Badge>
            </div>
          </div>
          <Pill className="w-10 h-10 text-blue-600 flex-shrink-0" />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4 flex-wrap">
          <button
            onClick={speakMedicineInfo}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isSpeaking
              ? 'bg-red-100 text-red-700 hover:bg-red-200'
              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            {isSpeaking ? 'Stop' : 'Listen'}
          </button>
          <button
            onClick={() => setDoctorModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
          >
            <Phone className="w-4 h-4" />
            Consult Doctor
          </button>
        </div>
      </Card>

      {/* Safety Score */}
      <Card className={`p-4 border-2 ${safety.bg}`}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <SafetyIcon className={`w-7 h-7 ${safety.color}`} />
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Health Safety Score</p>
              <p className={`font-bold text-lg ${safety.color}`}>{safety.label}</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-4xl font-black ${safety.color}`}>{safety.score}</div>
            <div className="text-xs text-muted-foreground">/100</div>
          </div>
        </div>
        <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full transition-all ${safety.score >= 80 ? 'bg-green-500' : safety.score >= 60 ? 'bg-yellow-500' : safety.score >= 40 ? 'bg-orange-500' : 'bg-red-500'
              }`}
            style={{ width: `${safety.score}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">Based on expiry status, warnings, side effects, and identification confidence.</p>
      </Card>

      {/* Expiry Status Card — always shown */}
      {(() => {
        const exp = result.expiryStatus as any;
        const status = result.expiryStatus.status;
        const days = exp.daysUntilExpiry ?? 9999;
        const dateFormatted = exp.expiryDateFormatted || exp.expiryDate || null;

        const cfg = status === 'expired'
          ? { bg: 'bg-red-50 border-red-300', icon: CalendarX, iconColor: 'text-red-600', textColor: 'text-red-700', badge: 'bg-red-100 text-red-800', label: 'EXPIRED', barColor: 'bg-red-500' }
          : status === 'near-expiry'
            ? { bg: 'bg-yellow-50 border-yellow-300', icon: Clock, iconColor: 'text-yellow-600', textColor: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-800', label: 'NEAR EXPIRY', barColor: 'bg-yellow-400' }
            : { bg: 'bg-green-50 border-green-300', icon: CalendarCheck, iconColor: 'text-green-600', textColor: 'text-green-700', badge: 'bg-green-100 text-green-800', label: dateFormatted ? 'VALID' : 'NO DATE FOUND', barColor: 'bg-green-500' };

        const ExpiryIcon = cfg.icon;

        const daysLabel = days === 9999
          ? 'No expiry date found on packaging'
          : days < 0
            ? `Expired ${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''} ago`
            : days === 0
              ? 'Expires today!'
              : `${days} day${days !== 1 ? 's' : ''} remaining`;

        return (
          <Card className={`p-5 border-2 ${cfg.bg}`}>
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${status === 'expired' ? 'bg-red-100' : status === 'near-expiry' ? 'bg-yellow-100' : 'bg-green-100'}`}>
                <ExpiryIcon className={`w-6 h-6 ${cfg.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${cfg.badge}`}>{cfg.label}</span>
                  {dateFormatted && (
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      {dateFormatted}
                    </span>
                  )}
                </div>
                <p className={`font-bold text-base ${cfg.textColor}`}>{daysLabel}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{result.expiryStatus.message}</p>
              </div>
            </div>

            {status === 'expired' && (
              <div className="mt-3 pt-3 border-t border-red-200">
                <p className="text-sm font-semibold text-red-700 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  Do NOT use this medicine — it is expired and may be harmful.
                </p>
              </div>
            )}
            {status === 'near-expiry' && (
              <div className="mt-3 pt-3 border-t border-yellow-200">
                <p className="text-sm font-semibold text-yellow-700 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  Use this medicine soon or consult your pharmacist.
                </p>
              </div>
            )}
          </Card>
        );
      })()}

      {/* LOCAL RULE-BASED DRUG WARNINGS — only shown for verified, recognised medicines */}
      {(() => {
        const localRules = (result as any).localRules;
        const isUnverified = (result as any).knownMedicine === false || fake.riskLevel === 'high';
        if (!localRules?.drugWarnings?.length || isUnverified) return null;
        const criticals = localRules.drugWarnings.filter((r: any) => r.flag === 'critical');
        const warnings = localRules.drugWarnings.filter((r: any) => r.flag === 'warning');
        const infos = localRules.drugWarnings.filter((r: any) => r.flag === 'info');
        return (
          <Card className="p-5 border-2 border-orange-200 bg-orange-50">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                <AlertOctagon className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <h3 className="font-bold text-orange-800 text-sm">Rule-Based Safety Alerts</h3>
                <p className="text-xs text-orange-600">Detected locally — no AI needed for these warnings</p>
              </div>
            </div>
            <div className="space-y-2">
              {criticals.map((r: any, i: number) => (
                <div key={i} className="flex gap-2 bg-red-50 border border-red-200 rounded-lg p-2.5 text-sm text-red-800">
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <span>{r.message}</span>
                </div>
              ))}
              {warnings.map((r: any, i: number) => (
                <div key={i} className="flex gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-2.5 text-sm text-yellow-800">
                  <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <span>{r.message}</span>
                </div>
              ))}
              {infos.map((r: any, i: number) => (
                <div key={i} className="flex gap-2 bg-blue-50 border border-blue-200 rounded-lg p-2.5 text-sm text-blue-800">
                  <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span>{r.message}</span>
                </div>
              ))}
            </div>
          </Card>
        );
      })()}

      {/* Information Tabs — only shown for verified medicines with actual data */}
      {((result as any).knownMedicine === false || fake.riskLevel === 'high') ? (
        <Card className="p-6 text-center border border-dashed border-gray-300">
          <AlertOctagon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-gray-600">No verified information available</p>
          <p className="text-xs text-muted-foreground mt-1">Medicine details are not shown for unrecognised or suspected counterfeit products. Please consult a licensed pharmacist.</p>
        </Card>
      ) : (
        <Tabs defaultValue="uses" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="uses">Uses</TabsTrigger>
            <TabsTrigger value="effects">Side Effects</TabsTrigger>
            <TabsTrigger value="warnings">Warnings</TabsTrigger>
          </TabsList>

          <TabsContent value="uses" className="mt-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" />
                What is this medicine used for?
              </h3>
              <ul className="space-y-3">
                {result.simplifiedInfo.uses.map((use, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">{use}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </TabsContent>

          <TabsContent value="effects" className="mt-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                Common side effects
              </h3>
              <ul className="space-y-3">
                {result.simplifiedInfo.sideEffects.map((effect, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300 flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">{effect}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </TabsContent>

          <TabsContent value="warnings" className="mt-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                Important warnings
              </h3>
              <ul className="space-y-3">
                {result.simplifiedInfo.warnings.map((warning, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">{warning}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Disclaimer */}
      <Alert className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-sm text-gray-600 dark:text-gray-400">
          <strong>Disclaimer:</strong> This information is for educational purposes only. Always consult a healthcare professional before taking any medication.
        </AlertDescription>
      </Alert>

      {onNewScan && (
        <button onClick={onNewScan} className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors">
          Scan Another Medicine
        </button>
      )}

      {/* Doctor Connect Modal */}
      {doctorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDoctorModalOpen(false)}>
          <Card className="w-full max-w-md p-6 space-y-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Phone className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Consult a Doctor</h3>
                <p className="text-sm text-muted-foreground">Get professional medical advice</p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { name: 'National Health Helpline', number: '1800-180-1104', desc: 'Free 24/7 helpline (India)', color: 'bg-blue-50 border-blue-200' },
                { name: 'Practo', number: 'practo.com', desc: 'Online doctor consultation', color: 'bg-purple-50 border-purple-200' },
                { name: 'Emergency', number: '112', desc: 'For medical emergencies', color: 'bg-red-50 border-red-200' },
              ].map(({ name, number, desc, color }) => (
                <div key={name} className={`flex items-center justify-between p-3 rounded-lg border ${color}`}>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{name}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <span className="font-bold text-foreground text-sm">{number}</span>
                </div>
              ))}
            </div>

            <Alert className="bg-amber-50 border-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800 text-sm">
                Always consult a qualified doctor before starting, stopping, or changing any medication — especially for {result.medicineName}.
              </AlertDescription>
            </Alert>

            <button
              onClick={() => setDoctorModalOpen(false)}
              className="w-full py-2.5 bg-muted hover:bg-muted/80 text-foreground rounded-lg font-medium text-sm transition-colors"
            >
              Close
            </button>
          </Card>
        </div>
      )}
    </div>
  );
}
