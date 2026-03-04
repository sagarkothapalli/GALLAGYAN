'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Eye, EyeOff, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sanitizeInput, isValidUsername, setAuthToken, setStoredUser } from '@/lib/auth';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState('');
  const [errorKey, setErrorKey] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const passwordStrength = (() => {
    if (password.length === 0) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    return score;
  })();

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][passwordStrength];
  const strengthColor = ['', 'bg-red-500', 'bg-amber-500', 'bg-amber-400', 'bg-emerald-400'][passwordStrength];

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');
    setIsLoading(true);

    const cleanUsername = username.trim().toLowerCase();

    if (!isValidUsername(cleanUsername)) {
      setRegisterError('Username must be 3-30 alphanumeric characters, underscores, dots, or hyphens.');
      setErrorKey((k) => k + 1);
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setRegisterError('Password must be at least 8 characters.');
      setErrorKey((k) => k + 1);
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setRegisterError('Passwords do not match.');
      setErrorKey((k) => k + 1);
      setIsLoading(false);
      return;
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: cleanUsername, passcode: password }),
      });

      if (response.ok) {
        const data = await response.json();
        setStoredUser({ username: data.user.username });
        if (data.access_token) setAuthToken(data.access_token);
        window.location.href = '/';
      } else {
        const err = await response.json();
        setRegisterError(sanitizeInput(err.detail || 'Registration failed.'));
        setErrorKey((k) => k + 1);
      }
    } catch {
      setRegisterError('Could not reach GallaGyan servers. Check your connection.');
      setErrorKey((k) => k + 1);
    } finally {
      setIsLoading(false);
    }
  }, [username, password, confirmPassword]);

  return (
    <div
      className="min-h-screen relative overflow-hidden flex items-center justify-center font-body px-6 py-10"
      style={{ backgroundColor: '#050505' }}
    >
      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 30 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[420px] relative z-10"
      >
        <div
          className="relative p-8 sm:p-10 rounded-[2rem] border"
          style={{
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            borderColor: 'rgba(255,255,255,0.08)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
        >
          {/* Top accent bar */}
          <div
            className="absolute top-0 left-10 right-10 h-[1px] rounded-full"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.4), transparent)' }}
            aria-hidden="true"
          />

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <h1
              className="text-3xl font-black tracking-tight"
              style={{
                color: '#F59E0B',
                textShadow: '0 0 30px rgba(245,158,11,0.4)',
              }}
            >
              GallaGyan
            </h1>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 mt-1">
              India's Smartest Market Companion
            </p>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-3xl font-black text-white leading-tight">
              Create account
            </h2>
            <p className="text-sm text-slate-500 mt-1.5 font-medium">
              Join GallaGyan and start tracking markets
            </p>
          </div>

          {/* Error message */}
          <AnimatePresence mode="wait">
            {registerError && (
              <motion.div
                key={errorKey}
                initial={{ opacity: 0, height: 0 }}
                animate={{
                  opacity: 1,
                  height: 'auto',
                  x: [-8, 8, -8, 8, 0],
                }}
                exit={{ opacity: 0, height: 0 }}
                transition={{
                  opacity: { duration: 0.2 },
                  height: { duration: 0.3 },
                  x: { duration: 0.4, ease: 'easeOut' },
                }}
                className="mb-5 overflow-hidden"
                role="alert"
                aria-live="assertive"
              >
                <div
                  className="px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wide flex items-start gap-2.5"
                  style={{
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.2)',
                    color: '#fca5a5',
                  }}
                >
                  <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-[10px]">!</span>
                  <span>{registerError}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Username field */}
            <div className="space-y-1.5">
              <label
                htmlFor="reg-username"
                className="block text-[10px] font-black uppercase tracking-widest text-slate-500"
              >
                Username
              </label>
              <div className="relative">
                <span
                  className={cn(
                    'absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 pointer-events-none',
                    focusedField === 'username' ? 'text-amber-400' : 'text-slate-600'
                  )}
                >
                  <User size={16} strokeWidth={2} />
                </span>
                <input
                  id="reg-username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="your_username"
                  required
                  className={cn(
                    'w-full py-3.5 pl-11 pr-4 rounded-xl text-sm font-semibold text-white',
                    'placeholder:text-slate-700 placeholder:font-normal',
                    'outline-none transition-all duration-300',
                    'bg-white/[0.04] border',
                    focusedField === 'username'
                      ? 'border-amber-500/50 ring-2 ring-amber-500/20 bg-white/[0.07]'
                      : 'border-white/[0.08] hover:border-white/[0.14]'
                  )}
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <label
                htmlFor="reg-password"
                className="block text-[10px] font-black uppercase tracking-widest text-slate-500"
              >
                Password
              </label>
              <div className="relative">
                <span
                  className={cn(
                    'absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 pointer-events-none',
                    focusedField === 'password' ? 'text-amber-400' : 'text-slate-600'
                  )}
                >
                  <Lock size={16} strokeWidth={2} />
                </span>
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Min 8 chars, uppercase, lowercase, digit"
                  required
                  className={cn(
                    'w-full py-3.5 pl-11 pr-12 rounded-xl text-sm font-semibold text-white',
                    'placeholder:text-slate-700 placeholder:font-normal',
                    'outline-none transition-all duration-300',
                    'bg-white/[0.04] border',
                    focusedField === 'password'
                      ? 'border-amber-500/50 ring-2 ring-amber-500/20 bg-white/[0.07]'
                      : 'border-white/[0.08] hover:border-white/[0.14]'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-amber-400 transition-colors duration-200 p-1 rounded focus:outline-none focus:ring-1 focus:ring-amber-500/40"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword
                    ? <EyeOff size={15} strokeWidth={2} />
                    : <Eye size={15} strokeWidth={2} />
                  }
                </button>
              </div>
              {/* Password strength bar */}
              {password.length > 0 && (
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={cn(
                          'h-1 flex-1 rounded-full transition-colors duration-300',
                          passwordStrength >= level ? strengthColor : 'bg-white/[0.06]'
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">
                    {strengthLabel}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm password field */}
            <div className="space-y-1.5">
              <label
                htmlFor="reg-confirm"
                className="block text-[10px] font-black uppercase tracking-widest text-slate-500"
              >
                Confirm Password
              </label>
              <div className="relative">
                <span
                  className={cn(
                    'absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 pointer-events-none',
                    focusedField === 'confirm' ? 'text-amber-400' : 'text-slate-600'
                  )}
                >
                  <Check size={16} strokeWidth={2} />
                </span>
                <input
                  id="reg-confirm"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onFocus={() => setFocusedField('confirm')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Re-enter your password"
                  required
                  className={cn(
                    'w-full py-3.5 pl-11 pr-4 rounded-xl text-sm font-semibold text-white',
                    'placeholder:text-slate-700 placeholder:font-normal',
                    'outline-none transition-all duration-300',
                    'bg-white/[0.04] border',
                    focusedField === 'confirm'
                      ? 'border-amber-500/50 ring-2 ring-amber-500/20 bg-white/[0.07]'
                      : 'border-white/[0.08] hover:border-white/[0.14]'
                  )}
                />
              </div>
            </div>

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className={cn(
                'relative w-full py-4 rounded-xl font-black text-xs uppercase tracking-[0.28em]',
                'flex items-center justify-center gap-2.5 overflow-hidden',
                'transition-all duration-300 mt-2',
                isLoading
                  ? 'bg-amber-500/60 text-black/50 cursor-not-allowed'
                  : 'bg-amber-500 text-black shadow-lg shadow-amber-500/25 hover:bg-amber-400 hover:shadow-amber-400/35'
              )}
              aria-label="Create account"
            >
              {!isLoading && (
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)',
                    backgroundSize: '200% 100%',
                  }}
                  animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
                />
              )}
              {isLoading ? (
                <div className="w-5 h-5 border-[2.5px] border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                'Create Account'
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-7">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-700">
              Already a member?
            </span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          {/* Login link */}
          <Link
            href="/login"
            className={cn(
              'flex items-center justify-center w-full py-3.5 rounded-xl',
              'text-[11px] font-black uppercase tracking-widest',
              'border border-white/[0.08] text-slate-400',
              'hover:border-amber-500/30 hover:text-amber-400 hover:bg-amber-500/[0.04]',
              'transition-all duration-300'
            )}
          >
            Sign in to your account
          </Link>

          {/* Footer */}
          <p className="mt-6 text-center text-[9px] font-bold uppercase tracking-[0.2em] text-slate-800">
            Protected by industry-grade encryption
          </p>
        </div>
      </motion.div>
    </div>
  );
}
