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

@app.get("/api/stock/{ticker}")
@limiter.limit("20/minute")
def get_stock(ticker: str, request: Request):
    try:
        ticker = validate_ticker(ticker.upper())
        # Try NSE first, then BSE
        yf_ticker = ticker if (ticker.endswith(".NS") or ticker.endswith(".BO")) else f"{ticker}.NS"
        
        t = Ticker(yf_ticker)
        # yahooquery returns data in a dict keyed by the symbol
        price_data = t.price.get(yf_ticker, {})
        summary_data = t.summary_detail.get(yf_ticker, {})
        
        if not price_data or isinstance(price_data, str):
            # Try BSE fallback if NSE fails
            if not ticker.endswith(".BO"):
                yf_ticker = f"{ticker}.BO"
                t = Ticker(yf_ticker)
                price_data = t.price.get(yf_ticker, {})
                summary_data = t.summary_detail.get(yf_ticker, {})

        if not price_data or isinstance(price_data, str):
            raise HTTPException(status_code=404, detail="Stock not found")

        current_price = price_data.get('regularMarketPrice', 0)
        previous_close = price_data.get('regularMarketPreviousClose', 0)
        change = current_price - previous_close
        percent_change = (change / previous_close) * 100 if previous_close else 0

        return {
            "symbol": yf_ticker,
            "name": price_data.get('longName', ticker),
            "price": current_price,
            "currency": price_data.get('currency', 'INR'),
            "change": round(change, 2),
            "percent_change": round(percent_change, 2),
            "high": price_data.get('regularMarketDayHigh', 0),
            "low": price_data.get('regularMarketDayLow', 0),
            "open": price_data.get('regularMarketOpen', 0),
            "volume": price_data.get('regularMarketVolume', 0),
            "market_cap": summary_data.get('marketCap', 0),
            "pe_ratio": summary_data.get('trailingPE', None),
            "fiftyTwoWeekHigh": summary_data.get('fiftyTwoWeekHigh', 0),
            "fiftyTwoWeekLow": summary_data.get('fiftyTwoWeekLow', 0),
            "dividendYield": summary_data.get('dividendYield', 0),
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Stock fetch failed")

@app.get("/api/stock/{ticker}/history")
@limiter.limit("10/minute")
def get_stock_history(ticker: str, request: Request, period: str = "1mo"):
    try:
        ticker = validate_ticker(ticker.upper())
        yf_ticker = ticker if (ticker.endswith(".NS") or ticker.endswith(".BO")) else f"{ticker}.NS"
        t = Ticker(yf_ticker)
        df = t.history(period=period)
        
        if df.empty:
            raise HTTPException(status_code=404, detail="No history found")

        # yahooquery history returns a multi-index dataframe or a dict
        # We need to handle it carefully
        history = []
        # If it's a multi-index (Symbol, Date)
        if hasattr(df, 'index') and len(df.index.names) > 1:
            for index, row in df.iterrows():
                history.append({
                    "time": index[1].strftime('%Y-%m-%d'),
                    "open": round(row['open'], 2),
                    "high": round(row['high'], 2),
                    "low": round(row['low'], 2),
                    "close": round(row['close'], 2),
                })
        else:
            for index, row in df.iterrows():
                history.append({
                    "time": index.strftime('%Y-%m-%d'),
                    "open": round(row['open'], 2),
                    "high": round(row['high'], 2),
                    "low": round(row['low'], 2),
                    "close": round(row['close'], 2),
                })
        return history
    except Exception as e:
        print(f"History Error: {e}")
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
