from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import yfinance as yf
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

# CORS — single source of truth from security.py
from security import ALLOWED_ORIGINS
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


def _fetch_fast_info(symbol: str) -> Optional[dict]:
    """Fetch price data for a single symbol using yfinance fast_info.
    Falls back to history() for indices where fast_info may not populate.
    Returns a normalised dict or None on failure."""
    try:
        fi = yf.Ticker(symbol).fast_info
        price = fi.last_price
        if price is None or price == 0:
            raise ValueError("fast_info returned no price")
        prev_close = fi.regular_market_previous_close or price
        change = round(price - prev_close, 2)
        pct_change = round((price - prev_close) / prev_close * 100, 2) if prev_close else 0.0
        return {
            "price": round(price, 2),
            "change": change,
            "percent_change": pct_change,
            "market_cap": getattr(fi, 'market_cap', None),
        }
    except Exception:
        pass

    # Fallback: use recent history (more reliable for index symbols)
    try:
        hist = yf.Ticker(symbol).history(period="2d", interval="1d")
        if hist.empty or len(hist) < 1:
            return None
        price = float(hist["Close"].iloc[-1])
        prev_close = float(hist["Close"].iloc[-2]) if len(hist) >= 2 else price
        change = round(price - prev_close, 2)
        pct_change = round((price - prev_close) / prev_close * 100, 2) if prev_close else 0.0
        return {
            "price": round(price, 2),
            "change": change,
            "percent_change": pct_change,
            "market_cap": None,
        }
    except Exception as e:
        logger.debug(f"Both fast_info and history failed for {symbol}: {e}")
        return None


async def _async_fast_info(symbol: str) -> tuple[str, Optional[dict]]:
    """Async wrapper around _fetch_fast_info returning (symbol, data)."""
    data = await asyncio.to_thread(_fetch_fast_info, symbol)
    return symbol, data


