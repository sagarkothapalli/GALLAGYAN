'use client';

import React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LampProps {
  isOn: boolean;
  onToggle: () => void;
}

export const Lamp = ({ isOn, onToggle }: LampProps) => {
  // ── Mouse parallax motion values ─────────────────────────────────────────
  // Raw mouse position (normalized –0.5 → +0.5 range set by parent via
  // pointer events). We derive a ±15 px horizontal shift on the glow.
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring-smoothed values for organic feel
  const springConfig = { stiffness: 60, damping: 20, mass: 0.8 };
  const glowX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), springConfig);
  const glowY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-6, 6]), springConfig);

  // Expose setter so parent can pipe window mousemove events down
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;  // -0.5 → 0.5
    const ny = (e.clientY - rect.top)  / rect.height - 0.5;
    mouseX.set(nx);
    mouseY.set(ny);
  };

  return (
    <div
      className="relative flex flex-col items-center justify-start w-full select-none"
      style={{ minHeight: 420 }}
      onMouseMove={handleMouseMove}
    >
      {/* ── Hanging wire from ceiling ───────────────────────────────────── */}
      <motion.div
        animate={{ backgroundColor: isOn ? '#94a3b8' : '#334155' }}
        transition={{ duration: 0.8 }}
        className="w-[2px] h-28 mx-auto"
      />

      {/* ── Lamp fixture (trapezoid via SVG) ────────────────────────────── */}
      <div className="relative flex flex-col items-center">
        <svg
          width="120"
          height="72"
          viewBox="0 0 120 72"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-20"
          aria-hidden="true"
        >
          {/* Cone shade — wider at bottom */}
          <motion.polygon
            points="20,0 100,0 110,72 10,72"
            animate={{ fill: isOn ? '#1e293b' : '#0f172a' }}
            transition={{ duration: 0.8 }}
          />
          {/* Top rim highlight */}
          <motion.rect
            x="20" y="0" width="80" height="5" rx="2"
            animate={{ fill: isOn ? '#334155' : '#1e293b' }}
            transition={{ duration: 0.8 }}
          />
          {/* Interior glow when on */}
          <motion.polygon
            points="24,6 96,6 104,68 16,68"
            animate={{
              fill: isOn
                ? 'rgba(251,191,36,0.18)'
                : 'rgba(0,0,0,0)',
            }}
            transition={{ duration: 0.6 }}
          />
          {/* Bulb visible through the bottom aperture */}
          <motion.ellipse
            cx="60" cy="68" rx="12" ry="5"
            animate={{
              fill: isOn ? '#fef3c7' : '#0f172a',
              filter: isOn ? 'url(#bulbglow)' : 'none',
            }}
            transition={{ duration: 0.5 }}
          />
          <defs>
            <filter id="bulbglow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        </svg>

        {/* ── Pull cord ───────────────────────────────────────────────────── */}
        <motion.div
          onClick={onToggle}
          whileHover={{ y: 4 }}
          whileTap={{ y: 20 }}
          className="absolute cursor-pointer z-30 flex flex-col items-center group"
          style={{ top: '72px', right: '14px' }}
          aria-label="Toggle lamp"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onToggle()}
        >
          {/* Cord line */}
          <motion.div
            animate={{ backgroundColor: isOn ? '#94a3b8' : '#475569' }}
            transition={{ duration: 0.8 }}
            className="w-[1px] h-16"
          />
          {/* Cord knob */}
          <motion.div
            animate={{
              backgroundColor: isOn ? '#f59e0b' : '#334155',
              borderColor: isOn ? '#fcd34d' : '#475569',
              boxShadow: isOn
                ? '0 0 12px 4px rgba(245,158,11,0.55)'
                : '0 0 0px transparent',
              scale: isOn ? 1.15 : 1,
            }}
            transition={{ duration: 0.5 }}
            className="w-5 h-5 rounded-full border-2"
          />
        </motion.div>

        {/* ── Light beam (conic-gradient) ──────────────────────────────────── */}
        <motion.div
          initial={false}
          animate={{ opacity: isOn ? 1 : 0, scaleY: isOn ? 1 : 0.6 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="absolute pointer-events-none z-10 origin-top"
          style={{
            top: '68px',
            left: '50%',
            width: 480,
            height: 520,
            x: glowX,   // parallax shift
            y: glowY,
            translateX: '-50%',
            background: `conic-gradient(
              from 180deg at 50% 0%,
              transparent 35deg,
              rgba(251,191,36,0.06) 70deg,
              rgba(251,191,36,0.14) 110deg,
              rgba(245,158,11,0.20) 180deg,
              rgba(251,191,36,0.14) 250deg,
              rgba(251,191,36,0.06) 290deg,
              transparent 325deg
            )`,
            filter: 'blur(60px)',
          }}
        />

        {/* ── Pulsing glow rings ──────────────────────────────────────────── */}
        {isOn && (
          <>
            <motion.div
              className="absolute pointer-events-none rounded-full"
              style={{
                top: '60px',
                left: '50%',
                translateX: '-50%',
                width: 80,
                height: 80,
                background: 'radial-gradient(circle, rgba(245,158,11,0.35) 0%, transparent 70%)',
              }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute pointer-events-none rounded-full"
              style={{
                top: '50px',
                left: '50%',
                translateX: '-50%',
                width: 140,
                height: 140,
                background: 'radial-gradient(circle, rgba(245,158,11,0.18) 0%, transparent 70%)',
              }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            />
            <motion.div
              className="absolute pointer-events-none rounded-full"
              style={{
                top: '40px',
                left: '50%',
                translateX: '-50%',
                width: 220,
                height: 220,
                background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)',
              }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0, 0.2] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            />
          </>
        )}

        {/* ── Ground pool glow ─────────────────────────────────────────────── */}
        <motion.div
          initial={false}
          animate={{ opacity: isOn ? 0.45 : 0 }}
          transition={{ duration: 0.8 }}
          className="absolute pointer-events-none rounded-[100%]"
          style={{
            top: 460,
            left: '50%',
            translateX: '-50%',
            width: 360,
            height: 90,
            background: 'radial-gradient(ellipse, rgba(245,158,11,0.22) 0%, transparent 70%)',
            filter: 'blur(24px)',
            x: glowX,
          }}
        />
      </div>
    </div>
  );
};
