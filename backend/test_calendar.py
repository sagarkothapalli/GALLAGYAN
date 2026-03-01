from yahooquery import Ticker
import json

def test_calendar():
    symbol = "RELIANCE.NS"
    t = Ticker(symbol)
    print(f"Testing Calendar for {symbol}")
    
    print("CALENDAR")
    try:
        cal = t.calendar_events
        print(json.dumps(cal, indent=2, default=str))
    except Exception as e:
        print(f"Error Calendar: {e}")

if __name__ == "__main__":
    test_calendar()
