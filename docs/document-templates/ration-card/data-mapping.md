# Ration Card Data Mapping & Normalization Specification

**Document Version:** 1.0.0  
**Target Architecture:** Next.js App Router (TypeScript Strict Mode)  
**Modules Covered:** `src/types/cards.ts`, `src/lib/missingFields.ts`, `src/app/api/documents/route.ts`

---

## 1. Overview & Data Ingestion Flow

Accero PrintPortal ingests Ration Card data through three pathways:
1. **Third-Party API Provider Lookup:** External PDS / NFSA state gateway endpoints returning JSON or scraped tabular data.
2. **Direct Manual Input / CSV Ingestion:** Operators creating cards manually or uploading local household records.
3. **Draft Modification in Interactive Studio:** Real-time editing, translation adjustments, and member roster updates.

All pathways feed into the **Accero Normalization Layer** (`mapToRationCardData`) before rendering or database persistence:

```
[External API / Manual Form / Studio Input]
                     │
                     ▼
       ┌───────────────────────────┐
       │   Accero Normalization    │  <-- formatRationCardNumber()
       │  (mapToRationCardData)    │  <-- Category Enum Alignment
       │                           │  <-- Member Roster Sync & Count
       └─────────────┬─────────────┘
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
┌──────────────────┐   ┌───────────────────┐
│ Missing Fields   │   │  Mongoose Model   │
│ Quality Auditor  │   │ (DocumentRecord)  │
└────────┬─────────┘   └───────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│  RationCardCanvas (Front & Reverse)  │
└──────────────────────────────────────┘
```

---

## 2. Legacy Field Cross-Reference & Translation

In legacy systems (Reference 1: `printportal_xyz` and Reference 2: `easyprintportal`), field names were inconsistent, untyped, and varied by state:

| Legacy Field (Reference 1 & 2) | Accero Normalized Key | Type | Description |
| :--- | :--- | :--- | :--- |
| `rc_no`, `ration_no`, `rationcard_no`, `card_no` | `rationCardNumber` | `string` | 10 to 12 digit clean alphanumeric identifier |
| `owner_name`, `hof_name`, `head_name`, `name` | `headOfFamily` | `string` | Head of Family name (English) |
| `owner_name_hi`, `name_reg`, `hof_name_hi` | `headOfFamilyHindi` | `string` | Head of Family name (Devanagari / Regional) |
| `father_name`, `guardian_name`, `husband_name` | `fatherOrHusbandName` | `string` | Father or Husband name (English) |
| `father_name_hi`, `guardian_name_hi` | `fatherOrHusbandNameHindi`| `string`| Father or Husband name (Devanagari / Regional) |
| `card_type`, `scheme`, `ration_type` | `category` | `'PHH' \| 'AAY' \| 'BPL' \| 'APL' \| 'WHITE'` | NFSA Entitlement Category |
| `fps_no`, `dealer_code`, `shop_no` | `fpsCode` | `string` | Fair Price Shop numeric license/code |
| `fps_name`, `dealer_name`, `shop_name` | `fpsName` | `string` | Fair Price Shop authorized dealer/store name |
| `total_member`, `member_count`, `members_no` | `memberCount` | `number` | Derived or explicit total family members count |
| `members[]`, `family_details[]`, `member_list` | `familyMembers` | `RationFamilyMember[]` | Array of beneficiary objects |
| `gas_status`, `lpg_status`, `gas_connection` | `gasConnection` | `string` | Gas subsidy status (e.g. `IOCL - Subsidized`) |
| `address`, `full_address`, `residence` | `address` | `string` | Full household residential address |
| `address_hi`, `address_regional` | `addressHindi` | `string` | Address in regional language |
| `dist_name`, `district` | `district` | `string` | District of residence |
| `state_name`, `state` | `state` | `string` | State or UT jurisdiction |
| `pin`, `pincode`, `postal_code` | `pincode` | `string` | 6-digit postal code |
| `issue_date`, `card_date` | `issueDate` | `string` | Date of card issuance (`DD/MM/YYYY`) |
| `photo`, `photo_url`, `hof_photo` | `photoUrl` | `string` | Head of Family profile photograph |
| `qr_code`, `qr_data` | `qrCodeUrl` | `string` | QR code image or generated data payload |

---

## 3. Strict TypeScript Interface Specifications

Defined in `src/types/cards.ts`:

### 3.1 Beneficiary Member Schema (`RationFamilyMember`)

```typescript
export interface RationFamilyMember {
  memberId: string;       // Unique sequence or member token (e.g., '01')
  name: string;           // Full member name in English
  nameHindi?: string;     // Member name in Devanagari or regional script
  relationship: string;   // Relation to Head of Family (Self, Husband, Wife, Son, Daughter, etc.)
  gender: 'Male' | 'Female' | 'Other' | string;
  age: number | string;
  aadhaarStatus: string;  // Masked UID or Aadhaar seeding status ('Seeded' | '*******1042' | 'Unseeded')
  active?: boolean;       // Beneficiary eligibility flag
}
```

