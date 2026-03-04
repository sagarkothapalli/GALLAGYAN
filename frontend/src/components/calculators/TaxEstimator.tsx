'use client';

import { useState, useMemo } from 'react';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { calculateTaxEstimate, US_STATES } from '@/lib/calculators';
import { EmailCapture } from '@/components/shared/EmailCapture';
import { ArrowRight, Info } from 'lucide-react';
import Link from 'next/link';
import type { TaxEstimatorInputs } from '@/types';

export function TaxEstimator() {
  const [inputs, setInputs] = useState<TaxEstimatorInputs>({
    annualIncome: 80000,
    businessExpenses: 15000,
    state: 'CA',
    filingStatus: 'single',
    quarterlyPaymentsMade: 0,
  });

  const result = useMemo(() => calculateTaxEstimate(inputs), [inputs]);

  const updateInput = (key: keyof TaxEstimatorInputs, value: string | number) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  // Data for pie-like visualization
  const taxBreakdown = [
    { label: 'Self-Employment Tax', value: result.selfEmploymentTax, color: '#EF4444' },
    { label: 'Federal Income Tax', value: result.federalIncomeTax, color: '#3B82F6' },
    { label: 'State Income Tax', value: result.stateIncomeTax, color: '#F59E0B' },
    { label: 'Take-Home Pay', value: result.netIncome, color: '#00D4AA' },
  ];

  const total = result.totalTaxLiability + result.netIncome;

  return (
    <div className="card p-6 md:p-8">
      <h2 className="font-heading font-bold text-heading-lg text-navy-900 dark:text-white mb-2">
        Quarterly Tax Estimator
      </h2>
      <p className="text-body text-gray-500 dark:text-gray-400 mb-8">
        Estimate how much to set aside for federal self-employment tax, income tax, and state tax each quarter.
      </p>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-5">
          <div>
            <label className="label" htmlFor="annual-income">Annual Gross Income</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
              <input
                id="annual-income"
                type="number"
                value={inputs.annualIncome}
                onChange={(e) => updateInput('annualIncome', Number(e.target.value))}
                className="input-field pl-8"
                min={0}
                step={1000}
              />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="expenses">Business Expenses (Annual)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
              <input
                id="expenses"
                type="number"
                value={inputs.businessExpenses}
                onChange={(e) => updateInput('businessExpenses', Number(e.target.value))}
                className="input-field pl-8"
                min={0}
                step={500}
              />
            </div>
            <p className="text-caption text-gray-400 mt-1 flex items-start gap-1">
              <Info className="w-3 h-3 mt-0.5 shrink-0" />
              Include software, equipment, home office, travel, and professional services.
            </p>
          </div>

          <div>
            <label className="label" htmlFor="state">State</label>
            <select
              id="state"
              value={inputs.state}
              onChange={(e) => updateInput('state', e.target.value)}
              className="input-field"
            >
              {US_STATES.map((state) => (
                <option key={state.code} value={state.code}>
                  {state.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="filing-status">Filing Status</label>
            <select
              id="filing-status"
              value={inputs.filingStatus}
              onChange={(e) => updateInput('filingStatus', e.target.value)}
              className="input-field"
            >
              <option value="single">Single</option>
              <option value="married">Married Filing Jointly</option>
              <option value="head-of-household">Head of Household</option>
            </select>
          </div>

          <div>
            <label className="label" htmlFor="quarterly-paid">Quarterly Payments Already Made (This Year)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
              <input
                id="quarterly-paid"
                type="number"
                value={inputs.quarterlyPaymentsMade}
                onChange={(e) => updateInput('quarterlyPaymentsMade', Number(e.target.value))}
                className="input-field pl-8"
                min={0}
                step={100}
              />
            </div>
          </div>
        </div>

        {/* Results */}
        <div>
          {/* Visual breakdown bar */}
          <div className="mb-6">
            <h3 className="font-heading font-semibold text-body mb-3 text-navy-900 dark:text-white">Income Breakdown</h3>
            <div className="flex h-8 rounded-full overflow-hidden">
              {taxBreakdown.map((item) => (
                <div
                  key={item.label}
                  style={{ width: `${total > 0 ? (item.value / total) * 100 : 0}%`, backgroundColor: item.color }}
                  className="transition-all duration-500"
                  title={`${item.label}: ${formatCurrency(item.value)}`}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-4 mt-3">
              {taxBreakdown.map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-caption text-gray-500">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed numbers */}
          <div className="bg-gray-50 dark:bg-navy-800 rounded-xl p-5 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-body-sm text-gray-600 dark:text-gray-400">Gross Income</span>
              <span className="font-semibold text-body-sm">{formatCurrency(inputs.annualIncome)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-body-sm text-gray-600 dark:text-gray-400">- Business Expenses</span>
              <span className="font-semibold text-body-sm text-red-500">-{formatCurrency(inputs.businessExpenses)}</span>
            </div>
            <hr className="border-gray-200 dark:border-navy-600" />
            <div className="flex justify-between items-center">
              <span className="text-body-sm text-gray-600 dark:text-gray-400">Net Self-Employment Income</span>
              <span className="font-semibold text-body-sm">{formatCurrency(inputs.annualIncome - inputs.businessExpenses)}</span>
            </div>
            <hr className="border-gray-200 dark:border-navy-600" />
            <div className="flex justify-between items-center">
              <span className="text-body-sm text-gray-600 dark:text-gray-400">Self-Employment Tax (15.3%)</span>
              <span className="font-semibold text-body-sm">{formatCurrency(result.selfEmploymentTax)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-body-sm text-gray-600 dark:text-gray-400">Federal Income Tax</span>
              <span className="font-semibold text-body-sm">{formatCurrency(result.federalIncomeTax)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-body-sm text-gray-600 dark:text-gray-400">State Income Tax</span>
              <span className="font-semibold text-body-sm">{formatCurrency(result.stateIncomeTax)}</span>
            </div>
            <hr className="border-gray-200 dark:border-navy-600" />
            <div className="flex justify-between items-center">
              <span className="font-heading font-semibold text-body text-navy-900 dark:text-white">Total Tax Liability</span>
              <span className="font-heading font-bold text-heading-sm text-navy-900 dark:text-white">
                {formatCurrency(result.totalTaxLiability)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-body-sm text-gray-500">Effective Tax Rate</span>
              <span className="text-body-sm font-medium">{formatPercent(result.effectiveTaxRate)}</span>
            </div>
          </div>

          {/* Quarterly payment highlight */}
          <div className="mt-4 p-5 bg-teal-50 dark:bg-teal-900/20 rounded-xl border border-teal-200 dark:border-teal-800">
            <p className="text-body-sm font-medium text-teal-800 dark:text-teal-300 mb-1">
              Estimated Quarterly Payment
            </p>
            <p className="text-display font-heading font-bold text-teal-700 dark:text-teal-400">
              {formatCurrency(result.quarterlyPayment)}
            </p>
            <p className="text-caption text-teal-600 dark:text-teal-500 mt-1">
              Due April 15, June 15, Sep 15, Jan 15
            </p>
          </div>

          {/* Take-home */}
          <div className="mt-4 p-4 bg-gray-50 dark:bg-navy-800 rounded-xl">
            <div className="flex justify-between items-center">
              <span className="text-body-sm text-gray-600 dark:text-gray-400">Estimated Take-Home Pay</span>
              <span className="font-heading font-bold text-heading-sm text-navy-900 dark:text-white">
                {formatCurrency(result.netIncome)}
              </span>
            </div>
            <p className="text-caption text-gray-400 mt-1">
              That is approximately {formatCurrency(Math.round(result.netIncome / 12))}/month
            </p>
          </div>

          {/* CTAs */}
          <div className="mt-6 space-y-3">
            <EmailCapture
              source="tax-estimator"
              title="Email me these results"
              description="We will send a PDF breakdown plus tips to reduce your tax bill."
              buttonText="Email Results"
              variant="inline"
            />
            <Link href="/auth/register" className="btn-primary w-full text-body-sm">
              Open a free account to auto-save for taxes
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
