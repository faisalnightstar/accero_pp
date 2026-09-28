# Phase 4: Multi-Provider Verification & Fallback APIs - Research

**Gathered:** 2026-09-28
**Status:** Completed
**Ready for planning:** Yes

<objective>
Research how to construct resilient, secure, server-side document verification pipelines for PAN, Voter ID (EPIC), Driving License, and Vehicle RC. Investigate vendor endpoint specifications (NeoAPI, FastNexora, AxenAPI), cascading failover patterns, timeout abort handling, schema normalization, and dual-entry Studio transitions.
</objective>

<summary>
Phase 4 connects PrintPortal Next.js to external third-party verification providers to enable 1-click card population via ID number lookup. Because external government and third-party vendor APIs suffer from latency spikes, unexpected downtime, and inconsistent payload structures, the system must never block or crash on partial data.

Key architectural takeaways:
1. **Server-Side Execution**: All vendor calls run strictly in server-only Server Actions / Route Handlers, ensuring API keys (`NEO_API_KEY`, `AXEN_API_KEY`, `FASTNEXORA_API_KEY`) never leak to client JavaScript bundles.
2. **Automatic Silent Cascade**: The system tries primary providers first (FastNexora for Voter due to direct non-captcha lookup; NeoAPI for PAN; AxenAPI for DL/RC) and seamlessly fails over to secondary providers before routing to Studio.
3. **8-Second Timeout Interception**: Every external request is guarded by native `AbortSignal.timeout(8000)`. Total round-trip across primary and secondary cascade never exceeds ~16 seconds.
4. **Partial Payload Recovery**: Even if an API returns only 2 out of 8 required fields, all retrieved fields populate the target canvas in Split-Screen Studio, while Phase 3's `detectMissingFields` engine highlights the remainder with amber badges for immediate manual completion.
5. **Dual UI Entry Points**: Users can search directly from the Dashboard (auto-navigating to Studio) or query directly inside `/studio` via an in-page search bar, guarded by a dirty-form confirmation modal.
</summary>

<standard_stack>
## Standard Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Runtime / Framework | Next.js App Router | 15+ | Server Actions and Route Handlers for server-only API execution |
| Language | TypeScript | 5.x | Strict typing matching `src/types/cards.ts` |
| HTTP & Timeouts | Native `fetch` + `AbortSignal` | Node 18+ / Native | `AbortSignal.timeout(8000)` for non-blocking timeout handling |
| Schema Validation | Zod | 3.23+ | Validating and sanitizing raw vendor JSON payloads |
| Reactive Client Hook | React 19 Hooks | 19.x | Connecting lookup results to `useCardStudio` state machine |
| Styling / Alerts | Tailwind CSS + Lucide React | Current | Amber warning banners, search bars, loading spinners, and toast UI |
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Recommended Directory Structure

```
src/
├── actions/
│   └── verify.ts                  # Server Action entry point for document lookup
├── lib/
│   └── verify/
│       ├── types.ts               # Normalized provider response interfaces & status enums
│       ├── orchestrator.ts        # Silent cascade manager (primary -> secondary -> fallback)
│       ├── providers/
│       │   ├── fastnexora.ts      # FastNexora Voter API client
│       │   ├── neoapi.ts          # NeoAPI PAN & Voter client
│       │   ├── axenapi.ts         # AxenAPI DL & RC client
│       │   └── mock.ts            # Local development simulation provider
│       └── normalizers/
│           ├── panNormalizer.ts   # Maps raw vendor JSON -> PanCardData
│           ├── voterNormalizer.ts # Maps raw vendor JSON -> VoterCardData
│           ├── dlNormalizer.ts    # Maps raw vendor JSON -> DlCardData
│           └── rcNormalizer.ts    # Maps raw vendor JSON -> RcCardData
├── components/
│   ├── studio/
│   │   ├── StudioSearchBar.tsx    # In-Studio document lookup bar
│   │   └── OverwriteConfirmModal.tsx # Guard for dirty form states
│   └── dashboard/
│       └── QuickLookupModal.tsx   # Dashboard 1-click modal search
```

### Pattern 1: Automatic Silent Cascade Orchestrator
**What:** Sequentially attempts primary provider; upon network error, HTTP error (4xx/5xx), or timeout, catches the error and immediately attempts secondary provider before returning partial or empty payload to the client.
**When to use:** All document lookups.

```typescript
// src/lib/verify/orchestrator.ts
import { DocumentType } from '@/types/cards';
import { VerificationResult, ProviderAdapter } from './types';

export async function executeProviderCascade(
  docType: DocumentType,
  queryId: string,
  providers: ProviderAdapter[]
): Promise<VerificationResult> {
  let lastError: string | null = null;
  
  for (const provider of providers) {
    try {
      const result = await provider.lookup(docType, queryId);
      if (result.success && result.data) {
        return result;
      }
      lastError = result.errorMessage || 'Provider returned incomplete response';
    } catch (err: any) {
      lastError = err.name === 'TimeoutError' ? 'Request timed out' : err.message;
      // Continue to next provider in cascade
    }
  }

  // Graceful fallback: return partial / empty result with error status
  return {
    success: false,
    documentType: docType,
    idNumber: queryId,
    data: {},
    errorMessage: lastError || 'All verification providers were unavailable',
    isPartial: false,
  };
}
```

