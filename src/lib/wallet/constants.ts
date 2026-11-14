/**
 * Single Source of Truth definition for a Service's pricing & offer configuration.
 */
export interface ServicePricingDefinition {
  serviceId: string;
  displayName: string;
  category: 'identity' | 'transport' | 'electoral' | 'civic' | 'manual';
  originalFee: number;
  fee: number;
  discountPercent: number;
  offerActive: boolean;
  offerBadge: string;
  note: string;
}

/**
 * Calculates percentage discount (% OFF) between original regular price and final fee.
 */
export function calculateDiscountPercent(originalFee: number, fee: number): number {
  if (!originalFee || originalFee <= 0 || fee >= originalFee) return 0;
  return Math.min(100, Math.max(0, Math.round(((originalFee - fee) / originalFee) * 100)));
}

/**
 * Calculates effective fee after applying percentage discount.
 */
export function calculateEffectiveFee(originalFee: number, discountPercent: number): number {
  if (!originalFee || originalFee <= 0) return 0;
  if (!discountPercent || discountPercent <= 0) return originalFee;
  if (discountPercent >= 100) return 0;
  return Math.max(0, Math.round(originalFee * (1 - discountPercent / 100)));
}

/**
 * Single Source of Truth for Default Service Pricing Catalog
 */
export const DEFAULT_SERVICE_PRICING: Record<string, ServicePricingDefinition> = {
  PAN: {
    serviceId: 'PAN',
    displayName: 'PAN Card Verification & Print',
    category: 'identity',
    originalFee: 50,
    fee: 20,
    discountPercent: 60,
    offerActive: true,
    offerBadge: '60% OFF',
    note: 'Auto-fetches NSDL/UTI format with QR and full demographic details',
  },
  VOTER: {
    serviceId: 'VOTER',
    displayName: 'Voter ID (EPIC) Verification & Print',
    category: 'electoral',
    originalFee: 25,
    fee: 20,
    discountPercent: 20,
    offerActive: true,
    offerBadge: '20% OFF',
    note: 'Includes Assembly Constituency, Part Number, and polling booth details',
  },
  AADHAAR: {
    serviceId: 'AADHAAR',
    displayName: 'Aadhaar PVC Card Print',
    category: 'identity',
    originalFee: 30,
    fee: 25,
    discountPercent: 17,
    offerActive: true,
    offerBadge: '17% OFF',
    note: 'Bilingual Devanagari typography with secure high-density QR code',
  },
  DL: {
    serviceId: 'DL',
    displayName: 'Driving Licence Smart Card Print',
    category: 'transport',
    originalFee: 40,
    fee: 30,
    discountPercent: 25,
    offerActive: true,
    offerBadge: '25% OFF',
    note: 'Smart chip graphic with vehicle category authorizations and validity',
  },
  RC: {
    serviceId: 'RC',
    displayName: 'Vehicle RC Smart Card Print',
    category: 'transport',
    originalFee: 50,
    fee: 35,
    discountPercent: 30,
    offerActive: true,
    offerBadge: '30% OFF',
    note: 'Vahan transport specs: Chassis, engine number, maker model & fuel type',
  },
  RATION: {
    serviceId: 'RATION',
    displayName: 'Ration Card Print & Roster',
    category: 'civic',
    originalFee: 35,
    fee: 25,
    discountPercent: 29,
    offerActive: true,
    offerBadge: '29% OFF',
    note: 'NFSA food security layout with full family member roster table',
  },
  FARMER: {
    serviceId: 'FARMER',
    displayName: 'Farmer Registry (AgriStack) Card',
    category: 'civic',
    originalFee: 50,
    fee: 25,
    discountPercent: 50,
    offerActive: true,
    offerBadge: '50% OFF',
    note: 'AgriStack & Rajasthan Farmer Registry verification with landholdings table',
  },
  MANUAL: {
    serviceId: 'MANUAL',
    displayName: 'Manual Draft Studio',
    category: 'manual',
    originalFee: 10,
    fee: 5,
    discountPercent: 50,
    offerActive: true,
    offerBadge: '50% OFF',
    note: 'Operator inputs data, photo, and signature manually for any card canvas',
  },
};

/**
 * Official Service Fee Structure (in INR ₹)
 * Preserved for backward-compatibility with existing lookups and tests.
 */
export const SERVICE_FEES: Record<string, number> = {
  PAN: 50,
  RC: 35,
  DL: 30,
  AADHAAR: 25,
  RATION: 25,
  FARMER: 25,
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
  if (upper === 'FARMER' || upper === 'AGRISTACK' || upper === 'FARMER_ID') return 'FARMER';
  if (upper === 'MANUAL') return 'MANUAL';
  return upper;
}
