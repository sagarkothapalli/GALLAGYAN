# GallaGyan Security Audit Report

**Date:** 2026-03-02
**Auditor:** Security Hardening Automated Review
**Scope:** Full-stack security audit of GallaGyan Indian stock market web app
**Stack:** Next.js 16 (TypeScript) frontend + FastAPI (Python) backend

---

## Executive Summary

A comprehensive security audit was performed on the GallaGyan web application. **14 vulnerabilities** were identified across authentication, API security, frontend security, and data protection domains. All critical and high-severity issues have been remediated. The application now implements defense-in-depth across the full stack.

---

## Findings & Remediation

### CRITICAL Severity

#### 1. Hardcoded Default Password in Source Code
- **Location:** `/backend/models.py` line 38 (original)
- **Issue:** Default user password `"anand"` was hardcoded in `init_db()`, committed to version control.
- **Attack Scenario:** Anyone with access to the repository (public or leaked) could authenticate as the default user.
- **Fix:** Password now loaded from `DEFAULT_USER_PASSCODE` environment variable. The `init_db()` function skips user creation if the env var is not set. Minimum length of 8 characters enforced.
- **Status:** FIXED

#### 2. JWT Token Stored in localStorage (XSS-Accessible)
- **Location:** `/frontend/src/app/login/page.tsx` line 39-40 (original)
- **Issue:** Access token stored in `localStorage`, which is readable by any JavaScript executing on the page. A single XSS vulnerability would expose the token.
- **Attack Scenario:** Attacker injects malicious script via XSS -> reads `localStorage.getItem('token')` -> impersonates the user.
- **Fix:** Backend now sets `httpOnly` cookies with `Secure` and `SameSite=Lax` flags alongside the response body token. Frontend sends `credentials: 'include'` on all auth requests. localStorage token retained as progressive-migration fallback but cookies are the primary auth mechanism.
- **Status:** FIXED (progressive migration)

#### 3. Access Token Expiry Set to 7 Days
- **Location:** `/backend/auth.py` line 24 (original)
- **Issue:** `ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7` (10,080 minutes). A stolen token remains valid for an entire week.
- **Attack Scenario:** Token stolen via XSS or log leak -> attacker has week-long access.
- **Fix:** Access token expiry reduced to **30 minutes**. Refresh token system implemented with 7-day expiry and automatic rotation.
- **Status:** FIXED

---

### HIGH Severity

#### 4. No Refresh Token System
- **Location:** `/backend/auth.py` (original)
- **Issue:** No refresh tokens existed. The long-lived access token was the only auth mechanism.
- **Fix:** Full refresh token rotation implemented:
  - `RefreshToken` database model stores SHA-256 hashed tokens with expiry and revocation status.
  - `/api/auth/refresh` endpoint issues new access + refresh tokens, revokes the old refresh token.
  - Stolen/replayed refresh token detection: if a revoked token is reused, ALL tokens for that user are revoked.
  - Refresh token cookie scoped to `/api/auth` path only.
- **Status:** FIXED

#### 5. No Brute Force Protection on Login
- **Location:** `/backend/auth.py` `/login` endpoint (original)
- **Issue:** No rate limiting on the login endpoint. Unlimited password guessing attacks possible.
- **Attack Scenario:** Attacker scripts thousands of login attempts per minute to brute-force passwords.
- **Fix:** In-memory rate limiter tracking failed attempts per IP. Maximum 5 failed attempts per IP per 15-minute window. Returns HTTP 429 when exceeded. Note: for multi-process deployments, this should be migrated to Redis.
- **Status:** FIXED

#### 6. No Token Validation for Issuer/Type Claims
- **Location:** `/backend/auth.py` `get_current_user()` (original)
- **Issue:** JWT validation only checked signature and expiry, not issuer or token type. A refresh token could potentially be used as an access token.
- **Fix:** Access tokens now include `"type": "access"` and `"iss": "gallagyan"` claims. `decode_access_token()` validates both fields. Refresh tokens are opaque random strings (not JWTs), making cross-use impossible.
- **Status:** FIXED

#### 7. No Logout Endpoint / Token Revocation
- **Location:** `/backend/auth.py` (original)
- **Issue:** No server-side logout. Tokens remained valid until expiry even after user "logged out" on the frontend.
- **Fix:** `/api/auth/logout` endpoint revokes the refresh token in the database, clears httpOnly cookies. Frontend `logout()` function calls this endpoint before clearing localStorage.
- **Status:** FIXED

---

### MEDIUM Severity

