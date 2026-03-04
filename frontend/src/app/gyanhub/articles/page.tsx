'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronRight, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import GyanHubNav from '@/components/GyanHubNav';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0, scale: 0.95 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 }
  }
};

type Category = 'All' | 'Basics' | 'Investing' | 'Taxes' | 'Mutual Funds' | 'Options' | 'IPO';

interface Article {
  title: string;
  slug: string;
  category: Category;
  readTime: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  excerpt: string;
}

const CATEGORIES: Category[] = ['All', 'Basics', 'Investing', 'Taxes', 'Mutual Funds', 'Options', 'IPO'];

const ARTICLES: Article[] = [
  {
    title: 'Understanding P/E Ratio: Is a Stock Cheap or Expensive?',
    slug: 'understanding-pe-ratio',
    category: 'Basics',
    readTime: '5 min',
    difficulty: 'Beginner',
    excerpt: 'Learn how the Price-to-Earnings ratio helps you evaluate whether a stock is overvalued or undervalued relative to its earnings.',
  },
  {
    title: 'How to File ITR for Stock Market Income in India',
    slug: 'itr-stock-market-income',
    category: 'Taxes',
    readTime: '8 min',
    difficulty: 'Intermediate',
    excerpt: 'Step-by-step guide to filing your Income Tax Return if you trade stocks, F&O, or receive dividends in India.',
  },
  {
    title: 'Nifty 50 vs Sensex: What\'s the Difference?',
    slug: 'nifty-vs-sensex',
    category: 'Basics',
    readTime: '4 min',
    difficulty: 'Beginner',
    excerpt: 'Two benchmark indices, two exchanges. Understand what they track, how they differ, and which one matters more.',
  },
  {
    title: 'SIP vs Lump Sum: Which is Better for Indian Investors?',
    slug: 'sip-vs-lump-sum',
    category: 'Mutual Funds',
    readTime: '7 min',
    difficulty: 'Beginner',
    excerpt: 'Compare Systematic Investment Plans with one-time investments. Data-backed analysis with Indian market examples.',
  },
  {
    title: 'How Dividend Taxation Works in India (2025)',
    slug: 'dividend-taxation-india-2025',
    category: 'Taxes',
    readTime: '6 min',
    difficulty: 'Intermediate',
    excerpt: 'Post-2020 rules changed everything. Learn how dividends are taxed in your hands and what TDS applies.',
  },
  {
    title: 'What is F&O Trading and Why 90% Traders Lose Money',
    slug: 'fno-trading-basics',
    category: 'Options',
    readTime: '10 min',
    difficulty: 'Advanced',
    excerpt: 'Futures and Options explained for the Indian market. SEBI data shows 9 out of 10 retail traders lose money — here is why.',
  },
  {
    title: 'ELSS Funds: Save Tax and Grow Wealth at the Same Time',
    slug: 'elss-funds-guide',
    category: 'Mutual Funds',
    readTime: '5 min',
    difficulty: 'Beginner',
    excerpt: 'ELSS is the only mutual fund category that qualifies for Section 80C deduction. Learn how to pick the right one.',
  },
  {
    title: 'How to Read a Balance Sheet (For Non-Accountants)',
    slug: 'read-balance-sheet',
    category: 'Investing',
    readTime: '9 min',
    difficulty: 'Intermediate',
    excerpt: 'Assets, liabilities, equity — decoded in plain English. Use this skill to evaluate any listed Indian company.',
  },
  {
    title: 'Understanding Sectoral Rotation in Indian Markets',
    slug: 'sectoral-rotation-india',
    category: 'Investing',
    readTime: '7 min',
    difficulty: 'Advanced',
    excerpt: 'Why do IT stocks rally when banks fall? Learn how money rotates between sectors and how to position yourself.',
  },
  {
    title: 'Short Term vs Long Term Capital Gains Tax in India',
    slug: 'stcg-vs-ltcg-india',
    category: 'Taxes',
    readTime: '6 min',
    difficulty: 'Intermediate',
    excerpt: 'STCG at 20%, LTCG at 12.5% above Rs 1.25 lakh — the 2024 budget changed the rules. Updated guide inside.',
  },
  {
    title: 'What is a Demat Account and How to Open One',
    slug: 'demat-account-guide',
    category: 'Basics',
    readTime: '4 min',
    difficulty: 'Beginner',
    excerpt: 'Your demat account holds your shares electronically. Learn about CDSL, NSDL, and how to pick a broker.',
  },
  {
    title: 'Index Funds vs Active Funds: The Data Tells the Truth',
    slug: 'index-vs-active-funds',
    category: 'Mutual Funds',
    readTime: '8 min',
    difficulty: 'Intermediate',
    excerpt: 'SPIVA India data shows most active funds underperform the index over 5+ years. Should you go passive?',
  },
];

