from yahooquery import Ticker
import json

def test_shareholding():
    symbol = "RELIANCE.NS"
    t = Ticker(symbol)
    print(f"Testing Shareholding for {symbol}")
    
    print("MAJOR HOLDERS")
    try:
        holders = t.major_holders
        print(holders)
    except Exception as e:
        print(f"Error Holders: {e}")
        
    print("INSTITUTION OWNERSHIP")
    try:
        inst = t.institution_ownership
        print(inst)
    except Exception as e:
        print(f"Error Inst: {e}")

if __name__ == "__main__":
    test_shareholding()
