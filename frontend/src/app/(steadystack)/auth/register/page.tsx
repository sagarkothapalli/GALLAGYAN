'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BarChart3, Eye, EyeOff, ArrowRight, Check } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const passwordStrength = (() => {
    if (password.length === 0) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await new Promise((r) => setTimeout(r, 1000));
      router.push('/onboarding');
    } catch {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-heading font-bold text-xl text-navy-900 dark:text-white mb-6">
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-navy-900" />
            </div>
            SteadyStack
          </Link>
          <h1 className="font-heading font-bold text-heading-xl text-navy-900 dark:text-white">
            Create your free account
          </h1>
          <p className="text-body text-gray-500 mt-2">
            Takes 5 minutes. No credit card required.
          </p>
        </div>

        <div className="card p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label" htmlFor="fullName">Full name</label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input-field"
                placeholder="Jane Smith"
                required
                autoComplete="name"
              />
            </div>
            <div>
              <label className="label" htmlFor="regEmail">Email address</label>
              <input
                id="regEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="label" htmlFor="regPassword">Password</label>
              <div className="relative">
                <input
                  id="regPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className="input-field pr-10"
                  placeholder="At least 8 characters"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        passwordStrength >= level
                          ? level <= 1 ? 'bg-red-400' : level <= 2 ? 'bg-amber-400' : 'bg-teal-500'
                          : 'bg-gray-200 dark:bg-navy-700'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {error && (
              <p className="text-body-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Creating account...' : 'Create free account'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </form>

          <p className="text-caption text-gray-400 mt-4 text-center">
            By signing up, you agree to our{' '}
            <Link href="/terms" className="underline hover:text-gray-600">Terms</Link> and{' '}
            <Link href="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>.
          </p>
        </div>

        {/* Benefits */}
        <div className="mt-6 space-y-3">
          {[
            'No credit card required',
            'Access to basic banking and 2 free calculators',
            'Financial Health Score quiz included',
          ].map((benefit) => (
            <div key={benefit} className="flex items-center gap-2 text-body-sm text-gray-500">
              <Check className="w-4 h-4 text-teal-500 shrink-0" />
              {benefit}
            </div>
          ))}
        </div>

        <p className="text-center text-body-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-teal-600 font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
