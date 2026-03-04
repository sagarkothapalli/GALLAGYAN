import type { QuizQuestion, FinancialPersona, PersonaInfo } from '@/types';

export const PERSONAS: Record<FinancialPersona, PersonaInfo> = {
  'new-freelancer': {
    id: 'new-freelancer',
    label: 'New Freelancer',
    tagline: 'Building your foundation',
    description:
      'You are early in your freelance journey. Your top priority is building reliable income, understanding your tax obligations, and creating a financial safety net. We will help you set up the right structure from day one.',
    color: '#00D4AA',
    icon: 'Sprout',
    recommendedTopics: [
      'Getting started with quarterly taxes',
      'The 3-Account System',
      'Setting your first freelance rate',
      'Emergency fund basics',
      'LLC vs Sole Proprietor',
    ],
  },
  'cash-flow-builder': {
    id: 'cash-flow-builder',
    label: 'Cash Flow Builder',
    tagline: 'Smoothing the feast-or-famine cycle',
    description:
      'You have income coming in, but it feels unpredictable. Your focus is on smoothing cash flow, building a salary floor, and planning for slow months. We will help you create systems for consistent income.',
    color: '#3B82F6',
    icon: 'TrendingUp',
    recommendedTopics: [
      'Income smoothing strategies',
      'The salary floor concept',
      'Cash flow forecasting',
      'Retainer pricing models',
      'Building a revenue buffer',
    ],
  },
  'tax-optimizer': {
    id: 'tax-optimizer',
    label: 'Tax Optimizer',
    tagline: 'Keeping more of what you earn',
    description:
      'You are earning well but suspect you are leaving money on the table with taxes. Your focus is on maximizing deductions, understanding estimated payments, and exploring entity structures like S-Corp.',
    color: '#F59E0B',
    icon: 'Calculator',
    recommendedTopics: [
      'S-Corp vs LLC tax analysis',
      'Maximizing business deductions',
      'Retirement accounts for freelancers',
      'Home office deduction guide',
      'Quarterly tax payment strategies',
    ],
  },
  'scale-ready': {
    id: 'scale-ready',
    label: 'Scale-Ready',
    tagline: 'Growing beyond yourself',
    description:
      'You have a stable freelance business and are thinking about growth: hiring subcontractors, raising prices, or transitioning to an agency model. We will help you make smart financial decisions as you scale.',
    color: '#8B5CF6',
    icon: 'Rocket',
    recommendedTopics: [
      'Value-based pricing mastery',
      'Hiring your first subcontractor',
      'Cross-border compliance',
      'Advanced retirement planning',
      'Building business credit',
    ],
  },
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: 'How long have you been freelancing or running your business?',
    category: 'income',
    options: [
      {
        label: 'Less than 6 months',
        value: 'beginner',
        points: { 'new-freelancer': 3, 'cash-flow-builder': 0, 'tax-optimizer': 0, 'scale-ready': 0 },
      },
      {
        label: '6 months to 2 years',
        value: 'early',
        points: { 'new-freelancer': 1, 'cash-flow-builder': 2, 'tax-optimizer': 0, 'scale-ready': 0 },
      },
      {
        label: '2 to 5 years',
        value: 'established',
        points: { 'new-freelancer': 0, 'cash-flow-builder': 1, 'tax-optimizer': 2, 'scale-ready': 1 },
      },
      {
        label: 'More than 5 years',
        value: 'veteran',
        points: { 'new-freelancer': 0, 'cash-flow-builder': 0, 'tax-optimizer': 1, 'scale-ready': 3 },
      },
    ],
  },
  {
    id: 2,
    question: 'What is your approximate annual freelance/business income?',
    category: 'income',
    options: [
      {
        label: 'Under $25,000',
        value: 'low',
        points: { 'new-freelancer': 3, 'cash-flow-builder': 1, 'tax-optimizer': 0, 'scale-ready': 0 },
      },
      {
        label: '$25,000 - $75,000',
        value: 'mid',
        points: { 'new-freelancer': 1, 'cash-flow-builder': 2, 'tax-optimizer': 1, 'scale-ready': 0 },
      },
      {
        label: '$75,000 - $150,000',
        value: 'high',
        points: { 'new-freelancer': 0, 'cash-flow-builder': 1, 'tax-optimizer': 3, 'scale-ready': 1 },
      },
      {
        label: 'Over $150,000',
        value: 'very-high',
        points: { 'new-freelancer': 0, 'cash-flow-builder': 0, 'tax-optimizer': 1, 'scale-ready': 3 },
      },
    ],
  },
  {
    id: 3,
    question: 'How predictable is your monthly income?',
    category: 'income',
    options: [
      {
        label: 'Very unpredictable - it varies wildly month to month',
        value: 'unpredictable',
        points: { 'new-freelancer': 1, 'cash-flow-builder': 3, 'tax-optimizer': 0, 'scale-ready': 0 },
      },
      {
        label: 'Somewhat unpredictable - I have busy and slow seasons',
        value: 'somewhat',
        points: { 'new-freelancer': 0, 'cash-flow-builder': 2, 'tax-optimizer': 1, 'scale-ready': 0 },
      },
      {
        label: 'Fairly predictable - I have some recurring clients',
        value: 'predictable',
        points: { 'new-freelancer': 0, 'cash-flow-builder': 0, 'tax-optimizer': 2, 'scale-ready': 1 },
      },
      {
        label: 'Very predictable - retainers or long-term contracts',
        value: 'stable',
        points: { 'new-freelancer': 0, 'cash-flow-builder': 0, 'tax-optimizer': 1, 'scale-ready': 3 },
      },
    ],
  },
  {
    id: 4,
    question: 'How do you handle your taxes today?',
    category: 'taxes',
    options: [
      {
        label: 'I have not thought about it yet',
        value: 'unaware',
        points: { 'new-freelancer': 3, 'cash-flow-builder': 0, 'tax-optimizer': 0, 'scale-ready': 0 },
      },
      {
        label: 'I know I need to pay quarterly but often miss deadlines',
        value: 'aware',
        points: { 'new-freelancer': 1, 'cash-flow-builder': 2, 'tax-optimizer': 1, 'scale-ready': 0 },
      },
      {
        label: 'I pay quarterly but I am not sure I am optimizing deductions',
        value: 'paying',
        points: { 'new-freelancer': 0, 'cash-flow-builder': 0, 'tax-optimizer': 3, 'scale-ready': 1 },
      },
      {
        label: 'I have a CPA and am exploring entity structuring',
        value: 'optimized',
        points: { 'new-freelancer': 0, 'cash-flow-builder': 0, 'tax-optimizer': 1, 'scale-ready': 3 },
      },
    ],
  },
  {
    id: 5,
    question: 'Do you have separate business and personal bank accounts?',
    category: 'planning',
    options: [
      {
        label: 'No, everything is in one account',
        value: 'none',
        points: { 'new-freelancer': 3, 'cash-flow-builder': 1, 'tax-optimizer': 0, 'scale-ready': 0 },
      },
      {
        label: 'I have a separate checking but no savings system',
        value: 'basic',
        points: { 'new-freelancer': 1, 'cash-flow-builder': 2, 'tax-optimizer': 0, 'scale-ready': 0 },
      },
      {
        label: 'I use the 3-account system (checking, tax, personal draw)',
        value: 'structured',
        points: { 'new-freelancer': 0, 'cash-flow-builder': 0, 'tax-optimizer': 2, 'scale-ready': 1 },
      },
      {
        label: 'I have multiple accounts with automated transfers',
        value: 'advanced',
        points: { 'new-freelancer': 0, 'cash-flow-builder': 0, 'tax-optimizer': 1, 'scale-ready': 3 },
      },
    ],
  },
  {
    id: 6,
    question: 'How much do you have in an emergency fund?',
    category: 'planning',
    options: [
      {
        label: 'Nothing set aside specifically',
        value: 'none',
        points: { 'new-freelancer': 3, 'cash-flow-builder': 1, 'tax-optimizer': 0, 'scale-ready': 0 },
      },
      {
        label: 'Less than 3 months of expenses',
        value: 'low',
        points: { 'new-freelancer': 1, 'cash-flow-builder': 3, 'tax-optimizer': 0, 'scale-ready': 0 },
      },
      {
        label: '3-6 months of expenses',
        value: 'moderate',
        points: { 'new-freelancer': 0, 'cash-flow-builder': 1, 'tax-optimizer': 2, 'scale-ready': 1 },
      },
      {
        label: '6+ months of expenses',
        value: 'strong',
        points: { 'new-freelancer': 0, 'cash-flow-builder': 0, 'tax-optimizer': 1, 'scale-ready': 3 },
      },
    ],
  },
  {
    id: 7,
    question: 'How do you currently price your services?',
    category: 'income',
    options: [
      {
        label: 'I charge what seems reasonable and hope for the best',
        value: 'guessing',
        points: { 'new-freelancer': 3, 'cash-flow-builder': 1, 'tax-optimizer': 0, 'scale-ready': 0 },
      },
      {
        label: 'Hourly rate based on what others charge',
        value: 'hourly',
        points: { 'new-freelancer': 1, 'cash-flow-builder': 2, 'tax-optimizer': 1, 'scale-ready': 0 },
      },
      {
        label: 'Project-based pricing with clear scope',
        value: 'project',
        points: { 'new-freelancer': 0, 'cash-flow-builder': 0, 'tax-optimizer': 2, 'scale-ready': 1 },
      },
      {
        label: 'Value-based pricing tied to client outcomes',
        value: 'value',
        points: { 'new-freelancer': 0, 'cash-flow-builder': 0, 'tax-optimizer': 0, 'scale-ready': 3 },
      },
    ],
  },
  {
    id: 8,
    question: 'What is your biggest financial stress right now?',
    category: 'mindset',
    options: [
      {
        label: 'Not knowing if I can make this work financially',
        value: 'viability',
        points: { 'new-freelancer': 3, 'cash-flow-builder': 1, 'tax-optimizer': 0, 'scale-ready': 0 },
      },
      {
        label: 'Inconsistent income making it hard to plan',
        value: 'inconsistency',
        points: { 'new-freelancer': 0, 'cash-flow-builder': 3, 'tax-optimizer': 0, 'scale-ready': 0 },
      },
      {
        label: 'Feeling like I am paying too much in taxes',
        value: 'taxes',
        points: { 'new-freelancer': 0, 'cash-flow-builder': 0, 'tax-optimizer': 3, 'scale-ready': 0 },
      },
      {
        label: 'Figuring out how to grow without burning out',
        value: 'growth',
        points: { 'new-freelancer': 0, 'cash-flow-builder': 0, 'tax-optimizer': 0, 'scale-ready': 3 },
      },
    ],
  },
  {
    id: 9,
    question: 'Do you track your business expenses?',
    category: 'expenses',
    options: [
      {
        label: 'Not really - I will figure it out at tax time',
        value: 'none',
        points: { 'new-freelancer': 3, 'cash-flow-builder': 1, 'tax-optimizer': 0, 'scale-ready': 0 },
      },
      {
        label: 'I save receipts but do not have a system',
        value: 'basic',
        points: { 'new-freelancer': 1, 'cash-flow-builder': 2, 'tax-optimizer': 1, 'scale-ready': 0 },
      },
      {
        label: 'I use a spreadsheet or app regularly',
        value: 'organized',
        points: { 'new-freelancer': 0, 'cash-flow-builder': 0, 'tax-optimizer': 2, 'scale-ready': 1 },
      },
      {
        label: 'Automated bookkeeping with regular financial reviews',
        value: 'automated',
        points: { 'new-freelancer': 0, 'cash-flow-builder': 0, 'tax-optimizer': 1, 'scale-ready': 3 },
      },
    ],
  },
  {
    id: 10,
    question: 'What would help you most right now?',
    category: 'planning',
    options: [
      {
        label: 'A clear roadmap for getting my finances set up right',
        value: 'setup',
        points: { 'new-freelancer': 3, 'cash-flow-builder': 1, 'tax-optimizer': 0, 'scale-ready': 0 },
      },
      {
        label: 'Tools to predict and smooth my income',
        value: 'smoothing',
        points: { 'new-freelancer': 0, 'cash-flow-builder': 3, 'tax-optimizer': 0, 'scale-ready': 0 },
      },
      {
        label: 'Strategies to reduce my tax bill legally',
        value: 'tax-strategy',
        points: { 'new-freelancer': 0, 'cash-flow-builder': 0, 'tax-optimizer': 3, 'scale-ready': 0 },
      },
      {
        label: 'Financial planning for scaling my business',
        value: 'scaling',
        points: { 'new-freelancer': 0, 'cash-flow-builder': 0, 'tax-optimizer': 0, 'scale-ready': 3 },
      },
    ],
  },
];