async def refresh_market_data():
    """Background engine keeping market data ready in memory."""
    await asyncio.sleep(1)  # Let the server start fully before first fetch
    while True:
        try:
            # Deduplicate while preserving order
            seen: set = set()
            all_syms: list = []
            for s in INDEX_SYMBOLS + list(SECTOR_MAP.keys()) + HOT_STOCKS:
                if s not in seen:
                    seen.add(s)
                    all_syms.append(s)

            # Fetch in batches of 5 to avoid rate limits
            results: list = []
            batch_size = 5
            for i in range(0, len(all_syms), batch_size):
                batch = all_syms[i:i + batch_size]
                tasks = [_async_fast_info(sym) for sym in batch]
                batch_results = await asyncio.gather(*tasks, return_exceptions=True)
                results.extend(batch_results)
                if i + batch_size < len(all_syms):
                    await asyncio.sleep(0.5)

            # Build a lookup dict: symbol -> fast_info dict
            p_data: dict[str, dict] = {}
            for result in results:
                if isinstance(result, Exception):
                    continue
                sym, data = result
                if data:
                    p_data[sym] = data

            # 1. Update Indices
            new_indices = []
            for idx in INDEX_SYMBOLS:
                p = p_data.get(idx)
                if p:
                    new_indices.append({
                        "symbol": "NIFTY 50" if idx == "^NSEI" else "SENSEX",
                        "price": p["price"],
                        "percent_change": p["percent_change"]
                    })

            # 2. Update Sectors
            new_sectors = []
            for sym, name in SECTOR_MAP.items():
                p = p_data.get(sym)
                if p:
                    new_sectors.append({
                        "symbol": sym, "name": name,
                        "price": p["price"],
                        "percent_change": p["percent_change"]
                    })

            # 3. Update Hot Stocks in Detail Cache
            for sym in HOT_STOCKS:
                p = p_data.get(sym)
                if p:
                    clean_sym = sym.replace('.NS', '')
                    long_name = clean_sym  # fast_info doesn't expose longName; use symbol
                    STOCK_DETAIL_CACHE[clean_sym] = {
                        "symbol": sym,
                        "name": long_name,
                        "price": p["price"],
                        "percent_change": p["percent_change"],
                        "change": p["change"],
                        "market_cap": p["market_cap"]
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


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch-all handler to prevent stack traces from leaking to clients."""
    logger.error(f"Unhandled error: {exc}", exc_info=True)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


@app.get("/api/market/bootstrap")
@limiter.limit("30/minute")
async def get_market_bootstrap(request: Request):
    return {
        "indices": GLOBAL_MARKET_CACHE["indices"],
        "sectors": GLOBAL_MARKET_CACHE["sectors"],
        "status": "hyper-ready"
    }


@app.get("/api/search/suggestions")
@limiter.limit("30/minute")
async def get_suggestions(request: Request, query: str = ""):
    query = query.upper().strip()
    if len(query) < 2:
        return []
    try:
        def _search():
            return yf.Search(f"{query} NSE", news_count=0, quotes_count=10).quotes

        raw_quotes = await asyncio.to_thread(_search)
        quotes = []
        for q in (raw_quotes or []):
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
@limiter.limit("30/minute")
async def get_stock(request: Request, ticker: str):
    ticker = validate_ticker(ticker)
    if ticker in STOCK_DETAIL_CACHE:
        return STOCK_DETAIL_CACHE[ticker]

    try:
        # Try .NS first, fall back to .BO
        sym = f"{ticker}.NS"
        bo_sym = f"{ticker}.BO"

        def _fetch_stock():
            # Try NS exchange first
            t = yf.Ticker(sym)
            fi = t.fast_info
            price = fi.last_price
            used_sym = sym

            if not price:
                t = yf.Ticker(bo_sym)
                fi = t.fast_info
                price = fi.last_price
                used_sym = bo_sym

            if not price:
                return None, None, None

            prev_close = fi.regular_market_previous_close or price
            change = round(price - prev_close, 2)
            pct_change = round((price - prev_close) / prev_close * 100, 2) if prev_close else 0.0

            # Full info for PE ratio and 52-week data (slightly slower but complete)
            info = t.info or {}
            return used_sym, {
                "price": price,
                "change": change,
                "percent_change": pct_change,
                "market_cap": fi.market_cap,
            }, info

        used_sym, price_data, info = await asyncio.to_thread(_fetch_stock)

        if not price_data:
            raise HTTPException(status_code=404, detail=f"Stock '{ticker}' not found")

        res = {
            "symbol": used_sym,
            "name": info.get('longName') or ticker,
            "price": price_data["price"],
            "percent_change": price_data["percent_change"],
            "change": price_data["change"],
            "market_cap": price_data["market_cap"],
            "pe_ratio": info.get('trailingPE'),
            "fiftyTwoWeekHigh": info.get('fiftyTwoWeekHigh'),
            "fiftyTwoWeekLow": info.get('fiftyTwoWeekLow')
        }
        STOCK_DETAIL_CACHE[ticker] = res
        return res
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to fetch stock '{ticker}': {e}")
        raise HTTPException(status_code=404, detail=f"Stock '{ticker}' not found")


VALID_PERIODS = {"1d", "5d", "1mo", "3mo", "6mo", "1y", "2y", "5y", "10y", "ytd", "max"}
VALID_INTERVALS = {"1m", "2m", "5m", "15m", "30m", "60m", "90m", "1h", "1d", "5d", "1wk", "1mo", "3mo"}


@app.get("/api/stock/{ticker}/history")
@limiter.limit("30/minute")
async def get_history(request: Request, ticker: str, period: str = "1mo", interval: str = "1d"):
    ticker = validate_ticker(ticker)
    if period not in VALID_PERIODS:
        raise HTTPException(status_code=400, detail=f"Invalid period '{period}'")
    if interval not in VALID_INTERVALS:
        raise HTTPException(status_code=400, detail=f"Invalid interval '{interval}'")
    cache_key = f"{ticker}_{period}_{interval}"
    if cache_key in HISTORY_CACHE:
        return HISTORY_CACHE[cache_key]

    sym = ticker if "." in ticker else f"{ticker}.NS"
    try:
        def _fetch_history():
            t = yf.Ticker(sym)
            return t.history(period=period, interval=interval)

        df = await asyncio.to_thread(_fetch_history)
        if df is None or (hasattr(df, 'empty') and df.empty):
            return []

        history = []
        df = df.reset_index()
        # yfinance uses 'Datetime' for intraday and 'Date' for daily intervals
        if 'Datetime' in df.columns:
            date_col = 'Datetime'
        elif 'Date' in df.columns:
            date_col = 'Date'
        else:
            # Fallback: use the first column as the date column
            date_col = df.columns[0]

        for _, row in df.iterrows():
            ts = row[date_col]
            # Format: include time component only for intraday data
            try:
                if hasattr(ts, 'hour') and ts.hour > 0:
                    time_str = ts.strftime('%Y-%m-%d %H:%M')
                else:
                    time_str = ts.strftime('%Y-%m-%d')
            except Exception:
                time_str = str(ts)[:16]

            history.append({
                "time": time_str,
                "open": round(float(row['Open']), 2),
                "high": round(float(row['High']), 2),
                "low": round(float(row['Low']), 2),
                "close": round(float(row['Close']), 2),
                "volume": int(row['Volume']) if 'Volume' in df.columns else 0
            })
        HISTORY_CACHE[cache_key] = history
        return history
    except Exception as e:
        logger.error(f"Failed to fetch history for '{ticker}' (period={period}): {e}")
        return []


@app.get("/api/stock/{ticker}/peers")
@limiter.limit("30/minute")
async def get_peers(request: Request, ticker: str):
    """Return same-sector peer stocks for a given ticker."""
    ticker = validate_ticker(ticker)
    if ticker in PEERS_CACHE:
        return PEERS_CACHE[ticker]

    try:
        sym = f"{ticker}.NS"

        def _fetch_sector():
            info = yf.Ticker(sym).info or {}
            return info.get('sector')

        sector = await asyncio.to_thread(_fetch_sector)

        # Find sector peers; fall back to Nifty 50 blue chips
        if sector and sector in SECTOR_PEERS:
            peer_symbols = [s for s in SECTOR_PEERS[sector] if s != ticker][:5]
        else:
            peer_symbols = [s for s in ["RELIANCE", "TCS", "HDFCBANK", "INFY", "ICICIBANK"] if s != ticker][:5]

        # Fetch current prices for peers concurrently
        ns_syms = [f"{s}.NS" for s in peer_symbols]
        peer_tasks = [_async_fast_info(ns) for ns in ns_syms]
        peer_results = await asyncio.gather(*peer_tasks, return_exceptions=True)

        peers = []
        for s, result in zip(peer_symbols, peer_results):
            if isinstance(result, Exception):
                continue
            ns_sym, p = result
            if p:
                # Get the long name from info if possible; fall back to symbol
                try:
                    long_name = yf.Ticker(ns_sym).fast_info.get('longName') or s
                except Exception:
                    long_name = s
                peers.append({
                    "symbol": s,
                    "name": long_name,
                    "price": p["price"],
                    "percent_change": p["percent_change"]
                })

        result = {"sector": sector or "Unknown", "peers": peers}
        PEERS_CACHE[ticker] = result
        return result
    except Exception as e:
        logger.error(f"Failed to fetch peers for '{ticker}': {e}")
        return {"sector": "Unknown", "peers": []}


@app.get("/api/stock/{ticker}/news")
@limiter.limit("30/minute")
async def get_news(request: Request, ticker: str):
    """Return recent news articles for a given ticker."""
    ticker = validate_ticker(ticker)
    if ticker in NEWS_CACHE:
        return NEWS_CACHE[ticker]

    try:
        sym = f"{ticker}.NS"

        def _fetch_news():
            # yfinance Ticker.news is a property (list), not a method
            return yf.Ticker(sym).news or []

        raw_news = await asyncio.to_thread(_fetch_news)

        articles = []
        for item in (raw_news or []):
            # yfinance news dicts use the same keys as yahooquery
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
async def health_check():
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat(),
        "cache_last_updated": GLOBAL_MARKET_CACHE["last_updated"]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
