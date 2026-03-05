'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

// Determine slide direction based on tab order
const TAB_ORDER: Record<string, number> = {
  '/': 0,
  '/gyanhub': 1,
  '/portfolio': 2,
};

function getTabIndex(pathname: string): number {
  if (pathname === '/') return 0;
  if (pathname.startsWith('/gyanhub')) return 1;
  if (pathname.startsWith('/portfolio')) return 2;
  return -1; // non-tab page, no slide
}

export default function PageTransitionWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const tabIndex = getTabIndex(pathname);

  // For tab pages: slide in from the correct direction
  // For other pages (articles, etc.): simple fade
  const isTabPage = tabIndex !== -1;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={
          isTabPage
            ? { opacity: 0, x: 24 }
            : { opacity: 0 }
        }
        animate={
          isTabPage
            ? { opacity: 1, x: 0 }
            : { opacity: 1 }
        }
        exit={
          isTabPage
            ? { opacity: 0, x: -24 }
            : { opacity: 0 }
        }
        transition={{
          duration: 0.22,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
        style={{ willChange: 'transform, opacity' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