export function calculatePersonaFromAnswers(
  answers: Record<number, string>
): { persona: FinancialPersona; scores: Record<FinancialPersona, number>; healthScore: number } {
  const scores: Record<FinancialPersona, number> = {
    'new-freelancer': 0,
    'cash-flow-builder': 0,
    'tax-optimizer': 0,
    'scale-ready': 0,
  };

  // Tally points from all answers
  for (const [questionId, answerValue] of Object.entries(answers)) {
    const question = QUIZ_QUESTIONS.find((q) => q.id === Number(questionId));
    if (!question) continue;
    const option = question.options.find((o) => o.value === answerValue);
    if (!option) continue;
    for (const [persona, points] of Object.entries(option.points)) {
      scores[persona as FinancialPersona] += points;
    }
  }

  // Find winning persona
  const persona = (Object.entries(scores) as [FinancialPersona, number][]).reduce(
    (best, [p, s]) => (s > best[1] ? [p, s] : best),
    ['new-freelancer', 0] as [FinancialPersona, number]
  )[0];

  // Calculate health score (0-100) based on how "advanced" the answers are
  const maxPossibleScore = QUIZ_QUESTIONS.length * 3; // Max 3 points per question for scale-ready
  const advancedScore = scores['tax-optimizer'] + scores['scale-ready'];
  const healthScore = Math.round((advancedScore / maxPossibleScore) * 100);

  return { persona, scores, healthScore: Math.min(100, Math.max(10, healthScore)) };
}

