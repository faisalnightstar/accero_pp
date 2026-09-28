import { PanCardData } from '@/types/cards';

/**
 * Standardize various date formats (YYYY-MM-DD, YYYY/MM/DD, DD-MM-YYYY) into DD/MM/YYYY
 */
export function formatToStandardDate(inputDate?: string | null): string {
  if (!inputDate || typeof inputDate !== 'string') return '';
  const trimmed = inputDate.trim();
  if (!trimmed) return '';

  // Case 1: YYYY-MM-DD or YYYY/MM/DD
  const ymdMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (ymdMatch) {
    const [, year, month, day] = ymdMatch;
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
  }

  // Case 2: DD-MM-YYYY
  const dmyDashMatch = trimmed.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (dmyDashMatch) {
    const [, day, month, year] = dmyDashMatch;
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
  }

  // Case 3: Already DD/MM/YYYY
  const dmySlashMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmySlashMatch) {
    const [, day, month, year] = dmySlashMatch;
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
  }

  return trimmed;
}

/**
 * Normalizes raw NeoAPI PAN verification payload into PanCardData
 */
export function normalizeNeoApiPan(raw: any, panNumber: string): Partial<PanCardData> {
  if (!raw || typeof raw !== 'object') {
    return {
      panNumber: panNumber.toUpperCase(),
      fullName: '',
      fatherName: '',
      dateOfBirth: '',
    };
  }

  const fullName = raw.fullname || raw.fullName || raw.name || '';
  const fatherName = raw.fathername || raw.fatherName || raw.careOf || '';
  const rawDob = raw.dob || raw.dateOfBirth || raw.birthDate || '';
  const formattedDob = formatToStandardDate(rawDob);

  return {
    panNumber: (raw.pan || raw.panNumber || panNumber).toUpperCase(),
    fullName: fullName.trim(),
    fatherName: fatherName.trim(),
    dateOfBirth: formattedDob,
    category: raw.category === 'Company' ? 'Company' : 'Individual',
    qrData: `PAN:${(raw.pan || panNumber).toUpperCase()}|NAME:${fullName}|FNAME:${fatherName}|DOB:${formattedDob}`,
  };
}
