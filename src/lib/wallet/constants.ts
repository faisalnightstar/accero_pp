/**
 * Official Service Fee Structure (in INR ₹)
 * Tiered pricing per document type
 */
export const SERVICE_FEES: Record<string, number> = {
  PAN: 50,
  RC: 35,
  DL: 30,
  AADHAAR: 25,
  RATION: 25,
  VOTER: 20,
  MANUAL: 5,
};

/**
 * Low balance threshold triggering amber warning alerts
 */
export const LOW_BALANCE_THRESHOLD = 50;

/**
 * Normalize document type key to match standard format
 */
export function normalizeDocType(type: string): string {
  const upper = type.toUpperCase().trim();
  if (upper === 'VOTER' || upper === 'EPIC') return 'VOTER';
  if (upper === 'PAN') return 'PAN';
  if (upper === 'AADHAAR' || upper === 'UID') return 'AADHAAR';
  if (upper === 'DL' || upper === 'DRIVING_LICENSE') return 'DL';
  if (upper === 'RC' || upper === 'VEHICLE_RC') return 'RC';
  if (upper === 'RATION' || upper === 'RATION_CARD') return 'RATION';
  if (upper === 'MANUAL') return 'MANUAL';
  return upper;
}
