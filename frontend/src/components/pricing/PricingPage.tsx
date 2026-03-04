'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, X, ArrowRight, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PRICING_PLANS } from '@/data/pricing-plans';

const faqs = [
  {
    q: 'Can I switch plans at any time?',
    a: 'Yes. You can upgrade, downgrade, or cancel your plan at any time. If you downgrade, you keep access until the end of your billing period.',
  },
  {
    q: 'Is there a free trial for Pro and Premium?',
    a: 'Yes, both Pro and Premium include a 14-day free trial. No credit card required to start.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit cards, debit cards, and ACH bank transfers. All payments are processed securely through Stripe.',
  },
  {
    q: 'Are the calculators really free?',
    a: 'The Free plan includes 2 calculator uses per month. Pro and Premium plans include unlimited calculator access.',
  },
  {
    q: 'Is the financial education content written by real experts?',
    a: 'Yes. All content is written or reviewed by CPAs, certified financial planners, and experienced freelance finance coaches.',
  },
  {
    q: 'Do you provide personalized financial advice?',
    a: 'No. SteadyStack provides educational content and tools for informational purposes only. We are not registered financial advisors. For personalized advice, consult a qualified CPA or financial professional.',
  },
];

export function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      {/* Hero */}
      <section className="gradient-bg text-white py-16 md:py-24">
        <div className="container-wide text-center">
          <h1 className="text-display-lg font-heading mb-4">
            Simple, transparent <span className="gradient-text">pricing</span>
          </h1>
          <p className="text-body-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Start free and upgrade when you are ready. All plans include access to core banking features.
            No hidden fees, no surprises.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 rounded-full p-1">
            <button
              onClick={() => setAnnual(false)}
              className={cn(
                'px-4 py-2 rounded-full text-body-sm font-medium transition-colors',
                !annual ? 'bg-white text-navy-900' : 'text-gray-400 hover:text-white'
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={cn(
                'px-4 py-2 rounded-full text-body-sm font-medium transition-colors',
                annual ? 'bg-white text-navy-900' : 'text-gray-400 hover:text-white'
              )}
            >
              Annual
              <span className="ml-1 text-teal-400 text-caption font-bold">Save 20%</span>
            </button>
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="section-padding -mt-12">
        <div className="container-wide">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PRICING_PLANS.map((plan) => {
              const price = annual ? Math.round(plan.yearlyPrice / 12) : plan.price;
              return (
                <div
                  key={plan.tier}
                  className={cn(
                    'card p-6 md:p-8 relative flex flex-col',
                    plan.highlighted && 'ring-2 ring-teal-500 shadow-glow scale-[1.02]'
                  )}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-teal-500 text-navy-900 text-caption font-bold px-4 py-1 rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <h2 className="font-heading font-bold text-heading text-navy-900 dark:text-white">{plan.name}</h2>
                    <p className="text-body-sm text-gray-500 dark:text-gray-400 mt-1">{plan.description}</p>
                  </div>

                  <div className="mb-8">
                    <div className="flex items-baseline gap-1">
                      <span className="text-display font-heading font-bold text-navy-900 dark:text-white">
                        ${price}
                      </span>
                      {price > 0 && <span className="text-body-sm text-gray-500">/month</span>}
                    </div>
                    {annual && plan.yearlyPrice > 0 && (
                      <p className="text-caption text-gray-400 mt-1">
                        ${plan.yearlyPrice} billed annually
                      </p>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature.text} className="flex items-start gap-2.5">
                        {feature.included ? (
                          <Check className={cn('w-5 h-5 shrink-0 mt-0.5', feature.highlight ? 'text-teal-500' : 'text-gray-400')} />
                        ) : (
                          <X className="w-5 h-5 text-gray-300 dark:text-gray-600 shrink-0 mt-0.5" />
                        )}
                        <span
                          className={cn(
                            'text-body-sm',
                            feature.included
                              ? feature.highlight
                                ? 'text-navy-900 dark:text-white font-medium'
                                : 'text-gray-700 dark:text-gray-300'
                              : 'text-gray-400 dark:text-gray-600'
                          )}
                        >
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/auth/register"
                    className={cn('w-full text-center', plan.highlighted ? 'btn-primary' : 'btn-secondary')}
                  >
                    {plan.ctaText}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding bg-gray-50 dark:bg-navy-900">
        <div className="container-narrow max-w-3xl">
          <h2 className="font-heading font-bold text-heading-xl text-navy-900 dark:text-white mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="card overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                  aria-expanded={openFaq === i}
                >
                  <span className="font-heading font-semibold text-body text-navy-900 dark:text-white pr-4">
                    {faq.q}
                  </span>
                  <HelpCircle className={cn(
                    'w-5 h-5 shrink-0 transition-transform text-gray-400',
                    openFaq === i && 'rotate-180 text-teal-500'
                  )} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 animate-slide-down">
                    <p className="text-body-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="section-padding">
        <div className="container-narrow text-center">
          <h2 className="font-heading font-bold text-heading-xl text-navy-900 dark:text-white mb-4">
            Still have questions?
          </h2>
          <p className="text-body-lg text-gray-500 mb-6">
            Our team is happy to help. Reach out anytime.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/register" className="btn-primary">
              Start Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <a href="mailto:hello@steadystack.com" className="btn-ghost">
              Contact Sales
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