### 3.2 Full Card Document Schema (`RationCardData`)

```typescript
export interface RationCardData {
  // Identity & Card Header
  rationCardNumber: string;
  category: 'PHH' | 'AAY' | 'BPL' | 'APL' | 'WHITE' | string;
  state: string;
  district: string;
  subDistrict?: string;
  villageOrWard?: string;

  // Head of Family
  headOfFamily: string;
  headOfFamilyHindi?: string;
  fatherOrHusbandName?: string;
  fatherOrHusbandNameHindi?: string;
  motherName?: string;
  gender?: string;
  age?: number | string;
  dob?: string;
  photoUrl?: string;

  // Shop & Subsidy Entitlement
  fpsCode?: string;
  fpsName?: string;
  schemeName?: string;
  gasConnection?: string;
  cylinderCount?: number | string;

  // Household & Address
  address: string;
  addressHindi?: string;
  pincode?: string;

  // Family Roster
  memberCount: number;
  familyMembers: RationFamilyMember[];

  // Security & Administrative
  issueDate?: string;
  validUpto?: string;
  qrCodeUrl?: string;
  qrCodeData?: string;
  departmentHeader?: string;
  departmentHeaderHindi?: string;
  layoutFormat?: 'front' | 'back' | 'sheet';
}
```

---

## 4. Normalization Engine (`mapToRationCardData`)

The normalization helper in `src/types/cards.ts` enforces sanitization, default fallbacks, and automatic synchronization:

```typescript
export function mapToRationCardData(input: Partial<RationCardData> = {}): RationCardData {
  // Normalize family members roster
  const rawMembers = Array.isArray(input.familyMembers) ? input.familyMembers : [];
  const normalizedMembers: RationFamilyMember[] = rawMembers.map((m, idx) => ({
    memberId: m.memberId || String(idx + 1).padStart(2, '0'),
    name: m.name || '',
    nameHindi: m.nameHindi || '',
    relationship: m.relationship || 'Member',
    gender: m.gender || 'Female',
    age: m.age || '',
    aadhaarStatus: m.aadhaarStatus || 'Seeded',
    active: m.active !== false,
  }));

  // Auto-synchronize member count if roster exists
  const calculatedCount = normalizedMembers.length > 0 
    ? normalizedMembers.length 
    : (Number(input.memberCount) || 1);

  return {
    rationCardNumber: (input.rationCardNumber || '').trim().toUpperCase(),
    category: (input.category || 'PHH').trim().toUpperCase(),
    state: input.state || 'UTTAR PRADESH',
    district: input.district || '',
    subDistrict: input.subDistrict || '',
    villageOrWard: input.villageOrWard || '',
    headOfFamily: input.headOfFamily || '',
    headOfFamilyHindi: input.headOfFamilyHindi || '',
    fatherOrHusbandName: input.fatherOrHusbandName || '',
    fatherOrHusbandNameHindi: input.fatherOrHusbandNameHindi || '',
    motherName: input.motherName || '',
    gender: input.gender || 'Female',
    age: input.age || '',
    dob: input.dob || '',
    photoUrl: input.photoUrl || '',
    fpsCode: input.fpsCode || '',
    fpsName: input.fpsName || '',
    schemeName: input.schemeName || 'NFSA - National Food Security Act',
    gasConnection: input.gasConnection || 'None / Not Linked',
    cylinderCount: input.cylinderCount || '',
    address: input.address || '',
    addressHindi: input.addressHindi || '',
    pincode: input.pincode || '',
    memberCount: calculatedCount,
    familyMembers: normalizedMembers,
    issueDate: input.issueDate || '',
    validUpto: input.validUpto || '',
    qrCodeUrl: input.qrCodeUrl || '',
    qrCodeData: input.qrCodeData || '',
    departmentHeader: input.departmentHeader || 'Food & Civil Supplies Department',
    departmentHeaderHindi: input.departmentHeaderHindi || 'खाद्य एवं रसद विभाग',
    layoutFormat: input.layoutFormat || 'sheet',
  };
}
```

---

## 5. Missing Fields Quality Rules

In `src/lib/missingFields.ts`, the zero missing-data engine evaluates document completeness before authorizing print runs:

| Field Key | Label | Severity | Verification Rule |
| :--- | :--- | :--- | :--- |
| `rationCardNumber` | Ration Card Number | **CRITICAL** | Minimum 6 alphanumeric characters |
| `headOfFamily` | Head of Family Name | **CRITICAL** | Minimum 2 characters |
| `category` | Ration Category | **HIGH** | Must match `PHH`, `AAY`, `BPL`, `APL`, or `WHITE` |
| `address` | Residential Address | **HIGH** | Minimum 5 characters |
| `fpsCode` | Fair Price Shop Code | **MEDIUM** | Minimum 3 alphanumeric characters |
| `familyMembers` | Family Beneficiaries | **MEDIUM** | Must contain at least 1 valid member |
| `photoUrl` | Head of Family Photograph | **LOW / OPTIONAL** | Generates placeholder avatar if absent |

