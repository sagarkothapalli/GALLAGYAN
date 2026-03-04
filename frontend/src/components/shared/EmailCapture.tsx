'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Mail, ArrowRight, Check, Loader2 } from 'lucide-react';

interface EmailCaptureProps {
  source: string;
  title?: string;
  description?: string;
  buttonText?: string;
  variant?: 'inline' | 'card' | 'minimal';
  className?: string;
  onSuccess?: (email: string) => void;
}

export function EmailCapture({
  source,
  title = 'Get your results via email',
  description = 'We will send you a detailed breakdown plus tips tailored to your situation.',
  buttonText = 'Send My Results',
  variant = 'card',
  className,
  onSuccess,
}: EmailCaptureProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage('Please enter a valid email address.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    try {
      // In production, this calls the backend API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setStatus('success');
      onSuccess?.(email);
    } catch {
      setStatus('error');
      setErrorMessage('Something went wrong. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className={cn('flex items-center gap-3 p-4 bg-teal-50 dark:bg-teal-900/20 rounded-xl', className)}>
        <Check className="w-5 h-5 text-teal-600" />
        <p className="text-body-sm text-teal-800 dark:text-teal-300 font-medium">
          Check your inbox! We sent your results to {email}
        </p>
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <form onSubmit={handleSubmit} className={cn('flex gap-2', className)}>
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setStatus('idle'); }}
          placeholder="your@email.com"
          className="input-field flex-1 !py-2.5"
          aria-label="Email address"
        />
        <button type="submit" disabled={status === 'loading'} className="btn-primary !py-2.5 shrink-0">
          {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
        </button>
      </form>
    );
  }

  return (
    <div className={cn(
      variant === 'card' && 'card p-6',
      className
    )}>
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 bg-teal-500/10 rounded-lg shrink-0">
          <Mail className="w-5 h-5 text-teal-600" />
        </div>
        <div>
          <h3 className="font-heading font-semibold text-heading-sm text-navy-900 dark:text-white">{title}</h3>
          <p className="text-body-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setStatus('idle'); }}
          placeholder="your@email.com"
          className="input-field flex-1"
          aria-label="Email address"
        />
        <button type="submit" disabled={status === 'loading'} className="btn-primary shrink-0">
          {status === 'loading' ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : null}
          {buttonText}
        </button>
      </form>
      {status === 'error' && (
        <p className="text-caption text-red-500 mt-2">{errorMessage}</p>
      )}
      <p className="text-caption text-gray-400 mt-3">
        No spam. Unsubscribe anytime. We respect your privacy.
      </p>
    </div>
  );
}
