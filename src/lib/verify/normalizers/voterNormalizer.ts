import { VoterCardData } from '@/types/cards';
import { formatToStandardDate } from './panNormalizer';
import { normalizeEpicNumber } from '../validators';

function cleanStr(val: unknown): string {
  if (val === undefined || val === null) return '';
  return String(val).trim();
}

function resolveGender(rawGender?: unknown): {
  gender: VoterCardData['gender'] | '';
  genderRegional: string;
} {
  const g = cleanStr(rawGender).toUpperCase();
  if (!g) return { gender: '', genderRegional: '' };

  if (g === 'M' || g === 'MALE' || g === 'पुरुष') {
    return { gender: 'Male', genderRegional: 'पुरुष' };
  }
  if (g === 'F' || g === 'FEMALE' || g === 'महिला') {
    return { gender: 'Female', genderRegional: 'महिला' };
  }
  if (g === 'O' || g === 'OTHER' || g === 'T' || g === 'TG' || g === 'TRANSGENDER' || g === 'अन्य') {
    return { gender: 'Other', genderRegional: 'अन्य' };
  }
  return { gender: 'Other', genderRegional: 'अन्य' };
}

function resolveRelationType(rlnType?: unknown): 'FATHER' | 'HUSBAND' | 'OTHER' {
  const r = cleanStr(rlnType).toUpperCase();
  if (!r) return 'FATHER';
  if (r.includes('HUSB') || r === 'H' || r.includes('पति')) return 'HUSBAND';
  if (r.includes('FTHR') || r.includes('FATHER') || r === 'F' || r.includes('पिता')) return 'FATHER';
  if (r.includes('MTHR') || r.includes('MOTHER') || r.includes('OTHR') || r.includes('OTHER')) {
    return 'OTHER';
  }
  return 'FATHER';
}

function resolveElectorName(doc: Record<string, any>): string {
  const direct = cleanStr(doc.name ?? doc.electorName);
  if (direct) return direct;
  const combined = [cleanStr(doc.FirstName), cleanStr(doc.LastName)].filter(Boolean).join(' ').trim();
  return combined;
}

/**
 * Joins non-empty address components while avoiding exact adjacent duplicates.
 */
function buildAddress(parts: string[]): string {
  const unique: string[] = [];
  for (const raw of parts) {
    const part = raw.trim();
    if (!part) continue;
    if (unique.length === 0 || unique[unique.length - 1].toLowerCase() !== part.toLowerCase()) {
      unique.push(part);
    }
  }
  return unique.join(', ');
}

/**
 * Normalizes NeoAPI Voter response object into VoterCardData.
 * Preserves Unicode regional text, constructs English and regional addresses independently,
 * and never fabricates missing fields (house numbers, PIN codes, DOB).
 */
export function normalizeNeoApiVoter(raw: any, epicNumber: string): Partial<VoterCardData> {
  const doc = raw?.response?.docs?.[0] || raw?.data || raw || {};

  const epic = normalizeEpicNumber(doc.epic_no || doc.epicNumber || epicNumber);
  const electorName = resolveElectorName(doc);
  const electorNameRegional = cleanStr(doc.name_v1 ?? doc.electorNameRegional);
  const relationName = cleanStr(doc.rln_name ?? doc.relationName);
  const relationNameRegional = cleanStr(doc.rln_name_v1 ?? doc.relationNameRegional);
  const relationType = resolveRelationType(doc.rln_type ?? doc.relationType);
  const { gender, genderRegional } = resolveGender(doc.gender);

  const age = cleanStr(doc.age);
  const dateOfBirth = formatToStandardDate(cleanStr(doc.dob ?? doc.dateOfBirth));

  const acNo = cleanStr(doc.ac_no ?? doc.acNumber ?? doc.acNo);
  const acName = cleanStr(doc.ac_name ?? doc.acName);
  const acNameRegional = cleanStr(doc.ac_name_v1 ?? doc.acNameRegional);
  const assemblyConstituency = acNo && acName ? `${acNo} - ${acName}` : acName || acNo || '';
  const assemblyConstituencyRegional =
    acNo && acNameRegional ? `${acNo} - ${acNameRegional}` : acNameRegional || '';

  const partNo = cleanStr(doc.part_no ?? doc.partNo);
  const partName = cleanStr(doc.part_name ?? doc.partName);
  const partNameRegional = cleanStr(doc.part_name_v1 ?? doc.partNameRegional);
  const partNumberAndName =
    partNo && partName ? `${partNo} - ${partName}` : partName || partNo || '';
  const partNumberAndNameRegional =
    partNo && partNameRegional ? `${partNo} - ${partNameRegional}` : partNameRegional || '';

  const district = cleanStr(doc.district ?? doc.dist_name);
  const districtRegional = cleanStr(doc.dist_name_v1 ?? doc.districtRegional);
  const state = cleanStr(doc.state ?? doc.state_1);
  const stateRegional = cleanStr(doc.state_v1 ?? doc.stateRegional);

  const fullAddress = buildAddress([partName, acName, district, state]);
  const fullAddressRegional = buildAddress([
    partNameRegional,
    acNameRegional,
    districtRegional,
    stateRegional,
  ]);

  return {
    epicNumber: epic,
    electorName,
    electorNameRegional,
    relationType,
    relationName,
    relationNameRegional,
    gender: (gender || '') as VoterCardData['gender'],
    genderRegional,
    age,
    dateOfBirth,
    assemblyConstituency,
    assemblyConstituencyRegional,
    partNumberAndName,
    partNumberAndNameRegional,
    partNo,
    partName,
    partNameRegional,
    acNo,
    acName,
    acNameRegional,
    district,
    districtRegional,
    state,
    stateRegional,
    fullAddress,
    fullAddressRegional,
    photoUrl: cleanStr(doc.photoUrl),
    signatureUrl: cleanStr(doc.signatureUrl) || '/assets/voter/voter-officer-sign.png',
    language: 'HI',
    labelNameRegional: 'नाम',
    labelRelationRegional: relationType === 'HUSBAND' ? 'पति का नाम' : 'पिता का नाम',
    labelGenderRegional: 'लिंग',
    labelDobRegional: 'जन्म तिथि / आयु',
    labelAddressRegional: 'पता',
    labelSignRegional: 'निर्वाचक रजिस्ट्रीकरण अधिकारी',
    layoutFormat: 'cr80',
    templateVariant: 'hindi',
  };
}

/**
 * Normalizes FastNexora Voter response object into VoterCardData
 */
export function normalizeFastNexoraVoter(raw: any, epicNumber: string): Partial<VoterCardData> {
  const data = raw?.data || raw || {};
  return normalizeNeoApiVoter(data, epicNumber);
}
