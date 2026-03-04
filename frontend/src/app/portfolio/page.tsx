'use client';

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Plus,
  X,
  Info,
  IndianRupee,
  Percent,
  Calendar,
  Package,
  ChevronLeft,
  Trash2,
  BarChart3,
  Receipt,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Types ──────────────────────────────────────────────────────────────────────

// Shape used in page.tsx main dashboard — kept identical for localStorage compat
interface PortfolioItem {
  symbol: string;
  avgPrice: number;
  units: number;
  date: string;
}

// Internal enriched shape for this page (derived from PortfolioItem)
interface Position {
  id: string;          // synthetic id derived from index
  symbol: string;
  companyName: string;
  quantity: number;
  avgBuyPrice: number;
  purchaseDate: string; // ISO date string
}

interface PositionWithLiveData extends Position {
  currentPrice: number;
  investedValue: number;
  currentValue: number;
  pnl: number;
  pnlPercent: number;
  holdingDays: number;
  isLTCG: boolean;
}

interface TaxBreakdown {
  position: PositionWithLiveData;
  sellValue: number;
  stt: number;
  taxableGain: number;
  taxType: 'STCG' | 'LTCG';
  taxRate: number;
  ltcgExemption: number;
  taxAmount: number;
  netInHand: number;
}

type TooltipKey = 'stt' | 'stcg' | 'ltcg' | null;

// ── API base ──────────────────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://gallagyan.onrender.com';

// ── Helpers to convert between localStorage shape and internal shape ──────────

function portfolioItemToPosition(item: PortfolioItem, index: number): Position {
  const sym = item.symbol.toUpperCase().replace('.NS', '').replace('.BO', '');
  return {
    id:           `pos-${index}-${sym}`,
    symbol:       sym,
    companyName:  `${sym} Ltd`, // will be replaced by API name
    quantity:     item.units,
    avgBuyPrice:  item.avgPrice,
    purchaseDate: item.date,
  };
}

function positionToPortfolioItem(pos: Position): PortfolioItem {
  return {
    symbol:   pos.symbol,
    avgPrice: pos.avgBuyPrice,
    units:    pos.quantity,
    date:     pos.purchaseDate,
  };
}

// ── Tax calculation helpers ────────────────────────────────────────────────────

const LTCG_EXEMPTION = 125_000; // ₹1,25,000 (Budget 2024)
const LTCG_RATE      = 0.125;   // 12.5%
const STCG_RATE      = 0.20;    // 20%
const STT_RATE       = 0.001;   // 0.1%

function calcTaxBreakdown(pos: PositionWithLiveData): TaxBreakdown {
  const sellValue    = pos.currentValue;
  const stt          = parseFloat((sellValue * STT_RATE).toFixed(2));
  const rawGain      = pos.pnl;
  const taxType      = pos.isLTCG ? 'LTCG' : 'STCG';

  let taxableGain    = 0;
  let ltcgExemption  = 0;
  let taxRate        = 0;
  let taxAmount      = 0;

  if (taxType === 'LTCG') {
    taxRate       = LTCG_RATE;
    ltcgExemption = Math.min(rawGain, LTCG_EXEMPTION);
    taxableGain   = Math.max(0, rawGain - LTCG_EXEMPTION);
    taxAmount     = parseFloat((taxableGain * LTCG_RATE).toFixed(2));
  } else {
    taxRate       = STCG_RATE;
    taxableGain   = Math.max(0, rawGain);
    taxAmount     = parseFloat((taxableGain * STCG_RATE).toFixed(2));
  }

  const netInHand = parseFloat((sellValue - stt - taxAmount).toFixed(2));

  return {
    position: pos,
    sellValue,
    stt,
    taxableGain,
    taxType,
    taxRate,
    ltcgExemption,
    taxAmount,
    netInHand,
  };
}

// ── Formatters ─────────────────────────────────────────────────────────────────

function fmtINR(n: number, decimals = 2): string {
  const abs = Math.abs(n);
  let formatted: string;
  if (abs >= 1_00_00_000) {
    formatted = (abs / 1_00_00_000).toFixed(2) + ' Cr';
  } else if (abs >= 1_00_000) {
    formatted = (abs / 1_00_000).toFixed(2) + ' L';
  } else {
    formatted = abs.toLocaleString('en-IN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }
  return (n < 0 ? '-' : '') + '₹' + formatted;
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function holdingDays(iso: string): number {
  const d = new Date(iso);
  return Math.floor((Date.now() - d.getTime()) / 86_400_000);
}

// ── Static particles ───────────────────────────────────────────────────────────

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id:       i,
  x:        10 + ((i * 79 + 13) % 80),
  size:     1 + ((i * 37 + 7)  % 3),
  delay:    (i * 1.37) % 6,
  duration: 8 + ((i * 53 + 11) % 9),
  opacity:  0.10 + ((i * 23 + 5) % 20) / 100,
}));

