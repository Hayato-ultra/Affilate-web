# Graph Report - .  (2026-05-26)

## Corpus Check
- Corpus is ~23,363 words - fits in a single context window. You may not need a graph.

## Summary
- 201 nodes · 247 edges · 54 communities detected
- Extraction: 83% EXTRACTED · 17% INFERRED · 0% AMBIGUOUS · INFERRED: 41 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Admin API & Product Management|Admin API & Product Management]]
- [[_COMMUNITY_Cache & Database Layer|Cache & Database Layer]]
- [[_COMMUNITY_Web Scraping & Search|Web Scraping & Search]]
- [[_COMMUNITY_Product Matching & Normalization|Product Matching & Normalization]]
- [[_COMMUNITY_Affiliate Link Cloaking|Affiliate Link Cloaking]]
- [[_COMMUNITY_Browser Scraper Clients|Browser Scraper Clients]]
- [[_COMMUNITY_Search Page UI|Search Page UI]]
- [[_COMMUNITY_Rate Limiting & Aggregator Base|Rate Limiting & Aggregator Base]]
- [[_COMMUNITY_Admin Layout & Auth Context|Admin Layout & Auth Context]]
- [[_COMMUNITY_Admin Product List|Admin Product List]]
- [[_COMMUNITY_eBay Aggregator|eBay Aggregator]]
- [[_COMMUNITY_Aggregation Orchestrator|Aggregation Orchestrator]]
- [[_COMMUNITY_Supabase Integration|Supabase Integration]]
- [[_COMMUNITY_Amazon Aggregator|Amazon Aggregator]]
- [[_COMMUNITY_Flipkart Aggregator|Flipkart Aggregator]]
- [[_COMMUNITY_App Layout|App Layout]]
- [[_COMMUNITY_Admin Settings|Admin Settings]]
- [[_COMMUNITY_Queue Worker|Queue Worker]]
- [[_COMMUNITY_Bottom Navigation|Bottom Navigation]]
- [[_COMMUNITY_Footer Component|Footer Component]]
- [[_COMMUNITY_Navbar Component|Navbar Component]]
- [[_COMMUNITY_Product Card Component|Product Card Component]]
- [[_COMMUNITY_Search Input Component|Search Input Component]]
- [[_COMMUNITY_Search Hook|Search Hook]]
- [[_COMMUNITY_About Page|About Page]]
- [[_COMMUNITY_Contact Page|Contact Page]]
- [[_COMMUNITY_Login Page|Login Page]]
- [[_COMMUNITY_Product Detail Page|Product Detail Page]]
- [[_COMMUNITY_Register Page|Register Page]]
- [[_COMMUNITY_Admin Route Guard|Admin Route Guard]]
- [[_COMMUNITY_API Routes|API Routes]]
- [[_COMMUNITY_Logger Utility|Logger Utility]]
- [[_COMMUNITY_Vitest Config|Vitest Config]]
- [[_COMMUNITY_Graphify Summary Script|Graphify Summary Script]]
- [[_COMMUNITY_PostCSS Config|PostCSS Config]]
- [[_COMMUNITY_Tailwind Config|Tailwind Config]]
- [[_COMMUNITY_Vite Config|Vite Config]]
- [[_COMMUNITY_React Entry Point|React Entry Point]]
- [[_COMMUNITY_Frontend Types|Frontend Types]]
- [[_COMMUNITY_Vite Env Types|Vite Env Types]]
- [[_COMMUNITY_Featured Page|Featured Page]]
- [[_COMMUNITY_Home Page|Home Page]]
- [[_COMMUNITY_Not Found Page|Not Found Page]]
- [[_COMMUNITY_Admin Dashboard|Admin Dashboard]]
- [[_COMMUNITY_Auth Routes|Auth Routes]]
- [[_COMMUNITY_Server Entry|Server Entry]]
- [[_COMMUNITY_DB Schema|DB Schema]]
- [[_COMMUNITY_Rate Limit Middleware|Rate Limit Middleware]]
- [[_COMMUNITY_Type Definitions|Type Definitions]]
- [[_COMMUNITY_App Config|App Config]]
- [[_COMMUNITY_Affiliate Tests|Affiliate Tests]]
- [[_COMMUNITY_Cache Tests|Cache Tests]]
- [[_COMMUNITY_Integration Tests|Integration Tests]]
- [[_COMMUNITY_Normalize Tests|Normalize Tests]]

