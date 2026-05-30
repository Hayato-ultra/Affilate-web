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

## 8. Summary

- **Backend**: Typecheck ✅, Build ✅, Tests: 48/48 ✅
- **Frontend**: SEO ✅, PWA ✅, ErrorBoundary ✅, Image optimization ✅
- **Security**: CORS fixed ✅, Auth rate limiting ✅, Env validation ✅
- **Architecture**: Migration framework ✅, Cache key fix ✅, Email alerts ✅
