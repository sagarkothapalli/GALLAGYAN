# 🚀 GallaGyan Deployment Plan (GALLAGYAN.XYZ)

This document outlines the steps to deploy the GallaGyan platform using free-tier services.

---

## 🏗️ 1. Backend Deployment (Render - Free Tier)

**Service Type:** Python Web Service

1. **Dashboard:** Go to [Render.com](https://render.com/).
2. **Action:** Click `New +` -> `Web Service`.
3. **Repository:** Connect `https://github.com/sagarkothapalli/GALLAGYAN.git`.
4. **Configuration:**
   - **Name:** `gallagyan-backend`
   - **Root Directory:** `india-finance-app/backend`
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. **Outcome:** Once deployed, copy your backend URL (e.g., `https://gallagyan-backend.onrender.com`).

---

## 🎨 2. Frontend Deployment (Vercel - Free Tier)

**Framework:** Next.js (App Router)

1. **Dashboard:** Go to [Vercel.com](https://vercel.com/).
2. **Action:** Click `Add New` -> `Project`.
3. **Repository:** Import `GALLAGYAN`.
4. **Configuration:**
   - **Framework Preset:** `Next.js`
   - **Root Directory:** `india-finance-app/frontend`
   - **Environment Variables:**
     - **Key:** `NEXT_PUBLIC_API_URL`
     - **Value:** `[YOUR_RENDER_BACKEND_URL]` (Paste the URL from Step 1)
5. **Action:** Click `Deploy`.

---

## 🌐 3. Domain Configuration (GALLAGYAN.XYZ)

1. **Vercel Settings:** Go to your Project -> `Settings` -> `Domains`.
2. **Add Domain:** Enter `gallagyan.xyz`.
3. **DNS Update:** 
   - Login to your domain registrar (e.g., Hostinger, GoDaddy).
   - Update the **Nameservers** or **DNS Records (A/CNAME)** as instructed by Vercel.
4. **SSL:** Vercel will automatically generate a free SSL certificate once DNS propagates.

---

## 🛠️ 4. Post-Deployment Verification

- [ ] Check if `https://gallagyan.xyz` loads the frontend.
- [ ] Search for a stock (e.g., `RELIANCE`) to verify frontend-to-backend communication.
- [ ] Verify that charts and news are loading correctly.

---

**© 2026 GallaGyan.** Prepared for deployment.
