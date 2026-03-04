import Link from 'next/link';
import { Check, X, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PRICING_PLANS } from '@/data/pricing-plans';

export function PricingPreview() {
  return (
    <section className="section-padding bg-gray-50 dark:bg-navy-900">
      <div className="container-wide">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="badge-teal mb-4">Pricing</span>
          <h2 className="text-heading-xl md:text-display font-heading mb-4 text-navy-900 dark:text-white">
            Start free, upgrade when ready
          </h2>
          <p className="text-body-lg text-gray-600 dark:text-gray-400">
            No credit card required. Try the free plan with basic tools and education,
            then upgrade for unlimited access and personalized coaching.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PRICING_PLANS.map((plan) => (
            <div
              key={plan.tier}
              className={cn(
                'card p-6 relative flex flex-col',
                plan.highlighted && 'ring-2 ring-teal-500 shadow-glow'
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
                <h3 className="font-heading font-bold text-heading text-navy-900 dark:text-white">{plan.name}</h3>
                <p className="text-body-sm text-gray-500 dark:text-gray-400 mt-1">{plan.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-display font-heading font-bold text-navy-900 dark:text-white">
                    ${plan.price}
                  </span>
                  {plan.price > 0 && <span className="text-body-sm text-gray-500">/month</span>}
                </div>
                {plan.yearlyPrice > 0 && (
                  <p className="text-caption text-gray-400 mt-1">
                    ${plan.yearlyPrice}/year (save {Math.round((1 - plan.yearlyPrice / (plan.price * 12)) * 100)}%)
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.slice(0, 7).map((feature) => (
                  <li key={feature.text} className="flex items-start gap-2">
                    {feature.included ? (
                      <Check className={cn('w-4 h-4 shrink-0 mt-0.5', feature.highlight ? 'text-teal-500' : 'text-gray-400')} />
                    ) : (
                      <X className="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0 mt-0.5" />
                    )}
                    <span className={cn(
                      'text-body-sm',
                      feature.included
                        ? 'text-gray-700 dark:text-gray-300'
                        : 'text-gray-400 dark:text-gray-600'
                    )}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.tier === 'free' ? '/auth/register' : '/pricing'}
                className={cn(
                  'w-full text-center',
                  plan.highlighted ? 'btn-primary' : 'btn-secondary'
                )}
              >
                {plan.ctaText}
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/pricing" className="text-body-sm text-teal-600 dark:text-teal-400 font-medium hover:underline inline-flex items-center gap-1">
            Compare all features
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