export function getStrengthsAndImprovements(
  persona: FinancialPersona,
  healthScore: number
): { strengths: string[]; improvements: string[] } {
  const strengthsMap: Record<FinancialPersona, string[]> = {
    'new-freelancer': [
      'Taking the initiative to understand your finances early',
      'Open to learning and building good habits from the start',
    ],
    'cash-flow-builder': [
      'Awareness of income patterns and seasonality',
      'Active in seeking stability and planning ahead',
    ],
    'tax-optimizer': [
      'Strong income generation and expense tracking',
      'Proactive about reducing tax burden legally',
    ],
    'scale-ready': [
      'Solid financial foundation with systems in place',
      'Strategic thinking about growth and efficiency',
    ],
  };

  const improvementsMap: Record<FinancialPersona, string[]> = {
    'new-freelancer': [
      'Set up separate business and personal accounts',
      'Start saving 25-30% of income for taxes immediately',
      'Build a 3-month emergency fund as your first goal',
    ],
    'cash-flow-builder': [
      'Implement a salary floor to smooth monthly income',
      'Explore retainer or recurring revenue models',
      'Grow your emergency fund to 6+ months',
    ],
    'tax-optimizer': [
      'Evaluate S-Corp election if earning over $80K',
      'Maximize retirement contributions (SEP-IRA or Solo 401k)',
      'Consider hiring a CPA for entity structure review',
    ],
    'scale-ready': [
      'Develop value-based pricing for premium positioning',
      'Explore hiring subcontractors to increase capacity',
      'Plan for cross-border opportunities if applicable',
    ],
  };

  return {
    strengths: strengthsMap[persona] || [],
    improvements: improvementsMap[persona] || [],
  };
}
