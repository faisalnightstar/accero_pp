# Quick Task 003: Fixed IP Outbound Proxy via Fixie

## Objective
Implement fixed IP outbound HTTP/HTTPS request capabilities using Fixie (`FIXIE_URL`) as documented in `docs/fixie` and `https://usefixie.com/documentation/http-and-https-requests`:
- Create a dedicated outbound proxy library in `src/lib/outbound/fixie.ts` providing:
  - Configuration parsing and detection (`isFixieConfigured()`, `getFixieConfig()`, `getFixieUrl()`).
  - Native `undici` ProxyAgent dispatcher (`getFixieDispatcher()`) and `https-proxy-agent` (`getFixieAgent()`) support.
  - Drop-in `fixedFetch(url, init)` that routes requests through Fixie static IPs when `FIXIE_URL` is set, and transparently falls back to native `fetch` when unconfigured.
  - Secure credential masking so proxy tokens never leak into server logs.
  - Diagnostic IP lookup utility (`checkOutboundIp()`) querying public IP reflection endpoints through the proxy.
- Provide a secure admin diagnostic endpoint `GET /api/admin/diagnostics/outbound-ip` to inspect outbound connectivity and verify the active static IP.
- Integrate `fixedFetch` into external verification providers (`neoapi.ts`, `axenapi.ts`, `fastnexora.ts`) and payment verification (`paytm.ts`) to ensure government portal lookups originate from whitelisted static IPs.
- Add `FIXIE_URL` configuration and documentation to `.env.example`.
- Add comprehensive Vitest test coverage for Fixie outbound configuration, agent initialization, fallback behaviors, and header preservation.

## Deliverables
1. `src/lib/outbound/fixie.ts` - Core Fixie outbound proxy service with `fixedFetch`, proxy agents, URL parsers, and IP checker.
2. `src/app/api/admin/diagnostics/outbound-ip/route.ts` - Admin route to verify outbound IP and Fixie proxy status.
3. Provider updates:
   - `src/lib/verify/providers/neoapi.ts` - Use `fixedFetch` for PAN and Voter lookups.
   - `src/lib/verify/providers/axenapi.ts` - Use `fixedFetch` for DL and RC lookups.
   - `src/lib/verify/providers/fastnexora.ts` - Use `fixedFetch` for Voter verification.
   - `src/lib/payment/paytm.ts` - Use `fixedFetch` for order status inquiries.
4. `.env.example` - Document `FIXIE_URL` environment variable for Vercel/Heroku static IP integration.
5. `tests/outbound/fixie.test.ts` - Unit and integration tests covering Fixie outbound proxy functionality.
