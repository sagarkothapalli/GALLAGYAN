'use client';

import { useState, useEffect, useRef, useCallback, memo, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Zap, ShieldCheck, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAuthToken, getStoredUser, authFetch, logout as logoutUser } from '@/lib/auth';

// ─── TypeScript Interfaces ─────────────────────────────────────────────────
interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  percent_change: number;
  market_cap?: number;
  pe_ratio?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
}

interface MarketIndex {
  symbol: string;
  name?: string;
  price: number;
  percent_change: number;
}

interface PortfolioItem {
  symbol: string;
  avgPrice: number;
  units: number;
  date: string;
}

interface AlertItem {
  symbol: string;
  price: number;
  type: 'ABOVE' | 'BELOW';
}

interface NewsArticle {
  title: string;
  link: string;
  publisher: string;
  sentiment: string;
  providerPublishTime: number;
}

interface PeerStock {
  symbol: string;
  name?: string;
  price: number;
  percent_change: number;
  pe_ratio?: number;
}

interface SectorItem {
  symbol: string;
  name: string;
  price: number;
  percent_change: number;
}

interface SuggestionItem {
  symbol: string;
  name: string;
  exchange?: string;
}

interface PeriodOption {
  label: string;
  value: string;
  interval: string;
}

interface HistoryPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

interface UserData {
  username: string;
}

// ─── Animation Variants ────────────────────────────────────────────────────
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

// ─── Lazy Loaded Components ────────────────────────────────────────────────
const StockChart = dynamic(() => import('@/components/StockChart').then(mod => mod.StockChart), {
  ssr: false,
  loading: () => <div className="h-[300px] md:h-[400px] w-full bg-white/[0.02] animate-pulse rounded-[2rem] flex items-center justify-center text-slate-500 border border-white/5">Initializing Data Core...</div>
});

// ─── Constants ─────────────────────────────────────────────────────────────
const BASE_URL_FALLBACK = 'http://localhost:8000';
const QUICK_STOCKS = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'SBIN', 'BHARTIARTL', 'LICI', 'ITC', 'HINDUNILVR'];
const PERIODS: PeriodOption[] = [
  { label: '1D', value: '1d', interval: '1m' },
  { label: '5D', value: '5d', interval: '5m' },
  { label: '1M', value: '1mo', interval: '1d' },
  { label: '6M', value: '6mo', interval: '1d' },
  { label: '1Y', value: '1y', interval: '1wk' },
  { label: '5Y', value: '5y', interval: '1mo' },
];

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL || BASE_URL_FALLBACK;
}

function formatTime(timestamp: number) {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(timestamp * 1000).toLocaleDateString();
}

function getMarketStatus(): { isOpen: boolean; label: string } {
  const now = new Date();
  const ist = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const day = ist.getDay();
  const hours = ist.getHours();
  const minutes = ist.getMinutes();
  const timeInMinutes = hours * 60 + minutes;

  if (day === 0 || day === 6) return { isOpen: false, label: 'Closed' };
  if (timeInMinutes >= 555 && timeInMinutes <= 930) return { isOpen: true, label: 'Open' };
  return { isOpen: false, label: 'Closed' };
}

// ─── Memoized Sub-Components ───────────────────────────────────────────────
const StatCard = memo(function StatCard({ label, value, isCurrency = false }: { label: string; value: string | number | undefined | null; isCurrency?: boolean }) {
  return (
    <div className="bg-white/[0.02] backdrop-blur-xl p-6 rounded-[2rem] border border-white/5 shadow-sm group hover:scale-[1.02] hover:border-yellow-500/30 transition-all hover:bg-white/[0.04]">
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 leading-none">{label}</p>
      <p className="text-xl font-bold text-white tracking-tighter group-hover:text-yellow-500 transition-colors">{isCurrency && typeof value === 'number' ? `₹${value.toLocaleString('en-IN')}` : (value ?? '-')}</p>
    </div>
  );
});

const NewsCard = memo(function NewsCard({ item }: { item: NewsArticle }) {
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
});

// Loading Skeleton for stock card
function StockCardSkeleton() {
  return (
    <div className="bg-white/[0.02] backdrop-blur-2xl rounded-[3rem] p-8 md:p-12 border border-white/10 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4 flex-1">
          <div className="flex gap-3">
            <div className="w-16 h-6 bg-white/5 rounded-full animate-pulse" />
            <div className="w-10 h-10 bg-white/5 rounded-xl animate-pulse" />
          </div>
          <div className="w-3/4 h-12 bg-white/5 rounded-2xl animate-pulse" />
          <div className="w-1/3 h-4 bg-white/5 rounded-lg animate-pulse" />
        </div>
        <div className="space-y-3 md:text-right">
          <div className="w-48 h-12 bg-white/5 rounded-2xl animate-pulse md:ml-auto" />
          <div className="w-32 h-6 bg-white/5 rounded-xl animate-pulse md:ml-auto" />
        </div>
      </div>
      <div className="mt-12 flex gap-4">
        <div className="w-48 h-14 bg-white/5 rounded-[1.5rem] animate-pulse" />
        <div className="w-48 h-14 bg-white/5 rounded-[1.5rem] animate-pulse" />
      </div>
    </div>
  );
}

