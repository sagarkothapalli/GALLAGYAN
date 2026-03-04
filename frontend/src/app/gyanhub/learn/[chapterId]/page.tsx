'use client';

import { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Clock, CheckCircle2, XCircle, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import GyanHubNav from '@/components/GyanHubNav';
import { FALLBACK_CHAPTERS, LEVEL_COLORS, TOTAL_CHAPTERS, type Chapter } from '@/data/curriculum-fallback';

function getCompletedChapters(): number[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('gyanhub_completed_chapters');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function markChapterComplete(chapterId: number) {
  const completed = getCompletedChapters();
  if (!completed.includes(chapterId)) {
    completed.push(chapterId);
    localStorage.setItem('gyanhub_completed_chapters', JSON.stringify(completed));
  }
}

export default function ChapterPage({ params }: { params: Promise<{ chapterId: string }> }) {
  const { chapterId: chapterIdStr } = use(params);
  const chapterId = parseInt(chapterIdStr, 10);
  const [chapters, setChapters] = useState<Chapter[]>(FALLBACK_CHAPTERS);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    setIsCompleted(getCompletedChapters().includes(chapterId));

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
        // JSON not available
      }
    }
    loadCurriculum();
  }, [chapterId]);

  const chapter = chapters.find((c) => c.id === chapterId);

  // Find prev/next based on sorted order of available chapters
  const sortedChapters = [...chapters].sort((a, b) => a.id - b.id);
  const currentIndex = sortedChapters.findIndex((c) => c.id === chapterId);
  const prevChapter = currentIndex > 0 ? sortedChapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < sortedChapters.length - 1 ? sortedChapters[currentIndex + 1] : null;

  const handleQuizSelect = useCallback((questionIdx: number, optionIdx: number) => {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({ ...prev, [questionIdx]: optionIdx }));
  }, [quizSubmitted]);

  const handleQuizSubmit = useCallback(() => {
    setQuizSubmitted(true);
    markChapterComplete(chapterId);
    setIsCompleted(true);
  }, [chapterId]);

  const quizScore = chapter
    ? chapter.quiz.filter((q, i) => quizAnswers[i] === q.correctIndex).length
    : 0;
  const allQuizAnswered = chapter
    ? Object.keys(quizAnswers).length === chapter.quiz.length
    : false;

  if (!chapter) {
    return (
      <div className="dark">
        <div className="min-h-screen bg-[#050505] text-slate-100 font-sans">
          <GyanHubNav currentPage="Learn" />
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center max-w-md mx-auto px-4">
              <div className="w-20 h-20 bg-yellow-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                <BookOpen size={32} className="text-yellow-500" />
              </div>
              <h1 className="text-2xl font-black text-white mb-3">Chapter Coming Soon</h1>
              <p className="text-slate-400 mb-8">
                This chapter is being written by our editorial team. Check back soon!
              </p>
              <Link
                href="/gyanhub/learn"
                className="inline-flex items-center gap-2 bg-yellow-500 text-black px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-yellow-400 transition-all"
              >
                <ChevronLeft size={14} /> Back to Curriculum
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const levelColors = LEVEL_COLORS[chapter.level];

  return (
    <div className="dark">
      <div className="min-h-screen relative overflow-hidden bg-[#050505] text-slate-100 font-sans">
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[10%] w-[40%] h-[40%] bg-yellow-500/6 rounded-full blur-[160px]" />
          <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[160px]" />
        </div>

        <GyanHubNav currentPage="Learn" />

        <main className="max-w-3xl mx-auto px-4 py-12 relative z-10">
          {/* Progress Indicator */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <Link
              href="/gyanhub/learn"
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-yellow-500 transition-colors"
            >
              <ChevronLeft size={12} /> All Chapters
            </Link>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Chapter {chapter.id} of {TOTAL_CHAPTERS}
            </span>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span
                className={cn(
                  'text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border',
                  levelColors.bg,
                  levelColors.text,
                  levelColors.border
                )}
              >
                {chapter.level}
              </span>
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                <Clock size={10} /> {chapter.readTime} read
              </div>
              {isCompleted && (
                <div className="flex items-center gap-1 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                  <CheckCircle2 size={12} /> Completed
                </div>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-6 leading-[1.15]">
              {chapter.title}
            </h1>

            {/* Key Concepts Tags */}
            <div className="flex flex-wrap gap-2 mb-10 pb-10 border-b border-white/5">
              {chapter.keyConcepts.map((concept) => (
                <span
                  key={concept}
                  className="text-[10px] font-black text-yellow-500 bg-yellow-500/10 px-3 py-1.5 rounded-lg border border-yellow-500/20 uppercase tracking-widest"
                >
                  {concept}
                </span>
              ))}
            </div>

            {/* Article Body */}
            <div className="space-y-6 mb-12">
              {chapter.content.split('\n\n').map((para, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="text-slate-300 leading-relaxed font-medium"
                >
                  {para}
                </motion.p>
              ))}
            </div>

            {/* Practical Exercises */}
            <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-[2rem] p-8 mb-8">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-yellow-500 mb-6">
                Practical Exercises
              </h3>
              <ol className="space-y-4">
                {chapter.exercises.map((exercise, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="text-yellow-500 font-black text-sm flex-shrink-0 w-6 h-6 bg-yellow-500/10 rounded-lg flex items-center justify-center border border-yellow-500/20">
                      {i + 1}
                    </span>
                    <p className="text-sm text-slate-300 font-medium leading-relaxed">
                      {exercise}
                    </p>
                  </li>
                ))}
              </ol>
            </div>

            {/* Key Takeaways */}
            <div className="bg-white/[0.02] border border-white/10 rounded-[2rem] p-8 mb-12">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">
                Key Takeaways
              </h3>
              <ul className="space-y-3">
                {chapter.keyTakeaways.map((takeaway, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full flex-shrink-0 mt-2" />
                    <p className="text-sm text-slate-300 font-medium leading-relaxed">
                      {takeaway}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Interactive Quiz */}
            <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 mb-12">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-black text-white">Chapter Quiz</h3>
                {quizSubmitted && (
                  <span
                    className={cn(
                      'text-sm font-black px-4 py-2 rounded-xl border',
                      quizScore === chapter.quiz.length
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                    )}
                  >
                    {quizScore}/{chapter.quiz.length} Correct
                  </span>
                )}
              </div>

              <div className="space-y-8">
                {chapter.quiz.map((q, qIdx) => (
                  <div key={qIdx}>
                    <p className="text-sm font-bold text-white mb-4">
                      {qIdx + 1}. {q.question}
                    </p>
                    <div className="space-y-2">
                      {q.options.map((opt, oIdx) => {
                        const isSelected = quizAnswers[qIdx] === oIdx;
                        const isCorrect = q.correctIndex === oIdx;
                        let optStyle =
                          'bg-white/[0.02] border-white/10 hover:border-white/20 text-slate-300';

                        if (isSelected && !quizSubmitted) {
                          optStyle =
                            'bg-yellow-500/10 border-yellow-500/30 text-yellow-400';
                        } else if (quizSubmitted && isSelected && isCorrect) {
                          optStyle =
                            'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
                        } else if (quizSubmitted && isSelected && !isCorrect) {
                          optStyle =
                            'bg-rose-500/10 border-rose-500/30 text-rose-400';
                        } else if (quizSubmitted && isCorrect) {
                          optStyle =
                            'bg-emerald-500/5 border-emerald-500/20 text-emerald-400';
                        }

                        return (
                          <button
                            key={oIdx}
                            onClick={() => handleQuizSelect(qIdx, oIdx)}
                            disabled={quizSubmitted}
                            className={cn(
                              'w-full text-left p-4 rounded-2xl border text-sm font-medium transition-all flex items-center justify-between',
                              optStyle
                            )}
                          >
                            <span>{opt}</span>
                            {quizSubmitted && isSelected && isCorrect && (
                              <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                            )}
                            {quizSubmitted && isSelected && !isCorrect && (
                              <XCircle size={16} className="text-rose-400 flex-shrink-0" />
                            )}
                            {quizSubmitted && !isSelected && isCorrect && (
                              <CheckCircle2 size={16} className="text-emerald-400/50 flex-shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {!quizSubmitted && (
                <button
                  onClick={handleQuizSubmit}
                  disabled={!allQuizAnswered}
                  className={cn(
                    'mt-8 w-full py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all',
                    allQuizAnswered
                      ? 'bg-yellow-500 text-black hover:bg-yellow-400'
                      : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'
                  )}
                >
                  {allQuizAnswered
                    ? 'Submit Answers'
                    : `Answer all ${chapter.quiz.length} questions to submit`}
                </button>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-4">
              {prevChapter ? (
                <Link
                  href={`/gyanhub/learn/${prevChapter.id}`}
                  className="flex-1 flex items-center gap-3 bg-white/[0.02] border border-white/10 hover:border-yellow-500/30 rounded-[1.5rem] p-5 transition-all group"
                >
                  <ChevronLeft
                    size={16}
                    className="text-slate-600 group-hover:text-yellow-500 transition-colors flex-shrink-0"
                  />
                  <div>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">
                      Previous
                    </p>
                    <p className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">
                      {prevChapter.title}
                    </p>
                  </div>
                </Link>
              ) : (
                <div className="flex-1" />
              )}
              {nextChapter ? (
                <Link
                  href={`/gyanhub/learn/${nextChapter.id}`}
                  className="flex-1 flex items-center justify-end gap-3 bg-white/[0.02] border border-white/10 hover:border-yellow-500/30 rounded-[1.5rem] p-5 transition-all group text-right"
                >
                  <div>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">
                      Next Chapter
                    </p>
                    <p className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">
                      {nextChapter.title}
                    </p>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-slate-600 group-hover:text-yellow-500 transition-colors flex-shrink-0"
                  />
                </Link>
              ) : (
                <div className="flex-1" />
              )}
            </div>

            {/* Disclaimer */}
            <div className="mt-12 pt-8 border-t border-white/5">
              <p className="text-[10px] text-slate-600 font-medium leading-relaxed">
                * This content is for educational purposes only and does not constitute financial
                advice. Investments in securities markets are subject to market risks. Consult a
                SEBI-registered financial advisor for personalized guidance.
              </p>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
