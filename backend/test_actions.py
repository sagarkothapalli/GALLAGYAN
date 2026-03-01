from yahooquery import Ticker
import json

def test_corporate_actions():
    symbol = "RELIANCE.NS"
    t = Ticker(symbol)
    print(f"Testing Corporate Actions for {symbol}")
    
    print("KEY STATISTICS")
    try:
        stats = t.key_stats.get(symbol, {})
        if isinstance(stats, dict):
            print(list(stats.keys()))
    except Exception as e:
        print(f"Stats Error: {e}")

    print("DIVIDENDS")
    try:
        divs = t.dividend_history(period="5y")
        print(divs.tail())
    except Exception as e:
        print(f"Dividend Error: {e}")

if __name__ == "__main__":
    test_corporate_actions()