// Error Card
function StockErrorCard({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="bg-white/[0.02] backdrop-blur-2xl rounded-[3rem] p-8 md:p-12 border border-rose-500/20 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] relative overflow-hidden">
      <div className="flex flex-col items-center text-center py-8">
        <AlertTriangle size={40} className="text-rose-400 mb-4" />
        <h3 className="text-xl font-black text-white mb-2">Failed to Load Stock Data</h3>
        <p className="text-sm text-slate-400 mb-6">The data feed may be temporarily unavailable. Please try again.</p>
        <button onClick={onRetry} className="bg-yellow-500 text-black px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-yellow-400 transition-all">
          Retry
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function Home() {
  const router = useRouter();
  const [ticker, setTicker] = useState('RELIANCE');
  const [stock, setStock] = useState<StockData | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [stockError, setStockError] = useState(false);
  const [bgLoading, setBgLoading] = useState(false);
  const [period, setPeriod] = useState<PeriodOption>(PERIODS[2]);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [marketIndices, setMarketIndices] = useState<MarketIndex[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [portfolioPrices, setPortfolioPrices] = useState<Record<string, number>>({});
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isBackendLive, setIsBackendLive] = useState(true);
  const [peersData, setPeersData] = useState<PeerStock[] | null>(null);
  const [marketNews, setMarketNews] = useState<{ articles: NewsArticle[]; sentiment: string } | null>(null);
  const [sectorData, setSectorPerformance] = useState<SectorItem[]>([]);
  const [user, setUser] = useState<UserData | null>(null);
  const [modal, setModal] = useState<{ type: 'portfolio' | 'alert'; symbol: string; price: number } | null>(null);
  const [modalValue, setModalValue] = useState('');
  const [modalBuyPrice, setModalBuyPrice] = useState('');
  const [modalDate, setModalDate] = useState('');
  const [stockNews, setStockNews] = useState<NewsArticle[]>([]);
  const [showSMA20, setShowSMA20] = useState(false);
  const [showVolume, setShowVolume] = useState(true);

  const searchRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const suggestTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Auth & Init ───────────────────────────────────────────────────────
  // Uses httpOnly cookies (primary) + localStorage token (fallback) for auth.
  // The authFetch() helper in @/lib/auth handles transparent token refresh.
  useEffect(() => {
    setIsMounted(true);
    const savedUser = getStoredUser();
    const token = getAuthToken();

    if (savedUser && token) {
      setUser(savedUser);
      fetchUserData(token);
    } else {
      try {
        const savedWatchlist = localStorage.getItem('watchlist');
        const savedPortfolio = localStorage.getItem('portfolio');
        const savedAlerts = localStorage.getItem('alerts');
        if (savedWatchlist) setWatchlist(JSON.parse(savedWatchlist));
        if (savedPortfolio) setPortfolio(JSON.parse(savedPortfolio));
        if (savedAlerts) setAlerts(JSON.parse(savedAlerts));
      } catch { /* corrupted localStorage — ignore */ }
    }
  }, []);

  const fetchUserData = useCallback(async (token: string) => {
    try {
      const res = await authFetch(`${getBaseUrl()}/api/auth/me`, {
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
    } catch { /* network error — fail silently */ }
  }, []);

  const syncWithBackend = useCallback(async (newData: Record<string, unknown>) => {
    const token = getAuthToken();
    if (!token) return;
    try {
      await authFetch(`${getBaseUrl()}/api/auth/update-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newData)
      });
    } catch { /* network error — fail silently */ }
  }, []);

  const handleLogout = useCallback(async () => {
    await logoutUser();
    setUser(null);
    setWatchlist([]);
    setPortfolio([]);
    setAlerts([]);
    router.push('/');
  }, [router]);

  // ─── Persist local data ────────────────────────────────────────────────
  useEffect(() => {
    if (watchlist.length > 0) localStorage.setItem('watchlist', JSON.stringify(watchlist));
    if (portfolio.length > 0) localStorage.setItem('portfolio', JSON.stringify(portfolio));
    if (alerts.length > 0) localStorage.setItem('alerts', JSON.stringify(alerts));
  }, [watchlist, portfolio, alerts]);

  // ─── Fetch Functions with AbortController ──────────────────────────────
  const fetchStock = useCallback(async (symbol: string) => {
    // Abort previous stock fetch
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setStockError(false);
    try {
      const res = await fetch(`${getBaseUrl()}/api/stock/${symbol}`, { signal: controller.signal });
      if (res.ok) {
        const data: StockData = await res.json();
        setStock(data);
        setTicker(symbol);
        setStockNews([]);
        fetchPeers(symbol);
        fetchStockNews(symbol);
      } else {
        setStockError(true);
      }
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === 'AbortError') return;
      setStockError(true);
    }
    setLoading(false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPeers = useCallback(async (symbol: string) => {
    try {
      const res = await fetch(`${getBaseUrl()}/api/stock/${symbol}/peers`);
      if (res.ok) {
        const data = await res.json();
        setPeersData(Array.isArray(data) ? data : data.peers || null);
      }
    } catch {}
  }, []);

  const fetchStockNews = useCallback(async (symbol: string) => {
    try {
      const res = await fetch(`${getBaseUrl()}/api/stock/${symbol}/news`);
      if (res.ok) setStockNews(await res.json());
    } catch {}
  }, []);

  const fetchHistory = useCallback(async (symbol: string, periodObj: PeriodOption) => {
    setBgLoading(true);
    try {
      const res = await fetch(`${getBaseUrl()}/api/stock/${symbol}/history?period=${periodObj.value}&interval=${periodObj.interval}`);
      if (res.ok) setHistory(await res.json());
    } catch {}
    setBgLoading(false);
  }, []);

  const getSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) { setSuggestions([]); return; }
    try {
      const res = await fetch(`${getBaseUrl()}/api/search/suggestions?query=${q}`);
      if (res.ok) setSuggestions(await res.json());
    } catch {}
  }, []);

  // Debounced suggestions (300ms)
  const debouncedGetSuggestions = useCallback((q: string) => {
    if (suggestTimerRef.current) clearTimeout(suggestTimerRef.current);
    suggestTimerRef.current = setTimeout(() => getSuggestions(q), 300);
  }, [getSuggestions]);

  const bootstrapMarketData = useCallback(async () => {
    try {
      const res = await fetch(`${getBaseUrl()}/api/market/bootstrap`);
      if (res.ok) {
        const data = await res.json();
        setMarketIndices(data.indices || []);
        setSectorPerformance(data.sectors || []);
        setIsBackendLive(true);
      }
    } catch {
      setIsBackendLive(false);
    }
  }, []);

  const fetchMarketNews = useCallback(async () => {
    try {
      const res = await fetch(`${getBaseUrl()}/api/stock/NIFTY/news`);
      if (res.ok) setMarketNews({ articles: await res.json(), sentiment: 'Neutral' });
    } catch {}
  }, []);

  // ─── Effects ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isMounted) return;
    fetchStock(ticker);
  }, [isMounted, fetchStock]);

  useEffect(() => {
    if (!isMounted) return;
    fetchHistory(ticker, period);
  }, [ticker, period, isMounted, fetchHistory]);

  useEffect(() => {
    bootstrapMarketData();
    fetchMarketNews();

    const interval = setInterval(bootstrapMarketData, 30000);
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
      if (suggestTimerRef.current) clearTimeout(suggestTimerRef.current);
    };
  }, [bootstrapMarketData, fetchMarketNews]);

  // ─── Watchlist / Portfolio / Alert Handlers ────────────────────────────
  const toggleWatchlist = useCallback((e: React.MouseEvent, symbol: string) => {
    e.stopPropagation();
    setWatchlist(prev => {
      const newList = prev.includes(symbol) ? prev.filter(s => s !== symbol) : [...prev, symbol];
      syncWithBackend({ watchlist: newList });
      return newList;
    });
  }, [syncWithBackend]);

  const addToPortfolio = useCallback((symbol: string, price: number) => {
    setModal({ type: 'portfolio', symbol, price });
    setModalValue('1');
    setModalBuyPrice(price.toFixed(2));
    setModalDate(new Date().toISOString().split('T')[0]);
  }, []);

  const addAlert = useCallback((symbol: string, currentPrice: number) => {
    setModal({ type: 'alert', symbol, price: currentPrice });
    setModalValue('');
  }, []);

  const handleModalSubmit = useCallback(() => {
    if (!modal) return;
    if (modal.type === 'portfolio') {
      const units = Number(modalValue);
      const buyPrice = Number(modalBuyPrice);
      if (modalValue && !isNaN(units) && units > 0 && buyPrice > 0) {
        const newItem: PortfolioItem = { symbol: modal.symbol, avgPrice: buyPrice, units, date: modalDate ? new Date(modalDate).toISOString() : new Date().toISOString() };
        setPortfolio(prev => {
          const newList = [...prev, newItem];
          syncWithBackend({ portfolio: newList });
          return newList;
        });
      }
    } else {
      const target = Number(modalValue);
      if (modalValue && !isNaN(target) && target > 0) {
        const newItem: AlertItem = { symbol: modal.symbol, price: target, type: target > modal.price ? 'ABOVE' : 'BELOW' };
        setAlerts(prev => {
          const newList = [...prev, newItem];
          syncWithBackend({ alerts: newList });
          return newList;
        });
      }
    }
    setModal(null);
    setModalValue('');
    setModalBuyPrice('');
    setModalDate('');
  }, [modal, modalValue, modalBuyPrice, modalDate, syncWithBackend]);

  const fetchPortfolioPrices = useCallback(async (items: PortfolioItem[]) => {
    const unique = [...new Set(items.map(i => i.symbol))];
    const prices: Record<string, number> = {};
    await Promise.all(
      unique.map(async (sym) => {
        try {
          const res = await fetch(`${getBaseUrl()}/api/stock/${sym}`);
          if (res.ok) {
            const data = await res.json();
            prices[sym] = data.price;
          }
        } catch {}
      })
    );
    setPortfolioPrices(prices);
  }, []);

  const portfolioSummary = useMemo(() => {
    const invested = portfolio.reduce((acc, curr) => acc + curr.units * curr.avgPrice, 0);
    const current = portfolio.reduce((acc, curr) => {
      const livePrice = portfolioPrices[curr.symbol] ?? curr.avgPrice;
      return acc + curr.units * livePrice;
    }, 0);
    const pnl = current - invested;
    const pnlPct = invested > 0 ? (pnl / invested) * 100 : 0;
    return { invested, current, pnl, pnlPct };
  }, [portfolio, portfolioPrices]);

  useEffect(() => {
    if (portfolio.length > 0) fetchPortfolioPrices(portfolio);
  }, [portfolio, fetchPortfolioPrices]);

  // Market status
  const marketStatus = useMemo(() => getMarketStatus(), []);

  // Find key indices for Quick Stats Bar
  const nifty = marketIndices.find(i => i.symbol === '^NSEI' || i.symbol?.includes('NSEI') || i.name === 'Nifty 50');
  const sensex = marketIndices.find(i => i.symbol === '^BSESN' || i.symbol?.includes('BSESN') || i.name === 'Sensex');
  const bankNifty = marketIndices.find(i => i.symbol === '^NSEBANK' || i.symbol?.includes('NSEBANK') || i.name === 'Bank Nifty');

  if (!isMounted) return null;

  return (
    <div className="dark">
      <div className="min-h-screen relative overflow-hidden bg-[#050505] text-slate-100 font-sans transition-colors duration-1000">

        {/* Immersive Ambient Lighting */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          {/* Dot grid overlay */}
          <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: 'radial-gradient(circle, #F59E0B 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
          {/* Ambient glow orbs */}
          <div className="absolute top-[-10%] left-[10%] w-[50%] h-[50%] bg-amber-500/8 rounded-full blur-[180px] animate-pulse" />
          <div className="absolute top-[20%] right-[-10%] w-[60%] h-[60%] bg-yellow-500/6 rounded-full blur-[200px]" />
          <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-t from-amber-500/4 to-transparent" />
          {/* Fine grid lines */}
          <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(#F59E0B 1px, transparent 1px), linear-gradient(90deg, #F59E0B 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
        </div>

        {!isBackendLive && (
          <div className="bg-slate-900/90 border-b border-amber-500/20 text-amber-400 text-[10px] font-black py-1.5 text-center uppercase tracking-[0.3em] relative z-[100] backdrop-blur-sm">
            <span className="inline-block w-1.5 h-1.5 bg-amber-400 rounded-full mr-2 animate-pulse" />
            Market data offline — GyanHub, Calculators & Quiz fully available
            <span className="inline-block w-1.5 h-1.5 bg-amber-400 rounded-full ml-2 animate-pulse" />
          </div>
        )}

        {/* Navbar */}
        <nav className="sticky top-0 z-50 bg-black/60 backdrop-blur-3xl border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
            <div className="flex items-center gap-10">
              <Link href="/" className="flex items-center gap-3 group cursor-pointer">
                <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center text-black font-black text-xl shadow-lg shadow-yellow-500/20 group-hover:rotate-6 transition-transform">G</div>
                <span className="font-black text-xl tracking-tighter uppercase hidden md:block text-white">GallaGyan</span>
              </Link>
              <Link href="/gyanhub" className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-yellow-500 transition-colors">
                <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                GyanHub
              </Link>
              <Link href="/portfolio" className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-yellow-500 transition-colors">
                <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                Portfolio
              </Link>
              {/* Desktop Market Indices */}
              <div className="hidden lg:flex items-center gap-8">
                {marketIndices.map(idx => (
                  <div key={idx.symbol} className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{idx.name || idx.symbol}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold tabular-nums text-white">₹{idx.price?.toLocaleString('en-IN')}</span>
                      <span className={`text-[10px] font-black ${idx.percent_change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {idx.percent_change >= 0 ? '↑' : '↓'} {Math.abs(idx.percent_change).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              {/* Mobile Market Indices Marquee */}
              {marketIndices.length > 0 && (
                <div className="lg:hidden flex overflow-x-auto gap-6 scrollbar-hide max-w-[200px] md:max-w-xs">
                  {marketIndices.map(idx => (
                    <div key={idx.symbol} className="flex-shrink-0 flex items-center gap-2">
                      <span className="text-[9px] font-black text-slate-500 uppercase">{idx.name || idx.symbol}</span>
                      <span className={`text-[9px] font-black ${idx.percent_change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {idx.percent_change >= 0 ? '+' : ''}{idx.percent_change?.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1 max-w-md mx-8 relative" ref={searchRef}>
              <form onSubmit={(e) => { e.preventDefault(); fetchStock(ticker); setShowSuggestions(false); }} className="relative group">
                <input
                  type="text"
                  value={ticker}
                  onChange={(e) => { setTicker(e.target.value.toUpperCase()); debouncedGetSuggestions(e.target.value); setShowSuggestions(true); }}
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
                    {suggestions.map((s: SuggestionItem) => (
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

        {/* Quick Stats Bar */}
        <div className="sticky top-20 z-40 bg-black/60 backdrop-blur-xl border-b border-white/[0.06]" style={{ boxShadow: '0 1px 0 rgba(245,158,11,0.06)' }}>
          <div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-between gap-6 overflow-x-auto scrollbar-hide">
            {nifty && (
              <div className="flex items-center gap-3 flex-shrink-0 group">
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">NIFTY 50</span>
                <span className="text-sm font-black tabular-nums text-white tracking-tighter">₹{nifty.price?.toLocaleString('en-IN')}</span>
                <span className={cn(
                  "text-[10px] font-black flex items-center gap-0.5 px-2 py-0.5 rounded-md",
                  nifty.percent_change >= 0
                    ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                    : 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                )}>
                  {nifty.percent_change >= 0 ? '▲' : '▼'} {Math.abs(nifty.percent_change).toFixed(2)}%
                </span>
              </div>
            )}
            {sensex && (
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">SENSEX</span>
                <span className="text-sm font-black tabular-nums text-white tracking-tighter">₹{sensex.price?.toLocaleString('en-IN')}</span>
                <span className={cn(
                  "text-[10px] font-black flex items-center gap-0.5 px-2 py-0.5 rounded-md",
                  sensex.percent_change >= 0
                    ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                    : 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                )}>
                  {sensex.percent_change >= 0 ? '▲' : '▼'} {Math.abs(sensex.percent_change).toFixed(2)}%
                </span>
              </div>
            )}
            {bankNifty && (
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">BANK NIFTY</span>
                <span className="text-sm font-black tabular-nums text-white tracking-tighter">₹{bankNifty.price?.toLocaleString('en-IN')}</span>
                <span className={cn(
                  "text-[10px] font-black flex items-center gap-0.5 px-2 py-0.5 rounded-md",
                  bankNifty.percent_change >= 0
                    ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                    : 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                )}>
                  {bankNifty.percent_change >= 0 ? '▲' : '▼'} {Math.abs(bankNifty.percent_change).toFixed(2)}%
                </span>
              </div>
            )}
            <div className="flex-1 hidden sm:block" />
            <div className="flex items-center gap-2 flex-shrink-0 pl-4 border-l border-white/[0.06]">
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">USD/INR</span>
              <span className="text-xs font-black tabular-nums text-slate-300">₹83.50</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 pl-4 border-l border-white/[0.06]">
              <div className={cn("w-1.5 h-1.5 rounded-full", marketStatus.isOpen ? 'bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.8)]' : 'bg-slate-600')} />
              <span className={cn("text-[9px] font-black uppercase tracking-widest", marketStatus.isOpen ? 'text-emerald-400' : 'text-slate-600')}>
                {marketStatus.label}
              </span>
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
          <div className="lg:col-span-8 space-y-8">
            {loading && !stock ? (
              <StockCardSkeleton />
            ) : stockError && !stock ? (
              <StockErrorCard onRetry={() => fetchStock(ticker)} />
            ) : stock ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                {/* Hero Asset Card */}
                <div className="bg-white/[0.02] backdrop-blur-2xl rounded-[3rem] p-8 md:p-12 border border-white/10 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.7)] relative overflow-hidden">
                  {/* Directional gradient glow — green when up, red when down */}
                  <div
                    className="absolute inset-0 pointer-events-none transition-all duration-1000"
                    style={{
                      background: stock.percent_change >= 0
                        ? 'radial-gradient(ellipse 80% 60% at 80% 0%, rgba(16,185,129,0.10) 0%, transparent 70%)'
                        : 'radial-gradient(ellipse 80% 60% at 80% 0%, rgba(244,63,94,0.10) 0%, transparent 70%)'
                    }}
                  />
                  {/* Subtle animated shine */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

                  <div className="relative z-10">
                    {/* Top row — exchange badge, watchlist, LIVE badge */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <span className="bg-white/10 border border-white/10 text-slate-300 text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest">{stock.symbol.split('.')[1] || 'NSE'}</span>
                        <button onClick={(e) => toggleWatchlist(e, stock.symbol.split('.')[0])} className={cn(
                          "p-2 rounded-xl border transition-all flex items-center justify-center w-9 h-9 text-sm",
                          watchlist.includes(stock.symbol.split('.')[0])
                            ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-500 shadow-[0_0_20px_rgba(251,191,36,0.25)]'
                            : 'bg-white/5 border-white/10 text-slate-500 hover:text-yellow-500 hover:border-yellow-500/30'
                        )}>
                          {watchlist.includes(stock.symbol.split('.')[0]) ? '★' : '☆'}
                        </button>
                      </div>
                      {/* LIVE badge */}
                      <div className="flex items-center gap-2 bg-black/50 border border-white/10 px-3 py-1.5 rounded-xl">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                        </span>
                        <span className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.25em]">Live</span>
                      </div>
                    </div>

                    {/* Stock name */}
                    <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white leading-none mb-2">{stock.name}</h1>
                    <p className="text-slate-600 font-black mb-8 uppercase tracking-[0.25em] text-[10px] flex items-center gap-2">
                      <span className="text-amber-500/70">//</span> {stock.symbol}
                    </p>

                    {/* Price row — massive */}
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                      <div>
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">Last Traded Price</p>
                        <div className="flex items-baseline gap-3">
                          <span className="text-5xl md:text-7xl font-black tabular-nums tracking-tighter text-white leading-none" style={{ fontVariantNumeric: 'tabular-nums' }}>
                            ₹{stock.price?.toLocaleString('en-IN')}
                          </span>
                          <span className="text-base font-black text-slate-600 uppercase tracking-widest pb-1">INR</span>
                        </div>
                      </div>

                      {/* Change pill */}
                      <div className={cn(
                        "flex flex-col items-start md:items-end gap-1 px-5 py-4 rounded-2xl border",
                        stock.percent_change >= 0
                          ? 'bg-emerald-500/10 border-emerald-500/30'
                          : 'bg-rose-500/10 border-rose-500/30'
                      )}>
                        <p className={cn(
                          "text-3xl font-black tracking-tighter flex items-center gap-2",
                          stock.percent_change >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        )}>
                          {stock.percent_change >= 0 ? '▲' : '▼'} {Math.abs(stock.percent_change).toFixed(2)}%
                        </p>
                        <p className={cn("text-sm font-bold", stock.percent_change >= 0 ? 'text-emerald-500/70' : 'text-rose-500/70')}>
                          {stock.change >= 0 ? '+' : ''}₹{stock.change?.toFixed(2)} today
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 flex flex-wrap gap-3 relative z-10">
                    <button onClick={() => addToPortfolio(stock.symbol.split('.')[0], stock.price)} className="bg-yellow-500 text-black px-8 py-4 rounded-[1.5rem] text-sm font-black uppercase tracking-[0.2em] hover:bg-yellow-400 hover:shadow-[0_8px_32px_rgba(245,158,11,0.4)] active:scale-95 transition-all flex items-center gap-2">
                      Add to Portfolio <ChevronRight size={16} strokeWidth={3} />
                    </button>
                    <button onClick={() => addAlert(stock.symbol.split('.')[0], stock.price)} className="bg-white/5 border border-white/10 text-slate-300 px-8 py-4 rounded-[1.5rem] text-sm font-black uppercase tracking-[0.2em] hover:bg-white/[0.08] hover:border-yellow-500/30 hover:text-white active:scale-95 transition-all flex items-center gap-2">
                      <Zap size={16} className="text-yellow-500" /> Deploy Alert
                    </button>
                  </div>
                </div>

                {/* Chart */}
                <div className="bg-white/[0.02] backdrop-blur-2xl rounded-[3rem] p-4 md:p-8 border border-white/10 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent pointer-events-none" />
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-6 px-4">
                    {/* Period Selector */}
                    <div className="flex gap-1 p-1 bg-black/60 rounded-2xl border border-white/[0.06]">
                      {PERIODS.map(p => (
                        <button key={p.label} onClick={() => setPeriod(p)} className={cn(
                          "px-4 py-2 rounded-xl text-xs font-black transition-all",
                          period.label === p.label
                            ? 'bg-yellow-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                            : 'text-slate-500 hover:text-white hover:bg-white/5'
                        )}>{p.label}</button>
                      ))}
                    </div>
                    {/* Indicator Toggles */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowSMA20(v => !v)}
                        className={cn("px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                          showSMA20 ? 'bg-blue-500/20 text-blue-400 border-blue-500/40' : 'bg-white/5 text-slate-500 border-white/10 hover:border-white/20')}
                      >SMA 20</button>
                      <button
                        onClick={() => setShowVolume(v => !v)}
                        className={cn("px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                          showVolume ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-white/5 text-slate-500 border-white/10 hover:border-white/20')}
                      >VOL</button>
                      {bgLoading && <div className="w-4 h-4 border-2 border-white/10 border-t-yellow-500 rounded-full animate-spin" />}
                    </div>
                  </div>
                  <div className="h-[420px] w-full">
                    <StockChart data={history} isDark={true} showSMA20={showSMA20} showVolume={showVolume} />
                  </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard label="Market Cap" value={stock.market_cap ? (stock.market_cap / 10000000).toLocaleString('en-IN') + ' Cr' : '-'} />
                  <StatCard label="P/E Ratio" value={stock.pe_ratio?.toFixed(2) || '-'} />
                  <StatCard label="52W High" value={stock.fiftyTwoWeekHigh} isCurrency />
                  <StatCard label="52W Low" value={stock.fiftyTwoWeekLow} isCurrency />
                </div>

                {/* Peers Comparison */}
                {peersData && Array.isArray(peersData) && peersData.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between px-2 mb-4">
                      <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                        <span className="w-1 h-4 bg-amber-500 rounded-full" />
                        Peers Comparison
                      </h3>
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{peersData.length} peers</span>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                      {peersData.map((peer: PeerStock) => (
                        <button
                          key={peer.symbol}
                          onClick={() => fetchStock(peer.symbol)}
                          className="flex-shrink-0 bg-white/[0.02] backdrop-blur-xl p-5 rounded-[2rem] border border-white/5 shadow-sm hover:border-yellow-500/30 transition-all group hover:bg-white/[0.04] min-w-[160px]"
                        >
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 truncate">{peer.name || peer.symbol}</p>
                          <p className="text-sm font-bold text-white group-hover:text-yellow-500 transition-colors">
                            {peer.price ? `₹${peer.price.toLocaleString('en-IN')}` : '-'}
                          </p>
                          <div className="flex items-center justify-between mt-1 gap-2">
                            <span className={cn("text-[10px] font-black", (peer.percent_change ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
                              {(peer.percent_change ?? 0) >= 0 ? '+' : ''}{(peer.percent_change ?? 0).toFixed(2)}%
                            </span>
                            {peer.pe_ratio != null && (
                              <span className="text-[9px] font-bold text-slate-600">PE: {peer.pe_ratio.toFixed(1)}</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {/* Stock-specific News */}
                {stockNews.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between px-2 mb-4">
                      <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                        <span className="w-1 h-4 bg-amber-500 rounded-full" />
                        {ticker} News Feed
                      </h3>
                      <span className="text-[9px] font-black text-amber-500/70 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 uppercase tracking-widest">{stockNews.length} articles</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {stockNews.slice(0, 4).map((item, idx) => <NewsCard key={idx} item={item} />)}
                    </div>
                  </div>
                )}
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
                    {sectorData.map((s: SectorItem) => (
                      <motion.button variants={itemVariants} whileHover={{ scale: 1.03, y: -4 }} whileTap={{ scale: 0.98 }} key={s.symbol} onClick={() => fetchStock(s.symbol)} className="bg-white/[0.02] backdrop-blur-xl p-5 rounded-[2rem] border border-white/5 shadow-sm text-left hover:border-yellow-500/30 transition-all group hover:bg-white/[0.04]">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 leading-tight">{s.name}</p>
                        <p className="text-sm font-bold text-white group-hover:text-yellow-500 transition-colors">₹{s.price?.toLocaleString('en-IN')}</p>
                        <p className={cn("text-[10px] font-black mt-1", s.percent_change >= 0 ? 'text-emerald-400' : 'text-rose-400')}>{s.percent_change >= 0 ? '+' : ''}{s.percent_change?.toFixed(2)}%</p>
                      </motion.button>
                    ))}
                  </motion.div>
                </div>

                <div>
                  <div className="flex items-center justify-between px-2 mb-6">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Global Feed</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(marketNews?.articles || []).map((item: NewsArticle, idx: number) => (<NewsCard key={idx} item={item} />))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Portfolio / Personal Vault */}
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
                  portfolio.map((item, i) => {
                    const livePrice = portfolioPrices[item.symbol];
                    const itemPnl = livePrice ? (livePrice - item.avgPrice) * item.units : 0;
                    const itemPnlPct = livePrice ? ((livePrice - item.avgPrice) / item.avgPrice) * 100 : 0;
                    return (
                      <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-yellow-500/30 transition-all cursor-pointer group" onClick={() => fetchStock(item.symbol)}>
                        <div>
                          <p className="text-sm font-bold text-white group-hover:text-yellow-500 transition-colors">{item.symbol}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{item.units} Units @ ₹{item.avgPrice}</p>
                        </div>
                        <div className="text-right bg-black/40 px-3 py-2 rounded-xl border border-white/5">
                          <p className="text-xs font-black text-white">₹{(item.units * (livePrice || item.avgPrice)).toLocaleString('en-IN')}</p>
                          {livePrice && (
                            <p className={cn("text-[10px] font-black", itemPnl >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
                              {itemPnl >= 0 ? '+' : ''}₹{Math.abs(itemPnl).toFixed(0)} ({itemPnlPct.toFixed(1)}%)
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            {/* Sector Heatmap */}
            {sectorData.length > 0 && stock && (
              <section className="bg-white/[0.02] backdrop-blur-2xl rounded-[2.5rem] p-8 border border-white/10 shadow-sm">
                <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.25em] mb-6">Sector Heatmap</h3>
                <div className="grid grid-cols-3 gap-2">
                  {sectorData.map((s: SectorItem) => {
                    const intensity = Math.min(Math.abs(s.percent_change) * 10, 100);
                    const isPositive = s.percent_change >= 0;
                    return (
                      <button
                        key={s.symbol}
                        onClick={() => fetchStock(s.symbol)}
                        className={cn(
                          "p-3 rounded-xl text-center transition-all hover:scale-105 border",
                          isPositive
                            ? 'border-emerald-500/20 hover:border-emerald-500/40'
                            : 'border-rose-500/20 hover:border-rose-500/40'
                        )}
                        style={{
                          backgroundColor: isPositive
                            ? `rgba(16, 185, 129, ${intensity / 500})`
                            : `rgba(244, 63, 94, ${intensity / 500})`
                        }}
                      >
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">{s.name}</p>
                        <p className={cn("text-xs font-black mt-1", isPositive ? 'text-emerald-400' : 'text-rose-400')}>
                          {isPositive ? '+' : ''}{s.percent_change?.toFixed(2)}%
                        </p>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Quick Launch */}
            <section className="bg-white/[0.02] backdrop-blur-2xl rounded-[2.5rem] p-8 border border-white/10 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-1 h-4 bg-amber-500 rounded-full" />
                <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em]">Quick Launch</h3>
              </div>
              <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-2">
                {QUICK_STOCKS.map((s, i) => (
                  <motion.button
                    variants={itemVariants}
                    whileHover={{ x: 4 }}
                    key={s}
                    onClick={() => { setTicker(s); fetchStock(s); }}
                    className={cn(
                      "w-full px-4 py-3.5 rounded-2xl text-sm font-bold transition-all text-left border flex justify-between items-center group",
                      ticker === s
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                        : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/5 hover:border-yellow-500/30 text-slate-400 hover:text-white'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] font-black text-slate-600 w-4">{i + 1}</span>
                      <span className={ticker === s ? 'text-amber-400' : 'group-hover:text-white transition-colors'}>{s}</span>
                    </div>
                    <ChevronRight size={12} className={ticker === s ? 'text-amber-500' : 'text-slate-600 group-hover:text-yellow-500 transition-colors'} />
                  </motion.button>
                ))}
              </motion.div>
            </section>

            {/* Watchlist */}
            <section className="bg-white/[0.02] backdrop-blur-2xl rounded-[2.5rem] p-8 border border-white/10 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-1 h-4 bg-amber-500 rounded-full" />
                <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em]">Watchlist</h3>
              </div>
              {watchlist.length === 0 ? (
                <div className="py-6 text-center border border-dashed border-white/10 rounded-2xl">
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">No assets tracked</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {watchlist.map(s => (
                    <div key={s} className="flex justify-between items-center bg-white/[0.03] hover:bg-white/[0.07] p-4 rounded-2xl border border-white/5 hover:border-yellow-500/20 transition-all group">
                      <button onClick={() => { setTicker(s); fetchStock(s); }} className="text-slate-300 group-hover:text-yellow-400 font-bold text-sm flex-1 text-left transition-colors">{s}</button>
                      <button onClick={(e) => toggleWatchlist(e, s)} className="text-slate-600 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100 bg-rose-500/10 p-1.5 rounded-lg border border-rose-500/20">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Alerts Panel */}
            {alerts.length > 0 && (
              <section className="bg-white/[0.02] backdrop-blur-2xl rounded-[2.5rem] p-8 border border-white/10 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <span className="w-1 h-4 bg-amber-500 rounded-full animate-pulse" />
                  <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em]">Active Alerts</h3>
                  <span className="ml-auto text-[9px] font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">{alerts.length}</span>
                </div>
                <div className="space-y-2">
                  {alerts.map((alert, i) => (
                    <div key={i} className={cn(
                      "flex justify-between items-center p-3.5 rounded-2xl border text-xs font-bold",
                      alert.type === 'ABOVE' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'
                    )}>
                      <div>
                        <span className="text-white">{alert.symbol}</span>
                        <span className={cn("ml-2 text-[9px] uppercase tracking-widest", alert.type === 'ABOVE' ? 'text-emerald-400' : 'text-rose-400')}>
                          {alert.type === 'ABOVE' ? '▲ above' : '▼ below'}
                        </span>
                      </div>
                      <span className={alert.type === 'ABOVE' ? 'text-emerald-400' : 'text-rose-400'}>₹{alert.price.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
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
                {modal.symbol} &mdash; Market: ₹{modal.price.toLocaleString('en-IN')}
              </p>

              {modal.type === 'portfolio' ? (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Quantity</label>
                    <input
                      autoFocus
                      type="number"
                      min="1"
                      step="1"
                      value={modalValue}
                      onChange={(e) => setModalValue(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Escape') setModal(null); }}
                      placeholder="e.g. 10"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-5 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-yellow-500/40"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Buy Price per Share (₹)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-black text-sm">₹</span>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={modalBuyPrice}
                        onChange={(e) => setModalBuyPrice(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Escape') setModal(null); }}
                        placeholder={modal.price.toFixed(2)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-9 pr-5 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-yellow-500/40"
                      />
                    </div>
                    <p className="text-[10px] text-slate-600 mt-1.5 font-medium">Market value: ₹{modal.price.toLocaleString('en-IN')} &nbsp;·&nbsp; Edit if you bought at a different price</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Purchase Date</label>
                    <input
                      type="date"
                      value={modalDate}
                      max={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setModalDate(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-5 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-yellow-500/40 [color-scheme:dark]"
                    />
                  </div>
                  {modalValue && modalBuyPrice && (
                    <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl px-5 py-3 flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Invested</span>
                      <span className="text-sm font-black text-yellow-400">₹{(Number(modalValue) * Number(modalBuyPrice)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mb-6">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Target Price (₹)</label>
                  <input
                    autoFocus
                    type="number"
                    min="0"
                    step="0.01"
                    value={modalValue}
                    onChange={(e) => setModalValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleModalSubmit(); if (e.key === 'Escape') setModal(null); }}
                    placeholder={`e.g. ${modal.price}`}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-5 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-yellow-500/40"
                  />
                </div>
              )}

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
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
