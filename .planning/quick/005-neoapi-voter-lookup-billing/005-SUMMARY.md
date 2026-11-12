# Quick Task 005 Summary: NeoAPI V1/V2 Voter Lookup, Billing Integrity & Studio Workflow

## What Was Done
1. **NeoAPI V1 Primary + V2 Fallback & Strict Response Validation**:
   - Created `src/lib/verify/validators.ts` with `validateEpicNumber()` (rejecting invalid EPIC formats before calling NeoAPI) and `validateNeoApiVoterResponse()` (strictly checking top-level `Message`, `response.docs` non-empty array, `docs[0].Message`, `docs[0].status`, `sampleCode` where applicable, normalized `epic_no` match, and `AUTH_ERROR` classification including HTTP 401/403 and HTTP 200 `sampleCode: "403"` IP-authorization errors).
   - Updated `src/lib/verify/providers/neoapi.ts` so `'voter'` calls `https://core.neoapi.io/v1/voter/detail.php` first via `providerFetch(..., { providerId: 'neoapi' })` (Fixie static IP proxy, 8s timeout) and automatically retries `https://core.neoapi.io/v2/voter/detail.php` only on V1 failure/malformed/empty/mismatch responses, never exposing API keys or citizen PII in logs or customer-facing errors.
   - Updated `src/lib/verify/providerFactory.ts` so `'voter'` uses `NeoApiProvider` as primary (V1 -> V2) without falling back to `MockProvider` on live failures.
2. **Field Mapping & Existing Record/User-Edit Preservation**:
   - Updated `src/lib/verify/normalizers/voterNormalizer.ts` to map all NeoAPI Voter fields (`ac_no`/`acNumber`, `ac_name`, `ac_name_v1`, `part_no`, `part_name`, `part_name_v1`, `district`, `dist_name_v1`, `state`, `state_v1`, `rln_type`, `gender`, `age`, `dob`, Unicode regional names) without fabricating missing house numbers, PIN codes, or DOB, generating English and regional addresses independently.
   - Updated `src/models/DocumentRecord.ts` (added optional `isPaid`, `paidAt`, `paymentReferenceId` fields already checked by `pricing.ts`) and `src/lib/documents/documentCache.ts` (`mergeDocumentDataPreservingEdits()` preserves media, template/layout settings, manually edited values, and non-empty fields against `null`/missing API values).
   - Updated `src/app/api/documents/route.ts` to reuse existing tenant+docType+identifier records on save rather than creating duplicates.
3. **Lookup-Time Voter Billing, Concurrency Atomicity & Free Printing**:
   - Updated `src/models/VerificationRequest.ts` with provider/version/document tracking fields and tenant-lookup index.
   - Updated `src/lib/wallet/pricing.ts` (`getConfiguredServicePricing()` reading `ServiceConfig` with `SERVICE_FEES.VOTER` fallback, and `hasPaidVoterLookupEntitlement()` checking `DocumentRecord.isPaid`, `VerificationRequest.COMPLETED`, and deterministic `Wallet` ledger entry — never using `printCount` as proof of lookup payment).
   - Created `src/lib/documents/voterLookup.ts` (`lookupAndBillVoter()`) and wired it in `src/actions/verify.ts` (`verifyDocument` for `'voter'`), enforcing cache reuse (`₹0`), in-process + MongoDB atomic idempotency, balance check, atomic `Wallet` conditional debit + `VERIFICATION` ledger entry, and automatic compensating refund (`REFUNDED` + `WALLET_DEDUCTION_REFUNDED`) if DB save fails post-debit.
   - Updated `src/lib/print/printAuthorization.ts` so already-paid Voter lookups (`DocumentRecord.isPaid === true` or `VerificationRequest.COMPLETED`) authorize prints at `₹0`.
4. **Voter Studio UI**:
   - Updated `src/components/studio/StudioSearchBar.tsx`, `src/components/dashboard/QuickLookupModal.tsx`, `src/app/studio/page.tsx`, and `src/components/studio/CardForm.tsx` for client-side EPIC validation, live fee syncing, clear V1 / V2 fallback / cache messages, `currentDocId` preservation, and `age`/regional district/state editing.
5. **Testing & Verification**:
   - Added `tests/voter-neoapi-workflow.test.ts` covering 25 scenarios (API fallback, Fixie routing, billing, concurrency, crash recovery, cache/expiry, user-edit preservation, and regional mapping) and updated Voter assertions in `tests/provider-safety.test.ts` and `tests/verification-deduction.test.ts`.
   - Verified `npm test` (22 test files, 228 passed) and `npm run build` (clean production build).
   - Executed live Fixie + NeoAPI + MongoDB diagnostics: confirmed Fixie static IP egress (`54.195.3.54` / `54.217.142.99`), V1 -> V2 fallback execution, strict response rejection with zero wallet deduction on NeoAPI `403` IP-whitelist rejection (`54.217.142.99` not yet in NeoAPI `allowed_ips`), and real MongoDB Atlas end-to-end persistence/debit/ledger/free-print behavior with synthetic payload.

