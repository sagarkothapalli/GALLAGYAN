'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Calculator,
  BookOpen,
  ClipboardCheck,
  Filter,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOCK_ARTICLES, ARTICLE_CATEGORIES } from '@/data/mock-articles';
import { Disclaimer } from '@/components/shared/Disclaimer';

export function EducationHub() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeLevel, setActiveLevel] = useState<string>('all');

  const filteredArticles = useMemo(() => {
    return MOCK_ARTICLES.filter((article) => {
      const matchesSearch =
        !searchQuery ||
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = activeCategory === 'all' || article.category === activeCategory;
      const matchesLevel = activeLevel === 'all' || article.level === activeLevel;
      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [searchQuery, activeCategory, activeLevel]);

  return (
    <>
      {/* Hero */}
      <section className="gradient-bg text-white py-16 md:py-24">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center">
            <span className="badge bg-teal-500/10 text-teal-300 mb-4">Education Hub</span>
            <h1 className="text-display-lg font-heading mb-4">
              Master your <span className="gradient-text">freelance finances</span>
            </h1>
            <p className="text-body-lg text-gray-300 mb-8">
              Expert-written guides, interactive calculators, and personalized learning paths.
              All free, all in plain English.
            </p>

            {/* Search */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics, like 'quarterly taxes' or 'pricing'..."
                className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                aria-label="Search articles"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick links */}
      <section className="border-b border-gray-200 dark:border-navy-800 bg-white dark:bg-navy-950">
        <div className="container-wide py-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: Calculator,
                title: 'Interactive Calculators',
                description: 'Tax estimator, pricing converter, more',
                href: '/learn/calculators',
                color: 'text-teal-600',
                bg: 'bg-teal-50 dark:bg-teal-900/20',
              },
              {
                icon: ClipboardCheck,
                title: 'Financial Health Quiz',
                description: 'Discover your Financial Persona',
                href: '/learn/quiz',
                color: 'text-blue-600',
                bg: 'bg-blue-50 dark:bg-blue-900/20',
              },
              {
                icon: BookOpen,
                title: 'Most Popular Guide',
                description: 'Quarterly Tax Guide for Freelancers',
                href: '/learn/quarterly-tax-guide-freelancers',
                color: 'text-purple-600',
                bg: 'bg-purple-50 dark:bg-purple-900/20',
              },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-navy-800 transition-colors group"
              >
                <div className={cn('p-3 rounded-xl', link.bg)}>
                  <link.icon className={cn('w-6 h-6', link.color)} />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading font-semibold text-body-sm text-navy-900 dark:text-white">
                    {link.title}
                  </h3>
                  <p className="text-caption text-gray-500">{link.description}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-teal-500 group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Articles + Sidebar */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main content */}
            <div className="flex-1">
              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2 mb-8">
                <Filter className="w-4 h-4 text-gray-400 mr-1" />
                {ARTICLE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-body-sm font-medium transition-colors',
                      activeCategory === cat.id
                        ? 'bg-navy-900 text-white dark:bg-teal-500 dark:text-navy-900'
                        : 'bg-gray-100 dark:bg-navy-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-navy-700'
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Level filter */}
              <div className="flex items-center gap-2 mb-8">
                <span className="text-body-sm text-gray-500 mr-2">Level:</span>
                {['all', 'beginner', 'intermediate', 'advanced'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setActiveLevel(level)}
                    className={cn(
                      'px-3 py-1 rounded-lg text-caption font-medium transition-colors capitalize',
                      activeLevel === level
                        ? 'bg-teal-500/10 text-teal-700 dark:text-teal-400'
                        : 'text-gray-400 hover:text-gray-600'
                    )}
                  >
                    {level === 'all' ? 'All Levels' : level}
                  </button>
                ))}
              </div>

              {/* Article grid */}
              <div className="grid sm:grid-cols-2 gap-6">
                {filteredArticles.map((article) => (
                  <Link
                    key={article._id}
                    href={`/learn/${article.slug}`}
                    className="card group overflow-hidden flex flex-col"
                  >
                    {/* Colored top bar based on category */}
                    <div className={cn(
                      'h-1',
                      article.category === 'taxes' && 'bg-red-400',
                      article.category === 'cash-flow' && 'bg-blue-400',
                      article.category === 'pricing' && 'bg-purple-400',
                      article.category === 'savings' && 'bg-teal-400',
                      article.category === 'business-structure' && 'bg-amber-400',
                      article.category === 'compliance' && 'bg-orange-400',
                      article.category === 'mental-health' && 'bg-pink-400',
                    )} />
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="badge-navy capitalize text-caption">{article.category.replace('-', ' ')}</span>
                        <span className="badge bg-gray-100 dark:bg-navy-700 text-gray-500 text-caption capitalize">
                          {article.level}
                        </span>
                      </div>
                      <h3 className="font-heading font-semibold text-heading-sm text-navy-900 dark:text-white mb-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-body-sm text-gray-600 dark:text-gray-400 mb-4 flex-1">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-caption text-gray-400">
                        <span>{article.author.name}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {article.readTime} min read
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {filteredArticles.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-body text-gray-500">No articles match your filters. Try broadening your search.</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="lg:w-80 shrink-0 space-y-6">
              {/* Quiz CTA */}
              <div className="card p-6 bg-gradient-to-br from-navy-900 to-navy-800 text-white border-navy-700">
                <ClipboardCheck className="w-8 h-8 text-teal-400 mb-3" />
                <h3 className="font-heading font-bold text-heading-sm mb-2">
                  What is your Financial Health Score?
                </h3>
                <p className="text-body-sm text-gray-300 mb-4">
                  Take a 2-minute quiz and get a personalized learning path based on your situation.
                </p>
                <Link href="/learn/quiz" className="btn-primary w-full text-body-sm">
                  Take the Quiz
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>

              {/* Trending */}
              <div className="card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-teal-500" />
                  <h3 className="font-heading font-semibold text-body">Trending Topics</h3>
                </div>
                <ul className="space-y-3">
                  {[
                    'Quarterly tax deadlines 2025',
                    'Income smoothing strategies',
                    'S-Corp vs LLC comparison',
                    'Freelancer emergency fund',
                    'Value-based pricing',
                  ].map((topic, i) => (
                    <li key={topic}>
                      <button className="flex items-center gap-3 text-body-sm text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors text-left w-full">
                        <span className="text-caption text-gray-300 font-mono w-5">{String(i + 1).padStart(2, '0')}</span>
                        {topic}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <Disclaimer variant="inline" />
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
