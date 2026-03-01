from yahooquery import Ticker
import json

def test_yahooquery():
    symbols = ["RELIANCE.NS", "TCS.NS", "ZOMATO.NS"]
    t = Ticker(symbols)
    
    # Get price data
    price = t.price
    print("Price keys:", price.get("RELIANCE.NS", {}).keys())
    
    # Get summary detail
    summary = t.summary_detail
    print("Summary keys:", summary.get("RELIANCE.NS", {}).keys())
    
    # Get history
    history = t.history(period="1mo", interval="1d")
    print("History tail:", history.tail())

if __name__ == "__main__":
    test_yahooquery()
