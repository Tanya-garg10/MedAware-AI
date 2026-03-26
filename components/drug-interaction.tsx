'use client';

import { useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Loader2, Zap, Info } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface InteractionResult {
  riskLevel: 'safe' | 'mild' | 'moderate' | 'severe';
  summary: string;
  details: string[];
  recommendation: string;
  canTakeTogether: boolean;
}

export function DrugInteraction() {
  const [medicine1, setMedicine1] = useState('');
  const [medicine2, setMedicine2] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InteractionResult | null>(null);
  const [error, setError] = useState('');

  const checkInteraction = async () => {
    if (!medicine1.trim() || !medicine2.trim()) {
      setError('Please enter both medicine names.');
      return;
    }
    if (medicine1.trim().toLowerCase() === medicine2.trim().toLowerCase()) {
      setError('Please enter two different medicine names.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/drug-interaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicine1: medicine1.trim(), medicine2: medicine2.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to check interaction.');
        return;
      }
      setResult(data.result);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const riskConfig = {
    safe: {
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50 border-green-200',
      badge: 'bg-green-100 text-green-800',
      label: 'Safe to Combine',
    },
    mild: {
      icon: Info,
      color: 'text-blue-600',
      bg: 'bg-blue-50 border-blue-200',
      badge: 'bg-blue-100 text-blue-800',
      label: 'Mild Interaction',
    },
    moderate: {
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50 border-yellow-200',
      badge: 'bg-yellow-100 text-yellow-800',
      label: 'Moderate Risk',
    },
    severe: {
      icon: XCircle,
      color: 'text-red-600',
      bg: 'bg-red-50 border-red-200',
      badge: 'bg-red-100 text-red-800',
      label: 'Severe — Avoid!',
    },
  };

  const cfg = result ? riskConfig[result.riskLevel] : null;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Drug Interaction Checker</h2>
        <p className="text-muted-foreground text-sm">Enter two medicine names to check if they are safe to take together.</p>
      </div>

      <Card className="p-6 space-y-5 border-2 border-border">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Medicine 1</label>
            <input
              type="text"
              value={medicine1}
              onChange={e => setMedicine1(e.target.value)}
              placeholder="e.g. Paracetamol"
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
              onKeyDown={e => e.key === 'Enter' && checkInteraction()}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Medicine 2</label>
            <input
              type="text"
              value={medicine2}
              onChange={e => setMedicine2(e.target.value)}
              placeholder="e.g. Ibuprofen"
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
              onKeyDown={e => e.key === 'Enter' && checkInteraction()}
            />
          </div>
        </div>

        <button
          onClick={checkInteraction}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 px-6 py-3 rounded-xl font-semibold text-sm transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Checking interaction...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Check Interaction
            </>
          )}
        </button>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && cfg && (
        <div className="space-y-4">
          <Card className={`p-5 border-2 ${cfg.bg}`}>
            <div className="flex items-start gap-4">
              <cfg.icon className={`w-8 h-8 ${cfg.color} flex-shrink-0 mt-0.5`} />
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cfg.badge}`}>
                    {cfg.label}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {medicine1} + {medicine2}
                  </span>
                </div>
                <p className="font-semibold text-foreground">{result.summary}</p>
              </div>
            </div>
          </Card>

          <Card className="p-5 space-y-4 border border-border">
            <div>
              <h4 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-500" />
                Interaction Details
              </h4>
              <ul className="space-y-2">
                {result.details.map((d, i) => (
                  <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                    <span className="text-primary font-bold flex-shrink-0 mt-0.5">•</span>
                    {d}
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-3 border-t border-border">
              <h4 className="font-semibold text-foreground text-sm mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Recommendation
              </h4>
              <p className="text-sm text-muted-foreground">{result.recommendation}</p>
            </div>
          </Card>

          <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950/30">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 dark:text-amber-300 text-sm">
              This is AI-generated information for educational purposes only. Always consult your doctor or pharmacist before combining medicines.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {!result && !loading && !error && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Try these examples:</p>
          <div className="flex flex-wrap gap-2">
            {[
              ['Paracetamol', 'Ibuprofen'],
              ['Aspirin', 'Warfarin'],
              ['Metformin', 'Alcohol'],
              ['Amoxicillin', 'Doxycycline'],
            ].map(([m1, m2]) => (
              <button
                key={`${m1}-${m2}`}
                onClick={() => { setMedicine1(m1); setMedicine2(m2); }}
                className="text-xs px-3 py-1.5 rounded-full border border-border bg-muted hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
              >
                {m1} + {m2}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
