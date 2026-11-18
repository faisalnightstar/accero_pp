import { VoterCardData } from '@/types/cards';
import { normalizeEpicNumber } from '../validators';

function cleanStr(val: unknown): string {
  if (val === undefined || val === null) return '';
  return String(val).trim();
}

function isPlaceholder(val: string): boolean {
  const lower = val.toLowerCase();
  return (
    lower === 'xxx' ||
    lower === 'null' ||
    lower === 'undefined' ||
    lower === 'na' ||
    lower === 'n/a' ||
    lower === '-' ||
    lower === '.'
  );
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
  // Prefer applicantFirstName if properly capitalized, else fullName
  const direct = cleanStr(doc.applicantFirstName ?? doc.fullName ?? doc.name ?? doc.electorName);
  if (direct) return direct;
  const combined = [cleanStr(doc.FirstName ?? doc.firstName), cleanStr(doc.LastName ?? doc.lastName)]
    .filter(Boolean)
    .join(' ')
    .trim();
  return combined;
}

function resolveElectorNameRegional(doc: Record<string, any>): string {
  return cleanStr(doc.applicantFirstNameL1 ?? doc.fullNameL1 ?? doc.name_v1 ?? doc.electorNameRegional);
}

function resolveRelationName(doc: Record<string, any>): string {
  return cleanStr(doc.relationName ?? doc.relativeFullName ?? doc.rln_name);
}

function resolveRelationNameRegional(doc: Record<string, any>): string {
  return cleanStr(doc.relationNameL1 ?? doc.relativeFullNameL1 ?? doc.rln_name_v1 ?? doc.relationNameRegional);
}

/**
 * Builds clean comma-separated address avoiding adjacent duplicates and placeholder strings (e.g. XXX).
 */
function buildAddress(parts: (string | undefined | null)[]): string {
  const unique: string[] = [];
  for (const raw of parts) {
    const part = cleanStr(raw);
    if (!part || isPlaceholder(part)) continue;
    if (unique.length === 0 || unique[unique.length - 1].toLowerCase() !== part.toLowerCase()) {
      unique.push(part);
    }
  }
  return unique.join(', ');
}

/**
 * Normalizes WebAPI.in Voter response into unified VoterCardData.
 * Preserves Unicode regional text, constructs English and regional addresses,
 * and never fabricates missing fields (DOB, PIN, etc.).
 */
export function normalizeWebApiInVoter(raw: any, fallbackEpic: string): Partial<VoterCardData> {
  const doc = raw?.data || raw?.response?.docs?.[0] || raw || {};

  const rawEpic = doc.epicNumber || doc.epic || doc.voter_no || raw?.epic || fallbackEpic;
  const epic = normalizeEpicNumber(rawEpic);

  const electorName = resolveElectorName(doc);
  const electorNameRegional = resolveElectorNameRegional(doc);
  const relationName = resolveRelationName(doc);
  const relationNameRegional = resolveRelationNameRegional(doc);
  const relationType = resolveRelationType(doc.relationType ?? doc.rln_type);
  const { gender, genderRegional } = resolveGender(doc.gender);

  const age = doc.age !== undefined && doc.age !== null ? String(doc.age).trim() : '';
  const dateOfBirth = cleanStr(doc.dob ?? doc.dateOfBirth) || '';

  const acNo = cleanStr(doc.acNumber ?? doc.acId ?? doc.ac_no);
  const acName = cleanStr(doc.asmblyName ?? doc.ac_name ?? doc.acName);
  const acNameRegional = cleanStr(doc.asmblyNameL1 ?? doc.ac_name_v1 ?? doc.acNameRegional);
  const assemblyConstituency = acNo && acName ? `${acNo} - ${acName}` : acName || acNo || '';
  const assemblyConstituencyRegional =
    acNo && acNameRegional ? `${acNo} - ${acNameRegional}` : acNameRegional || '';

  const partNo = cleanStr(doc.partNumber ?? doc.partId ?? doc.part_no);
  const partName = cleanStr(doc.partName ?? doc.part_name);
  const partNameRegional = cleanStr(doc.partNameL1 ?? doc.part_name_v1 ?? doc.partNameRegional);
  const partNumberAndName =
    partNo && partName ? `${partNo} - ${partName}` : partName || partNo || '';
  const partNumberAndNameRegional =
    partNo && partNameRegional ? `${partNo} - ${partNameRegional}` : partNameRegional || '';

  const district = cleanStr(doc.districtValue ?? doc.district ?? doc.dist_name);
  const districtRegional = cleanStr(doc.districtValueL1 ?? doc.dist_name_v1 ?? doc.districtRegional);
  const state = cleanStr(doc.stateName ?? doc.state ?? doc.state_1);
  const stateRegional = cleanStr(doc.stateNameL1 ?? doc.state_v1 ?? doc.stateRegional);
  const stateCode = cleanStr(doc.stateCd ?? doc.stateId ?? doc.stateCode);

  // Address components: Use detailed street/locality if available, fallback to part/assembly
  const localityStreet = cleanStr(doc.localityStreet);
  const townVillage = cleanStr(doc.townVillage);
  const tehsil = cleanStr(doc.tehsil);
  const houseNo = isPlaceholder(cleanStr(doc.houseNumber)) ? '' : cleanStr(doc.houseNumber);

  const localityStreetL1 = cleanStr(doc.localityStreetL1);
  const townVillageL1 = cleanStr(doc.townVillageL1);
  const tehsilL1 = cleanStr(doc.tehsilL1);
  const houseNoL1 = isPlaceholder(cleanStr(doc.houseNumberL1)) ? '' : cleanStr(doc.houseNumberL1);

  const englishAddressParts = localityStreet || townVillage || tehsil
    ? [houseNo, localityStreet, townVillage, tehsil, district, state]
    : [partName, acName, district, state];

  const regionalAddressParts = localityStreetL1 || townVillageL1 || tehsilL1
    ? [houseNoL1, localityStreetL1, townVillageL1, tehsilL1, districtRegional, stateRegional]
    : [partNameRegional, acNameRegional, districtRegional, stateRegional];

  const fullAddress = buildAddress(englishAddressParts);
  const fullAddressRegional = buildAddress(regionalAddressParts);

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
    stateCode,
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
