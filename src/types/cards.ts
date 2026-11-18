import type { FarmerLanguageCode } from '@/lib/farmerLanguages';

export type DocumentType = 'pan' | 'aadhaar' | 'voter' | 'dl' | 'rc' | 'ration' | 'farmer';

/**
 * Landholding Record for Farmer ID Registry Cards
 */
export interface FarmerLandRecord {
  khata: string; // Land account number
  khasra: string; // Land parcel number
  area: string | number; // Recorded land area
}

/**
 * Standard Farmer ID Card Data Payload (AgriStack / Rajasthan Farmer Registry)
 */
export interface FarmerCardData {
  farmerId?: string; // e.g. "4256 177 6703"
  farmerName?: string; // e.g. "Mohan Singh"
  farmerNameRegional?: string; // e.g. "मोहन सिंह"
  gender?: string; // e.g. "Male" or "Male / Male"
  genderRegional?: string; // e.g. "पुरुष", "ஆண்"
  dateOfBirth?: string; // DD/MM/YYYY
  caste?: string; // e.g. "General", "OBC", "SC", "ST"
  areaCategory?: string; // e.g. "Rural" / "Urban"
  aadhaarNumber?: string; // 12-digit UID
  maskAadhaar?: boolean; // Privacy masking toggle (default: true)
  photoUrl?: string;
  qrPayload?: string;
  approvalDate?: string; // e.g. "15/06/2025"
  downloadDate?: string; // e.g. "15/06/2025"
  departmentHeaderRegional?: string; // e.g. "भारत सरकार"
  departmentHeaderEnglish?: string; // e.g. "Government of India"
  departmentTitleRegional?: string;
  departmentTitleHindi?: string;
  departmentTitleEnglish?: string;
  ministryHeaderRegional?: string; // e.g. "कृषि एवं किसान कल्याण मंत्रालय"
  ministryHeaderEnglish?: string; // e.g. "Ministry of Agri & Farmers Welfare"
  ministryTitleRegional?: string;
  ministryTitleHindi?: string;
  ministryTitleEnglish?: string;
  registryTitle?: string; // e.g. "Rajasthan Farmer Registry"
  registryTitleRegional?: string;
  helplineNumber?: string; // e.g. "1800-180-1551"
  websiteUrl?: string; // e.g. "www.rjfr.agristack.gov.in"
  language?: FarmerLanguageCode; // Regional language code (e.g. 'HI', 'PA', 'GU', 'MR', 'TA', 'TE', etc.)
  address?: {
    fatherOrSpouseName?: string; // e.g. "S/O: Keshariya"
    houseNumber?: string;
    village?: string;
    locality?: string;
    tehsil?: string;
    district?: string;
    state?: string;
    pinCode?: string;
    fullAddress?: string;
  };
  landRecords?: FarmerLandRecord[];
  layoutFormat?: 'cr80' | 'sheet';
  templateVariant?: 'rajasthan' | 'default';
}

/**
 * Formats a raw or spaced Farmer ID into standard 4-3-4 grouping (e.g. "4256 177 6703")
 */
export function formatFarmerId(farmerId?: string): string {
  if (!farmerId) return '';
  const trimmed = farmerId.trim();
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length === 11) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 11)}`;
  }
  if (digits.length === 12) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 8)} ${digits.slice(8, 12)}`;
  }
  return trimmed;
}

/**
 * Masks 12-digit Aadhaar for privacy compliance (e.g. "XXXX XXXX 9250" or "XXXXXXXX9250")
 */
export function maskAadhaarNumber(aadhaar?: string, spaced: boolean = false): string {
  if (!aadhaar) return '';
  const raw = aadhaar.trim().replace(/\s+/g, '');
  if (raw.length === 12) {
    const last4 = raw.slice(8, 12);
    return spaced ? `XXXX XXXX ${last4}` : `XXXXXXXX${last4}`;
  }
  return aadhaar;
}

/**
 * Formats structured or flat farmer address
 */
