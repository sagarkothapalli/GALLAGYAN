from yahooquery import Ticker
import json

def test_recommendations():
    symbol = "RELIANCE.NS"
    t = Ticker(symbol)
    print(f"Testing Recommendations for {symbol}")
    
    print("RECOMMENDATION TRENDS")
    try:
        trends = t.recommendation_trend
        print(trends)
    except Exception as e:
        print(f"Error Trends: {e}")
        
    print("RECOMMENDATIONS")
    try:
        recs = t.recommendations
        print(recs)
    except Exception as e:
        print(f"Error Recs: {e}")

if __name__ == "__main__":
    test_recommendations()
