# Quick Task 005: NeoAPI V1/V2 Voter Lookup, Billing Integrity & Studio Workflow

## Objective
Implement and verify the end-to-end NeoAPI Voter (EPIC) lookup workflow in Accero PrintPortal without modifying unrelated PAN, Aadhaar, DL, RC, payment gateway, auth, or admin flows:
- Configure NeoAPI V1 (`https://core.neoapi.io/v1/voter/detail.php`) as primary Voter lookup endpoint and NeoAPI V2 (`https://core.neoapi.io/v2/voter/detail.php`) as automatic fallback via centralized `providerFetch(..., { providerId: 'neoapi' })` and mandatory Fixie static IP routing.
- Enforce strict EPIC validation before external requests and strict NeoAPI response validation (`Message`, `response.docs`, `docs[0].Message`, `docs[0].status`, `sampleCode`, normalized `epic_no` match).
- Map all NeoAPI Voter fields (including Unicode regional fields, independent English/regional addresses, `acNo`/`acName`/`partNo`/`partName`, and safe `null`/`dob`/`age` handling) into existing `DocumentRecord` schema while preserving existing photo/signature/layout/template and user-edited values.
- Implement lookup-time Voter billing (`ServiceConfig` / `SERVICE_FEES.VOTER` = ₹20) strictly after upstream verification succeeds, with atomic `Wallet` conditional debit, `VERIFICATION` ledger entry, `VerificationRequest` idempotency, in-flight deduplication, DB save-failure auto-refund recovery, existing cache/entitlement reuse (`isPaid` without relying on `printCount`), and ₹0 print authorization for already-paid lookups.
- Update Voter Studio UI (`StudioSearchBar`, `QuickLookupModal`, `StudioPage`, `CardForm`) for EPIC validation, V1/V2/cache status messages, live fee sync, `currentDocId` preservation, and safe error handling.
- Add comprehensive automated Vitest coverage (24+ scenarios) and perform controlled live verification.

## Deliverables
1. `src/models/DocumentRecord.ts` & `src/models/VerificationRequest.ts` — Add explicit `isPaid`/`paidAt`/`paymentReferenceId` fields on `DocumentRecord` (already referenced by `pricing.ts`) and lookup indexing on `VerificationRequest`.
2. `src/lib/verify/validators.ts` — EPIC format validation and strict NeoAPI Voter response validation & error classification.
3. `src/lib/verify/providers/neoapi.ts`, `src/lib/verify/providerFactory.ts`, `src/lib/verify/orchestrator.ts`, `src/lib/verify/types.ts` — NeoAPI V1 primary + V2 fallback for Voter over Fixie `providerFetch`.
4. `src/lib/verify/normalizers/voterNormalizer.ts` & `src/lib/documents/documentCache.ts` — Complete NeoAPI field mapping and existing user-edit/media/layout preservation on refresh.
5. `src/lib/wallet/pricing.ts`, `src/lib/documents/voterLookup.ts`, `src/actions/verify.ts`, `src/lib/print/printAuthorization.ts`, `src/app/api/documents/route.ts` — Lookup-time atomic Voter billing, idempotency, crash/save-failure refund recovery, cache entitlement, and ₹0 print re-authorization.
6. `src/components/studio/StudioSearchBar.tsx`, `src/components/dashboard/QuickLookupModal.tsx`, `src/app/studio/page.tsx`, `src/components/studio/CardForm.tsx` — Studio UX for EPIC validation, V1/V2/cache feedback, fee sync, `docId` tracking, and insufficient balance flow.
7. `tests/voter-neoapi-workflow.test.ts` (and minimal updates to `tests/provider-safety.test.ts` & `tests/verification-deduction.test.ts` where legacy Voter assumptions changed).

