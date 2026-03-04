'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import GyanHubNav from '@/components/GyanHubNav';

const QUESTIONS = [
  {
    q: 'How do you primarily invest your savings?',
    options: [
      { label: 'FD or Gold only', scores: { naya: 3, systematic: 1, optimizer: 0, veteran: 0 } },
      { label: 'Mutual Funds / Stocks', scores: { naya: 0, systematic: 2, optimizer: 3, veteran: 3 } },
      { label: 'Real Estate', scores: { naya: 1, systematic: 2, optimizer: 1, veteran: 2 } },
      { label: "Haven't started yet", scores: { naya: 4, systematic: 0, optimizer: 0, veteran: 0 } },
    ],
  },
  {
    q: 'Do you have an emergency fund?',
    options: [
      { label: 'Yes — 6+ months of expenses', scores: { naya: 0, systematic: 2, optimizer: 3, veteran: 3 } },
      { label: 'Yes — 1–3 months', scores: { naya: 1, systematic: 3, optimizer: 1, veteran: 1 } },
      { label: 'No', scores: { naya: 3, systematic: 1, optimizer: 0, veteran: 0 } },
      { label: "What's an emergency fund?", scores: { naya: 4, systematic: 0, optimizer: 0, veteran: 0 } },
    ],
  },
  {
    q: 'How do you handle your taxes?',
    options: [
      { label: 'CA files for me', scores: { naya: 1, systematic: 2, optimizer: 2, veteran: 3 } },
      { label: 'I file myself on ITR portal', scores: { naya: 0, systematic: 2, optimizer: 3, veteran: 3 } },
      { label: "I don't file / not sure", scores: { naya: 4, systematic: 1, optimizer: 0, veteran: 0 } },
      { label: 'Income below taxable limit', scores: { naya: 2, systematic: 2, optimizer: 0, veteran: 0 } },
    ],
  },
  {
    q: 'What is your main financial goal?',
    options: [
      { label: 'Retire early (FIRE)', scores: { naya: 0, systematic: 1, optimizer: 3, veteran: 3 } },
      { label: 'Buy a house / car', scores: { naya: 1, systematic: 3, optimizer: 2, veteran: 1 } },
      { label: "Child's education", scores: { naya: 1, systematic: 2, optimizer: 2, veteran: 3 } },
      { label: 'Just survive month to month', scores: { naya: 4, systematic: 1, optimizer: 0, veteran: 0 } },
    ],
  },
  {
    q: 'How often do you review your investments?',
    options: [
      { label: 'Daily — I track every move', scores: { naya: 0, systematic: 1, optimizer: 2, veteran: 3 } },
      { label: 'Weekly or monthly', scores: { naya: 0, systematic: 2, optimizer: 3, veteran: 2 } },
      { label: 'Rarely', scores: { naya: 2, systematic: 2, optimizer: 1, veteran: 1 } },
      { label: 'Never', scores: { naya: 4, systematic: 0, optimizer: 0, veteran: 0 } },
    ],
  },
  {
    q: 'Do you have a term life insurance policy?',
    options: [
      { label: 'Yes — adequate cover (10x income+)', scores: { naya: 0, systematic: 2, optimizer: 3, veteran: 3 } },
      { label: 'Yes — but small cover', scores: { naya: 1, systematic: 3, optimizer: 1, veteran: 1 } },
      { label: 'No', scores: { naya: 3, systematic: 1, optimizer: 0, veteran: 0 } },
      { label: 'I only have endowment/LIC', scores: { naya: 2, systematic: 1, optimizer: 1, veteran: 0 } },
    ],
  },
  {
    q: 'What % of your income do you save or invest monthly?',
    options: [
      { label: 'Less than 5%', scores: { naya: 4, systematic: 1, optimizer: 0, veteran: 0 } },
      { label: '5–15%', scores: { naya: 1, systematic: 3, optimizer: 1, veteran: 0 } },
      { label: '15–30%', scores: { naya: 0, systematic: 2, optimizer: 3, veteran: 2 } },
      { label: '30%+', scores: { naya: 0, systematic: 1, optimizer: 2, veteran: 4 } },
    ],
  },
  {
    q: 'Do you understand what you invest in?',
    options: [
      { label: 'Fully — I research everything', scores: { naya: 0, systematic: 1, optimizer: 2, veteran: 4 } },
      { label: 'Somewhat — I get the basics', scores: { naya: 0, systematic: 3, optimizer: 2, veteran: 1 } },
      { label: 'Not really', scores: { naya: 2, systematic: 2, optimizer: 0, veteran: 0 } },
      { label: 'I just follow tips / YouTube', scores: { naya: 4, systematic: 1, optimizer: 0, veteran: 0 } },
    ],
  },
  {
    q: 'Do you have a written financial plan or budget?',
    options: [
      { label: 'Yes — detailed plan + goals', scores: { naya: 0, systematic: 1, optimizer: 3, veteran: 4 } },
      { label: 'Rough idea in my head', scores: { naya: 1, systematic: 3, optimizer: 2, veteran: 1 } },
      { label: 'No', scores: { naya: 4, systematic: 1, optimizer: 0, veteran: 0 } },
      { label: "Working on it", scores: { naya: 2, systematic: 2, optimizer: 1, veteran: 0 } },
    ],
  },
  {
    q: "How would you react to a 20% market crash?",
    options: [
      { label: 'Buy more — great opportunity!', scores: { naya: 0, systematic: 1, optimizer: 2, veteran: 4 } },
      { label: 'Stay calm and hold', scores: { naya: 0, systematic: 2, optimizer: 3, veteran: 3 } },
      { label: 'Panic but do nothing', scores: { naya: 2, systematic: 2, optimizer: 1, veteran: 0 } },
      { label: 'Sell everything immediately', scores: { naya: 4, systematic: 1, optimizer: 0, veteran: 0 } },
    ],
  },
];

