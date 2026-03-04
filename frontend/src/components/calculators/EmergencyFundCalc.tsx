'use client';

import { useState, useMemo } from 'react';
import { formatCurrency } from '@/lib/utils';
import { calculateEmergencyFund } from '@/lib/calculators';
import { EmailCapture } from '@/components/shared/EmailCapture';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { ArrowRight, Info, Shield } from 'lucide-react';
import Link from 'next/link';
import type { EmergencyFundInputs } from '@/types';

const stabilityLabels: Record<number, string> = {
  1: 'Very Unstable (irregular gigs, no recurring clients)',
  2: 'Unstable (mostly project-based, seasonal)',
  3: 'Moderate (mix of project and recurring)',
  4: 'Stable (mostly retainers, recurring revenue)',
  5: 'Very Stable (long-term contracts, predictable)',
};

export function EmergencyFundCalc() {
  const [inputs, setInputs] = useState<EmergencyFundInputs>({
    monthlyExpenses: 4000,
    monthlyIncome: 6000,
    incomeStability: 3,
    dependents: 0,
    currentSavings: 5000,
  });

  const result = useMemo(() => calculateEmergencyFund(inputs), [inputs]);

  const updateInput = (key: keyof EmergencyFundInputs, value: number) => {
    setInputs((prev) => ({ ...prev, [key]: value as never }));
  };

  return (
    <div className="card p-6 md:p-8">
      <h2 className="font-heading font-bold text-heading-lg text-navy-900 dark:text-white mb-2">
        Emergency Fund Calculator
      </h2>
      <p className="text-body text-gray-500 dark:text-gray-400 mb-8">
        Freelancers typically need 6-12 months of expenses saved. Find out your target and build a plan to get there.
      </p>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-5">
          <div>
            <label className="label" htmlFor="monthly-expenses">Monthly Essential Expenses</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
              <input
                id="monthly-expenses"
                type="number"
                value={inputs.monthlyExpenses}
                onChange={(e) => updateInput('monthlyExpenses', Number(e.target.value))}
                className="input-field pl-8"
                min={0}
                step={100}
              />
            </div>
            <p className="text-caption text-gray-400 mt-1 flex items-start gap-1">
              <Info className="w-3 h-3 mt-0.5 shrink-0" />
              Rent, utilities, food, insurance, minimum debt payments.
            </p>
          </div>

          <div>
            <label className="label" htmlFor="monthly-income">Average Monthly Income</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
              <input
                id="monthly-income"
                type="number"
                value={inputs.monthlyIncome}
                onChange={(e) => updateInput('monthlyIncome', Number(e.target.value))}
                className="input-field pl-8"
                min={0}
                step={100}
              />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="stability">Income Stability</label>
            <select
              id="stability"
              value={inputs.incomeStability}
              onChange={(e) => updateInput('incomeStability', Number(e.target.value) as 1 | 2 | 3 | 4 | 5)}
              className="input-field"
            >
              {[1, 2, 3, 4, 5].map((level) => (
                <option key={level} value={level}>
                  {level} - {stabilityLabels[level]}
                </option>
              ))}
            </select>
            <p className="text-caption text-gray-400 mt-1">
              Lower stability = more months of runway recommended.
            </p>
          </div>

          <div>
            <label className="label" htmlFor="dependents">Number of Dependents</label>
            <input
              id="dependents"
              type="number"
              value={inputs.dependents}
              onChange={(e) => updateInput('dependents', Number(e.target.value))}
              className="input-field"
              min={0}
              max={10}
            />
          </div>

          <div>
            <label className="label" htmlFor="current-savings">Current Emergency Savings</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
              <input
                id="current-savings"
                type="number"
                value={inputs.currentSavings}
                onChange={(e) => updateInput('currentSavings', Number(e.target.value))}
                className="input-field pl-8"
                min={0}
                step={500}
              />
            </div>
          </div>
        </div>

        {/* Results */}
        <div>
          {/* Progress visualization */}
          <div className="bg-gray-50 dark:bg-navy-800 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-teal-500" />
              <h3 className="font-heading font-semibold text-heading-sm text-navy-900 dark:text-white">
                Your Emergency Fund Goal
              </h3>
            </div>

            <div className="text-center mb-6">
              <p className="text-body-sm text-gray-500 mb-1">Recommended fund size</p>
              <p className="text-display font-heading font-bold text-navy-900 dark:text-white">
                {formatCurrency(result.targetAmount)}
              </p>
              <p className="text-body-sm text-gray-500 mt-1">
                {result.recommendedMonths} months of expenses
              </p>
            </div>

            <ProgressBar
              value={result.currentProgress}
              label="Current progress"
              color={result.currentProgress >= 75 ? 'teal' : result.currentProgress >= 40 ? 'amber' : 'blue'}
              size="lg"
              className="mb-4"
            />

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="p-3 bg-white dark:bg-navy-700 rounded-lg">
                <p className="text-caption text-gray-500 mb-1">Current Savings</p>
                <p className="font-heading font-bold text-heading-sm text-navy-900 dark:text-white">
                  {formatCurrency(inputs.currentSavings)}
                </p>
              </div>
              <div className="p-3 bg-white dark:bg-navy-700 rounded-lg">
                <p className="text-caption text-gray-500 mb-1">Still Needed</p>
                <p className="font-heading font-bold text-heading-sm text-navy-900 dark:text-white">
                  {formatCurrency(Math.max(0, result.targetAmount - inputs.currentSavings))}
                </p>
              </div>
            </div>
          </div>

          {/* Savings plan */}
          <div className="p-5 bg-teal-50 dark:bg-teal-900/20 rounded-xl border border-teal-200 dark:border-teal-800 mb-6">
            <h3 className="font-heading font-semibold text-body text-teal-800 dark:text-teal-300 mb-3">
              Your Savings Plan
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-body-sm text-teal-700 dark:text-teal-400">Monthly contribution (20% of income)</span>
                <span className="font-semibold text-body-sm text-teal-800 dark:text-teal-300">
                  {formatCurrency(result.monthlyContribution)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-body-sm text-teal-700 dark:text-teal-400">Months to reach goal</span>
                <span className="font-semibold text-body-sm text-teal-800 dark:text-teal-300">
                  {result.monthsToGoal === 0 ? 'Goal reached!' : `${result.monthsToGoal} months`}
                </span>
              </div>
            </div>
          </div>

          {/* Why this number */}
          <div className="p-4 bg-gray-50 dark:bg-navy-800 rounded-xl mb-6">
            <h4 className="font-heading font-semibold text-body-sm text-navy-900 dark:text-white mb-2">
              Why {result.recommendedMonths} months?
            </h4>
            <ul className="space-y-1 text-body-sm text-gray-600 dark:text-gray-400">
              <li>
                Base: {inputs.incomeStability <= 2 ? '9-12' : inputs.incomeStability <= 3 ? '6' : '4-5'} months
                (based on your income stability level {inputs.incomeStability}/5)
              </li>
              {inputs.dependents > 0 && (
                <li>+{inputs.dependents} month{inputs.dependents > 1 ? 's' : ''} for {inputs.dependents} dependent{inputs.dependents > 1 ? 's' : ''}</li>
              )}
              <li>Freelancers generally need more than the standard 3-6 month advice for employees.</li>
            </ul>
          </div>

          {/* CTAs */}
          <div className="space-y-3">
            <EmailCapture
              source="emergency-fund-calc"
              title="Email me this savings plan"
              description="Get a monthly breakdown and tips to reach your goal faster."
              buttonText="Email Plan"
              variant="inline"
            />
            <Link href="/auth/register" className="btn-primary w-full text-body-sm">
              Auto-save with SteadyStack
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
