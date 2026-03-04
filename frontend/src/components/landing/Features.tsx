import {
  Calculator,
  PiggyBank,
  BarChart3,
  BookOpen,
  Shield,
  Wallet,
} from 'lucide-react';

const features = [
  {
    icon: Calculator,
    title: 'Smart Tax Estimation',
    description:
      'Know exactly what to set aside each quarter. Our calculator accounts for self-employment tax, federal brackets, and your state rate.',
  },
  {
    icon: BarChart3,
    title: 'Income Smoothing',
    description:
      'End the feast-or-famine cycle. We help you calculate a salary floor and build a buffer so you get paid consistently, every month.',
  },
  {
    icon: PiggyBank,
    title: 'Automated Savings',
    description:
      'Auto-transfer a percentage of every payment to your tax savings and emergency fund. Set it once, never worry again.',
  },
  {
    icon: BookOpen,
    title: 'Financial Education',
    description:
      'Learn the money skills they never teach freelancers. Calculators, guides, and a personalized learning path based on your situation.',
  },
  {
    icon: Wallet,
    title: '3-Account System',
    description:
      'Business checking. Tax savings. Personal draw. We walk you through setting up the account structure that top freelancers use.',
  },
  {
    icon: Shield,
    title: 'Compliance Made Simple',
    description:
      'From 1099-K reporting to quarterly deadlines, we keep you informed and on track so tax season is never a surprise.',
  },
];

export function Features() {
  return (
    <section id="features" className="section-padding">
      <div className="container-wide">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="badge-teal mb-4">Features</span>
          <h2 className="text-heading-xl md:text-display font-heading mb-4 text-navy-900 dark:text-white">
            Everything a freelancer needs,{' '}
            <span className="gradient-text">nothing they don&apos;t</span>
          </h2>
          <p className="text-body-lg text-gray-600 dark:text-gray-400">
            Built specifically for people who earn their own way. No corporate bloat,
            no confusing jargon — just tools that actually help.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div key={feature.title} className="card p-6 group">
              <div className="w-12 h-12 bg-teal-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-teal-500/20 transition-colors">
                <feature.icon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className="font-heading font-semibold text-heading-sm text-navy-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-body-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
