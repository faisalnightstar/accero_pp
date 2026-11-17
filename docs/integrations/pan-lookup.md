# PAN Verification & Demographic Lookup Gateway

## 1. Overview & Architecture

The PAN Verification Gateway provides production-ready, high-availability demographic verification for Indian Permanent Account Numbers (PAN). It integrates directly with WebAPI endpoints (`webapi.in.net`), featuring automatic silent failover between API V1 and API V2, date format normalization, strict security sanitization, and atomic wallet billing.

```
Frontend PAN Form / Dashboard
       │
       ▼
Authenticated API Route (/api/pan/lookup)
       │
       ▼
PAN Format Validation (^[A-Z]{5}[0-9]{4}[A-Z]$)
       │
       ▼
Wallet Balance & 72-Hour Cache Check
       │
       ▼
PAN Lookup Service (executePanLookupStrategy)
       │
       ├──── Primary: API V1 (webapi.in.net/api/pan_verification.php)
       │        └─ Failover on timeout / not found
       └──── Secondary: API V2 (webapi.in.net/api/pan_verification1.php)
       │
       ▼
Response Normalization (DD-MM-YYYY, boolean aadhaar_no)
       │
       ▼
Atomic Idempotent Wallet Debit (Exactly once on success, ₹0 on failure)
       │
       ▼
DocumentRecord & PanLookupRecord Persistence
       │
       ▼
1-Click Pre-fill in Split-Screen Card Studio
```

---

## 2. API Endpoints

### API V1 (Primary)
- **URL**: `GET https://webapi.in.net/api/pan_verification.php?token={API_TOKEN}&pan_no={PAN_NUMBER}`
- **Response Format**:
```json
{
  "status": "100",
  "message": "PAN Validate Successfully",
  "pan": "MJPPK9654Q",
  "fullname": "DEEPAK KUMAR",
  "fathername": "SURENDRA RAM",
  "dob": "2004-08-07",
  "gender": "Male",
  "aadhaar_no": false
}
```
- **Key Characteristics**: Returns ISO `YYYY-MM-DD` date of birth, gender, and boolean `aadhaar_no` seeding flag.

### API V2 (Secondary / Direct)
- **URL**: `GET https://webapi.in.net/api/pan_verification1.php?token={API_TOKEN}&pan_no={PAN_NUMBER}`
- **Response Format**:
```json
{
  "status": "100",
  "message": "PAN Validate Successfully",
  "pan": "QJLPK9500H",
  "fullname": "SHIV",
  "fathername": "JAGAT",
  "dob": "20-08-1900"
}
```
- **Key Characteristics**: Returns `DD-MM-YYYY` date of birth. Does not provide `gender` or `aadhaar_no` (normalized to `null`).

---

## 3. Environment Configuration & Security

Add the following environment variable to your deployment or `.env.local`:

```bash
# Server-side API Token for WebAPI.in.net
PAN_LOOKUP_API_TOKEN=your_secure_api_token_here

# Optional: route via Fixie proxy if static IP whitelisting is required
# PAN_LOOKUP_USE_FIXIE=true
```

### Security Guarantees:
1. **Zero Credential Exposure**: `PAN_LOOKUP_API_TOKEN` is strictly server-side; it is never sent to the browser or returned in API payloads.
2. **Safe Logging**: Full request URLs are never logged because query parameters contain the API token and PAN number. Sensitive PAN numbers are masked (`MJP*****4Q`) in all log lines.
3. **Outbound Host Allowlist**: Registered in `src/lib/network/provider-registry.ts` with `allowedHostnames: ['webapi.in.net']` and `requireHttps: true` to prevent SSRF and arbitrary URL invocation.
4. **Strict Regex Validation**: Every request is validated against `^[A-Z]{5}[0-9]{4}[A-Z]$` before calling external providers.

---

## 4. Normalization Rules

The normalized result model is represented as:

```typescript
export interface PANLookupResult {
  pan: string;
  fullName: string | null;
  fatherName: string | null;
  dateOfBirth: string | null;     // Normalized to DD-MM-YYYY
  gender: string | null;          // "Male", "Female", or null
  aadhaarNumberAvailable: boolean | null; // boolean flag, never fabricates UID
  providerVersion: 'v1' | 'v2';
  message: string;
  status: 'SUCCESS' | 'FAILED';
  errorCode?: string;
  errorMessage?: string;
  feeDeducted?: number;
  currentBalance?: number;
  isFreeReprint?: boolean;
  docId?: string;
  transactionReferenceId?: string;
  fallbackUsed?: boolean;
  latencyMs?: number;
}
```

### Date Normalization
- Supports `YYYY-MM-DD` and `DD-MM-YYYY`.
- Normalizes all output dates to `DD-MM-YYYY` (e.g., `2004-08-07` → `07-08-2004`).
- Validates calendar month/day boundaries while preserving valid historical dates (e.g., `20-08-1900`).

### Aadhaar Status
- `"aadhaar_no": false` is normalized as a boolean (`false`), indicating that the Aadhaar number is not linked or unavailable.
- Never infers or fabricates partial or full Aadhaar numbers.

---

## 5. Wallet Integration & Idempotency

- **Pricing SSOT**: Uses the active service pricing configured via `getConfiguredServicePricing('PAN')` (or `ServiceConfig` in MongoDB).
- **Atomic Deduction**: Deducts balance using an atomic `$inc` with a deterministic transaction reference ID (`PAN_LOOKUP:${userId}:${cleanPan}`) in `Wallet.findOneAndUpdate`.
- **Zero-Charge on Failure**: Failed lookups, invalid PANs, and provider errors incur **₹0** fee.
- **Failover Protection**: When fallback routes from V1 to V2, only **one single charge** is applied upon verified success.
- **72-Hour Cache & Free Reprints**: Successful verifications are persisted to `DocumentRecord` with 72-hour TTL. Repeat queries within 72 hours return the cached record for **₹0** (Free Lifetime Reprint).

---

## 6. Frontend & Studio Integration

1. **Dedicated Page**: `/dashboard/pan-lookup` (with alias `/pan-lookup`).
2. **Dashboard Integration**: Quick link from Dashboard PAN Card Studio to the PAN Verification Gateway.
3. **Card Studio Auto-fill**:
   - 1-Click "Open in Card Studio & Print PVC" routes to `/studio?type=pan&lookup={PAN}`.
   - Studio auto-loads legal name, father's name, DOB, and generates official XML barcode string (`PrintLetterBarcodeData uid="..." name="..." dob="..." co="..."`).

---

## 7. Testing Suite

The test suite in `tests/pan-lookup.test.ts` covers 27 comprehensive scenarios:
- Input validation (case conversion, trimming, length, checksum characters)
- Provider response validation (status 100 verification, PAN match, token expiry detection)
- Normalization (V1 full payload, V2 payload, dates, boolean Aadhaar)
- Strategy execution (V1 direct, V2 direct, V1 → V2 failover, dual-endpoint failure, timeout)
- Wallet billing (insufficient balance check, atomic deduction, zero charge on failure, failover deduplication, 72h cache)
- Server action integration (`verifyDocument('pan', ...)` with session guard and card mapping)

Run the tests:
```bash
npx vitest run tests/pan-lookup.test.ts
```
