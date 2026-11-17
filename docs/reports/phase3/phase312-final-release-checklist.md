# Accero PrintPortal — Phase 3.1.2 Final Release Checklist
**Project:** Accero PrintPortal (`https://printportal.accero.app`)  
**Phase:** 3.1.2 Production Release Readiness Checklist  
**Date:** November 17, 2026  
**Auditor:** Principal Software Engineer & Release Gatekeeper  

---

## 1. Technical Verification Gate

| Checkpoint | Requirement | Verification Method | Status | Evidence Reference |
| :--- | :--- | :--- | :--- | :--- |
| **TypeScript Compilation** | Zero type errors (`strict: true`) | `npx tsc --noEmit` | **PASSED** | Exited 0 with zero errors |
| **Vitest Automated Tests** | All SEO, analytics, routing, and calculator tests pass | `npm test tests/seo/ tests/analytics-events.test.ts tests/seo-indexing-policy.test.ts tests/cr80-calculator.test.ts` | **PASSED** | 56/56 tests passing (205ms) |
| **Next.js Production Build** | Clean build with static page generation | `npm run build` | **PASSED** | 76/76 static/server pages compiled |
| **Canonical Route Parity** | Exactly 52 canonical public routes defined and accounted for | `tests/seo-indexing-policy.test.ts` | **PASSED** | Matches `CANONICAL_PUBLIC_ROUTES` |
| **Robots Directives** | Private workflows disallowed; `/login`, `/register` visible for `noindex` tag | `tests/seo/robots.test.ts` | **PASSED** | Sitemaps & robots parity confirmed |
| **Sitemap Integrity** | 100% public canonical routes; zero duplicate or redirected URLs | `tests/seo/sitemap.test.ts` | **PASSED** | Sitemap XML generation verified |
| **SearchAction Removal** | Obsolete `potentialAction: SearchAction` removed | `tests/seo/structured-data.test.ts` | **PASSED** | Eliminates `/services?q=...` phantom crawl |
| **`/llms.txt` Headers** | `X-Robots-Tag: noindex` registered for search bots | `next.config.ts:headers()` | **PASSED** | Next.js build registers header rule |
| **Internal Link Depth** | CSC routes reachable at Click Depth 1 | `src/app/services/[card]/page.tsx`, `PublicFooter.tsx` | **PASSED** | Contextual banners & footer links live |
| **GA4 Event Contract** | 10 canonical events implemented; PII denylist active | `tests/analytics-events.test.ts` | **PASSED** | PII stripped, purchase deduplicated |
| **Print Workflow Lifecycle** | `print_initiated` distinct from `print_dialog_closed` | `src/app/studio/page.tsx`, `src/app/cards/page.tsx` | **PASSED** | Accurate print tracking verified |
| **CRO Spacing** | WhatsApp widget offset on mobile (`bottom-20`) | `src/components/layout/WhatsAppSupportWidget.tsx` | **PASSED** | Viewport responsive classes verified |
| **Marketing Copy Accuracy** | Zero "zero-storage" or fake "1,200+ VLEs" claims | Repository text search | **PASSED** | 72-hr ephemeral retention copy live |
| **CR80 Calculator Asset** | Self-contained ISO 7810 ID-1 mathematical engine | `tests/cr80-calculator.test.ts` | **PASSED** | 8 unit tests passing 100% |

---

## 2. Pre-Deployment Operational Safeguards

Before deploying this release to production:

- [x] **Git Tree Inspection:** Ensure no unintended temporary files, `.DS_Store`, or scratch files are committed.
- [x] **No Hardcoded Secrets:** Confirm that API keys and JWT secrets remain in environment variables (`.env`).
- [x] **Database Safety:** Confirm no database schema migrations or destructive queries are executed.
- [x] **Zero Production Data Mutation:** No production database records or wallet balances have been touched.
- [x] **Edge Runtime Parity:** Confirm middleware and edge route handlers use compatible Web Crypto APIs.

---

## 3. Post-Deployment Verification Protocol

Once the approved release is deployed to Vercel production:

1. **HTTP Response Header Check:**
   ```bash
   curl -I https://printportal.accero.app/llms.txt
   ```
   *Expected:* HTTP 200, `X-Robots-Tag: noindex`.
2. **Schema.org WebSite JSON-LD Check:**
   ```bash
   curl -s https://printportal.accero.app/ | grep -A 20 '"@type":"WebSite"'
   ```
   *Expected:* Confirms absence of `potentialAction: SearchAction`.
3. **Internal Linking Check:**
   Verify `/services/ration-card-printing` displays the CSC operator banner linking to `/ration-card-printing-for-csc`.
4. **Mobile Viewport Test:**
   Load `https://printportal.accero.app` on an iPhone/Android viewport and confirm WhatsApp support button sits with 80px bottom clearance (`bottom-20`).
5. **GA4 DebugView Live Verification:**
   Trigger a test registration and print workflow in Chrome with GA Debugger extension active to inspect dataLayer events (`registration_started`, `print_initiated`, `print_dialog_closed`).

---

## 4. Final Release Recommendation

```
[ X ] READY FOR STAGING / PRODUCTION DEPLOYMENT
[   ] NOT READY — ENGINEERING BLOCKERS
[   ] NOT READY — EXTERNAL VERIFICATION REQUIRED
```

**Justification:**  
All code modifications, test assertions, build validations, and documentation deliverables required for Phase 3.1.2 have been executed and verified in the codebase.
