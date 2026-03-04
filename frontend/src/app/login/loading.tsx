'use client';

export default function LoginLoading() {
  return (
    <div
      className="min-h-screen flex font-body overflow-hidden"
      style={{ backgroundColor: '#050505' }}
      aria-label="Loading GallaGyan login page"
      aria-busy="true"
    >
      {/* ── Left panel skeleton (desktop only) ─────────────────────────────── */}
      <div className="hidden lg:flex flex-col items-center justify-between flex-1 py-12 px-8">

        {/* Wire + lamp fixture placeholder */}
        <div className="flex flex-col items-center gap-0 w-full pt-4 flex-1 justify-start">
          {/* Wire */}
          <div className="w-0.5 h-28 skeleton-pulse rounded-full" />

          {/* Lamp trapezoid */}
          <div className="skeleton-pulse rounded-t-[50%] rounded-b-md" style={{ width: 120, height: 72 }} />

          {/* Light beam glow placeholder */}
          <div
            className="skeleton-pulse rounded-[100%] mt-2"
            style={{ width: 240, height: 320, opacity: 0.3 }}
          />
        </div>

        {/* Brand word-mark */}
        <div className="flex flex-col items-center gap-3 pb-2">
          <div className="skeleton-pulse rounded-lg" style={{ width: 200, height: 52 }} />
          <div className="skeleton-pulse rounded-full" style={{ width: 280, height: 11 }} />
          <div className="skeleton-pulse rounded-full" style={{ width: 80, height: 2 }} />
        </div>
      </div>

      {/* ── Vertical divider (desktop) ──────────────────────────────────────── */}
      <div
        className="hidden lg:block w-px self-stretch my-16 flex-shrink-0 opacity-20"
        style={{ background: 'rgba(255,255,255,0.07)' }}
        aria-hidden="true"
      />

      {/* ── Right panel skeleton ─────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 pb-16">
        <div className="w-full max-w-[420px]">

          {/* Card */}
          <div
            className="p-8 sm:p-10 rounded-[2rem] border"
            style={{
              background:  'rgba(255,255,255,0.02)',
              borderColor: 'rgba(255,255,255,0.06)',
            }}
          >
            {/* Mobile logo skeleton */}
            <div className="lg:hidden flex flex-col items-center mb-8 gap-2">
              <div className="skeleton-pulse rounded-lg" style={{ width: 160, height: 36 }} />
              <div className="skeleton-pulse rounded-full" style={{ width: 200, height: 10 }} />
            </div>

            {/* Heading */}
            <div className="mb-8 space-y-2.5">
              <div className="skeleton-pulse rounded-md" style={{ width: 200, height: 34 }} />
              <div className="skeleton-pulse rounded-md" style={{ width: 260, height: 16 }} />
            </div>

            {/* Username field */}
            <div className="mb-4 space-y-2">
              <div className="skeleton-pulse rounded" style={{ width: 80, height: 10 }} />
              <div className="skeleton-pulse rounded-xl" style={{ height: 50 }} />
            </div>

            {/* Password field */}
            <div className="mb-4 space-y-2">
              <div className="skeleton-pulse rounded" style={{ width: 80, height: 10 }} />
              <div className="skeleton-pulse rounded-xl" style={{ height: 50 }} />
            </div>

            {/* Forgot password */}
            <div className="flex justify-end mb-4">
              <div className="skeleton-pulse rounded" style={{ width: 100, height: 10 }} />
            </div>

            {/* Submit button */}
            <div className="skeleton-pulse rounded-xl mb-6" style={{ height: 52 }} />

            {/* Divider */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
              <div className="skeleton-pulse rounded" style={{ width: 60, height: 9 }} />
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
            </div>

            {/* Create account button */}
            <div className="skeleton-pulse rounded-xl" style={{ height: 50 }} />

            {/* Footer note */}
            <div className="flex flex-col items-center gap-1.5 mt-6">
              <div className="skeleton-pulse rounded" style={{ width: 220, height: 9 }} />
              <div className="skeleton-pulse rounded" style={{ width: 180, height: 9 }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Ticker band placeholder ──────────────────────────────────────────── */}
      <div
        className="fixed bottom-0 left-0 right-0 h-9 border-t"
        style={{
          background:  'rgba(5,5,5,0.92)',
          borderColor: 'rgba(255,255,255,0.06)',
        }}
        aria-hidden="true"
      >
        <div className="h-full flex items-center px-6 gap-8">
          {[140, 100, 120, 90, 130].map((w, i) => (
            <div key={i} className="skeleton-pulse rounded" style={{ width: w, height: 10 }} />
          ))}
        </div>
      </div>

      {/* ── Pulse keyframes (self-contained, no Tailwind plugin needed) ──────── */}
      <style jsx global>{`
        .skeleton-pulse {
          background: rgba(255, 255, 255, 0.04);
          animation: sk-pulse 1.6s ease-in-out infinite;
        }
        @keyframes sk-pulse {
          0%   { opacity: 1;   }
          50%  { opacity: 0.4; }
          100% { opacity: 1;   }
        }
        @media (prefers-reduced-motion: reduce) {
          .skeleton-pulse { animation: none; }
        }
      `}</style>
    </div>
  );
}
