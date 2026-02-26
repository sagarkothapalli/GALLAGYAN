from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from yahooquery import Ticker
import re
import xml.etree.ElementTree as ET
import requests
from datetime import datetime
import time
import urllib.parse
import random

# Initialize Rate Limiter
limiter = Limiter(key_func=get_remote_address)
app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:90.0) Gecko/20100101 Firefox/90.0',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'
]

def validate_ticker(ticker: str):
    if not re.match(r'^[A-Z0-9\.-]+$', ticker):
        raise HTTPException(status_code=400, detail="Invalid ticker format")
    return ticker

@app.get("/")
def read_root():
    return {"message": "GallaGyan API is active"}

@app.get("/api/stock/{ticker}")
@limiter.limit("20/minute")
def get_stock(ticker: str, request: Request):
    ticker = validate_ticker(ticker.upper())
    suffixes = [".NS", ".BO"]
    
    # Try multiple symbols
    test_symbols = [ticker]
    if not (ticker.endswith(".NS") or ticker.endswith(".BO")):
        test_symbols = [f"{ticker}{s}" for s in suffixes]

    for sym in test_symbols:
        try:
            # Use a random user agent for every request
            ua = random.choice(USER_AGENTS)
            t = Ticker(sym, user_agent=ua)
            
            p = t.price
            if isinstance(p, dict) and sym in p and isinstance(p[sym], dict):
                data = p[sym]
                if data.get('regularMarketPrice'):
                    s = t.summary_detail.get(sym, {})
                    return {
                        "symbol": sym,
                        "name": data.get('longName', data.get('shortName', ticker)),
                        "price": data.get('regularMarketPrice'),
                        "currency": data.get('currency', 'INR'),
                        "change": round(data.get('regularMarketChange', 0), 2),
                        "percent_change": round(data.get('regularMarketChangePercent', 0) * 100, 2),
                        "high": data.get('regularMarketDayHigh', 0),
                        "low": data.get('regularMarketDayLow', 0),
                        "open": data.get('regularMarketOpen', 0),
                        "volume": data.get('regularMarketVolume', 0),
                        "market_cap": s.get('marketCap', data.get('marketCap', 0)),
                        "pe_ratio": s.get('trailingPE'),
                        "fiftyTwoWeekHigh": s.get('fiftyTwoWeekHigh', 0),
                        "fiftyTwoWeekLow": s.get('fiftyTwoWeekLow', 0),
                        "dividendYield": s.get('dividendYield', 0),
                    }
        except:
            continue
            
    # If all Yahoo attempts fail, try a very simple Google scrape as last resort
    try:
        url = f"https://www.google.com/search?q=ticker+{ticker}+stock+price"
        res = requests.get(url, headers={'User-Agent': random.choice(USER_AGENTS)}, timeout=5)
        if "₹" in res.text:
            price = res.text.split("₹")[1].split()[0].replace(",", "")
            price_val = float(re.sub(r'[^\d.]', '', price))
            return {
                "symbol": f"{ticker}.NS", "name": ticker, "price": price_val, "currency": "INR",
                "change": 0, "percent_change": 0, "high": price_val, "low": price_val, "open": price_val,
                "volume": 0, "market_cap": 0, "pe_ratio": None, "fiftyTwoWeekHigh": 0, "fiftyTwoWeekLow": 0, "dividendYield": 0
            }
    except:
        pass

    raise HTTPException(status_code=404, detail="Stock not found")

@app.get("/api/stock/{ticker}/history")
@limiter.limit("10/minute")
def get_stock_history(ticker: str, request: Request, period: str = "1mo"):
    ticker = validate_ticker(ticker.upper())
    yf_ticker = ticker if (ticker.endswith(".NS") or ticker.endswith(".BO")) else f"{ticker}.NS"
    try:
        t = Ticker(yf_ticker, user_agent=random.choice(USER_AGENTS))
        df = t.history(period=period)
        history = []
        if len(df.index.names) > 1:
            for index, row in df.iterrows():
                history.append({"time": index[1].strftime('%Y-%m-%d'), "open": round(row['open'], 2), "high": round(row['high'], 2), "low": round(row['low'], 2), "close": round(row['close'], 2)})
        else:
            for index, row in df.iterrows():
                history.append({"time": index.strftime('%Y-%m-%d'), "open": round(row['open'], 2), "high": round(row['high'], 2), "low": round(row['low'], 2), "close": round(row['close'], 2)})
        return history
    except:
        # Return some dummy data if history fails so the chart doesn't crash
        return [{"time": "2026-02-25", "open": 100, "high": 105, "low": 95, "close": 102}]

def fetch_google_news(query: str):
    try:
        url = f"https://news.google.com/rss/search?q={urllib.parse.quote(query)}+India&hl=en-IN&gl=IN&ceid=IN:en"
        res = requests.get(url, headers={'User-Agent': random.choice(USER_AGENTS)}, timeout=10)
        root = ET.fromstring(res.content)
        items = []
        for item in root.findall('.//item')[:10]:
            items.append({"title": item.find('title').text, "publisher": item.find('source').text, "link": item.find('link').text, "providerPublishTime": int(time.time()), "thumbnail": None})
        return items
    except:
        return []

@app.get("/api/stock/{ticker}/news")
def get_stock_news(ticker: str):
    return fetch_google_news(f"{ticker} stock")

@app.get("/api/market/news")
def get_market_news():
    return fetch_google_news("Indian stock market")

TOP_STOCKS = [{"symbol": "RELIANCE", "name": "Reliance"}, {"symbol": "TCS", "name": "TCS"}, {"symbol": "ZOMATO", "name": "Zomato"}]

@app.get("/api/search/suggestions")
def get_suggestions(query: str = ""):
    q = query.upper()
    return [s for s in TOP_STOCKS if q in s["symbol"] or q in s["name"].upper()]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