export function formatFarmerAddress(addr?: FarmerCardData['address']): string {
  if (!addr) return '';
  if (addr.fullAddress && addr.fullAddress.trim()) {
    return addr.fullAddress.trim();
  }
  const parts: string[] = [];
  if (addr.fatherOrSpouseName) parts.push(addr.fatherOrSpouseName.trim());
  if (addr.houseNumber) parts.push(`house no. ${addr.houseNumber.trim()}`);
  if (addr.locality) parts.push(addr.locality.trim());
  if (addr.village) parts.push(addr.village.trim());
  if (addr.tehsil) parts.push(addr.tehsil.trim());
  if (addr.district) parts.push(addr.district.trim());
  
  const base = parts.filter(Boolean).join(', ');
  const stateAndPin = [addr.state?.trim(), addr.pinCode?.trim()].filter(Boolean).join(' - ');

  if (base && stateAndPin) return `${base}, ${stateAndPin}`;
  if (base) return base;
  return stateAndPin;
}

/**
 * Normalizes raw AgriStack/Farmer API responses into FarmerCardData
 */
export function mapToFarmerCardData(raw: any): FarmerCardData {
  if (!raw || typeof raw !== 'object') {
    return {};
  }

  // Handle nested raw.data or root
  const src = raw.data || raw.raw || raw;

  const rawLand = src.landRecords || src.land_records || src.landDetails || [];
  const landRecords: FarmerLandRecord[] = Array.isArray(rawLand)
    ? rawLand.map((rec: any) => ({
        khata: String(rec.khata ?? rec.khata_no ?? rec.khataNo ?? ''),
        khasra: String(rec.khasra ?? rec.khasra_no ?? rec.khasraNo ?? ''),
        area: rec.area ?? rec.rakba ?? rec.land_area ?? '',
      }))
    : [];

  const rawAddr = src.address;
  let structuredAddress: FarmerCardData['address'] = undefined;

  if (typeof rawAddr === 'object' && rawAddr !== null) {
    structuredAddress = {
      fatherOrSpouseName: rawAddr.fatherOrSpouseName || rawAddr.father_name || rawAddr.co || rawAddr.careOf,
      houseNumber: rawAddr.houseNumber || rawAddr.house_no || rawAddr.houseNo,
      village: rawAddr.village || rawAddr.village_name,
      locality: rawAddr.locality,
      tehsil: rawAddr.tehsil || rawAddr.sub_district,
      district: rawAddr.district,
      state: rawAddr.state || 'Rajasthan',
      pinCode: rawAddr.pinCode || rawAddr.pincode || rawAddr.pin,
      fullAddress: rawAddr.fullAddress || rawAddr.full_address,
    };
  } else if (typeof rawAddr === 'string' && rawAddr.trim()) {
    structuredAddress = {
      fullAddress: rawAddr.trim(),
      fatherOrSpouseName: src.fatherOrSpouseName || src.father_name,
      state: src.state || 'Rajasthan',
    };
  }

  const farmerId = src.farmerId || src.farmer_id || src.application_no || src.applicationNo || '';
  const qrPayload =
    src.qrPayload ||
    src.qr_code ||
    src.qrData ||
    (farmerId ? `https://rjfr.agristack.gov.in/verify?id=${encodeURIComponent(farmerId.replace(/\s+/g, ''))}` : '');

  const rawGender = src.gender || src.gender_eng || 'Male';
  let genderRegional = src.genderRegional || src.gender_regional || '';
  let genderEnglish = rawGender;

  if (rawGender.includes('/')) {
    const parts = rawGender.split('/').map((p: string) => p.trim());
    if (parts.length >= 2) {
      if (!genderRegional) genderRegional = parts[0];
      genderEnglish = parts[1];
    }
  }

  return {
    farmerId: formatFarmerId(farmerId),
    farmerName: src.farmerName || src.name || src.farmer_name || '',
    farmerNameRegional: src.farmerNameRegional || src.regionalName || src.name_regional || src.hindi_name || '',
    gender: genderEnglish,
    genderRegional,
    dateOfBirth: src.dateOfBirth || src.dob || '',
    caste: src.caste || src.caste_category || '',
    areaCategory: src.areaCategory || src.area || src.rural_urban || 'Rural',
    aadhaarNumber: src.aadhaarNumber || src.aadhaar || src.uid || src.uidNumber || '',
    maskAadhaar: src.maskAadhaar !== false,
    photoUrl: src.photoUrl || src.photo || src.photo_base64 || '',
    qrPayload,
    approvalDate: src.approvalDate || src.approval_date || src.issue_date || src.date || '',
    downloadDate: src.downloadDate || src.download_date || '',
    departmentHeaderRegional: src.departmentHeaderRegional || src.departmentTitleRegional || '',
    departmentTitleRegional: src.departmentTitleRegional || src.departmentHeaderRegional || '',
    departmentTitleHindi: src.departmentTitleHindi || 'भारत सरकार',
    departmentHeaderEnglish: src.departmentHeaderEnglish || src.departmentTitleEnglish || 'Government of India',
    departmentTitleEnglish: src.departmentTitleEnglish || src.departmentHeaderEnglish || 'Government of India',
    ministryHeaderRegional: src.ministryHeaderRegional || src.ministryTitleRegional || '',
    ministryTitleRegional: src.ministryTitleRegional || src.ministryHeaderRegional || '',
    ministryHeaderEnglish: src.ministryHeaderEnglish || src.ministryTitleEnglish || 'Ministry of Agri & Farmers Welfare',
    ministryTitleEnglish: src.ministryTitleEnglish || src.ministryHeaderEnglish || 'Ministry of Agri & Farmers Welfare',
    registryTitle: src.registryTitle || 'Rajasthan Farmer Registry',
    helplineNumber: src.helplineNumber || '1800-180-1551',
    websiteUrl: src.websiteUrl || 'www.rjfr.agristack.gov.in',
    language: (src.language ? String(src.language).toUpperCase() : 'HI') as FarmerLanguageCode,
    address: structuredAddress,
    landRecords,
    layoutFormat: src.layoutFormat || 'cr80',
    templateVariant: src.templateVariant || 'rajasthan',
  };
}

