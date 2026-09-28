# Phase 4: Multi-Provider Verification & Fallback APIs - Context

**Gathered:** 2026-09-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 4 delivers secure, server-side document verification pipelines connecting to external government and third-party data providers (NeoAPI, FastNexora, AxenAPI) for PAN, Voter ID (EPIC), Driving License, and Vehicle RC. It encapsulates provider credentials, orchestrates automated failovers, enforces strict timeout protection, and seamlessly routes partial or failed lookups into the Phase 3 Split-Screen Studio for immediate missing-field completion.

</domain>

<decisions>
## Implementation Decisions

### API Provider Routing & Cascading Fallback
- **D-01:** **Automatic Silent Cascade**: The verification pipeline attempts the designated primary provider first. If the provider returns an error (4xx/5xx), hangs, or times out, it silently and automatically cascades to the secondary provider before returning data to the client.
- **D-02:** **Provider Mapping**:
  - **Voter ID (EPIC)**: Primary = FastNexora (direct EPIC lookup); Secondary = NeoAPI.
  - **PAN Card**: Primary = NeoAPI; Secondary = AxenAPI.
  - **Driving License (DL) & RC**: Primary = AxenAPI.
- **D-03:** **Direct Non-Captcha Priority**: Prioritize direct lookup endpoints (FastNexora for Voter) without user hurdles. If a fallback provider requires captcha verification, attempt server-side automated handling or gracefully fall back to Studio manual entry rather than blocking the user with interactive captcha obstacles.

### Verification Entry Point & Studio Transition
- **D-04:** **Dual Entry Points**: Provide two intuitive lookup interfaces:
  1. A **Quick Lookup Modal** on the main `/dashboard` that accepts document type + ID number and immediately navigates the user to `/studio` pre-filled with the retrieved card data.
  2. An **In-Studio Search Bar** located directly above the document form in `/studio` for quick queries or re-lookups without leaving the editor.
- **D-05:** **Dirty Form Overwrite Protection**: If a user runs a lookup inside `/studio` while the form already has unsaved manual changes or uploaded photos/signatures, prompt with a confirmation dialog before overwriting. If the form is untouched/clean, populate immediately.

### Timeout & Error Interception Policy
- **D-06:** **8-Second Fast Timeout**: Enforce a strict 8-second request abort limit (`AbortSignal.timeout(8000)`) on every external provider attempt. The total cascade time across primary and fallback will never exceed ~16 seconds.
- **D-07:** **Graceful Studio Handoff & Non-Blocking Toast**: When an external API times out, fails, or returns partial JSON (e.g. name and DOB present, but father name missing), route smoothly into the Split-Screen Studio with all retrieved fields populated. Display a non-blocking toast notification (e.g., *"External lookup returned partial data. Missing fields highlighted for manual completion"*) and automatically trigger the amber missing field banners and badges.

### the agent's Discretion
- **Mock/Simulation Provider Mode**: When external API keys (`NEO_API_KEY`, `AXEN_API_KEY`, `FASTNEXORA_API_KEY`) are missing or set to `test`/`mock` in `.env.local`, provide a deterministic mock fallback provider returning realistic sample records for local development and demonstration.
- **Normalized Response Schema**: Internal normalization layer mapping vendor response properties into the unified TypeScript interfaces in `src/types/cards.ts`.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### External Integrations & Legacy Implementations
- `.planning/codebase/INTEGRATIONS.md` — Provider endpoint specifications, authentication query parameters, and vendor URL mapping.
- `printportal/admin/voter_new_print.php` — Legacy Voter ID API request parameters and data structures.
- `printportal/admin/voter_neoapi.php` — Legacy NeoAPI captcha and voter detail handling.
- `printportal/admin/Pan_Advance_Axen2.php` — Legacy PAN verification query and response handling.
- `printportal/admin/DLFind_Axen.php` — Legacy AxenAPI Driving License query parameters.
- `printportal/admin/rc.php` — Legacy Vehicle RC verification request parameters.

### Studio & Target Architecture
- `src/types/cards.ts` — TypeScript interfaces for `PanCardData`, `AadhaarCardData`, `VoterCardData`, `DlCardData`, and `RcCardData`.
- `src/lib/missingFields.ts` — Declarative missing field validation engine and required field schemas.
- `src/models/DocumentRecord.ts` — Mongoose persistence model for saved document snapshots.
- `src/hooks/useCardStudio.ts` — Split-Screen Studio reactive state machine and card form synchronization.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `useCardStudio` (`src/hooks/useCardStudio.ts`): Reactive hook managing active card type, form data, completion score, and missing fields.
- `MissingFieldBanner` (`src/components/studio/MissingFieldBanner.tsx`): Warning banner displaying missing required fields with auto-scroll jumpers.
- `CardForm` (`src/components/studio/CardForm.tsx`): Form component providing two-way binding with the card preview canvas.
- `detectMissingFields` (`src/lib/missingFields.ts`): Evaluates completeness score and flags empty fields in real time.

### Established Patterns
- Server Actions & Next.js API Routes: External HTTP calls run exclusively server-side to protect secret API keys.
- Environment variables configured via `.env.local` (`NEO_API_KEY`, `AXEN_API_KEY`, `FASTNEXORA_API_KEY`).
- Tailwind CSS custom design tokens (`#8B1E2D` Burgundy, `#E63946` Crimson, `#F4D35E` Gold, `#457B9D` Steel Blue).

### Integration Points
- `src/app/studio/page.tsx`: Accept query params (e.g. `?type=pan&number=...`) or incorporate the in-studio lookup search bar to populate `useCardStudio`.
- `src/app/dashboard/page.tsx`: Quick Lookup Modal on action cards triggering verification and redirecting into `/studio`.
- `src/lib/api/`: Verification client modules per provider with timeout interceptors and error recovery.

</code_context>

<specifics>
## Specific Ideas

- External provider responses must normalize dates to `YYYY-MM-DD` or standard Indian display format `DD/MM/YYYY` consistently across all card types.
- Toasts should use standard portal design tokens and never block user interaction.
- The in-studio search bar should provide clear loading state (animated spinner / disabled submit) during the 8-second fetch window.

</specifics>

<deferred>
## Deferred Ideas

- **Automated UPI QR Payment Gateway**: Real-time automated wallet balance top-ups (Phase 5: Wallet & Credits Management / v2 ENH-03).
- **Bulk CSV Document Lookup**: Institutional batch query processing (v2 ENH-04).
- **Automated OCR from Photo Scans**: Extracting details directly from uploaded physical card images (v2 ENH-01).

</deferred>

---

*Phase: 04-multi-provider-verification-fallback-apis*
*Context gathered: 2026-09-28*
