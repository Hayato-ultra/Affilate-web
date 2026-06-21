# Affiliate Engine — Upgrades Tracker

> Started: 2026-05-28

---

## 1. Dead Dependency Cleanup

| Task | Status |
|---|---|
| Remove `got` from package.json | ✅ |

## 2. Security

| Task | Status |
|---|---|
| Fix CORS to lock to specific origins in production | ✅ |
| Add rate limiting on auth routes (10/min register, 20/min login) | ✅ |
| Add env var validation at startup | ✅ |

## 3. Email Alert Delivery

| Task | Status |
|---|---|
| Add `resend` package | ✅ |
| Implement `sendAlert()` with HTML email template | ✅ |
| Update .env.example with RESEND_API_KEY | ✅ |

## 4. Database & Caching

| Task | Status |
|---|---|
| Versioned DB migration framework (`src/db/migrations/`) | ✅ |
| Search cache key includes `sort_by` and `merchant` | ✅ |

## 5. Frontend Improvements

| Task | Status |
|---|---|
| ErrorBoundary component with retry button | ✅ |
| SEO meta tags (react-helmet-async) on all pages | ✅ |
| PWA support (service worker + manifest.json) | ✅ |
| Image optimization (srcset + sizes on ProductCard) | ✅ |
| Loading skeleton components | ✅ |

## 6. Testing

| Task | Status |
|---|---|
| Cache key with sort/filter test | ✅ |
| Identifier matching test (UPC/EAN/ASIN) | ✅ |
| Cloak round-trip test | ✅ |
| Fuzzy/no-match tests | ✅ |
| Env validation test | ✅ |
| ASIN extraction test | ✅ |
| Total: 48 tests, all passing | ✅ |

## 7. Dependency Upgrades

| Package | From | To |
|---|---|---|
| TypeScript | 5.3.3 | 5.7.3 |
| Vitest | 1.1.0 | 4.1.7 |
| pino | 8.17.0 | 10.3.1 |
| pino-pretty | 10.3.0 | 13.1.3 |
| tsx | 4.7.0 | 4.22.3 |
| @types/node | 20.10.0 | 22.15.0 |
| bullmq | 5.7.0 | 5.77.3 |
| express | 4.18.2 | 4.21.0 |
| react | 18.2.0 | 18.3.1 |
| react-dom | 18.2.0 | 18.3.1 |
| vite | 5.0.8 | 5.4.19 |
| @vitejs/plugin-react | 4.2.1 | 4.4.1 |
| playwright | 1.40.0 | 1.40.0 (unchanged) |
| react-router-dom | 6.21.0 | 6.30.0 |

## 8. Pentest Remediation (2026-05-30)

| ID | Severity | Finding | Fix |
|---|---|---|---|
| C1 | 🔴 Critical | Live Resend API key in `.env.example` | Replaced with placeholder `re_xxxxxxxxxxxxx` |
| C2 | 🔴 Critical | SSRF — unrestricted URL fetching in fetchHtml/scrapeUrl | Added `validateUrl()` in `src/utils/ssrf.ts` blocking private IPs, loopback, internal hostnames, non-http(s) protocols. Applied to `scrape.ts`, `process-url` route, admin scrape route |
| C3 | 🔴 Critical | XSS — blacklist `sanitizeHtml()` easily bypassed | Replaced with full HTML entity encoding (`sanitizeString` approach). `sanitize.ts` middleware now uses `sanitizeHtml()` consistently for all fields |
| C4 | 🔴 Critical | IP addresses leaked in admin analytics `/api/admin/analytics` | Removed `ip_address` column from analytics query. Updated frontend type |
| H1 | 🟠 High | No rate limit on `/auth/me` — token spray | Added `authMeLimit` (30 req/min) in `rateLimit.ts`, applied to `/auth/me` |
| H2 | 🟠 High | Weak email validation (`includes('@')`) | Replaced with RFC-like regex `/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/` in all route email checks |
| H3 | 🟠 High | Open redirect — `/go/:shortCode` redirects to any stored URL | Added protocol validation (only `http:` / `https:` allowed) before redirect |
| H4 | 🟠 High | Error messages expose internal details | Added `safeErrorMessage()` helper in `config.ts` — returns generic message in production. Applied across all route error responses (including missed `/login` and `/me` routes) |
| H6 | 🟠 High | No file type validation on admin uploads | Added `ALLOWED_MIME_TYPES` set (JPEG, PNG, WebP, GIF, AVIF) and file size check |
| M1 | 🟡 Medium | Mock auth fallback creates fake sessions when backend unreachable | Removed mock user/token creation in `AuthContext.tsx` login/register. Errors now propagate to user |
| M2 | 🟡 Medium | No password strength policy | Added validation: min 8 chars, must contain uppercase, lowercase, and number |
| M5 | 🟡 Medium | Missing security headers, `unsafe-inline` in CSP | Removed `unsafe-inline` from script-src. Added HTS (`max-age=31536000`), `X-Content-Type-Options: nosniff`, `Permissions-Policy`, `Referrer-Policy: strict-origin-when-cross-origin`, `form-action`, `base-uri` directives |
| L2 | 🟢 Low | No `trust proxy` — IP logging shows proxy IPs | Added `app.set('trust proxy', 1)` |
| — | 🟢 Low | IPv6 `[::1]` loopback check never matched | Fixed bracket syntax to `'::1'` in ssrf.ts |
| — | 🟢 Low | SSRF IPv6 DNS resolution missing | Added `dns.resolve6()` alongside `resolve4()` in ssrf.ts |

**Files changed:** `.env.example`, `src/utils/ssrf.ts` (new), `src/utils/xss.ts`, `src/utils/config.ts`, `src/middleware/sanitize.ts`, `src/middleware/rateLimit.ts`, `src/middleware/auth.ts`, `src/api/server.ts`, `src/api/routes.ts`, `src/api/admin-routes.ts`, `src/api/auth-routes.ts`, `src/api/scrape.ts`, `frontend/src/context/AuthContext.tsx`, `frontend/src/api.ts`

## 9. Summary

- **Backend**: Typecheck ✅, Build ✅, Tests: 48/48 ✅
- **Frontend**: SEO ✅, PWA ✅, ErrorBoundary ✅, Image optimization ✅
- **Security**: CORS fixed ✅, Auth rate limiting ✅, Env validation ✅, SSRF protection ✅, XSS sanitization ✅, Email validation ✅, File upload validation ✅, Security headers ✅
- **Architecture**: Migration framework ✅, Cache key fix ✅, Email alerts ✅
