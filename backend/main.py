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
@limiter.limit("10/minute")
async def health_check(request: Request):
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "cache_size": {"stocks": len(stock_cache), "news": len(news_cache)}
    }

@app.get("/api/market/indices")
@limiter.limit("30/minute")
async def get_indices(request: Request):
    indices = ["^NSEI", "^BSESN"]
    results = []
    for idx in indices:
        try:
            t = Ticker(idx)
            p = t.price.get(idx, {})
            if p:
                results.append({
                    "symbol": "NIFTY 50" if idx == "^NSEI" else "SENSEX",
                    "price": p.get("regularMarketPrice"),
                    "change": round(p.get("regularMarketChange", 0), 2),
                    "percent_change": round(p.get("regularMarketChangePercent", 0) * 100, 2)
                })
        except: continue
    return results

async def fetch_stock_data(ticker_symbol: str):
    if ticker_symbol in stock_cache:
        return stock_cache[ticker_symbol]

    symbols_to_try = [f"{ticker_symbol}.NS", f"{ticker_symbol}.BO"] if "." not in ticker_symbol else [ticker_symbol]

    for sym in symbols_to_try:
        try:
            t = Ticker(sym)
            price_data = t.price
            if isinstance(price_data, dict) and sym in price_data and isinstance(price_data[sym], dict):
                p = price_data[sym]
                summary = t.summary_detail.get(sym, {})
                if not p.get('regularMarketPrice'): continue
                    
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
        except: continue
    return None

@app.get("/api/stock/{ticker}")
@limiter.limit("60/minute")
async def get_stock(request: Request, ticker: str):
    data = await fetch_stock_data(ticker.upper().strip())
    if data: return data
    raise HTTPException(status_code=404, detail="Stock not found")

@app.get("/api/stock/{ticker}/history")
@limiter.limit("60/minute")
async def get_stock_history(request: Request, ticker: str, period: str = "1mo", interval: str = "1d"):
    ticker = ticker.upper().strip()
    cache_key = f"{ticker}_h_{period}_{interval}"
    if cache_key in history_cache: return history_cache[cache_key]

    sym = ticker if "." in ticker else f"{ticker}.NS"
    try:
        t = Ticker(sym)
        df = t.history(period=period, interval=interval)
        if (df is None or (hasattr(df, 'empty') and df.empty)) and "." not in ticker:
            sym = f"{ticker}.BO"
            t = Ticker(sym)
            df = t.history(period=period, interval=interval)

        if df is None or (hasattr(df, 'empty') and df.empty): return []

        history = []
        df = df.reset_index()
        for _, row in df.iterrows():
            date_val = row['date']
            time_str = date_val.strftime('%Y-%m-%d') if hasattr(date_val, 'strftime') else str(date_val)
            history.append({
                "time": time_str,
                "open": round(row['open'], 2),
                "high": round(row['high'], 2),
                "low": round(row['low'], 2),
                "close": round(row['close'], 2),
            })
        history_cache[cache_key] = history
        return history
    except: return []

def analyze_sentiment(title: str):
    bullish = ['buy', 'growth', 'profit', 'up', 'surge', 'high', 'positive', 'gain', 'expansion', 'dividend', 'acquisition', 'bull', 'jump']
    bearish = ['sell', 'loss', 'down', 'crash', 'scam', 'fraud', 'negative', 'fall', 'penalty', 'investigation', 'debt', 'cut', 'drop', 'miss']
    
    t = title.lower()
    score = 0
    for w in bullish:
        if w in t: score += 1
    for w in bearish:
        if w in t: score -= 1
        
    if score > 0: return "Bullish"
    if score < 0: return "Bearish"
    return "Neutral"

@app.get("/api/stock/{ticker}/profile")
@limiter.limit("20/minute")
async def get_profile(request: Request, ticker: str):
    ticker = ticker.upper().strip()
    sym = ticker if "." in ticker else f"{ticker}.NS"
    try:
        t = Ticker(sym)
        p = t.summary_profile.get(sym, {})
        return {
            "sector": p.get('sector'),
            "industry": p.get('industry'),
            "summary": p.get('longBusinessSummary'),
            "website": p.get('website'),
            "employees": p.get('fullTimeEmployees')
        }
    except:
        return {}

@app.get("/api/stock/{ticker}/news")
@limiter.limit("30/minute")
async def get_stock_news(request: Request, ticker: str):
    ticker = ticker.upper().strip()
    if ticker in news_cache: return news_cache[ticker]
        
    try:
        query = f"{ticker} stock price news India"
        url = f"https://news.google.com/rss/search?q={query}&hl=en-IN&gl=IN&ceid=IN:en"
        async with httpx.AsyncClient(headers={'User-Agent': get_random_ua()}, follow_redirects=True) as client:
            res = await client.get(url, timeout=10)
            if res.status_code != 200: return []
            
        root = ET.fromstring(res.content)
        items = []
        for item in root.findall('.//item')[:10]:
            source = item.find('source')
            title = item.find('title').text
            items.append({
                "title": title, 
                "publisher": source.text if source is not None else "Financial News", 
                "link": item.find('link').text, 
                "providerPublishTime": int(time.time()), 
                "sentiment": analyze_sentiment(title),
                "thumbnail": None
            })
        if items: news_cache[ticker] = items
        return items
    except: return []

