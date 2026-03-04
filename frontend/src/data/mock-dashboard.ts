import type { DashboardData } from '@/types';

export const MOCK_DASHBOARD: DashboardData = {
  balance: 12847.53,
  recentTransactions: [
    { id: 't1', description: 'Client payment - Acme Design', amount: 3500, type: 'income', category: 'Revenue', date: '2024-10-01' },
    { id: 't2', description: 'Adobe Creative Cloud', amount: -54.99, type: 'expense', category: 'Software', date: '2024-09-30' },
    { id: 't3', description: 'Tax savings transfer', amount: -1050, type: 'transfer', category: 'Tax Savings', date: '2024-09-30' },
    { id: 't4', description: 'Client payment - Bloom Agency', amount: 2200, type: 'income', category: 'Revenue', date: '2024-09-28' },
    { id: 't5', description: 'Figma subscription', amount: -15, type: 'expense', category: 'Software', date: '2024-09-27' },
    { id: 't6', description: 'Personal draw', amount: -3000, type: 'transfer', category: 'Personal', date: '2024-09-25' },
    { id: 't7', description: 'Client payment - StartupCo', amount: 1800, type: 'income', category: 'Revenue', date: '2024-09-22' },
    { id: 't8', description: 'Co-working space', amount: -250, type: 'expense', category: 'Office', date: '2024-09-20' },
  ],
  savingsGoals: [
    { id: 'g1', name: 'Emergency Fund', targetAmount: 24000, currentAmount: 14200, targetDate: '2025-06-01' },
    { id: 'g2', name: 'Q4 Tax Payment', targetAmount: 4800, currentAmount: 3150, targetDate: '2025-01-15' },
    { id: 'g3', name: 'New Equipment', targetAmount: 3000, currentAmount: 1200, targetDate: '2025-03-01' },
  ],
  learningProgress: {
    persona: 'cash-flow-builder',
    level: 2,
    lessonsCompleted: 7,
    totalLessons: 24,
    currentModule: 'Income Smoothing Fundamentals',
    streak: 5,
  },
  nudges: [
    {
      id: 'n1',
      title: 'Q4 estimated taxes are due January 15',
      description: 'Based on your income this quarter, we estimate you owe around $4,800. Use our calculator to get an exact number.',
      ctaText: 'Calculate Now',
      ctaLink: '/learn/calculators',
      type: 'warning',
      priority: 1,
    },
    {
      id: 'n2',
      title: 'Nice streak! 5 days of learning',
      description: 'You have completed 7 of 24 lessons in Income Smoothing. Keep it up to reach Level 3.',
      ctaText: 'Continue Learning',
      ctaLink: '/learn',
      type: 'milestone',
      priority: 2,
    },
    {
      id: 'n3',
      title: 'Your emergency fund is 59% funded',
      description: 'At your current pace, you will hit your $24,000 goal by June. Consider increasing your monthly contribution by $200.',
      ctaText: 'Adjust Goal',
      ctaLink: '/dashboard',
      type: 'tip',
      priority: 3,
    },
  ],
};
