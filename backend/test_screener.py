from yahooquery import Screener
import json

def test_screener():
    s = Screener()
    print("Testing NSE Gainers Screener...")
    try:
        # 'day_gainers' is a common predefined screener
        data = s.get_screeners('day_gainers', count=5)
        # Filter for .NS or .BO symbols
        gainers = data.get('day_gainers', {}).get('quotes', [])
        indian_gainers = [q for q in gainers if q.get('symbol', '').endswith('.NS')][:5]
        print(json.dumps(indian_gainers, indent=2))
    except Exception as e:
        print(f"Screener Error: {e}")

if __name__ == "__main__":
    test_screener()
