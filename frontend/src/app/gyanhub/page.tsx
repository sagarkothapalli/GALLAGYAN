'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpen, Calculator, Brain, List, ChevronRight, Clock, GraduationCap, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import GyanHubNav from '@/components/GyanHubNav';
import { TOTAL_CHAPTERS } from '@/data/curriculum-fallback';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
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

const FEATURES = [
  {
    title: 'Articles & Guides',
    description: 'India-first investing guides, tax filing walkthroughs, and market analysis breakdowns.',
    icon: BookOpen,
    href: '/gyanhub/articles',
    accent: 'yellow',
  },
  {
    title: 'Calculators',
    description: 'SIP, FD, Tax Estimator, and Emergency Fund calculators with real-time results.',
    icon: Calculator,
    href: '/gyanhub/calculators',
    accent: 'emerald',
  },
  {
    title: 'Financial Health Quiz',
    description: 'Discover your financial persona and get a personalized action plan in 2 minutes.',
    icon: Brain,
    href: '/gyanhub/quiz',
    accent: 'purple',
  },
  {
    title: 'Stock Market Glossary',
    description: '60+ Indian market terms explained simply. From P/E Ratio to Open Interest.',
    icon: List,
    href: '/gyanhub/glossary',
    accent: 'blue',
  },
];

const FEATURED_ARTICLES = [
  {
    title: 'Understanding P/E Ratio: Is a Stock Cheap or Expensive?',
    category: 'Basics',
    readTime: '5 min',
    difficulty: 'Beginner',
    slug: 'understanding-pe-ratio',
  },
  {
    title: 'SIP vs Lump Sum: Which is Better for Indian Investors?',
    category: 'Mutual Funds',
    readTime: '7 min',
    difficulty: 'Beginner',
    slug: 'sip-vs-lump-sum',
  },
  {
    title: 'Short Term vs Long Term Capital Gains Tax in India',
    category: 'Taxes',
    readTime: '6 min',
    difficulty: 'Intermediate',
    slug: 'stcg-vs-ltcg-india',
  },
];

const accentMap: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  yellow: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', border: 'border-yellow-500/20', glow: 'shadow-yellow-500/10' },
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20', glow: 'shadow-emerald-500/10' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/20', glow: 'shadow-purple-500/10' },
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20', glow: 'shadow-blue-500/10' },
};

const categoryColors: Record<string, string> = {
  Basics: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'Mutual Funds': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Taxes: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
};

const difficultyColors: Record<string, string> = {
  Beginner: 'text-emerald-400',
  Intermediate: 'text-yellow-400',
  Advanced: 'text-rose-400',
};

const QUICK_STATS = [
  { label: 'F&O Retail Loss Rate', value: '90%', detail: 'of F&O traders lose money (SEBI data)' },
  { label: 'Nifty 50 CAGR', value: '~12%', detail: 'average annual returns over 30 years' },
  { label: '10Y Nifty Growth', value: '3.1x', detail: 'Rs 1L invested 10Y ago = Rs 3.1L today' },
];

