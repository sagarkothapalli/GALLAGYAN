import Link from 'next/link';
import { ArrowRight, BookOpen, Calculator, ClipboardCheck, Trophy } from 'lucide-react';

const educationHighlights = [
  {
    icon: Calculator,
    title: 'Interactive Calculators',
    description: 'Tax estimator, pricing converter, emergency fund planner — with real numbers, not guesses.',
    href: '/learn/calculators',
    badge: '25x conversion rate',
  },
  {
    icon: ClipboardCheck,
    title: 'Financial Health Score',
    description: 'A 10-question quiz that reveals your Financial Persona and gives you a personalized learning path.',
    href: '/learn/quiz',
    badge: 'Most popular',
  },
  {
    icon: BookOpen,
    title: 'Expert Guides',
    description: 'From quarterly taxes to S-Corp analysis, written in plain English by CPAs and financial coaches.',
    href: '/learn',
    badge: 'SEO-optimized',
  },
  {
    icon: Trophy,
    title: 'Learn and Earn',
    description: 'Complete lessons, level up your financial knowledge, and unlock premium tools as you go.',
    href: '/learn',
    badge: '47% higher engagement',
  },
];

export function EducationTeaser() {
  return (
    <section className="section-padding bg-navy-900 text-white">
      <div className="container-wide">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: content */}
          <div>
            <span className="badge bg-teal-500/10 text-teal-300 mb-4">Learn</span>
            <h2 className="text-heading-xl md:text-display font-heading mb-4">
              Financial education that{' '}
              <span className="gradient-text">actually converts</span>
            </h2>
            <p className="text-body-lg text-gray-300 mb-8">
              Most freelancers have never been taught how to manage business finances.
              Our education hub fills that gap with interactive tools, expert content,
              and personalized learning paths — and it drives our best user acquisition.
            </p>

            <div className="space-y-4">
              {educationHighlights.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors group"
                >
                  <div className="p-2 bg-teal-500/10 rounded-lg shrink-0">
                    <item.icon className="w-5 h-5 text-teal-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-heading font-semibold text-body">{item.title}</h3>
                      <span className="text-caption text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-body-sm text-gray-400">{item.description}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-teal-400 group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                </Link>
              ))}
            </div>
          </div>

          {/* Right: visual */}
          <div className="relative">
            <div className="bg-navy-800 rounded-2xl border border-navy-700 p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-teal-500/20 rounded-xl flex items-center justify-center">
                  <ClipboardCheck className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <p className="font-heading font-semibold">Your Financial Health Score</p>
                  <p className="text-caption text-gray-400">Based on your quiz results</p>
                </div>
              </div>

              {/* Score visualization */}
              <div className="flex items-center justify-center mb-6">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="8" className="text-navy-700" />
                    <circle
                      cx="60" cy="60" r="52" fill="none" stroke="url(#score-gradient)" strokeWidth="8"
                      strokeDasharray={`${0.65 * 2 * Math.PI * 52} ${2 * Math.PI * 52}`}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="score-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#00D4AA" />
                        <stop offset="100%" stopColor="#00A685" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-display font-heading font-bold text-teal-400">65</span>
                    <span className="text-caption text-gray-400">out of 100</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-navy-700/50 rounded-lg">
                  <span className="text-body-sm text-gray-300">Your Persona</span>
                  <span className="badge bg-blue-500/10 text-blue-400 text-caption">Cash Flow Builder</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-navy-700/50 rounded-lg">
                  <span className="text-body-sm text-gray-300">Next Lesson</span>
                  <span className="text-body-sm text-teal-400">Income Smoothing 101</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-navy-700/50 rounded-lg">
                  <span className="text-body-sm text-gray-300">Learning Streak</span>
                  <span className="text-body-sm text-amber-400">5 days</span>
                </div>
              </div>
            </div>

            {/* Decorative glow */}
            <div className="absolute -top-4 -right-4 w-32 h-32 bg-teal-500/20 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