/**
 * Family Member record within a Ration Card
 */
export interface RationFamilyMember {
  slNo?: number;
  memberId?: string;
  name: string;
  nameRegional?: string;
  relation: string; // e.g. "Head of Family", "Wife", "Son", "Daughter", "Mother", "Father"
  relationRegional?: string;
  gender: string; // e.g. "Male", "Female", "Other"
  genderRegional?: string;
  age: number;
  uidLinked: boolean;
  uidMasked?: string; // e.g. "XXXX-XXXX-1234"
}

/**
 * Standard Ration Card Data Payload (Department of Food & Public Distribution / NFSA)
 */
export interface RationCardData {
  rationCardNumber: string; // e.g. "10350050028009409992" or "212345678901"
  headOfFamily: string;
  headOfFamilyRegional?: string;
  fatherOrSpouseName?: string;
  fatherOrSpouseNameRegional?: string;
  category: 'AAY' | 'PHH' | 'BPL' | 'APL' | 'WHITE';
  schemeName?: string;
  fpsName?: string;
  fpsCode?: string;
  memberCount: number;
  familyMembers?: RationFamilyMember[];
  gasConnectionStatus?: string;
  address: string;
  addressRegional?: string;
  district?: string;
  districtRegional?: string;
  state?: string;
  stateRegional?: string;
  stateCode?: string;
  issueDate?: string;
  validUpto?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  photoUrl?: string;
  qrPayload?: string;
  departmentHeaderRegional?: string;
  departmentHeaderEnglish?: string;
  helplineNumber?: string;
  websiteUrl?: string;
  onorcEligible?: boolean;
  layoutFormat?: 'cr80' | 'sheet';
}

export function formatRationCardNumber(rcNumber?: string): string {
  if (!rcNumber) return '';
  const clean = rcNumber.trim().replace(/\s+/g, '');
  if (clean.length === 12) {
    return clean.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3');
  }
  if (clean.length === 20) {
    return clean.replace(/(\d{4})(\d{4})(\d{4})(\d{4})(\d{4})/, '$1 $2 $3 $4 $5');
  }
  return rcNumber.trim();
}

