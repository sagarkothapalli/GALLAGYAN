'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  QUIZ_QUESTIONS,
  PERSONAS,
  calculatePersonaFromAnswers,
  getStrengthsAndImprovements,
} from '@/data/quiz-questions';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { EmailCapture } from '@/components/shared/EmailCapture';
import { Disclaimer } from '@/components/shared/Disclaimer';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sprout,
  TrendingUp,
  Calculator,
  Rocket,
} from 'lucide-react';
import Link from 'next/link';
import type { FinancialPersona } from '@/types';

const personaIcons: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Sprout,
  TrendingUp,
  Calculator,
  Rocket,
};

export function QuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);

  const question = QUIZ_QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + (showResults ? 1 : 0)) / QUIZ_QUESTIONS.length) * 100;
  const isComplete = Object.keys(answers).length === QUIZ_QUESTIONS.length;

  const handleAnswer = (value: string) => {
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
    }
  };

  const handleSubmit = () => {
    if (isComplete) {
      setShowResults(true);
    }
  };

  const goBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // Results
  const resultData = showResults ? calculatePersonaFromAnswers(answers) : null;
  const personaInfo = resultData ? PERSONAS[resultData.persona] : null;
  const improvements = resultData && personaInfo
    ? getStrengthsAndImprovements(resultData.persona, resultData.healthScore)
    : null;

  if (showResults && resultData && personaInfo && improvements) {
    return <QuizResults {...{ resultData, personaInfo, improvements }} />;
  }

  return (
    <>
      {/* Hero */}
      <section className="gradient-bg text-white py-12 md:py-16">
        <div className="container-narrow text-center">
          <h1 className="text-display-lg font-heading mb-4">
            Financial Health <span className="gradient-text">Score</span>
          </h1>
          <p className="text-body-lg text-gray-300 max-w-xl mx-auto">
            Answer 10 quick questions to discover your Financial Persona and get a
            personalized learning path. Takes about 2 minutes.
          </p>
        </div>
      </section>

      {/* Quiz */}
      <section className="section-padding">
        <div className="container-narrow max-w-2xl">
          <ProgressBar value={progress} showPercent={false} size="sm" className="mb-8" />

          <div className="text-center mb-2">
            <span className="text-body-sm text-gray-400">
              Question {currentQuestion + 1} of {QUIZ_QUESTIONS.length}
            </span>
          </div>

          <div className="card p-6 md:p-8">
            <h2 className="font-heading font-bold text-heading text-navy-900 dark:text-white mb-6 text-center">
              {question.question}
            </h2>

            <div className="space-y-3">
              {question.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(option.value)}
                  className={cn(
                    'w-full text-left p-4 rounded-xl border-2 transition-all',
                    answers[question.id] === option.value
                      ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                      : 'border-gray-200 dark:border-navy-700 hover:border-gray-300 dark:hover:border-navy-600 hover:bg-gray-50 dark:hover:bg-navy-800'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
                        answers[question.id] === option.value
                          ? 'border-teal-500 bg-teal-500'
                          : 'border-gray-300 dark:border-navy-600'
                      )}
                    >
                      {answers[question.id] === option.value && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <span className="text-body text-gray-700 dark:text-gray-300 font-medium">
                      {option.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-between items-center mt-8">
              <button
                onClick={goBack}
                disabled={currentQuestion === 0}
                className="btn-ghost text-body-sm disabled:opacity-30"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </button>

              {currentQuestion === QUIZ_QUESTIONS.length - 1 && (
                <button
                  onClick={handleSubmit}
                  disabled={!isComplete}
                  className="btn-primary text-body-sm disabled:opacity-50"
                >
                  See My Results
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              )}
            </div>
          </div>

          <Disclaimer variant="inline" className="mt-6 text-center" />
        </div>
      </section>
    </>
  );
}

// ── Results Component ───────────────────────────────────────
interface QuizResultsProps {
  resultData: {
    persona: FinancialPersona;
    scores: Record<FinancialPersona, number>;
    healthScore: number;
  };
  personaInfo: (typeof PERSONAS)[FinancialPersona];
  improvements: { strengths: string[]; improvements: string[] };
}

function QuizResults({ resultData, personaInfo, improvements }: QuizResultsProps) {
  const PersonaIcon = personaIcons[personaInfo.icon] || Sprout;

  return (
    <>
      {/* Results hero */}
      <section className="gradient-bg text-white py-16 md:py-24">
        <div className="container-narrow text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/10 border border-teal-500/20 rounded-full mb-6">
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
            <span className="text-body-sm text-teal-300 font-medium">Quiz Complete</span>
          </div>

          <h1 className="text-heading-xl md:text-display font-heading mb-4">
            Your Financial Persona
          </h1>

          {/* Persona card */}
          <div className="inline-block mt-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `${personaInfo.color}20` }}
              >
                <PersonaIcon className="w-8 h-8" style={{ color: personaInfo.color }} />
              </div>
              <h2 className="text-heading-lg font-heading font-bold mb-1" style={{ color: personaInfo.color }}>
                {personaInfo.label}
              </h2>
              <p className="text-body-sm text-gray-300">{personaInfo.tagline}</p>
            </div>
          </div>

          {/* Health score */}
          <div className="mt-8">
            <p className="text-body-sm text-gray-400 mb-2">Financial Health Score</p>
            <div className="relative inline-block">
              <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="8" className="text-white/10" />
                <circle
                  cx="60" cy="60" r="52" fill="none" stroke={personaInfo.color} strokeWidth="8"
                  strokeDasharray={`${(resultData.healthScore / 100) * 2 * Math.PI * 52} ${2 * Math.PI * 52}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-heading-lg font-heading font-bold" style={{ color: personaInfo.color }}>
                  {resultData.healthScore}
                </span>
                <span className="text-caption text-gray-400">/100</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed results */}
      <section className="section-padding">
        <div className="container-narrow max-w-3xl">
          <div className="card p-6 md:p-8 mb-8">
            <h3 className="font-heading font-bold text-heading text-navy-900 dark:text-white mb-3">
              About Your Persona
            </h3>
            <p className="text-body text-gray-600 dark:text-gray-400 leading-relaxed">
              {personaInfo.description}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Strengths */}
            <div className="card p-6">
              <h3 className="font-heading font-semibold text-heading-sm text-navy-900 dark:text-white mb-4">
                Your Strengths
              </h3>
              <ul className="space-y-3">
                {improvements.strengths.map((s) => (
                  <li key={s} className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
                    <span className="text-body-sm text-gray-600 dark:text-gray-400">{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Improvements */}
            <div className="card p-6">
              <h3 className="font-heading font-semibold text-heading-sm text-navy-900 dark:text-white mb-4">
                Areas to Improve
              </h3>
              <ul className="space-y-3">
                {improvements.improvements.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <ArrowRight className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <span className="text-body-sm text-gray-600 dark:text-gray-400">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recommended learning path */}
          <div className="card p-6 md:p-8 mb-8">
            <h3 className="font-heading font-bold text-heading text-navy-900 dark:text-white mb-4">
              Your Personalized Learning Path
            </h3>
            <p className="text-body-sm text-gray-500 mb-6">
              Based on your persona, we recommend starting with these topics:
            </p>
            <div className="space-y-3">
              {personaInfo.recommendedTopics.map((topic, i) => (
                <div
                  key={topic}
                  className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-navy-800 hover:bg-gray-100 dark:hover:bg-navy-700 transition-colors"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-body-sm font-bold"
                    style={{ backgroundColor: `${personaInfo.color}20`, color: personaInfo.color }}
                  >
                    {i + 1}
                  </div>
                  <span className="text-body font-medium text-navy-900 dark:text-white">{topic}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Score breakdown */}
          <div className="card p-6 md:p-8 mb-8">
            <h3 className="font-heading font-bold text-heading text-navy-900 dark:text-white mb-4">
              Persona Score Breakdown
            </h3>
            <div className="space-y-4">
              {(Object.entries(resultData.scores) as [FinancialPersona, number][]).map(([persona, score]) => {
                const info = PERSONAS[persona];
                const maxScore = QUIZ_QUESTIONS.length * 3;
                return (
                  <div key={persona}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-body-sm font-medium text-gray-700 dark:text-gray-300">{info.label}</span>
                      <span className="text-body-sm text-gray-500">{score} pts</span>
                    </div>
                    <div className="h-2.5 bg-gray-200 dark:bg-navy-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${(score / maxScore) * 100}%`,
                          backgroundColor: info.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Email + CTA */}
          <EmailCapture
            source="quiz-results"
            title="Get your full results report via email"
            description="Includes your persona analysis, personalized reading list, and action items."
            buttonText="Email My Report"
            className="mb-8"
          />

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/auth/register" className="btn-primary flex-1 text-center">
              Create your free account
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link href="/learn" className="btn-secondary flex-1 text-center">
              Explore the Education Hub
            </Link>
          </div>

          <Disclaimer variant="footer" className="mt-8" />
        </div>
      </section>
    </>
  );
}
