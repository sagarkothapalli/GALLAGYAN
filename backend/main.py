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

# Initialize Rate Limiter
limiter = Limiter(key_func=get_remote_address)
app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
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
        yf_ticker = ticker if (ticker.endswith(".NS") or ticker.endswith(".BO")) else f"{ticker}.NS"
        stock = yf.Ticker(yf_ticker)
        info = stock.info
        
        current_price = info.get('currentPrice', info.get('regularMarketPrice', 0))
        previous_close = info.get('previousClose', info.get('regularMarketPreviousClose', 0))
        change = current_price - previous_close
        percent_change = (change / previous_close) * 100 if previous_close else 0

        return {
            "symbol": yf_ticker,
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
    except Exception as e:
        print(f"Error fetching {ticker}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch stock data")

@app.get("/api/stock/{ticker}/history")
@limiter.limit("10/minute")
def get_stock_history(ticker: str, request: Request, period: str = "1mo"):
    try:
        ticker = validate_ticker(ticker.upper())
        yf_ticker = ticker if (ticker.endswith(".NS") or ticker.endswith(".BO")) else f"{ticker}.NS"
        stock = yf.Ticker(yf_ticker)
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
        print(f"Error fetching history for {ticker}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch history")

def fetch_google_news(query: str):
    try:
        search_query = urllib.parse.quote(query)
        url = f"https://news.google.com/rss/search?q={search_query}+India&hl=en-IN&gl=IN&ceid=IN:en"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        root = ET.fromstring(response.content)
        
        news_items = []
        for item in root.findall('.//item')[:15]:
            title = item.find('title').text
            link = item.find('link').text
            pub_date = item.find('pubDate').text
            source = item.find('source').text
            
            # Convert pub_date to timestamp
            # Format: Wed, 25 Feb 2026 10:30:00 GMT
            try:
                dt = datetime.strptime(pub_date, '%a, %d %b %Y %H:%M:%S %Z')
                ts = int(time.mktime(dt.timetuple()))
            except:
                ts = int(time.time())

            news_items.append({
                "title": title,
                "publisher": source,
                "link": link,
                "providerPublishTime": ts,
                "thumbnail": None
            })
        return news_items
    except Exception as e:
        print(f"News fetch error: {e}")
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

# Top 50 NSE Stocks for Autocomplete
TOP_STOCKS = [
    {"symbol": "RELIANCE", "name": "Reliance Industries"},
    {"symbol": "TCS", "name": "Tata Consultancy Services"},
    {"symbol": "HDFCBANK", "name": "HDFC Bank"},
    {"symbol": "ICICIBANK", "name": "ICICI Bank"},
    {"symbol": "BHARTIARTL", "name": "Bharti Airtel"},
    {"symbol": "SBIN", "name": "State Bank of India"},
    {"symbol": "INFY", "name": "Infosys"},
    {"symbol": "LICI", "name": "LIC of India"},
    {"symbol": "ITC", "name": "ITC Limited"},
    {"symbol": "HINDUNILVR", "name": "Hindustan Unilever"},
    {"symbol": "LT", "name": "Larsen & Toubro"},
    {"symbol": "BAJFINANCE", "name": "Bajaj Finance"},
    {"symbol": "HCLTECH", "name": "HCL Technologies"},
    {"symbol": "MARUTI", "name": "Maruti Suzuki"},
    {"symbol": "SUNPHARMA", "name": "Sun Pharma"},
    {"symbol": "ADANIENT", "name": "Adani Enterprises"},
    {"symbol": "KOTAKBANK", "name": "Kotak Mahindra Bank"},
    {"symbol": "TITAN", "name": "Titan Company"},
    {"symbol": "ULTRACEMCO", "name": "UltraTech Cement"},
    {"symbol": "AXISBANK", "name": "Axis Bank"},
    {"symbol": "ADANIPORTS", "name": "Adani Ports"},
    {"symbol": "ASIANPAINT", "name": "Asian Paints"},
    {"symbol": "COALINDIA", "name": "Coal India"},
    {"symbol": "WIPRO", "name": "Wipro"},
    {"symbol": "BAJAJFINSV", "name": "Bajaj Finserv"},
    {"symbol": "ONGC", "name": "ONGC"},
    {"symbol": "JSWSTEEL", "name": "JSW Steel"},
    {"symbol": "NTPC", "name": "NTPC"},
    {"symbol": "M&M", "name": "Mahindra & Mahindra"},
    {"symbol": "TATASTEEL", "name": "Tata Steel"},
    {"symbol": "POWERGRID", "name": "Power Grid"},
    {"symbol": "ADANIPOWER", "name": "Adani Power"},
    {"symbol": "TATAMOTORS", "name": "Tata Motors"},
    {"symbol": "INDUSINDBK", "name": "IndusInd Bank"},
    {"symbol": "BAJAJ-AUTO", "name": "Bajaj Auto"},
    {"symbol": "NESTLEIND", "name": "Nestle India"},
    {"symbol": "GRASIM", "name": "Grasim Industries"},
    {"symbol": "JIOFIN", "name": "Jio Financial Services"},
    {"symbol": "HAL", "name": "Hindustan Aeronautics"},
    {"symbol": "DLF", "name": "DLF Limited"},
    {"symbol": "IDFCFIRSTB", "name": "IDFC First Bank"},
    {"symbol": "ZOMATO", "name": "Zomato Limited"},
    {"symbol": "PAYTM", "name": "Paytm (One97)"},
    {"symbol": "ADANIGREEN", "name": "Adani Green Energy"},
    {"symbol": "BEL", "name": "Bharat Electronics"},
    {"symbol": "SBILIFE", "name": "SBI Life Insurance"},
]

@app.get("/api/search/suggestions")
def get_suggestions(query: str = ""):
    if not query:
        return []
    query = query.upper()
    matches = []
    for s in TOP_STOCKS:
        if query in s["symbol"] or query in s["name"].upper():
            matches.append(s)
    return matches[:8] # Return top 8 matches

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
