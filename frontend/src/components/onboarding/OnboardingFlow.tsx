'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ProgressBar } from '@/components/shared/ProgressBar';
import {
  ArrowRight,
  ArrowLeft,
  Briefcase,
  Store,
  Laptop,
  AlertTriangle,
  TrendingDown,
  Receipt,
  Wallet,
  Brain,
  Check,
  Info,
} from 'lucide-react';
import { calculatePersonaFromAnswers, PERSONAS } from '@/data/quiz-questions';
import type { OnboardingState, FinancialPersona } from '@/types';

const STEPS = [
  { label: 'Business Type', number: 1 },
  { label: 'Pain Points', number: 2 },
  { label: 'Your Persona', number: 3 },
  { label: '3-Account Setup', number: 4 },
  { label: 'First Action', number: 5 },
];

const businessTypes = [
  { id: 'freelancer', label: 'Freelancer / Independent Contractor', icon: Laptop, description: 'I sell my skills and time directly to clients' },
  { id: 'micro-smb', label: 'Small Business Owner', icon: Store, description: 'I run a small business with products or services' },
  { id: 'side-hustle', label: 'Side Hustle / Part-Time', icon: Briefcase, description: 'I freelance alongside a full-time job' },
];

const incomeRanges = [
  'Under $25,000',
  '$25,000 - $50,000',
  '$50,000 - $75,000',
  '$75,000 - $100,000',
  '$100,000 - $150,000',
  'Over $150,000',
];

const painPoints = [
  { id: 'taxes', label: 'Figuring out taxes and quarterly payments', icon: Receipt },
  { id: 'income', label: 'Unpredictable income / feast-or-famine cycle', icon: TrendingDown },
  { id: 'savings', label: 'Not saving enough or building a safety net', icon: Wallet },
  { id: 'pricing', label: 'Not sure if I am charging enough', icon: AlertTriangle },
  { id: 'stress', label: 'Financial stress and money anxiety', icon: Brain },
];

