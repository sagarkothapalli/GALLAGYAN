'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

const StockChart = dynamic(() => import('@/components/StockChart').then(mod => mod.StockChart), { 
  ssr: false,
  loading: () => <div className="h-[300px] md:h-[400px] w-full bg-slate-100/50 animate-pulse rounded-3xl flex items-center justify-center text-slate-400 border border-slate-200">Loading Market Data...</div>
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

const QUICK_STOCKS = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ETERNAL'];

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
  const [bgLoading, setBgLoading] = useState(false);
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

    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => { if (isMounted) localStorage.setItem('watchlist', JSON.stringify(watchlist)); }, [watchlist, isMounted]);

  useEffect(() => {
    if (stock) {
      document.title = `₹${stock.price.toLocaleString('en-IN')} | ${stock.name} - GallaGyan`;
    } else {
      document.title = "GallaGyan | Live NSE/BSE Market Data";
    }
  }, [stock]);

  useEffect(() => {
    if (!isMounted) return;
    const interval = setInterval(() => {
        if (stock) {
            const cleanSymbol = stock.symbol.replace('.NS', '').replace('.BO', '');
            refreshCurrentStock(cleanSymbol);
        } else {
            fetchMarketNews();
        }
    }, 30000);
    return () => clearInterval(interval);
  }, [stock, isMounted]);

  const refreshCurrentStock = async (symbol: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const [stockRes, newsRes] = await Promise.all([
        fetch(`${baseUrl}/api/stock/${symbol}`),
        fetch(`${baseUrl}/api/stock/${symbol}/news`)
      ]);
      if (stockRes.ok) setStock(await stockRes.json());
      if (newsRes.ok) setNews(await newsRes.json());
    } catch (e) {}
  };

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
    setHistory([]);
    setNews([]);
    
    try {
      const rawInput = symbol.trim().toUpperCase();
      let cleanSymbol = rawInput.replace(/\s+/g, '');
      if (cleanSymbol.includes('IDFCFIRST') || cleanSymbol.includes('HDFCFIRST')) cleanSymbol = 'IDFCFIRSTB';
      
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

      const stockRes = await fetch(`${baseUrl}/api/stock/${cleanSymbol}`);
      if (!stockRes.ok) throw new Error('Stock not found');
      
      const stockData = await stockRes.json();
      setStock(stockData);
      setLoading(false);
      setBgLoading(true);

      const [historyData, newsData] = await Promise.all([
        fetch(`${baseUrl}/api/stock/${cleanSymbol}/history?period=1mo`).then(res => res.ok ? res.json() : []),
        fetch(`${baseUrl}/api/stock/${cleanSymbol}/news`).then(res => res.ok ? res.json() : [])
      ]);
      
      setHistory(historyData);
      setNews(newsData);
      setBgLoading(false);

    } catch (err: any) {
      setError(err.message);
      setStock(null);
      setLoading(false);
      setBgLoading(false);
    }
  };

  const toggleWatchlist = (e: React.MouseEvent, symbol: string) => {
    e.stopPropagation();
    const clean = symbol.replace('.NS', '').replace('.BO', '');
    setWatchlist(prev => prev.includes(clean) ? prev.filter(s => s !== clean) : [...prev, clean]);
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#fcfcfd] text-slate-900 font-sans selection:bg-blue-100 overflow-x-hidden">
      
      {/* Dynamic Progress Bar for Background Loading */}
      {bgLoading && <div className="fixed top-0 left-0 h-1 bg-blue-600 z-[100] animate-progress-fast shadow-[0_0_10px_rgba(37,99,235,0.5)]" />}

      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-slate-200/60 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 items-center">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => { setStock(null); setTicker(''); }}>
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform text-white">G</div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 uppercase">GallaGyan</h1>
              <span className="text-[10px] font-bold tracking-widest text-blue-600 uppercase -mt-1 opacity-80">Market Analytics</span>
            </div>
          </div>
          
          <div className="flex-1 w-full relative" ref={searchRef}>
            <form onSubmit={(e) => { e.preventDefault(); if (ticker) fetchStock(ticker); }} className="relative">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </div>
              <input
                type="text"
                value={ticker}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                placeholder="Search stocks, indices..."
                className="w-full bg-slate-100/80 border-none rounded-2xl py-3.5 pl-12 pr-6 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-slate-400 font-medium"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <button type="submit" disabled={loading} className="bg-slate-900 hover:bg-black text-white px-4 py-1.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50">
                  {loading ? '...' : 'Search'}
                </button>
              </div>
            </form>

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl z-[100] animate-in fade-in slide-in-from-top-2 duration-200 ring-1 ring-black/5">
                {suggestions.map((s) => (
                  <button
                    key={s.symbol}
                    onClick={() => { setTicker(s.symbol); fetchStock(s.symbol); }}
                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 border-b border-slate-50 last:border-0 text-left transition-colors group"
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{s.symbol}</p>
                      <p className="text-[11px] font-medium text-slate-400">{s.name}</p>
                    </div>
                    <div className="text-[10px] font-bold text-slate-300 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">View Details →</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {error && <div className="bg-red-50 text-red-600 p-6 rounded-3xl text-sm font-bold flex items-center gap-3 border border-red-100 shadow-sm"><span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> {error}</div>}

          {stock ? (
            <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
              <section className="bg-white rounded-[2rem] p-8 md:p-10 border border-slate-200/60 shadow-sm relative">
                <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">{stock.name}</h2>
                      <button onClick={(e) => toggleWatchlist(e, stock.symbol)} className={`transition-all hover:scale-110 p-2.5 rounded-2xl ${watchlist.includes(stock.symbol.replace('.NS', '').replace('.BO', '')) ? 'bg-yellow-50 text-yellow-500 shadow-sm' : 'bg-slate-50 text-slate-300 hover:text-slate-400 hover:bg-slate-100'}`}>
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-slate-200/50">NSE India</span>
                      <span className="text-slate-400 font-mono font-medium text-sm">{stock.symbol}</span>
                    </div>
                  </div>
                  <div className="text-left md:text-right">
                    <div className="text-5xl md:text-7xl font-bold tabular-nums text-slate-900">₹{stock.price.toLocaleString('en-IN')}</div>
                    <div className={`text-xl md:text-2xl font-bold mt-2 flex items-center md:justify-end gap-3 ${stock.change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      <span className="flex items-center gap-1.5">{stock.change >= 0 ? '▲' : '▼'} {Math.abs(stock.change).toFixed(2)}</span>
                      <span className="text-sm bg-slate-50 px-3 py-1 rounded-xl border border-slate-100/80 font-bold">{stock.percent_change.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>

                <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-50 rounded-2xl p-4 flex flex-col justify-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Day Range</span>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold">₹{stock.low}</span>
                            <div className="flex-1 mx-3 h-1 bg-slate-200 rounded-full overflow-hidden relative">
                                <div 
                                    className="absolute h-full bg-blue-500 rounded-full" 
                                    style={{ left: '0', width: `${((stock.price - stock.low) / (stock.high - stock.low)) * 100}%` }}
                                />
                            </div>
                            <span className="text-xs font-bold">₹{stock.high}</span>
                        </div>
                    </div>
                    <div className="md:col-span-2 bg-blue-600 text-white rounded-2xl p-4 flex items-center gap-4 shadow-lg shadow-blue-500/20">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center animate-pulse">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
                        </div>
                        <div>
                            <h4 className="text-[10px] font-bold uppercase tracking-widest opacity-80">GallaGyan Insight</h4>
                            <p className="text-xs font-bold leading-tight">
                                {stock.percent_change > 0 
                                ? `${stock.name} is outperforming. Stability remains high with ₹${(stock.market_cap / 10000000).toFixed(0)}Cr cap.` 
                                : `${stock.name} is seeing selling pressure. Support level: ₹${stock.fiftyTwoWeekLow}.`}
                            </p>
                        </div>
                    </div>
                </div>
              </section>

              <div className="space-y-6">
                <div className="flex p-1.5 bg-white border border-slate-200/60 rounded-2xl w-full md:w-max shadow-sm overflow-hidden">
                  {(['chart', 'financials', 'news'] as const).map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 md:w-32 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>{tab}</button>
                  ))}
                </div>

                <div className="animate-in fade-in duration-500">
                  {activeTab === 'chart' && (
                    <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-200/60 shadow-sm relative min-h-[400px]">
                      {bgLoading && history.length === 0 ? <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-[2rem] animate-pulse text-slate-400 font-bold text-sm">Building Chart...</div> : null}
                      <StockChart data={history} />
                    </div>
                  )}
                  {activeTab === 'financials' && (
                    <div className="bg-white rounded-[2rem] p-8 md:p-12 border border-slate-200/60 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12">
                        <Stat label="Open Price" value={stock.open} isCurrency />
                        <Stat label="Market Cap" value={`₹${(stock.market_cap / 10000000).toFixed(0)} Cr`} />
                        <Stat label="P/E Ratio" value={stock.pe_ratio?.toFixed(2) ?? '-'} />
                        <Stat label="Volume" value={stock.volume.toLocaleString()} />
                        <Stat label="52W High" value={stock.fiftyTwoWeekHigh} isCurrency />
                        <Stat label="52W Low" value={stock.fiftyTwoWeekLow} isCurrency />
                        <Stat label="Avg Volume" value="-" />
                        <Stat label="Div. Yield" value={`${(stock.dividendYield * 100).toFixed(2)}%`} />
                    </div>
                  )}
                  {activeTab === 'news' && (
                    <div className="bg-white rounded-[2rem] p-6 md:p-10 border border-slate-200/60 shadow-sm">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {news.length > 0 ? news.map((item, idx) => (
                          <NewsCard key={idx} item={item} />
                        )) : bgLoading ? Array(6).fill(0).map((_, i) => <SkeletonNewsCard key={i} />) : <p className="col-span-full text-center text-slate-400 py-10 text-sm font-bold">No recent news available.</p>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : !loading && (
            <div className="space-y-12 animate-in fade-in duration-1000">
              <div className="flex flex-col items-center justify-center py-24 bg-white border border-slate-200/60 rounded-[3rem] text-center shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.03),transparent)]" />
                <div className="w-24 h-24 bg-blue-600 rounded-[2rem] flex items-center justify-center mb-8 text-4xl font-black shadow-2xl shadow-blue-500/20 rotate-6 text-white relative z-10">G</div>
                <h3 className="text-3xl font-extrabold text-slate-900 uppercase tracking-tight relative z-10">Financial Treasury</h3>
                <p className="text-slate-400 mt-4 max-w-sm mx-auto font-medium relative z-10">Professional-grade analysis for the Indian markets. Start by searching any NSE/BSE ticker above.</p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-xl font-bold text-slate-900">Market Pulse</h3>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">LIVE FEED</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {marketNews.length > 0 ? marketNews.map((item, idx) => (
                    <NewsCard key={idx} item={item} />
                  )) : Array(4).fill(0).map((_, i) => <SkeletonNewsCard key={i} />)}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-8">
          <section className="bg-white rounded-[2.5rem] p-8 border border-slate-200/60 shadow-sm">
            <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.25em] mb-6">Pinned Indices</h3>
            <div className="space-y-3">
              {QUICK_STOCKS.map(s => (
                <button key={s} onClick={() => { setTicker(s); fetchStock(s); }} className="w-full bg-slate-50 hover:bg-slate-100 px-5 py-4 rounded-2xl text-sm font-bold transition-all text-left border border-slate-100 flex justify-between items-center group">
                  <span className="group-hover:text-blue-600 transition-colors text-slate-800">{s}</span>
                  <svg className="w-4 h-4 text-slate-300 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/></svg>
                </button>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-[2.5rem] p-8 border border-slate-200/60 shadow-sm min-h-[300px] relative overflow-hidden">
             <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.25em] mb-6">Your Vault</h3>
            {watchlist.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Vault is Empty</p>
                </div>
            ) : (
              <div className="space-y-3">
                {watchlist.map(s => (
                  <div key={s} className="flex justify-between items-center bg-blue-50/50 hover:bg-blue-50 p-4 rounded-2xl border border-blue-100 transition-colors group">
                    <button onClick={() => { setTicker(s); fetchStock(s); }} className="text-blue-600 font-bold text-sm flex-1 text-left">{s}</button>
                    <button onClick={(e) => toggleWatchlist(e, s)} className="text-slate-300 hover:text-rose-500 p-1 transform scale-0 group-hover:scale-100 transition-transform">✕</button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      
      <footer className="max-w-7xl mx-auto mt-24 p-12 border-t border-slate-200/60 text-center space-y-8 bg-white/40">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full border border-emerald-100 shadow-sm animate-in fade-in">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span className="text-[10px] font-black uppercase tracking-widest">SSL Secure Encryption</span>
          </div>
          <div className="flex flex-wrap justify-center gap-10 font-bold uppercase tracking-[0.2em] text-[10px] text-slate-400">
            <span className="hover:text-slate-900 cursor-pointer transition-colors">Real-time Data</span>
            <span className="hover:text-slate-900 cursor-pointer transition-colors">Analysis Engine</span>
            <a href="mailto:contact@gallagyan.xyz" className="hover:text-blue-600 transition-colors">Contact Support</a>
            <a href="/privacy" className="hover:text-slate-900 cursor-pointer transition-colors">Privacy</a>
          </div>
        </div>
        <p className="max-w-3xl mx-auto leading-relaxed text-[11px] text-slate-400 font-medium">
          GallaGyan is an educational data visualizer. Market data is provided for research and informational purposes only. No financial advice is intended.
        </p>
      </footer>

      <style jsx global>{`
        @keyframes progress { 0% { width: 0%; } 100% { width: 100%; } }
        .animate-progress-fast { animation: progress 2s cubic-bezier(0.1, 0, 0.1, 1) infinite; }
        .animate-in { animation: fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

function NewsCard({ item }: { item: NewsItem }) {
  const isDanger = /SCAM|FRAUD|CRASH|INVESTIGATION|PENALTY|LOSS|SEBI|FALL|MISS/i.test(item.title);
  return (
    <a href={item.link} target="_blank" rel="noopener noreferrer" className={`flex flex-col gap-4 p-6 rounded-3xl transition-all hover:scale-[1.02] shadow-sm hover:shadow-md ${isDanger ? 'bg-rose-50 border-rose-100 shadow-rose-500/5' : 'bg-white border-slate-100'} border group`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
           <span className={`text-[9px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 rounded-md ${isDanger ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>{item.publisher}</span>
           {isDanger && <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />}
        </div>
        <span className="text-[9px] font-bold text-slate-400 uppercase">{formatTime(item.providerPublishTime)}</span>
      </div>
      <h4 className={`font-bold text-sm leading-snug line-clamp-3 ${isDanger ? 'text-rose-900' : 'text-slate-800 group-hover:text-blue-600 transition-colors'}`}>{item.title}</h4>
      <div className="mt-auto pt-2 border-t border-slate-100/50 flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Read Article</span>
        <svg className="w-3 h-3 text-slate-300 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
      </div>
    </a>
  );
}

function SkeletonNewsCard() {
    return (
        <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 animate-pulse space-y-4">
            <div className="flex justify-between items-center"><div className="h-3 w-20 bg-slate-200 rounded" /><div className="h-3 w-10 bg-slate-200 rounded" /></div>
            <div className="space-y-2"><div className="h-4 w-full bg-slate-200 rounded" /><div className="h-4 w-2/3 bg-slate-200 rounded" /></div>
            <div className="h-3 w-16 bg-slate-200 rounded pt-2" />
        </div>
    );
}

function Stat({ label, value, isCurrency = false }: { label: string, value: any, isCurrency?: boolean }) {
  return (
    <div className="space-y-1.5 group">
      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest truncate group-hover:text-slate-500 transition-colors">{label}</p>
      <p className="font-mono text-xl font-bold text-slate-900 tracking-tighter group-hover:scale-105 origin-left transition-transform">
        {isCurrency && typeof value === 'number' ? `₹${value.toLocaleString('en-IN')}` : (value ?? '-')}
      </p>
    </div>
  );
}