export function mapToRationCardData(src: Partial<RationCardData>): RationCardData {
  const familyMembers: RationFamilyMember[] = (src.familyMembers && src.familyMembers.length > 0)
    ? src.familyMembers.map((m, idx) => ({
        slNo: m.slNo ?? (idx + 1),
        memberId: m.memberId || `M00${idx + 1}`,
        name: m.name || `Member ${idx + 1}`,
        nameRegional: m.nameRegional || '',
        relation: m.relation || (idx === 0 ? 'Self (Head)' : 'Family Member'),
        relationRegional: m.relationRegional || '',
        gender: m.gender || 'Male',
        genderRegional: m.genderRegional || '',
        age: Number(m.age) || 30,
        uidLinked: m.uidLinked ?? true,
        uidMasked: m.uidMasked || 'XXXX-XXXX-1234',
      }))
    : [
        {
          slNo: 1,
          memberId: 'M001',
          name: src.headOfFamily || 'Sunita Devi',
          nameRegional: src.headOfFamilyRegional || 'सुनीता देवी',
          relation: 'Self (Head)',
          relationRegional: 'स्वयं (मुखिया)',
          gender: 'Female',
          genderRegional: 'महिला',
          age: 42,
          uidLinked: true,
          uidMasked: 'XXXX-XXXX-4589',
        },
        {
          slNo: 2,
          memberId: 'M002',
          name: src.fatherOrSpouseName || 'Ramesh Kumar',
          nameRegional: src.fatherOrSpouseNameRegional || 'रमेश कुमार',
          relation: 'Spouse (Husband)',
          relationRegional: 'पति',
          gender: 'Male',
          genderRegional: 'पुरुष',
          age: 46,
          uidLinked: true,
          uidMasked: 'XXXX-XXXX-7812',
        },
        {
          slNo: 3,
          memberId: 'M003',
          name: 'Aman Kumar',
          nameRegional: 'अमन कुमार',
          relation: 'Son',
          relationRegional: 'पुत्र',
          gender: 'Male',
          genderRegional: 'पुरुष',
          age: 18,
          uidLinked: true,
          uidMasked: 'XXXX-XXXX-3341',
        },
        {
          slNo: 4,
          memberId: 'M004',
          name: 'Priya Kumari',
          nameRegional: 'प्रिया कुमारी',
          relation: 'Daughter',
          relationRegional: 'पुत्री',
          gender: 'Female',
          genderRegional: 'महिला',
          age: 15,
          uidLinked: true,
          uidMasked: 'XXXX-XXXX-9023',
        },
      ];

  const derivedMemberCount = Number(src.memberCount) || familyMembers.length;

  return {
    rationCardNumber: src.rationCardNumber || '10350050028009409992',
    headOfFamily: src.headOfFamily || 'Sunita Devi',
    headOfFamilyRegional: src.headOfFamilyRegional || 'सुनीता देवी',
    fatherOrSpouseName: src.fatherOrSpouseName || 'Ramesh Kumar',
    fatherOrSpouseNameRegional: src.fatherOrSpouseNameRegional || 'रमेश कुमार',
    category: src.category || 'PHH',
    schemeName: src.schemeName || 'PHH - Priority Household (पात्र गृहस्थी)',
    fpsName: src.fpsName || 'Shri Ram Kripa Sahkari Bhandar',
    fpsCode: src.fpsCode || '10423001',
    memberCount: derivedMemberCount,
    familyMembers,
    gasConnectionStatus: src.gasConnectionStatus || 'Yes (PMUY)',
    address: src.address || 'House No. 42, Ward 12, Rampur, Patna, Bihar - 800001',
    addressRegional: src.addressRegional || 'मकान नं. 42, वार्ड 12, रामपुर, पटना, बिहार - 800001',
    district: src.district || 'Patna',
    districtRegional: src.districtRegional || 'पटना',
    state: src.state || 'Bihar',
    stateRegional: src.stateRegional || 'बिहार',
    issueDate: src.issueDate || '12/04/2021',
    validUpto: src.validUpto || 'Life Time',
    status: src.status || 'ACTIVE',
    photoUrl: src.photoUrl || '',
    qrPayload: src.qrPayload || (src.rationCardNumber ? `https://nfsa.gov.in/portal/ration_card_verification?rcid=${encodeURIComponent(src.rationCardNumber.replace(/\s+/g, ''))}` : 'https://nfsa.gov.in'),
    departmentHeaderRegional: src.departmentHeaderRegional || 'खाद्य एवं नागरिक आपूर्ति विभाग',
    departmentHeaderEnglish: src.departmentHeaderEnglish || 'Food, Civil Supplies & Consumer Affairs Department',
    helplineNumber: src.helplineNumber || '1967 / 1800-180-2087',
    websiteUrl: src.websiteUrl || 'nfsa.gov.in',
    onorcEligible: src.onorcEligible ?? true,
    layoutFormat: src.layoutFormat || 'cr80',
  };
}

