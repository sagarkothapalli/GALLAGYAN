'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { TrendingUp, Landmark, ReceiptText, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import GyanHubNav from '@/components/GyanHubNav';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};
const itemVariants = {
  hidden: { y: 20, opacity: 0, scale: 0.95 },
  visible: { y: 0, opacity: 1, scale: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
};

// ─── SIP Calculator ────────────────────────────────────────────────────────
function SIPCalculator() {
  const [monthly, setMonthly] = useState(5000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);

  const months = years * 12;
  const r = rate / 12 / 100;
  const corpus = monthly * (((1 + r) ** months - 1) / r) * (1 + r);
  const invested = monthly * months;
  const returns = corpus - invested;
  const gainPct = ((returns / invested) * 100).toFixed(1);
  const investedPct = Math.round((invested / corpus) * 100);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <label className="space-y-2">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Monthly SIP (₹)</span>
          <input type="number" value={monthly} onChange={e => setMonthly(Number(e.target.value))} min={500} step={500}
            className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 px-4 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-yellow-500/40" />
        </label>
        <label className="space-y-2">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Expected Return (%/yr)</span>
          <input type="number" value={rate} onChange={e => setRate(Number(e.target.value))} min={1} max={30} step={0.5}
            className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 px-4 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-yellow-500/40" />
        </label>
        <label className="space-y-2">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Period (Years)</span>
          <input type="number" value={years} onChange={e => setYears(Number(e.target.value))} min={1} max={40}
            className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 px-4 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-yellow-500/40" />
        </label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-black/30 border border-white/5 rounded-2xl p-5">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Invested</p>
          <p className="text-2xl font-black text-white">₹{invested.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-black/30 border border-emerald-500/20 rounded-2xl p-5">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Est. Returns</p>
          <p className="text-2xl font-black text-emerald-400">+₹{Math.round(returns).toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-emerald-500 font-bold mt-1">+{gainPct}% gain</p>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-5">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Final Corpus</p>
          <p className="text-2xl font-black text-yellow-400">₹{Math.round(corpus).toLocaleString('en-IN')}</p>
        </div>
      </div>
      {/* Visual bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
          <span>Invested ({investedPct}%)</span><span>Returns ({100 - investedPct}%)</span>
        </div>
        <div className="h-3 bg-white/5 rounded-full overflow-hidden flex">
          <div className="bg-yellow-500 h-full transition-all duration-500 rounded-full" style={{ width: `${investedPct}%` }} />
          <div className="bg-emerald-500 h-full transition-all duration-500 flex-1 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// ─── FD Calculator ─────────────────────────────────────────────────────────
function FDCalculator() {
  const [principal, setPrincipal] = useState(100000);
  const [rate, setRate] = useState(7);
  const [years, setYears] = useState(3);
  const [compounding, setCompounding] = useState(4); // quarterly

  const n = compounding;
  const maturity = principal * (1 + rate / 100 / n) ** (n * years);
  const interest = maturity - principal;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="space-y-2">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Principal (₹)</span>
          <input type="number" value={principal} onChange={e => setPrincipal(Number(e.target.value))} min={1000} step={1000}
            className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 px-4 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-yellow-500/40" />
        </label>
        <label className="space-y-2">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Interest Rate (%/yr)</span>
          <input type="number" value={rate} onChange={e => setRate(Number(e.target.value))} min={1} max={15} step={0.1}
            className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 px-4 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-yellow-500/40" />
        </label>
        <label className="space-y-2">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tenure (Years)</span>
          <input type="number" value={years} onChange={e => setYears(Number(e.target.value))} min={1} max={10}
            className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 px-4 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-yellow-500/40" />
        </label>
        <label className="space-y-2">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Compounding</span>
          <select value={compounding} onChange={e => setCompounding(Number(e.target.value))}
            className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 px-4 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-yellow-500/40">
            <option value={12}>Monthly</option>
            <option value={4}>Quarterly</option>
            <option value={2}>Half-Yearly</option>
            <option value={1}>Annually</option>
          </select>
        </label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-black/30 border border-emerald-500/20 rounded-2xl p-5">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Interest Earned</p>
          <p className="text-2xl font-black text-emerald-400">+₹{Math.round(interest).toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-5">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Maturity Amount</p>
          <p className="text-2xl font-black text-yellow-400">₹{Math.round(maturity).toLocaleString('en-IN')}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Tax Estimator ─────────────────────────────────────────────────────────
function TaxEstimator() {
  const [income, setIncome] = useState(1000000);
  const [regime, setRegime] = useState<'new' | 'old'>('new');
  const [deductions80C, setDeductions80C] = useState(150000);
  const [deductions80D, setDeductions80D] = useState(25000);
  const [hra, setHra] = useState(0);

  const calcNewRegime = (inc: number) => {
    // 2025-26 new regime slabs
    const slabs = [
      { limit: 400000, rate: 0 },
      { limit: 800000, rate: 0.05 },
      { limit: 1200000, rate: 0.10 },
      { limit: 1600000, rate: 0.15 },
      { limit: 2000000, rate: 0.20 },
      { limit: 2400000, rate: 0.25 },
      { limit: Infinity, rate: 0.30 },
    ];
    let tax = 0, prev = 0;
    for (const slab of slabs) {
      if (inc <= prev) break;
      tax += (Math.min(inc, slab.limit) - prev) * slab.rate;
      prev = slab.limit;
    }
    return tax;
  };

  const calcOldRegime = (inc: number) => {
    const slabs = [
      { limit: 250000, rate: 0 },
      { limit: 500000, rate: 0.05 },
      { limit: 1000000, rate: 0.20 },
      { limit: Infinity, rate: 0.30 },
    ];
    let tax = 0, prev = 0;
    for (const slab of slabs) {
      if (inc <= prev) break;
      tax += (Math.min(inc, slab.limit) - prev) * slab.rate;
      prev = slab.limit;
    }
    return tax;
  };

  let taxableIncome = income;
  let tax = 0;
  if (regime === 'old') {
    taxableIncome = Math.max(0, income - Math.min(deductions80C, 150000) - Math.min(deductions80D, 25000) - hra - 50000);
    tax = calcOldRegime(taxableIncome);
  } else {
    taxableIncome = income - 75000; // standard deduction new regime
    tax = calcNewRegime(taxableIncome);
  }
  const cess = tax * 0.04;
  const totalTax = tax + cess;
  const effectiveRate = income > 0 ? ((totalTax / income) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-6">
      <div className="flex gap-3 p-1 bg-black/40 rounded-2xl border border-white/5 w-fit">
        {(['new', 'old'] as const).map(r => (
          <button key={r} onClick={() => setRegime(r)} className={cn(
            'px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all',
            regime === r ? 'bg-yellow-500 text-black' : 'text-slate-500 hover:text-white'
          )}>{r} Regime</button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="space-y-2">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Annual Income (₹)</span>
          <input type="number" value={income} onChange={e => setIncome(Number(e.target.value))} step={10000}
            className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 px-4 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-yellow-500/40" />
        </label>
        {regime === 'old' && <>
          <label className="space-y-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">80C Deductions (₹)</span>
            <input type="number" value={deductions80C} onChange={e => setDeductions80C(Number(e.target.value))} max={150000}
              className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 px-4 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-yellow-500/40" />
          </label>
          <label className="space-y-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">80D (Health Insurance ₹)</span>
            <input type="number" value={deductions80D} onChange={e => setDeductions80D(Number(e.target.value))} max={25000}
              className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 px-4 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-yellow-500/40" />
          </label>
          <label className="space-y-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">HRA Exemption (₹)</span>
            <input type="number" value={hra} onChange={e => setHra(Number(e.target.value))}
              className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 px-4 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-yellow-500/40" />
          </label>
        </>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-black/30 border border-white/5 rounded-2xl p-5">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Taxable Income</p>
          <p className="text-xl font-black text-white">₹{Math.max(0, taxableIncome).toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-5">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Tax + Cess</p>
          <p className="text-xl font-black text-rose-400">₹{Math.round(totalTax).toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-5">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Effective Tax Rate</p>
          <p className="text-xl font-black text-yellow-400">{effectiveRate}%</p>
        </div>
      </div>
    </div>
  );
}

// ─── Emergency Fund Calculator ──────────────────────────────────────────────
function EmergencyFundCalc() {
  const [expenses, setExpenses] = useState(40000);
  const [stability, setStability] = useState(3);
  const [dependents, setDependents] = useState(1);
  const [currentSaved, setCurrentSaved] = useState(0);

  const baseMonths = stability === 5 ? 3 : stability === 4 ? 4 : stability === 3 ? 6 : stability === 2 ? 8 : 12;
  const dependentBonus = dependents * 0.5;
  const recommendedMonths = Math.round(baseMonths + dependentBonus);
  const target = expenses * recommendedMonths;
  const shortfall = Math.max(0, target - currentSaved);
  const monthlySaving = Math.round(expenses * 0.2);
  const monthsToGoal = shortfall > 0 ? Math.ceil(shortfall / monthlySaving) : 0;
  const progressPct = Math.min(100, Math.round((currentSaved / target) * 100));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="space-y-2">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Monthly Expenses (₹)</span>
          <input type="number" value={expenses} onChange={e => setExpenses(Number(e.target.value))} min={5000} step={1000}
            className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 px-4 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-yellow-500/40" />
        </label>
        <label className="space-y-2">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Current Saved (₹)</span>
          <input type="number" value={currentSaved} onChange={e => setCurrentSaved(Number(e.target.value))} min={0} step={1000}
            className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 px-4 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-yellow-500/40" />
        </label>
        <label className="space-y-2">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Job Stability (1=Low, 5=High)</span>
          <input type="range" min={1} max={5} value={stability} onChange={e => setStability(Number(e.target.value))}
            className="w-full accent-yellow-500" />
          <div className="flex justify-between text-[10px] font-bold text-slate-600">
            <span>Freelance/Gig</span><span>Govt/PSU</span>
          </div>
        </label>
        <label className="space-y-2">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Dependents</span>
          <input type="number" value={dependents} onChange={e => setDependents(Number(e.target.value))} min={0} max={6}
            className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 px-4 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-yellow-500/40" />
        </label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-black/30 border border-white/5 rounded-2xl p-5">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Recommended Fund</p>
          <p className="text-xl font-black text-white">₹{target.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-slate-500 mt-1">{recommendedMonths} months of expenses</p>
        </div>
        <div className="bg-black/30 border border-rose-500/20 rounded-2xl p-5">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Shortfall</p>
          <p className="text-xl font-black text-rose-400">₹{shortfall.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-5">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Months to Goal</p>
          <p className="text-xl font-black text-yellow-400">{monthsToGoal > 0 ? `${monthsToGoal} mo` : 'Achieved!'}</p>
          <p className="text-[10px] text-slate-500 mt-1">Saving ₹{monthlySaving.toLocaleString('en-IN')}/mo</p>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
          <span>Progress</span><span>{progressPct}%</span>
        </div>
        <div className="h-3 bg-white/5 rounded-full overflow-hidden">
          <div className="bg-yellow-500 h-full rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
const CALCS = [
  { id: 'sip', title: 'SIP Calculator', subtitle: 'Mutual Fund Wealth Builder', icon: TrendingUp, color: 'emerald' },
  { id: 'fd', title: 'FD Returns', subtitle: 'Fixed Deposit Maturity', icon: Landmark, color: 'blue' },
  { id: 'tax', title: 'Tax Estimator', subtitle: 'Old vs New Regime (India)', icon: ReceiptText, color: 'rose' },
  { id: 'emergency', title: 'Emergency Fund', subtitle: 'Build Your Safety Net', icon: ShieldCheck, color: 'yellow' },
];

const colorMap: Record<string, string> = {
  emerald: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
  blue: 'border-blue-500/30 text-blue-400 bg-blue-500/10',
  rose: 'border-rose-500/30 text-rose-400 bg-rose-500/10',
  yellow: 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10',
};

export default function CalculatorsPage() {
  const [active, setActive] = useState('sip');

  return (
    <div className="dark">
      <div className="min-h-screen bg-[#050505] text-slate-100 font-sans">
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[10%] w-[50%] h-[50%] bg-yellow-500/8 rounded-full blur-[160px]" />
          <div className="absolute bottom-0 right-0 w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[160px]" />
        </div>

        <GyanHubNav currentPage="Calculators" />

        <div className="max-w-5xl mx-auto px-4 py-12 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-500 bg-yellow-500/10 px-3 py-1.5 rounded-full border border-yellow-500/20">Financial Tools</span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white mt-4 mb-2">Calculators</h1>
            <p className="text-slate-400 font-medium">India-specific financial calculators with real-time results.</p>
          </motion.div>

          {/* Tab switcher */}
          <motion.div variants={containerVariants} initial="hidden" animate="visible"
            className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-10 mb-8">
            {CALCS.map(c => {
              const Icon = c.icon;
              return (
                <motion.button variants={itemVariants} key={c.id} onClick={() => setActive(c.id)}
                  className={cn(
                    'p-4 rounded-[1.5rem] border text-left transition-all',
                    active === c.id
                      ? `${colorMap[c.color]} border-opacity-100`
                      : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                  )}>
                  <Icon size={18} className={active === c.id ? '' : 'text-slate-500'} />
                  <p className="text-xs font-black mt-2 text-white">{c.title}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-medium leading-tight">{c.subtitle}</p>
                </motion.button>
              );
            })}
          </motion.div>

          {/* Active calculator */}
          <motion.div key={active} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8">
            <h2 className="text-lg font-black text-white mb-6">
              {CALCS.find(c => c.id === active)?.title}
            </h2>
            {active === 'sip' && <SIPCalculator />}
            {active === 'fd' && <FDCalculator />}
            {active === 'tax' && <TaxEstimator />}
            {active === 'emergency' && <EmergencyFundCalc />}
            <p className="text-[10px] text-slate-600 font-medium mt-8 pt-6 border-t border-white/5">
              * This calculator is for educational purposes only. Results are estimates and not financial advice. Consult a SEBI-registered financial advisor for personalized guidance.
            </p>
          </motion.div>
        </div>

        <style jsx global>{`body { background-color: #050505; }`}</style>
      </div>
    </div>
  );
}
