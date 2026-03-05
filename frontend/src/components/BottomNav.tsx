'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { BarChart2, BookOpen, Briefcase } from 'lucide-react';

const tabs = [
  { label: 'Market', href: '/', icon: BarChart2 },
  { label: 'GyanHub', href: '/gyanhub', icon: BookOpen },
  { label: 'Portfolio', href: '/portfolio', icon: Briefcase },
];

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-[100]"
      style={{
        background: 'rgba(4,4,4,0.88)',
        backdropFilter: 'blur(32px) saturate(200%)',
        WebkitBackdropFilter: 'blur(32px) saturate(200%)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        // Liquid glass outer glow
        boxShadow: '0 -8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      <div className="flex h-[68px] px-2">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="relative flex flex-col items-center justify-center gap-[3px] flex-1 select-none"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {/* Liquid glass pill — moves via layoutId spring */}
              {active && (
                <motion.div
                  layoutId="glassNavPill"
                  className="absolute inset-x-1.5 inset-y-1.5 rounded-2xl"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(245,158,11,0.06) 100%)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(245,158,11,0.18)',
                    boxShadow:
                      'inset 0 1px 0 rgba(255,255,255,0.10), 0 4px 20px rgba(245,158,11,0.10)',
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 380,
                    damping: 32,
                    mass: 0.8,
                  }}
                />
              )}

              {/* Icon + label */}
              <motion.div
                className="relative z-10 flex flex-col items-center gap-[3px]"
                animate={{
                  scale: active ? 1.06 : 1,
                  y: active ? -1 : 0,
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                <motion.div
                  animate={{
                    color: active ? '#F59E0B' : '#475569',
                    filter: active
                      ? 'drop-shadow(0 0 6px rgba(245,158,11,0.5))'
                      : 'none',
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <Icon
                    size={active ? 22 : 20}
                    strokeWidth={active ? 2.5 : 2}
                  />
                </motion.div>

                <motion.span
                  className="font-black uppercase"
                  style={{ fontSize: '8px', letterSpacing: '0.12em' }}
                  animate={{ color: active ? '#FCD34D' : '#475569' }}
                  transition={{ duration: 0.2 }}
                >
                  {tab.label}
                </motion.span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
