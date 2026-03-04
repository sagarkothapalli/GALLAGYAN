'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import {
  Menu,
  X,
  Sun,
  Moon,
  ChevronDown,
  BookOpen,
  Calculator,
  ClipboardCheck,
  BarChart3,
  GraduationCap,
} from 'lucide-react';

const learnLinks = [
  { label: 'Education Hub', href: '/learn', icon: BookOpen, description: 'Articles, guides, and resources' },
  { label: 'Calculators', href: '/learn/calculators', icon: Calculator, description: 'Tax estimator, pricing converter, and more' },
  { label: 'Financial Health Quiz', href: '/learn/quiz', icon: ClipboardCheck, description: 'Discover your financial persona' },
];

const navLinks = [
  { label: 'Pricing', href: '/pricing' },
  { label: 'Dashboard', href: '/dashboard' },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [learnOpen, setLearnOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-navy-950/80 backdrop-blur-lg border-b border-gray-200 dark:border-navy-800">
      <nav className="container-wide flex items-center justify-between h-16 md:h-18" aria-label="Main navigation">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-heading font-bold text-xl text-navy-900 dark:text-white">
          <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-navy-900" />
          </div>
          SteadyStack
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {/* Learn Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setLearnOpen(true)}
            onMouseLeave={() => setLearnOpen(false)}
          >
            <button
              className="btn-ghost flex items-center gap-1 text-body-sm"
              aria-expanded={learnOpen}
              aria-haspopup="true"
            >
              <GraduationCap className="w-4 h-4" />
              Learn
              <ChevronDown className={cn('w-4 h-4 transition-transform', learnOpen && 'rotate-180')} />
            </button>
            {learnOpen && (
              <div className="absolute top-full left-0 mt-1 w-80 bg-white dark:bg-navy-800 rounded-2xl shadow-lg border border-gray-200 dark:border-navy-700 p-2 animate-slide-down">
                {learnLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-navy-700 transition-colors"
                  >
                    <link.icon className="w-5 h-5 text-teal-500 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-medium text-body-sm text-navy-900 dark:text-white">{link.label}</div>
                      <div className="text-caption text-gray-500 dark:text-gray-400">{link.description}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="btn-ghost text-body-sm">
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-navy-800 transition-colors"
            aria-label="Toggle dark mode"
          >
            <Sun className="w-5 h-5 hidden dark:block text-gray-400" />
            <Moon className="w-5 h-5 block dark:hidden text-gray-500" />
          </button>
          <Link href="/auth/login" className="btn-ghost text-body-sm">
            Log in
          </Link>
          <Link href="/auth/register" className="btn-primary text-body-sm !py-2.5 !px-5">
            Start Free
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-navy-800"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-navy-800 bg-white dark:bg-navy-950 animate-slide-down">
          <div className="container-wide py-4 space-y-1">
            {learnLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-navy-800"
                onClick={() => setMobileOpen(false)}
              >
                <link.icon className="w-5 h-5 text-teal-500" />
                <span className="font-medium text-body-sm">{link.label}</span>
              </Link>
            ))}
            <hr className="my-2 border-gray-200 dark:border-navy-700" />
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-navy-800 font-medium text-body-sm"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <hr className="my-2 border-gray-200 dark:border-navy-700" />
            <div className="flex items-center gap-3 pt-2">
              <Link href="/auth/login" className="btn-ghost flex-1 text-center text-body-sm">
                Log in
              </Link>
              <Link href="/auth/register" className="btn-primary flex-1 text-center text-body-sm !py-2.5">
                Start Free
              </Link>
            </div>
            <button
              onClick={() => {
                setTheme(theme === 'dark' ? 'light' : 'dark');
              }}
              className="flex items-center gap-2 p-3 text-body-sm text-gray-500 w-full"
            >
              <Sun className="w-4 h-4 hidden dark:block" />
              <Moon className="w-4 h-4 block dark:hidden" />
              <span className="dark:hidden">Dark mode</span>
              <span className="hidden dark:inline">Light mode</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
