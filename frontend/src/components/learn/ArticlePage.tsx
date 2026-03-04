'use client';

import Link from 'next/link';
import { ArrowLeft, Clock, Calendar, ArrowRight, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Disclaimer } from '@/components/shared/Disclaimer';
import { EmailCapture } from '@/components/shared/EmailCapture';
import { MOCK_ARTICLES } from '@/data/mock-articles';
import type { Article } from '@/types';

interface ArticlePageProps {
  article: Article | null;
}

// Schema.org structured data for articles
function ArticleSchema({ article }: { article: Article }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: {
      '@type': 'Person',
      name: article.author.name,
      jobTitle: article.author.title,
    },
    publisher: {
      '@type': 'Organization',
      name: 'SteadyStack',
      url: 'https://steadystack.com',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://steadystack.com/learn/${article.slug}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function ArticlePage({ article }: ArticlePageProps) {
  if (!article) {
    return (
      <div className="container-narrow section-padding text-center">
        <h1 className="text-heading-xl font-heading mb-4">Article not found</h1>
        <p className="text-body text-gray-500 mb-8">The article you are looking for does not exist.</p>
        <Link href="/learn" className="btn-primary">
          Back to Education Hub
        </Link>
      </div>
    );
  }

  const relatedArticles = MOCK_ARTICLES.filter(
    (a) => a.category === article.category && a._id !== article._id
  ).slice(0, 3);

  // Generate mock body content for demo
  const bodyContent = `
## Why This Matters for Freelancers

As a freelancer, ${article.category === 'taxes' ? 'understanding your tax obligations' : 'managing your finances'} is one of the most important skills you can develop. Unlike traditional employees who have taxes withheld automatically, you are responsible for estimating and paying your own taxes throughout the year.

### The Core Concept

${article.excerpt}

Many freelancers make the mistake of waiting until April to think about taxes. By then, penalties and interest have already started accumulating. The key is to build a system that works automatically, so you can focus on what you do best — your craft.

### Step-by-Step Guide

**1. Know Your Numbers**

Start by tracking every dollar that comes in and goes out. This is not about being obsessive — it is about having the data you need to make smart decisions.

**2. Set Up the Right Structure**

The 3-account system (Business Checking, Tax Savings, Personal Draw) creates clear boundaries between business money and personal money. When a client pays you, a percentage automatically moves to your tax savings account.

**3. Automate Everything**

The best financial system is one you do not have to think about. Set up automatic transfers, track expenses with an app, and schedule quarterly tax payments in advance.

### Common Mistakes to Avoid

- **Underestimating self-employment tax:** At 15.3%, this catches many new freelancers off guard.
- **Missing quarterly deadlines:** The IRS expects payments on April 15, June 15, September 15, and January 15.
- **Not tracking deductions:** Home office, software, equipment, mileage — these add up fast.

### Your Next Steps

Use our interactive calculators to get specific numbers for your situation, then build your personalized financial plan.
  `;

  return (
    <>
      <ArticleSchema article={article} />

      <article className="section-padding">
        <div className="container-wide">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main content */}
            <div className="flex-1 max-w-3xl">
              {/* Breadcrumb */}
              <Link
                href="/learn"
                className="inline-flex items-center gap-2 text-body-sm text-gray-500 hover:text-teal-600 mb-6"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Education Hub
              </Link>

              {/* Category + Level */}
              <div className="flex items-center gap-2 mb-4">
                <span className="badge-teal capitalize">{article.category.replace('-', ' ')}</span>
                <span className="badge-navy capitalize">{article.level}</span>
              </div>

              {/* Title */}
              <h1 className="text-heading-xl md:text-display font-heading mb-4 text-navy-900 dark:text-white">
                {article.title}
              </h1>

              {/* Excerpt */}
              <p className="text-body-lg text-gray-600 dark:text-gray-400 mb-6">
                {article.excerpt}
              </p>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 mb-8 pb-8 border-b border-gray-200 dark:border-navy-700">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-teal-500/10 rounded-full flex items-center justify-center text-body-sm font-bold text-teal-600">
                    {article.author.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-body-sm font-medium text-navy-900 dark:text-white">{article.author.name}</p>
                    <p className="text-caption text-gray-500">{article.author.title}</p>
                  </div>
                </div>
                <span className="text-gray-300 dark:text-navy-600">|</span>
                <span className="flex items-center gap-1 text-body-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="flex items-center gap-1 text-body-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  {article.readTime} min read
                </span>
              </div>

              {/* Article body */}
              <div className="prose prose-lg dark:prose-invert max-w-none
                prose-headings:font-heading prose-headings:text-navy-900 dark:prose-headings:text-white
                prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed
                prose-a:text-teal-600 dark:prose-a:text-teal-400 prose-a:no-underline hover:prose-a:underline
                prose-strong:text-navy-900 dark:prose-strong:text-white
                prose-li:text-gray-700 dark:prose-li:text-gray-300
                prose-h2:text-heading-lg prose-h3:text-heading-sm
                mb-8
              ">
                {bodyContent.split('\n').map((line, i) => {
                  if (line.startsWith('## ')) return <h2 key={i}>{line.replace('## ', '')}</h2>;
                  if (line.startsWith('### ')) return <h3 key={i}>{line.replace('### ', '')}</h3>;
                  if (line.startsWith('**') && line.endsWith('**')) return <p key={i}><strong>{line.replace(/\*\*/g, '')}</strong></p>;
                  if (line.startsWith('- **')) {
                    const parts = line.replace('- **', '').split(':**');
                    return <li key={i}><strong>{parts[0]}:</strong>{parts[1]}</li>;
                  }
                  if (line.trim()) return <p key={i}>{line}</p>;
                  return null;
                })}
              </div>

              {/* Calculator embed CTA */}
              <div className="card p-6 bg-gray-50 dark:bg-navy-800 mb-8">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-teal-500/10 rounded-xl">
                    <BookOpen className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-heading-sm text-navy-900 dark:text-white mb-1">
                      Put this into practice
                    </h3>
                    <p className="text-body-sm text-gray-600 dark:text-gray-400 mb-3">
                      Use our interactive calculators to apply what you learned with your own numbers.
                    </p>
                    <Link href="/learn/calculators" className="btn-primary text-body-sm !py-2.5">
                      Open Calculators
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-8">
                {article.tags.map((tag) => (
                  <span key={tag} className="badge-navy capitalize">{tag.replace('-', ' ')}</span>
                ))}
              </div>

              {/* Author bio */}
              <div className="card p-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-teal-500/10 rounded-full flex items-center justify-center text-body font-bold text-teal-600 shrink-0">
                    {article.author.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-body text-navy-900 dark:text-white">
                      {article.author.name}
                    </p>
                    <p className="text-body-sm text-gray-500 mb-2">{article.author.title}</p>
                    <p className="text-body-sm text-gray-600 dark:text-gray-400">{article.author.bio}</p>
                  </div>
                </div>
              </div>

              {/* Compliance review date */}
              <p className="text-caption text-gray-400 mb-4">
                Content reviewed for accuracy: {new Date(article.updatedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>

              <Disclaimer variant="footer" />

              {/* Related articles */}
              {relatedArticles.length > 0 && (
                <div className="mt-12">
                  <h2 className="font-heading font-bold text-heading mb-6 text-navy-900 dark:text-white">
                    Related Articles
                  </h2>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {relatedArticles.map((related) => (
                      <Link key={related._id} href={`/learn/${related.slug}`} className="card p-4 group">
                        <span className="badge-navy text-caption capitalize mb-2">
                          {related.category.replace('-', ' ')}
                        </span>
                        <h3 className="font-heading font-semibold text-body-sm text-navy-900 dark:text-white group-hover:text-teal-600 transition-colors">
                          {related.title}
                        </h3>
                        <p className="text-caption text-gray-500 mt-2">
                          {related.readTime} min read
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sticky sidebar */}
            <aside className="lg:w-80 shrink-0">
              <div className="lg:sticky lg:top-24 space-y-6">
                {/* Account CTA */}
                <div className="card p-6 bg-gradient-to-br from-teal-500 to-teal-600 text-navy-900 border-teal-400">
                  <h3 className="font-heading font-bold text-heading-sm mb-2">
                    Ready to take action?
                  </h3>
                  <p className="text-body-sm opacity-90 mb-4">
                    Open a free SteadyStack account and put these strategies to work automatically.
                  </p>
                  <Link href="/auth/register" className="inline-flex items-center justify-center w-full px-6 py-3 bg-navy-900 text-white rounded-xl font-semibold hover:bg-navy-800 transition-colors text-body-sm">
                    Start Free
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </div>

                {/* Email capture */}
                <EmailCapture
                  source={`article-${article.slug}`}
                  title="Get weekly insights"
                  description="One email per week with actionable freelance finance tips."
                  buttonText="Subscribe"
                />

                {/* Quiz CTA */}
                <div className="card p-5">
                  <h3 className="font-heading font-semibold text-body text-navy-900 dark:text-white mb-2">
                    Not sure where to start?
                  </h3>
                  <p className="text-body-sm text-gray-500 mb-3">
                    Take the Financial Health Quiz to get a personalized reading list.
                  </p>
                  <Link href="/learn/quiz" className="text-body-sm text-teal-600 dark:text-teal-400 font-medium hover:underline inline-flex items-center gap-1">
                    Take the Quiz
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </article>
    </>
  );
}
