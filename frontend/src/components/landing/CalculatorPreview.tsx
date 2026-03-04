'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { calculateTaxEstimate } from '@/lib/calculators';
import type { TaxEstimatorInputs } from '@/types';

export function CalculatorPreview() {
  const [income, setIncome] = useState(80000);
  const [expenses, setExpenses] = useState(15000);

  const result = calculateTaxEstimate({
    annualIncome: income,
    businessExpenses: expenses,
    state: 'CA',
    filingStatus: 'single',
    quarterlyPaymentsMade: 0,
  } as TaxEstimatorInputs);

  return (
    <section className="section-padding">
      <div className="container-wide">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="badge-teal mb-4">Try it now</span>
          <h2 className="text-heading-xl md:text-display font-heading mb-4 text-navy-900 dark:text-white">
            See what you owe in{' '}
            <span className="gradient-text">30 seconds</span>
          </h2>
          <p className="text-body-lg text-gray-600 dark:text-gray-400">
            Slide the bars to estimate your quarterly tax payment. No sign-up required.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="card p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Inputs */}
              <div className="space-y-6">
                <div>
                  <label className="label">Annual Income</label>
                  <input
                    type="range"
                    min={10000}
                    max={300000}
                    step={5000}
                    value={income}
                    onChange={(e) => setIncome(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-navy-700 rounded-full appearance-none cursor-pointer accent-teal-500"
                    aria-label="Annual income"
                  />
                  <div className="flex justify-between mt-2">
                    <span className="text-caption text-gray-400">$10K</span>
                    <span className="text-heading-sm font-heading font-bold text-navy-900 dark:text-white">
                      {formatCurrency(income)}
                    </span>
                    <span className="text-caption text-gray-400">$300K</span>
                  </div>
                </div>

                <div>
                  <label className="label">Business Expenses</label>
                  <input
                    type="range"
                    min={0}
                    max={100000}
                    step={1000}
                    value={expenses}
                    onChange={(e) => setExpenses(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-navy-700 rounded-full appearance-none cursor-pointer accent-teal-500"
                    aria-label="Business expenses"
                  />
                  <div className="flex justify-between mt-2">
                    <span className="text-caption text-gray-400">$0</span>
                    <span className="text-heading-sm font-heading font-bold text-navy-900 dark:text-white">
                      {formatCurrency(expenses)}
                    </span>
                    <span className="text-caption text-gray-400">$100K</span>
                  </div>
                </div>

                <p className="text-caption text-gray-400 italic">
                  Estimate shown for California, single filer. For a precise calculation with your
                  state and filing status, use the full calculator.
                </p>
              </div>

              {/* Results */}
              <div className="bg-gray-50 dark:bg-navy-800 rounded-xl p-6">
                <h3 className="font-heading font-semibold text-heading-sm text-navy-900 dark:text-white mb-4">
                  Your Estimated Tax Breakdown
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Self-Employment Tax', value: result.selfEmploymentTax, color: 'bg-red-400' },
                    { label: 'Federal Income Tax', value: result.federalIncomeTax, color: 'bg-blue-400' },
                    { label: 'State Income Tax (CA)', value: result.stateIncomeTax, color: 'bg-amber-400' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                        <span className="text-body-sm text-gray-600 dark:text-gray-400">{item.label}</span>
                      </div>
                      <span className="font-semibold text-body-sm text-navy-900 dark:text-white">
                        {formatCurrency(item.value)}
                      </span>
                    </div>
                  ))}
                  <hr className="border-gray-200 dark:border-navy-600" />
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-body text-navy-900 dark:text-white">Total Tax Liability</span>
                    <span className="font-bold text-heading-sm text-navy-900 dark:text-white">
                      {formatCurrency(result.totalTaxLiability)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-body-sm text-gray-500">Effective Tax Rate</span>
                    <span className="text-body-sm font-medium text-gray-700 dark:text-gray-300">
                      {formatPercent(result.effectiveTaxRate)}
                    </span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-teal-50 dark:bg-teal-900/20 rounded-xl border border-teal-200 dark:border-teal-800">
                  <p className="text-body-sm font-semibold text-teal-800 dark:text-teal-300 mb-1">
                    Quarterly Payment
                  </p>
                  <p className="text-heading-lg font-heading font-bold text-teal-700 dark:text-teal-400">
                    {formatCurrency(result.quarterlyPayment)}
                  </p>
                  <p className="text-caption text-teal-600 dark:text-teal-500 mt-1">
                    Set this aside every quarter to stay on track
                  </p>
                </div>

                <Link
                  href="/learn/calculators"
                  className="btn-primary w-full mt-4 text-body-sm"
                >
                  Get a precise calculation
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
