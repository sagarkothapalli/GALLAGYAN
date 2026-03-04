'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight, Clock, CheckCircle2, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import GyanHubNav from '@/components/GyanHubNav';
import { FALLBACK_CHAPTERS, LEVEL_COLORS, TOTAL_CHAPTERS, type Chapter } from '@/data/curriculum-fallback';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { y: 20, opacity: 0, scale: 0.95 },
  visible: { y: 0, opacity: 1, scale: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Pro'] as const;

function getCompletedChapters(): number[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('gyanhub_completed_chapters');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export default function LearnIndexPage() {
  const [chapters, setChapters] = useState<Chapter[]>(FALLBACK_CHAPTERS);
  const [completed, setCompleted] = useState<number[]>([]);

  useEffect(() => {
    setCompleted(getCompletedChapters());

    // Try to load full curriculum JSON if it exists
    async function loadCurriculum() {
      try {
        const res = await fetch('/data/gyanhub-curriculum.json');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setChapters(data as Chapter[]);
          }
        }
      } catch {
        // JSON not available, use fallback
      }
    }
    loadCurriculum();
  }, []);

  const progressPct = Math.round((completed.length / TOTAL_CHAPTERS) * 100);

  return (
    <div className="dark">
      <div className="min-h-screen relative overflow-hidden bg-[#050505] text-slate-100 font-sans">
        {/* Ambient Lighting */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[10%] w-[50%] h-[50%] bg-yellow-500/10 rounded-full blur-[160px] animate-pulse" />
          <div className="absolute top-[20%] right-[-10%] w-[60%] h-[60%] bg-emerald-500/5 rounded-full blur-[180px]" />
          <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-t from-yellow-500/5 to-transparent" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
        </div>

        <GyanHubNav currentPage="Learn" />

        <main className="max-w-5xl mx-auto px-4 md:px-8 py-12 md:py-20 relative z-10">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 30 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 px-4 py-2 rounded-full mb-8">
              <BookOpen size={14} className="text-yellow-500" />
              <span className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.25em]">
                Structured Curriculum
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-4">
              Stock Market Mastery
            </h1>
            <p className="text-lg md:text-xl font-bold text-slate-400 max-w-2xl mx-auto mb-2">
              From Zero to Pro
            </p>
            <p className="text-sm text-slate-500 font-medium max-w-xl mx-auto">
              {TOTAL_CHAPTERS} chapters covering everything from opening a Demat account to algorithmic
              trading. Completely free.
            </p>
          </motion.div>

          {/* Progress Tracker */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/[0.02] backdrop-blur-2xl rounded-[2.5rem] p-8 border border-white/10 mb-12"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                  Your Progress
                </p>
                <p className="text-2xl font-black text-white">
                  {completed.length} of {TOTAL_CHAPTERS} Chapters
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-yellow-500">{progressPct}%</p>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Complete
                </p>
              </div>
            </div>
            <div className="h-3 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="flex gap-3 mt-6">
              {LEVELS.map((level) => {
                const colors = LEVEL_COLORS[level];
                return (
                  <span
                    key={level}
                    className={cn(
                      'text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border',
                      colors.bg,
                      colors.text,
                      colors.border
                    )}
                  >
                    {level}
                  </span>
                );
              })}
            </div>
          </motion.div>

          {/* Chapters by Level */}
          {LEVELS.map((level) => {
            const levelChapters = chapters.filter((c) => c.level === level);
            if (levelChapters.length === 0) return null;
            const colors = LEVEL_COLORS[level];

            return (
              <div key={level} className="mb-12">
                <div className="flex items-center gap-3 mb-6 px-2">
                  <span
                    className={cn(
                      'text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border',
                      colors.bg,
                      colors.text,
                      colors.border
                    )}
                  >
                    {level}
                  </span>
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                    {levelChapters.length} chapter{levelChapters.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {levelChapters.map((chapter) => {
                    const isCompleted = completed.includes(chapter.id);
                    return (
                      <motion.div key={chapter.id} variants={itemVariants}>
                        <Link
                          href={`/gyanhub/learn/${chapter.id}`}
                          className="block group"
                        >
                          <div
                            className={cn(
                              'bg-white/[0.02] backdrop-blur-2xl rounded-[2rem] p-6 border shadow-sm transition-all relative overflow-hidden',
                              isCompleted
                                ? 'border-emerald-500/20 hover:border-emerald-500/40'
                                : 'border-white/10 hover:border-yellow-500/30'
                            )}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-3">
                                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                                    Ch. {chapter.id}
                                  </span>
                                  <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                                    <Clock size={10} />
                                    {chapter.readTime}
                                  </span>
                                </div>
                                <h3 className="text-base font-bold text-slate-200 group-hover:text-white transition-colors mb-3">
                                  {chapter.title}
                                </h3>
                                <div className="flex flex-wrap gap-1.5">
                                  {chapter.keyConcepts.slice(0, 3).map((concept) => (
                                    <span
                                      key={concept}
                                      className="text-[9px] font-bold text-slate-500 bg-white/5 px-2 py-0.5 rounded-md border border-white/5"
                                    >
                                      {concept}
                                    </span>
                                  ))}
                                  {chapter.keyConcepts.length > 3 && (
                                    <span className="text-[9px] font-bold text-slate-600">
                                      +{chapter.keyConcepts.length - 3}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex-shrink-0">
                                {isCompleted ? (
                                  <CheckCircle2
                                    size={24}
                                    className="text-emerald-500"
                                  />
                                ) : (
                                  <ChevronRight
                                    size={20}
                                    className="text-slate-600 group-hover:text-yellow-500 group-hover:translate-x-1 transition-all"
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>
            );
          })}
        </main>

        <footer className="max-w-7xl mx-auto mt-12 p-12 border-t border-white/10 text-center relative z-10">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
            GyanHub by GallaGyan -- Educational Purpose Only. Not Financial Advice.
          </p>
        </footer>
      </div>
    </div>
  );
}
