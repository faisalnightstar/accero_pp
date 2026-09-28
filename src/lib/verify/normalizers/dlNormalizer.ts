import { DlCardData } from '@/types/cards';

/**
 * Normalizes raw AxenAPI DL response into DlCardData
 */
export function normalizeAxenDl(raw: any, dlNumber: string): Partial<DlCardData> {
  const result = raw?.result || raw?.data || raw || {};

  const name = result.name || result.holderName || result.driverName || '';
  const fatherName = result.fathername || result.fatherOrHusbandName || result.careOf || '';
  const dob = result.dob || result.dateOfBirth || '';
  const bloodGroup = result.bloodGroup || result.blood_group || 'U';
  const address = result.address || result.permanentAddress || '';
  const issueDate = result.issueDate || result.issue_date || result.dateOfIssue || '';
  const validityNt = result.validityNt || result.validity_nt || result.validTill || '';
  const validityTr = result.validityTr || result.validity_tr || '';
  const rto = result.rto || result.rto_name || result.issuingAuthority || 'RTO AUTHORITY';

  const vehicleClasses: DlCardData['vehicleClasses'] = [];
  if (Array.isArray(result.cov_details || result.vehicleClasses)) {
    const list = result.cov_details || result.vehicleClasses;
    for (const item of list) {
      if (item) {
        vehicleClasses.push({
          code: item.cov || item.code || item.class || 'LMV',
          desc: item.desc || item.description || 'Light Motor Vehicle',
          issueDate: item.issueDate || item.issue_date || issueDate,
        });
      }
    }
  } else {
    // Default standard classes if not detailed in response
    vehicleClasses.push(
      { code: 'MCWG', desc: 'Motor Cycle With Gear', issueDate },
      { code: 'LMV', desc: 'Light Motor Vehicle', issueDate }
    );
  }

  return {
    dlNumber: (result.dl_no || result.dlNumber || dlNumber).toUpperCase(),
    holderName: name.trim(),
    fatherOrHusbandName: fatherName.trim(),
    dateOfBirth: dob.trim(),
    bloodGroup: bloodGroup.trim(),
    address: address.trim(),
    issueDate: issueDate.trim(),
    validityNonTransport: validityNt.trim(),
    validityTransport: validityTr.trim() || undefined,
    issuingAuthority: rto.trim(),
    vehicleClasses,
  };
}
