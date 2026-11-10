export type DocumentType = 'pan' | 'aadhaar' | 'voter' | 'dl' | 'rc' | 'ration';

/**
 * Standard Ration Card Data Payload (Department of Food & Public Distribution)
 */
export interface RationCardData {
  rationCardNumber: string; // e.g. "RC1234567890"
  headOfFamily: string;
  headOfFamilyRegional?: string;
  fatherOrSpouseName?: string;
  category: 'AAY' | 'PHH' | 'BPL' | 'APL' | 'WHITE';
  fpsName?: string;
  fpsCode?: string;
  memberCount: number;
  familyMembers?: Array<{
    name: string;
    relation: string;
    gender: string;
    age: number;
    uidLinked: boolean;
  }>;
  address: string;
  district?: string;
  state?: string;
  issueDate?: string;
  status: 'ACTIVE' | 'INACTIVE';
  layoutFormat?: 'cr80' | 'sheet';
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
  electorNameRegional?: string; // Hindi / Regional (e.g. रूपलाल साह)
  relationType: 'FATHER' | 'HUSBAND' | 'OTHER';
  relationName: string; // English
  relationNameRegional?: string; // Hindi / Regional (e.g. चंद्रिका साह)
  gender: 'Male' | 'Female' | 'Other';
  genderRegional?: string;
  age?: string | number;
  dateOfBirth?: string; // DD/MM/YYYY or YYYY
  assemblyConstituency: string; // e.g. "14 - GOVINDGANJ"
  assemblyConstituencyRegional?: string; // e.g. "14 - गोविन्दगंज"
  partNumberAndName: string; // e.g. "257 - PRATHMIK VIDYALAY JHAKHARA"
  partNumberAndNameRegional?: string; // e.g. "257 - प्राथमिक विद्यालय झखरा"
  district?: string;
  districtRegional?: string;
  state?: string;
  stateRegional?: string;
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

