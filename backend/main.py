from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import requests
import re
import xml.etree.ElementTree as ET
from datetime import datetime
import time
import urllib.parse
import random

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36'
]

@app.get("/")
def read_root():
    return {"message": "GallaGyan API is active"}

@app.get("/api/stock/{ticker}")
def get_stock(ticker: str):
    ticker = ticker.upper()
    # Try NSE then BSE
    for suffix in [".NS", ".BO", ""]:
        sym = f"{ticker}{suffix}" if suffix else ticker
        try:
            url = f"https://query1.finance.yahoo.com/v8/finance/chart/{sym}?interval=1d&range=1d"
            res = requests.get(url, headers={'User-Agent': random.choice(USER_AGENTS)}, timeout=10)
            data = res.json()
            
            result = data.get('chart', {}).get('result', [])
            if result:
                meta = result[0]['meta']
                price = meta.get('regularMarketPrice')
                if price:
                    return {
                        "symbol": sym,
                        "name": ticker,
                        "price": price,
                        "currency": meta.get('currency', 'INR'),
                        "change": round(price - meta.get('previousClose', price), 2),
                        "percent_change": round(((price - meta.get('previousClose', price)) / meta.get('previousClose', price)) * 100, 2) if meta.get('previousClose') else 0,
                        "high": meta.get('dayHigh', price),
                        "low": meta.get('dayLow', price),
                        "open": meta.get('regularMarketOpen', price),
                        "volume": 0,
                        "market_cap": 0,
                        "pe_ratio": None,
                        "fiftyTwoWeekHigh": 0,
                        "fiftyTwoWeekLow": 0,
                        "dividendYield": 0
                    }
        except:
            continue
    
    raise HTTPException(status_code=404, detail="Stock not found")

@app.get("/api/stock/{ticker}/history")
def get_stock_history(ticker: str):
    ticker = ticker.upper()
    sym = ticker if (".NS" in ticker or ".BO" in ticker) else f"{ticker}.NS"
    try:
        url = f"https://query1.finance.yahoo.com/v8/finance/chart/{sym}?interval=1d&range=1mo"
        res = requests.get(url, headers={'User-Agent': random.choice(USER_AGENTS)}, timeout=10)
        data = res.json()
        result = data['chart']['result'][0]
        timestamps = result['timestamp']
        quotes = result['indicators']['quote'][0]
        
        history = []
        for i in range(len(timestamps)):
            if quotes['open'][i] is not None:
                history.append({
                    "time": datetime.fromtimestamp(timestamps[i]).strftime('%Y-%m-%d'),
                    "open": round(quotes['open'][i], 2),
                    "high": round(quotes['high'][i], 2),
                    "low": round(quotes['low'][i], 2),
                    "close": round(quotes['close'][i], 2),
                })
        return history
    except:
        return []

@app.get("/api/stock/{ticker}/news")
def get_stock_news(ticker: str):
    try:
        url = f"https://news.google.com/rss/search?q={ticker}+stock+India&hl=en-IN&gl=IN&ceid=IN:en"
        res = requests.get(url, headers={'User-Agent': random.choice(USER_AGENTS)}, timeout=10)
        root = ET.fromstring(res.content)
        items = []
        for item in root.findall('.//item')[:10]:
            items.append({"title": item.find('title').text, "publisher": item.find('source').text, "link": item.find('link').text, "providerPublishTime": int(time.time()), "thumbnail": None})
        return items
    except:
        return []

@app.get("/api/market/news")
def get_market_news():
    return get_stock_news("Indian stock market")

@app.get("/api/search/suggestions")
def get_suggestions(query: str = ""):
    q = query.upper()
    stocks = [{"symbol": "RELIANCE", "name": "Reliance"}, {"symbol": "TCS", "name": "TCS"}, {"symbol": "ZOMATO", "name": "Zomato"}, {"symbol": "IDFCFIRSTB", "name": "IDFC First Bank"}]
    return [s for s in stocks if q in s["symbol"] or q in s["name"].upper()]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