/**
 * Standard PAN Card Data Payload (Income Tax Department / NSDL / UTIITSL)
 */
export interface PanCardData {
  panNumber: string; // e.g. ABCDE1234F
  fullName: string;
  fatherName: string;
  dateOfBirth: string; // DD/MM/YYYY
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  photoUrl?: string;
  signatureUrl?: string;
  qrData?: string;
  category?: 'Individual' | 'Company' | 'Trust' | 'HUF';
  issueDate?: string;
  templateVariant?: 'nsdl' | 'utiitsl';
  layoutFormat?: 'cr80' | 'sheet';
}

/**
 * Generates official Indian e-PAN / UIDAI XML barcode string for high-density QR code
 */
export function getPanQrXmlString(data: Partial<PanCardData>): string {
  if (data.qrData) return data.qrData;
  const panno = (data.panNumber || 'ABCDE1234F').toUpperCase();
  const name = (data.fullName || '').toUpperCase();
  const father = (data.fatherName || '').toUpperCase();
  const dob = data.dateOfBirth || '';
  const gender = data.gender === 'FEMALE' ? 'F' : 'M';
  return `<?xml version="1.0" encoding="UTF-8"?><PrintLetterBarcodeData uid="${panno}" name="${name}" dob="${dob}" gender="${gender}" co="${father}"/>`;
}

/**
 * Standard Voter ID / EPIC Card Data Payload (Election Commission of India)
 * Multi-lingual e-EPIC support matching voter_capc-advance.php
 */
export interface VoterCardData {
  epicNumber: string; // e.g. ABC0123456
  electorName: string; // English
  electorNameRegional?: string; // Hindi / Regional (e.g. राम कुमार)
  relationType: 'FATHER' | 'HUSBAND' | 'OTHER';
  relationName: string; // English
  relationNameRegional?: string; // Hindi / Regional (e.g. दशरत कुमार)
  gender: 'Male' | 'Female' | 'Other';
  genderRegional?: string;
  age?: string | number;
  dateOfBirth?: string; // DD/MM/YYYY or YYYY
  assemblyConstituency: string; // e.g. "14 - Varanasi"
  assemblyConstituencyRegional?: string; // e.g. "14 - वाराणसी"
  partNumberAndName: string; // e.g. "257 - PRATHMIK VIDYALAY Rohaniya"
  partNumberAndNameRegional?: string; // e.g. "257 - प्राथमिक विद्यालय रोहनिया"
  district?: string;
  districtRegional?: string;
  state?: string;
  stateRegional?: string;
  stateCode?: string;
  fullAddress: string;
  fullAddressRegional?: string;
  photoUrl?: string;
  signatureUrl?: string;
  issueDate?: string;
  // Multi-lingual & Form 23 / advance fields
  language?: 'HI' | 'PA' | 'GU' | 'MR' | 'TA' | 'KN' | 'BN' | 'TE' | 'OR' | 'SD';
  houseNo?: string;
  tehsil?: string;
  partNo?: string;
  partName?: string;
  partNameRegional?: string;
  acNo?: string;
  acName?: string;
  acNameRegional?: string;
  pollDate?: string;
  timings?: string;
  serialNo?: string;
  pollingStation?: string;
  downloadDate?: string;
  labelNameRegional?: string;
  labelRelationRegional?: string;
  labelGenderRegional?: string;
  labelDobRegional?: string;
  labelAddressRegional?: string;
  labelSignRegional?: string;
  layoutFormat?: 'cr80' | 'sheet';
  templateVariant?:
  | 'hindi'
  | 'punjabi'
  | 'gujarat'
  | 'marathi'
  | 'tamil'
  | 'kannada'
  | 'bangla'
  | 'telugu'
  | 'odia'
  | 'sindhi'
  | 'assam'
  | 'legacy';
}