export default function GyanHubPage() {
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('gyanhub_completed_chapters');
      if (stored) {
        const parsed = JSON.parse(stored);
        setCompletedCount(Array.isArray(parsed) ? parsed.length : 0);
      }
    } catch {}
  }, []);

  const progressPct = Math.round((completedCount / TOTAL_CHAPTERS) * 100);

  return (
    <div className="dark">
      <div className="min-h-screen relative overflow-hidden bg-[#050505] text-slate-100 font-sans">
        {/* Ambient Lighting */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[10%] w-[50%] h-[50%] bg-yellow-500/10 rounded-full blur-[160px] animate-pulse" />
          <div className="absolute top-[20%] right-[-10%] w-[60%] h-[60%] bg-purple-500/5 rounded-full blur-[180px]" />
          <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-t from-yellow-500/5 to-transparent" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
        </div>

        <GyanHubNav />

        <main className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20 relative z-10">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 30 }}
            className="text-center mb-12 md:mb-20"
          >
            <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 px-3 md:px-4 py-2 rounded-full mb-6 md:mb-8">
              <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.25em]">Knowledge Protocol Active</span>
            </div>
            <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-white mb-4 md:mb-6">
              Gyan<span className="text-yellow-500">Hub</span>
            </h1>
            <p className="text-lg md:text-xl font-bold text-slate-400 max-w-2xl mx-auto leading-relaxed">
              India&apos;s Financial Intelligence Hub
            </p>
            <p className="text-sm text-slate-500 font-medium mt-4 max-w-xl mx-auto leading-relaxed">
              Master markets, taxes, and wealth-building with India-first guides, tools, and quizzes.
            </p>
          </motion.div>

          {/* Feature Cards Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-16 md:mb-24"
          >
            {FEATURES.map((feature) => {
              const colors = accentMap[feature.accent];
              const Icon = feature.icon;
              return (
                <motion.div key={feature.title} variants={itemVariants}>
                  <Link href={feature.href} className="block group">
                    <div className={cn(
                      "bg-white/[0.02] backdrop-blur-2xl rounded-2xl md:rounded-[2.5rem] p-6 md:p-10 border border-white/10",
                      "shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] hover:border-white/20 transition-all",
                      "hover:bg-white/[0.04] relative overflow-hidden"
                    )}>
                      <div className={cn("absolute top-0 right-0 w-40 h-40 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none opacity-50", colors.bg)} />
                      <div className="relative z-10">
                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border", colors.bg, colors.border)}>
                          <Icon size={24} className={colors.text} />
                        </div>
                        <h3 className="text-xl font-black text-white mb-3 group-hover:text-yellow-500 transition-colors tracking-tight">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-slate-400 font-medium leading-relaxed mb-6">
                          {feature.description}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-yellow-500 transition-colors">
                          Explore <ChevronRight size={12} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Stock Market Mastery Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 30 }}
            className="mb-10 md:mb-16"
          >
            <Link href="/gyanhub/learn" className="block group">
              <div className="bg-gradient-to-br from-yellow-500/10 to-amber-500/5 backdrop-blur-2xl rounded-2xl md:rounded-[2.5rem] p-6 md:p-10 border border-yellow-500/20 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] hover:border-yellow-500/40 transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 w-60 h-60 bg-yellow-500/10 rounded-full blur-[100px] -mr-30 -mt-30 pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-6 flex-wrap">
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-yellow-500/20 border border-yellow-500/30 rounded-2xl flex items-center justify-center">
                          <GraduationCap size={24} className="text-yellow-500" />
                        </div>
                        <span className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.2em] bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">
                          Free Course
                        </span>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-black text-white mb-2 tracking-tight group-hover:text-yellow-500 transition-colors">
                        Stock Market Mastery
                      </h3>
                      <p className="text-sm text-slate-400 font-medium mb-4">
                        {TOTAL_CHAPTERS} Chapters &middot; Beginner to Pro &middot; Free
                      </p>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {['Beginner', 'Intermediate', 'Advanced', 'Pro'].map((level) => (
                          <span
                            key={level}
                            className={cn(
                              'text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border',
                              level === 'Beginner' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                              level === 'Intermediate' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                              level === 'Advanced' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                              'bg-purple-500/10 text-purple-400 border-purple-500/20'
                            )}
                          >
                            {level}
                          </span>
                        ))}
                      </div>
                      {completedCount > 0 && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                            <span>Progress</span>
                            <span>{progressPct}%</span>
                          </div>
                          <div className="h-2 bg-white/5 rounded-full overflow-hidden max-w-xs">
                            <div
                              className="h-full bg-yellow-500 rounded-full transition-all duration-500"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-yellow-500 transition-colors self-end">
                      {completedCount > 0 ? 'Continue Learning' : 'Start Learning'}{' '}
                      <ChevronRight size={14} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, type: 'spring', stiffness: 200, damping: 30 }}
            className="mb-12 md:mb-24"
          >
            <div className="flex items-center gap-3 mb-6 px-2">
              <TrendingUp size={14} className="text-yellow-500" />
              <h2 className="text-sm font-black text-white uppercase tracking-widest">Did You Know?</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              {QUICK_STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white/[0.02] backdrop-blur-2xl rounded-2xl md:rounded-[2rem] p-5 md:p-6 border border-white/10 shadow-sm"
                >
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-black text-yellow-500 mb-1">{stat.value}</p>
                  <p className="text-xs text-slate-400 font-medium">{stat.detail}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Featured Articles Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 200, damping: 30 }}
          >
            <div className="flex items-center justify-between mb-8 px-2">
              <h2 className="text-sm font-black text-white uppercase tracking-widest">Featured Articles</h2>
              <Link href="/gyanhub/articles" className="text-[10px] font-black text-yellow-500 uppercase tracking-widest hover:text-yellow-400 transition-colors flex items-center gap-1">
                View All <ChevronRight size={12} strokeWidth={3} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {FEATURED_ARTICLES.map((article) => (
                <Link key={article.slug} href={`/gyanhub/articles/${article.slug}`} className="group">
                  <div className="bg-white/[0.02] backdrop-blur-2xl rounded-2xl md:rounded-[2.5rem] p-6 md:p-8 border border-white/10 shadow-sm hover:border-yellow-500/30 hover:bg-white/[0.04] transition-all h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <span className={cn("text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-[0.15em] border", categoryColors[article.category] || 'bg-white/5 text-slate-400 border-white/10')}>
                          {article.category}
                        </span>
                        <span className={cn("text-[9px] font-black uppercase tracking-widest", difficultyColors[article.difficulty] || 'text-slate-500')}>
                          {article.difficulty}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-200 leading-relaxed group-hover:text-white transition-colors mb-4">
                        {article.title}
                      </h3>
                    </div>
                    <div className="flex items-center justify-between mt-4">
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
              ))}
            </div>
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="max-w-7xl mx-auto mt-12 md:mt-24 px-4 py-8 md:p-12 border-t border-white/10 text-center relative z-10">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
            GyanHub by GallaGyan — Educational Purpose Only. Not Financial Advice.
          </p>
        </footer>
      </div>
    </div>
  );
}
