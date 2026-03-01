from yahooquery import Ticker
import json

def test_profile():
    symbol = "RELIANCE.NS"
    t = Ticker(symbol)
    print(f"Testing Profile for {symbol}")
    
    try:
        profile = t.summary_profile.get(symbol, {})
        print(json.dumps(profile, indent=2))
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_profile()
