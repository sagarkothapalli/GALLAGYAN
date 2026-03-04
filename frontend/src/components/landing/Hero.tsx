'use client';

import Link from 'next/link';
import { ArrowRight, Play, Shield, Zap, TrendingUp } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative overflow-hidden gradient-bg text-white">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-500 rounded-full blur-[128px]" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-400 rounded-full blur-[160px]" />
      </div>

      <div className="container-wide relative">
        <div className="pt-16 pb-20 md:pt-24 md:pb-30 lg:pt-30 lg:pb-36">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/10 border border-teal-500/20 rounded-full mb-8">
              <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse-slow" />
              <span className="text-body-sm text-teal-300 font-medium">
                Built for freelancers and micro-businesses
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-display-lg md:text-display-xl font-heading font-bold mb-6 text-balance">
              Stop overpaying taxes.{' '}
              <span className="gradient-text">Start getting paid on time.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-body-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto text-balance">
              SteadyStack combines smart financial tools, plain-English education, and purpose-built
              banking to help you keep more of what you earn.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link href="/auth/register" className="btn-primary text-lg !px-8 !py-4 w-full sm:w-auto">
                Start free — takes 5 minutes
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link
                href="/learn/calculators"
                className="btn-secondary !border-white/20 !text-white hover:!bg-white/10 w-full sm:w-auto"
              >
                <Play className="w-5 h-5 mr-2" />
                Try the Tax Calculator
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-body-sm text-gray-400">
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-teal-400" />
                Bank-level security
              </span>
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-teal-400" />
                5 min setup
              </span>
              <span className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-teal-400" />
                Used by 10,000+ freelancers
              </span>
            </div>
          </div>

          {/* Hero visual — dashboard preview */}
          <div className="mt-16 mx-auto max-w-5xl">
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-navy-800/50 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 to-transparent pointer-events-none z-10" />
              {/* Simulated dashboard screenshot */}
              <div className="p-6 md:p-8">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[
                    { label: 'Account Balance', value: '$12,847', change: '+$3,500 this week' },
                    { label: 'Tax Set Aside', value: '$4,215', change: '30% auto-saved' },
                    { label: 'Emergency Fund', value: '59%', change: '$14,200 / $24,000' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-navy-700/50 rounded-xl p-4 border border-navy-600/50">
                      <p className="text-caption text-gray-400 mb-1">{stat.label}</p>
                      <p className="text-heading font-heading font-bold text-white">{stat.value}</p>
                      <p className="text-caption text-teal-400 mt-1">{stat.change}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-navy-700/50 rounded-xl p-4 border border-navy-600/50 h-32">
                    <p className="text-body-sm font-medium text-gray-300 mb-3">Income This Month</p>
                    <div className="flex items-end gap-1 h-16">
                      {[40, 65, 45, 80, 55, 70, 90, 60, 85, 75, 95, 50].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-teal-500/60 rounded-t"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="bg-navy-700/50 rounded-xl p-4 border border-navy-600/50 h-32">
                    <p className="text-body-sm font-medium text-gray-300 mb-2">Your Learning Path</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-caption">
                        <span className="text-gray-400">Income Smoothing</span>
                        <span className="text-teal-400">7/24</span>
                      </div>
                      <div className="h-2 bg-navy-600 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-500 rounded-full" style={{ width: '29%' }} />
                      </div>
                      <p className="text-caption text-gray-500">5-day streak</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
