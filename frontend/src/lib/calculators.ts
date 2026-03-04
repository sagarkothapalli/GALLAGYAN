/* ============================================================
   Calculator Logic — Real-time computation engines
   ============================================================ */

import type {
  TaxEstimatorInputs,
  TaxEstimatorResult,
  EmergencyFundInputs,
  EmergencyFundResult,
  PricingConverterInputs,
  PricingConverterResult,
} from '@/types';

// ── Federal Tax Brackets 2024 (Single) ─────────────────────
const FEDERAL_BRACKETS_SINGLE = [
  { min: 0, max: 11600, rate: 0.10 },
  { min: 11600, max: 47150, rate: 0.12 },
  { min: 47150, max: 100525, rate: 0.22 },
  { min: 100525, max: 191950, rate: 0.24 },
  { min: 191950, max: 243725, rate: 0.32 },
  { min: 243725, max: 609350, rate: 0.35 },
  { min: 609350, max: Infinity, rate: 0.37 },
];

const FEDERAL_BRACKETS_MARRIED = [
  { min: 0, max: 23200, rate: 0.10 },
  { min: 23200, max: 94300, rate: 0.12 },
  { min: 94300, max: 201050, rate: 0.22 },
  { min: 201050, max: 383900, rate: 0.24 },
  { min: 383900, max: 487450, rate: 0.32 },
  { min: 487450, max: 731200, rate: 0.35 },
  { min: 731200, max: Infinity, rate: 0.37 },
];

// Simplified state tax rates (flat approximation)
const STATE_TAX_RATES: Record<string, number> = {
  AL: 0.05, AK: 0, AZ: 0.025, AR: 0.044, CA: 0.093, CO: 0.044,
  CT: 0.05, DE: 0.066, FL: 0, GA: 0.055, HI: 0.072, ID: 0.058,
  IL: 0.0495, IN: 0.0315, IA: 0.06, KS: 0.057, KY: 0.045, LA: 0.0425,
  ME: 0.0715, MD: 0.0575, MA: 0.05, MI: 0.0425, MN: 0.0985, MS: 0.05,
  MO: 0.048, MT: 0.0675, NE: 0.0664, NV: 0, NH: 0, NJ: 0.0637,
  NM: 0.059, NY: 0.0685, NC: 0.0475, ND: 0.029, OH: 0.04, OK: 0.0475,
  OR: 0.099, PA: 0.0307, RI: 0.0599, SC: 0.065, SD: 0, TN: 0,
  TX: 0, UT: 0.0485, VT: 0.0875, VA: 0.0575, WA: 0, WV: 0.065,
  WI: 0.0765, WY: 0, DC: 0.085,
};

const SE_TAX_RATE = 0.153; // 15.3% self-employment tax
const SE_DEDUCTION_RATE = 0.9235; // Only 92.35% of net earnings subject to SE tax
const SE_TAX_DEDUCTION = 0.5; // Can deduct half of SE tax
const STANDARD_DEDUCTION_SINGLE = 14600;
const STANDARD_DEDUCTION_MARRIED = 29200;

function calculateBracketTax(
  taxableIncome: number,
  brackets: typeof FEDERAL_BRACKETS_SINGLE
): number {
  let tax = 0;
  for (const bracket of brackets) {
    if (taxableIncome <= 0) break;
    const taxableInBracket = Math.min(taxableIncome, bracket.max - bracket.min);
    tax += taxableInBracket * bracket.rate;
    taxableIncome -= taxableInBracket;
  }
  return tax;
}

