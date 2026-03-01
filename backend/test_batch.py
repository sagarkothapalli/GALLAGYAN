from yahooquery import Ticker
import json
import time

NIFTY_50 = [
    "ADANIENT.NS", "ADANIPORTS.NS", "APOLLOHOSP.NS", "ASIANPAINT.NS", "AXISBANK.NS",
    "BAJAJ-AUTO.NS", "BAJFINANCE.NS", "BAJAJFINSV.NS", "BEL.NS", "BPCL.NS",
    "BHARTIARTL.NS", "BRITANNIA.NS", "CIPLA.NS", "COALINDIA.NS", "DRREDDY.NS",
    "EICHERMOT.NS", "GRASIM.NS", "HCLTECH.NS", "HDFCBANK.NS", "HDFCLIFE.NS",
    "HEROMOTOCO.NS", "HINDALCO.NS", "HINDUNILVR.NS", "ICICIBANK.NS", "ITC.NS",
    "INDUSINDBK.NS", "INFY.NS", "JSWSTEEL.NS", "KOTAKBANK.NS", "LT.NS",
    "M&M.NS", "MARUTI.NS", "NTPC.NS", "NESTLEIND.NS", "ONGC.NS",
    "POWERGRID.NS", "RELIANCE.NS", "SBILIFE.NS", "SBIN.NS", "SUNPHARMA.NS",
    "TCS.NS", "TATACONSUM.NS", "TATAMOTORS.NS", "TATASTEEL.NS", "TECHM.NS",
    "TITAN.NS", "ULTRACEMCO.NS", "WIPRO.NS"
]

def test_batch_fetch():
    print(f"Fetching data for {len(NIFTY_50)} stocks...")
    start = time.time()
    t = Ticker(NIFTY_50)
    prices = t.price
    end = time.time()
    
    print(f"Fetch took {end - start:.2f} seconds")
    
    advances = 0
    declines = 0
    for sym in NIFTY_50:
        p = prices.get(sym, {})
        if isinstance(p, dict):
            change = p.get('regularMarketChange', 0)
            if change > 0: advances += 1
            elif change < 0: declines += 1
            
    print(f"Advances: {advances}, Declines: {declines}, Unchanged: {len(NIFTY_50) - advances - declines}")

if __name__ == "__main__":
    test_batch_fetch()
