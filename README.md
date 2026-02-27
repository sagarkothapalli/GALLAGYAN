# 💰 GallaGyan — Modern Indian Stock Market Dashboard

**GallaGyan** (formerly India Finance) is a high-performance, real-time stock analysis platform designed for the Indian market (NSE/BSE). It combines the wisdom of traditional Indian finance (*Galla* = Cash Box, *Gyan* = Knowledge) with cutting-edge tech.

🚀 **Live Demo:** [https://gallagyan.xyz](https://gallagyan.xyz)

---

## 🌟 Features Completed (MVP Speedrun)

### 1. 📈 Professional Market Data
- **Universal Search:** Search 5,000+ Indian stocks in real-time using `yahooquery`.
- **Market Pulse:** Live Nifty 50 and Sensex tracking with "Market Open" status.
- **Volume Spike Alert:** Real-time detection of unusual trading activity (>10M volume).

### 2. 🕯️ Advanced Technical Analysis
- **Multi-Timeframe Charts:** Switch between 1D, 1M, 1Y, and 5Y views.
- **Indicators:** Integrated SMA (20, 50), EMA (9, 21), and RSI (14) for deep trend analysis.
- **Sentiment Engine:** Keyword-based news analysis (Bullish/Bearish) and Analyst Recommendation bars.

### 3. 💼 Portfolio & Fundamentals
- **P&L Tracker:** Real-time calculation of total portfolio value and returns.
- **Deep Fundamentals:** Quarterly Revenue, Net Income, and EPS growth tables.
- **Corporate Actions:** Tracking Dividend history and Valuation metrics (P/B, Beta).

### 4. ⚡ Elite Performance & Security
- **Lite Theme:** Modern, ultra-fast light-mode UI.
- **Rate Limiting:** Protection against API abuse via `slowapi`.
- **Progressive Loading:** Instant price feedback with background data streaming.

---

## 🛠️ Current Status (Feb 2026)
- **Backend:** Optimized FastAPI on Render (Using `yahooquery`).
- **Frontend:** Next.js on Vercel with Progressive Hydration.
- **Domain:** [https://gallagyan.xyz](https://gallagyan.xyz) (Active).

---

## 🚀 Deployment & Local Setup

See the [PLAN.MD](./PLAN.MD) for full production deployment instructions on Render and Vercel.

### Prerequisites
- Node.js 18+
- Python 3.10+

### 1. Start the Backend
```bash
cd india-finance-app/backend
source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn main:app --reload
```
*Backend runs on: `http://localhost:8000`*

### 2. Start the Frontend
```bash
cd india-finance-app/frontend
npm install
npm run dev
```
*Frontend runs on: `http://localhost:3000`*

---

## 🔮 Future Roadmap (Phase 2)
- [ ] **Supabase Integration:** Cloud sync for Watchlist and User Accounts.
- [ ] **Portfolio Tracker:** Add "Buy Price" and "Quantity" to track real-time P&L.
- [ ] **Option Chain:** Add F&O data for Nifty/BankNifty.
- [ ] **CI/CD:** Automate deployments via GitHub Actions.

---

## 🛠️ Support & Contact
For support, feedback, or collaborations:
- **GitHub:** [kothapallianandsagar](https://github.com/kothapallianandsagar)
- **Email:** [contact@gallagyan.xyz](mailto:contact@gallagyan.xyz)

---

**© 2026 GallaGyan.** Built with precision and speed.

