'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Eye, EyeOff, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sanitizeInput, isValidUsername, setAuthToken, setStoredUser } from '@/lib/auth';
import { Lamp } from '@/components/ui/Lamp';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Particle {
  id: number;
  x: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
}

interface TickerItem {
  label: string;
  value: string;
  change: string;
  up: boolean;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const TICKER_ITEMS: TickerItem[] = [
  { label: 'NIFTY 50',   value: '22,450.35', change: '+1.24%', up: true  },
  { label: 'SENSEX',     value: '74,120.90', change: '+0.98%', up: true  },
  { label: 'GOLD',       value: '₹72,450',   change: '+0.56%', up: true  },
  { label: 'NIFTY BANK', value: '48,235.60', change: '-0.32%', up: false },
  { label: 'NIFTY IT',   value: '35,890.10', change: '+1.87%', up: true  },
  { label: 'USDINR',     value: '83.22',     change: '-0.08%', up: false },
  { label: 'CRUDE OIL',  value: '₹6,852',    change: '+0.44%', up: true  },
];

// Deterministic particle generation — SSR safe, no Math.random()
function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id:       i,
    x:        10 + ((i * 79 + 13) % 80),
    size:     1.5 + ((i * 37 + 7)  % 3),
    delay:    (i * 1.37) % 6,
    duration: 7 + ((i * 53 + 11) % 8),
    opacity:  0.15 + ((i * 23 + 5) % 30) / 100,
  }));
}

const PARTICLES = generateParticles(18);

// ── Sub-components ────────────────────────────────────────────────────────────

// Floating dust particles — colour shifts with lamp state
function FloatingParticles({ isLampOn }: { isLampOn: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left:   `${p.x}%`,
            bottom: '-10px',
            width:  p.size,
            height: p.size,
          }}
          animate={{
            y:               [0, -(500 + p.duration * 30)],
            opacity:         [p.opacity, p.opacity * 0.6, 0],
            x:               [0, ((p.id % 3) - 1) * 20],
            backgroundColor: isLampOn ? '#F59E0B' : '#64748b',
          }}
          transition={{
            duration:         p.duration,
            delay:            p.delay,
            repeat:           Infinity,
            ease:             'linear',
            backgroundColor:  { duration: 1.2 },
          }}
        />
      ))}
    </div>
  );
}

// Market ticker band pinned to bottom
function TickerBand() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 overflow-hidden border-t border-white/[0.06]"
      style={{ background: 'rgba(5,5,5,0.92)', backdropFilter: 'blur(12px)' }}
      aria-label="Live market data ticker"
    >
      <div className="flex items-center h-9 whitespace-nowrap ticker-track">
        {items.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 mr-10 flex-shrink-0">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              {item.label}
            </span>
            <span className="text-[11px] font-bold text-white">
              {item.value}
            </span>
            <span className={cn(
              'text-[10px] font-black flex items-center gap-0.5',
              item.up ? 'text-emerald-400' : 'text-rose-400'
            )}>
              {item.up
                ? <TrendingUp  size={10} strokeWidth={3} />
                : <TrendingDown size={10} strokeWidth={3} />}
              {item.change}
            </span>
            <span className="ml-6 text-white/[0.06]">|</span>
          </span>
        ))}
      </div>

      <style jsx>{`
        .ticker-track {
          animation: ticker-scroll 38s linear infinite;
        }
        @keyframes ticker-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .ticker-track { animation: none; }
        }
      `}</style>
    </div>
  );
}

// ── Left Panel — The Lamp ─────────────────────────────────────────────────────