#### 8. Duplicate CORS Configuration
- **Location:** `/backend/main.py` lines 34-36 (original)
- **Issue:** CORS origins were parsed both in `main.py` and `security.py`, creating a maintenance risk where they could diverge.
- **Fix:** `main.py` now imports `ALLOWED_ORIGINS` from `security.py` as the single source of truth.
- **Status:** FIXED

#### 9. Login Error Messages Could Aid User Enumeration
- **Location:** `/backend/auth.py` `/login` endpoint (original)
- **Issue:** While the original code did use a generic "Invalid credentials" message, the error logging included the username, and exception handling could leak timing differences.
- **Fix:** Verified all auth error paths return identical `"Invalid credentials"` messages. Error logging now uses `type(e).__name__` instead of full error messages that might contain usernames. Failed attempts are always recorded regardless of whether the user exists.
- **Status:** FIXED

#### 10. Frontend Uses alert() for Error Display
- **Location:** `/frontend/src/app/login/page.tsx` lines 45-48 (original)
- **Issue:** `alert()` blocks the UI thread and can be abused for social engineering. Not a direct vulnerability but poor security UX.
- **Fix:** Replaced with inline error message display using a styled error banner in the login form. Error text is sanitized via `sanitizeInput()` before rendering.
- **Status:** FIXED

#### 11. No Client-Side Input Validation
- **Location:** `/frontend/src/app/login/page.tsx` (original)
- **Issue:** No validation of username format before sending to the backend. Malformed input wastes server resources.
- **Fix:** Client-side validation added: username checked against `isValidUsername()` (alphanumeric + underscore, 3-30 chars). Backend Pydantic models also validate with `@field_validator`.
- **Status:** FIXED

#### 12. Bcrypt Cost Factor Not Explicitly Set
- **Location:** `/backend/auth.py` line 27 (original)
- **Issue:** `BcryptHasher()` used default cost factor (may vary by library version). Best practice is explicit cost factor >= 12.
- **Fix:** Changed to `BcryptHasher(rounds=12)` for explicit cost factor.
- **Status:** FIXED

---

### LOW Severity

#### 13. Missing Permissions-Policy Header (Original next.config.ts)
- **Location:** `/frontend/next.config.ts` (original from first audit)
- **Issue:** Permissions-Policy header was missing, allowing browser features like camera/microphone/geolocation.
- **Fix:** Added `Permissions-Policy: camera=(), microphone=(), geolocation=()`.
- **Status:** FIXED

#### 14. No Route Protection Middleware
- **Location:** Frontend (none existed)
- **Issue:** No server-side route protection. Protected pages were only guarded by client-side JavaScript checks.
- **Fix:** Created `/frontend/src/middleware.ts` that checks for `access_token` cookie presence on protected route prefixes (`/dashboard`, `/settings`, `/profile`) and redirects to `/login` if absent. Also reinforces security headers at the edge layer.
- **Status:** FIXED

---

## Security Architecture Summary (Post-Hardening)

### Authentication Flow
```
1. User submits credentials -> POST /api/auth/login
2. Backend validates (rate-limited: 5 attempts / 15 min / IP)
3. On success:
   a. Creates 30-min access token (JWT with iss, type, sub, exp, iat)
   b. Creates 7-day refresh token (random, stored as SHA-256 hash in DB)
   c. Sets httpOnly cookies: access_token (path=/) + refresh_token (path=/api/auth)
   d. Returns access_token in body (localStorage fallback)
4. Authenticated requests:
   a. Browser sends httpOnly cookie automatically
   b. Frontend also sends Authorization: Bearer header (backwards compat)
   c. Backend checks cookie first, then header
5. Token refresh:
   a. On 401 response, frontend calls POST /api/auth/refresh
   b. Backend validates refresh cookie, revokes old, issues new pair
   c. If revoked token reused -> ALL user tokens revoked (theft detection)
6. Logout:
   a. POST /api/auth/logout revokes refresh token, clears cookies
   b. Frontend clears localStorage
```

### Security Headers (All Routes)
| Header | Value |
|--------|-------|
| X-Frame-Options | DENY |
| X-Content-Type-Options | nosniff |
| Strict-Transport-Security | max-age=31536000; includeSubDomains |
| Referrer-Policy | strict-origin-when-cross-origin |
| Permissions-Policy | camera=(), microphone=(), geolocation=() |
| Content-Security-Policy | default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' http://localhost:8000 https:; |
| X-XSS-Protection | 1; mode=block |
| X-DNS-Prefetch-Control | on |