### Pattern 2: Strict 8-Second Fast Timeout
**What:** Use native `AbortSignal.timeout(8000)` combined with `fetch` to terminate stalled requests without blocking node threads or holding client connections open.

```typescript
// Native timeout abort pattern
const response = await fetch(endpointUrl, {
  method: 'GET',
  headers: { Accept: 'application/json' },
  signal: AbortSignal.timeout(8000), // Enforces strict 8s threshold
  cache: 'no-store',
});
```

### Pattern 3: Normalized Data Recovery
**What:** Vendor responses vary wildly in key naming (e.g. `epic_no` vs `epicNumber`, `part_name_v1` vs `partNumberAndNameRegional`). Normalizers translate vendor payloads into strict `src/types/cards.ts` representations, sanitizing dates and providing default empty strings for missing fields.

```typescript
// Example: Voter Normalizer
export function normalizeNeoApiVoter(raw: any, epicNumber: string): Partial<VoterCardData> {
  const doc = raw?.response?.docs?.[0] || {};
  return {
    epicNumber: doc.epic_no || epicNumber,
    electorName: doc.name || '',
    electorNameRegional: doc.name_v1 || '',
    relationType: doc.rln_type === 'FTHR' ? 'FATHER' : 'HUSBAND',
    relationName: doc.rln_name || '',
    relationNameRegional: doc.rln_name_v1 || '',
    gender: doc.gender === 'M' ? 'Male' : doc.gender === 'F' ? 'Female' : 'Other',
    assemblyConstituency: doc.ac_no && doc.ac_name ? `${doc.ac_no} - ${doc.ac_name}` : '',
    assemblyConstituencyRegional: doc.ac_no && doc.ac_name_v1 ? `${doc.ac_no} - ${doc.ac_name_v1}` : '',
    partNumberAndName: doc.part_no && doc.part_name ? `${doc.part_no} - ${doc.part_name}` : '',
    partNumberAndNameRegional: doc.part_no && doc.part_name_v1 ? `${doc.part_no} - ${doc.part_name_v1}` : '',
    fullAddress: [doc.part_name, doc.ac_name, doc.district, doc.state].filter(Boolean).join(', '),
    fullAddressRegional: [doc.part_name_v1, doc.ac_name_v1, doc.dist_name_v1, doc.state_v1].filter(Boolean).join(', '),
  };
}
```

### Pattern 4: Dual Entry Point & Dirty State Guard
**What:** 
1. **Dashboard Modal:** User selects card type (PAN, Voter, DL, RC) and enters ID. Submitting redirects to `/studio?type=[card]&lookup=[id]`, which loads data and populates canvas.
2. **In-Studio Search Bar:** Positioned at top of `CardForm.tsx`. If user has modified the form or uploaded images (`dirty === true`), a confirmation modal warns: *"You have unsaved changes. Overwrite with lookup results?"*. Clean forms populate instantly.
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Timeout handling | `setTimeout` with manual promise racing | `AbortSignal.timeout(8000)` | Built-in web standard; cancels the socket connection immediately |
| Client-side API security | Client `fetch` with browser headers | Server Actions (`'use server'`) | Next.js Server Actions never leak API keys (`process.env`) to browser bundles |
| Missing field detection | Custom validation loops per card type | `analyzeDocumentCompleteness` in `src/lib/missingFields.ts` | Phase 3 already established declarative schemas and completion scoring |
| Date formatting | Custom regex splitting | Standard date formatter utility | Handles `YYYY-MM-DD`, `DD-MM-YYYY`, and `DD/MM/YYYY` uniformly |
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: Hanging Connection Starvation
**What goes wrong:** External government third-party gateways freeze for 30+ seconds without returning a response, causing Next.js serverless functions to time out on Vercel (10-15s limit on Hobby/Pro).
**How to avoid:** Enforce `AbortSignal.timeout(8000)` on all external calls.

### Pitfall 2: Silent Credential Leakage
**What goes wrong:** Calling external APIs directly from React components exposes `AXEN_API_KEY` and `NEO_API_KEY` in the browser Network tab.
**How to avoid:** Implement all external lookups strictly inside `src/actions/verify.ts` marked with `'use server'` or route handlers.

### Pitfall 3: Incomplete Payloads Crashing Renders
**What goes wrong:** Vendor returns `{"fullname": "John Doe"}` with missing `fathername`, causing canvas template access `data.fatherName.toUpperCase()` to throw `TypeError: Cannot read properties of undefined`.
**How to avoid:** Normalizers must guarantee default empty strings `""` for all missing string fields, and canvas components should use optional chaining or fallback defaults.

