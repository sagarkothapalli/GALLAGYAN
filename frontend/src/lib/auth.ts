/**
 * GallaGyan Auth Utilities
 * ─────────────────────────
 * Handles authentication state, input sanitization, and secure token management.
 *
 * Security notes:
 * - Tokens are stored in httpOnly cookies by the backend (primary secure method).
 * - localStorage is used as a progressive-migration fallback for the access_token
 *   and non-sensitive user display data only.
 * - Never store passwords, refresh tokens, or PII in localStorage.
 */

// ── Input Sanitization ──────────────────────────────────────────────────

/**
 * Strip HTML tags and dangerous characters from a string.
 * Prevents XSS when user input is reflected in the DOM.
 */
export function sanitizeInput(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate a username: alphanumeric + underscore/dot/hyphen, 3-30 chars.
 */
export function isValidUsername(str: string): boolean {
  return /^[a-zA-Z0-9_.\-]{3,30}$/.test(str);
}

/**
 * Validate password meets minimum length requirement.
 */
export function isValidPassword(str: string): boolean {
  return str.length >= 8;
}

// ── Token Management (localStorage fallback) ────────────────────────────

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

/**
 * Read the access token from localStorage.
 * Note: The httpOnly cookie is the primary auth mechanism and is sent
 * automatically by the browser. This is for backwards-compatible API calls
 * that use the Authorization header.
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Store an access token in localStorage (fallback for existing code).
 */
export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // Storage full or blocked — fail silently, cookie auth still works.
  }
}

/**
 * Remove all auth data from localStorage.
 * Does NOT clear httpOnly cookies — call the /api/auth/logout endpoint for that.
 */
export function clearAuth(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    // Fail silently
  }
}

/**
 * Safely parse the stored user object from localStorage.
 * Only non-sensitive display data (username, role) should be stored here.
 */
export function getStoredUser(): { username: string } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.username === 'string') {
      return { username: parsed.username };
    }
    return null;
  } catch {
    // Corrupted data — clear it
    try { localStorage.removeItem(USER_KEY); } catch { /* noop */ }
    return null;
  }
}

/**
 * Store only non-sensitive user display data in localStorage.
 */
export function setStoredUser(user: { username: string }): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(USER_KEY, JSON.stringify({ username: user.username }));
  } catch {
    // Fail silently
  }
}

// ── API Helpers ──────────────────────────────────────────────────────────

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || 'https://gallagyan.onrender.com';
}

/**
 * Attempt to refresh the access token via the httpOnly refresh cookie.
 * Returns the new access_token string on success, or null on failure.
 */
export async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include', // sends httpOnly cookies
    });
    if (res.ok) {
      const data = await res.json();
      if (data.access_token) {
        setAuthToken(data.access_token);
        return data.access_token;
      }
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Call the backend logout endpoint to clear httpOnly cookies and revoke refresh token,
 * then clear localStorage.
 */
export async function logout(): Promise<void> {
  try {
    const token = getAuthToken();
    await fetch(`${getBaseUrl()}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
  } catch {
    // Best effort — clear local state regardless
  }
  clearAuth();
}

/**
 * Make an authenticated fetch call. If the response is 401, attempt a token
 * refresh and retry once. This provides transparent token rotation.
 */
export async function authFetch(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // always send cookies
  });

  // If 401, try refreshing and retry once
  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      res = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });
    }
  }

  return res;
}
