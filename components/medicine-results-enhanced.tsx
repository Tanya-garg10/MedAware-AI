'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Pill,
  AlertTriangle,
  Info,
  Zap,
  Users,
  Shield,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import type { AnalysisResult } from '@/lib/medicine-analyzer';
import type { SafetyAnalysis } from '@/lib/ai-safety-analyzer';

interface MedicineResultsEnhancedProps {
  result: AnalysisResult;
  onNewScan?: () => void;
}

export function MedicineResultsEnhanced({
  result,
  onNewScan,
}: MedicineResultsEnhancedProps) {
  const [safetyAnalysis, setSafetyAnalysis] = useState<SafetyAnalysis | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateSafetyAnalysis = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/safety-analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            medicineName: result.medicineName,
            uses: result.medicineData?.uses || result.simplifiedInfo.uses,
            sideEffects:
              result.medicineData?.sideEffects || result.simplifiedInfo.sideEffects,
            warnings:
              result.medicineData?.warnings || result.simplifiedInfo.warnings,
            expiryStatus: result.expiryStatus.status,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate safety analysis');
        }

        const data: SafetyAnalysis = await response.json();
        setSafetyAnalysis(data);
      } catch (err) {
        console.error('[v0] Error generating safety analysis:', err);
        setError('Could not generate AI safety analysis');
      } finally {
        setLoading(false);
      }
    };

    generateSafetyAnalysis();
  }, [result]);

  const getExpiryIcon = () => {
    switch (result.expiryStatus.status) {
      case 'expired':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'near-expiry':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'valid':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  const getExpiryBadgeColor = () => {
    switch (result.expiryStatus.status) {
      case 'expired':
        return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200';
      case 'near-expiry':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200';
      case 'valid':
        return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200';
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Card */}
      <Card className="p-6 border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {result.medicineName}
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className="bg-blue-600 text-white border-blue-600"
              >
                {Math.round(result.confidence * 100)}% Confidence
              </Badge>
              <Badge className={getExpiryBadgeColor()}>
                {result.expiryStatus.status.replace('-', ' ').toUpperCase()}
              </Badge>
            </div>
          </div>
          <div className="flex-shrink-0">
            <Pill className="w-12 h-12 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </Card>

      {/* Expiry Status Alert */}
      {result.expiryStatus.status !== 'valid' && (
        <Alert
          variant={
            result.expiryStatus.status === 'expired' ? 'destructive' : 'default'
          }
          className={
            result.expiryStatus.status === 'near-expiry'
              ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950'
              : ''
          }
        >
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{result.expiryStatus.message}</AlertDescription>
        </Alert>
      )}

      {/* AI-Generated Safety Analysis Section */}
      {loading && (
        <Card className="p-6 bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-3">
            <Spinner className="w-5 h-5" />
            <p className="text-purple-800 dark:text-purple-200 font-semibold">
              Generating AI safety analysis...
            </p>
          </div>
        </Card>
      )}

      {error && (
        <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
          <Info className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {safetyAnalysis && !loading && (
        <>
          {/* Simplified Explanation */}
          <Card className="p-6 border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950">
            <div className="flex items-start gap-4">
              <Shield className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                  How Does It Work? (Simple Explanation)
                </h3>
                <p className="text-green-800 dark:text-green-200 leading-relaxed">
                  {safetyAnalysis.simplifiedExplanation}
                </p>
              </div>
            </div>
          </Card>

          {/* AI Safety Warnings */}
          {safetyAnalysis.safetyWarnings.length > 0 && (
            <Card className="p-6 border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
              <h3 className="font-semibold text-red-900 dark:text-red-100 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                AI-Generated Safety Warnings
              </h3>
              <ul className="space-y-2">
                {safetyAnalysis.safetyWarnings.map((warning, idx) => (
                  <li key={idx} className="flex gap-3 text-red-800 dark:text-red-200">
                    <span className="flex-shrink-0 mt-1">•</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Medicine Information Tabs */}
          <Tabs defaultValue="uses" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="uses">Uses</TabsTrigger>
              <TabsTrigger value="side-effects">Side Effects</TabsTrigger>
              <TabsTrigger value="interactions">Interactions</TabsTrigger>
              <TabsTrigger value="populations">Populations</TabsTrigger>
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
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-300">
                        {idx + 1}
                      </span>
                      <span className="text-gray-700 dark:text-gray-300 pt-0.5">
                        {use}
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            </TabsContent>

            <TabsContent value="side-effects" className="mt-4">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  Common side effects
                </h3>
                <ul className="space-y-3">
                  {result.simplifiedInfo.sideEffects.map((effect, idx) => (
                    <li key={idx} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center text-xs font-bold text-yellow-600 dark:text-yellow-300">
                        {idx + 1}
                      </span>
                      <span className="text-gray-700 dark:text-gray-300 pt-0.5">
                        {effect}
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            </TabsContent>

            <TabsContent value="interactions" className="mt-4">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-orange-600" />
                  Drug interactions & conflicts (AI-Generated)
                </h3>
                {safetyAnalysis.interactionRisks.length > 0 ? (
                  <ul className="space-y-3">
                    {safetyAnalysis.interactionRisks.map((risk, idx) => (
                      <li key={idx} className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center text-xs font-bold text-orange-600 dark:text-orange-300">
                          {idx + 1}
                        </span>
                        <span className="text-gray-700 dark:text-gray-300 pt-0.5">
                          {risk}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">
                    No common interactions identified.
                  </p>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="populations" className="mt-4">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  Special populations (AI-Generated)
                </h3>
                {safetyAnalysis.populationWarnings.length > 0 ? (
                  <ul className="space-y-3">
                    {safetyAnalysis.populationWarnings.map((warning, idx) => (
                      <li key={idx} className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-xs font-bold text-purple-600 dark:text-purple-300">
                          {idx + 1}
                        </span>
                        <span className="text-gray-700 dark:text-gray-300 pt-0.5">
                          {warning}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">
                    No special population warnings identified.
                  </p>
                )}
              </Card>
            </TabsContent>
          </Tabs>

          {/* Disclaimers */}
          <Card className="p-4 bg-gray-50 dark:bg-gray-900 border-yellow-200 dark:border-yellow-800">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-semibold">
              Important Disclaimers:
            </p>
            <ul className="space-y-1">
              {safetyAnalysis.disclaimers.map((disclaimer, idx) => (
                <li key={idx} className="text-xs text-gray-600 dark:text-gray-400">
                  • {disclaimer}
                </li>
              ))}
            </ul>
          </Card>

          {/* Original Warnings */}
          <Card className="p-6 bg-gray-50 dark:bg-gray-900">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Important warnings from medicine data
            </h3>
            <ul className="space-y-3">
              {result.simplifiedInfo.warnings.map((warning, idx) => (
                <li key={idx} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center text-xs font-bold text-red-600 dark:text-red-300">
                    {idx + 1}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300 pt-0.5">
                    {warning}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </>
      )}

      {/* Action Buttons */}
      {onNewScan && (
        <div className="flex gap-3">
          <button
            onClick={onNewScan}
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Scan Another Medicine
          </button>
        </div>
      )}
    </div>
  );
}
