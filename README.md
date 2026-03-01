# 💰 GallaGyan — Modern Indian Stock Market Dashboard

**GallaGyan** (formerly India Finance) is a high-performance, real-time stock analysis platform designed for the Indian market (NSE/BSE). It combines the wisdom of traditional Indian finance (*Galla* = Cash Box, *Gyan* = Knowledge) with cutting-edge tech.

🚀 **Live Demo:** [https://gallagyan.xyz](https://gallagyan.xyz)

---

## 🌟 Features Completed (MVP Speedrun)

### 1. 📈 Professional Market Data
- **Universal Search:** Search 5,000+ Indian stocks in real-time using `yahooquery`.
- **Market Pulse:** Live Nifty 50 and Sensex tracking with Advance/Decline breadth.
- **Volume Spike Alert:** Real-time detection of unusual trading activity (>10M volume).

### 2. 🕯️ Advanced Technical Analysis
- **Comparison Tool:** Overlay multiple stocks on a single chart for relative performance.
- **Indicators:** Integrated SMA, EMA, RSI, and MACD for professional-grade analysis.
- **Data Export:** Instant CSV downloads for historical prices and fundamentals.

### 3. 💼 Portfolio & Fundamentals
- **P&L Tracker:** Real-time calculation of total portfolio value and returns.
- **Corporate Calendar:** Tracking upcoming Earnings dates and estimates.
- **Ownership Pattern:** Visual breakdown of Promoter and Institutional holdings.

### 4. ⚡ Elite Performance & Security
- **Theme Engine:** Fully adaptive Light/Dark mode with persistent storage.
- **Security Hardening:** Rate limiting and locked-down CORS/CSP headers.

---

## 🛠️ Current Status (March 2026)
- **Backend:** Optimized FastAPI on Render (Python 3.13, `pwdlib`, `yahooquery`).
- **Frontend:** Next.js 16 on Vercel with TailwindCSS 4.
- **Domain:** [https://gallagyan.xyz](https://gallagyan.xyz) (Active).
- **Security:** Unified JWT Authentication & Bcrypt hashing.

---

## 🚀 Deployment & Local Setup

See the [PLAN.MD](./PLAN.MD) for full production deployment instructions on Render and Vercel.

### Prerequisites
- Node.js 20+
- Python 3.13+

### ⚠️ Production Note (Render Free Tier)
The backend currently uses an **ephemeral SQLite database** (`gallagyan.db`). 
- **Persistence:** Data (portfolios/watchlists) will be **reset** whenever the Render service restarts or redeploys.
- **Solution:** For permanent storage, connect a Render Postgres instance and update `models.py` to use `PostgresqlDatabase`.

### 1. Start the Backend
```bash
cd india-finance-app/backend
source venv/bin/activate
pip install -r requirements.txt
python main.py
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

## 🔮 Future Roadmap (Phase 2 & 3)
- [x] **Unified Auth:** Secure login for personal data sync.
- [x] **Portfolio Tracker:** Real-time P&L calculation.
- [x] **Market Engine:** Hyper-optimized background refresh.
- [ ] **Persistent Database:** Migrate from SQLite to Postgres for cloud sync.
- [ ] **Option Chain:** Add F&O data for Nifty/BankNifty.
- [ ] **CI/CD:** Automate deployments via GitHub Actions.

---

## 🛠️ Support & Contact
For support, feedback, or collaborations:
- **GitHub:** [kothapallianandsagar](https://github.com/kothapallianandsagar)
- **Email:** [contact@gallagyan.xyz](mailto:contact@gallagyan.xyz)

---

**© 2026 GallaGyan.** Built with precision and speed.