/**
 * Standard Aadhaar Card Data Payload (UIDAI)
 */
export interface AadhaarCardData {
  aadhaarNumber: string; // 12 digits (e.g. "5749 0326 7673")
  name: string; // English
  nameRegional?: string; // Hindi / Regional
  dateOfBirth: string; // DD/MM/YYYY or Year of Birth
  dateOfBirthRegional?: string;
  gender: 'MALE' | 'FEMALE' | 'TRANSGENDER';
  genderRegional?: string;
  careOf: string; // e.g. "S/O Sunil Sonkar" or "C/O: ..."
  careOfRegional?: string;
  address: string;
  addressRegional?: string;
  photoUrl?: string;
  downloadDate?: string;
  issueDate?: string;
  vid?: string; // 16-digit Virtual ID
  enrollmentNo?: string;
  mobile?: string;
  language?: 'HI' | 'PA' | 'GU' | 'MR' | 'TA' | 'KN' | 'BN' | 'TE' | 'OR' | 'SD';
  labelAddressRegional?: string;
  labelDobRegional?: string;
  labelGenderRegional?: string;
  layoutFormat?: 'cr80' | 'sheet';
  templateVariant?: 'pvc' | 'default';
}

/**
 * Standard Driving License Vehicle Class Endorsement (Form 7 match)
 */
export interface DlVehicleClass {
  code: string; // e.g. MCWG, LMV, TRANS
  desc: string; // e.g. Motor Cycle With Gear, Light Motor Vehicle
  issueDate: string;
  category?: string; // e.g. NT, TR
}

/**
 * Standard Driving License Data Payload (Ministry of Road Transport & Highways)
 */
export interface DlCardData {
  dlNumber: string; // e.g. "DL-0420110123456"
  holderName: string;
  fatherOrHusbandName: string;
  dateOfBirth: string; // DD-MM-YYYY
  bloodGroup?: string;
  gender?: string;
  organDonor?: string;
  address: string;
  state?: string; // e.g. "UTTAR PRADESH"
  issueDate: string; // DD-MM-YYYY
  validityNonTransport: string; // DD-MM-YYYY
  validityTransport?: string; // DD-MM-YYYY
  emergencyContact?: string;
  adpvehNo?: string;
  hazardousValidUpto?: string;
  hillValidUpto?: string;
  vehicleClasses: DlVehicleClass[];
  issuingAuthority: string; // e.g. "RTO NEW DELHI"
  photoUrl?: string;
  signatureUrl?: string;
  templateVariant?: 'authentic' | 'vector';
}

/**
 * Standard Vehicle RC Data Payload (Form 23A - Smart Registration Certificate)
 */
export interface RcCardData {
  registrationNumber: string; // e.g. "UP05LD1234"
  registrationDate: string; // DD/MM/YYYY or DD-Mon-YYYY
  chassisNumber: string;
  engineNumber: string;
  ownerName: string;
  sonWifeDaughterOf?: string;
  address: string;
  vehicleClass: string; // e.g. "M-CYCLE/SCOOTER" or "MOTOR CAR"
  makerModel?: string; // Legacy combined string e.g. "HONDA / ACTIVA 6G"
  maker?: string; // e.g. "TVS MOTOR COMPANY LTD"
  model?: string; // e.g. "TVSNTORQ125-SUPER SQUADEDITION"
  fuelType: string; // PETROL / DIESEL / CNG / ELECTRIC
  emissionNorm?: string; // BHARAT STAGE VI
  seatingCapacity?: string | number; // e.g. 0 or 2
  unladenWeight?: string | number; // e.g. 0 or 118
  color?: string; // e.g. "BLACK"
  bodyType?: string; // e.g. "2 WHEELER"
  cubicCapacity?: string | number; // e.g. "124.8"
  horsePower?: string | number; // e.g. "0"
  wheelBase?: string | number; // e.g. "0"
  monthYearOfMfg?: string; // e.g. "9/2022"
  noOfCylinders?: string | number; // e.g. "0"
  hypothecatedTo?: string; // Bank / Financier name
  financier?: string; // e.g. "BANDHAN BANK LTD"
  fitnessValidUpto?: string; // e.g. "22-Oct-2037"
  regnValidity?: string; // e.g. "22-Oct-2037"
  taxPaidUpto?: string;
  insuranceValidUpto?: string;
  issuingAuthority?: string; // e.g. "RTO NOIDA (UP16)"
  registeringAuthority?: string; // e.g. "Noida, Uttar Pradesh"
  stateIssued?: string; // e.g. "Issued by Government of Uttar Pradesh"
  stateCode?: string; // e.g. "UP"
  transportType?: string; // e.g. "NT" or "T"
  ownerSerial?: number | string; // e.g. 1
  cardIssueDate?: string; // e.g. "30-08-2026"
  qrPayload?: string;
  layoutFormat?: 'cr80' | 'sheet';
  templateVariant?: 'authentic' | 'vector';
}

