/* ============================================================
   SteadyStack — Core Type Definitions
   ============================================================ */

// ── Financial Personas ──────────────────────────────────────
export type FinancialPersona =
  | 'new-freelancer'
  | 'cash-flow-builder'
  | 'tax-optimizer'
  | 'scale-ready';

export interface PersonaInfo {
  id: FinancialPersona;
  label: string;
  tagline: string;
  description: string;
  color: string;
  icon: string;
  recommendedTopics: string[];
}

// ── User ────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  fullName: string;
  businessType?: 'freelancer' | 'micro-smb' | 'side-hustle';
  incomeRange?: string;
  persona?: FinancialPersona;
  painPoints?: string[];
  subscriptionTier: 'free' | 'pro' | 'premium';
  onboardingCompleted: boolean;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// ── Education Content ───────────────────────────────────────
export interface Article {
  _id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: unknown; // Portable Text
  category: ArticleCategory;
  level: 'beginner' | 'intermediate' | 'advanced';
  format: 'article' | 'video' | 'calculator' | 'quiz';
  readTime: number;
  publishedAt: string;
  updatedAt: string;
  author: Author;
  featuredImage?: SanityImage;
  seoTitle?: string;
  seoDescription?: string;
  tags: string[];
  relatedArticles?: Article[];
}

export type ArticleCategory =
  | 'taxes'
  | 'cash-flow'
  | 'pricing'
  | 'savings'
  | 'business-structure'
  | 'compliance'
  | 'mental-health';

export interface Author {
  _id: string;
  name: string;
  title: string;
  bio: string;
  avatar?: SanityImage;
}

export interface SanityImage {
  _type: 'image';
  asset: {
    _ref: string;
    _type: 'reference';
  };
  alt?: string;
}

// ── Calculators ─────────────────────────────────────────────
export interface TaxEstimatorInputs {
  annualIncome: number;
  businessExpenses: number;
  state: string;
  filingStatus: 'single' | 'married' | 'head-of-household';
  quarterlyPaymentsMade: number;
}

export interface TaxEstimatorResult {
  selfEmploymentTax: number;
  federalIncomeTax: number;
  stateIncomeTax: number;
  totalTaxLiability: number;
  effectiveTaxRate: number;
  quarterlyPayment: number;
  deductibleExpenses: number;
  netIncome: number;
}

export interface EmergencyFundInputs {
  monthlyExpenses: number;
  monthlyIncome: number;
  incomeStability: 1 | 2 | 3 | 4 | 5; // 1 = very unstable, 5 = very stable
  dependents: number;
  currentSavings: number;
}

export interface EmergencyFundResult {
  recommendedMonths: number;
  targetAmount: number;
  currentProgress: number;
  monthlyContribution: number;
  monthsToGoal: number;
}

export interface PricingConverterInputs {
  hoursWorkedPerWeek: number;
  weeksWorkedPerYear: number;
  desiredAnnualIncome: number;
  annualOverhead: number;
  profitMargin: number;
  nonBillablePercent: number;
}

export interface PricingConverterResult {
  minimumHourlyRate: number;
  recommendedHourlyRate: number;
  dailyRate: number;
  weeklyRate: number;
  monthlyRate: number;
  projectRate10h: number;
  projectRate40h: number;
  effectiveBillableHours: number;
  revenuePerBillableHour: number;
}

// ── Quiz ────────────────────────────────────────────────────
export interface QuizQuestion {
  id: number;
  question: string;
  options: QuizOption[];
  category: 'income' | 'expenses' | 'taxes' | 'planning' | 'mindset';
}

export interface QuizOption {
  label: string;
  value: string;
  points: Record<FinancialPersona, number>;
}

export interface QuizResult {
  persona: FinancialPersona;
  scores: Record<FinancialPersona, number>;
  healthScore: number; // 0-100
  strengths: string[];
  improvements: string[];
  recommendations: Article[];
}

// ── Dashboard ───────────────────────────────────────────────
export interface DashboardData {
  balance: number;
  recentTransactions: Transaction[];
  savingsGoals: SavingsGoal[];
  learningProgress: LearningProgress;
  nudges: EducationNudge[];
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  date: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
}

export interface LearningProgress {
  persona: FinancialPersona;
  level: number; // 1-5
  lessonsCompleted: number;
  totalLessons: number;
  currentModule: string;
  streak: number;
}

export interface EducationNudge {
  id: string;
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  type: 'tip' | 'milestone' | 'action' | 'warning';
  priority: number;
}

// ── Subscription ────────────────────────────────────────────
export type SubscriptionTier = 'free' | 'pro' | 'premium';

export interface PricingPlan {
  tier: SubscriptionTier;
  name: string;
  price: number;
  yearlyPrice: number;
  description: string;
  features: PlanFeature[];
  highlighted?: boolean;
  ctaText: string;
}

export interface PlanFeature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

// ── API ─────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
}

// ── Onboarding ──────────────────────────────────────────────
export interface OnboardingState {
  step: number;
  businessType: string;
  incomeRange: string;
  painPoints: string[];
  persona: FinancialPersona | null;
  taxSavingsPercent: number;
}
