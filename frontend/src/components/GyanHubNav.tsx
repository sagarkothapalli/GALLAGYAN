'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface GyanHubNavProps {
  currentPage?: string;
}

export default function GyanHubNav({ currentPage }: GyanHubNavProps) {
  return (
    <nav className="sticky top-0 z-50 bg-black/60 backdrop-blur-3xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 h-14 md:h-20 flex items-center justify-between">
        <div className="flex items-center gap-3 md:gap-6">
          <Link href="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center text-black font-black text-xl shadow-lg shadow-yellow-500/20 group-hover:rotate-6 transition-transform">
              G
            </div>
            <span className="font-black text-xl tracking-tighter uppercase hidden md:block text-white">
              GallaGyan
            </span>
          </Link>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest min-h-[44px]">
            <Link
              href="/gyanhub"
              className={
                currentPage
                  ? 'text-slate-500 hover:text-yellow-500 transition-colors'
                  : 'text-yellow-500'
              }
            >
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full hidden md:block" />
                GyanHub
              </span>
            </Link>
            {currentPage && (
              <>
                <ChevronRight size={10} className="text-slate-600" />
                <span className="text-yellow-500">{currentPage}</span>
              </>
            )}
          </div>
        </div>

        <Link
          href="/"
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-yellow-500 transition-colors py-2 px-2 min-h-[44px]"
        >
          <span className="hidden sm:inline">Back to Dashboard</span>
          <span className="sm:hidden">Dashboard</span>
        </Link>
      </div>
    </nav>
  );
}
