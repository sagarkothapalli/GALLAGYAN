'use client';

import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-blue-500/30 overflow-x-hidden">
      {/* Navigation */}
      <nav className="bg-[#050505]/60 backdrop-blur-xl border-b border-white/[0.08] px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center font-black text-xl shadow-xl shadow-blue-500/20 rotate-3">G</div>
            <h1 className="text-lg font-black tracking-tighter bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent uppercase">GALLAGYAN</h1>
          </Link>
          <Link href="/" className="text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">← Back to Dashboard</Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-8 md:p-16 space-y-12">
        <header className="space-y-4">
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter">Privacy Policy</h2>
          <p className="text-blue-500 font-mono text-xs font-bold uppercase tracking-[0.2em]">Effective Date: February 25, 2026</p>
        </header>

        <div className="bg-blue-600/5 border border-blue-500/20 rounded-3xl p-6 md:p-8">
          <p className="text-sm md:text-base leading-relaxed text-blue-100 font-medium italic">
            Important Notice: This website is for informational and educational purposes only. It does not provide investment advice, and nothing on this site should be construed as a recommendation to buy or sell any financial instrument.
          </p>
        </div>

        <div className="space-y-10 text-gray-400 leading-relaxed">
          <section className="space-y-4">
            <h3 className="text-xl font-black text-white uppercase tracking-tight">1. Introduction</h3>
            <p>Welcome to GallaGyan. We are committed to protecting your personal data and respecting your privacy rights in accordance with the Digital Personal Data Protection Act, 2023 (DPDPA) of India. This Privacy Policy explains how we collect, use, store, and protect the information you provide when you visit or use our website.</p>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-black text-white uppercase tracking-tight">2. Who We Are</h3>
            <p>GallaGyan is operated as an independent informational platform focused on Indian stock market data and financial education. We are <span className="text-white font-bold underline decoration-red-500/50">NOT registered with SEBI</span> as an Investment Adviser or Research Analyst.</p>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-black text-white uppercase tracking-tight">3. Information We Collect</h3>
            <div className="space-y-6">
              <div>
                <h4 className="text-white font-bold text-sm uppercase mb-2">3.1 Information You Provide Voluntarily</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Watchlisted stocks saved in your local browser storage.</li>
                  <li>Search queries and preferences.</li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-bold text-sm uppercase mb-2">3.2 Information Collected Automatically</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>IP address and approximate geographic location.</li>
                  <li>Browser type, version, and device information.</li>
                  <li>Date and time of your visit.</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-black text-white uppercase tracking-tight">4. Data Security</h3>
            <p>We take reasonable technical and organizational measures to protect your personal data against unauthorized access, alteration, or destruction. This includes HTTPS encryption on all pages and secure cloud hosting.</p>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-black text-white uppercase tracking-tight">5. Third-Party Links</h3>
            <p>Our website contains links to external news articles and financial tools. We do not own this data and are bound by the terms and licenses of each respective provider (e.g., yfinance, Google News). We encourage you to review the privacy policy of any site you visit.</p>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-black text-white uppercase tracking-tight">6. Children's Privacy</h3>
            <p>This website is intended for users aged 18 years and above. We do not knowingly collect personal data from children under the age of 18.</p>
          </section>
        </div>

        <div className="pt-12 border-t border-white/10 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">© 2026 GallaGyan — All Rights Reserved</p>
        </div>
      </main>
    </div>
  );
}