### Input Validation Layers
1. **Frontend:** `isValidUsername()`, `isValidPassword()`, `sanitizeInput()`
2. **Backend Pydantic:** `LoginRequest` with `@field_validator`, `Field(min_length, max_length)`
3. **Backend Security Module:** `sanitize_username()`, `sanitize_html()`, `validate_password_strength()`
4. **Ticker Validation:** Regex whitelist `^[A-Z0-9.\-&]{1,20}$` applied to all stock endpoints

---

## Requires Manual Action

These items cannot be automated and must be handled by the deployment team:

1. **Set real JWT_SECRET_KEY in production `.env`**
   ```bash
   python -c "import secrets; print(secrets.token_hex(32))"
   ```
   Must be at least 32 characters. Rotate periodically.

2. **Set DEFAULT_USER_PASSCODE in `.env`** (min 8 characters, with complexity)
   This is only used on first database initialization. Change the default user's password after first login.

3. **Set ENVIRONMENT=production in `.env`** to enable `Secure` flag on cookies (requires HTTPS).

4. **Set COOKIE_DOMAIN in `.env`** if running across subdomains (e.g., `.gallagyan.xyz`).

5. **Ensure .env is in .gitignore** and never committed to version control.

6. **For multi-process deployments:** Migrate the in-memory brute-force rate limiter to Redis or a shared store. The current dict-based approach only works within a single process.

7. **Run dependency audit periodically:**
   ```bash
   pip install pip-audit && pip-audit -r requirements.txt
   ```

8. **CSP Tightening:** The current CSP allows `'unsafe-eval'` and `'unsafe-inline'` for script-src due to Next.js requirements. When possible, migrate to nonce-based CSP for stricter protection.

9. **Remove localStorage token fallback** once all clients have migrated to cookie-based auth (estimated: after one full refresh token cycle of 7 days).

10. **Database encryption:** The SQLite database `gallagyan.db` stores password hashes (bcrypt, safe) and refresh token hashes (SHA-256, safe). However, user data (watchlists, portfolios) is stored as plaintext JSON. Consider encryption at rest for production.

---

## Files Modified

| File | Changes |
|------|---------|
| `/backend/auth.py` | Complete rewrite: httpOnly cookies, refresh token rotation, brute force rate limiting, generic errors, bcrypt cost 12, Pydantic validation |
| `/backend/security.py` | NEW: JWT config, token generation/validation, password strength validation, input sanitization, cookie settings |
| `/backend/models.py` | Added RefreshToken model, removed hardcoded password, env-based default user creation |
| `/backend/main.py` | CORS config imported from security.py (single source of truth) |
| `/backend/.env.example` | Added ENVIRONMENT, COOKIE_DOMAIN documentation |
| `/frontend/next.config.ts` | Added Permissions-Policy, X-Frame-Options: DENY, strengthened Referrer-Policy |
| `/frontend/src/lib/auth.ts` | NEW: Input sanitization, token management, authFetch with auto-refresh, logout |
| `/frontend/src/middleware.ts` | NEW: Route protection, security header enforcement |
| `/frontend/src/app/login/page.tsx` | credentials: include, client-side validation, inline errors (no alert()), auth utility usage |
| `/frontend/src/app/page.tsx` | Uses authFetch(), getStoredUser(), proper logout with cookie clearing |

---

---

## Security Hardening Pass 2 -- March 2026

**Date:** 2026-03-03
**Auditor:** Security Guy (Automated + Manual Review)

### Findings and Fixes

#### [HIGH] No Rate Limiting on Stock Data Endpoints
- **Location:** `/backend/main.py` -- all `/api/stock/*`, `/api/market/bootstrap`, `/api/search/suggestions` routes
- **Issue:** Stock data endpoints had no rate limiting. An attacker or scraper could flood these endpoints with thousands of requests per minute, causing upstream API exhaustion (Yahoo Finance) and potential service denial.
- **Attack Scenario:** Automated scraper hammers `/api/stock/{ticker}` at high volume, exhausting Yahoo Finance API quotas and degrading service for all users.
- **Fix:** Added `@limiter.limit("30/minute")` decorator to all stock-fetching endpoints: `get_market_bootstrap`, `get_suggestions`, `get_stock`, `get_history`, `get_peers`, `get_news`. Each endpoint now accepts `Request` as first parameter for IP-based rate limiting via slowapi.
- **Status:** FIXED