type PersonaKey = 'naya' | 'systematic' | 'optimizer' | 'veteran';

const PERSONAS: Record<PersonaKey, {
  name: string; hindi: string; tagline: string; description: string;
  color: string; accent: string; strengths: string[]; improvements: string[];
  reads: { title: string; slug: string }[];
}> = {
  naya: {
    name: 'Naya Niveshak',
    hindi: 'नया निवेशक',
    tagline: 'Starting the Wealth Journey',
    description: "You're at the beginning — and that's the best place to start. The biggest gains come from getting the fundamentals right early.",
    color: 'from-yellow-500 to-amber-600',
    accent: 'yellow',
    strengths: ['Open to learning', 'Early start advantage', 'No bad habits yet'],
    improvements: ['Build an emergency fund first', 'Start a small monthly SIP', 'File your ITR — even if income is low'],
    reads: [
      { title: 'What is a Demat Account and How to Open One', slug: 'demat-account-how-to-open' },
      { title: 'SIP vs Lump Sum: Which is Better for Indian Investors?', slug: 'sip-vs-lump-sum' },
      { title: 'ELSS Funds: Save Tax and Grow Wealth at the Same Time', slug: 'elss-tax-saving-funds' },
    ],
  },
  systematic: {
    name: 'Systematic Builder',
    hindi: 'व्यवस्थित निवेशक',
    tagline: 'Disciplined but With Gaps',
    description: "You've got the basics down. SIPs running, some savings — now it's time to optimize taxes, diversify, and protect your wealth.",
    color: 'from-blue-500 to-cyan-600',
    accent: 'blue',
    strengths: ['Regular investing habit', 'Basic financial hygiene', 'Goal-oriented mindset'],
    improvements: ['Optimize between old and new tax regime', 'Get adequate term insurance', 'Diversify beyond FDs'],
    reads: [
      { title: 'How Dividend Taxation Works in India (2025)', slug: 'dividend-taxation-india' },
      { title: 'ELSS Funds: Save Tax and Grow Wealth at the Same Time', slug: 'elss-tax-saving-funds' },
      { title: 'Index Funds vs Active Funds: The Data Tells the Truth', slug: 'index-funds-vs-active-funds' },
    ],
  },
  optimizer: {
    name: 'Smart Optimizer',
    hindi: 'चतुर निवेशक',
    tagline: 'Advanced — Fine-Tune Your Strategy',
    description: "You know your stuff. Focus now on tax efficiency, estate planning, and making your money work harder across asset classes.",
    color: 'from-emerald-500 to-teal-600',
    accent: 'emerald',
    strengths: ['Tax-aware investing', 'Diversified portfolio', 'Long-term thinking'],
    improvements: ['Explore NPS for tax efficiency', 'Review your asset allocation annually', 'Consider international diversification'],
    reads: [
      { title: 'Short Term vs Long Term Capital Gains Tax in India', slug: 'ltcg-stcg-capital-gains-india' },
      { title: 'How to File ITR for Stock Market Income in India', slug: 'itr-for-stock-market-income' },
      { title: 'Understanding Sectoral Rotation in Indian Markets', slug: 'sectoral-rotation-india' },
    ],
  },
  veteran: {
    name: 'Market Veteran',
    hindi: 'अनुभवी निवेशक',
    tagline: 'High Skill — Protect and Grow',
    description: "You've mastered the game. Now focus on wealth preservation, succession planning, and helping others in your circle level up.",
    color: 'from-purple-500 to-violet-600',
    accent: 'purple',
    strengths: ['Deep market knowledge', 'Disciplined risk management', 'Compound interest working for you'],
    improvements: ['Review will and nominations', 'Explore structured products', 'Give back — mentor new investors'],
    reads: [
      { title: "What is F&O Trading and Why 90% Traders Lose Money", slug: 'fo-trading-risks' },
      { title: 'Understanding Sectoral Rotation in Indian Markets', slug: 'sectoral-rotation-india' },
      { title: 'How to Read a Balance Sheet (For Non-Accountants)', slug: 'how-to-read-balance-sheet' },
    ],
  },
};

