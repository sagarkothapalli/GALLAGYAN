/**
 * GallaGyan Next.js Middleware
 * ─────────────────────────────
 * - Protects authenticated routes (redirect to /login if no session)
 * - Adds security headers to all responses
 *
 * Note: This middleware runs at the edge for every matched request.
 * The access_token cookie is set as httpOnly by the backend, so we can
 * check for its presence (but not read its value) to gate routes.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const PROTECTED_PREFIXES = ['/dashboard', '/settings', '/profile'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Route Protection ──────────────────────────────────────────────────
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isProtected) {
    // Check for the access_token httpOnly cookie OR a localStorage-era fallback.
    // The cookie value itself is not readable in middleware when httpOnly,
    // but its *presence* is detectable via the cookie header.
    const hasAccessToken = request.cookies.has('access_token');

    if (!hasAccessToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ── Security Headers ──────────────────────────────────────────────────
  const response = NextResponse.next();

  // These supplement the headers in next.config.ts, providing an additional
  // enforcement layer at the edge for dynamic routes.
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  );

  return response;
}

// Match all routes except static assets and Next.js internals
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