const categoryColors: Record<string, string> = {
  Basics: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Investing: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  Taxes: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  'Mutual Funds': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Options: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  IPO: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

const difficultyColors: Record<string, string> = {
  Beginner: 'text-emerald-400',
  Intermediate: 'text-yellow-400',
  Advanced: 'text-rose-400',
};

export default function ArticlesPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('All');

  const filtered = activeCategory === 'All'
    ? ARTICLES
    : ARTICLES.filter(a => a.category === activeCategory);

  return (
    <div className="dark">
      <div className="min-h-screen relative overflow-hidden bg-[#050505] text-slate-100 font-sans">
        {/* Ambient Lighting */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[10%] w-[50%] h-[50%] bg-yellow-500/10 rounded-full blur-[160px] animate-pulse" />
          <div className="absolute top-[20%] right-[-10%] w-[60%] h-[60%] bg-blue-500/5 rounded-full blur-[180px]" />
          <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-t from-yellow-500/5 to-transparent" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
        </div>

        <GyanHubNav currentPage="Articles" />

        <main className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 30 }}
            className="mb-16"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex items-center justify-center">
                <BookOpen size={20} className="text-yellow-500" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">Knowledge Archive</h1>
              </div>
            </div>
            <p className="text-sm text-slate-400 font-medium max-w-xl leading-relaxed">
              India-first financial education. From filing ITR to reading balance sheets — build your investing foundation.
            </p>
          </motion.div>

          {/* Category Filter Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <div className="flex flex-wrap gap-2 p-1.5 bg-black/40 rounded-2xl border border-white/5 inline-flex">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    activeCategory === cat
                      ? 'bg-white/10 text-white shadow-lg'
                      : 'text-slate-500 hover:text-white'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Articles Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filtered.map((article) => (
                <motion.div key={article.slug} variants={itemVariants}>
                  <Link href={`/gyanhub/articles/${article.slug}`} className="block group h-full">
                    <div className="bg-white/[0.02] backdrop-blur-2xl rounded-[2.5rem] p-8 border border-white/10 shadow-sm hover:border-yellow-500/30 hover:bg-white/[0.04] transition-all h-full flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-5">
                          <span className={cn(
                            "text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-[0.15em] border",
                            categoryColors[article.category] || 'bg-white/5 text-slate-400 border-white/10'
                          )}>
                            {article.category}
                          </span>
                          <span className={cn("text-[9px] font-black uppercase tracking-widest", difficultyColors[article.difficulty])}>
                            {article.difficulty}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-200 leading-relaxed group-hover:text-white transition-colors mb-3">
                          {article.title}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                          {article.excerpt}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                          <Clock size={12} />
                          {article.readTime}
                        </div>
                        <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest group-hover:translate-x-1 transition-transform flex items-center gap-1">
                          Read <ChevronRight size={10} strokeWidth={3} />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">No articles in this category yet</p>
            </div>
          )}
        </main>

        <footer className="max-w-7xl mx-auto mt-24 p-12 border-t border-white/10 text-center relative z-10">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
            GyanHub by GallaGyan — Educational Purpose Only. Not Financial Advice.
          </p>
        </footer>
      </div>
    </div>
  );
}
