from yahooquery import Ticker
import json

def test_options():
    symbol = "RELIANCE.NS"
    t = Ticker(symbol)
    print(f"Testing Options for {symbol}")
    try:
        expirations = t.option_expiration_dates
        print(f"Expirations: {expirations}")
        
        if expirations:
            chain = t.option_chain
            print("Option Chain Data (Top 5 rows):")
            print(chain.head())
    except Exception as e:
        print(f"Error fetching options: {e}")

if __name__ == "__main__":
    test_options()