export function calculateTaxEstimate(inputs: TaxEstimatorInputs): TaxEstimatorResult {
  const netIncome = inputs.annualIncome - inputs.businessExpenses;

  // Self-employment tax
  const seBase = netIncome * SE_DEDUCTION_RATE;
  const selfEmploymentTax = Math.max(0, seBase * SE_TAX_RATE);
  const seDeduction = selfEmploymentTax * SE_TAX_DEDUCTION;

  // Federal income tax
  const brackets =
    inputs.filingStatus === 'married'
      ? FEDERAL_BRACKETS_MARRIED
      : FEDERAL_BRACKETS_SINGLE;
  const standardDeduction =
    inputs.filingStatus === 'married'
      ? STANDARD_DEDUCTION_MARRIED
      : STANDARD_DEDUCTION_SINGLE;

  const taxableIncome = Math.max(0, netIncome - seDeduction - standardDeduction);
  const federalIncomeTax = calculateBracketTax(taxableIncome, brackets);

  // State tax
  const stateRate = STATE_TAX_RATES[inputs.state] || 0;
  const stateIncomeTax = Math.max(0, netIncome * stateRate);

  const totalTaxLiability = selfEmploymentTax + federalIncomeTax + stateIncomeTax;
  const effectiveTaxRate = inputs.annualIncome > 0 ? totalTaxLiability / inputs.annualIncome : 0;
  const quarterlyPayment = Math.max(0, (totalTaxLiability - inputs.quarterlyPaymentsMade) / 4);

  return {
    selfEmploymentTax: Math.round(selfEmploymentTax),
    federalIncomeTax: Math.round(federalIncomeTax),
    stateIncomeTax: Math.round(stateIncomeTax),
    totalTaxLiability: Math.round(totalTaxLiability),
    effectiveTaxRate,
    quarterlyPayment: Math.round(quarterlyPayment),
    deductibleExpenses: inputs.businessExpenses,
    netIncome: Math.round(netIncome - totalTaxLiability),
  };
}

export function calculateEmergencyFund(inputs: EmergencyFundInputs): EmergencyFundResult {
  // Recommended months based on income stability
  // Less stable income = more months of runway needed
  const stabilityMap: Record<number, number> = {
    1: 12, // Very unstable - need 12 months
    2: 9,
    3: 6,
    4: 5,
    5: 4, // Very stable - 4 months minimum
  };

  let recommendedMonths = stabilityMap[inputs.incomeStability] || 6;

  // Add 1 month per dependent
  recommendedMonths += inputs.dependents;

  const targetAmount = inputs.monthlyExpenses * recommendedMonths;
  const currentProgress = targetAmount > 0 ? (inputs.currentSavings / targetAmount) * 100 : 0;

  // Recommend saving 20% of income towards emergency fund
  const monthlySavingsCapacity = inputs.monthlyIncome * 0.2;
  const remaining = Math.max(0, targetAmount - inputs.currentSavings);
  const monthsToGoal = monthlySavingsCapacity > 0 ? Math.ceil(remaining / monthlySavingsCapacity) : 0;

  return {
    recommendedMonths,
    targetAmount: Math.round(targetAmount),
    currentProgress: Math.min(100, Math.round(currentProgress)),
    monthlyContribution: Math.round(monthlySavingsCapacity),
    monthsToGoal,
  };
}

export function calculatePricingConverter(inputs: PricingConverterInputs): PricingConverterResult {
  const totalHoursPerYear = inputs.hoursWorkedPerWeek * inputs.weeksWorkedPerYear;
  const nonBillableFraction = inputs.nonBillablePercent / 100;
  const effectiveBillableHours = totalHoursPerYear * (1 - nonBillableFraction);

  const totalRevenueNeeded =
    inputs.desiredAnnualIncome + inputs.annualOverhead;
  const profitMultiplier = 1 + inputs.profitMargin / 100;

  const targetRevenue = totalRevenueNeeded * profitMultiplier;
  const minimumHourlyRate =
    effectiveBillableHours > 0 ? totalRevenueNeeded / effectiveBillableHours : 0;
  const recommendedHourlyRate =
    effectiveBillableHours > 0 ? targetRevenue / effectiveBillableHours : 0;

  const dailyRate = recommendedHourlyRate * 8;
  const weeklyRate = recommendedHourlyRate * inputs.hoursWorkedPerWeek * (1 - nonBillableFraction);
  const monthlyRate = targetRevenue / 12;

  return {
    minimumHourlyRate: Math.round(minimumHourlyRate),
    recommendedHourlyRate: Math.round(recommendedHourlyRate),
    dailyRate: Math.round(dailyRate),
    weeklyRate: Math.round(weeklyRate),
    monthlyRate: Math.round(monthlyRate),
    projectRate10h: Math.round(recommendedHourlyRate * 10),
    projectRate40h: Math.round(recommendedHourlyRate * 40),
    effectiveBillableHours: Math.round(effectiveBillableHours),
    revenuePerBillableHour: Math.round(recommendedHourlyRate),
  };
}

// State list for dropdown
export const US_STATES = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' }, { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' },
  { code: 'DC', name: 'District of Columbia' }, { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' }, { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' }, { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' }, { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' }, { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' }, { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' }, { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' }, { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
];
