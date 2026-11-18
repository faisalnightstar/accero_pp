# WebAPI.in Voter Lookup Integration

## 1. Overview & Provider Profile

`webapi_in` is a high-speed verification provider implemented in Accero PrintPortal to query the National Electoral Services roll. It supports two primary modes of operation:
1. **Direct Voter Lookup**: Headless zero-friction lookup by EPIC number without user intervention.
2. **Captcha-Assisted Lookup**: Interactive fallback when direct scraping endpoints encounter upstream government captcha challenges or session locks.

| Attribute | Value |
|---|---|
| **Provider ID** | `webapi_in` |
| **Provider Name** | WebAPI.in Voter Services |
| **Base URL** | `https://webapi.in.net/api/` |
| **Supported Modes** | Direct (`voter_details.php`), Captcha Challenge (`voter_captcha.php`), Captcha Lookup (`voter_captcha_info.php`) |
| **Credential Variable** | `WEBAPI_IN_TOKEN` (Server-side secret) |
| **Default Routing** | Direct HTTPS (Configurable to Fixie Static Outbound IP via `VOTER_LOOKUP_USE_FIXIE` or `WEBAPI_IN_USE_FIXIE`) |

---

## 2. Security & Credentials Isolation

To prevent credential leakage and protect tenant accounts:
- **Zero Client Exposure**: `WEBAPI_IN_TOKEN` is loaded solely in server-side Next.js Node.js runtimes (`src/lib/config/env.ts`). It is never bundled into client components (`NEXT_PUBLIC_` is strictly forbidden).
- **Masked Diagnostics**: In all administrative interfaces (`/admin/services`) and logging outputs, tokens are irreversibly masked (e.g. `web_••••••••••••e12a`).
- **Zero Trust of Upstream Accounting**: WebAPI.in returns fields like `debited` and `remaining_balance` in its response. **These values are strictly ignored by PrintPortal**. Wallet deductions in PrintPortal are handled exclusively by PrintPortal's atomic MongoDB ledger.

---

## 3. Endpoints & Request Workflows

### 3.1 Direct Voter Lookup

Direct lookup is the preferred high-speed mode. It requires only the citizen's EPIC number.

- **Endpoint**: `GET https://webapi.in.net/api/voter_details.php`
- **Query Parameters**:
  - `token`: Server-side API token (`WEBAPI_IN_TOKEN`).
  - `voter_no`: Standard 10-character alphanumeric EPIC number (e.g. `TMV0654962`).

#### Example Request:
```bash
curl -X GET "https://webapi.in.net/api/voter_details.php?token=SECRET_TOKEN&voter_no=TMV0654962" \
  -H "Accept: application/json"
```

#### Example Response:
```json
{
  "status": true,
  "message": "voter details fetched successfully",
  "debited": 2,
  "remaining_balance": 4980440,
  "epic": "TMV0654962",
  "data": {
    "id": "219049822_TMV0654962_S24",
    "epicId": 219049822,
    "epicNumber": "TMV0654962",
    "formReferenceNo": "S24165G8C2702261200097",
    "applicantFirstName": "Mo Wahid",
    "applicantFirstNameL1": "मो वाहिद",
    "relationName": "Mo Khalil",
    "relationNameL1": "मो खलील",
    "age": 50,
    "gender": "M",
    "partNumber": 212,
    "partName": "MASTER MAIND PUBLIC SCHOOL ROOM NO.2",
    "partNameL1": "मास्टर माइंड पब्लिक स्कूल कक्ष सं0-२",
    "partSerialNumber": 320,
    "asmblyName": "Unnao",
    "asmblyNameL1": "उन्नाव",
    "acNumber": 165,
    "prlmntName": "Unnao",
    "prlmntNo": "33",
    "districtValue": "Unnao",
    "districtValueL1": "उन्नाव",
    "districtCd": "S2458",
    "stateName": "Uttar Pradesh",
    "stateNameL1": "उत्तर प्रदेश",
    "stateCd": "S24",
    "relationType": "FTHR",
    "houseNumber": "XXX",
    "localityStreet": "Eidgah Road Near Vidya Vatika",
    "localityStreetL1": "ईदगाह रोड निअर विद्या वाटिका",
    "townVillage": "Gandhi nagar",
    "tehsil": "Unnao Sadar"
  }
}
```

