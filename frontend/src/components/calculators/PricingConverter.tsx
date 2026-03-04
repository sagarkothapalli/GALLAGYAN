'use client';

import { useState, useMemo } from 'react';
import { formatCurrency } from '@/lib/utils';
import { calculatePricingConverter } from '@/lib/calculators';
import { EmailCapture } from '@/components/shared/EmailCapture';
import { ArrowRight, Info, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import type { PricingConverterInputs } from '@/types';

export function PricingConverter() {
  const [inputs, setInputs] = useState<PricingConverterInputs>({
    hoursWorkedPerWeek: 40,
    weeksWorkedPerYear: 48,
    desiredAnnualIncome: 100000,
    annualOverhead: 12000,
    profitMargin: 20,
    nonBillablePercent: 30,
  });

  const result = useMemo(() => calculatePricingConverter(inputs), [inputs]);

  const updateInput = (key: keyof PricingConverterInputs, value: number) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="card p-6 md:p-8">
      <h2 className="font-heading font-bold text-heading-lg text-navy-900 dark:text-white mb-2">
        Hourly-to-Value Pricing Converter
      </h2>
      <p className="text-body text-gray-500 dark:text-gray-400 mb-8">
        Find out what you actually need to charge to hit your income goals, accounting
        for non-billable time, overhead, and profit margin.
      </p>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-5">
          <div>
            <label className="label" htmlFor="desired-income">Desired Annual Take-Home Income</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
              <input
                id="desired-income"
                type="number"
                value={inputs.desiredAnnualIncome}
                onChange={(e) => updateInput('desiredAnnualIncome', Number(e.target.value))}
                className="input-field pl-8"
                min={0}
                step={5000}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="hours-week">Hours / Week</label>
              <input
                id="hours-week"
                type="number"
                value={inputs.hoursWorkedPerWeek}
                onChange={(e) => updateInput('hoursWorkedPerWeek', Number(e.target.value))}
                className="input-field"
                min={1}
                max={80}
              />
            </div>
            <div>
              <label className="label" htmlFor="weeks-year">Weeks / Year</label>
              <input
                id="weeks-year"
                type="number"
                value={inputs.weeksWorkedPerYear}
                onChange={(e) => updateInput('weeksWorkedPerYear', Number(e.target.value))}
                className="input-field"
                min={1}
                max={52}
              />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="overhead">Annual Overhead / Business Costs</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
              <input
                id="overhead"
                type="number"
                value={inputs.annualOverhead}
                onChange={(e) => updateInput('annualOverhead', Number(e.target.value))}
                className="input-field pl-8"
                min={0}
                step={1000}
              />
            </div>
            <p className="text-caption text-gray-400 mt-1 flex items-start gap-1">
              <Info className="w-3 h-3 mt-0.5 shrink-0" />
              Software, equipment, insurance, accounting, taxes, etc.
            </p>
          </div>

          <div>
            <label className="label" htmlFor="non-billable">Non-Billable Time (%)</label>
            <input
              id="non-billable"
              type="range"
              min={10}
              max={60}
              step={5}
              value={inputs.nonBillablePercent}
              onChange={(e) => updateInput('nonBillablePercent', Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-navy-700 rounded-full appearance-none cursor-pointer accent-teal-500"
            />
            <div className="flex justify-between mt-1">
              <span className="text-caption text-gray-400">10%</span>
              <span className="text-body-sm font-semibold text-navy-900 dark:text-white">{inputs.nonBillablePercent}%</span>
              <span className="text-caption text-gray-400">60%</span>
            </div>
            <p className="text-caption text-gray-400 mt-1">
              Admin, marketing, sales calls, learning. Most freelancers are 25-40% non-billable.
            </p>
          </div>

          <div>
            <label className="label" htmlFor="profit-margin">Desired Profit Margin (%)</label>
            <input
              id="profit-margin"
              type="range"
              min={0}
              max={50}
              step={5}
              value={inputs.profitMargin}
              onChange={(e) => updateInput('profitMargin', Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-navy-700 rounded-full appearance-none cursor-pointer accent-teal-500"
            />
            <div className="flex justify-between mt-1">
              <span className="text-caption text-gray-400">0%</span>
              <span className="text-body-sm font-semibold text-navy-900 dark:text-white">{inputs.profitMargin}%</span>
              <span className="text-caption text-gray-400">50%</span>
            </div>
            <p className="text-caption text-gray-400 mt-1">
              Buffer above break-even for savings, growth, and unexpected costs.
            </p>
          </div>
        </div>

        {/* Results */}
        <div>
          {/* Primary result */}
          <div className="bg-gradient-to-br from-navy-900 to-navy-800 text-white rounded-xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-teal-400" />
              <h3 className="font-heading font-semibold text-body">Your Recommended Rate</h3>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-white/5 rounded-xl text-center border border-white/10">
                <p className="text-caption text-gray-400 mb-1">Minimum Rate</p>
                <p className="text-heading-lg font-heading font-bold">{formatCurrency(result.minimumHourlyRate)}</p>
                <p className="text-caption text-gray-400">/hour (break-even)</p>
              </div>
              <div className="p-4 bg-teal-500/10 rounded-xl text-center border border-teal-500/20">
                <p className="text-caption text-teal-300 mb-1">Recommended</p>
                <p className="text-heading-lg font-heading font-bold text-teal-400">{formatCurrency(result.recommendedHourlyRate)}</p>
                <p className="text-caption text-teal-300">/hour (with margin)</p>
              </div>
            </div>

            {/* Rate conversions */}
            <div className="space-y-2">
              {[
                { label: 'Daily Rate (8 hrs)', value: result.dailyRate },
                { label: 'Weekly Rate', value: result.weeklyRate },
                { label: 'Monthly Rate', value: result.monthlyRate },
                { label: '10-Hour Project', value: result.projectRate10h },
                { label: '40-Hour Project', value: result.projectRate40h },
              ].map((rate) => (
                <div key={rate.label} className="flex justify-between items-center">
                  <span className="text-body-sm text-gray-300">{rate.label}</span>
                  <span className="font-semibold text-body-sm">{formatCurrency(rate.value)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key insight */}
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 mb-6">
            <h4 className="font-heading font-semibold text-body-sm text-amber-800 dark:text-amber-300 mb-1">
              Key Insight
            </h4>
            <p className="text-body-sm text-amber-700 dark:text-amber-400">
              Of your {inputs.hoursWorkedPerWeek} hours/week, only {Math.round(inputs.hoursWorkedPerWeek * (1 - inputs.nonBillablePercent / 100))} are
              billable ({result.effectiveBillableHours} hours/year). This is why your rate needs to be higher than
              a simple income-divided-by-hours calculation.
            </p>
          </div>

          {/* Pricing psychology */}
          <div className="p-4 bg-gray-50 dark:bg-navy-800 rounded-xl mb-6">
            <h4 className="font-heading font-semibold text-body-sm text-navy-900 dark:text-white mb-2">
              Moving Beyond Hourly Rates
            </h4>
            <p className="text-body-sm text-gray-600 dark:text-gray-400">
              Consider this: if your work helps a client earn $50,000 in additional revenue,
              charging {formatCurrency(result.projectRate40h)} for a 40-hour project is a bargain for them.
              Value-based pricing lets you charge based on the outcome, not the hours.
            </p>
            <Link href="/learn/value-based-pricing-guide" className="text-body-sm text-teal-600 dark:text-teal-400 font-medium hover:underline mt-2 inline-flex items-center gap-1">
              Read our Value-Based Pricing Guide
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* CTAs */}
          <div className="space-y-3">
            <EmailCapture
              source="pricing-converter"
              title="Email me this rate card"
              description="Get a shareable rate card with all your pricing tiers."
              buttonText="Email Rate Card"
              variant="inline"
            />
            <Link href="/auth/register" className="btn-primary w-full text-body-sm">
              Track your actual billable hours with SteadyStack
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
