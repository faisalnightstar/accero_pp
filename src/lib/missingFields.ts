import { DocumentType } from '@/types/cards';

export interface DocumentFieldRule {
  key: string;
  label: string;
  required: boolean;
  section: 'identity' | 'demographics' | 'address' | 'technical' | 'media';
  placeholder?: string;
}

export interface CompletenessResult {
  totalRequired: number;
  filledCount: number;
  missingKeys: string[];
  missingFields: DocumentFieldRule[];
  completionScore: number; // 0 to 100
  isPrintReady: boolean;
}

/** Declarative rules for PAN Card */
export const panRules: DocumentFieldRule[] = [
  { key: 'panNumber', label: 'PAN Number', required: true, section: 'identity' },
  { key: 'fullName', label: 'Cardholder Name', required: true, section: 'identity' },
  { key: 'fatherName', label: "Father's Name", required: true, section: 'demographics' },
  { key: 'dateOfBirth', label: 'Date of Birth', required: true, section: 'demographics' },
];

/** Declarative rules for Aadhaar Card */
export const aadhaarRules: DocumentFieldRule[] = [
  { key: 'aadhaarNumber', label: 'Aadhaar Number', required: true, section: 'identity' },
  { key: 'name', label: 'Resident Name (English)', required: true, section: 'identity' },
  { key: 'nameRegional', label: 'Resident Name (Regional)', required: true, section: 'identity' },
  { key: 'dateOfBirth', label: 'Date of Birth', required: true, section: 'demographics' },
  { key: 'gender', label: 'Gender', required: true, section: 'demographics' },
  { key: 'address', label: 'Full Address (English)', required: true, section: 'address' },
  { key: 'addressRegional', label: 'Full Address (Regional)', required: true, section: 'address' },
];

/** Declarative rules for Voter ID / EPIC */
export const voterRules: DocumentFieldRule[] = [
  { key: 'epicNumber', label: 'EPIC Number', required: true, section: 'identity' },
  { key: 'electorName', label: 'Elector Name (English)', required: true, section: 'identity' },
  { key: 'electorNameRegional', label: 'Elector Name (Regional)', required: true, section: 'identity' },
  { key: 'relationName', label: 'Relation Name (English)', required: true, section: 'demographics' },
  { key: 'relationNameRegional', label: 'Relation Name (Regional)', required: true, section: 'demographics' },
  { key: 'gender', label: 'Gender', required: true, section: 'demographics' },
  { key: 'assemblyConstituency', label: 'Assembly Constituency', required: true, section: 'address' },
  { key: 'partNumberAndName', label: 'Part Number and Name', required: true, section: 'address' },
  { key: 'fullAddress', label: 'Full Address', required: true, section: 'address' },
];

/** Declarative rules for Driving License */
export const dlRules: DocumentFieldRule[] = [
  { key: 'dlNumber', label: 'DL Number', required: true, section: 'identity' },
  { key: 'holderName', label: 'Driver Full Name', required: true, section: 'identity' },
  { key: 'fatherOrHusbandName', label: "Father/Husband Name", required: true, section: 'demographics' },
  { key: 'dateOfBirth', label: 'Date of Birth', required: true, section: 'demographics' },
  { key: 'address', label: 'Permanent Address', required: true, section: 'address' },
  { key: 'issueDate', label: 'Issue Date', required: true, section: 'technical' },
  { key: 'validityNonTransport', label: 'Validity Non-Transport', required: true, section: 'technical' },
  { key: 'issuingAuthority', label: 'Issuing Authority', required: true, section: 'technical' },
];

/** Declarative rules for Vehicle RC */
export const rcRules: DocumentFieldRule[] = [
  { key: 'registrationNumber', label: 'Registration Number', required: true, section: 'identity' },
  { key: 'registrationDate', label: 'Registration Date', required: true, section: 'technical' },
  { key: 'chassisNumber', label: 'Chassis Number', required: true, section: 'technical' },
  { key: 'engineNumber', label: 'Engine Number', required: true, section: 'technical' },
  { key: 'ownerName', label: 'Owner Full Name', required: true, section: 'demographics' },
  { key: 'vehicleClass', label: 'Vehicle Class', required: true, section: 'technical' },
  { key: 'makerModel', label: 'Maker & Model Description', required: true, section: 'technical' },
  { key: 'fuelType', label: 'Fuel Type', required: true, section: 'technical' },
  { key: 'address', label: 'Owner Address', required: true, section: 'address' },
];

export const documentRulesMap: Record<DocumentType, DocumentFieldRule[]> = {
  pan: panRules,
  aadhaar: aadhaarRules,
  voter: voterRules,
  dl: dlRules,
  rc: rcRules,
};

/**
 * Analyzes an active document data payload and detects all missing/unfilled required fields
 */
export function analyzeDocumentCompleteness(
  docType: DocumentType,
  data: Record<string, any>
): CompletenessResult {
  const rules = documentRulesMap[docType] || [];
  const requiredRules = rules.filter((r) => r.required);
  const missingFields: DocumentFieldRule[] = [];
  const missingKeys: string[] = [];

  for (const rule of requiredRules) {
    const value = data[rule.key];
    const isBlank =
      value === undefined ||
      value === null ||
      (typeof value === 'string' && value.trim() === '') ||
      (Array.isArray(value) && value.length === 0);

    if (isBlank) {
      missingFields.push(rule);
      missingKeys.push(rule.key);
    }
  }

  const totalRequired = requiredRules.length;
  const filledCount = totalRequired - missingFields.length;
  const completionScore = totalRequired > 0 ? Math.round((filledCount / totalRequired) * 100) : 100;
  const isPrintReady = missingFields.length === 0;

  return {
    totalRequired,
    filledCount,
    missingKeys,
    missingFields,
    completionScore,
    isPrintReady,
  };
}
