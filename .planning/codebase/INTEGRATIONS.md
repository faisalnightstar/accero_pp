# External Integrations

**Analysis Date:** 2026-09-28

## External APIs & Services

### 1. Voter Verification & Details API
- **Provider:** NeoAPI (`https://core.neoapi.io/`) and FastNexora (`https://auth.fastnexora.xyz/`)
- **Key Files:**
  - `printportal/admin/voter_new_print.php`
  - `printportal/admin/voter_new_print_2.php`
  - `printportal/admin/voter_neoapi.php`
- **Endpoints:**
  - `GET https://core.neoapi.io/v1/voter/captcha` - Retrieve verification captcha image and session token.
  - `POST https://core.neoapi.io/v1/voter/detail-captcha.php` - Fetch voter record (EPIC number, name, relation, age/DOB, assembly, state, polling station) using captcha solution.
  - `GET https://auth.fastnexora.xyz/api/v1/voterVerification.php?apiKey={KEY}&epicNumber={EPIC}` - Direct EPIC number lookup.
- **Authentication:** Header or query parameter API keys (`NEO_API_KEY`, `$apiKey`).

### 2. Driving License (DL) & RC Verification
- **Provider:** AxenAPI (`https://test.axenapi.co.in/`)
- **Key Files:**
  - `printportal/admin/DLFind_Axen.php`
  - `printportal/admin/dlprint-form.php`
  - `printportal/admin/rc.php`
  - `printportal/admin/rc_get_chip_print_new.php`
- **Endpoints:**
  - `GET https://test.axenapi.co.in/Dashboard/Verify_api/Dl/DLFind.php?mobileNumber={MOB}&name={NAME}&dob={DOB}&api={API_KEY}` - Driving license lookup by details.
  - RC vehicle verification endpoint for vehicle registration number, owner name, fuel type, engine number, chassis number, and insurance validity.
- **Authentication:** Query parameter API key (`$api_hkb`).

### 3. Aadhaar Number & OTP Verification
- **Provider:** AxenAPI / Third-party Aadhaar Gateway
- **Key Files:**
  - `printportal/admin/aadharnumberfind.php`
  - `printportal/design.md`
  - `printportal/admin/aadharmanualnew.php`
- **Endpoints:**
  - `POST https://test.axenapi.co.in/Dashboard/Verify_api/aaOTP/send_otp.php` - Request Aadhaar OTP to registered mobile number.
  - `POST https://test.axenapi.co.in/Dashboard/Verify_api/aaOTP/verify_otp.php` - Verify OTP and retrieve Aadhaar demographic payload.
- **Session/Token Handling:** Returns JWT token (`es_jwtToken`) and salt value (`es_saltValue`) stored in session for subsequent document assembly.

### 4. PAN Verification & NSDL e-PAN Scraper
- **Provider:** NeoAPI & Direct NSDL PAAM scraper (`onlineservices.nsdl.com`)
- **Key Files:**
  - `printportal/admin/Pan_Advance_Axen2.php`
  - `printportal/admin/api.php`
  - `printportal/admin/pannumberfind.php`
- **Endpoints:**
  - Direct scraping of `https://www.onlineservices.nsdl.com/paam/reqEpanLogin.html;jsessionid={JSESSIONID}` using dynamic captcha and cookies pulled from `https://crsorgoverment.com/cookies.php`.
  - NeoAPI PAN verification lookup for PAN cardholder name, father name, and DOB.

### 5. Payment & Wallet Processing
- **Provider:** Paytm / Internal User Wallet system
- **Key Files:**
  - `printportal/admin/wallect.php`
  - `printportal/admin/paytmv/index.php`
  - `printportal/newportal/app/bootstrap.php`
- **Mechanism:**
  - Users recharge their account wallet (`findwallet` / `wallet` table).
  - Each print or search transaction charges a fixed fee (e.g. ₹20 - ₹100 depending on service).
  - Pre-check validates `wallet_amount >= $serviceFee` before invoking external APIs.

## Database & Data Persistence

### Database Engine: MySQL / MariaDB
- **Connection:** `mysqli_connect` in `printportal/config.php` and `printportal/admin/config.php`.
- **Target Replacement:** MongoDB (Atlas or self-hosted) with Mongoose / native MongoDB driver in Next.js.
- **Core Entities:**
  - `users` (credentials, balance, role, contact)
  - `voterauto` / `voterauto3` (voter card records)
  - `aadharauto` / `aadharmanual` (Aadhaar demographic records)
  - `panauto` / `pan_details` (PAN records)
  - `dlprint` / `dllist` (Driving license records)
  - `rc_vehical` (Vehicle RC records)
  - `wallet` / `wallethistory` (Audit ledger of deductions and credits)

## Migration Strategy for Next.js

1. **Secure API Key Management:**
   - Move all vendor API keys from PHP files to `.env.local` / Vercel Environment Variables.
2. **Resilient HTTP Client & Fallbacks:**
   - Centralize API calls in Next.js Server Actions or Route Handlers (`src/app/api/verify/...`).
   - Implement graceful fallbacks: if API lookup returns partial data, return the available fields and prompt the user to manually enter the missing fields.
3. **MongoDB Document Modeling:**
   - Unified `DocumentRecord` schema with document type enum (`PAN`, `AADHAAR`, `VOTER`, `DL`, `RC`), input mode (`MANUAL`, `API`), structured fields, status, and printable snapshot.
4. **Webhook / Callback Architecture:**
   - Payment webhooks cleanly decoupled and secured with HMAC signature verification.

---

*Integrations analysis: 2026-09-28*
*Prepared for Next.js & MongoDB migration*
