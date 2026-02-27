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

@app.get("/api/health")
async def health_check(request: Request):
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "cache_size": {
            "stocks": len(stock_cache),
            "news": len(news_cache)
        }
    }

@app.get("/api/stock/{ticker}/news")
@limiter.limit("30/minute")
async def get_stock_news(request: Request, ticker: str):
    ticker = ticker.upper().strip()
    if ticker in news_cache:
        return news_cache[ticker]
        
    try:
        # Use a more descriptive query for better results
        query = f"{ticker} stock price news India"
        url = f"https://news.google.com/rss/search?q={query}&hl=en-IN&gl=IN&ceid=IN:en"
        
        async with httpx.AsyncClient(headers={'User-Agent': get_random_ua()}, follow_redirects=True) as client:
            res = await client.get(url, timeout=10)
            if res.status_code != 200:
                return [] # Return empty if blocked
            
        root = ET.fromstring(res.content)
        items = []
        for item in root.findall('.//item')[:10]:
            source = item.find('source')
            items.append({
                "title": item.find('title').text, 
                "publisher": source.text if source is not None else "Financial News", 
                "link": item.find('link').text, 
                "providerPublishTime": int(time.time()), 
                "thumbnail": None
            })
            
        if items:
            news_cache[ticker] = items
        return items
    except Exception as e:
        print(f"News error for {ticker}: {e}")
        return []

@app.get("/api/market/news")
@limiter.limit("30/minute")
async def get_market_news(request: Request):
    return await get_stock_news(request, "Indian stock market")

@app.get("/api/market/indices")
@limiter.limit("30/minute")
async def get_indices(request: Request):
    indices = ["^NSEI", "^BSESN"]
    results = []
    for idx in indices:
        t = Ticker(idx)
        p = t.price.get(idx, {})
        if p:
            results.append({
                "symbol": "NIFTY 50" if idx == "^NSEI" else "SENSEX",
                "price": p.get("regularMarketPrice"),
                "change": round(p.get("regularMarketChange", 0), 2),
                "percent_change": round(p.get("regularMarketChangePercent", 0) * 100, 2)
            })
    return results

@app.get("/api/search/suggestions")
@limiter.limit("120/minute")
async def get_suggestions(request: Request, query: str = ""):
    if not query or len(query) < 2:
        return []
        
    try:
        search_results = search(query)
        results = []
        seen_symbols = set()
        
        if 'quotes' in search_results:
            for quote in search_results['quotes']:
                symbol = quote.get('symbol', '')
                clean_symbol = symbol.replace('.NS', '').replace('.BO', '')
                
                if clean_symbol in seen_symbols:
                    continue
                
                if symbol.endswith('.NS') or symbol.endswith('.BO'):
                    results.append({
                        "symbol": clean_symbol,
                        "name": quote.get('longname') or quote.get('shortname') or symbol,
                        "exchange": "NSE" if symbol.endswith('.NS') else "BSE"
                    })
                    seen_symbols.add(clean_symbol)
        
        return results[:10]
    except Exception as e:
        print(f"Search error: {e}")
        return []

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