## God Nodes (most connected - your core abstractions)
1. `request()` - 22 edges
2. `adminHeaders()` - 12 edges
3. `getDb()` - 12 edges
4. `scrapeUrl()` - 9 edges
5. `matchSingle()` - 8 edges
6. `lookupCache()` - 6 edges
7. `searchProducts()` - 5 edges
8. `createCloakedLink()` - 5 edges
9. `normalizeQuery()` - 5 edges
10. `queryKey()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `recordClick()` --calls--> `getDb()`  [INFERRED]
  src\affiliate\cloak.ts → src\db\connection.ts
- `persistMatch()` --calls--> `getDb()`  [INFERRED]
  src\normalize\matcher.ts → src\db\connection.ts
- `loadCatalog()` --calls--> `getCatalogProducts()`  [INFERRED]
  frontend\src\pages\SearchPage.tsx → frontend\src\api.ts
- `load()` --calls--> `getAdminProducts()`  [INFERRED]
  frontend\src\pages\admin\AdminProducts.tsx → frontend\src\api.ts
- `handleDelete()` --calls--> `deleteAdminProduct()`  [INFERRED]
  frontend\src\pages\admin\AdminProducts.tsx → frontend\src\api.ts

## Communities

### Community 0 - "Admin API & Product Management"
Cohesion: 0.15
Nodes (27): handleScrape(), handleSubmit(), handleUpload(), adminHeaders(), authLogin(), authLogout(), authMe(), authRegister() (+19 more)

### Community 1 - "Cache & Database Layer"
Cohesion: 0.21
Nodes (13): cacheStats(), evictStaleEntries(), invalidateCache(), lookupCache(), normalizeQuery(), queryKey(), shouldRefreshCache(), writeCache() (+5 more)

### Community 2 - "Web Scraping & Search"
Cohesion: 0.23
Nodes (11): detectMerchant(), escapeRegex(), extractCurrency(), extractJsonLd(), extractMetaContent(), extractTagContent(), extractTitleTag(), fetchHtml() (+3 more)

### Community 3 - "Product Matching & Normalization"
Cohesion: 0.33
Nodes (10): fuzzySimilarity(), generateMatchGroup(), matchProducts(), matchSingle(), persistMatch(), tokenize(), tokenOverlap(), extractIdentifiers() (+2 more)

### Community 4 - "Affiliate Link Cloaking"
Cohesion: 0.27
Nodes (7): createCloakedLink(), generateShortCode(), getRedirectUrl(), recordClick(), resolveCloakedLink(), injectAffiliateTag(), parseUrl()

### Community 5 - "Browser Scraper Clients"
Cohesion: 0.29
Nodes (6): close(), CromaClient, fetchProducts(), getBrowser(), getRandomProxy(), MeeshoClient

### Community 6 - "Search Page UI"
Cohesion: 0.43
Nodes (5): handleCategoryClick(), handleSortChange(), handleUrlSubmit(), isUrl(), loadCatalog()

### Community 7 - "Rate Limiting & Aggregator Base"
Cohesion: 0.43
Nodes (3): RateLimiter, search(), withRetry()

### Community 8 - "Admin Layout & Auth Context"
Cohesion: 0.4
Nodes (2): AdminLayout(), useAuth()

### Community 9 - "Admin Product List"
Cohesion: 0.5
Nodes (4): handleDelete(), handleFeature(), handleSearch(), load()

### Community 10 - "eBay Aggregator"
Cohesion: 0.5
Nodes (1): EbayClient

### Community 11 - "Aggregation Orchestrator"
Cohesion: 0.5
Nodes (1): AggregationOrchestrator

### Community 12 - "Supabase Integration"
Cohesion: 0.4
Nodes (2): getSupabaseAdmin(), seed()

### Community 13 - "Amazon Aggregator"
Cohesion: 0.5
Nodes (1): AmazonClient

### Community 14 - "Flipkart Aggregator"
Cohesion: 0.5
Nodes (1): FlipkartClient

### Community 15 - "App Layout"
Cohesion: 0.67
Nodes (0): 

### Community 16 - "Admin Settings"
Cohesion: 0.67
Nodes (1): handleSave()

### Community 17 - "Queue Worker"
Cohesion: 0.67
Nodes (0): 

### Community 18 - "Bottom Navigation"
Cohesion: 1.0
Nodes (0): 

### Community 19 - "Footer Component"
Cohesion: 1.0
Nodes (0): 

### Community 20 - "Navbar Component"
Cohesion: 1.0
Nodes (0): 

### Community 21 - "Product Card Component"
Cohesion: 1.0
Nodes (0): 

### Community 22 - "Search Input Component"
Cohesion: 1.0
Nodes (0): 

### Community 23 - "Search Hook"
Cohesion: 1.0
Nodes (0): 

### Community 24 - "About Page"
Cohesion: 1.0
Nodes (0): 

### Community 25 - "Contact Page"
Cohesion: 1.0
Nodes (0): 

### Community 26 - "Login Page"
Cohesion: 1.0
Nodes (0): 

### Community 27 - "Product Detail Page"
Cohesion: 1.0
Nodes (0): 

### Community 28 - "Register Page"
Cohesion: 1.0
Nodes (0): 

### Community 29 - "Admin Route Guard"
Cohesion: 1.0
Nodes (0): 

### Community 30 - "API Routes"
Cohesion: 1.0
Nodes (0): 

### Community 31 - "Logger Utility"
Cohesion: 1.0
Nodes (0): 

### Community 32 - "Vitest Config"
Cohesion: 1.0
Nodes (0): 

### Community 33 - "Graphify Summary Script"
Cohesion: 1.0
Nodes (0): 

### Community 34 - "PostCSS Config"
Cohesion: 1.0
Nodes (0): 

### Community 35 - "Tailwind Config"
Cohesion: 1.0
Nodes (0): 

### Community 36 - "Vite Config"
Cohesion: 1.0
Nodes (0): 

### Community 37 - "React Entry Point"
Cohesion: 1.0
Nodes (0): 

### Community 38 - "Frontend Types"
Cohesion: 1.0
Nodes (0): 

### Community 39 - "Vite Env Types"
Cohesion: 1.0
Nodes (0): 

### Community 40 - "Featured Page"
Cohesion: 1.0
Nodes (0): 

### Community 41 - "Home Page"
Cohesion: 1.0
Nodes (0): 

### Community 42 - "Not Found Page"
Cohesion: 1.0
Nodes (0): 

### Community 43 - "Admin Dashboard"
Cohesion: 1.0
Nodes (0): 

### Community 44 - "Auth Routes"
Cohesion: 1.0
Nodes (0): 

### Community 45 - "Server Entry"
Cohesion: 1.0
Nodes (0): 

### Community 46 - "DB Schema"
Cohesion: 1.0
Nodes (0): 

### Community 47 - "Rate Limit Middleware"
Cohesion: 1.0
Nodes (0): 

### Community 48 - "Type Definitions"
Cohesion: 1.0
Nodes (0): 

### Community 49 - "App Config"
Cohesion: 1.0
Nodes (0): 

### Community 50 - "Affiliate Tests"
Cohesion: 1.0
Nodes (0): 

### Community 51 - "Cache Tests"
Cohesion: 1.0
Nodes (0): 

### Community 52 - "Integration Tests"
Cohesion: 1.0
Nodes (0): 

### Community 53 - "Normalize Tests"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **Thin community `Bottom Navigation`** (2 nodes): `BottomNav()`, `BottomNav.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Footer Component`** (2 nodes): `Footer()`, `Footer.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Navbar Component`** (2 nodes): `Navbar.tsx`, `isActive()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Product Card Component`** (2 nodes): `ProductCard.tsx`, `formatPrice()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Search Input Component`** (2 nodes): `SearchInput.tsx`, `SearchInput()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Search Hook`** (2 nodes): `useSearch.ts`, `useSearch()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `About Page`** (2 nodes): `About()`, `About.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Contact Page`** (2 nodes): `Contact()`, `Contact.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Login Page`** (2 nodes): `Login.tsx`, `handleSubmit()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Product Detail Page`** (2 nodes): `ProductDetail.tsx`, `formatPrice()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Register Page`** (2 nodes): `Register.tsx`, `handleSubmit()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Route Guard`** (2 nodes): `adminGuard()`, `admin-routes.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `API Routes`** (2 nodes): `supabaseToProduct()`, `routes.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Logger Utility`** (2 nodes): `createScopedLogger()`, `logger.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Vitest Config`** (1 nodes): `vitest.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Graphify Summary Script`** (1 nodes): `_graphify_summary.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `PostCSS Config`** (1 nodes): `postcss.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Tailwind Config`** (1 nodes): `tailwind.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Vite Config`** (1 nodes): `vite.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `React Entry Point`** (1 nodes): `main.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend Types`** (1 nodes): `types.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Vite Env Types`** (1 nodes): `vite-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Featured Page`** (1 nodes): `FeaturedPage.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Home Page`** (1 nodes): `HomePage.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Not Found Page`** (1 nodes): `NotFound.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Dashboard`** (1 nodes): `AdminDashboard.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Auth Routes`** (1 nodes): `auth-routes.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Server Entry`** (1 nodes): `server.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `DB Schema`** (1 nodes): `schema.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Rate Limit Middleware`** (1 nodes): `rateLimit.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Type Definitions`** (1 nodes): `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `App Config`** (1 nodes): `config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Affiliate Tests`** (1 nodes): `affiliate.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Cache Tests`** (1 nodes): `cache.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Integration Tests`** (1 nodes): `integration.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Normalize Tests`** (1 nodes): `normalize.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getDb()` connect `Cache & Database Layer` to `Product Matching & Normalization`, `Affiliate Link Cloaking`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Why does `closeDb()` connect `Cache & Database Layer` to `Browser Scraper Clients`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Why does `close()` connect `Browser Scraper Clients` to `Cache & Database Layer`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Are the 11 inferred relationships involving `getDb()` (e.g. with `createCloakedLink()` and `resolveCloakedLink()`) actually correct?**
  _`getDb()` has 11 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `matchSingle()` (e.g. with `sanitizeTitle()` and `extractModelCode()`) actually correct?**
  _`matchSingle()` has 3 INFERRED edges - model-reasoned connections that need verification._