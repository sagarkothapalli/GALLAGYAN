from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import yfinance as yf
import re
import xml.etree.ElementTree as ET
import requests
from datetime import datetime
import time
import urllib.parse

# Setup Session for yfinance to avoid getting blocked
session = requests.Session()
session.headers.update({
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
})

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

def validate_ticker(ticker: str):
    if not re.match(r'^[A-Z0-9\.-]+$', ticker):
        raise HTTPException(status_code=400, detail="Invalid ticker format")
    if len(ticker) > 15:
        raise HTTPException(status_code=400, detail="Ticker too long")
    return ticker

@app.get("/")
@limiter.limit("5/minute")
def read_root(request: Request):
    return {"message": "GallaGyan API is running safely"}

def fetch_google_finance_price(ticker: str):
    """Fallback scraper for Google Finance if Yahoo is blocked"""
    try:
        url = f"https://www.google.com/search?q=google+finance+{ticker}+stock"
        headers = {'User-Agent': 'Mozilla/5.0'}
        response = requests.get(url, headers=headers, timeout=5)
        content = response.text
        if "₹" in content:
            parts = content.split("₹")
            price_str = parts[1][:15].split()[0].replace(",", "")
            return float(re.sub(r'[^\d.]', '', price_str))
    except:
        pass
    return None

@app.get("/api/stock/{ticker}")
@limiter.limit("20/minute")
def get_stock(ticker: str, request: Request):
    try:
        ticker = validate_ticker(ticker.upper())
        suffixes = [".NS", ".BO"]
        
        search_tickers = [ticker]
        if not (ticker.endswith(".NS") or ticker.endswith(".BO")):
            search_tickers = [f"{ticker}{s}" for s in suffixes] + [ticker]
        
        info = None
        used_ticker = ""
        
        for st in search_tickers:
            try:
                stock = yf.Ticker(st, session=session)
                info = stock.info
                if info and (info.get('regularMarketPrice') or info.get('currentPrice')):
                    used_ticker = st
                    break
            except:
                continue
        
        # If Yahoo fails, try Google fallback
        if not used_ticker:
            google_price = fetch_google_finance_price(ticker)
            if google_price:
                return {
                    "symbol": f"{ticker}.NS",
                    "name": ticker,
                    "price": google_price,
                    "currency": "INR",
                    "change": 0,
                    "percent_change": 0,
                    "high": google_price,
                    "low": google_price,
                    "open": google_price,
                    "volume": 0,
                    "market_cap": 0,
                    "pe_ratio": None,
                    "fiftyTwoWeekHigh": 0,
                    "fiftyTwoWeekLow": 0,
                    "dividendYield": 0,
                }
            raise HTTPException(status_code=404, detail="Stock not found")

        current_price = info.get('currentPrice', info.get('regularMarketPrice', 0))
        previous_close = info.get('previousClose', info.get('regularMarketPreviousClose', 0))
        change = current_price - previous_close
        percent_change = (change / previous_close) * 100 if previous_close else 0

        return {
            "symbol": used_ticker,
            "name": info.get('longName', ticker),
            "price": current_price,
            "currency": info.get('currency', 'INR'),
            "change": round(change, 2),
            "percent_change": round(percent_change, 2),
            "high": info.get('dayHigh', 0),
            "low": info.get('dayLow', 0),
            "open": info.get('open', 0),
            "volume": info.get('volume', 0),
            "market_cap": info.get('marketCap', 0),
            "pe_ratio": info.get('trailingPE', None),
            "fiftyTwoWeekHigh": info.get('fiftyTwoWeekHigh', 0),
            "fiftyTwoWeekLow": info.get('fiftyTwoWeekLow', 0),
            "dividendYield": info.get('dividendYield', 0),
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.get("/api/stock/{ticker}/history")
@limiter.limit("10/minute")
def get_stock_history(ticker: str, request: Request, period: str = "1mo"):
    try:
        ticker = validate_ticker(ticker.upper())
        yf_ticker = ticker if (ticker.endswith(".NS") or ticker.endswith(".BO")) else f"{ticker}.NS"
        stock = yf.Ticker(yf_ticker, session=session)
        df = stock.history(period=period)
        
        if df.empty:
            raise HTTPException(status_code=404, detail="No history found")

        history = []
        for index, row in df.iterrows():
            history.append({
                "time": index.strftime('%Y-%m-%d'),
                "open": round(row['Open'], 2),
                "high": round(row['High'], 2),
                "low": round(row['Low'], 2),
                "close": round(row['Close'], 2),
            })
        return history
    except Exception as e:
        raise HTTPException(status_code=500, detail="History fetch failed")

def fetch_google_news(query: str):
    try:
        search_query = urllib.parse.quote(query)
        url = f"https://news.google.com/rss/search?q={search_query}+India&hl=en-IN&gl=IN&ceid=IN:en"
        headers = {'User-Agent': 'Mozilla/5.0'}
        response = requests.get(url, headers=headers, timeout=10)
        root = ET.fromstring(response.content)
        news_items = []
        for item in root.findall('.//item')[:15]:
            title = item.find('title').text
            link = item.find('link').text
            pub_date = item.find('pubDate').text
            source = item.find('source').text
            try:
                dt = datetime.strptime(pub_date, '%a, %d %b %Y %H:%M:%S %Z')
                ts = int(time.mktime(dt.timetuple()))
            except:
                ts = int(time.time())
            news_items.append({
                "title": title, "publisher": source, "link": link, "providerPublishTime": ts, "thumbnail": None
            })
        return news_items
    except:
        return []

@app.get("/api/stock/{ticker}/news")
@limiter.limit("10/minute")
def get_stock_news(ticker: str, request: Request):
    ticker = validate_ticker(ticker.upper())
    clean_name = ticker.replace(".NS", "").replace(".BO", "")
    return fetch_google_news(f"{clean_name} stock")

@app.get("/api/market/news")
@limiter.limit("10/minute")
def get_market_news(request: Request):
    return fetch_google_news("Indian stock market breaking news")

TOP_STOCKS = [
    {"symbol": "RELIANCE", "name": "Reliance Industries"},
    {"symbol": "TCS", "name": "Tata Consultancy Services"},
    {"symbol": "HDFCBANK", "name": "HDFC Bank"},
    {"symbol": "ICICIBANK", "name": "ICICI Bank"},
    {"symbol": "BHARTIARTL", "name": "Bharti Airtel"},
    {"symbol": "SBIN", "name": "State Bank of India"},
    {"symbol": "INFY", "name": "Infosys"},
    {"symbol": "ITC", "name": "ITC Limited"},
    {"symbol": "LT", "name": "Larsen & Toubro"},
    {"symbol": "ZOMATO", "name": "Zomato Limited"},
    {"symbol": "IDFCFIRSTB", "name": "IDFC First Bank"},
]

@app.get("/api/search/suggestions")
def get_suggestions(query: str = ""):
    if not query: return []
    query = query.upper()
    return [s for s in TOP_STOCKS if query in s["symbol"] or query in s["name"].upper()][:8]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
