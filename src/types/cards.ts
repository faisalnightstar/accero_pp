export type DocumentType = 'pan' | 'aadhaar' | 'voter' | 'dl' | 'rc';

/**
 * Standard PAN Card Data Payload (Income Tax Department / NSDL / UTIITSL)
 */
export interface PanCardData {
  panNumber: string; // e.g. ABCDE1234F
  fullName: string;
  fatherName: string;
  dateOfBirth: string; // DD/MM/YYYY
  photoUrl?: string;
  signatureUrl?: string;
  qrData?: string;
  category?: 'Individual' | 'Company' | 'Trust' | 'HUF';
  issueDate?: string;
}

/**
 * Standard Voter ID / EPIC Card Data Payload (Election Commission of India)
 */
export interface VoterCardData {
  epicNumber: string; // e.g. AXH0801639
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
  careOf: string; // e.g. "S/O: Sunil Sonkar" or "C/O: ..."
  careOfRegional?: string;
  address: string;
  addressRegional?: string;
  photoUrl?: string;
  downloadDate?: string;
  issueDate?: string;
  vid?: string; // 16-digit Virtual ID
  enrollmentNo?: string;
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
  address: string;
  issueDate: string; // DD-MM-YYYY
  validityNonTransport: string; // DD-MM-YYYY
  validityTransport?: string; // DD-MM-YYYY
  vehicleClasses: Array<{
    code: string; // e.g. MCWG, LMV
    desc: string; // e.g. Motor Cycle With Gear, Light Motor Vehicle
    issueDate: string;
  }>;
  issuingAuthority: string; // e.g. "RTO NEW DELHI"
  photoUrl?: string;
  signatureUrl?: string;
}

/**
 * Standard Vehicle RC Data Payload (Form 23 - Registration Certificate)
 */
export interface RcCardData {
  registrationNumber: string; // e.g. "UP16DL3137"
  registrationDate: string; // DD/MM/YYYY
  chassisNumber: string;
  engineNumber: string;
  ownerName: string;
  sonWifeDaughterOf?: string;
  address: string;
  vehicleClass: string; // e.g. "M-CYCLE/SCOOTER(2WN)" or "MOTOR CAR"
  makerModel: string; // e.g. "HONDA MOTORCYCLES / ACTIVA 6G"
  fuelType: string; // PETROL / DIESEL / CNG / ELECTRIC
  emissionNorm?: string; // BHARAT STAGE VI
  seatingCapacity?: string | number;
  unladenWeight?: string;
  color?: string;
  hypothecatedTo?: string; // Bank / Financier name
  fitnessValidUpto?: string;
  taxPaidUpto?: string;
  insuranceValidUpto?: string;
  issuingAuthority?: string; // e.g. "RTO NOIDA (UP16)"
}
