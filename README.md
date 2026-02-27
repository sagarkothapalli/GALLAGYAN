# 💰 GallaGyan — Modern Indian Stock Market Dashboard

**GallaGyan** (formerly India Finance) is a high-performance, real-time stock analysis platform designed for the Indian market (NSE/BSE). It combines the wisdom of traditional Indian finance (*Galla* = Cash Box, *Gyan* = Knowledge) with cutting-edge tech.

🚀 **Live Demo:** [https://gallagyan.xyz](https://gallagyan.xyz)

---

## 🌟 Features Completed (MVP Speedrun)

### 1. 📈 Real-Time Market Data
- **Universal Search:** Search 5,000+ Indian stocks in real-time using `yahooquery` global search.
- **Advanced Stats:** Correctly displays P/E Ratio, Market Cap (Cr), 52-Week High/Low.
- **Progressive Loading:** Prices load instantly, while history and news stream in the background.

### 2. 🕯️ Professional Visualization
- **Lite Theme:** Modern, clean light-mode UI for better readability.
- **Interactive Charts:** High-performance `lightweight-charts` with adaptive styling.

### 3. 🛡️ Security & Reliability
- **Rate Limiting:** Backend protection against abuse (via `slowapi`).
- **CORS & CSP:** Hardened headers for secure data transmission.
- **SSL Badge:** Visual trust confirmation for users.

### 4. ⚡ GallaGyan Lite & SEO
- **Optimized Performance:** Drastically reduced loading times via backend caching.
- **Contact:** Reach us at [contact@gallagyan.xyz](mailto:contact@gallagyan.xyz).

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