---

### 3.2 Captcha Generation

When upstream direct endpoints require interactive verification, PrintPortal triggers the Captcha workflow.

- **Endpoint**: `GET https://webapi.in.net/api/voter_captcha.php`
- **Query Parameters**:
  - `token`: Server-side API token (`WEBAPI_IN_TOKEN`).

#### Example Response:
```json
{
  "success": true,
  "captcha": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "captchaId": "2B73AF6CC915445BD939F0EF7A7C93B1"
}
```

PrintPortal validates the base64 data URI format, returns the sanitized `captcha` image and `captchaId` to the client modal, and holds no persistent PII in memory.

---

### 3.3 Captcha-Based Voter Lookup

Submits the user's solved captcha along with the `captchaId` and state code.

- **Endpoint**: `GET https://webapi.in.net/api/voter_captcha_info.php`
- **Query Parameters**:
  - `token`: Server-side API token (`WEBAPI_IN_TOKEN`).
  - `voter_no`: Citizen's EPIC number.
  - `captchaId`: Challenge identifier received from `voter_captcha.php`.
  - `captcha`: Alphanumeric text entered by the user.
  - `stateCd`: 3-character state code (e.g. `S24` for Uttar Pradesh, `U05` for NCT of Delhi).

---

## 4. Normalization Engine (`webapiInNormalizer.ts`)

WebAPI.in returns fields with distinct naming conventions compared to NeoAPI and the PrintPortal database model. `normalizeWebApiInVoterData()` maps and cleans this data into standard `VoterCardData`:

### Mapping Table

| WebAPI.in Field | Canonical `VoterCardData` Field | Transformation / Cleaning Rule |
|---|---|---|
| `applicantFirstName` / `fullName` | `electorName` | Fallback order: `fullName` -> `applicantFirstName` -> `'N/A'`. Trimmed. |
| `applicantFirstNameL1` / `fullNameL1` | `electorNameRegional` | Regional Devanagari/vernacular script. Preserved intact for dual-language cards. |
| `relationName` / `relativeFullName` | `fatherOrHusbandName` | Trimmed. |
| `relationNameL1` / `relativeFullNameL1` | `relationNameRegional` | Vernacular relation name. |
| `relationType` | `relationType` | Normalizes `FTHR` / `HUSB` / `MTHR` to `'Father'`, `'Husband'`, `'Mother'`. |
| `epicNumber` / `epic` | `epicNumber` | Uppercased, trimmed. |
| `age` | `age` | Formatted as string integer. |
| `dob` | `dob` | Defaults to `null` if omitted (standard for Indian Voter IDs showing only Age). |
| `gender` | `gender` | Standardized to `'M'`, `'F'`, or `'O'`. |
| `houseNumber` | Part of `address` | **Sanitization Rule**: If value equals `'XXX'`, `'-'`, or empty, it is suppressed to prevent card printing artifacts. |
| `localityStreet`, `townVillage`, `tehsil`, `districtValue`, `stateName` | `address` | Joined cleanly with commas. |
| `asmblyName` & `acNumber` | `assemblyConstituency` & `assemblyNo` | Normalized. |
| `prlmntName` & `prlmntNo` | `parliamentaryConstituency` & `parliamentaryNo` | Normalized. |
| `partName` & `partNumber` | `partName` & `partNumber` | Mapped directly for card back rendering. |

---

## 5. Studio UI Integration

The Studio Search Bar (`src/components/studio/StudioSearchBar.tsx`) provides seamless user interaction:

1. **Direct Mode (Default)**: User enters their 10-character EPIC number and clicks Search. The server attempts direct lookup (WebAPI.in or NeoAPI).
2. **Interactive Captcha Modal**:
   - If direct lookup fails with `CAPTCHA_REQUIRED` or if the user clicks the "Captcha Mode" shield button in the UI, a modal opens.
   - Fetches a live captcha via `getVoterCaptchaAction()`.
   - Displays the challenge image with a high-contrast Refresh button.
   - Provides a State Code selector dropdown (with all 36 Indian states/UTs).
   - Allows the user to input the captcha solution and submit.
   - On completion, closes the modal, populates the card canvas in real time, and completes atomic wallet deduction.