function LampPanel({ isLampOn, onToggle }: { isLampOn: boolean; onToggle: () => void }) {
  return (
    <motion.div
      className="hidden lg:flex flex-col items-center justify-between relative flex-1 overflow-hidden"
      style={{ minHeight: '100dvh' }}
    >
      {/* Ambient background radial — warm when on, cool when off */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: isLampOn
            ? 'radial-gradient(ellipse 70% 55% at 50% 28%, rgba(245,158,11,0.10) 0%, rgba(245,158,11,0.03) 45%, transparent 70%)'
            : 'radial-gradient(ellipse 70% 55% at 50% 28%, rgba(30,41,59,0.25) 0%, transparent 65%)',
        }}
        transition={{ duration: 1.2 }}
        aria-hidden="true"
      />

      {/* Particles — colour controlled by lamp state */}
      <FloatingParticles isLampOn={isLampOn} />

      {/* Subtle vignette on sides */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background: 'radial-gradient(ellipse 120% 100% at 50% 50%, transparent 40%, rgba(5,5,5,0.7) 100%)',
        }}
        aria-hidden="true"
      />

      {/* Lamp component centred, taking up top 2/3 */}
      <div className="w-full flex flex-col items-center flex-1 justify-start pt-8 relative z-10">
        {/*
          The Lamp component owns its own useMotionValue/useSpring.
          We pass isOn derived from form state — no manual toggle.
          The onToggle is a no-op here since the lamp is purely reactive.
        */}
        <Lamp isOn={isLampOn} onToggle={onToggle} />
      </div>

      {/* Brand lockup — fades with lamp state */}
      <motion.div
        className="flex flex-col items-center gap-3 relative z-10 pb-16 px-8"
        animate={{ opacity: isLampOn ? 1 : 0.3 }}
        transition={{ duration: 1 }}
      >
        <motion.h1
          className="text-5xl font-black tracking-tight select-none"
          animate={{
            color:      isLampOn ? '#F59E0B' : '#475569',
            textShadow: isLampOn
              ? '0 0 48px rgba(245,158,11,0.60), 0 0 96px rgba(245,158,11,0.28)'
              : 'none',
          }}
          transition={{ duration: 1 }}
        >
          GallaGyan
        </motion.h1>

        <p className="text-[11px] font-black uppercase tracking-[0.35em] text-slate-600 text-center">
          India's Smartest Market Companion
        </p>

        {/* Amber underline — expands when lamp on */}
        <motion.div
          className="h-[2px] rounded-full"
          animate={{
            width:      isLampOn ? 90  : 18,
            opacity:    isLampOn ? 1   : 0.15,
            background: isLampOn
              ? 'linear-gradient(90deg, transparent, #F59E0B, transparent)'
              : '#1e293b',
          }}
          transition={{ duration: 1 }}
        />

        {/* State hint text */}
        <motion.p
          className="text-[9px] font-bold uppercase tracking-widest text-center"
          animate={{ color: isLampOn ? 'rgba(245,158,11,0.5)' : 'rgba(51,65,85,0.8)' }}
          transition={{ duration: 1 }}
        >
          {isLampOn ? 'Credentials confirmed — lamp is lit' : 'Enter your credentials to light the lamp'}
        </motion.p>
      </motion.div>

      {/* Bottom fade into page background */}
      <div
        className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none z-10"
        style={{ background: 'linear-gradient(to bottom, transparent, #050505)' }}
        aria-hidden="true"
      />
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const [username,     setUsername]     = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading,    setIsLoading]    = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [loginError,   setLoginError]   = useState('');
  const [errorKey,     setErrorKey]     = useState(0);
  const [mounted,      setMounted]      = useState(false);

  const [isLampOn, setIsLampOn] = useState(false);

  // Fields filled determines button active state (only when lamp is on)
  const canSubmit = isLampOn && username.trim().length > 0 && password.length > 0;

  useEffect(() => { setMounted(true); }, []);

  // ── Form submit (unchanged logic) ──────────────────────────────────────────

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);

    const cleanUsername = username.trim().toLowerCase();

    if (!isValidUsername(cleanUsername)) {
      setLoginError('Invalid username format. Use 3–30 alphanumeric characters.');
      setErrorKey((k) => k + 1);
      setIsLoading(false);
      return;
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://gallagyan.onrender.com';
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method:      'POST',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body:        JSON.stringify({ username: cleanUsername, passcode: password }),
      });

      if (response.ok) {
        const data = await response.json();
        setStoredUser({ username: data.user.username });
        if (data.access_token) setAuthToken(data.access_token);
        window.location.href = '/';
      } else {
        const err = await response.json();
        setLoginError(sanitizeInput(err.detail || 'Authentication failed.'));
        setErrorKey((k) => k + 1);
      }
    } catch {
      setLoginError('Could not reach GallaGyan servers. Check your connection.');
      setErrorKey((k) => k + 1);
    } finally {
      setIsLoading(false);
    }
  }, [username, password]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      className="min-h-screen relative overflow-hidden flex font-body"
      style={{ backgroundColor: '#050505' }}
    >
      {/* Global noise texture */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
        aria-hidden="true"
      />

      {/* ── Left panel — the lamp (desktop only) ───────────────────────────── */}
      <LampPanel isLampOn={isLampOn} onToggle={() => setIsLampOn(v => !v)} />

      {/* ── Vertical divider (desktop) ─────────────────────────────────────── */}
      <motion.div
        className="hidden lg:block w-px self-stretch my-16 flex-shrink-0"
        animate={{
          background: isLampOn
            ? 'linear-gradient(to bottom, transparent, rgba(245,158,11,0.15), transparent)'
            : 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.05), transparent)',
        }}
        transition={{ duration: 1 }}
        aria-hidden="true"
      />

      {/* ── Right panel — login form ───────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 pb-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 32 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[420px]"
        >
          {/* ── Glass form card ─────────────────────────────────────────────── */}
          <motion.div
            className="relative p-8 sm:p-10 rounded-[2.5rem] border"
            animate={{
              boxShadow: isLampOn
                ? '0 32px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(245,158,11,0.08), inset 0 1px 0 rgba(255,255,255,0.07)'
                : '0 32px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
            transition={{ duration: 1 }}
            style={{
              background:          'rgba(255,255,255,0.03)',
              backdropFilter:      'blur(40px)',
              WebkitBackdropFilter:'blur(40px)',
              borderColor:         'rgba(255,255,255,0.08)',
            }}
          >
            {/* Top amber glow bar — visible only when lamp is on */}
            <motion.div
              className="absolute top-0 left-10 right-10 h-[1px] rounded-full"
              animate={{
                background: isLampOn
                  ? 'linear-gradient(90deg, transparent, rgba(245,158,11,0.55), transparent)'
                  : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)',
                opacity: isLampOn ? 1 : 0.4,
              }}
              transition={{ duration: 0.8 }}
              aria-hidden="true"
            />

            {/* ── Logo mark ─────────────────────────────────────────────── */}
            <div className="flex flex-col items-center mb-8">
              {/* Amber G badge */}
              <motion.div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 relative"
                animate={{
                  background: isLampOn
                    ? 'rgba(245,158,11,0.15)'
                    : 'rgba(255,255,255,0.04)',
                  borderColor: isLampOn
                    ? 'rgba(245,158,11,0.30)'
                    : 'rgba(255,255,255,0.08)',
                  boxShadow: isLampOn
                    ? '0 0 32px rgba(245,158,11,0.25), inset 0 1px 0 rgba(245,158,11,0.2)'
                    : 'none',
                }}
                transition={{ duration: 0.8 }}
                style={{ border: '1px solid' }}
              >
                <motion.span
                  className="text-2xl font-black select-none"
                  animate={{
                    color:      isLampOn ? '#F59E0B' : '#475569',
                    textShadow: isLampOn ? '0 0 20px rgba(245,158,11,0.6)' : 'none',
                  }}
                  transition={{ duration: 0.8 }}
                >
                  G
                </motion.span>
              </motion.div>

              {/* Mobile-only brand name */}
              <div className="lg:hidden flex flex-col items-center gap-1 mb-2">
                <h1
                  className="text-2xl font-black tracking-tight"
                  style={{ color: '#F59E0B' }}
                >
                  GallaGyan
                </h1>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600">
                  India's Smartest Market Companion
                </p>
              </div>
            </div>

            {/* ── Heading ─────────────────────────────────────────────────── */}
            <div className="mb-7 text-center">
              <h2 className="text-4xl font-black text-white leading-tight tracking-tight">
                Welcome Back
              </h2>
              <p className="text-sm text-slate-500 mt-2 font-medium">
                Login to your market command center
              </p>
            </div>

            {/* ── Error message ────────────────────────────────────────────── */}
            <AnimatePresence mode="wait">
              {loginError && (
                <motion.div
                  key={errorKey}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{
                    opacity: 1,
                    height:  'auto',
                    x:       [-8, 8, -8, 8, 0],
                  }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{
                    opacity: { duration: 0.2 },
                    height:  { duration: 0.3 },
                    x:       { duration: 0.4, ease: 'easeOut' },
                  }}
                  className="mb-5 overflow-hidden"
                  role="alert"
                  aria-live="assertive"
                >
                  <div
                    className="px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wide flex items-start gap-2.5"
                    style={{
                      background: 'rgba(239,68,68,0.10)',
                      border:     '1px solid rgba(239,68,68,0.20)',
                      color:      '#fca5a5',
                    }}
                  >
                    <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-[10px] font-black">
                      !
                    </span>
                    <span>{loginError}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Lamp off hint (desktop) ──────────────────────────────── */}
            <AnimatePresence>
              {!isLampOn && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-5 overflow-hidden"
                >
                  <div className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-white/5 bg-white/[0.02] text-center justify-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                      Pull the cord on the left to turn on the lamp
                    </span>
                    <span className="text-amber-500/50 text-sm">☞</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Form ────────────────────────────────────────────────────── */}
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <fieldset disabled={!isLampOn} className={cn('space-y-4 transition-opacity duration-500', !isLampOn && 'opacity-30 pointer-events-none')}>

              {/* Username field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="username"
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
                    id="username"
                    type="text"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onFocus={() => setFocusedField('username')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="your_username"
                    required
                    className={cn(
                      'w-full py-3.5 pl-11 pr-4 rounded-2xl text-sm font-semibold text-white',
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
                  htmlFor="password"
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
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="••••••••"
                    required
                    className={cn(
                      'w-full py-3.5 pl-11 pr-12 rounded-2xl text-sm font-semibold text-white',
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
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-amber-400 transition-colors duration-200 p-1 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500/40"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword
                      ? <EyeOff size={15} strokeWidth={2} />
                      : <Eye    size={15} strokeWidth={2} />}
                  </button>
                </div>
              </div>

              {/* Forgot password */}
              <div className="flex justify-end pt-0.5">
                <Link
                  href="/forgot-password"
                  className="text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-amber-400 transition-colors duration-200"
                >
                  Forgot password?
                </Link>
              </div>

              </fieldset>

              {/* Submit button — grey/disabled when fields empty, golden when filled */}
              <motion.button
                type="submit"
                disabled={isLoading || !canSubmit}
                whileHover={{ scale: (isLoading || !canSubmit) ? 1 : 1.02 }}
                whileTap={{ scale:   (isLoading || !canSubmit) ? 1 : 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className={cn(
                  'relative w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.28em]',
                  'flex items-center justify-center gap-2.5 overflow-hidden',
                  'transition-all duration-500',
                  isLoading
                    ? 'bg-amber-500/50 text-black/40 cursor-not-allowed'
                    : canSubmit
                      ? 'bg-amber-500 text-black cursor-pointer'
                      : 'bg-white/[0.06] text-slate-600 cursor-not-allowed border border-white/[0.07]'
                )}
                animate={{
                  boxShadow: canSubmit && !isLoading
                    ? '0 8px 32px rgba(245,158,11,0.35), 0 0 0 1px rgba(245,158,11,0.15)'
                    : '0 0 0px transparent',
                }}
                aria-label="Sign in"
              >
                {/* Shimmer sweep — only when active */}
                {canSubmit && !isLoading && (
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:     'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)',
                      backgroundSize: '200% 100%',
                    }}
                    animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
                  />
                )}

                {isLoading ? (
                  <div className="w-5 h-5 border-[2.5px] border-black/20 border-t-black rounded-full animate-spin" />
                ) : canSubmit ? (
                  'Sign In'
                ) : (
                  'Enter credentials to continue'
                )}
              </motion.button>
            </form>

            {/* ── Divider ──────────────────────────────────────────────────── */}
            <div className="flex items-center gap-4 my-7">
              <div className="flex-1 h-px bg-white/[0.06]" />
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-700">
                New here?
              </span>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>

            {/* ── Create account link ───────────────────────────────────────── */}
            <Link
              href="/register"
              className={cn(
                'flex items-center justify-center w-full py-3.5 rounded-2xl',
                'text-[11px] font-black uppercase tracking-widest',
                'border border-white/[0.08] text-slate-400',
                'hover:border-amber-500/30 hover:text-amber-400 hover:bg-amber-500/[0.04]',
                'transition-all duration-300'
              )}
            >
              Don't have an account? Register
            </Link>

            {/* ── Footer note ──────────────────────────────────────────────── */}
            <p className="mt-6 text-center text-[9px] font-bold uppercase tracking-[0.2em] text-slate-800">
              Protected by industry-grade encryption
              <br />
              &copy; 2026 GallaGyan — All rights reserved
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Bottom live market ticker ──────────────────────────────────────── */}
      <TickerBand />
    </div>
  );
}
