'use client';

import Link from 'next/link';
import {
  DollarSign,
  TrendingUp,
  PiggyBank,
  BookOpen,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Calculator,
  AlertTriangle,
  Trophy,
  Lightbulb,
  Flame,
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { MOCK_DASHBOARD } from '@/data/mock-dashboard';
import { PERSONAS } from '@/data/quiz-questions';

export function DashboardView() {
  const data = MOCK_DASHBOARD;
  const persona = PERSONAS[data.learningProgress.persona];

  return (
    <div className="bg-gray-50 dark:bg-navy-950 min-h-screen">
      {/* Header */}
      <div className="bg-white dark:bg-navy-900 border-b border-gray-200 dark:border-navy-800">
        <div className="container-wide py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading font-bold text-heading-lg text-navy-900 dark:text-white">
                Good morning
              </h1>
              <p className="text-body-sm text-gray-500 mt-1">
                Here is your financial overview for today.
              </p>
            </div>
            <Link href="/learn/calculators" className="btn-secondary text-body-sm hidden sm:flex">
              <Calculator className="w-4 h-4 mr-2" />
              Calculators
            </Link>
          </div>
        </div>
      </div>

      <div className="container-wide py-8">
        {/* Nudges */}
        {data.nudges.length > 0 && (
          <div className="grid gap-4 mb-8">
            {data.nudges.slice(0, 2).map((nudge) => {
              const iconMap = {
                warning: AlertTriangle,
                milestone: Trophy,
                tip: Lightbulb,
                action: ArrowRight,
              };
              const colorMap = {
                warning: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
                milestone: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
                tip: 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800',
                action: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
              };
              const iconColorMap = {
                warning: 'text-amber-600',
                milestone: 'text-purple-600',
                tip: 'text-teal-600',
                action: 'text-blue-600',
              };
              const Icon = iconMap[nudge.type];
              return (
                <div key={nudge.id} className={cn('rounded-xl border p-4 flex items-start gap-4', colorMap[nudge.type])}>
                  <Icon className={cn('w-5 h-5 shrink-0 mt-0.5', iconColorMap[nudge.type])} />
                  <div className="flex-1">
                    <p className="font-heading font-semibold text-body-sm text-navy-900 dark:text-white">{nudge.title}</p>
                    <p className="text-body-sm text-gray-600 dark:text-gray-400 mt-0.5">{nudge.description}</p>
                  </div>
                  <Link href={nudge.ctaLink} className="btn-ghost text-body-sm shrink-0 !px-3 !py-1.5">
                    {nudge.ctaText}
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: 'Account Balance',
              value: formatCurrency(data.balance),
              icon: DollarSign,
              trend: '+$3,500 this week',
              trendUp: true,
            },
            {
              label: 'Income This Month',
              value: formatCurrency(7500),
              icon: TrendingUp,
              trend: '+15% vs last month',
              trendUp: true,
            },
            {
              label: 'Tax Set Aside',
              value: formatCurrency(3150),
              icon: PiggyBank,
              trend: '30% auto-saved',
              trendUp: true,
            },
            {
              label: 'Learning Streak',
              value: `${data.learningProgress.streak} days`,
              icon: Flame,
              trend: 'Keep it going!',
              trendUp: true,
            },
          ].map((stat) => (
            <div key={stat.label} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-body-sm text-gray-500">{stat.label}</span>
                <div className="p-2 bg-gray-100 dark:bg-navy-700 rounded-lg">
                  <stat.icon className="w-4 h-4 text-gray-500" />
                </div>
              </div>
              <p className="font-heading font-bold text-heading text-navy-900 dark:text-white">{stat.value}</p>
              <p className={cn('text-caption mt-1', stat.trendUp ? 'text-teal-600' : 'text-red-500')}>
                {stat.trend}
              </p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Transactions + Goals */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Transactions */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-semibold text-heading-sm text-navy-900 dark:text-white">
                  Recent Transactions
                </h2>
                <button className="text-body-sm text-teal-600 dark:text-teal-400 font-medium hover:underline">
                  View all
                </button>
              </div>
              <div className="space-y-1">
                {data.recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-navy-800 transition-colors">
                    <div className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center',
                      tx.type === 'income' && 'bg-teal-50 dark:bg-teal-900/20',
                      tx.type === 'expense' && 'bg-red-50 dark:bg-red-900/20',
                      tx.type === 'transfer' && 'bg-blue-50 dark:bg-blue-900/20',
                    )}>
                      {tx.type === 'income' ? (
                        <ArrowDownRight className="w-5 h-5 text-teal-600" />
                      ) : tx.type === 'expense' ? (
                        <ArrowUpRight className="w-5 h-5 text-red-500" />
                      ) : (
                        <ArrowRight className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-body-sm font-medium text-navy-900 dark:text-white truncate">
                        {tx.description}
                      </p>
                      <p className="text-caption text-gray-400">{tx.category} &middot; {tx.date}</p>
                    </div>
                    <span className={cn(
                      'font-heading font-semibold text-body-sm',
                      tx.amount >= 0 ? 'text-teal-600' : 'text-gray-700 dark:text-gray-300',
                    )}>
                      {tx.amount >= 0 ? '+' : ''}{formatCurrency(Math.abs(tx.amount))}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Savings Goals */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-semibold text-heading-sm text-navy-900 dark:text-white">
                  Savings Goals
                </h2>
                <button className="text-body-sm text-teal-600 dark:text-teal-400 font-medium hover:underline">
                  Edit goals
                </button>
              </div>
              <div className="space-y-5">
                {data.savingsGoals.map((goal) => {
                  const percent = (goal.currentAmount / goal.targetAmount) * 100;
                  return (
                    <div key={goal.id}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-body-sm text-navy-900 dark:text-white">{goal.name}</span>
                        <span className="text-body-sm text-gray-500">
                          {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                        </span>
                      </div>
                      <ProgressBar
                        value={percent}
                        showPercent={false}
                        size="md"
                        color={percent >= 75 ? 'teal' : percent >= 40 ? 'blue' : 'amber'}
                      />
                      <p className="text-caption text-gray-400 mt-1">
                        Target: {new Date(goal.targetDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Learning Path */}
          <div className="space-y-6">
            {/* Learning Progress */}
            <div className="card p-6" style={{ borderTop: `3px solid ${persona.color}` }}>
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="w-5 h-5" style={{ color: persona.color }} />
                <h2 className="font-heading font-semibold text-heading-sm text-navy-900 dark:text-white">
                  Your Learning Path
                </h2>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span
                  className="badge text-caption font-semibold"
                  style={{ backgroundColor: `${persona.color}15`, color: persona.color }}
                >
                  {persona.label}
                </span>
                <span className="text-caption text-gray-400">Level {data.learningProgress.level}</span>
              </div>

              <p className="text-body-sm text-gray-600 dark:text-gray-400 mb-4">
                Current module: <strong className="text-navy-900 dark:text-white">{data.learningProgress.currentModule}</strong>
              </p>

              <ProgressBar
                value={data.learningProgress.lessonsCompleted}
                max={data.learningProgress.totalLessons}
                label={`${data.learningProgress.lessonsCompleted} of ${data.learningProgress.totalLessons} lessons`}
                color="teal"
                className="mb-4"
              />

              <Link href="/learn" className="btn-primary w-full text-body-sm">
                Continue Learning
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>

            {/* Quick calculator access */}
            <div className="card p-6">
              <h3 className="font-heading font-semibold text-body text-navy-900 dark:text-white mb-4">
                Quick Tools
              </h3>
              <div className="space-y-2">
                {[
                  { label: 'Tax Estimator', href: '/learn/calculators', icon: DollarSign },
                  { label: 'Emergency Fund', href: '/learn/calculators', icon: PiggyBank },
                  { label: 'Pricing Calculator', href: '/learn/calculators', icon: TrendingUp },
                ].map((tool) => (
                  <Link
                    key={tool.label}
                    href={tool.href}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-navy-800 transition-colors"
                  >
                    <tool.icon className="w-4 h-4 text-teal-500" />
                    <span className="text-body-sm text-gray-700 dark:text-gray-300">{tool.label}</span>
                    <ArrowRight className="w-3 h-3 text-gray-400 ml-auto" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Recommended reading */}
            <div className="card p-6">
              <h3 className="font-heading font-semibold text-body text-navy-900 dark:text-white mb-4">
                Recommended for You
              </h3>
              <div className="space-y-3">
                {persona.recommendedTopics.slice(0, 3).map((topic) => (
                  <Link key={topic} href="/learn" className="block p-3 rounded-lg bg-gray-50 dark:bg-navy-800 hover:bg-gray-100 dark:hover:bg-navy-700 transition-colors">
                    <p className="text-body-sm font-medium text-navy-900 dark:text-white">{topic}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