export const STATE_CODE_TO_NAME: Record<string, string> = {
  AN: 'Andaman and Nicobar',
  AP: 'Andhra Pradesh',
  AR: 'Arunachal Pradesh',
  AS: 'Assam',
  BR: 'Bihar',
  CH: 'Chandigarh',
  CG: 'Chhattisgarh',
  DD: 'Daman and Diu',
  DL: 'Delhi',
  DN: 'Dadra and Nagar Haveli',
  GA: 'Goa',
  GJ: 'Gujarat',
  HP: 'Himachal Pradesh',
  HR: 'Haryana',
  JH: 'Jharkhand',
  JK: 'Jammu and Kashmir',
  KA: 'Karnataka',
  KL: 'Kerala',
  LA: 'Ladakh',
  LD: 'Lakshadweep',
  MH: 'Maharashtra',
  ML: 'Meghalaya',
  MN: 'Manipur',
  MP: 'Madhya Pradesh',
  MZ: 'Mizoram',
  NL: 'Nagaland',
  OD: 'Odisha',
  PB: 'Punjab',
  PY: 'Puducherry',
  RJ: 'Rajasthan',
  SK: 'Sikkim',
  TN: 'Tamil Nadu',
  TR: 'Tripura',
  TS: 'Telangana',
  UK: 'Uttarakhand',
  UP: 'Uttar Pradesh',
  WB: 'West Bengal',
};

/**
 * Smart derivation helper for Form 23A Vehicle RC cards
 */
export function getRcDerivedValues(data: Partial<RcCardData>) {
  const regNo = (data.registrationNumber || 'UP05LD1234').trim().toUpperCase();
  const rawPrefix = regNo.slice(0, 2);
  const derivedStateCode = data.stateCode || (STATE_CODE_TO_NAME[rawPrefix] ? rawPrefix : 'UP');
  const stateName = STATE_CODE_TO_NAME[derivedStateCode] || 'Uttar Pradesh';

  const derivedStateIssued =
    data.stateIssued || `Issued by Government of ${stateName}`;
  const derivedTransportType = data.transportType || 'NT';
  const derivedOwnerSerial = data.ownerSerial || 1;
  const derivedRegnValidity = data.regnValidity || data.fitnessValidUpto || '22-Oct-2037';
  const derivedFinancier = data.financier || data.hypothecatedTo || 'BANDHAN BANK LTD';
  const derivedAuthority = data.registeringAuthority || data.issuingAuthority || 'Noida, Uttar Pradesh';

  // Maker & Model extraction
  let derivedMaker = data.maker || '';
  let derivedModel = data.model || '';
  if ((!derivedMaker || !derivedModel) && data.makerModel) {
    const parts = data.makerModel.split('/');
    if (parts.length >= 2) {
      if (!derivedMaker) derivedMaker = parts[0].trim();
      if (!derivedModel) derivedModel = parts.slice(1).join('/').trim();
    } else {
      if (!derivedMaker) derivedMaker = data.makerModel;
    }
  }

  return {
    stateCode: derivedStateCode,
    stateIssued: derivedStateIssued,
    transportType: derivedTransportType,
    ownerSerial: derivedOwnerSerial,
    regnValidity: derivedRegnValidity,
    financier: derivedFinancier,
    registeringAuthority: derivedAuthority,
    maker: derivedMaker || 'TVS MOTOR COMPANY LTD',
    model: derivedModel || 'TVSNTORQ125-SUPER SQUADEDITION',
  };
}

