from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from yahooquery import Ticker, search
from datetime import datetime, timedelta
import re
import random
from cachetools import TTLCache
import asyncio
from typing import List, Optional
import os
import logging
import auth
from models import db
from dotenv import load_dotenv

load_dotenv()

# Structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("gallagyan")

# Ticker symbol whitelist pattern
TICKER_PATTERN = re.compile(r'^[A-Z0-9.\-&]{1,20}$')

# CORS — loaded from environment, never wildcard in production
_raw_origins = os.getenv("ALLOWED_ORIGINS", "https://gallagyan.xyz,https://www.gallagyan.xyz,http://localhost:3000")
ALLOWED_ORIGINS = [o.strip() for o in _raw_origins.split(",") if o.strip()]
logger.info(f"CORS allowed origins: {ALLOWED_ORIGINS}")


# --- HYPER-CACHE ENGINE ---
GLOBAL_MARKET_CACHE = {
    "indices": [],
    "sectors": [],
    "last_updated": None
}

# LRU Cache for on-demand stock data (1 hour TTL)
STOCK_DETAIL_CACHE = TTLCache(maxsize=500, ttl=3600)
HISTORY_CACHE = TTLCache(maxsize=500, ttl=3600)
NEWS_CACHE = TTLCache(maxsize=200, ttl=1800)
PEERS_CACHE = TTLCache(maxsize=200, ttl=7200)

# High-priority stocks for background refresh
HOT_STOCKS = [
    "RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS", "ICICIBANK.NS",
    "SBIN.NS", "BHARTIARTL.NS", "LICI.NS", "ITC.NS", "HINDUNILVR.NS"
]

INDEX_SYMBOLS = ["^NSEI", "^BSESN"]
SECTOR_MAP = {
    '^NSEI': 'Nifty 50', '^BSESN': 'Sensex', '^NSEBANK': 'Bank Nifty',
    '^CNXIT': 'Nifty IT', '^CNXAUTO': 'Nifty Auto', '^CNXFMCG': 'Nifty FMCG',
    '^CNXMETAL': 'Nifty Metal', '^CNXPHARMA': 'Nifty Pharma', '^CNXENERGY': 'Nifty Energy'
}

# Sector → representative peer stocks for the /peers endpoint
SECTOR_PEERS = {
    "Technology": ["TCS", "INFY", "WIPRO", "HCLTECH", "TECHM"],
    "Financial Services": ["HDFCBANK", "ICICIBANK", "SBIN", "AXISBANK", "KOTAKBANK"],
    "Energy": ["RELIANCE", "ONGC", "BPCL", "IOC", "NTPC"],
    "Consumer Defensive": ["HINDUNILVR", "ITC", "DABUR", "MARICO", "GODREJCP"],
    "Industrials": ["LT", "SIEMENS", "ABB", "BEL", "BHEL"],
    "Communication Services": ["BHARTIARTL", "IDEA", "TTML", "MTNL"],
    "Healthcare": ["SUNPHARMA", "DRREDDY", "CIPLA", "DIVISLAB", "APOLLOHOSP"],
    "Consumer Cyclical": ["MARUTI", "TATAMOTORS", "M&M", "BAJAJ-AUTO", "EICHERMOT"],
    "Basic Materials": ["TATASTEEL", "HINDALCO", "JSWSTEEL", "SAIL", "VEDL"],
    "Real Estate": ["DLF", "GODREJPROP", "OBEROIRLTY", "PRESTIGE"],
}


