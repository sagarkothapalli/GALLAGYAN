'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Zap, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0, scale: 0.95 },
  visible: { 
    y: 0, 
    opacity: 1, 
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 }
  }
};

const StockChart = dynamic(() => import('@/components/StockChart').then(mod => mod.StockChart), { 
  ssr: false,
  loading: () => <div className="h-[300px] md:h-[400px] w-full bg-white/[0.02] animate-pulse rounded-[2rem] flex items-center justify-center text-slate-500 border border-white/5">Initializing Data Core...</div>
});

const QUICK_STOCKS = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'SBIN', 'BHARTIARTL', 'LICI', 'ITC', 'HINDUNILVR'];
const SECTORS = [
    { name: 'Nifty 50', symbol: '^NSEI' },
    { name: 'Sensex', symbol: '^BSESN' },
    { name: 'Bank Nifty', symbol: '^NSEBANK' },
    { name: 'Nifty IT', symbol: '^CNXIT' },
    { name: 'Nifty Auto', symbol: '^CNXAUTO' },
    { name: 'Nifty FMCG', symbol: '^CNXFMCG' },
    { name: 'Nifty Metal', symbol: '^CNXMETAL' },
    { name: 'Nifty Pharma', symbol: '^CNXPHARMA' },
    { name: 'Nifty Energy', symbol: '^CNXENERGY' }
];
const PERIODS = [
    { label: '1D', value: '1d', interval: '1m' },
    { label: '5D', value: '5d', interval: '5m' },
    { label: '1M', value: '1mo', interval: '1d' },
    { label: '6M', value: '6mo', interval: '1d' },
    { label: '1Y', value: '1y', interval: '1wk' },
    { label: '5Y', value: '5y', interval: '1mo' },
];

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
  const [ticker, setTicker] = useState('RELIANCE');
  const [stock, setStock] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [bgLoading, setBgLoading] = useState(false);
  const [period, setPeriod] = useState(PERIODS[2]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [marketIndices, setMarketIndices] = useState<any[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [portfolioPrices, setPortfolioPrices] = useState<Record<string, number>>({});
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isBackendLive, setIsBackendLive] = useState(true);
  const [peersData, setPeersData] = useState<any>(null);
  const [marketNews, setMarketNews] = useState<any>(null);
  const [sectorData, setSectorPerformance] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [modal, setModal] = useState<{ type: 'portfolio' | 'alert'; symbol: string; price: number } | null>(null);
  const [modalValue, setModalValue] = useState('');

  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
      fetchUserData(token);
    } else {
      const savedWatchlist = localStorage.getItem('watchlist');
      const savedPortfolio = localStorage.getItem('portfolio');
      const savedAlerts = localStorage.getItem('alerts');
      if (savedWatchlist) setWatchlist(JSON.parse(savedWatchlist));
      if (savedPortfolio) setPortfolio(JSON.parse(savedPortfolio));
      if (savedAlerts) setAlerts(JSON.parse(savedAlerts));
    }
  }, []);

  const fetchUserData = async (token: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${baseUrl}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setWatchlist(data.watchlist || []);
        setPortfolio(data.portfolio || []);
        setAlerts(data.alerts || []);
      } else if (res.status === 401) {
        handleLogout();
      }
    } catch (e) {}
  };

  const syncWithBackend = async (newData: any) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      await fetch(`${baseUrl}/api/auth/update-data`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(newData)
      });
    } catch (e) {}
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setWatchlist([]);
    setPortfolio([]);
    setAlerts([]);
    window.location.reload();
  };

  useEffect(() => {
    if (watchlist.length > 0) localStorage.setItem('watchlist', JSON.stringify(watchlist));
    if (portfolio.length > 0) localStorage.setItem('portfolio', JSON.stringify(portfolio));
    if (alerts.length > 0) localStorage.setItem('alerts', JSON.stringify(alerts));
  }, [watchlist, portfolio, alerts]);

  useEffect(() => {
    if (!isMounted) return;
    fetchStock(ticker);
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    fetchHistory(ticker, period);
  }, [ticker, period, isMounted]);

  const bootstrapMarketData = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${baseUrl}/api/market/bootstrap`);
      if (res.ok) {
        const data = await res.json();
        setMarketIndices(data.indices);
        setSectorPerformance(data.sectors);
        setIsBackendLive(true);
      }
    } catch (e) {
      setIsBackendLive(false);
    }
  };

  const fetchMarketNews = async () => { 
    try { 
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${baseUrl}/api/stock/NIFTY/news`); 
      if (res.ok) setMarketNews({ articles: await res.json(), sentiment: 'Neutral' }); 
    } catch (e) {} 
  };

  useEffect(() => {
    bootstrapMarketData();
    fetchMarketNews();
    
    const interval = setInterval(bootstrapMarketData, 30000);
    const handleClickOutside = (e: MouseEvent) => { if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSuggestions(false); };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchStock = async (symbol: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/stock/${symbol}`);
      if (res.ok) {
        const data = await res.json();
        setStock(data);
        setTicker(symbol);
        fetchPeers(symbol);
      }
    } catch (e) {}
    setLoading(false);
  };

  const fetchPeers = async (symbol: string) => { try { const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/stock/${symbol}/peers`); if (res.ok) setPeersData(await res.json()); } catch (e) {} };

  const fetchHistory = async (symbol: string, periodObj: any) => {
    setBgLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/stock/${symbol}/history?period=${periodObj.value}&interval=${periodObj.interval}`);
      if (res.ok) setHistory(await res.json());
    } catch (e) {}
    setBgLoading(false);
  };

  const getSuggestions = async (q: string) => {
    if (q.length < 2) { setSuggestions([]); return; }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/search/suggestions?query=${q}`);
      if (res.ok) setSuggestions(await res.json());
    } catch (e) {}
  };

  const toggleWatchlist = (e: any, symbol: string) => {
    e.stopPropagation();
    let newList;
    if (watchlist.includes(symbol)) {
      newList = watchlist.filter(s => s !== symbol);
    } else {
      newList = [...watchlist, symbol];
    }
    setWatchlist(newList);
    syncWithBackend({ watchlist: newList });
  };

  const addToPortfolio = (symbol: string, price: number) => {
    setModal({ type: 'portfolio', symbol, price });
    setModalValue('1');
  };

  const addAlert = (symbol: string, currentPrice: number) => {
    setModal({ type: 'alert', symbol, price: currentPrice });
    setModalValue('');
  };

  const handleModalSubmit = () => {
    if (!modal) return;
    if (modal.type === 'portfolio') {
      const units = Number(modalValue);
      if (modalValue && !isNaN(units) && units > 0) {
        const newItem = { symbol: modal.symbol, avgPrice: modal.price, units, date: new Date().toISOString() };
        const newList = [...portfolio, newItem];
        setPortfolio(newList);
        syncWithBackend({ portfolio: newList });
      }
    } else {
      const target = Number(modalValue);
      if (modalValue && !isNaN(target) && target > 0) {
        const newItem = { symbol: modal.symbol, price: target, type: target > modal.price ? 'ABOVE' : 'BELOW' };
        const newList = [...alerts, newItem];
        setAlerts(newList);
        syncWithBackend({ alerts: newList });
      }
    }
    setModal(null);
    setModalValue('');
  };

  const removeAlert = (alert: any) => {
    const newList = alerts.filter(a => !(a.symbol === alert.symbol && a.price === alert.price));
    setAlerts(newList);
    syncWithBackend({ alerts: newList });
  };

  const fetchPortfolioPrices = async (items: any[]) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const unique = [...new Set(items.map((i: any) => i.symbol))];
    const prices: Record<string, number> = {};
    await Promise.all(
      unique.map(async (sym: string) => {
        try {
          const res = await fetch(`${baseUrl}/api/stock/${sym}`);
          if (res.ok) {
            const data = await res.json();
            prices[sym] = data.price;
          }
        } catch {}
      })
    );
    setPortfolioPrices(prices);
  };

  const calculatePortfolioSummary = () => {
    const invested = portfolio.reduce((acc, curr) => acc + curr.units * curr.avgPrice, 0);
    const current = portfolio.reduce((acc, curr) => {
      const livePrice = portfolioPrices[curr.symbol] ?? curr.avgPrice;
      return acc + curr.units * livePrice;
    }, 0);
    const pnl = current - invested;
    const pnlPct = invested > 0 ? (pnl / invested) * 100 : 0;
    return { invested, current, pnl, pnlPct };
  };

  useEffect(() => {
    if (portfolio.length > 0) fetchPortfolioPrices(portfolio);
  }, [portfolio]);

  if (!isMounted) return null;
  const portfolioSummary = calculatePortfolioSummary();

  return (
    <div className="dark">
      <div className="min-h-screen relative overflow-hidden bg-[#050505] text-slate-100 font-sans transition-colors duration-1000">
        
        {/* Immersive Ambient Lighting matching the Login Page */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[160px] animate-pulse" />
          <div className="absolute top-[20%] right-[-10%] w-[60%] h-[60%] bg-yellow-500/5 rounded-full blur-[180px]" />
          <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-t from-yellow-500/5 to-transparent" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
        </div>

        {!isBackendLive && <div className="bg-rose-600 text-white text-[10px] font-black py-1.5 text-center uppercase tracking-[0.3em] animate-pulse relative z-[100]">Emergency Maintenance: Connection to Treasury Offline</div>}
        
        <nav className="sticky top-0 z-50 bg-black/60 backdrop-blur-3xl border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
            <div className="flex items-center gap-10">
              <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.location.reload()}>
                <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center text-black font-black text-xl shadow-lg shadow-yellow-500/20 group-hover:rotate-6 transition-transform">G</div>
                <span className="font-black text-xl tracking-tighter uppercase hidden md:block text-white">GallaGyan</span>
              </div>
              <div className="hidden lg:flex items-center gap-8">
                {marketIndices.map(idx => (
                  <div key={idx.symbol} className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{idx.symbol}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold tabular-nums text-white">₹{idx.price.toLocaleString('en-IN')}</span>
                      <span className={`text-[10px] font-black ${idx.percent_change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {idx.percent_change >= 0 ? '↑' : '↓'} {Math.abs(idx.percent_change).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex-1 max-w-md mx-8 relative" ref={searchRef}>
              <form onSubmit={(e) => { e.preventDefault(); fetchStock(ticker); setShowSuggestions(false); }} className="relative group">
                <input
                  type="text"
                  value={ticker}
                  onChange={(e) => { setTicker(e.target.value.toUpperCase()); getSuggestions(e.target.value); setShowSuggestions(true); }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Search Asset Identity"
                  className="w-full bg-[#111113] border border-white/10 rounded-2xl py-3 pl-5 pr-32 text-sm font-bold focus:ring-2 focus:ring-yellow-500/40 focus:border-yellow-500/40 outline-none transition-all text-white placeholder:text-slate-600 shadow-inner"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <button type="submit" disabled={loading} className="bg-white/5 hover:bg-white/10 text-white px-4 py-1.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50 border border-white/5">{loading ? '...' : 'Search'}</button>
                  {user ? (
                    <button onClick={handleLogout} className="bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white px-4 py-1.5 rounded-xl text-xs font-bold transition-all border border-rose-500/20">Logout</button>
                  ) : (
                    <Link href="/login" className="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-1.5 rounded-xl text-xs font-black transition-all shadow-[0_0_20px_rgba(251,191,36,0.2)]">Login</Link>
                  )}
                </div>
              </form>
              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-3 bg-[#111113]/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] overflow-hidden z-50"
                  >
                    {suggestions.map(s => (
                      <button key={s.symbol} onClick={() => { setTicker(s.symbol); fetchStock(s.symbol); setShowSuggestions(false); }} className="w-full px-6 py-4 hover:bg-white/5 flex items-center justify-between group transition-colors">
                        <div className="text-left">
                          <div className="flex items-center gap-3">
                            <span className="font-black text-sm text-white">{s.symbol}</span>
                            {s.exchange && <span className="text-[9px] font-black bg-white/5 text-slate-400 group-hover:bg-yellow-500/20 group-hover:text-yellow-500 transition-colors uppercase px-2 py-0.5 rounded-md border border-white/5">{s.exchange}</span>}
                          </div>
                          <p className="text-[11px] font-medium text-slate-500 mt-0.5">{s.name}</p>
                        </div>
                        <ChevronRight size={16} className="text-slate-600 group-hover:text-yellow-500 group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {user && (
              <div className="hidden md:flex items-center gap-4 pl-6 border-l border-white/10 relative z-10">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-yellow-500 to-amber-600 flex items-center justify-center text-black text-xs font-black uppercase shadow-lg shadow-yellow-500/20">
                  {user.username.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Analyst Level 1</span>
                  <span className="text-xs font-bold text-white">{user.username}</span>
                </div>
              </div>
            )}
          </div>
        </nav>

        <main className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
          <div className="lg:col-span-8 space-y-8">
            {stock ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                {/* Hero Asset Card */}
                <div className="bg-white/[0.02] backdrop-blur-2xl rounded-[3rem] p-8 md:p-12 border border-white/10 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
                  
                  <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                      <div className="flex items-center gap-4 mb-4">
                        <span className="bg-white/10 border border-white/5 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest backdrop-blur-md">{stock.symbol.split('.')[1] || 'NSE'}</span>
                        <button onClick={(e) => toggleWatchlist(e, stock.symbol.split('.')[0])} className={cn(
                          "p-2 rounded-xl border transition-all flex items-center justify-center w-10 h-10", 
                          watchlist.includes(stock.symbol.split('.')[0]) 
                            ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-500 shadow-[0_0_15px_rgba(251,191,36,0.2)]' 
                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-yellow-500 hover:border-white/20'
                        )}>
                          {watchlist.includes(stock.symbol.split('.')[0]) ? '★' : '☆'}
                        </button>
                      </div>
                      <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white">{stock.name}</h1>
                      <p className="text-slate-500 font-bold mt-2 uppercase tracking-[0.2em] text-xs flex items-center gap-2">
                        {stock.symbol} <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                      </p>
                    </div>
                    <div className="text-left md:text-right">
                      <div className="flex items-baseline md:justify-end gap-2">
                        <span className="text-4xl md:text-6xl font-black tabular-nums tracking-tighter text-white">₹{stock.price.toLocaleString('en-IN')}</span>
                        <span className="text-lg font-bold text-slate-500 uppercase tracking-widest">INR</span>
                      </div>
                      <p className={cn("text-xl font-black mt-2 flex items-center md:justify-end gap-2", stock.percent_change >= 0 ? 'text-emerald-500' : 'text-rose-500')}>
                        {stock.percent_change >= 0 ? '↑' : '↓'} {Math.abs(stock.percent_change).toFixed(2)}%
                        <span className="text-sm opacity-60 bg-black/20 px-2 py-0.5 rounded-md border border-white/5">₹{Math.abs(stock.change).toFixed(2)}</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-12 flex flex-wrap gap-4 relative z-10">
                    <button onClick={() => addToPortfolio(stock.symbol.split('.')[0], stock.price)} className="bg-yellow-500 text-black px-8 py-4 rounded-[1.5rem] text-sm font-black uppercase tracking-[0.2em] hover:bg-yellow-400 hover:shadow-[0_10px_30px_rgba(251,191,36,0.3)] transition-all flex items-center gap-2">
                      Authorize Transfer <ChevronRight size={16} strokeWidth={3} />
                    </button>
                    <button onClick={() => addAlert(stock.symbol.split('.')[0], stock.price)} className="bg-white/5 border border-white/10 text-white px-8 py-4 rounded-[1.5rem] text-sm font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all flex items-center gap-2">
                      <Zap size={16} /> Deploy Alert Node
                    </button>
                  </div>
                </div>

                <div className="bg-white/[0.02] backdrop-blur-2xl rounded-[3rem] p-4 md:p-8 border border-white/10 shadow-sm relative">
                  <div className="flex items-center justify-between mb-8 px-4">
                    <div className="flex gap-2 p-1 bg-black/40 rounded-2xl border border-white/5">
                      {PERIODS.map(p => (
                        <button key={p.label} onClick={() => setPeriod(p)} className={cn(
                          "px-5 py-2 rounded-xl text-xs font-black transition-all", 
                          period.label === p.label 
                            ? 'bg-white/10 text-white shadow-lg' 
                            : 'text-slate-500 hover:text-white'
                        )}>{p.label}</button>
                      ))}
                    </div>
                    {bgLoading && <div className="w-5 h-5 border-[3px] border-white/10 border-t-yellow-500 rounded-full animate-spin" />}
                  </div>
                  <div className="h-[400px] w-full"><StockChart data={history} isDark={true} /></div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard label="Market Cap" value={stock.market_cap ? (stock.market_cap / 10000000).toLocaleString('en-IN') + ' Cr' : '-'} />
                  <StatCard label="P/E Ratio" value={stock.pe_ratio?.toFixed(2) || '-'} />
                  <StatCard label="52W High" value={stock.fiftyTwoWeekHigh} isCurrency />
                  <StatCard label="52W Low" value={stock.fiftyTwoWeekLow} isCurrency />
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                <div className="flex flex-col items-center justify-center py-28 bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-[3rem] text-center shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] relative overflow-hidden">
                  <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-yellow-500/10 rounded-full blur-[120px] pointer-events-none" />
                  <div className="w-24 h-24 bg-gradient-to-tr from-yellow-500 to-amber-600 rounded-[2.5rem] flex items-center justify-center mb-8 text-4xl font-black shadow-[0_0_40px_rgba(251,191,36,0.3)] rotate-6 text-black relative z-10">G</div>
                  <h3 className="text-4xl md:text-5xl font-black text-white tracking-tighter relative z-10 mb-4">Treasury Core Online</h3>
                  <p className="text-slate-400 font-medium relative z-10 max-w-md mx-auto leading-relaxed">Secure terminal established. Search for any Indian digital asset identity to initiate real-time analysis.</p>
                </div>
                
                <div className="bg-white/[0.02] backdrop-blur-2xl p-8 md:p-10 rounded-[2.5rem] border border-white/10 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-black text-white flex items-center gap-3">
                      Market Sentiment <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" />
                    </h3>
                    {marketNews?.sentiment && (
                      <span className={cn(
                        "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border",
                        marketNews.sentiment === 'Bullish' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                        marketNews.sentiment === 'Bearish' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 
                        'bg-white/5 text-slate-400 border-white/10'
                      )}>
                        {marketNews.sentiment} Profile
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-2xl">Based on global data feeds, algorithmic sentiment analysis indicates a <strong className={cn(marketNews?.sentiment === 'Bullish' ? 'text-emerald-400' : 'text-rose-400')}>{marketNews?.sentiment?.toLowerCase() || 'neutral'}</strong> structure in the domestic markets.</p>
                </div>

                <div>
                  <div className="flex items-center justify-between px-2 mb-6">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Sector Analysis</h3>
                    <span className="text-[9px] font-black text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20 uppercase tracking-[0.2em]">Live Tracking</span>
                  </div>
                  <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {sectorData.map(s => (
                      <motion.button variants={itemVariants} whileHover={{ scale: 1.03, y: -4 }} whileTap={{ scale: 0.98 }} key={s.symbol} onClick={() => fetchStock(s.symbol)} className="bg-white/[0.02] backdrop-blur-xl p-5 rounded-[2rem] border border-white/5 shadow-sm text-left hover:border-yellow-500/30 transition-all group hover:bg-white/[0.04]">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 leading-tight">{s.name}</p>
                        <p className="text-sm font-bold text-white group-hover:text-yellow-500 transition-colors">₹{s.price.toLocaleString('en-IN')}</p>
                        <p className={cn("text-[10px] font-black mt-1", s.percent_change >= 0 ? 'text-emerald-400' : 'text-rose-400')}>{s.percent_change >= 0 ? '+' : ''}{s.percent_change.toFixed(2)}%</p>
                      </motion.button>
                    ))}
                  </motion.div>
                </div>

                <div>
                  <div className="flex items-center justify-between px-2 mb-6">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Global Feed</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(marketNews?.articles || []).map((item: any, idx: number) => (<NewsCard key={idx} item={item} />))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-6">
            <section className="bg-white/[0.02] backdrop-blur-3xl rounded-[2.5rem] p-8 border border-white/10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] min-h-[250px] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-[60px] -mr-16 -mt-16 pointer-events-none" />
              <div className="flex items-center justify-between mb-8 relative z-10">
                <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em]">Personal Vault</h3>
                <div className="flex items-center gap-2 bg-emerald-500/10 px-2.5 py-1.5 rounded-lg border border-emerald-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Encrypted Sync</span>
                </div>
              </div>
              
              <div className="mb-8 p-6 bg-black/40 rounded-3xl border border-white/5 relative z-10 space-y-3">
                <div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Invested</p>
                  <p className="text-2xl font-black tracking-tighter text-white">₹{portfolioSummary.invested.toLocaleString('en-IN')}</p>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Current Value</p>
                    <p className="text-xl font-black tracking-tighter text-white">₹{portfolioSummary.current.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">P&amp;L</p>
                    <p className={cn("text-sm font-black", portfolioSummary.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
                      {portfolioSummary.pnl >= 0 ? '+' : ''}₹{portfolioSummary.pnl.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      <span className="ml-1 text-[10px]">({portfolioSummary.pnlPct.toFixed(2)}%)</span>
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 relative z-10">
                {portfolio.length === 0 ? (
                  <div className="py-8 text-center border border-dashed border-white/10 rounded-2xl">
                     <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">No assets allocated</p>
                  </div>
                ) : (
                  portfolio.map((item, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-yellow-500/30 transition-all cursor-pointer group" onClick={() => fetchStock(item.symbol)}>
                      <div>
                        <p className="text-sm font-bold text-white group-hover:text-yellow-500 transition-colors">{item.symbol}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{item.units} Units @ ₹{item.avgPrice}</p>
                      </div>
                      <div className="text-right bg-black/40 px-3 py-2 rounded-xl border border-white/5">
                        <p className="text-xs font-black text-white">₹{(item.units * item.avgPrice).toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="bg-white/[0.02] backdrop-blur-2xl rounded-[2.5rem] p-8 border border-white/10 shadow-sm">
              <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.25em] mb-6">Quick Launch</h3>
              <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
                {QUICK_STOCKS.map(s => (
                  <motion.button variants={itemVariants} whileHover={{ x: 5 }} key={s} onClick={() => { setTicker(s); fetchStock(s); }} className="w-full bg-white/5 hover:bg-white/10 px-5 py-4 rounded-2xl text-sm font-bold transition-all text-left border border-white/5 hover:border-yellow-500/30 flex justify-between items-center group">
                    <span className="text-slate-300 group-hover:text-white transition-colors">{s}</span>
                    <ChevronRight size={14} className="text-slate-600 group-hover:text-yellow-500 transition-colors" />
                  </motion.button>
                ))}
              </motion.div>
            </section>

            <section className="bg-white/[0.02] backdrop-blur-2xl rounded-[2.5rem] p-8 border border-white/10 shadow-sm">
              <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.25em] mb-6">Watchlist Monitor</h3>
              {watchlist.length === 0 ? (
                <div className="py-6 text-center border border-dashed border-white/10 rounded-2xl">
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Monitor empty</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {watchlist.map(s => (
                    <div key={s} className="flex justify-between items-center bg-white/5 hover:bg-white/10 p-4 rounded-2xl border border-white/5 hover:border-yellow-500/20 transition-all group">
                      <button onClick={() => { setTicker(s); fetchStock(s); }} className="text-white group-hover:text-yellow-500 font-bold text-sm flex-1 text-left transition-colors">{s}</button>
                      <button onClick={(e) => toggleWatchlist(e, s)} className="text-slate-600 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100 bg-rose-500/10 p-1.5 rounded-lg border border-rose-500/20">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>
        
        <footer className="max-w-7xl mx-auto mt-24 p-12 border-t border-white/10 text-center space-y-8 relative z-10">
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="flex items-center gap-3 bg-emerald-500/10 text-emerald-400 px-5 py-2.5 rounded-xl border border-emerald-500/20 shadow-lg shadow-emerald-500/5 backdrop-blur-md">
              <ShieldCheck size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">SSL End-to-End Encryption</span>
            </div>
            <div className="flex flex-wrap justify-center gap-10 font-bold uppercase tracking-[0.25em] text-[10px] text-slate-500">
              <a href="#" className="hover:text-yellow-500 transition-colors">Support Node</a>
              <a href="#" className="hover:text-white transition-colors">Protocol API</a>
              <a href="/privacy" className="hover:text-white transition-colors">Privacy Ops</a>
            </div>
          </div>
        </footer>
      </div>

      {/* Modal for portfolio add / alert set */}
      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#111113] border border-white/10 rounded-[2rem] p-8 w-full max-w-sm shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-black text-white mb-1">
                {modal.type === 'portfolio' ? 'Add to Portfolio' : 'Set Price Alert'}
              </h3>
              <p className="text-xs text-slate-400 mb-6 uppercase tracking-widest">
                {modal.symbol} &mdash; Current: ₹{modal.price.toLocaleString('en-IN')}
              </p>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">
                {modal.type === 'portfolio' ? 'Number of Units' : 'Target Price (₹)'}
              </label>
              <input
                autoFocus
                type="number"
                min="0"
                step={modal.type === 'portfolio' ? '1' : '0.01'}
                value={modalValue}
                onChange={(e) => setModalValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleModalSubmit(); if (e.key === 'Escape') setModal(null); }}
                placeholder={modal.type === 'portfolio' ? 'e.g. 10' : `e.g. ${modal.price}`}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-5 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-yellow-500/40 mb-6"
              />
              <div className="flex gap-3">
                <button onClick={() => setModal(null)} className="flex-1 bg-white/5 border border-white/10 text-slate-400 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all">Cancel</button>
                <button onClick={handleModalSubmit} className="flex-1 bg-yellow-500 text-black py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-yellow-400 transition-all">Confirm</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        body { background-color: #050505; color: #f8fafc; }
        input::placeholder { font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; font-size: 10px; color: #475569; }
      `}</style>
    </div>
  );
}

function StatCard({ label, value, isCurrency = false }: { label: string, value: any, isCurrency?: boolean }) {
  return (
    <div className="bg-white/[0.02] backdrop-blur-xl p-6 rounded-[2rem] border border-white/5 shadow-sm group hover:scale-[1.02] hover:border-yellow-500/30 transition-all hover:bg-white/[0.04]">
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 leading-none">{label}</p>
      <p className="text-xl font-bold text-white tracking-tighter group-hover:text-yellow-500 transition-colors">{isCurrency && typeof value === 'number' ? `₹${value.toLocaleString('en-IN')}` : (value ?? '-')}</p>
    </div>
  );
}

function NewsCard({ item }: { item: any }) {
  const sentimentColor = item.sentiment === 'Bullish' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : item.sentiment === 'Bearish' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-white/5 text-slate-400 border-white/10';
  return (
    <a href={item.link} target="_blank" rel="noopener noreferrer" className="bg-white/[0.02] backdrop-blur-xl p-6 rounded-[2rem] border border-white/5 shadow-sm hover:border-yellow-500/30 hover:bg-white/[0.04] transition-all group flex flex-col justify-between min-h-[140px]">
      <h4 className="font-bold text-sm text-slate-300 leading-relaxed group-hover:text-white transition-colors line-clamp-2">{item.title}</h4>
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest bg-black/40 px-2 py-1 rounded-lg border border-white/5">{item.publisher}</span>
          {item.sentiment !== 'Neutral' && <span className={cn("text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-[0.2em] border", sentimentColor)}>{item.sentiment}</span>}
        </div>
        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{formatTime(item.providerPublishTime)}</span>
      </div>
    </a>
  );
}
