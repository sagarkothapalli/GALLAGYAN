from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from yahooquery import Ticker, search
import httpx
import xml.etree.ElementTree as ET
from datetime import datetime
import time
import random
from cachetools import TTLCache
import asyncio
from typing import List, Optional
import os

limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="GallaGyan API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Secure CORS Configuration
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://gallagyan.xyz",
    "https://www.gallagyan.xyz",
    "https://gallagyan.vercel.app"
]

env_origins = os.getenv("ALLOWED_ORIGINS")
if env_origins:
    ALLOWED_ORIGINS.extend(env_origins.split(","))

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET", "OPTIONS"],
    allow_headers=["*"],
    allow_credentials=True,
)

# Caches
stock_cache = TTLCache(maxsize=1000, ttl=60)
history_cache = TTLCache(maxsize=1000, ttl=3600)
news_cache = TTLCache(maxsize=1000, ttl=600)

USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
]

def get_random_ua():
    return random.choice(USER_AGENTS)

@app.get("/")
@limiter.limit("10/minute")
async def read_root(request: Request):
    return {"message": "GallaGyan API is active", "status": "secure"}

async def fetch_stock_data(ticker_symbol: str):
    if ticker_symbol in stock_cache:
        return stock_cache[ticker_symbol]

    symbols_to_try = []
    if "." not in ticker_symbol:
        symbols_to_try = [f"{ticker_symbol}.NS", f"{ticker_symbol}.BO"]
    else:
        symbols_to_try = [ticker_symbol]

    for sym in symbols_to_try:
        t = Ticker(sym)
        price_data = t.price
        
        if isinstance(price_data, dict) and sym in price_data and isinstance(price_data[sym], dict):
            p = price_data[sym]
            summary = t.summary_detail.get(sym, {})
            
            if not p.get('regularMarketPrice'):
                continue
                
            res = {
                "symbol": sym,
                "name": p.get('longName') or p.get('shortName') or ticker_symbol,
                "price": p.get('regularMarketPrice'),
                "currency": p.get('currency', 'INR'),
                "change": round(p.get('regularMarketChange', 0), 2),
                "percent_change": round(p.get('regularMarketChangePercent', 0) * 100, 2),
                "high": p.get('regularMarketDayHigh'),
                "low": p.get('regularMarketDayLow'),
                "open": p.get('regularMarketOpen'),
                "volume": p.get('regularMarketVolume', 0),
                "market_cap": p.get('marketCap', 0),
                "pe_ratio": summary.get('trailingPE'),
                "fiftyTwoWeekHigh": summary.get('fiftyTwoWeekHigh'),
                "fiftyTwoWeekLow": summary.get('fiftyTwoWeekLow'),
                "dividendYield": summary.get('dividendYield', 0)
            }
            stock_cache[ticker_symbol] = res
            return res
            
    return None

@app.get("/api/stock/{ticker}")
@limiter.limit("60/minute")
async def get_stock(request: Request, ticker: str):
    ticker = ticker.upper().strip()
    data = await fetch_stock_data(ticker)
    if data:
        return data
    raise HTTPException(status_code=404, detail="Stock not found")

@app.get("/api/stock/{ticker}/history")
@limiter.limit("60/minute")
async def get_stock_history(request: Request, ticker: str, period: str = "1mo"):
    ticker = ticker.upper().strip()
    cache_key = f"{ticker}_history_{period}"
    
    if cache_key in history_cache:
        return history_cache[cache_key]

    sym = ticker if "." in ticker else f"{ticker}.NS"
    try:
        t = Ticker(sym)
        df = t.history(period=period, interval="1d")
        
        if df.empty and "." not in ticker:
            sym = f"{ticker}.BO"
            t = Ticker(sym)
            df = t.history(period=period, interval="1d")

        if df.empty:
            return []

        history = []
        if hasattr(df.index, 'levels'):
            for (symbol, date), row in df.iterrows():
                history.append({
                    "time": date.strftime('%Y-%m-%d'),
                    "open": round(row['open'], 2),
                    "high": round(row['high'], 2),
                    "low": round(row['low'], 2),
                    "close": round(row['close'], 2),
                })
        else:
            for date, row in df.iterrows():
                history.append({
                    "time": date.strftime('%Y-%m-%d'),
                    "open": round(row['open'], 2),
                    "high": round(row['high'], 2),
                    "low": round(row['low'], 2),
                    "close": round(row['close'], 2),
                })
        
        history_cache[cache_key] = history
        return history
    except:
        return []

@app.get("/api/stock/{ticker}/news")
@limiter.limit("30/minute")
async def get_stock_news(request: Request, ticker: str):
    ticker = ticker.upper().strip()
    if ticker in news_cache:
        return news_cache[ticker]
        
    try:
        query = f"{ticker} stock India"
        url = f"https://news.google.com/rss/search?q={query}&hl=en-IN&gl=IN&ceid=IN:en"
        
        async with httpx.AsyncClient(headers={'User-Agent': get_random_ua()}) as client:
            res = await client.get(url, timeout=10)
            
        root = ET.fromstring(res.content)
        items = []
        for item in root.findall('.//item')[:10]:
            items.append({
                "title": item.find('title').text, 
                "publisher": item.find('source').text if item.find('source') is not None else "News", 
                "link": item.find('link').text, 
                "providerPublishTime": int(time.time()), 
                "thumbnail": None
            })
            
        news_cache[ticker] = items
        return items
    except:
        return []

@app.get("/api/market/news")
@limiter.limit("30/minute")
async def get_market_news(request: Request):
    return await get_stock_news(request, "Indian stock market")

@app.get("/api/search/suggestions")
@limiter.limit("120/minute")
async def get_suggestions(request: Request, query: str = ""):
    if not query or len(query) < 2:
        return []
        
    try:
        # Real-time search using yahooquery
        search_results = search(query)
        results = []
        
        if 'quotes' in search_results:
            for quote in search_results['quotes']:
                symbol = quote.get('symbol', '')
                # Specifically target Indian stocks
                if symbol.endswith('.NS') or symbol.endswith('.BO'):
                    results.append({
                        "symbol": symbol.replace('.NS', '').replace('.BO', ''),
                        "name": quote.get('longname') or quote.get('shortname') or symbol
                    })
        
        # Fallback to general matches if no Indian stocks
        if not results and 'quotes' in search_results:
             for quote in search_results['quotes'][:5]:
                results.append({
                    "symbol": quote.get('symbol', ''),
                    "name": quote.get('longname') or quote.get('shortname') or quote.get('symbol')
                })

        return results[:10]
    except:
        return []

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