async def refresh_market_data():
    """Background engine keeping market data ready in memory."""
    while True:
        try:
            all_syms = INDEX_SYMBOLS + list(SECTOR_MAP.keys()) + HOT_STOCKS
            t = await asyncio.to_thread(Ticker, all_syms)
            p_data = t.price

            # 1. Update Indices
            new_indices = []
            for idx in INDEX_SYMBOLS:
                p = p_data.get(idx, {})
                if p:
                    new_indices.append({
                        "symbol": "NIFTY 50" if idx == "^NSEI" else "SENSEX",
                        "price": p.get("regularMarketPrice"),
                        "percent_change": round(p.get("regularMarketChangePercent", 0) * 100, 2)
                    })

            # 2. Update Sectors
            new_sectors = []
            for sym, name in SECTOR_MAP.items():
                p = p_data.get(sym, {})
                if p and p.get('regularMarketPrice'):
                    new_sectors.append({
                        "symbol": sym, "name": name, "price": p.get('regularMarketPrice'),
                        "percent_change": round(p.get('regularMarketChangePercent', 0) * 100, 2)
                    })

            # 3. Update Hot Stocks in Detail Cache
            for sym in HOT_STOCKS:
                p = p_data.get(sym, {})
                if p and p.get('regularMarketPrice'):
                    clean_sym = sym.replace('.NS', '')
                    STOCK_DETAIL_CACHE[clean_sym] = {
                        "symbol": sym, "name": p.get('longName') or clean_sym,
                        "price": p.get('regularMarketPrice'),
                        "percent_change": round(p.get('regularMarketChangePercent', 0) * 100, 2),
                        "change": round(p.get('regularMarketChange', 0), 2),
                        "market_cap": p.get('marketCap')
                    }

            GLOBAL_MARKET_CACHE["indices"] = new_indices
            GLOBAL_MARKET_CACHE["sectors"] = new_sectors
            GLOBAL_MARKET_CACHE["last_updated"] = datetime.now().isoformat()
            logger.info("Market cache refreshed successfully")

        except Exception as e:
            logger.error(f"Background market refresh failed: {e}")

        await asyncio.sleep(45)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """App lifespan — start background refresh task on startup."""
    logger.info("GallaGyan API starting up")
    
    # Initialize database and default user
    from models import init_db
    try:
        init_db()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")

    task = asyncio.create_task(refresh_market_data())
    yield
    task.cancel()
    logger.info("GallaGyan API shut down")


# Initialize FastAPI
app = FastAPI(title="GallaGyan Hyper-Speed API", lifespan=lifespan)
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(GZipMiddleware, minimum_size=250)
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET", "POST"],
    allow_headers=["Authorization", "Content-Type"],
    allow_credentials=True
)

app.include_router(auth.router)


def validate_ticker(ticker: str) -> str:
    """Validate and normalise a ticker symbol. Raises HTTP 400 if invalid."""
    clean = ticker.upper().strip()
    if not TICKER_PATTERN.match(clean):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid ticker symbol '{ticker}'. Must be 1-20 alphanumeric characters."
        )
    return clean


@app.get("/api/market/bootstrap")
async def get_market_bootstrap():
    return {
        "indices": GLOBAL_MARKET_CACHE["indices"],
        "sectors": GLOBAL_MARKET_CACHE["sectors"],
        "status": "hyper-ready"
    }


@app.get("/api/search/suggestions")
async def get_suggestions(query: str = ""):
    query = query.upper().strip()
    if len(query) < 2:
        return []
    try:
        results = await asyncio.to_thread(search, f"{query} NSE")
        quotes = []
        for q in results.get('quotes', []):
            sym = q.get('symbol', '')
            if sym.endswith('.NS') or sym.endswith('.BO'):
                quotes.append({
                    "symbol": sym.replace('.NS', '').replace('.BO', ''),
                    "name": q.get('longname') or q.get('shortname'),
                    "exchange": "NSE" if sym.endswith('.NS') else "BSE"
                })
        return quotes[:10]
    except Exception as e:
        logger.warning(f"Search suggestions failed for query '{query}': {e}")
        return []


@app.get("/api/stock/{ticker}")
async def get_stock(ticker: str):
    ticker = validate_ticker(ticker)
    if ticker in STOCK_DETAIL_CACHE:
        return STOCK_DETAIL_CACHE[ticker]

    try:
        sym = f"{ticker}.NS"
        t = await asyncio.to_thread(Ticker, [sym, f"{ticker}.BO"])
        p_data = t.price
        p = p_data.get(sym, p_data.get(f"{ticker}.BO", {}))

        if not p or not p.get('regularMarketPrice'):
            raise HTTPException(status_code=404, detail=f"Stock '{ticker}' not found")

        summary = t.summary_detail.get(sym, t.summary_detail.get(f"{ticker}.BO", {}))
        res = {
            "symbol": sym if sym in p_data else f"{ticker}.BO",
            "name": p.get('longName') or ticker,
            "price": p.get('regularMarketPrice'),
            "percent_change": round(p.get('regularMarketChangePercent', 0) * 100, 2),
            "change": round(p.get('regularMarketChange', 0), 2),
            "market_cap": p.get('marketCap'),
            "pe_ratio": summary.get('trailingPE'),
            "fiftyTwoWeekHigh": summary.get('fiftyTwoWeekHigh'),
            "fiftyTwoWeekLow": summary.get('fiftyTwoWeekLow')
        }
        STOCK_DETAIL_CACHE[ticker] = res
        return res
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to fetch stock '{ticker}': {e}")
        raise HTTPException(status_code=404, detail=f"Stock '{ticker}' not found")


