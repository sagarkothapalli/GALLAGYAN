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
  exchange?: string;
}

interface PortfolioItem {
  symbol: string;
  name: string;
  buyPrice: number;
  quantity: number;
}

interface FundamentalData {
  date: string;
  revenue: number;
  net_income: number;
  ebitda: number;
  eps: number;
}

const QUICK_STOCKS = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ETERNAL'];
const SECTORS = [
    { name: 'Nifty Bank', symbol: '^NSEBANK' },
    { name: 'Nifty IT', symbol: '^CNXIT' },
    { name: 'Nifty Auto', symbol: '^CNXAUTO' },
    { name: 'Nifty FMCG', symbol: '^CNXFMCG' },
    { name: 'Nifty Metal', symbol: '^CNXMETAL' }
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
  const [ticker, setTicker] = useState('');
  const [stock, setStock] = useState<StockData | null>(null);
  const [history, setHistory] = useState<ChartData[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [fundamentals, setFundamentals] = useState<FundamentalData[]>([]);
  const [actions, setActions] = useState<any>(null);
  const [peersData, setPeersData] = useState<any>(null);
  const [marketNews, setMarketNews] = useState<NewsItem[]>([]);
  const [marketIndices, setMarketIndices] = useState<any[]>([]);
  const [sectorData, setSectorPerformance] = useState<any[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [isBackendLive, setIsBackendLive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [bgLoading, setBgLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'chart' | 'financials' | 'news' | 'portfolio'>('chart');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [portfolioInput, setPortfolioInput] = useState({ buyPrice: '', quantity: '' });
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [chartPeriod, setChartPeriod] = useState(PERIODS[2]);
  const [showSMA20, setShowSMA20] = useState(false);
  const [showSMA50, setShowSMA50] = useState(false);
  const [showEMA9, setShowEMA9] = useState(false);
  const [showEMA21, setShowEMA21] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
    const savedWatchlist = localStorage.getItem('watchlist');
    const savedPortfolio = localStorage.getItem('portfolio');
    if (savedWatchlist) { try { setWatchlist(JSON.parse(savedWatchlist)); } catch (e) {} }
    if (savedPortfolio) { try { setPortfolio(JSON.parse(savedPortfolio)); } catch (e) {} }
    checkHealth();
    fetchIndices();
    fetchMarketNews();
    fetchSectorPerformance();
    const handleClickOutside = (e: MouseEvent) => { if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSuggestions(false); };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => { if (isMounted) { localStorage.setItem('watchlist', JSON.stringify(watchlist)); localStorage.setItem('portfolio', JSON.stringify(portfolio)); } }, [watchlist, portfolio, isMounted]);

  useEffect(() => {
    if (stock) {
      document.title = `₹${stock.price.toLocaleString('en-IN')} | ${stock.name} - GallaGyan`;
      fetchHistory(stock.symbol.replace('.NS', '').replace('.BO', ''), chartPeriod);
    }
  }, [stock, chartPeriod]);

  useEffect(() => {
    if (!isMounted) return;
    const interval = setInterval(() => { if (stock) refreshCurrentStock(stock.symbol.replace('.NS', '').replace('.BO', '')); else fetchMarketNews(); checkHealth(); fetchIndices(); }, 30000);
    return () => clearInterval(interval);
  }, [stock, isMounted]);

  const checkHealth = async () => { try { const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/health`); setIsBackendLive(res.ok); } catch (e) { setIsBackendLive(false); } };
  const fetchIndices = async () => { try { const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/market/indices`); if (res.ok) setMarketIndices(await res.json()); } catch (e) {} };
  const fetchSectorPerformance = async () => { try { const res = await Promise.all(SECTORS.map(async s => { const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/stock/${s.symbol.replace('^', '')}`); return r.ok ? { ...await r.json(), name: s.name } : null; })); setSectorPerformance(res.filter(Boolean)); } catch (e) {} };
  const fetchHistory = async (symbol: string, period: typeof PERIODS[0]) => { setBgLoading(true); try { const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/stock/${symbol}/history?period=${period.value}&interval=${period.interval}`); if (res.ok) setHistory(await res.json()); } catch (e) {} setBgLoading(false); };
  const refreshCurrentStock = async (symbol: string) => { try { const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'; const [stockRes, newsRes] = await Promise.all([fetch(`${baseUrl}/api/stock/${symbol}`), fetch(`${baseUrl}/api/stock/${symbol}/news`)]); if (stockRes.ok) setStock(await stockRes.json()); if (newsRes.ok) setNews(await newsRes.json()); } catch (e) {} };

  useEffect(() => {
    const fetchSuggestions = async () => { if (ticker.length < 2) { setSuggestions([]); return; } try { const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/search/suggestions?query=${ticker}`); if (res.ok) setSuggestions(await res.json()); } catch (e) {} };
    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [ticker]);

  const fetchMarketNews = async () => { try { const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/market/news`); if (res.ok) setMarketNews(await res.json()); } catch (e) {} };

  const fetchStock = async (symbol: string) => {
    setLoading(true); setError(''); setShowSuggestions(false); setActiveTab('chart'); setHistory([]); setNews([]); setFundamentals([]); setActions(null); setPeersData(null);
    try {
      const cleanSymbol = symbol.trim().toUpperCase().replace(/\s+/g, '');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const stockRes = await fetch(`${baseUrl}/api/stock/${cleanSymbol}`);
      if (!stockRes.ok) throw new Error('Stock not found');
      const stockData = await stockRes.json();
      setStock(stockData); setLoading(false);
      const [newsRes, fundRes, actionRes, peerRes] = await Promise.all([fetch(`${baseUrl}/api/stock/${cleanSymbol}/news`), fetch(`${baseUrl}/api/stock/${cleanSymbol}/fundamentals`), fetch(`${baseUrl}/api/stock/${cleanSymbol}/actions`), fetch(`${baseUrl}/api/stock/${cleanSymbol}/peers`)]);
      if (newsRes.ok) setNews(await newsRes.json()); if (fundRes.ok) setFundamentals(await fundRes.json()); if (actionRes.ok) setActions(await actionRes.json()); if (peerRes.ok) setPeersData(await peerRes.json());
    } catch (err: any) { setError(err.message); setStock(null); setLoading(false); }
  };

  const toggleWatchlist = (e: React.MouseEvent, symbol: string) => { e.stopPropagation(); const clean = symbol.replace('.NS', '').replace('.BO', ''); setWatchlist(prev => prev.includes(clean) ? prev.filter(s => s !== clean) : [...prev, clean]); };
  const addToPortfolio = () => { if (!stock || !portfolioInput.buyPrice || !portfolioInput.quantity) return; const newItem: PortfolioItem = { symbol: stock.symbol.replace('.NS', '').replace('.BO', ''), name: stock.name, buyPrice: parseFloat(portfolioInput.buyPrice), quantity: parseFloat(portfolioInput.quantity) }; setPortfolio(prev => [...prev.filter(i => i.symbol !== newItem.symbol), newItem]); setPortfolioInput({ buyPrice: '', quantity: '' }); };
  const removeFromPortfolio = (symbol: string) => setPortfolio(prev => prev.filter(i => i.symbol !== symbol));
  const calculatePortfolioSummary = () => { let totalInv = 0, totalVal = 0; portfolio.forEach(item => { totalInv += item.buyPrice * item.quantity; const currentPrice = (stock && stock.symbol.includes(item.symbol)) ? stock.price : item.buyPrice; totalVal += currentPrice * item.quantity; }); return { totalInv, totalVal, pnl: totalVal - totalInv, pnlPercent: totalInv > 0 ? ((totalVal - totalInv) / totalInv) * 100 : 0 }; };

  if (!isMounted) return null;
  const portfolioSummary = calculatePortfolioSummary();

  return (
    <div className="min-h-screen bg-[#fcfcfd] text-slate-900 font-sans selection:bg-blue-100 overflow-x-hidden">
      <div className="bg-white border-b border-slate-200/60 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-8 py-2.5">
          <div className="flex items-center gap-2 pr-4 border-r border-slate-100"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /><span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Market Open</span></div>
          {marketIndices.map(idx => (<div key={idx.symbol} className="flex items-center gap-3 whitespace-nowrap"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{idx.symbol}</span><span className="text-xs font-bold text-slate-900">₹{idx.price?.toLocaleString('en-IN')}</span><span className={`text-[10px] font-bold ${idx.change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{idx.change >= 0 ? '+' : ''}{idx.percent_change?.toFixed(2)}%</span></div>))}
        </div>
      </div>
      {!isBackendLive && <div className="bg-rose-600 text-white text-[10px] font-black uppercase tracking-[0.3em] py-2 text-center animate-pulse sticky top-0 z-[60]">System Offline: Connecting to GallaGyan Treasury...</div>}
      {bgLoading && <div className="fixed top-[41px] left-0 h-1 bg-blue-600 z-[100] animate-progress-fast shadow-[0_0_10px_rgba(37,99,235,0.5)]" />}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-slate-200/60 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 items-center">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => { setStock(null); setTicker(''); }}><div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform text-white">G</div><div className="flex flex-col"><h1 className="text-xl font-bold tracking-tight text-slate-900 uppercase">GallaGyan</h1><span className="text-[10px] font-bold tracking-widest text-blue-600 uppercase -mt-1 opacity-80">Market Analytics</span></div></div>
          <div className="flex-1 w-full relative" ref={searchRef}><form onSubmit={(e) => { e.preventDefault(); if (ticker) fetchStock(ticker); }} className="relative"><div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg></div><input type="text" value={ticker} onFocus={() => setShowSuggestions(true)} onChange={(e) => setTicker(e.target.value.toUpperCase())} placeholder="Search stocks, indices..." className="w-full bg-slate-100/80 border-none rounded-2xl py-3.5 pl-12 pr-6 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-slate-400 font-medium" /><div className="absolute right-3 top-1/2 -translate-y-1/2"><button type="submit" disabled={loading} className="bg-slate-900 hover:bg-black text-white px-4 py-1.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50">{loading ? '...' : 'Search'}</button></div></form>
            {showSuggestions && suggestions.length > 0 && (<div className="absolute top-full left-0 right-0 mt-3 bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl z-[100] animate-in fade-in slide-in-from-top-2 duration-200 ring-1 ring-black/5">{suggestions.map((s) => (<button key={s.symbol} onClick={() => { setTicker(s.symbol); fetchStock(s.symbol); }} className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 border-b border-slate-50 last:border-0 text-left transition-colors group"><div><div className="flex items-center gap-2"><p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{s.symbol}</p>{s.exchange && <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors uppercase">{s.exchange}</span>}</div><p className="text-[11px] font-medium text-slate-400">{s.name}</p></div></button>))}</div>)}
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {error && <div className="bg-red-50 text-red-600 p-6 rounded-3xl text-sm font-bold flex items-center gap-3 border border-red-100 shadow-sm">{error}</div>}
          {stock ? (
            <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
              <section className="bg-white rounded-[2rem] p-8 md:p-10 border border-slate-200/60 shadow-sm relative"><div className="flex flex-col md:flex-row justify-between items-start gap-8"><div className="space-y-4"><div className="flex items-center gap-4"><h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">{stock.name}</h2><button onClick={(e) => toggleWatchlist(e, stock.symbol)} className={`transition-all hover:scale-110 p-2.5 rounded-2xl ${watchlist.includes(stock.symbol.replace('.NS', '').replace('.BO', '')) ? 'bg-yellow-50 text-yellow-400' : 'bg-slate-100 text-slate-300'}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg></button></div><div className="flex items-center gap-3"><span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-[10px] font-bold tracking-widest border border-slate-200/50">NSE India</span><span className="text-slate-400 font-mono font-medium text-sm">{stock.symbol}</span></div></div><div className="text-left md:text-right"><div className="text-5xl md:text-7xl font-bold tabular-nums text-slate-900">₹{stock.price.toLocaleString('en-IN')}</div><div className={`text-xl md:text-2xl font-bold mt-2 flex items-center md:justify-end gap-3 ${stock.change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}><span className="flex items-center gap-1.5">{stock.change >= 0 ? '▲' : '▼'} {Math.abs(stock.change).toFixed(2)}</span><span className="text-sm bg-slate-50 px-3 py-1 rounded-xl border border-slate-100/80 font-bold">{stock.percent_change.toFixed(2)}%</span></div></div></div></section>
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4"><div className="flex p-1.5 bg-white border border-slate-200/60 rounded-2xl w-full md:w-max shadow-sm overflow-hidden">{(['chart', 'financials', 'news', 'portfolio'] as const).map((tab) => (<button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 md:w-32 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'}`}>{tab}</button>))}</div>{activeTab === 'chart' && (<div className="flex p-1 bg-slate-100 rounded-xl overflow-hidden shadow-inner">{PERIODS.map(p => (<button key={p.label} onClick={() => setChartPeriod(p)} className={`px-4 py-1.5 text-[10px] font-black transition-all ${chartPeriod.label === p.label ? 'bg-white text-blue-600 shadow-sm rounded-lg' : 'text-slate-400 hover:text-slate-600'}`}>{p.label}</button>))}</div>)}</div>
                <div className="animate-in fade-in duration-500">
                  {activeTab === 'chart' && (<div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-200/60 shadow-sm relative min-h-[400px]"><div className="flex flex-wrap gap-2 mb-4"><button onClick={() => setShowSMA20(!showSMA20)} className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border ${showSMA20 ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>SMA 20</button><button onClick={() => setShowSMA50(!showSMA50)} className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border ${showSMA50 ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>SMA 50</button><button onClick={() => setShowEMA9(!showEMA9)} className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border ${showEMA9 ? 'bg-pink-50 border-pink-200 text-pink-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>EMA 9</button><button onClick={() => setShowEMA21(!showEMA21)} className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border ${showEMA21 ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>EMA 21</button></div><StockChart data={history} showSMA20={showSMA20} showSMA50={showSMA50} showEMA9={showEMA9} showEMA21={showEMA21} /></div>)}
                  {activeTab === 'financials' && (<div className="space-y-8 animate-in fade-in">
                    <div className="bg-white rounded-[2rem] p-8 md:p-12 border border-slate-200/60 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12"><Stat label="Open Price" value={stock.open} isCurrency /><Stat label="Market Cap" value={`₹${(stock.market_cap / 10000000).toFixed(0)} Cr`} /><Stat label="P/E Ratio" value={stock.pe_ratio?.toFixed(2) ?? '-'} /><Stat label="Volume" value={stock.volume.toLocaleString()} /><Stat label="52W High" value={stock.fiftyTwoWeekHigh} isCurrency /><Stat label="52W Low" value={stock.fiftyTwoWeekLow} isCurrency /><Stat label="Beta" value={actions?.beta?.toFixed(2) || '-'} /><Stat label="Div. Yield" value={`${(stock.dividendYield * 100).toFixed(2)}%`} /></div>
                    {peersData?.trends && Object.keys(peersData.trends).length > 0 && (<div className="bg-white rounded-[2rem] p-8 border border-slate-200/60 shadow-sm"><h3 className="text-lg font-bold text-slate-900 mb-6">Analyst Sentiment</h3><div className="space-y-6"><div className="flex h-3 w-full rounded-full overflow-hidden"><div style={{ width: `${(peersData.trends.strong_buy + peersData.trends.buy) / (peersData.trends.strong_buy + peersData.trends.buy + peersData.trends.hold + peersData.trends.sell + peersData.trends.strong_sell) * 100}%` }} className="bg-emerald-500 h-full" /><div style={{ width: `${peersData.trends.hold / (peersData.trends.strong_buy + peersData.trends.buy + peersData.trends.hold + peersData.trends.sell + peersData.trends.strong_sell) * 100}%` }} className="bg-slate-300 h-full" /><div style={{ width: `${(peersData.trends.sell + peersData.trends.strong_sell) / (peersData.trends.strong_buy + peersData.trends.buy + peersData.trends.hold + peersData.trends.sell + peersData.trends.strong_sell) * 100}%` }} className="bg-rose-500 h-full" /></div><div className="grid grid-cols-3 gap-4 text-center"><div><p className="text-[10px] font-black text-emerald-600 uppercase">Buy</p><p className="text-xl font-black">{peersData.trends.strong_buy + peersData.trends.buy}</p></div><div><p className="text-[10px] font-black text-slate-400 uppercase">Hold</p><p className="text-xl font-black">{peersData.trends.hold}</p></div><div><p className="text-[10px] font-black text-rose-600 uppercase">Sell</p><p className="text-xl font-black">{peersData.trends.sell + peersData.trends.strong_sell}</p></div></div></div></div>)}
                    {actions && (<div className="grid grid-cols-1 md:grid-cols-2 gap-8"><div className="bg-white rounded-[2rem] p-8 border border-slate-200/60 shadow-sm"><h3 className="text-lg font-bold text-slate-900 mb-6">Valuation Metrics</h3><div className="space-y-4"><div className="flex justify-between py-2 border-b border-slate-50 text-xs font-bold uppercase text-slate-400"><span>P/B Ratio</span><span className="text-slate-900">{actions.price_to_book?.toFixed(2) || '-'}</span></div><div className="flex justify-between py-2 border-b border-slate-50 text-xs font-bold uppercase text-slate-400"><span>Insider Holdings</span><span className="text-slate-900">{(actions.held_by_insiders * 100)?.toFixed(2)}%</span></div><div className="flex justify-between py-2 border-b border-slate-50 text-xs font-bold uppercase text-slate-400"><span>EPS (Trailing)</span><span className="text-slate-900">₹{actions.trailing_eps?.toFixed(2) || '-'}</span></div></div></div><div className="bg-white rounded-[2rem] p-8 border border-slate-200/60 shadow-sm"><h3 className="text-lg font-bold text-slate-900 mb-6">Dividend History</h3>{actions.dividends?.length > 0 ? (<div className="space-y-4">{actions.dividends.map((d: any, i: number) => (<div key={i} className="flex justify-between py-2 border-b border-slate-50"><span className="text-xs text-slate-400 font-bold uppercase">{new Date(d.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}</span><span className="text-sm font-bold text-emerald-600">₹{d.amount}</span></div>))}</div>) : (<p className="text-center py-10 text-slate-300 text-xs font-bold uppercase tracking-widest">No recent dividends</p>)}</div></div>)}
                    {fundamentals.length > 0 && (<div className="bg-white rounded-[2rem] p-8 border border-slate-200/60 shadow-sm overflow-hidden"><h3 className="text-lg font-bold text-slate-900 mb-6">Quarterly Fundamentals</h3><div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100"><th className="pb-4">Quarter</th><th className="pb-4 text-right">Revenue (Cr)</th><th className="pb-4 text-right">Net Income (Cr)</th><th className="pb-4 text-right">EPS (₹)</th></tr></thead><tbody className="divide-y divide-slate-50">{fundamentals.map((f, i) => (<tr key={i} className="text-sm font-medium text-slate-700 hover:bg-slate-50"><td className="py-4 font-bold text-slate-900">{f.date}</td><td className="py-4 text-right">₹{(f.revenue / 10000000).toLocaleString('en-IN')}</td><td className="py-4 text-right text-emerald-600 font-bold">₹{(f.net_income / 10000000).toLocaleString('en-IN')}</td><td className="py-4 text-right font-mono text-xs">{f.eps?.toFixed(2) || '-'}</td></tr>))}</tbody></table></div></div>)}
                  </div>)}
                  {activeTab === 'news' && (<div className="bg-white rounded-[2rem] p-6 md:p-10 border border-slate-200/60 shadow-sm"><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{news.length > 0 ? news.map((item, idx) => (<NewsCard key={idx} item={item} />)) : <p className="col-span-full text-center text-slate-400 py-10 text-sm font-bold">No recent news available.</p>}</div></div>)}
                  {activeTab === 'portfolio' && (<div className="space-y-6"><div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Value</p><p className="text-2xl font-black text-slate-900">₹{portfolioSummary.totalVal.toLocaleString('en-IN')}</p></div><div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Profit / Loss</p><p className={`text-2xl font-black ${portfolioSummary.pnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{portfolioSummary.pnl >= 0 ? '+' : ''}₹{portfolioSummary.pnl.toLocaleString('en-IN')}</p></div><div className="bg-emerald-600 p-6 rounded-3xl shadow-lg shadow-emerald-500/20 text-white"><p className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-1">Return %</p><p className="text-2xl font-black">{portfolioSummary.pnlPercent.toFixed(2)}%</p></div></div><div className="bg-white rounded-[2rem] p-8 border border-slate-200/60 shadow-sm space-y-8"><div className="flex flex-col md:flex-row justify-between items-center gap-6 pb-8 border-b border-slate-100"><div><h3 className="text-xl font-bold text-slate-900">Add to Holdings</h3><p className="text-xs text-slate-400 font-medium">Record buy price for {stock?.name}</p></div><div className="flex gap-3"><input type="number" placeholder="Buy Price" value={portfolioInput.buyPrice} onChange={e => setPortfolioInput(prev => ({ ...prev, buyPrice: e.target.value }))} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-blue-500/10" /><input type="number" placeholder="Qty" value={portfolioInput.quantity} onChange={e => setPortfolioInput(prev => ({ ...prev, quantity: e.target.value }))} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-blue-500/10" /><button onClick={addToPortfolio} className="bg-blue-600 text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20">Add</button></div></div><div className="space-y-4">{portfolio.map(item => { const currentPrice = (stock && stock.symbol.includes(item.symbol)) ? stock.price : item.buyPrice; const pnl = (currentPrice - item.buyPrice) * item.quantity; return (<div key={item.symbol} className="flex justify-between items-center bg-slate-50/50 p-6 rounded-3xl border border-slate-100 transition-all hover:bg-white hover:shadow-md"><div className="flex items-center gap-4"><div className="w-10 h-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-400">{item.symbol[0]}</div><div><p className="text-sm font-bold text-slate-900">{item.symbol}</p><p className="text-[10px] text-slate-400 font-bold uppercase">{item.quantity} Shares @ ₹{item.buyPrice}</p></div></div><div className="text-right flex items-center gap-6"><div><p className={`text-sm font-black ${pnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{pnl >= 0 ? '+' : ''}₹{pnl.toLocaleString('en-IN')}</p></div><button onClick={() => removeFromPortfolio(item.symbol)} className="text-slate-300 hover:text-rose-500 transition-colors">✕</button></div></div>); })}</div></div></div>)}
                </div>
              </div>
            </div>
          ) : !loading && (
            <div className="space-y-12 animate-in fade-in duration-1000">
              <div className="flex flex-col items-center justify-center py-24 bg-white border border-slate-200/60 rounded-[3rem] text-center shadow-sm relative overflow-hidden"><div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.03),transparent)]" /><div className="w-24 h-24 bg-blue-600 rounded-[2rem] flex items-center justify-center mb-8 text-4xl font-black shadow-2xl shadow-blue-500/20 rotate-6 text-white relative z-10">G</div><h3 className="text-3xl font-extrabold text-slate-900 uppercase tracking-tight relative z-10">Financial Treasury</h3><p className="text-slate-400 mt-4 max-w-sm mx-auto font-medium relative z-10">Professional-grade analysis for the Indian markets. Start by searching any NSE/BSE ticker above.</p></div>
              <div className="space-y-8"><div className="flex items-center justify-between px-2"><h3 className="text-xl font-bold text-slate-900">Sector Performance</h3><span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">TOP INDICES</span></div><div className="grid grid-cols-2 md:grid-cols-5 gap-4">{sectorData.map(s => (<button key={s.symbol} onClick={() => fetchStock(s.symbol)} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-left hover:border-blue-200 transition-all group"><p className="text-[10px] font-black text-slate-400 uppercase mb-1">{s.name}</p><p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">₹{s.price.toLocaleString('en-IN')}</p><p className={`text-[10px] font-bold ${s.percent_change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{s.percent_change >= 0 ? '+' : ''}{s.percent_change.toFixed(2)}%</p></button>))}</div></div>
              <div className="space-y-6"><div className="flex items-center justify-between px-2"><h3 className="text-xl font-bold text-slate-900">Market Pulse</h3><span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">LIVE FEED</span></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{marketNews.map((item, idx) => (<NewsCard key={idx} item={item} />))}</div></div>
            </div>
          )}
        </div>
        <div className="lg:col-span-4 space-y-8">
          {peersData?.peers?.length > 0 && (<section className="bg-white rounded-[2.5rem] p-8 border border-slate-200/60 shadow-sm"><h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.25em] mb-6">Similar Stocks</h3><div className="space-y-3">{peersData.peers.map((p: any) => (<button key={p.symbol} onClick={() => fetchStock(p.symbol)} className="w-full bg-slate-50 hover:bg-slate-100 px-5 py-4 rounded-2xl text-sm font-bold transition-all text-left border border-slate-100 flex justify-between items-center group"><span className="group-hover:text-blue-600 transition-colors text-slate-800">{p.symbol}</span><span className="text-[9px] font-black text-blue-500 bg-blue-50 px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-all">VIEW</span></button>))}</div></section>)}
          <section className="bg-white rounded-[2.5rem] p-8 border border-slate-200/60 shadow-sm"><h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.25em] mb-6">Pinned Indices</h3><div className="space-y-3">{QUICK_STOCKS.map(s => (<button key={s} onClick={() => { setTicker(s); fetchStock(s); }} className="w-full bg-slate-50 hover:bg-slate-100 px-5 py-4 rounded-2xl text-sm font-bold transition-all text-left border border-slate-100 flex justify-between items-center group"><span className="group-hover:text-blue-600 transition-colors text-slate-800">{s}</span><svg className="w-4 h-4 text-slate-300 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/></svg></button>))}</div></section>
          <section className="bg-white rounded-[2.5rem] p-8 border border-slate-200/60 shadow-sm min-h-[300px] relative overflow-hidden"><h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.25em] mb-6">Your Vault</h3>{watchlist.length === 0 ? (<div className="flex flex-col items-center justify-center py-20 text-center space-y-4"><p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Vault is Empty</p></div>) : (<div className="space-y-3">{watchlist.map(s => (<div key={s} className="flex justify-between items-center bg-blue-50/50 hover:bg-blue-50 p-4 rounded-2xl border border-blue-100 transition-colors group"><button onClick={() => { setTicker(s); fetchStock(s); }} className="text-blue-600 font-bold text-sm flex-1 text-left">{s}</button><button onClick={(e) => toggleWatchlist(e, s)} className="text-slate-300 hover:text-rose-500 p-1 transform scale-0 group-hover:scale-100 transition-transform">✕</button></div>))}</div>)}</section>
        </div>
      </main>
      <footer className="max-w-7xl mx-auto mt-24 p-12 border-t border-slate-200/60 text-center space-y-8 bg-white/40"><div className="flex flex-col items-center justify-center space-y-4"><div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full border border-emerald-100 shadow-sm animate-in fade-in"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg><span className="text-[10px] font-black uppercase tracking-widest">SSL Secure Encryption</span></div><div className="flex flex-wrap justify-center gap-10 font-bold uppercase tracking-[0.2em] text-[10px] text-slate-400"><a href="mailto:contact@gallagyan.xyz" className="hover:text-blue-600 transition-colors">Contact Support</a><a href="/privacy" className="hover:text-slate-900 transition-colors">Privacy</a></div></div></footer>
      <style jsx global>{`@keyframes progress { 0% { width: 0%; } 100% { width: 100%; } } .animate-progress-fast { animation: progress 2s cubic-bezier(0.1, 0, 0.1, 1) infinite; } .animate-in { animation: fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; } @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } body { background-color: #fcfcfd; }`}</style>
    </div>
  );
}

function NewsCard({ item }: { item: NewsItem }) {
  const isDanger = /SCAM|FRAUD|CRASH|INVESTIGATION|PENALTY|LOSS|SEBI|FALL|MISS/i.test(item.title);
  return (
    <a href={item.link} target="_blank" rel="noopener noreferrer" className={`flex flex-col gap-4 p-6 rounded-3xl transition-all hover:scale-[1.02] shadow-sm hover:shadow-md ${isDanger ? 'bg-rose-50 border-rose-100' : 'bg-white border-slate-100'} border group`}>
      <div className="flex justify-between items-center"><div className="flex items-center gap-2"><span className={`text-[9px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 rounded-md ${isDanger ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>{item.publisher}</span></div><span className="text-[9px] font-bold text-slate-400 uppercase">{formatTime(item.providerPublishTime)}</span></div>
      <h4 className={`font-bold text-sm leading-snug line-clamp-3 ${isDanger ? 'text-rose-900' : 'text-slate-800 group-hover:text-blue-600'}`}>{item.title}</h4>
    </a>
  );
}

function Stat({ label, value, isCurrency = false }: { label: string, value: any, isCurrency?: boolean }) {
  return (
    <div className="space-y-1.5 group">
      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest truncate group-hover:text-slate-500 transition-colors">{label}</p>
      <p className="font-mono text-xl font-bold text-slate-900 tracking-tighter group-hover:scale-105 origin-left transition-transform">{isCurrency && typeof value === 'number' ? `₹${value.toLocaleString('en-IN')}` : (value ?? '-')}</p>
    </div>
  );
}
