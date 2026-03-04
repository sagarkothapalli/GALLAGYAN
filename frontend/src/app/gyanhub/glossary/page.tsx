'use client';

import { useState, useMemo, useTransition } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import GyanHubNav from '@/components/GyanHubNav';

const TERMS = [
  // Indices & Exchanges
  { term: 'Nifty 50', category: 'Index', definition: 'Benchmark index of the National Stock Exchange (NSE) comprising 50 large-cap Indian companies across key sectors. Widely used to gauge the health of the Indian economy.' },
  { term: 'Sensex', category: 'Index', definition: 'Benchmark index of the Bombay Stock Exchange (BSE) comprising 30 financially sound companies. "Sensex" comes from Sensitive Index.' },
  { term: 'Bank Nifty', category: 'Index', definition: 'Index of the 12 most liquid and large-cap banking stocks on NSE. Highly volatile and popular among options traders.' },
  { term: 'NSE', category: 'Exchange', definition: 'National Stock Exchange — India\'s largest stock exchange by trading volume, located in Mumbai.' },
  { term: 'BSE', category: 'Exchange', definition: 'Bombay Stock Exchange — Asia\'s oldest stock exchange, founded in 1875. Home to the Sensex index.' },
  { term: 'SEBI', category: 'Regulator', definition: 'Securities and Exchange Board of India. The regulator for Indian securities markets, protecting investor interests and promoting orderly development.' },
  // Account & Infrastructure
  { term: 'Demat Account', category: 'Account', definition: 'Dematerialised account that holds shares and securities in electronic form. Mandatory for trading in India. Opened with a depository participant (DP).' },
  { term: 'ISIN', category: 'Account', definition: 'International Securities Identification Number — a 12-character alphanumeric code that uniquely identifies a security globally.' },
  { term: 'CDSL', category: 'Account', definition: 'Central Depository Services Limited — one of two depositories in India (alongside NSDL) that holds securities in dematerialised form.' },
  { term: 'NSDL', category: 'Account', definition: 'National Securities Depository Limited — the first and largest depository in India, established in 1996.' },
  { term: 'DP', category: 'Account', definition: 'Depository Participant — an intermediary (bank or broker) registered with SEBI that provides demat account services.' },
  // Fundamental Metrics
  { term: 'P/E Ratio', category: 'Fundamental', definition: 'Price-to-Earnings ratio — stock price divided by earnings per share (EPS). A P/E of 20 means investors pay ₹20 for every ₹1 of profit. Lower is generally cheaper, but context matters.' },
  { term: 'EPS', category: 'Fundamental', definition: 'Earnings Per Share — company\'s net profit divided by total number of shares. Higher EPS generally indicates better profitability.' },
  { term: 'Market Cap', category: 'Fundamental', definition: 'Total market value of a company\'s outstanding shares (Price × Total Shares). Used to classify companies as Large-Cap (>₹20,000 Cr), Mid-Cap (₹5,000–20,000 Cr), or Small-Cap (<₹5,000 Cr).' },
  { term: 'EBITDA', category: 'Fundamental', definition: 'Earnings Before Interest, Taxes, Depreciation, and Amortisation. A measure of core operational profitability, useful for comparing companies across different capital structures.' },
  { term: 'ROE', category: 'Fundamental', definition: 'Return on Equity — net profit divided by shareholders\' equity. Measures how efficiently a company uses shareholder money to generate profit. >15% is generally considered good.' },
  { term: 'ROCE', category: 'Fundamental', definition: 'Return on Capital Employed — EBIT divided by total capital employed. Shows how effectively a company uses all its capital (equity + debt).' },
  { term: 'CAGR', category: 'Fundamental', definition: 'Compound Annual Growth Rate — the rate at which an investment grows annually over a period, assuming profits are reinvested. The most honest way to measure investment returns.' },
  { term: 'Book Value', category: 'Fundamental', definition: 'Net assets of a company per share (Total Assets − Total Liabilities ÷ Shares). If market price is below book value, stock may be undervalued.' },
  { term: 'Dividend Yield', category: 'Fundamental', definition: 'Annual dividend per share divided by current stock price, expressed as %. A 3% yield means ₹3 dividend for every ₹100 invested.' },
  { term: 'Free Float', category: 'Fundamental', definition: 'Proportion of a company\'s shares available for public trading (excluding promoter holdings). Higher free float = more liquidity.' },
  // Mutual Funds
  { term: 'SIP', category: 'Mutual Fund', definition: 'Systematic Investment Plan — investing a fixed amount in a mutual fund at regular intervals (monthly). Leverages rupee cost averaging to reduce timing risk.' },
  { term: 'NAV', category: 'Mutual Fund', definition: 'Net Asset Value — per-unit price of a mutual fund. Calculated daily as (Total Assets − Liabilities) ÷ Units Outstanding.' },
  { term: 'ELSS', category: 'Mutual Fund', definition: 'Equity Linked Savings Scheme — a tax-saving mutual fund under Section 80C with a 3-year lock-in. Combines tax savings + equity returns.' },
  { term: 'NFO', category: 'Mutual Fund', definition: 'New Fund Offer — launch of a new mutual fund scheme. Like an IPO for mutual funds. NFO price is typically ₹10 per unit.' },
  { term: 'AUM', category: 'Mutual Fund', definition: 'Assets Under Management — total market value of assets a fund manages. Larger AUM generally indicates investor trust but can limit flexibility for smaller stocks.' },
  { term: 'Expense Ratio', category: 'Mutual Fund', definition: 'Annual fee charged by a mutual fund for managing your money, expressed as % of AUM. Direct plans have lower expense ratios than regular plans.' },
  { term: 'Index Fund', category: 'Mutual Fund', definition: 'A mutual fund that passively tracks a market index (like Nifty 50) with minimal intervention. Lower costs, no manager bias, and historically beats most active funds long-term.' },
  // Derivatives
  { term: 'F&O', category: 'Derivatives', definition: 'Futures and Options — derivative contracts that derive their value from an underlying asset (stock, index, commodity). High risk, requires margin and expertise.' },
  { term: 'Futures', category: 'Derivatives', definition: 'A contract to buy or sell an asset at a predetermined price on a future date. Both buyer and seller are obligated to fulfill the contract.' },
  { term: 'Options', category: 'Derivatives', definition: 'A contract giving the buyer the right (not obligation) to buy (Call) or sell (Put) an asset at a specific price (strike price) before expiry.' },
  { term: 'Strike Price', category: 'Derivatives', definition: 'The fixed price at which an option contract can be exercised. A Call option profits when market price > strike price.' },
  { term: 'Lot Size', category: 'Derivatives', definition: 'Minimum number of units per F&O contract. For Nifty, it\'s 75 units. You can\'t buy fractional lots — all or nothing.' },
  { term: 'Open Interest', category: 'Derivatives', definition: 'Total number of open derivative contracts that haven\'t been settled. Rising OI with rising price = bullish confirmation.' },
  { term: 'Premium', category: 'Derivatives', definition: 'The price paid by the options buyer to the seller. This is the maximum loss for the buyer, and the maximum profit for the seller.' },
  // Technical
  { term: 'VWAP', category: 'Technical', definition: 'Volume Weighted Average Price — average price a stock has traded throughout the day weighted by volume. Institutional traders use it as a benchmark.' },
  { term: 'Circuit Breaker', category: 'Technical', definition: 'A regulatory mechanism that halts trading when a stock moves beyond a certain % (5%, 10%, 20%). Prevents panic selling or manipulation.' },
  { term: 'Bull Market', category: 'Market', definition: 'A prolonged period of rising stock prices, typically 20%+ gains from recent lows. Associated with economic optimism and investor confidence.' },
  { term: 'Bear Market', category: 'Market', definition: 'A prolonged period of falling stock prices, typically a 20%+ decline from recent highs. Often associated with recessions or economic uncertainty.' },
  { term: 'Correction', category: 'Market', definition: 'A decline of 10–20% from recent highs. Considered healthy and normal in bull markets. Distinct from a crash (sharp, sudden drop).' },
  { term: 'Rally', category: 'Market', definition: 'A period of sustained price increases in a stock or market, typically after a decline. Can occur within both bull and bear markets.' },
  { term: 'Consolidation', category: 'Market', definition: 'A period where a stock trades sideways within a range, neither making new highs nor lows. Often precedes a breakout or breakdown.' },
  // Corporate Actions
  { term: 'Dividend', category: 'Corporate Action', definition: 'A portion of company profits distributed to shareholders, usually quarterly or annually. Companies declare a record date — you must hold shares before this date to receive the dividend.' },
  { term: 'Bonus Share', category: 'Corporate Action', definition: 'Free additional shares given to existing shareholders in proportion to their holdings (e.g., 1:1 bonus = 1 free share for every share held). Stock price adjusts proportionally.' },
  { term: 'Stock Split', category: 'Corporate Action', definition: 'Dividing existing shares into multiple shares. A 2:1 split doubles shares and halves the price. Total value remains the same — improves liquidity.' },
  { term: 'Rights Issue', category: 'Corporate Action', definition: 'Company offers existing shareholders the right to buy new shares at a discount before they are offered to the public.' },
  { term: 'Buyback', category: 'Corporate Action', definition: 'Company repurchases its own shares from the market. Reduces outstanding shares, increases EPS, and is often a signal that management believes the stock is undervalued.' },
  // IPO
  { term: 'IPO', category: 'IPO', definition: 'Initial Public Offering — when a private company first sells shares to the public and lists on a stock exchange. Investors apply during the subscription window.' },
  { term: 'FPO', category: 'IPO', definition: 'Follow-on Public Offer — when an already-listed company issues new shares to the public to raise additional capital.' },
  { term: 'QIB', category: 'IPO', definition: 'Qualified Institutional Buyer — large institutional investors (mutual funds, banks, FIIs) who get a reserved portion (75%) of an IPO allocation.' },
  { term: 'HNI', category: 'IPO', definition: 'High Net Worth Individual — investors applying for more than ₹2 lakh in an IPO. Reserved a separate portion (15%) of the IPO.' },
  { term: 'GMP', category: 'IPO', definition: 'Grey Market Premium — the unofficial price at which IPO shares trade before listing. Indicates expected listing gains but is unregulated and unreliable.' },
  // Taxation
  { term: 'LTCG', category: 'Tax', definition: 'Long Term Capital Gains — profit from selling listed equity shares held for more than 1 year. Taxed at 12.5% above ₹1.25 lakh gains (post-Budget 2024).' },
  { term: 'STCG', category: 'Tax', definition: 'Short Term Capital Gains — profit from selling listed equity held for less than 1 year. Taxed at 20% (post-Budget 2024).' },
  { term: 'STT', category: 'Tax', definition: 'Securities Transaction Tax — a small tax on every stock market transaction in India. Collected at source; non-negotiable.' },
  { term: 'TDS', category: 'Tax', definition: 'Tax Deducted at Source — tax deducted by the company before paying dividends. Currently 10% on dividends above ₹5,000 per year.' },
  { term: '80C', category: 'Tax', definition: 'Section 80C of Income Tax Act — allows deductions up to ₹1.5 lakh for investments in ELSS, PPF, EPF, NSC, life insurance premiums, and home loan principal.' },
];