type Scores = Record<PersonaKey, number>;

function getPersona(scores: Scores): PersonaKey {
  return (Object.keys(scores) as PersonaKey[]).reduce((a, b) => scores[a] >= scores[b] ? a : b);
}

function ScoreRing({ score }: { score: number }) {
  const r = 52, c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  return (
    <svg width="140" height="140" className="rotate-[-90deg]">
      <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
      <circle cx="70" cy="70" r={r} fill="none" stroke="#F59E0B" strokeWidth="10"
        strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
        className="transition-all duration-1000" />
      <text x="70" y="76" textAnchor="middle" fill="white" fontSize="24" fontWeight="900"
        className="rotate-90" style={{ transform: 'rotate(90deg)', transformOrigin: '70px 70px', fontSize: '22px', fontWeight: 900 }}>
        {score}
      </text>
    </svg>
  );
}

export default function QuizPage() {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [done, setDone] = useState(false);
  const [scores, setScores] = useState<Scores>({ naya: 0, systematic: 0, optimizer: 0, veteran: 0 });

  const handleAnswer = (optIdx: number) => {
    const newAnswers = [...answers, optIdx];
    const q = QUESTIONS[current];
    const s = q.options[optIdx].scores;
    const newScores: Scores = {
      naya: scores.naya + s.naya,
      systematic: scores.systematic + s.systematic,
      optimizer: scores.optimizer + s.optimizer,
      veteran: scores.veteran + s.veteran,
    };
    setScores(newScores);
    setAnswers(newAnswers);
    if (current + 1 >= QUESTIONS.length) {
      setDone(true);
    } else {
      setCurrent(current + 1);
    }
  };

  const reset = () => {
    setCurrent(0); setAnswers([]); setDone(false);
    setScores({ naya: 0, systematic: 0, optimizer: 0, veteran: 0 });
  };

  const personaKey = getPersona(scores);
  const persona = PERSONAS[personaKey];
  const maxScore = QUESTIONS.length * 4;
  const totalScore = scores.naya + scores.systematic + scores.optimizer + scores.veteran;
  const healthScore = done ? Math.round(100 - (scores.naya / totalScore) * 100 * 0.8) : 0;

  return (
    <div className="dark">
      <div className="min-h-screen bg-[#050505] text-slate-100 font-sans">
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[10%] w-[50%] h-[50%] bg-purple-500/8 rounded-full blur-[160px]" />
          <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-yellow-500/5 rounded-full blur-[160px]" />
        </div>

        <GyanHubNav currentPage="Quiz" />

        <div className="max-w-2xl mx-auto px-4 py-12 relative z-10">

          <AnimatePresence mode="wait">
            {!done ? (
              <motion.div key={`q-${current}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
                {/* Progress */}
                <div className="flex items-center justify-between mb-8">
                  <span className="text-[10px] font-black uppercase tracking-widest text-yellow-500">Question {current + 1} of {QUESTIONS.length}</span>
                  <span className="text-[10px] font-black text-slate-500">{Math.round(((current) / QUESTIONS.length) * 100)}% done</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full mb-10">
                  <div className="h-full bg-yellow-500 rounded-full transition-all duration-500" style={{ width: `${(current / QUESTIONS.length) * 100}%` }} />
                </div>

                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-8">{QUESTIONS[current].q}</h2>
                <div className="space-y-3">
                  {QUESTIONS[current].options.map((opt, i) => (
                    <motion.button key={i} whileHover={{ x: 6 }} whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswer(i)}
                      className="w-full text-left bg-white/[0.02] border border-white/10 hover:border-yellow-500/40 hover:bg-white/[0.04] rounded-[1.5rem] p-5 transition-all group flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">{opt.label}</span>
                      <ChevronRight size={16} className="text-slate-600 group-hover:text-yellow-500 transition-colors flex-shrink-0" />
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                {/* Result card */}
                <div className={`bg-gradient-to-br ${persona.color} p-[1px] rounded-[2.5rem] mb-8`}>
                  <div className="bg-[#0a0a0a] rounded-[2.4rem] p-8">
                    <div className="flex items-start justify-between flex-wrap gap-4">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Your Persona</span>
                        <h2 className="text-3xl font-black text-white mt-1">{persona.name}</h2>
                        <p className="text-slate-500 font-bold text-sm mt-0.5">{persona.hindi} · {persona.tagline}</p>
                      </div>
                      <div className="flex flex-col items-center">
                        <ScoreRing score={healthScore} />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Health Score</span>
                      </div>
                    </div>
                    <p className="text-slate-300 mt-6 leading-relaxed">{persona.description}</p>
                  </div>
                </div>

                {/* Strengths & Improvements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <div className="bg-white/[0.02] border border-emerald-500/20 rounded-[2rem] p-6">
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-4">Your Strengths</p>
                    <ul className="space-y-2">
                      {persona.strengths.map((s, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-slate-300 font-medium">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full flex-shrink-0" />{s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-white/[0.02] border border-yellow-500/20 rounded-[2rem] p-6">
                    <p className="text-[10px] font-black uppercase tracking-widest text-yellow-400 mb-4">Level Up On</p>
                    <ul className="space-y-2">
                      {persona.improvements.map((s, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-slate-300 font-medium">
                          <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full flex-shrink-0" />{s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Recommended reads */}
                <div className="bg-white/[0.02] border border-white/10 rounded-[2rem] p-6 mb-6">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Recommended Reads</p>
                  <div className="space-y-3">
                    {persona.reads.map((r, i) => (
                      <Link key={i} href={`/gyanhub/articles/${r.slug}`}
                        className="flex items-center justify-between p-4 bg-black/30 rounded-2xl border border-white/5 hover:border-yellow-500/30 group transition-all">
                        <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">{r.title}</span>
                        <ChevronRight size={14} className="text-slate-600 group-hover:text-yellow-500 transition-colors flex-shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={reset} className="flex-1 flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-slate-300 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                    <RefreshCw size={14} /> Retake Quiz
                  </button>
                  <Link href="/gyanhub/calculators" className="flex-1 flex items-center justify-center gap-2 bg-yellow-500 text-black py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-yellow-400 transition-all">
                    Explore Calculators <ChevronRight size={14} />
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <style jsx global>{`body { background-color: #050505; }`}</style>
      </div>
    </div>
  );
}