#### [HIGH] No Global Exception Handler -- Stack Trace Leakage
- **Location:** `/backend/main.py`
- **Issue:** Unhandled exceptions in any route could return Python stack traces to the client, leaking internal paths, library versions, and code structure to attackers.
- **Attack Scenario:** Attacker sends malformed request triggering an unhandled exception. FastAPI default error response includes full traceback with file paths and line numbers.
- **Fix:** Added `@app.exception_handler(Exception)` catch-all handler that logs the full error server-side (`exc_info=True`) but returns only `{"detail": "Internal server error"}` to the client.
- **Status:** FIXED

#### [MEDIUM] Health Endpoint Missing Timestamp
- **Location:** `/backend/main.py` `/api/health`
- **Issue:** Health endpoint returned `"hyper-optimized"` status string with no timestamp, making it useless for monitoring tools that check freshness.
- **Fix:** Endpoint now returns `{"status": "ok", "timestamp": "<ISO8601>", "cache_last_updated": ...}`.
- **Status:** FIXED

#### [MEDIUM] No Input Validation on History Endpoint Query Parameters
- **Location:** `/backend/main.py` `get_history()` -- `period` and `interval` params
- **Issue:** The `period` and `interval` query parameters were passed directly to `yahooquery.Ticker.history()` without validation. Arbitrary strings could be injected.
- **Fix:** Added allowlist validation with `VALID_PERIODS` and `VALID_INTERVALS` sets. Invalid values return HTTP 400.
- **Status:** FIXED

#### [MEDIUM] CSP connect-src Overly Broad
- **Location:** `/frontend/next.config.ts` -- Content-Security-Policy header
- **Issue:** CSP `connect-src` included `https:` which allows connections to any HTTPS origin. This defeats the purpose of CSP for data exfiltration prevention.
- **Fix:** Replaced broad `https:` with explicit `https://gallagyan.onrender.com` (the production backend). Also added `frame-ancestors 'none'` to CSP for defense-in-depth against clickjacking alongside X-Frame-Options.
- **Status:** FIXED

#### [INFO] CORS Configuration -- Verified Secure
- **Location:** `/backend/security.py` line 41-45
- **Status:** ALREADY SECURE -- Default allowlist is `https://gallagyan.xyz,https://www.gallagyan.xyz,http://localhost:3000,http://localhost:3001`. Environment variable override supported. No wildcard.

#### [INFO] Frontend Security Headers -- Verified Complete
- **Location:** `/frontend/next.config.ts` + `/frontend/src/middleware.ts`
- **Status:** ALREADY SECURE -- All required headers present: X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Strict-Transport-Security, Content-Security-Policy, Permissions-Policy, Referrer-Policy, X-XSS-Protection, X-DNS-Prefetch-Control. Middleware provides edge-layer reinforcement.

#### [INFO] dangerouslySetInnerHTML Usage -- Verified Safe
- **Locations:**
  - `/frontend/src/app/layout.tsx` lines 85, 101, 118
  - `/frontend/src/components/learn/ArticlePage.tsx` line 43
- **Status:** SAFE -- All usages inject hardcoded JSON-LD structured data via `JSON.stringify()` on static schema objects. No user-controlled input flows into `dangerouslySetInnerHTML`. No XSS risk.

#### [INFO] npm audit Results
- 7 moderate-severity vulnerabilities, all in `prismjs` dependency chain via `next-sanity`.
- No high or critical vulnerabilities found.
- Recommendation: Update `next-sanity` when a compatible version is available that resolves the prismjs DOM clobbering issue (GHSA-x7hr-w5r2-h6wg).

### Files Modified in Pass 2

| File | Changes |
|------|---------|
| `/backend/main.py` | Added global exception handler, rate limiting on all stock endpoints, health endpoint timestamp, period/interval input validation, JSONResponse import |
| `/frontend/next.config.ts` | Tightened CSP connect-src from `https:` to explicit backend URL, added `frame-ancestors 'none'` |
| `/SECURITY_AUDIT.md` | Added Pass 2 findings and fixes |

---

## Remaining Recommendations

1. **Add CSRF tokens** for state-changing POST requests if SameSite cookie policy is relaxed.
2. **Implement account lockout** after N failed attempts (in addition to IP-based rate limiting).
3. **Add security event logging** (failed logins, token revocations, suspicious activity) to a centralized log aggregator.
4. **Enable WAF** (Web Application Firewall) at the CDN/reverse proxy level.
5. **Penetration test** the application annually or after significant changes.
6. **Add Subresource Integrity (SRI)** for any third-party scripts or styles.
7. **Consider adding HSTS preload** by submitting the domain to the HSTS preload list.