const CATEGORIES = ['All', ...Array.from(new Set(TERMS.map(t => t.category))).sort()];

const CATEGORY_COLORS: Record<string, string> = {
  Index: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Exchange: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  Regulator: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Account: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  Fundamental: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Mutual Fund': 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  Derivatives: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  Technical: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  Market: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  'Corporate Action': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  IPO: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  Tax: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } }
};
const itemVariants = {
  hidden: { y: 16, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
};

export default function GlossaryPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeLetter, setActiveLetter] = useState('');
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    return TERMS.filter(t => {
      const matchSearch = t.term.toLowerCase().includes(search.toLowerCase()) ||
        t.definition.toLowerCase().includes(search.toLowerCase());
      const matchCat = activeCategory === 'All' || t.category === activeCategory;
      const matchLetter = !activeLetter || t.term.toUpperCase().startsWith(activeLetter);
      return matchSearch && matchCat && matchLetter;
    }).sort((a, b) => a.term.localeCompare(b.term));
  }, [search, activeCategory, activeLetter]);

  const availableLetters = new Set(TERMS.map(t => t.term[0].toUpperCase()));

  return (
    <div className="dark">
      <div className="min-h-screen bg-[#050505] text-slate-100 font-sans">
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[20%] w-[50%] h-[50%] bg-indigo-500/6 rounded-full blur-[160px]" />
        </div>

        <GyanHubNav currentPage="Glossary" />

        <div className="max-w-5xl mx-auto px-4 py-12 relative z-10">

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-500 bg-yellow-500/10 px-3 py-1.5 rounded-full border border-yellow-500/20">Reference</span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white mt-4 mb-2">Market Glossary</h1>
            <p className="text-slate-400 font-medium">{TERMS.length}+ Indian market terms, explained simply.</p>
          </motion.div>

          {/* Search */}
          <div className="relative mb-6">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input type="text" value={search} onChange={e => { const val = e.target.value; setSearch(val); startTransition(() => { setActiveLetter(''); }); }}
              placeholder="Search terms..."
              className="w-full bg-white/[0.02] border border-white/10 rounded-2xl py-4 pl-10 pr-5 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-yellow-500/40 placeholder:text-slate-600 placeholder:font-normal" />
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={cn('px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all',
                  activeCategory === cat
                    ? 'bg-yellow-500 text-black border-yellow-500'
                    : 'bg-white/[0.02] text-slate-400 border-white/10 hover:border-white/20')}>
                {cat}
              </button>
            ))}
          </div>

          {/* A-Z nav */}
          <div className="flex flex-wrap gap-1.5 mb-8">
            {ALPHA.map(l => (
              <button key={l} onClick={() => setActiveLetter(activeLetter === l ? '' : l)}
                disabled={!availableLetters.has(l)}
                className={cn('w-8 h-8 rounded-xl text-[11px] font-black transition-all',
                  activeLetter === l ? 'bg-yellow-500 text-black' :
                    availableLetters.has(l) ? 'bg-white/[0.03] text-slate-400 hover:bg-white/10 border border-white/10' :
                      'text-white/10 cursor-not-allowed')}>
                {l}
              </button>
            ))}
          </div>

          {/* Results count */}
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-6">{filtered.length} term{filtered.length !== 1 ? 's' : ''} found</p>

          {/* Terms grid */}
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(t => (
              <motion.div key={t.term} variants={itemVariants}
                className="bg-white/[0.02] border border-white/5 hover:border-yellow-500/20 rounded-[2rem] p-6 transition-all group">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="text-base font-black text-yellow-400 group-hover:text-yellow-300 transition-colors">{t.term}</h3>
                  <span className={cn('text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border flex-shrink-0',
                    CATEGORY_COLORS[t.category] || 'bg-white/5 text-slate-400 border-white/10')}>
                    {t.category}
                  </span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed font-medium">{t.definition}</p>
              </motion.div>
            ))}
          </motion.div>

          {filtered.length === 0 && (
            <div className="text-center py-20 text-slate-600">
              <p className="text-4xl mb-4">¯\_(ツ)_/¯</p>
              <p className="font-bold text-sm">No terms found. Try a different search.</p>
            </div>
          )}
        </div>
        <style jsx global>{`body { background-color: #050505; }`}</style>
      </div>
    </div>
  );
}