// ── localStorage key (must match page.tsx dashboard) ──────────────────────────

const PORTFOLIO_STORAGE_KEY = 'portfolio';

// ── Sub-components ────────────────────────────────────────────────────────────

// Ambient floating particles
function FloatingParticles() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-amber-400"
          style={{ left: `${p.x}%`, bottom: '-8px', width: p.size, height: p.size, opacity: p.opacity }}
          animate={{
            y:       [0, -(600 + p.duration * 25)],
            opacity: [p.opacity, p.opacity * 0.5, 0],
            x:       [0, ((p.id % 3) - 1) * 15],
          }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'linear' }}
        />
      ))}
    </div>
  );
}

// Amber accent bar before section headers
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-1 h-4 bg-amber-500 rounded-full flex-shrink-0" />
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
        {children}
      </span>
    </div>
  );
}

// Glassmorphism card wrapper
function GlassCard({
  children,
  className,
  hover = false,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={hover ? { y: -3, scale: 1.01 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className={cn(
        'relative rounded-[2.5rem] border overflow-hidden',
        onClick && 'cursor-pointer',
        className,
      )}
      style={{
        background:           'rgba(255,255,255,0.02)',
        backdropFilter:       'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
        borderColor:          'rgba(255,255,255,0.08)',
        boxShadow:            '0 24px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      {/* Top specular highlight */}
      <div
        className="absolute top-0 left-8 right-8 h-[1px] rounded-full pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)' }}
        aria-hidden="true"
      />
      {children}
    </motion.div>
  );
}

// Summary stat card
function SummaryCard({
  label,
  value,
  subtext,
  icon: Icon,
  accent,
  delay,
}: {
  label:    string;
  value:    React.ReactNode;
  subtext?: React.ReactNode;
  icon:     React.ElementType;
  accent:   'amber' | 'white' | 'emerald' | 'rose' | 'slate';
  delay:    number;
}) {
  const accentStyles = {
    amber:   { color: '#F59E0B', glow: 'rgba(245,158,11,0.15)' },
    white:   { color: '#ffffff', glow: 'rgba(255,255,255,0.07)' },
    emerald: { color: '#34D399', glow: 'rgba(52,211,153,0.15)' },
    rose:    { color: '#FB7185', glow: 'rgba(251,113,133,0.15)' },
    slate:   { color: '#94A3B8', glow: 'rgba(148,163,184,0.10)' },
  }[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <GlassCard hover className="p-6">
        <div className="flex items-start justify-between mb-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            {label}
          </span>
          <div
            className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: accentStyles.glow }}
          >
            <Icon size={17} style={{ color: accentStyles.color }} strokeWidth={2.5} />
          </div>
        </div>
        <div className="text-2xl font-black text-white leading-none" style={{ color: accentStyles.color }}>
          {value}
        </div>
        {subtext && (
          <div className="mt-1.5 text-[11px] font-semibold text-slate-500">
            {subtext}
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
}

// Info tooltip mini-modal
function InfoTooltip({
  tooltipKey,
  activeKey,
  onClose,
}: {
  tooltipKey: NonNullable<TooltipKey>;
  activeKey:  TooltipKey;
  onClose:    () => void;
}) {
  const content: Record<NonNullable<TooltipKey>, { title: string; body: string; rate: string }> = {
    stt: {
      title: 'Securities Transaction Tax (STT)',
      body:  'STT is a tax levied by the Government of India on every securities transaction done on a recognised stock exchange. It is applied on the sell value and is non-negotiable regardless of profit or loss.',
      rate:  '0.1% on sell value',
    },
    stcg: {
      title: 'Short-Term Capital Gains (STCG)',
      body:  'If you sell equity shares or equity mutual fund units held for less than 12 months, the profit is treated as Short-Term Capital Gain. As per Union Budget 2024, STCG on listed equities is taxed at a flat rate of 20%.',
      rate:  '20% flat on profit (Budget 2024)',
    },
    ltcg: {
      title: 'Long-Term Capital Gains (LTCG)',
      body:  'If you hold equity shares or equity mutual funds for more than 12 months before selling, profits are treated as Long-Term Capital Gain. Budget 2024 revised the LTCG rate to 12.5% (from 10%) but increased the exemption limit to ₹1,25,000 per year.',
      rate:  '12.5% on gains above ₹1,25,000 exemption (Budget 2024)',
    },
  };

  const info = content[tooltipKey];

  return (
    <AnimatePresence>
      {activeKey === tooltipKey && (
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: 8 }}
          transition={{ duration: 0.22, ease: [0.34, 1.56, 0.64, 1] }}
          className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 z-50 w-72"
          role="tooltip"
        >
          <div
            className="rounded-2xl border p-4"
            style={{
              background:           'rgba(10,10,10,0.95)',
              backdropFilter:       'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderColor:          'rgba(245,158,11,0.25)',
              boxShadow:            '0 16px 40px rgba(0,0,0,0.7)',
            }}
          >
            <button
              onClick={onClose}
              className="absolute top-2.5 right-2.5 text-slate-600 hover:text-white transition-colors"
              aria-label="Close tooltip"
            >
              <X size={13} />
            </button>
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-1.5">
              {info.title}
            </p>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-2.5">
              {info.body}
            </p>
            <div
              className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-amber-400"
              style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}
            >
              Rate: {info.rate}
            </div>
          </div>
          {/* Pointer */}
          <div className="flex justify-center">
            <div
              className="w-3 h-3 rotate-45 -mt-1.5"
              style={{ background: 'rgba(10,10,10,0.95)', border: '1px solid rgba(245,158,11,0.25)' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Tax breakdown modal
function TaxModal({
  breakdown,
  onClose,
}: {
  breakdown: TaxBreakdown;
  onClose:   () => void;
}) {
  const [activeTooltip, setActiveTooltip] = useState<TooltipKey>(null);

  const toggleTooltip = (key: NonNullable<TooltipKey>) => {
    setActiveTooltip((prev) => (prev === key ? null : key));
  };

  const pos          = breakdown.position;
  const gainPositive = breakdown.taxableGain > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={`Tax breakdown for ${pos.symbol}`}
    >
      <motion.div
        initial={{ scale: 0.88, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.88, opacity: 0, y: 24 }}
        transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
        className="w-full max-w-lg"
      >
        <div
          className="relative rounded-[2.5rem] border overflow-hidden"
          style={{
            background:           'rgba(8,8,8,0.96)',
            backdropFilter:       'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            borderColor:          'rgba(255,255,255,0.09)',
            boxShadow:            '0 40px 100px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          {/* Amber top glow strip */}
          <div
            className="absolute top-0 left-0 right-0 h-[1px]"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.5), transparent)' }}
            aria-hidden="true"
          />

          <div className="p-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">
                  Tax Breakdown
                </p>
                <h2 className="text-2xl font-black text-white">
                  {pos.symbol}
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">{pos.companyName}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2.5 rounded-xl border border-white/[0.08] text-slate-500 hover:text-white hover:border-white/20 transition-all duration-200"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Position summary strip */}
            <div
              className="rounded-2xl p-4 mb-6 grid grid-cols-3 gap-4"
              style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1">Units</p>
                <p className="text-sm font-black text-white">{pos.quantity}</p>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1">Buy Price</p>
                <p className="text-sm font-black text-white">{fmtINR(pos.avgBuyPrice)}</p>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1">Holding</p>
                <div className={cn(
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest',
                  pos.isLTCG
                    ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20'
                    : 'bg-amber-400/10 text-amber-400 border border-amber-400/20'
                )}>
                  {pos.isLTCG ? <CheckCircle2 size={9} /> : <Clock size={9} />}
                  {pos.holdingDays}d
                </div>
              </div>
            </div>

            {/* Line items */}
            <div className="space-y-3">

              {/* Sell Value */}
              <div className="flex items-center justify-between py-3 border-b border-white/[0.05]">
                <span className="text-sm text-slate-400 font-semibold">Sell Value</span>
                <span className="text-sm font-black text-white">{fmtINR(breakdown.sellValue)}</span>
              </div>

              {/* STT */}
              <div className="flex items-center justify-between py-3 border-b border-white/[0.05]">
                <div className="flex items-center gap-2 relative">
                  <span className="text-sm text-slate-400 font-semibold">STT (0.1%)</span>
                  <button
                    onClick={() => toggleTooltip('stt')}
                    className="text-slate-600 hover:text-amber-400 transition-colors relative"
                    aria-label="Learn about STT"
                  >
                    <Info size={13} />
                    <InfoTooltip tooltipKey="stt" activeKey={activeTooltip} onClose={() => setActiveTooltip(null)} />
                  </button>
                </div>
                <span className="text-sm font-black text-rose-400">-{fmtINR(breakdown.stt)}</span>
              </div>

              {/* Tax type */}
              <div className="flex items-center justify-between py-3 border-b border-white/[0.05]">
                <div className="flex items-center gap-2 relative">
                  <span className="text-sm text-slate-400 font-semibold">
                    Tax Type
                  </span>
                  <button
                    onClick={() => toggleTooltip(breakdown.taxType === 'LTCG' ? 'ltcg' : 'stcg')}
                    className="text-slate-600 hover:text-amber-400 transition-colors relative"
                    aria-label={`Learn about ${breakdown.taxType}`}
                  >
                    <Info size={13} />
                    <InfoTooltip
                      tooltipKey={breakdown.taxType === 'LTCG' ? 'ltcg' : 'stcg'}
                      activeKey={activeTooltip}
                      onClose={() => setActiveTooltip(null)}
                    />
                  </button>
                </div>
                <span className={cn(
                  'text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-xl border',
                  breakdown.taxType === 'LTCG'
                    ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20'
                    : 'bg-amber-400/10 text-amber-400 border-amber-400/20'
                )}>
                  {breakdown.taxType} — {(breakdown.taxRate * 100).toFixed(1)}%
                </span>
              </div>

              {/* LTCG exemption if applicable */}
              {breakdown.taxType === 'LTCG' && breakdown.ltcgExemption > 0 && (
                <div className="flex items-center justify-between py-3 border-b border-white/[0.05]">
                  <span className="text-sm text-slate-400 font-semibold">LTCG Exemption</span>
                  <span className="text-sm font-black text-emerald-400">+{fmtINR(breakdown.ltcgExemption)}</span>
                </div>
              )}

              {/* Taxable gain */}
              <div className="flex items-center justify-between py-3 border-b border-white/[0.05]">
                <span className="text-sm text-slate-400 font-semibold">Taxable Gain</span>
                <span className={cn(
                  'text-sm font-black',
                  gainPositive ? 'text-white' : 'text-emerald-400'
                )}>
                  {gainPositive ? fmtINR(breakdown.taxableGain) : '₹0 (No tax)'}
                </span>
              </div>

              {/* Tax amount */}
              <div className="flex items-center justify-between py-3 border-b border-white/[0.05]">
                <span className="text-sm text-slate-400 font-semibold">Tax Amount</span>
                <span className="text-sm font-black text-rose-400">
                  {breakdown.taxAmount > 0 ? `-${fmtINR(breakdown.taxAmount)}` : '₹0'}
                </span>
              </div>

              {/* Net In Hand — highlighted */}
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                className="rounded-2xl p-4 flex items-center justify-between"
                style={{
                  background: 'linear-gradient(135deg, rgba(245,158,11,0.10) 0%, rgba(245,158,11,0.04) 100%)',
                  border:     '1px solid rgba(245,158,11,0.25)',
                }}
              >
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-0.5">
                    Net In Hand
                  </p>
                  <p className="text-[10px] text-slate-600 font-semibold">
                    After STT + {breakdown.taxType}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-amber-400">
                    {fmtINR(breakdown.netInHand)}
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Disclaimer */}
            <p className="mt-5 text-[9px] text-slate-700 font-semibold leading-relaxed">
              Estimates based on Indian Budget 2024 tax rules. Actual tax liability may vary. Consult a qualified financial advisor or CA for personalised advice.
            </p>

            {/* Close button */}
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="mt-5 w-full py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-400 border border-white/[0.08] hover:border-white/20 hover:text-white transition-all duration-200"
            >
              Close
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Position card
function PositionCard({
  pos,
  index,
  onDelete,
  onTaxBreakdown,
}: {
  pos:            PositionWithLiveData;
  index:          number;
  onDelete:       (id: string) => void;
  onTaxBreakdown: (pos: PositionWithLiveData) => void;
}) {
  const isPnlPositive = pos.pnl >= 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -30, scale: 0.96 }}
      transition={{ delay: index * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <GlassCard className="p-0 overflow-hidden" hover>
        <div className="p-6">
          {/* Top row: symbol + holding badge + delete */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-xl font-black text-white tracking-tight">{pos.symbol}</h3>
                {/* Holding period badge */}
                <span className={cn(
                  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border flex-shrink-0',
                  pos.isLTCG
                    ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20'
                    : 'bg-amber-400/10 text-amber-400 border-amber-400/20'
                )}>
                  {pos.isLTCG ? <CheckCircle2 size={9} /> : <Clock size={9} />}
                  {pos.isLTCG ? 'LTCG' : 'STCG'} · {pos.holdingDays}d
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-semibold mt-0.5 truncate">{pos.companyName}</p>
            </div>
            <button
              onClick={() => onDelete(pos.id)}
              className="p-2 rounded-xl text-slate-700 hover:text-rose-400 hover:bg-rose-400/10 transition-all duration-200 flex-shrink-0 ml-3"
              aria-label={`Remove ${pos.symbol} from portfolio`}
            >
              <Trash2 size={14} />
            </button>
          </div>

          {/* Metrics grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1">Units</p>
              <p className="text-sm font-black text-white">{pos.quantity}</p>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1">Avg Buy</p>
              <p className="text-sm font-black text-white">{fmtINR(pos.avgBuyPrice)}</p>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1">Current</p>
              <p className="text-sm font-black text-white">{fmtINR(pos.currentPrice)}</p>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1">Purchased</p>
              <p className="text-sm font-black text-white">{fmtDate(pos.purchaseDate)}</p>
            </div>
          </div>

          {/* Value row */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div
              className="rounded-2xl p-3.5"
              style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1">Invested</p>
              <p className="text-base font-black text-amber-400">{fmtINR(pos.investedValue)}</p>
            </div>
            <div
              className="rounded-2xl p-3.5"
              style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1">Current Value</p>
              <p className="text-base font-black text-white">{fmtINR(pos.currentValue)}</p>
            </div>
          </div>

          {/* P&L + actions row */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            {/* P&L */}
            <motion.div
              className={cn(
                'flex items-center gap-2 px-3.5 py-2 rounded-2xl border',
                isPnlPositive
                  ? 'bg-emerald-400/10 border-emerald-400/20'
                  : 'bg-rose-400/10 border-rose-400/20'
              )}
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: index * 0.3 }}
            >
              {isPnlPositive
                ? <TrendingUp size={14} className="text-emerald-400 flex-shrink-0" strokeWidth={2.5} />
                : <TrendingDown size={14} className="text-rose-400 flex-shrink-0" strokeWidth={2.5} />
              }
              <span className={cn('text-sm font-black', isPnlPositive ? 'text-emerald-400' : 'text-rose-400')}>
                {isPnlPositive ? '+' : ''}{fmtINR(pos.pnl)}
              </span>
              <span className={cn(
                'text-[10px] font-black',
                isPnlPositive ? 'text-emerald-500' : 'text-rose-500'
              )}>
                ({isPnlPositive ? '+' : ''}{pos.pnlPercent.toFixed(2)}%)
              </span>
            </motion.div>

            {/* Sell & Tax button */}
            <motion.button
              onClick={() => onTaxBreakdown(pos)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest text-rose-400 border border-rose-400/25 hover:bg-rose-400/10 hover:border-rose-400/40 transition-all duration-200"
              aria-label={`See tax breakdown for ${pos.symbol}`}
            >
              <Receipt size={13} strokeWidth={2.5} />
              Sell &amp; Tax
            </motion.button>
          </div>
        </div>

        {/* Bottom amber glow line for LTCG / amber for STCG */}
        <div
          className="h-[2px]"
          style={{
            background: pos.isLTCG
              ? 'linear-gradient(90deg, transparent, rgba(52,211,153,0.4), transparent)'
              : 'linear-gradient(90deg, transparent, rgba(245,158,11,0.4), transparent)',
          }}
          aria-hidden="true"
        />
      </GlassCard>
    </motion.div>
  );
}

interface Suggestion { symbol: string; name: string; exchange: string; }

// Add Position form
function AddPositionForm({ onAdd }: { onAdd: (pos: Position) => void }) {
  const [symbol,       setSymbol]       = useState('');
  const [quantity,     setQuantity]     = useState('');
  const [avgBuyPrice,  setAvgBuyPrice]  = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [error,        setError]        = useState('');
  const [suggestions,  setSuggestions]  = useState<Suggestion[]>([]);
  const [showSugg,     setShowSugg]     = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef  = useRef<HTMLDivElement>(null);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSugg(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchSuggestions = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.length < 2) { setSuggestions([]); setShowSugg(false); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/search/suggestions?query=${encodeURIComponent(q)}`);
        if (res.ok) {
          const data: Suggestion[] = await res.json();
          setSuggestions(data);
          setShowSugg(data.length > 0);
        }
      } catch { /* ignore */ }
    }, 250);
  }, []);

  const handleSymbolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setSymbol(val);
    fetchSuggestions(val);
  };

  const handleSuggestionClick = (s: Suggestion) => {
    setSymbol(s.symbol);
    setSuggestions([]);
    setShowSugg(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const sym = symbol.trim().toUpperCase();
    const qty = parseFloat(quantity);
    const price = parseFloat(avgBuyPrice);

    if (!sym || sym.length < 2)         { setError('Enter a valid stock symbol.'); return; }
    if (!qty || qty <= 0)               { setError('Quantity must be greater than 0.'); return; }
    if (!price || price <= 0)           { setError('Buy price must be greater than 0.'); return; }
    if (!purchaseDate)                  { setError('Select a purchase date.'); return; }
    if (new Date(purchaseDate) > new Date()) { setError('Purchase date cannot be in the future.'); return; }

    onAdd({
      id:           `pos-${Date.now()}`,
      symbol:       sym,
      companyName:  `${sym} Ltd`,
      quantity:     qty,
      avgBuyPrice:  price,
      purchaseDate,
    });

    setSymbol(''); setQuantity(''); setAvgBuyPrice(''); setPurchaseDate('');
    setSuggestions([]); setShowSugg(false);
  };

  const fieldClass = (name: string) => cn(
    'w-full py-3.5 px-4 rounded-xl text-sm font-semibold text-white',
    'placeholder:text-slate-700 placeholder:font-normal',
    'outline-none transition-all duration-200',
    'bg-white/[0.03] border',
    focusedField === name
      ? 'border-amber-500/50 ring-2 ring-amber-500/15 bg-white/[0.06]'
      : 'border-white/[0.07] hover:border-white/[0.13]'
  );

  return (
    <GlassCard className="p-6 sm:p-7">
      <div className="mb-5">
        <SectionLabel>Add Position</SectionLabel>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-4 px-4 py-3 rounded-xl text-[11px] font-bold uppercase tracking-wide flex items-center gap-2.5"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', color: '#fca5a5' }}
          role="alert"
        >
          <AlertCircle size={13} className="flex-shrink-0" />
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {/* Symbol */}
          <div className="space-y-1.5" ref={wrapperRef}>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">
              Symbol
            </label>
            <div className="relative">
              <BarChart3 size={15} strokeWidth={2} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none z-10" />
              <input
                type="text"
                value={symbol}
                onChange={handleSymbolChange}
                onFocus={() => { setFocusedField('symbol'); if (suggestions.length > 0) setShowSugg(true); }}
                onBlur={() => setFocusedField(null)}
                onKeyDown={(e) => { if (e.key === 'Escape') setShowSugg(false); }}
                placeholder="RELIANCE"
                className={cn(fieldClass('symbol'), 'pl-10')}
                maxLength={20}
                autoCapitalize="characters"
                autoComplete="off"
                aria-label="Stock symbol"
              />
              <AnimatePresence>
                {showSugg && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 right-0 mt-1.5 z-50 rounded-2xl overflow-hidden shadow-2xl"
                    style={{ background: '#111113', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    {suggestions.map((s) => (
                      <button
                        key={s.symbol}
                        type="button"
                        onMouseDown={() => handleSuggestionClick(s)}
                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
                      >
                        <div>
                          <span className="text-sm font-black text-white">{s.symbol}</span>
                          {s.name && <p className="text-[10px] text-slate-500 mt-0.5 font-medium truncate max-w-[160px]">{s.name}</p>}
                        </div>
                        <span className="text-[9px] font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20 uppercase">{s.exchange}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Quantity */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">
              Quantity
            </label>
            <div className="relative">
              <Package size={15} strokeWidth={2} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                onFocus={() => setFocusedField('quantity')}
                onBlur={() => setFocusedField(null)}
                placeholder="10"
                min="0.001"
                step="any"
                className={cn(fieldClass('quantity'), 'pl-10')}
                aria-label="Number of shares"
              />
            </div>
          </div>

          {/* Avg Buy Price */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">
              Avg Buy Price
            </label>
            <div className="relative">
              <IndianRupee size={15} strokeWidth={2} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
              <input
                type="number"
                value={avgBuyPrice}
                onChange={(e) => setAvgBuyPrice(e.target.value)}
                onFocus={() => setFocusedField('avgBuyPrice')}
                onBlur={() => setFocusedField(null)}
                placeholder="2350.00"
                min="0.01"
                step="0.01"
                className={cn(fieldClass('avgBuyPrice'), 'pl-10')}
                aria-label="Average buy price in rupees"
              />
            </div>
          </div>

          {/* Purchase Date */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">
              Purchase Date
            </label>
            <div className="relative">
              <Calendar size={15} strokeWidth={2} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                onFocus={() => setFocusedField('purchaseDate')}
                onBlur={() => setFocusedField(null)}
                max={new Date().toISOString().split('T')[0]}
                className={cn(fieldClass('purchaseDate'), 'pl-10 [color-scheme:dark]')}
                aria-label="Purchase date"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="flex items-center gap-2.5 px-6 py-3.5 bg-amber-500 text-black font-black text-[11px] uppercase tracking-widest rounded-2xl hover:bg-amber-400 transition-colors duration-200 shadow-lg shadow-amber-500/20 relative overflow-hidden"
        >
          {/* Button shimmer */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.2) 50%, transparent 65%)',
              backgroundSize: '200% 100%',
            }}
            animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', repeatDelay: 0.8 }}
          />
          <Plus size={15} strokeWidth={3} />
          Add Position
        </motion.button>
      </form>
    </GlassCard>
  );
}

// Tax reference card
function TaxRefCard({
  title,
  rate,
  description,
  color,
  icon: Icon,
  delay,
}: {
  title:       string;
  rate:        string;
  description: string;
  color:       string;
  icon:        React.ElementType;
  delay:       number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <GlassCard hover className="p-6 h-full">
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: `${color}15`, border: `1px solid ${color}25` }}
        >
          <Icon size={18} style={{ color }} strokeWidth={2} />
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color }}>
          {title}
        </p>
        <p className="text-2xl font-black text-white mb-2">{rate}</p>
        <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">{description}</p>
      </GlassCard>
    </motion.div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function PortfolioPage() {
  const [mounted,        setMounted]        = useState(false);
  const [positions,      setPositions]      = useState<Position[]>([]);
  const [livePrices,     setLivePrices]     = useState<Record<string, { price: number; name: string; percent_change: number }>>({});
  const [taxBreakdown,   setTaxBreakdown]   = useState<TaxBreakdown | null>(null);
  // Load positions from localStorage on mount
  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(PORTFOLIO_STORAGE_KEY);
      if (raw) {
        const items: PortfolioItem[] = JSON.parse(raw);
        setPositions(items.map((item, i) => portfolioItemToPosition(item, i)));
      }
    } catch {
      // corrupted data — start empty
    }
  }, []);

  // Persist positions back to localStorage whenever they change
  useEffect(() => {
    if (!mounted) return;
    const items = positions.map(positionToPortfolioItem);
    if (items.length > 0) {
      localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(items));
    } else {
      localStorage.removeItem(PORTFOLIO_STORAGE_KEY);
    }
  }, [positions, mounted]);

  // Fetch live prices from backend API on mount and when positions change
  useEffect(() => {
    if (!mounted || positions.length === 0) return;

    const uniqueSymbols = [...new Set(positions.map((p) => p.symbol))];

    const fetchPrices = async () => {
      const results: Record<string, { price: number; name: string; percent_change: number }> = {};
      await Promise.allSettled(
        uniqueSymbols.map(async (sym) => {
          try {
            const res = await fetch(`${API_BASE}/api/stock/${sym}`);
            if (res.ok) {
              const data = await res.json();
              results[sym] = { price: data.price, name: data.name, percent_change: data.percent_change };
            }
          } catch {
            // silently skip failed fetches
          }
        })
      );
      setLivePrices(results);

      // Update company names from API responses
      setPositions((prev) =>
        prev.map((pos) => {
          const apiData = results[pos.symbol];
          if (apiData && apiData.name) {
            return { ...pos, companyName: apiData.name };
          }
          return pos;
        })
      );
    };

    fetchPrices();
  }, [mounted, positions.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Enrich positions with live data
  const enrichedPositions = useMemo<PositionWithLiveData[]>(() => {
    return positions.map((pos) => {
      const apiData       = livePrices[pos.symbol];
      const currentPrice  = apiData?.price ?? pos.avgBuyPrice; // fallback to buy price if API unavailable
      const investedValue = pos.avgBuyPrice * pos.quantity;
      const currentValue  = currentPrice * pos.quantity;
      const pnl           = currentValue - investedValue;
      const pnlPercent    = investedValue > 0 ? (pnl / investedValue) * 100 : 0;
      const days          = holdingDays(pos.purchaseDate);
      return {
        ...pos,
        currentPrice,
        investedValue,
        currentValue,
        pnl,
        pnlPercent,
        holdingDays: days,
        isLTCG:      days >= 365,
      };
    });
  }, [positions, livePrices]);

  // Summary stats
  const summary = useMemo(() => {
    const totalInvested    = enrichedPositions.reduce((s, p) => s + p.investedValue, 0);
    const totalCurrentVal  = enrichedPositions.reduce((s, p) => s + p.currentValue,  0);
    const totalPnl         = totalCurrentVal - totalInvested;
    const totalPnlPercent  = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;
    return { totalInvested, totalCurrentVal, totalPnl, totalPnlPercent };
  }, [enrichedPositions]);

  const handleAddPosition = useCallback((pos: Position) => {
    setPositions((prev) => [...prev, pos]);
  }, []);

  const handleDeletePosition = useCallback((id: string) => {
    setPositions((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const handleTaxBreakdown = useCallback((pos: PositionWithLiveData) => {
    setTaxBreakdown(calcTaxBreakdown(pos));
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#050505' }} />
    );
  }

  const pnlPositive = summary.totalPnl >= 0;

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: '#050505' }}>
      <FloatingParticles />

      {/* Noise texture */}
      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.018]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
        aria-hidden="true"
      />

      {/* Ambient amber radial glow (top) */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse at top, rgba(245,158,11,0.055) 0%, transparent 65%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24">

        {/* ── Navbar ──────────────────────────────────────────────────────────── */}
        <motion.nav
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center justify-between mb-10"
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 group-hover:shadow-lg group-hover:shadow-amber-500/25"
              style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}
            >
              <span className="text-base font-black text-amber-400">G</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-white leading-none">GallaGyan</span>
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-600 mt-0.5">
                India's Market Companion
              </span>
            </div>
          </Link>

          {/* Nav items */}
          <div className="hidden sm:flex items-center gap-1">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white hover:bg-white/[0.05] transition-all duration-200"
            >
              Dashboard
            </Link>
            <div
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-amber-400"
              style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}
            >
              Portfolio
            </div>
          </div>

          {/* Back link (mobile) */}
          <Link
            href="/"
            className="sm:hidden flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
          >
            <ChevronLeft size={13} />
            Dashboard
          </Link>
        </motion.nav>

        {/* ── Page Header ──────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-3">
            <SectionLabel>Portfolio</SectionLabel>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white leading-none mb-2">
            Your Portfolio
          </h1>
          <p className="text-sm text-slate-500 font-semibold">
            Track your investments &amp; tax liability
          </p>
        </motion.div>

        {/* ── Summary Cards ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <SummaryCard
            label="Total Invested"
            value={fmtINR(summary.totalInvested)}
            icon={IndianRupee}
            accent="amber"
            delay={0.15}
          />
          <SummaryCard
            label="Current Value"
            value={fmtINR(summary.totalCurrentVal)}
            icon={TrendingUp}
            accent="white"
            delay={0.22}
          />
          <SummaryCard
            label="Total P&L"
            value={
              <span className={pnlPositive ? 'text-emerald-400' : 'text-rose-400'}>
                {pnlPositive ? '+' : ''}{fmtINR(summary.totalPnl)}
              </span>
            }
            subtext={
              <span className={pnlPositive ? 'text-emerald-500' : 'text-rose-500'}>
                {pnlPositive ? '+' : ''}{summary.totalPnlPercent.toFixed(2)}%
              </span>
            }
            icon={pnlPositive ? TrendingUp : TrendingDown}
            accent={pnlPositive ? 'emerald' : 'rose'}
            delay={0.29}
          />
          <SummaryCard
            label="Positions"
            value={positions.length}
            subtext={`${enrichedPositions.filter((p) => p.isLTCG).length} LTCG · ${enrichedPositions.filter((p) => !p.isLTCG).length} STCG`}
            icon={Package}
            accent="slate"
            delay={0.36}
          />
        </div>

        {/* ── Add Position form ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.43, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <AddPositionForm onAdd={handleAddPosition} />
        </motion.div>

        {/* ── Positions ────────────────────────────────────────────────────── */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <SectionLabel>Positions ({positions.length})</SectionLabel>
            {positions.length > 0 && (
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-700">
                Live Prices
              </span>
            )}
          </div>

          <AnimatePresence mode="popLayout">
            {enrichedPositions.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                key="empty"
              >
                <GlassCard className="p-12 flex flex-col items-center justify-center text-center">
                  <div
                    className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4"
                    style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}
                  >
                    <Package size={28} className="text-amber-400/50" />
                  </div>
                  <p className="text-sm font-black text-slate-500 uppercase tracking-widest mb-1">
                    No Positions Yet
                  </p>
                  <p className="text-[11px] text-slate-700 font-semibold">
                    Add your first stock position using the form above.
                  </p>
                </GlassCard>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {enrichedPositions.map((pos, i) => (
                  <PositionCard
                    key={pos.id}
                    pos={pos}
                    index={i}
                    onDelete={handleDeletePosition}
                    onTaxBreakdown={handleTaxBreakdown}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Tax Reference Cards ──────────────────────────────────────────── */}
        <div>
          <div className="mb-5">
            <SectionLabel>Indian Tax Guide (Budget 2024)</SectionLabel>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <TaxRefCard
              title="STT"
              rate="0.1%"
              description="Securities Transaction Tax is levied on every sell order on recognised stock exchanges. Applied on sell value regardless of profit or loss."
              color="#F59E0B"
              icon={Receipt}
              delay={0.1}
            />
            <TaxRefCard
              title="STCG"
              rate="20%"
              description="Short-Term Capital Gains applies when you sell equity shares held for less than 12 months. Flat 20% on profit as per Budget 2024."
              color="#FB7185"
              icon={Percent}
              delay={0.18}
            />
            <TaxRefCard
              title="LTCG"
              rate="12.5%"
              description="Long-Term Capital Gains applies after 12 months. Budget 2024 revised rate to 12.5% with ₹1,25,000 annual exemption per taxpayer."
              color="#34D399"
              icon={CheckCircle2}
              delay={0.26}
            />
          </div>

          {/* Disclaimer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-6 text-center text-[9px] font-bold uppercase tracking-[0.2em] text-slate-800"
          >
            Educational tool only. Not financial advice.
            Consult a qualified CA for personalised tax guidance.
          </motion.p>
        </div>
      </div>

      {/* ── Tax Breakdown Modal ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {taxBreakdown && (
          <TaxModal
            breakdown={taxBreakdown}
            onClose={() => setTaxBreakdown(null)}
          />
        )}
      </AnimatePresence>

      {/* Global styles for date input */}
      <style jsx global>{`
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(0.4) sepia(1) saturate(2) hue-rotate(5deg) brightness(0.9);
          opacity: 0.5;
          cursor: pointer;
        }
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] { -moz-appearance: textfield; }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>
    </div>
  );
}
