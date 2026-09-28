import { VoterCardData } from '@/types/cards';

function resolveGender(rawGender?: string | null): 'Male' | 'Female' | 'Other' {
  if (!rawGender) return 'Male';
  const g = rawGender.trim().toUpperCase();
  if (g === 'M' || g === 'MALE' || g === 'पुरुष') return 'Male';
  if (g === 'F' || g === 'FEMALE' || g === 'महिला') return 'Female';
  return 'Other';
}

function resolveRelationType(rlnType?: string | null): 'FATHER' | 'HUSBAND' | 'OTHER' {
  if (!rlnType) return 'FATHER';
  const r = rlnType.trim().toUpperCase();
  if (r.includes('FTHR') || r.includes('FATHER') || r.includes('पिता')) return 'FATHER';
  if (r.includes('HUSB') || r.includes('HUSBAND') || r.includes('पति')) return 'HUSBAND';
  return 'OTHER';
}

/**
 * Normalizes NeoAPI Voter response object into VoterCardData
 */
export function normalizeNeoApiVoter(raw: any, epicNumber: string): Partial<VoterCardData> {
  const doc = raw?.response?.docs?.[0] || raw?.data || raw || {};

  const epic = (doc.epic_no || doc.epicNumber || epicNumber).toUpperCase();
  const electorName = doc.name || doc.electorName || '';
  const electorNameRegional = doc.name_v1 || doc.electorNameRegional || '';
  const relationName = doc.rln_name || doc.relationName || '';
  const relationNameRegional = doc.rln_name_v1 || doc.relationNameRegional || '';
  const relationType = resolveRelationType(doc.rln_type);
  const gender = resolveGender(doc.gender);

  const acNo = doc.ac_no || '';
  const acName = doc.ac_name || '';
  const acNameV1 = doc.ac_name_v1 || '';
  const assemblyConstituency = acNo && acName ? `${acNo} - ${acName}` : acName || '';
  const assemblyConstituencyRegional = acNo && acNameV1 ? `${acNo} - ${acNameV1}` : acNameV1 || '';

  const partNo = doc.part_no || '';
  const partName = doc.part_name || '';
  const partNameV1 = doc.part_name_v1 || '';
  const partNumberAndName = partNo && partName ? `${partNo} - ${partName}` : partName || '';
  const partNumberAndNameRegional = partNo && partNameV1 ? `${partNo} - ${partNameV1}` : partNameV1 || '';

  const district = doc.district || doc.dist_name || '';
  const districtRegional = doc.dist_name_v1 || '';
  const state = doc.state || '';
  const stateRegional = doc.state_v1 || '';

  const fullAddress = [partName, acName, district, state].filter(Boolean).join(', ');
  const fullAddressRegional = [partNameV1, acNameV1, districtRegional, stateRegional].filter(Boolean).join(', ');

  return {
    epicNumber: epic,
    electorName: electorName.trim(),
    electorNameRegional: electorNameRegional.trim(),
    relationType,
    relationName: relationName.trim(),
    relationNameRegional: relationNameRegional.trim(),
    gender,
    genderRegional: gender === 'Male' ? 'पुरुष' : gender === 'Female' ? 'महिला' : 'अन्य',
    age: doc.age || '',
    dateOfBirth: doc.dob || '',
    assemblyConstituency,
    assemblyConstituencyRegional,
    partNumberAndName,
    partNumberAndNameRegional,
    district,
    districtRegional,
    state,
    stateRegional,
    fullAddress,
    fullAddressRegional,
  };
}

/**
 * Normalizes FastNexora Voter response object into VoterCardData
 */
export function normalizeFastNexoraVoter(raw: any, epicNumber: string): Partial<VoterCardData> {
  const data = raw?.data || raw || {};
  return normalizeNeoApiVoter(data, epicNumber);
}
