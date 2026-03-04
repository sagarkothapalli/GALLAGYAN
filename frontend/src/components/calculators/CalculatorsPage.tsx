'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Calculator, DollarSign, PiggyBank, Tag } from 'lucide-react';
import { TaxEstimator } from './TaxEstimator';
import { EmergencyFundCalc } from './EmergencyFundCalc';
import { PricingConverter } from './PricingConverter';
import { Disclaimer } from '@/components/shared/Disclaimer';

const calculators = [
  {
    id: 'tax',
    label: 'Tax Estimator',
    icon: DollarSign,
    description: 'Estimate your quarterly self-employment tax payment',
  },
  {
    id: 'emergency',
    label: 'Emergency Fund',
    icon: PiggyBank,
    description: 'Calculate how much runway you need and a plan to get there',
  },
  {
    id: 'pricing',
    label: 'Pricing Converter',
    icon: Tag,
    description: 'Find your ideal hourly, daily, and project rates',
  },
];

export function CalculatorsPage() {
  const [activeCalc, setActiveCalc] = useState('tax');

  return (
    <>
      {/* Hero */}
      <section className="gradient-bg text-white py-12 md:py-16">
        <div className="container-wide text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-500/10 border border-teal-500/20 rounded-full mb-4">
            <Calculator className="w-4 h-4 text-teal-400" />
            <span className="text-body-sm text-teal-300 font-medium">Interactive Calculators</span>
          </div>
          <h1 className="text-display-lg font-heading mb-4">
            Get real numbers, <span className="gradient-text">not guesses</span>
          </h1>
          <p className="text-body-lg text-gray-300 max-w-2xl mx-auto">
            Our calculators use actual tax brackets, real math, and your specific inputs
            to give you numbers you can act on today.
          </p>
        </div>
      </section>

      {/* Calculator tabs */}
      <section className="section-padding">
        <div className="container-wide">
          <Disclaimer variant="banner" className="mb-8" />

          {/* Tab selector */}
          <div className="flex flex-wrap gap-3 mb-8">
            {calculators.map((calc) => (
              <button
                key={calc.id}
                onClick={() => setActiveCalc(calc.id)}
                className={cn(
                  'flex items-center gap-3 px-5 py-3 rounded-xl border-2 transition-all',
                  activeCalc === calc.id
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400'
                    : 'border-gray-200 dark:border-navy-700 hover:border-gray-300 dark:hover:border-navy-600'
                )}
              >
                <calc.icon className={cn('w-5 h-5', activeCalc === calc.id ? 'text-teal-500' : 'text-gray-400')} />
                <div className="text-left">
                  <p className="font-heading font-semibold text-body-sm">{calc.label}</p>
                  <p className="text-caption text-gray-500 hidden sm:block">{calc.description}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Active calculator */}
          <div className="animate-fade-in">
            {activeCalc === 'tax' && <TaxEstimator />}
            {activeCalc === 'emergency' && <EmergencyFundCalc />}
            {activeCalc === 'pricing' && <PricingConverter />}
          </div>

          <Disclaimer variant="footer" className="mt-12" />
        </div>
      </section>
    </>
  );
}