export function OnboardingFlow() {
  const router = useRouter();
  const [state, setState] = useState<OnboardingState>({
    step: 1,
    businessType: '',
    incomeRange: '',
    painPoints: [],
    persona: null,
    taxSavingsPercent: 30,
  });

  const update = (partial: Partial<OnboardingState>) => {
    setState((prev) => ({ ...prev, ...partial }));
  };

  const nextStep = () => update({ step: Math.min(state.step + 1, 5) });
  const prevStep = () => update({ step: Math.max(state.step - 1, 1) });

  const togglePainPoint = (id: string) => {
    const current = state.painPoints;
    if (current.includes(id)) {
      update({ painPoints: current.filter((p) => p !== id) });
    } else if (current.length < 3) {
      update({ painPoints: [...current, id] });
    }
  };

  // Auto-assign persona based on selections (simplified)
  const assignPersona = (): FinancialPersona => {
    if (state.painPoints.includes('taxes')) return 'tax-optimizer';
    if (state.painPoints.includes('income')) return 'cash-flow-builder';
    if (state.businessType === 'micro-smb') return 'scale-ready';
    return 'new-freelancer';
  };

  const handleFinish = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-950 flex flex-col">
      {/* Progress header */}
      <div className="bg-white dark:bg-navy-900 border-b border-gray-200 dark:border-navy-800 py-4">
        <div className="container-narrow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-body-sm font-medium text-gray-500">
              Step {state.step} of 5
            </span>
            <span className="text-body-sm text-gray-400">
              {STEPS[state.step - 1].label}
            </span>
          </div>
          <ProgressBar value={(state.step / 5) * 100} showPercent={false} size="sm" />
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center py-12">
        <div className="container-narrow max-w-2xl w-full">
          {/* Step 1: Business Type */}
          {state.step === 1 && (
            <div className="animate-fade-in">
              <h1 className="font-heading font-bold text-heading-xl text-navy-900 dark:text-white mb-2 text-center">
                Welcome to SteadyStack
              </h1>
              <p className="text-body-lg text-gray-500 mb-8 text-center">
                Let us personalize your experience. What best describes you?
              </p>

              <div className="space-y-3 mb-8">
                {businessTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => update({ businessType: type.id })}
                    className={cn(
                      'w-full flex items-center gap-4 p-5 rounded-xl border-2 transition-all text-left',
                      state.businessType === type.id
                        ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                        : 'border-gray-200 dark:border-navy-700 hover:border-gray-300'
                    )}
                  >
                    <type.icon className={cn('w-6 h-6 shrink-0', state.businessType === type.id ? 'text-teal-500' : 'text-gray-400')} />
                    <div>
                      <p className="font-heading font-semibold text-body text-navy-900 dark:text-white">{type.label}</p>
                      <p className="text-body-sm text-gray-500 mt-0.5">{type.description}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mb-8">
                <label className="label">Approximate Annual Income</label>
                <select
                  value={state.incomeRange}
                  onChange={(e) => update({ incomeRange: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select a range</option>
                  {incomeRanges.map((range) => (
                    <option key={range} value={range}>{range}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={nextStep}
                disabled={!state.businessType || !state.incomeRange}
                className="btn-primary w-full disabled:opacity-50"
              >
                Continue
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          )}

          {/* Step 2: Pain Points */}
          {state.step === 2 && (
            <div className="animate-fade-in">
              <h1 className="font-heading font-bold text-heading-xl text-navy-900 dark:text-white mb-2 text-center">
                What are your top financial challenges?
              </h1>
              <p className="text-body-lg text-gray-500 mb-8 text-center">
                Select up to 3. We will tailor your experience to help with these first.
              </p>

              <div className="space-y-3 mb-8">
                {painPoints.map((point) => (
                  <button
                    key={point.id}
                    onClick={() => togglePainPoint(point.id)}
                    className={cn(
                      'w-full flex items-center gap-4 p-5 rounded-xl border-2 transition-all text-left',
                      state.painPoints.includes(point.id)
                        ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                        : 'border-gray-200 dark:border-navy-700 hover:border-gray-300'
                    )}
                  >
                    <point.icon className={cn('w-5 h-5 shrink-0', state.painPoints.includes(point.id) ? 'text-teal-500' : 'text-gray-400')} />
                    <span className="font-medium text-body text-navy-900 dark:text-white">{point.label}</span>
                    {state.painPoints.includes(point.id) && (
                      <Check className="w-5 h-5 text-teal-500 ml-auto" />
                    )}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={prevStep} className="btn-ghost">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </button>
                <button
                  onClick={() => {
                    update({ persona: assignPersona() });
                    nextStep();
                  }}
                  disabled={state.painPoints.length === 0}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  Continue
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Persona Assignment */}
          {state.step === 3 && state.persona && (
            <div className="animate-fade-in text-center">
              <h1 className="font-heading font-bold text-heading-xl text-navy-900 dark:text-white mb-2">
                Your Financial Persona
              </h1>
              <p className="text-body-lg text-gray-500 mb-8">
                Based on your answers, here is where we recommend you start.
              </p>

              <div className="card p-8 mb-8 max-w-md mx-auto">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: `${PERSONAS[state.persona].color}15` }}
                >
                  <span className="text-display font-heading font-bold" style={{ color: PERSONAS[state.persona].color }}>
                    {PERSONAS[state.persona].label[0]}
                  </span>
                </div>
                <h2 className="font-heading font-bold text-heading mb-1" style={{ color: PERSONAS[state.persona].color }}>
                  {PERSONAS[state.persona].label}
                </h2>
                <p className="text-body-sm text-gray-500 mb-4">{PERSONAS[state.persona].tagline}</p>
                <p className="text-body-sm text-gray-600 dark:text-gray-400 text-left">
                  {PERSONAS[state.persona].description}
                </p>
              </div>

              <div className="flex gap-3">
                <button onClick={prevStep} className="btn-ghost">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </button>
                <button onClick={nextStep} className="btn-primary flex-1">
                  Continue to Account Setup
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: 3-Account Setup */}
          {state.step === 4 && (
            <div className="animate-fade-in">
              <h1 className="font-heading font-bold text-heading-xl text-navy-900 dark:text-white mb-2 text-center">
                The 3-Account System
              </h1>
              <p className="text-body-lg text-gray-500 mb-8 text-center">
                This is the structure top freelancers use to stay organized and never scramble for tax money.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  {
                    name: 'Business Checking',
                    description: 'All client payments land here first. This is your revenue hub.',
                    color: 'bg-blue-500',
                    tip: 'Keep this separate from personal spending.',
                  },
                  {
                    name: 'Tax Savings',
                    description: 'A percentage of every payment gets auto-transferred here. No touching until tax time.',
                    color: 'bg-amber-500',
                    tip: 'We recommend setting aside 25-35% depending on your income and state.',
                  },
                  {
                    name: 'Personal Draw',
                    description: 'Pay yourself a consistent amount monthly. This is your "salary" as a freelancer.',
                    color: 'bg-teal-500',
                    tip: 'This is the income smoothing concept in action.',
                  },
                ].map((account) => (
                  <div key={account.name} className="card p-5">
                    <div className="flex items-start gap-4">
                      <div className={cn('w-4 h-4 rounded-full mt-1 shrink-0', account.color)} />
                      <div>
                        <h3 className="font-heading font-semibold text-body text-navy-900 dark:text-white">{account.name}</h3>
                        <p className="text-body-sm text-gray-600 dark:text-gray-400 mt-1">{account.description}</p>
                        <div className="flex items-start gap-1.5 mt-2">
                          <Info className="w-3 h-3 text-teal-500 mt-0.5 shrink-0" />
                          <p className="text-caption text-teal-600 dark:text-teal-400">{account.tip}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={prevStep} className="btn-ghost">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </button>
                <button onClick={nextStep} className="btn-primary flex-1">
                  Got it — set up my accounts
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            </div>
          )}

          {/* Step 5: First Action */}
          {state.step === 5 && (
            <div className="animate-fade-in">
              <h1 className="font-heading font-bold text-heading-xl text-navy-900 dark:text-white mb-2 text-center">
                Set your tax savings percentage
              </h1>
              <p className="text-body-lg text-gray-500 mb-8 text-center">
                Every time you receive a payment, we will auto-transfer this percentage to your tax savings.
              </p>

              <div className="card p-8 mb-8">
                <div className="text-center mb-6">
                  <span className="text-display-lg font-heading font-bold text-teal-500">
                    {state.taxSavingsPercent}%
                  </span>
                  <p className="text-body-sm text-gray-500 mt-1">of each payment goes to tax savings</p>
                </div>

                <input
                  type="range"
                  min={15}
                  max={45}
                  step={1}
                  value={state.taxSavingsPercent}
                  onChange={(e) => update({ taxSavingsPercent: Number(e.target.value) })}
                  className="w-full h-3 bg-gray-200 dark:bg-navy-700 rounded-full appearance-none cursor-pointer accent-teal-500"
                  aria-label="Tax savings percentage"
                />
                <div className="flex justify-between mt-2 text-caption text-gray-400">
                  <span>15%</span>
                  <span>30% (recommended)</span>
                  <span>45%</span>
                </div>

                <div className="mt-6 p-4 bg-teal-50 dark:bg-teal-900/20 rounded-xl">
                  <p className="text-body-sm text-teal-700 dark:text-teal-300">
                    <strong>Example:</strong> On a $5,000 payment, {formatCurrency(5000 * state.taxSavingsPercent / 100)} goes
                    to tax savings and {formatCurrency(5000 * (1 - state.taxSavingsPercent / 100))} stays in business checking.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={prevStep} className="btn-ghost">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </button>
                <button onClick={handleFinish} className="btn-primary flex-1">
                  Complete Setup — Go to Dashboard
                  <Check className="w-5 h-5 ml-2" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
