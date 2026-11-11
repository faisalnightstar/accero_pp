# Quick Task 003: Fixed IP Outbound Proxy via Fixie & Centralized Network Layer

## Objective
Implement a centralized, provider-specific outbound networking layer (`src/lib/network/`) that routes external requests requiring IP whitelisting (NeoAPI, FastNexora, AxenAPI) through Fixie's static IP proxy while strictly keeping unrelated services (MongoDB Atlas, payment gateways like Paytm, WhatsApp, and analytics) direct.

## Deliverables
1. `src/lib/network/proxy-config.ts` - Server-side FIXIE_URL parsing, environment enforcement, and credential masking.
2. `src/lib/network/provider-registry.ts` - Explicit provider registry, destination hostname allowlist, and routing policies.
3. `src/lib/network/fixie.ts` - Fixie transport layer, Undici ProxyAgent dispatcher, Axios proxy config, and fail-safe closed error handling.
4. `src/lib/network/provider-client.ts` - Centralized `providerFetch()` with audit logging, timeout management, and security guards.
5. `src/lib/network/diagnostics.ts` - Internal diagnostic utility verifying egress IP against Fixie's static IP pool.
6. `src/app/api/admin/diagnostics/outbound-ip/route.ts` - Protected admin diagnostic route.
7. Provider migration:
   - `src/lib/verify/providers/neoapi.ts` -> Routed via `providerFetch('...', { providerId: 'neoapi' })`.
   - `src/lib/verify/providers/fastnexora.ts` -> Routed via `providerFetch('...', { providerId: 'fastnexora' })`.
   - `src/lib/verify/providers/axenapi.ts` -> Routed via `providerFetch('...', { providerId: 'axenapi' })`.
   - `src/lib/payment/paytm.ts` -> Maintained strictly DIRECT via native `fetch`.
8. Tests:
   - `tests/network-routing.test.ts` - Comprehensive routing policy, fail-safe closed, undici tunneling, and audit logging tests.
   - `tests/fixie-outbound.test.ts` - Core Fixie configuration and agent cache tests.
   - `tests/fixie-admin-api.test.ts` - RBAC access control tests.
