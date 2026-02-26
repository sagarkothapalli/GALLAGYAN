'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

const StockChart = dynamic(() => import('@/components/StockChart').then(mod => mod.StockChart), { 
  ssr: false,
  loading: () => <div className="h-[300px] md:h-[400px] w-full bg-gray-950/50 animate-pulse rounded-3xl flex items-center justify-center text-gray-500 border border-gray-800">Loading Market Data...</div>
});

interface StockData {
  symbol: string;
  name: string;
  price: number;
  currency: string;
  change: number;
  percent_change: number;
  high: number;
  low: number;
  open: number;
  volume: number;
  market_cap: number;
  pe_ratio: number | null;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  dividendYield: number;
}

interface ChartData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface NewsItem {
  title: string;
  publisher: string;
  link: string;
  providerPublishTime: number;
  thumbnail: string | null;
}

interface Suggestion {
  symbol: string;
  name: string;
}

const QUICK_STOCKS = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ZOMATO'];

function formatTime(timestamp: number) {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(timestamp * 1000).toLocaleDateString();
}

export default function Home() {
  const [ticker, setTicker] = useState('');
  const [stock, setStock] = useState<StockData | null>(null);
  const [history, setHistory] = useState<ChartData[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [marketNews, setMarketNews] = useState<NewsItem[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'chart' | 'financials' | 'news'>('chart');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem('watchlist');
    if (saved) { try { setWatchlist(JSON.parse(saved)); } catch (e) {} }
    fetchMarketNews();

    // Click outside listener
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => { if (isMounted) localStorage.setItem('watchlist', JSON.stringify(watchlist)); }, [watchlist, isMounted]);

  // Dynamic SEO Title Update
  useEffect(() => {
    if (stock) {
      document.title = `₹${stock.price.toLocaleString('en-IN')} | ${stock.name} (${stock.symbol}) Analysis - GallaGyan`;
    } else {
      document.title = "GallaGyan | Live NSE/BSE Stock Market Data & Analysis";
    }
  }, [stock]);

  // Periodic Refresh (Every 30 seconds)
  useEffect(() => {
    if (!isMounted) return;
    const refreshData = async () => {
      if (stock) {
        const cleanSymbol = stock.symbol.replace('.NS', '').replace('.BO', '');
        try {
          // Parallel refresh for price and news without triggering global loading state
          const [stockRes, newsRes] = await Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/stock/${cleanSymbol}`),
            fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/stock/${cleanSymbol}/news`)
          ]);
          if (stockRes.ok) {
            const newStockData = await stockRes.json();
            setStock(newStockData);
          }
          if (newsRes.ok) {
            const newNewsData = await newsRes.json();
            setNews(newNewsData);
          }
        } catch (e) {
          console.error("Refresh failed:", e);
        }
      } else {
        fetchMarketNews();
      }
    };

    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, [stock, isMounted]);

  // Fetch suggestions as user types
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (ticker.length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/search/suggestions?query=${ticker}`);
        if (res.ok) setSuggestions(await res.json());
      } catch (e) {}
    };
    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [ticker]);

  const fetchMarketNews = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/market/news`);
      if (res.ok) setMarketNews(await res.json());
    } catch (e) {}
  };

  const fetchStock = async (symbol: string) => {
    setLoading(true);
    setError('');
    setShowSuggestions(false);
    setActiveTab('chart');
    try {
      const rawInput = symbol.trim().toUpperCase();
      let cleanSymbol = rawInput.replace(/\s+/g, '');
      if (cleanSymbol.includes('IDFCFIRST') || cleanSymbol.includes('HDFCFIRST')) cleanSymbol = 'IDFCFIRSTB';
      
      const [stockRes, historyRes, newsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/stock/${cleanSymbol}`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/stock/${cleanSymbol}/history?period=1mo`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/stock/${cleanSymbol}/news`)
      ]);

      if (!stockRes.ok) throw new Error('Stock not found');
      const stockData = await stockRes.json();
      setStock(stockData);
      setHistory(historyRes.ok ? await historyRes.json() : []);
      setNews(newsRes.ok ? await newsRes.json() : []);
    } catch (err: any) {
      setError(err.message);
      setStock(null);
    } finally {
      setLoading(false);
    }
  };

  const toggleWatchlist = (e: React.MouseEvent, symbol: string) => {
    e.stopPropagation();
    const clean = symbol.replace('.NS', '').replace('.BO', '');
    setWatchlist(prev => prev.includes(clean) ? prev.filter(s => s !== clean) : [...prev, clean]);
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-blue-500/30 overflow-x-hidden">
      
      <nav className="sticky top-[41px] z-50 bg-[#050505]/60 backdrop-blur-xl border-b border-white/[0.08] px-4 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center font-black text-2xl shadow-xl shadow-blue-500/20 rotate-3">G</div>
            <div className="flex flex-col">
              <h1 className="text-xl font-black tracking-tighter bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">GALLAGYAN</h1>
              <span className="text-[8px] font-black tracking-[0.3em] text-blue-500 uppercase -mt-1">Modern Wealth</span>
            </div>
          </div>
          
          <div className="flex-1 w-full relative" ref={searchRef}>
            <form onSubmit={(e) => { e.preventDefault(); if (ticker) fetchStock(ticker); }} className="flex gap-3">
              <input
                type="text"
                value={ticker}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                placeholder="Search Stocks (e.g. RELIANCE, ZOMATO)"
                className="w-full bg-white/[0.03] border border-white/[0.08] group-hover:border-white/[0.15] rounded-2xl py-3 px-6 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all placeholder:text-gray-600 shadow-inner"
              />
              <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all disabled:opacity-50">
                {loading ? '...' : 'Search'}
              </button>
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#0a0a0a] border border-white/[0.1] rounded-2xl overflow-hidden shadow-2xl z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                {suggestions.map((s) => (
                  <button
                    key={s.symbol}
                    onClick={() => { setTicker(s.symbol); fetchStock(s.symbol); }}
                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/[0.05] border-b border-white/[0.05] last:border-0 text-left transition-colors"
                  >
                    <div>
                      <p className="text-sm font-black text-white">{s.symbol}</p>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{s.name}</p>
                    </div>
                    <span className="text-[10px] font-black text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">QUICK VIEW</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
          {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-5 rounded-3xl text-center text-sm font-bold animate-pulse">{error}</div>}

          {stock ? (
            <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
              <div className="bg-gradient-to-b from-white/[0.05] to-transparent rounded-[2.5rem] p-8 md:p-12 border border-white/[0.08] relative overflow-hidden">
                <div className="flex flex-col md:flex-row justify-between items-start gap-8 relative z-10">
                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">{stock.name}</h2>
                      <button onClick={(e) => toggleWatchlist(e, stock.symbol)} className={`transition-all hover:scale-125 p-2 rounded-full ${watchlist.includes(stock.symbol.replace('.NS', '').replace('.BO', '')) ? 'bg-yellow-500/10 text-yellow-400' : 'bg-white/5 text-gray-600 hover:text-gray-400'}`}>
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-500/20">NSE India</span>
                      <p className="text-gray-500 font-mono font-bold tracking-widest text-sm">{stock.symbol}</p>
                    </div>
                  </div>
                  <div className="text-left md:text-right w-full md:w-auto">
                    <div className="text-6xl md:text-8xl font-black tabular-nums tracking-tighter text-white">₹{stock.price.toLocaleString('en-IN')}</div>
                    <div className={`text-2xl md:text-3xl font-black mt-2 flex items-center md:justify-end gap-3 ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      <span className="flex items-center gap-1">{stock.change >= 0 ? '▲' : '▼'} {Math.abs(stock.change).toFixed(2)}</span>
                      <span className="text-xs md:text-sm bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/5 font-bold">{stock.percent_change.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>

                <div className="mt-12 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border border-blue-500/20 rounded-3xl p-6 relative group overflow-hidden">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">GallaGyan AI Signal</h4>
                  </div>
                  <p className="text-gray-300 text-sm md:text-base leading-relaxed font-medium">
                    {stock.percent_change > 0 
                      ? `${stock.name} is showing bullish momentum. Market cap of ₹${(stock.market_cap / 10000000).toFixed(0)}Cr indicates stability.` 
                      : `${stock.name} is in correction. Trading volume is ${stock.volume > 1000000 ? 'elevated' : 'normal'}. Monitor support at ₹${stock.fiftyTwoWeekLow}.`}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex p-1.5 bg-white/[0.03] border border-white/[0.08] rounded-2xl w-full md:w-max">
                  {(['chart', 'financials', 'news'] as const).map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 md:w-32 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>{tab}</button>
                  ))}
                </div>

                <div className="animate-in fade-in duration-500">
                  {activeTab === 'chart' && <div className="bg-white/[0.03] rounded-[2rem] p-4 md:p-8 border border-white/[0.08]"><StockChart data={history} /></div>}
                  {activeTab === 'financials' && (
                    <div className="bg-white/[0.03] rounded-[2rem] p-8 md:p-12 border border-white/[0.08]">
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12">
                        <Stat label="Open Price" value={stock.open} isCurrency />
                        <Stat label="Market Cap" value={`₹${(stock.market_cap / 10000000).toFixed(0)} Cr`} />
                        <Stat label="P/E Ratio" value={stock.pe_ratio?.toFixed(2) ?? '-'} />
                        <Stat label="Volume" value={stock.volume.toLocaleString()} />
                        <Stat label="52W High" value={stock.fiftyTwoWeekHigh} isCurrency />
                        <Stat label="52W Low" value={stock.fiftyTwoWeekLow} isCurrency />
                        <Stat label="Day High" value={stock.high} isCurrency />
                        <Stat label="Day Low" value={stock.low} isCurrency />
                      </div>
                    </div>
                  )}
                  {activeTab === 'news' && (
                    <div className="bg-white/[0.03] rounded-[2rem] p-6 md:p-10 border border-white/[0.08]">
                      <div className="space-y-6">
                        {news.length > 0 ? news.map((item, idx) => (
                          <NewsCard key={idx} item={item} />
                        )) : <p className="text-center text-gray-600 py-10 text-sm">No recent news found.</p>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : !loading && (
            <div className="space-y-10 animate-in fade-in duration-1000">
              <div className="flex flex-col items-center justify-center py-20 bg-white/[0.01] border-2 border-dashed border-white/[0.05] rounded-[3rem] text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center mb-8 text-4xl font-black shadow-2xl shadow-blue-500/20 rotate-6">G</div>
                <h3 className="text-3xl font-black text-gray-300 uppercase tracking-tighter">Enter the Treasury</h3>
                <p className="text-gray-600 mt-3 max-w-sm mx-auto font-medium">Master the art of Indian wealth. Search any NSE/BSE stock below.</p>
              </div>

              <div className="space-y-6 px-2">
                <h3 className="text-2xl font-black tracking-tighter uppercase italic">Market Buzz</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {marketNews.map((item, idx) => (
                    <NewsCard key={idx} item={item} />
                  ))}
                </div>
              </div>

              {/* SEO Content Section: Market Intelligence */}
              <article className="mt-16 p-8 md:p-12 bg-white/[0.02] border border-white/[0.05] rounded-[3rem] space-y-8">
                <header className="space-y-2">
                  <h2 className="text-xl font-black tracking-tight text-blue-400 uppercase">Financial Intelligence Dashboard</h2>
                  <p className="text-gray-400 text-sm font-medium leading-relaxed">
                    GallaGyan is more than just a ticker; it is a gateway to the Indian capital markets. By combining 
                    <strong> Real-Time NSE/BSE Data</strong> with modern technical indicators, we provide a 
                    professional-grade analysis platform for the everyday investor.
                  </p>
                </header>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <section className="space-y-3">
                    <h4 className="text-xs font-black text-white uppercase tracking-widest">Technical Metrics</h4>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      Track 52-Week Highs, Lows, and P/E Ratios to gauge valuation. Our system sanitizes data 
                      directly from the National Stock Exchange of India.
                    </p>
                  </section>
                  <section className="space-y-3">
                    <h4 className="text-xs font-black text-white uppercase tracking-widest">Market Wisdom</h4>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      Inspired by traditional Indian bookkeeping (Galla), we prioritize risk management and 
                      "Danger" detection in market news feeds.
                    </p>
                  </section>
                  <section className="space-y-3">
                    <h4 className="text-xs font-black text-white uppercase tracking-widest">Live Integration</h4>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      Utilizing high-performance Python FastAPI backends and Next.js frontend, GallaGyan delivers 
                      low-latency market insights across 5,000+ listed companies.
                    </p>
                  </section>
                </div>
              </article>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-8">
          <section className="bg-white/[0.03] rounded-[2.5rem] p-8 border border-white/[0.08] shadow-2xl">
            <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.25em] mb-6 flex items-center gap-2">Market Watch</h3>
            <div className="flex flex-wrap lg:flex-col gap-3">
              {QUICK_STOCKS.map(s => (
                <button key={s} onClick={() => { setTicker(s); fetchStock(s); }} className="bg-white/[0.02] hover:bg-white/[0.06] px-5 py-3.5 rounded-2xl text-sm font-bold transition-all text-left border border-white/[0.05] flex justify-between items-center group">
                  <span className="group-hover:text-blue-400 transition-colors">{s}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="bg-white/[0.03] rounded-[2.5rem] p-8 border border-white/[0.08] shadow-2xl min-h-[300px]">
             <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.25em] mb-6 flex items-center gap-2">Treasury</h3>
            {watchlist.length === 0 ? <p className="text-center py-10 opacity-30 text-xs font-black uppercase">Your Vault is Empty</p> : (
              <div className="flex flex-wrap lg:flex-col gap-3">
                {watchlist.map(s => (
                  <div key={s} className="flex justify-between items-center bg-blue-600/[0.03] p-4 rounded-2xl border border-blue-500/10">
                    <button onClick={() => { setTicker(s); fetchStock(s); }} className="text-blue-400 font-black text-sm flex-1 text-left">{s}</button>
                    <button onClick={(e) => toggleWatchlist(e, s)} className="text-gray-700 hover:text-red-500 p-1">✕</button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      
      <footer className="max-w-7xl mx-auto mt-24 p-12 border-t border-white/[0.05] text-center space-y-6">
        <div className="flex flex-wrap justify-center gap-10 font-black uppercase tracking-[0.3em] text-[10px] text-gray-700">
          <span className="hover:text-blue-500 transition-colors cursor-pointer">Live Exchange</span>
          <span className="hover:text-blue-500 transition-colors cursor-pointer">AI Logic</span>
          <span className="hover:text-blue-500 transition-colors cursor-pointer">Education First</span>
          <a href="/privacy" className="hover:text-white transition-colors cursor-pointer border-b border-white/10 pb-0.5">Privacy Policy</a>
        </div>

        <div className="flex flex-col md:flex-row justify-center items-center gap-6 py-6 border-y border-white/[0.03]">
          <a href="https://github.com/kothapallianandsagar" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-600 hover:text-blue-400 transition-all text-[9px] font-black uppercase tracking-[0.2em]">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.042-1.416-4.042-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            GitHub
          </a>
          <a href="mailto:kothapallianandsagar@gmail.com" className="flex items-center gap-2 text-gray-600 hover:text-blue-400 transition-all text-[9px] font-black uppercase tracking-[0.2em]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            Support
          </a>
        </div>

        <p className="max-w-3xl mx-auto leading-relaxed text-[10px] text-gray-700 font-medium italic">
          Disclaimer: GallaGyan is a technical analysis playground for educational growth. We are NOT SEBI registered. 
          Stock market investments are subject to capital risks. No real money or advice is involved here.
        </p>
      </footer>

      <style jsx global>{`
        body { background-color: #050505; }
        .animate-in { animation: fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

function NewsCard({ item }: { item: NewsItem }) {
  const isDanger = /SCAM|FRAUD|CRASH|INVESTIGATION|PENALTY|LOSS|SEBI/i.test(item.title);
  return (
    <a href={item.link} target="_blank" rel="noopener noreferrer" className={`flex flex-col gap-3 p-6 rounded-3xl transition-all group overflow-hidden relative ${isDanger ? 'bg-red-500/10 border-red-500/30' : 'bg-white/[0.02] border-white/[0.05]'} border`}>
      <div className="flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2">
           <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${isDanger ? 'text-red-400' : 'text-blue-500'}`}>{item.publisher}</p>
           {isDanger && <span className="text-[8px] bg-red-600 text-white px-2 py-0.5 rounded-full font-black animate-pulse">BREAKING</span>}
        </div>
        <span className="text-[8px] bg-white/5 px-2 py-0.5 rounded-full text-gray-500 font-black tracking-tighter uppercase">{formatTime(item.providerPublishTime)}</span>
      </div>
      <h4 className={`font-bold text-sm leading-relaxed line-clamp-3 relative z-10 ${isDanger ? 'text-red-200' : 'group-hover:text-blue-400'}`}>{item.title}</h4>
      <p className="text-gray-700 text-[8px] font-black uppercase tracking-widest mt-auto opacity-40">
        {new Date(item.providerPublishTime * 1000).toLocaleString(undefined, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
      </p>
    </a>
  );
}

function Stat({ label, value, isCurrency = false }: { label: string, value: any, isCurrency?: boolean }) {
  return (
    <div className="space-y-2">
      <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest truncate">{label}</p>
      <p className="font-mono text-lg font-bold text-white/90 tracking-tighter">
        {isCurrency && typeof value === 'number' ? `₹${value.toLocaleString('en-IN')}` : (value ?? '-')}
      </p>
    </div>
  );
}