### Pitfall 4: Accidental Overwriting of User Work
**What goes wrong:** User spends 5 minutes uploading a custom photograph and signature, then tests the in-studio search bar, immediately blowing away their uploads.
**How to avoid:** Studio dirty-check confirmation dialog (D-05).
</common_pitfalls>

<code_examples>
## Code Examples

### Server Action Endpoint (`src/actions/verify.ts`)
```typescript
'use server';

import { DocumentType } from '@/types/cards';
import { executeProviderCascade } from '@/lib/verify/orchestrator';
import { getProvidersForDocType } from '@/lib/verify/providerFactory';
import { VerificationResult } from '@/lib/verify/types';

export async function verifyDocumentAction(
  docType: DocumentType,
  idNumber: string
): Promise<VerificationResult> {
  const sanitizedId = idNumber.trim().toUpperCase();
  if (!sanitizedId) {
    return {
      success: false,
      documentType: docType,
      idNumber,
      data: {},
      errorMessage: 'Document number is required.',
      isPartial: false,
    };
  }

  const providers = getProvidersForDocType(docType);
  return await executeProviderCascade(docType, sanitizedId, providers);
}
```

### FastNexora Voter API Client
```typescript
// src/lib/verify/providers/fastnexora.ts
import { ProviderAdapter, VerificationResult } from '../types';
import { normalizeFastNexoraVoter } from '../normalizers/voterNormalizer';

export class FastNexoraProvider implements ProviderAdapter {
  name = 'FastNexora';

  async lookup(docType: string, idNumber: string): Promise<VerificationResult> {
    const apiKey = process.env.FASTNEXORA_API_KEY;
    if (!apiKey) {
      throw new Error('FASTNEXORA_API_KEY not configured');
    }

    const url = `https://auth.fastnexora.xyz/api/v1/voterVerification.php?apiKey=${encodeURIComponent(apiKey)}&epicNumber=${encodeURIComponent(idNumber)}`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`FastNexora HTTP error: ${res.status}`);
    }

    const json = await res.json();
    if (json.status !== 'success' && !json.data) {
      return {
        success: false,
        documentType: 'voter',
        idNumber,
        data: {},
        errorMessage: json.message || 'No voter record found',
        isPartial: false,
      };
    }

    const normalizedData = normalizeFastNexoraVoter(json.data, idNumber);
    return {
      success: true,
      documentType: 'voter',
      idNumber,
      data: normalizedData,
      provider: this.name,
      isPartial: false,
    };
  }
}
```
</code_examples>

<validation_architecture>
## Validation Architecture

### Dimension 8 Nyquist Verification Requirements

To ensure zero missing-data failures and bulletproof verification reliability, the implementation must be validated against four core criteria:

1. **Server Isolation & Secret Protection**:
   - Verify that neither `NEO_API_KEY`, `AXEN_API_KEY`, nor `FASTNEXORA_API_KEY` are bundled into browser assets.
   - All verification calls must execute through server actions / route handlers.

2. **Timeout & Failover Resilience**:
   - Automated unit tests simulating an 8-second timeout on the primary provider must prove that the orchestrator immediately invokes the secondary provider.
   - Total cascaded execution time must not exceed 16 seconds.

3. **Partial Payload Graceful Recovery**:
   - Simulated partial response (e.g. name only, missing address and relative) must populate in `useCardStudio` without runtime errors.
   - `MissingFieldBanner` must immediately flag the missing fields with amber badges and adjust the completion score.

4. **Dual Entry Point Integration**:
   - Submitting an ID in the Dashboard Quick Lookup modal successfully redirects to `/studio` with the pre-filled canvas.
   - Submitting in the in-studio search bar while dirty triggers the overwrite confirmation dialog.
</validation_architecture>

<sources>
## Sources

### Primary (HIGH confidence)
- Legacy Codebase: `printportal/admin/voter_neoapi.php`, `Pan_Advance_Axen2.php`, `DLFind_Axen.php`, `rc.php`
- Project Documentation: `.planning/codebase/INTEGRATIONS.md`, `.planning/phases/04-multi-provider-verification-fallback-apis/04-CONTEXT.md`
- Target Architecture: `src/types/cards.ts`, `src/lib/missingFields.ts`, `src/hooks/useCardStudio.ts`

### Secondary (HIGH confidence)
- Node.js & Web Standards: `AbortSignal.timeout(ms)` specification
- Next.js 15 App Router: Server Actions `'use server'` security boundary
</sources>

<metadata>
**Research date:** 2026-09-28
**Valid until:** 2026-10-28
**Confidence breakdown:**
- Provider Endpoints: HIGH (extracted from operational PHP codebase)
- Timeout Architecture: HIGH (native Web API standard)
- Studio Integration: HIGH (directly extends Phase 3 reactive studio state)
</metadata>

---

*Phase: 04-multi-provider-verification-fallback-apis*
*Research completed: 2026-09-28*
*Ready for planning: yes*
