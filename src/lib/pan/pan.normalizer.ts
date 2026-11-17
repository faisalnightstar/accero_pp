/**
 * PAN Response Normalizer
 * Accero PrintPortal - Normalization Engine for WebAPI V1 & V2
 */

import {
  PANLookupResult,
  PanProviderVersion,
  RawWebApiPanV1Response,
  RawWebApiPanV2Response,
  RawWebApiResponse,
} from './pan.types';
import { normalizePanNumber } from './pan.validation';

/**
 * Normalizes varied date formats into official DD-MM-YYYY.
 *
 * Supported formats:
 * - YYYY-MM-DD (e.g. "2004-08-07" -> "07-08-2004")
 * - YYYY/MM/DD (e.g. "2004/08/07" -> "07-08-2004")
 * - DD-MM-YYYY (e.g. "20-08-1900" -> "20-08-1900")
 * - DD/MM/YYYY (e.g. "20/08/1900" -> "20-08-1900")
 *
 * Requirements:
 * - Preserves null/undefined as null.
 * - Does not reject historical dates such as 20-08-1900.
 * - Validates calendar day (1-31) and month (1-12).
 */
export function normalizePanDate(rawDate?: string | null): string | null {
  if (!rawDate || typeof rawDate !== 'string') return null;
  const trimmed = rawDate.trim();
  if (!trimmed) return null;

  // Case 1: YYYY-MM-DD or YYYY/MM/DD
  const ymdMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (ymdMatch) {
    const [, yearStr, monthStr, dayStr] = ymdMatch;
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const day = parseInt(dayStr, 10);

    if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 1800 && year <= 2100) {
      return `${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}-${yearStr}`;
    }
  }

  // Case 2: DD-MM-YYYY or DD/MM/YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (dmyMatch) {
    const [, dayStr, monthStr, yearStr] = dmyMatch;
    const day = parseInt(dayStr, 10);
    const month = parseInt(monthStr, 10);
    const year = parseInt(yearStr, 10);

    if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 1800 && year <= 2100) {
      return `${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}-${yearStr}`;
    }
  }

  // If format cannot be recognized, return trimmed string if non-empty, otherwise null
  return trimmed || null;
}

/**
 * Normalizes Aadhaar linked / available flag.
 * The API V1 returns `"aadhaar_no": false` or boolean.
 * This represents a boolean flag indicating the field's returned value, NOT an Aadhaar number.
 */
export function normalizeAadhaarAvailable(val: unknown): boolean | null {
  if (typeof val === 'boolean') {
    return val;
  }
  if (typeof val === 'string') {
    const clean = val.trim().toLowerCase();
    if (clean === 'true' || clean === '1' || clean === 'yes' || clean === 'linked') return true;
    if (clean === 'false' || clean === '0' || clean === 'no' || clean === 'unlinked') return false;
  }
  return null;
}

/**
 * Normalizes string fields (trims, handles empty strings as null).
 */
function cleanStringOrNull(val: unknown): string | null {
  if (typeof val !== 'string') return null;
  const trimmed = val.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Normalizes WebAPI V1 response into common PANLookupResult model:
 *
 * API V1 fields:
 * - pan: string
 * - fullname: string
 * - fathername: string
 * - dob: string (YYYY-MM-DD in supplied example)
 * - gender: string
 * - aadhaar_no: boolean (false in supplied example)
 */
export function normalizeWebApiV1Response(
  raw: RawWebApiPanV1Response,
  requestedPan: string
): PANLookupResult {
  const pan = normalizePanNumber(raw.pan || requestedPan);
  const fullName = cleanStringOrNull(raw.fullname);
  const fatherName = cleanStringOrNull(raw.fathername);
  const dateOfBirth = normalizePanDate(raw.dob);
  const gender = cleanStringOrNull(raw.gender);
  const aadhaarNumberAvailable = normalizeAadhaarAvailable(raw.aadhaar_no);

  return {
    pan,
    fullName,
    fatherName,
    dateOfBirth,
    gender,
    aadhaarNumberAvailable,
    providerVersion: 'v1',
    message: cleanStringOrNull(raw.message) || 'PAN Validate Successfully',
    status: 'SUCCESS',
  };
}

/**
 * Normalizes WebAPI V2 response into common PANLookupResult model:
 *
 * API V2 fields:
 * - pan: string
 * - fullname: string
 * - fathername: string
 * - dob: string (DD-MM-YYYY in supplied example)
 * - gender: Not supplied (null)
 * - aadhaarNumberAvailable: Not supplied (null)
 */
export function normalizeWebApiV2Response(
  raw: RawWebApiPanV2Response,
  requestedPan: string
): PANLookupResult {
  const pan = normalizePanNumber(raw.pan || requestedPan);
  const fullName = cleanStringOrNull(raw.fullname);
  const fatherName = cleanStringOrNull(raw.fathername);
  const dateOfBirth = normalizePanDate(raw.dob);

  return {
    pan,
    fullName,
    fatherName,
    dateOfBirth,
    gender: null,
    aadhaarNumberAvailable: null,
    providerVersion: 'v2',
    message: cleanStringOrNull(raw.message) || 'PAN Validate Successfully',
    status: 'SUCCESS',
  };
}

/**
 * Normalizes any WebAPI response by dispatching to the appropriate version normalizer.
 */
export function normalizePanResponse(
  raw: RawWebApiResponse,
  version: PanProviderVersion,
  requestedPan: string
): PANLookupResult {
  if (version === 'v1') {
    return normalizeWebApiV1Response(raw as RawWebApiPanV1Response, requestedPan);
  }
  return normalizeWebApiV2Response(raw as RawWebApiPanV2Response, requestedPan);
}