@app.get("/api/stock/{ticker}/history")
async def get_history(ticker: str, period: str = "1mo", interval: str = "1d"):
    ticker = validate_ticker(ticker)
    cache_key = f"{ticker}_{period}_{interval}"
    if cache_key in HISTORY_CACHE:
        return HISTORY_CACHE[cache_key]

    sym = ticker if "." in ticker else f"{ticker}.NS"
    try:
        t = await asyncio.to_thread(Ticker, sym)
        df = t.history(period=period, interval=interval)
        if df is None or (hasattr(df, 'empty') and df.empty):
            return []

        history = []
        df = df.reset_index()
        for _, row in df.iterrows():
            history.append({
                "time": row['date'].strftime('%Y-%m-%d'),
                "open": round(row['open'], 2), "high": round(row['high'], 2),
                "low": round(row['low'], 2), "close": round(row['close'], 2)
            })
        HISTORY_CACHE[cache_key] = history
        return history
    except Exception as e:
        logger.error(f"Failed to fetch history for '{ticker}' (period={period}): {e}")
        return []


@app.get("/api/stock/{ticker}/peers")
async def get_peers(ticker: str):
    """Return same-sector peer stocks for a given ticker."""
    ticker = validate_ticker(ticker)
    if ticker in PEERS_CACHE:
        return PEERS_CACHE[ticker]

    try:
        sym = f"{ticker}.NS"
        t = await asyncio.to_thread(Ticker, sym)
        profile = t.asset_profile.get(sym, {})
        sector = profile.get("sector") if isinstance(profile, dict) else None

        # Find sector peers; fall back to Nifty 50 blue chips
        if sector and sector in SECTOR_PEERS:
            peer_symbols = [s for s in SECTOR_PEERS[sector] if s != ticker][:5]
        else:
            peer_symbols = [s for s in ["RELIANCE", "TCS", "HDFCBANK", "INFY", "ICICIBANK"] if s != ticker][:5]

        # Fetch current prices for peers
        ns_syms = [f"{s}.NS" for s in peer_symbols]
        pt = await asyncio.to_thread(Ticker, ns_syms)
        p_data = pt.price

        peers = []
        for s, ns in zip(peer_symbols, ns_syms):
            p = p_data.get(ns, {})
            if p and p.get('regularMarketPrice'):
                peers.append({
                    "symbol": s,
                    "name": p.get('longName') or s,
                    "price": p.get('regularMarketPrice'),
                    "percent_change": round(p.get('regularMarketChangePercent', 0) * 100, 2)
                })

        result = {"sector": sector or "Unknown", "peers": peers}
        PEERS_CACHE[ticker] = result
        return result
    except Exception as e:
        logger.error(f"Failed to fetch peers for '{ticker}': {e}")
        return {"sector": "Unknown", "peers": []}


@app.get("/api/stock/{ticker}/news")
async def get_news(ticker: str):
    """Return recent news articles for a given ticker."""
    ticker = validate_ticker(ticker)
    if ticker in NEWS_CACHE:
        return NEWS_CACHE[ticker]

    try:
        sym = f"{ticker}.NS"
        t = await asyncio.to_thread(Ticker, sym)
        raw_news = t.news(count=10)

        articles = []
        for item in (raw_news or []):
            articles.append({
                "title": item.get("title", ""),
                "publisher": item.get("publisher", ""),
                "link": item.get("link", ""),
                "providerPublishTime": item.get("providerPublishTime", 0),
                "sentiment": "Neutral"
            })

        NEWS_CACHE[ticker] = articles
        return articles
    except Exception as e:
        logger.error(f"Failed to fetch news for '{ticker}': {e}")
        return []


@app.get("/api/health")
async def health():
    return {
        "status": "hyper-optimized",
        "cache_last_updated": GLOBAL_MARKET_CACHE["last_updated"]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