@app.get("/api/market/news")
@limiter.limit("30/minute")
async def get_market_news(request: Request):
    return await get_stock_news(request, "Indian stock market")

@app.get("/api/stock/{ticker}/fundamentals")
@limiter.limit("20/minute")
async def get_fundamentals(request: Request, ticker: str):
    ticker = ticker.upper().strip()
    sym = ticker if "." in ticker else f"{ticker}.NS"
    try:
        t = Ticker(sym)
        # Fetch last 4 quarters of income statement
        is_stmt = t.income_statement(frequency="q")
        if is_stmt is None or (hasattr(is_stmt, 'empty') and is_stmt.empty):
            if "." not in ticker:
                sym = f"{ticker}.BO"
                t = Ticker(sym)
                is_stmt = t.income_statement(frequency="q")
        
        if is_stmt is None or (hasattr(is_stmt, 'empty') and is_stmt.empty):
            return []

        # Convert to a clean list of records
        df = is_stmt.reset_index()
        fundamentals = []
        for _, row in df.tail(4).iterrows():
            date_val = row['asOfDate']
            fundamentals.append({
                "date": date_val.strftime('%b %Y') if hasattr(date_val, 'strftime') else str(date_val),
                "revenue": row.get('TotalRevenue'),
                "net_income": row.get('NetIncome'),
                "ebitda": row.get('EBITDA'),
                "eps": row.get('BasicEPS')
            })
        return fundamentals
    except:
        return []

@app.get("/api/stock/{ticker}/actions")
@limiter.limit("20/minute")
async def get_actions(request: Request, ticker: str):
    ticker = ticker.upper().strip()
    sym = ticker if "." in ticker else f"{ticker}.NS"
    try:
        t = Ticker(sym)
        stats = t.key_stats.get(sym, {})
        
        # Simple dividend extraction from history if direct method is restricted
        divs = []
        try:
            div_data = t.dividend_history()
            if div_data is not None and not div_data.empty:
                div_data = div_data.reset_index()
                for _, row in div_data.tail(5).iterrows():
                    divs.append({
                        "date": row['date'].strftime('%Y-%m-%d'),
                        "amount": row['dividend']
                    })
        except: pass

        return {
            "price_to_book": stats.get('priceToBook'),
            "beta": stats.get('beta'),
            "shares_outstanding": stats.get('sharesOutstanding'),
            "float_shares": stats.get('floatShares'),
            "held_by_insiders": stats.get('heldPercentInsiders'),
            "trailing_eps": stats.get('trailingEps'),
            "dividends": divs
        }
    except:
        return {}

@app.get("/api/stock/{ticker}/peers")
@limiter.limit("20/minute")
async def get_peers(request: Request, ticker: str):
    ticker = ticker.upper().strip()
    sym = ticker if "." in ticker else f"{ticker}.NS"
    try:
        t = Ticker(sym)
        # Recommendation Trends
        trends = t.recommendation_trend
        clean_trends = []
        if trends is not None and not (isinstance(trends, dict) and not trends):
            df = trends.reset_index()
            # Get latest month
            if not df.empty:
                latest = df.iloc[0]
                clean_trends = {
                    "strong_buy": int(latest.get('strongBuy', 0)),
                    "buy": int(latest.get('buy', 0)),
                    "hold": int(latest.get('hold', 0)),
                    "sell": int(latest.get('sell', 0)),
                    "strong_sell": int(latest.get('strongSell', 0))
                }

        # Recommendations (Peers)
        recs = t.recommendations
        peers = []
        if recs and sym in recs:
            for item in recs[sym].get('recommendedSymbols', []):
                peers.append({
                    "symbol": item['symbol'].replace('.NS', '').replace('.BO', ''),
                    "score": item['score']
                })

        return {"trends": clean_trends, "peers": peers}
    except:
        return {"trends": {}, "peers": []}

@app.get("/api/search/suggestions")
@limiter.limit("120/minute")
async def get_suggestions(request: Request, query: str = ""):
    if not query or len(query) < 2: return []
    try:
        search_results = search(query)
        results = []
        seen = set()
        if 'quotes' in search_results:
            for quote in search_results['quotes']:
                symbol = quote.get('symbol', '')
                clean = symbol.replace('.NS', '').replace('.BO', '')
                if clean in seen: continue
                if symbol.endswith('.NS') or symbol.endswith('.BO'):
                    results.append({
                        "symbol": clean,
                        "name": quote.get('longname') or quote.get('shortname') or symbol,
                        "exchange": "NSE" if symbol.endswith('.NS') else "BSE"
                    })
                    seen.add(clean)
        return results[:10]
    except: return []

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
