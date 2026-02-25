# 💰 GallaGyan — Modern Indian Stock Market Dashboard

**GallaGyan** (formerly India Finance) is a high-performance, real-time stock analysis platform designed for the Indian market (NSE/BSE). It combines the wisdom of traditional Marwari finance (*Galla* = Cash Box, *Gyan* = Knowledge) with cutting-edge tech.

🚀 **Live Demo:** [Running Locally on http://localhost:3000](http://localhost:3000)

---

## 🌟 Features Completed (MVP Speedrun)

### 1. 📈 Real-Time Market Data
- **Live Prices:** Fetches real-time data for 5,000+ NSE/BSE stocks.
- **Advanced Stats:** Displays P/E Ratio, Market Cap (Cr), 52-Week High/Low, and Volume.
- **Smart Ticker Search:** Handles spaces and exchange suffixes (`.NS`).
- **Live Refresh:** Automatic polling system refreshes prices and news every 30 seconds without page reloads.

### 2. 🕯️ Interactive Charts
- **TradingView Style:** Integrated `lightweight-charts` for smooth candlestick visualization.
- **Dynamic Titles:** Browser tab titles now update dynamically with live stock prices for better UX and SEO.

### 3. 📰 Intelligent News Feed
- **"Danger" Detection:** Highlights news containing "Scam", "Fraud", or "Crash" in **RED**.
- **Constant Updates:** News feed stays fresh with background polling.

### 4. 🚀 SEO & Discovery (Elite Level)
- **JSON-LD Structured Data:** Optimized with Organization, FinancialService, and SearchAction schemas for Google Rich Snippets.
- **Meta Optimization:** Comprehensive OpenGraph, Twitter Card, and Keyword-rich metadata for finance-specific ranking.
- **Market Intelligence Section:** A dedicated, semantic-rich section to boost crawler indexing for Indian market queries.

### 5. 🛡️ Security & Infrastructure
- **SSH Deployment Keys:** Generated secure Ed25519 SSH keys for safe server communication.
- **Security Headers:** Hardened Next.js with HSTS, CSP, and XSS protection headers.
- **SEBI Disclaimer:** Clear educational purpose disclosures.

---

## 🚀 How to Run Locally

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
- [ ] **Deployment:** Setup on Hetzner or DigitalOcean using the generated SSH keys.
- [ ] **Supabase Integration:** Cloud sync for Watchlist and User Accounts.
- [ ] **Portfolio Tracker:** Add "Buy Price" and "Quantity" to track real-time P&L.
- [ ] **Option Chain:** Add F&O data for Nifty/BankNifty.
- [ ] **CI/CD:** Automate deployments via GitHub Actions.

---

## 🛠️ Support & Contact
For support, feedback, or collaborations:
- **GitHub:** [kothapallianandsagar](https://github.com/kothapallianandsagar)
- **Email:** [kothapallianandsagar@gmail.com](mailto:kothapallianandsagar@gmail.com)

---

**© 2026 GallaGyan.** Built with precision and speed.

