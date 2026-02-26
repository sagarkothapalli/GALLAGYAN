'use client';

import { useState, useEffect } from 'react';

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  percent_change: number;
  volume: number;
  market_cap: number;
}

interface NewsItem {
  title: string;
  publisher: string;
  link: string;
  providerPublishTime: number;
}

export default function LiteHome() {
  const [ticker, setTicker] = useState('');
  const [stock, setStock] = useState<StockData | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchStock = async (symbol: string) => {
    if (!symbol) return;
    setLoading(true);
    setError('');
    try {
      const cleanSymbol = symbol.trim().toUpperCase();
      const [stockRes, newsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/stock/${cleanSymbol}`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/stock/${cleanSymbol}/news`)
      ]);

      if (!stockRes.ok) throw new Error('Stock not found');
      setStock(await stockRes.json());
      setNews(newsRes.ok ? await newsRes.json() : []);
    } catch (err: any) {
      setError(err.message);
      setStock(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 font-mono">
      <header className="border-b border-white/20 pb-4 mb-6">
        <h1 className="text-xl font-bold">GALLAGYAN <span className="text-xs bg-white text-black px-1 ml-1">LITE</span></h1>
        <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">Fast / Minimal / Data-Saving</p>
      </header>

      <form onSubmit={(e) => { e.preventDefault(); fetchStock(ticker); }} className="flex gap-2 mb-8">
        <input
          type="text"
          value={ticker}
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
          placeholder="SYMBOL (e.g. TCS)"
          className="flex-1 bg-transparent border border-white/30 px-3 py-2 text-sm focus:outline-none focus:border-white"
        />
        <button type="submit" disabled={loading} className="bg-white text-black px-4 py-2 text-xs font-bold uppercase disabled:opacity-50">
          {loading ? '...' : 'Get'}
        </button>
      </form>

      {error && <p className="text-red-500 text-xs mb-4">Error: {error}</p>}

      {stock && (
        <div className="space-y-6">
          <section className="border border-white/20 p-4">
            <h2 className="text-lg font-bold">{stock.name}</h2>
            <p className="text-2xl mt-2">₹{stock.price.toLocaleString('en-IN')}</p>
            <p className={`text-sm mt-1 ${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.percent_change.toFixed(2)}%)
            </p>
            <div className="grid grid-cols-2 gap-4 mt-6 text-[10px] uppercase text-gray-500">
              <div>
                <p>Volume</p>
                <p className="text-white font-bold">{stock.volume.toLocaleString()}</p>
              </div>
              <div>
                <p>Market Cap</p>
                <p className="text-white font-bold">₹{(stock.market_cap / 10000000).toFixed(0)} Cr</p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-xs font-bold uppercase border-b border-white/10 pb-1">Latest News</h3>
            {news.slice(0, 5).map((item, idx) => (
              <a key={idx} href={item.link} target="_blank" rel="noopener noreferrer" className="block group">
                <p className="text-[10px] text-gray-500 uppercase">{item.publisher}</p>
                <h4 className="text-xs font-bold group-hover:underline mt-1 leading-relaxed">{item.title}</h4>
              </a>
            ))}
          </section>
        </div>
      )}

      {!stock && !loading && (
        <div className="py-20 text-center opacity-30">
          <p className="text-xs italic">[SEARCH TO START]</p>
        </div>
      )}

      <footer className="mt-20 pt-8 border-t border-white/10 text-[9px] text-gray-600 flex justify-between">
        <a href="/" className="hover:text-white underline">Back to Main</a>
        <span>© 2026 GALLAGYAN</span>
      </footer>
    </div>
  );
}
