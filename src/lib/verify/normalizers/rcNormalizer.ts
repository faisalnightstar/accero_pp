import { RcCardData } from '@/types/cards';

/**
 * Normalizes raw AxenAPI Vehicle RC response into RcCardData
 */
export function normalizeAxenRc(raw: any, registrationNumber: string): Partial<RcCardData> {
  const result = raw?.result || raw?.data || raw || {};

  const regNo = (result.is_number || result.rc_number || result.regNo || registrationNumber).toUpperCase();
  const ownerName = result.name || result.owner_name || result.ownerName || '';
  const fatherName = result.fathername || result.father_name || result.sonWifeDaughterOf || '';
  const address = result.address || result.permanentAddress || '';
  const vehicleClass = result.vh_class || result.vehicleClass || result.class || 'MOTOR CAR (LMV)';
  const makerModel = result.maker_model || result.makerModel || result.model || 'MARUTI SUZUKI INDIA LTD';
  const fuelType = result.fuel_type || result.fuelType || result.fuel || 'PETROL';
  const regDate = result.reg_date || result.registrationDate || result.dateOfReg || '';
  const chassisNo = result.chassis_no || result.chassisNumber || result.chassis || '';
  const engineNo = result.engine_no || result.engineNumber || result.engine || '';
  const emissionNorm = result.emission_norm || result.emissionNorm || 'BHARAT STAGE VI';
  const seatingCapacity = result.seating_capacity || result.seatingCapacity || '5';
  const color = result.color || result.colour || '';
  const hypothecatedTo = result.hypothecated_to || result.financier || '';
  const fitnessValidUpto = result.fit_upto || result.fitnessValidUpto || '';
  const taxPaidUpto = result.tax_upto || result.taxPaidUpto || 'L.T.T.';
  const insuranceValidUpto = result.insurance_upto || result.insuranceValidUpto || '';
  const issuingAuthority = result.rto || result.rto_name || result.issuingAuthority || 'REGIONAL TRANSPORT OFFICE';

  return {
    registrationNumber: regNo.trim(),
    registrationDate: regDate.trim(),
    chassisNumber: chassisNo.trim(),
    engineNumber: engineNo.trim(),
    ownerName: ownerName.trim(),
    sonWifeDaughterOf: fatherName ? (fatherName.startsWith('S/O') || fatherName.startsWith('W/O') ? fatherName : `S/O ${fatherName}`) : undefined,
    address: address.trim(),
    vehicleClass: vehicleClass.trim(),
    makerModel: makerModel.trim(),
    fuelType: fuelType.toUpperCase().trim(),
    emissionNorm: emissionNorm.trim(),
    seatingCapacity,
    color: color.trim() || undefined,
    hypothecatedTo: hypothecatedTo.trim() || undefined,
    fitnessValidUpto: fitnessValidUpto.trim(),
    taxPaidUpto: taxPaidUpto.trim(),
    insuranceValidUpto: insuranceValidUpto.trim(),
    issuingAuthority: issuingAuthority.trim(),
  };
}
