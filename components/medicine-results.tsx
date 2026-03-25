'use client';

import React from 'react';
import { AlertCircle, CheckCircle, Clock, Pill, AlertTriangle, Info } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import type { AnalysisResult } from '@/lib/medicine-analyzer';

interface MedicineResultsProps {
  result: AnalysisResult;
  onNewScan?: () => void;
}

export function MedicineResults({ result, onNewScan }: MedicineResultsProps) {
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
      {/* Medicine Not Found Error */}
      {!result.medicineData && result.matchError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-5 w-5" />
          <AlertDescription className="text-lg">
            <p className="font-semibold">{result.matchError}</p>
            {result.matchSuggestions && result.matchSuggestions.length > 0 && (
              <p className="text-sm mt-2">
                Did you mean: {result.matchSuggestions.map((s) => `"${s.name}"`).join(', ')}?
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Only show medicine details if found */}
      {result.medicineData ? (
        <>
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
                    {Math.round(result.confidence * 100)}% Match
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
              variant={result.expiryStatus.status === 'expired' ? 'destructive' : 'default'}
              className={
                result.expiryStatus.status === 'near-expiry' 
                  ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950'
                  : ''
              }
            >
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {result.expiryStatus.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Medicine Information Tabs */}
          <Tabs defaultValue="uses" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="uses">Uses</TabsTrigger>
              <TabsTrigger value="side-effects">Side Effects</TabsTrigger>
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

            <TabsContent value="warnings" className="mt-4">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  Important warnings and precautions
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
            </TabsContent>
          </Tabs>

          {/* Additional Info */}
          <Card className="p-4 bg-gray-50 dark:bg-gray-900">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              <strong>Disclaimer:</strong> This information is for educational purposes only. 
              Always consult with a healthcare professional before taking any medication. 
              Do not rely solely on this app for medical decisions.
            </p>
          </Card>

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
        </>
      ) : (
        /* No Medicine Found */
        <Card className="p-8 border-2 border-gray-200 dark:border-gray-700 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Medicine Not Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Could not identify the medicine from the image. Please try:
          </p>
          <ul className="text-left text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-6 inline-block">
            <li>• Using a clearer, well-lit image</li>
            <li>• Making sure medicine text is clearly visible</li>
            <li>• Trying another medicine</li>
          </ul>
          {onNewScan && (
            <button
              onClick={onNewScan}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Try Another Medicine
            </button>
          )}
        </Card>
      )}
    </div>
  );

      {/* Expiry Status Alert */}
      {result.expiryStatus.status !== 'valid' && (
        <Alert 
          variant={result.expiryStatus.status === 'expired' ? 'destructive' : 'default'}
          className={
            result.expiryStatus.status === 'near-expiry' 
              ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950'
              : ''
          }
        >
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {result.expiryStatus.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Medicine Information Tabs */}
      <Tabs defaultValue="uses" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="uses">Uses</TabsTrigger>
          <TabsTrigger value="side-effects">Side Effects</TabsTrigger>
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

        <TabsContent value="warnings" className="mt-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Important warnings and precautions
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
        </TabsContent>
      </Tabs>

      {/* Additional Info */}
      <Card className="p-4 bg-gray-50 dark:bg-gray-900">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          <strong>Disclaimer:</strong> This information is for educational purposes only. 
          Always consult with a healthcare professional before taking any medication. 
          Do not rely solely on this app for medical decisions.
        </p>
      </Card>

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
