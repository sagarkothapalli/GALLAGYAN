from yahooquery import Ticker
import json

def test_fundamentals():
    t = Ticker("RELIANCE.NS")
    
    print("INCOME STATEMENT")
    try:
        is_stmt = t.income_statement(frequency="q").tail(1).to_dict(orient="records")
        print(is_stmt)
    except Exception as e:
        print(f"Error IS: {e}")
    
    print("BALANCE SHEET")
    try:
        bs_stmt = t.balance_sheet(frequency="q").tail(1).to_dict(orient="records")
        print(bs_stmt)
    except Exception as e:
        print(f"Error BS: {e}")
    
    print("CASH FLOW")
    try:
        cf_stmt = t.cash_flow(frequency="q").tail(1).to_dict(orient="records")
        print(cf_stmt)
    except Exception as e:
        print(f"Error CF: {e}")

if __name__ == "__main__":
    test_fundamentals()
