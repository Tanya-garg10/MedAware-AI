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
  const getExpiryBadgeColor = () => {
    switch (result.expiryStatus.status) {
      case 'expired':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'near-expiry':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
  };

  // If no medicine found, show error
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
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Medicine Not Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Could not identify the medicine from the image. Try another image or check the text is clear.
          </p>
          {onNewScan && (
            <button
              onClick={onNewScan}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Try Another Medicine
            </button>
          )}
        </Card>
      </div>
    );
  }

  // Medicine found - show details
  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-2 border-blue-200 dark:border-blue-800">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
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
          <Pill className="w-12 h-12 text-blue-600 flex-shrink-0" />
        </div>
      </Card>

      {/* Expiry Alert */}
      {result.expiryStatus.status !== 'valid' && (
        <Alert variant={result.expiryStatus.status === 'expired' ? 'destructive' : 'default'}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{result.expiryStatus.message}</AlertDescription>
        </Alert>
      )}

      {/* Information Tabs */}
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

      {/* Disclaimer */}
      <Alert className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-sm text-gray-600 dark:text-gray-400">
          <strong>Disclaimer:</strong> This information is for educational purposes only. Always consult with healthcare professionals before taking medication.
        </AlertDescription>
      </Alert>

      {/* Action Button */}
      {onNewScan && (
        <button
          onClick={onNewScan}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
        >
          Scan Another Medicine
        </button>
      )}
    </div>
  );
}
