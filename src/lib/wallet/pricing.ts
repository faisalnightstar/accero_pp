import connectToDatabase from '@/lib/mongodb';
import DocumentRecord from '@/models/DocumentRecord';
import ServiceConfig from '@/models/ServiceConfig';
import VerificationRequest from '@/models/VerificationRequest';
import Wallet from '@/models/Wallet';
import mongoose from 'mongoose';
import {
  SERVICE_FEES,
  LOW_BALANCE_THRESHOLD,
  normalizeDocType,
  DEFAULT_SERVICE_PRICING,
  ServicePricingDefinition,
  calculateDiscountPercent,
  calculateEffectiveFee,
} from './constants';
import {
  generateDocumentCacheKey,
  normalizeDocumentIdentifier,
} from '@/lib/documents/documentCache';

export {
  SERVICE_FEES,
  LOW_BALANCE_THRESHOLD,
  normalizeDocType,
  DEFAULT_SERVICE_PRICING,
  calculateDiscountPercent,
  calculateEffectiveFee,
};
export type { ServicePricingDefinition };

export interface ResolvedServicePricing {
  serviceId: string;
  displayName: string;
  fee: number;
  originalFee: number;
  discountPercent: number;
  offerActive: boolean;
  offerBadge: string;
  offerDescription?: string;
  note?: string;
  enabled: boolean;
  maintenanceMode: boolean;
  maintenanceNotice: string;
  timeoutMs: number;
}

function canQueryModel(modelFindFn: unknown): boolean {
  return (
    mongoose.connection?.readyState === 1 ||
    typeof (modelFindFn as any)?.mock !== 'undefined'
  );
}

async function resolveQueryResult<T = any>(queryOrPromise: any): Promise<T | null> {
  if (!queryOrPromise) return null;
  if (typeof queryOrPromise.lean === 'function') {
    return await queryOrPromise.lean();
  }
  return await queryOrPromise;
}

/**
 * Resolves the active server-configured pricing and operational settings for a service.
 * Reads from ServiceConfig in MongoDB when connected (or mocked), safely falling back
 * to official SERVICE_FEES defaults and DEFAULT_SERVICE_PRICING metadata.
 */
export async function getConfiguredServicePricing(
  docType: string
): Promise<ResolvedServicePricing> {
  const cleanDocType = normalizeDocType(docType);
  const defaultDef = DEFAULT_SERVICE_PRICING[cleanDocType] || {
    serviceId: cleanDocType,
    displayName: `${cleanDocType} Processing`,
    category: 'identity' as const,
    originalFee: SERVICE_FEES[cleanDocType] ?? 20,
    fee: SERVICE_FEES[cleanDocType] ?? 20,
    discountPercent: 0,
    offerActive: false,
    offerBadge: '',
    note: '',
  };

  const fallbackFee = SERVICE_FEES[cleanDocType] ?? defaultDef.fee ?? 20;
  const fallbackOriginalFee =
    typeof defaultDef.originalFee === 'number' && defaultDef.originalFee > 0
      ? defaultDef.originalFee
      : Math.max(fallbackFee, 25);

  try {
    if (canQueryModel(ServiceConfig?.findOne)) {
      await connectToDatabase();
      const conf = await resolveQueryResult<any>(
        ServiceConfig.findOne({ serviceId: cleanDocType as any })
      );

      if (conf) {
        const fee = typeof conf.fee === 'number' && conf.fee >= 0 ? conf.fee : fallbackFee;
        const originalFee =
          typeof conf.originalFee === 'number' && conf.originalFee > 0
            ? conf.originalFee
            : Math.max(fee, fallbackOriginalFee);
        const discountPercent =
          typeof conf.discountPercent === 'number' && conf.discountPercent >= 0
            ? conf.discountPercent
            : calculateDiscountPercent(originalFee, fee);
        const offerActive =
          typeof conf.offerActive === 'boolean' ? conf.offerActive : discountPercent > 0;
        const offerBadge =
          conf.offerBadge || (discountPercent > 0 ? `${discountPercent}% OFF` : '');

        return {
          serviceId: cleanDocType,
          displayName: conf.displayName || defaultDef.displayName,
          fee,
          originalFee,
          discountPercent,
          offerActive,
          offerBadge,
          offerDescription: conf.offerDescription || '',
          note: defaultDef.note,
          enabled: conf.enabled !== false,
          maintenanceMode: Boolean(conf.maintenanceMode),
          maintenanceNotice: conf.maintenanceNotice || '',
          timeoutMs:
            typeof conf.retryPolicy?.timeoutMs === 'number' && conf.retryPolicy.timeoutMs > 0
              ? conf.retryPolicy.timeoutMs
              : 8000,
        };
      }
    }
  } catch (err) {
    console.warn('[Pricing] Failed to query ServiceConfig, falling back to default fee:', err);
  }

  const discountPercent =
    defaultDef.discountPercent ?? calculateDiscountPercent(fallbackOriginalFee, fallbackFee);

  return {
    serviceId: cleanDocType,
    displayName: defaultDef.displayName,
    fee: fallbackFee,
    originalFee: fallbackOriginalFee,
    discountPercent,
    offerActive: defaultDef.offerActive ?? discountPercent > 0,
    offerBadge: defaultDef.offerBadge || (discountPercent > 0 ? `${discountPercent}% OFF` : ''),
    offerDescription: '',
    note: defaultDef.note,
    enabled: true,
    maintenanceMode: false,
    maintenanceNotice: '',
    timeoutMs: 8000,
  };
}

/**
 * Retrieves the complete catalog of service pricing, % OFF discounts, and active offers.
 * One single source of truth for public rate cards, studio, and admin overviews.
 */
export async function getPublicServicePricingCatalog(): Promise<ResolvedServicePricing[]> {
  const serviceIds = ['PAN', 'AADHAAR', 'VOTER', 'DL', 'RC', 'RATION', 'MANUAL'];
  return await Promise.all(serviceIds.map((sid) => getConfiguredServicePricing(sid)));
}

/**
 * Builds deterministic ledger referenceId for a Voter lookup entitlement.
 */
export function buildVoterLookupReferenceId(userId: string, epicNumber: string): string {
  const cleanEpic = normalizeDocumentIdentifier('VOTER', epicNumber);
  return `VOTER_LOOKUP:${userId}:${cleanEpic}`;
}

/**
 * Checks whether a Voter EPIC lookup has ALREADY been paid for by this user.
 * Strictly NEVER uses `printCount` as proof that a lookup has been paid.
 */
export async function hasPaidVoterLookupEntitlement(
  userId: string,
  epicNumber: string
): Promise<boolean> {
  if (!userId || !epicNumber) return false;

  try {
    await connectToDatabase();
    const { normalizedId, hash } = generateDocumentCacheKey('VOTER', epicNumber);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // 1. Check DocumentRecord explicit isPaid entitlement (NEVER printCount!)
    if (canQueryModel(DocumentRecord?.findOne)) {
      const existingDoc = await resolveQueryResult<any>(
        DocumentRecord.findOne({
          userId: userObjectId,
          docType: 'VOTER',
          $or: [{ cardIdentifier: normalizedId }, { documentNumberHash: hash }],
        })
      );

      if (existingDoc?.isPaid === true) {
        return true;
      }
    }

    // 2. Check completed VerificationRequest record
    if (canQueryModel(VerificationRequest?.findOne)) {
      const completedReq = await resolveQueryResult<any>(
        VerificationRequest.findOne({
          userId: userObjectId,
          docType: 'VOTER',
          idNumber: normalizedId,
          status: 'COMPLETED',
        })
      );

      if (completedReq) {
        return true;
      }
    }

    // 3. Check Wallet ledger for completed VERIFICATION debit matching deterministic referenceId
    if (canQueryModel(Wallet?.findOne)) {
      const refId = buildVoterLookupReferenceId(userId, normalizedId);
      const walletWithTx = await resolveQueryResult<any>(
        Wallet.findOne({
          userId: userObjectId,
          transactions: {
            $elemMatch: {
              referenceId: refId,
              type: 'debit',
              status: 'COMPLETED',
            },
          },
        })
      );

      if (
        walletWithTx &&
        Array.isArray(walletWithTx.transactions) &&
        walletWithTx.transactions.some(
          (t: any) =>
            t.referenceId === refId && t.type === 'debit' && t.status === 'COMPLETED'
        )
      ) {
        return true;
      }
    }

    return false;
  } catch (err) {
    console.error('[Pricing] Failed to check Voter lookup entitlement:', err);
    return false;
  }
}

/**
 * Check if the document has already been generated/paid and saved for this user.
 * Used during print authorization so already-paid lookups & previously printed cards
 * are ₹0 (Free Lifetime Reprints).
 */
export async function isDocumentAlreadyPaid(
  userId: string,
  docType: string,
  cardIdentifier: string
): Promise<boolean> {
  if (!userId || !cardIdentifier) return false;

  try {
    await connectToDatabase();
    const cleanDocType = normalizeDocType(docType);
    const cleanId = normalizeDocumentIdentifier(cleanDocType, cardIdentifier);
    const { hash } = generateDocumentCacheKey(cleanDocType, cleanId);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const existingRecord = await resolveQueryResult<any>(
      DocumentRecord.findOne({
        userId: userObjectId,
        docType: cleanDocType as any,
        $or: [{ cardIdentifier: cleanId }, { documentNumberHash: hash }],
      })
    );

    if (
      existingRecord &&
      ((existingRecord as any).printCount > 0 || (existingRecord as any).isPaid === true)
    ) {
      return true;
    }

    // For Voter IDs, also honor completed VerificationRequest lookup payments even if
    // printCount === 0 or DocumentRecord save is catching up
    if (cleanDocType === 'VOTER' && canQueryModel(VerificationRequest?.findOne)) {
      const completedReq = await resolveQueryResult<any>(
        VerificationRequest.findOne({
          userId: userObjectId,
          docType: 'VOTER',
          idNumber: cleanId,
          status: 'COMPLETED',
        })
      );
      if (completedReq) {
        return true;
      }
    }

    return false;
  } catch (err) {
    console.error('[Pricing] Failed to check document payment status:', err);
    return false;
  }
}

/**
 * Calculates the required service fee for a given action.
 * Returns fee = 0 if the document was already paid/generated by the user.
 */
export async function getRequiredServiceFee(
  userId: string,
  docType: string,
  cardIdentifier?: string,
  isManual = false
): Promise<{
  fee: number;
  originalFee: number;
  discountPercent: number;
  offerActive: boolean;
  isFreeReprint: boolean;
  docType: string;
}> {
  const cleanDocType = normalizeDocType(docType);

  // If card identifier is provided, check if it's already paid/entitled
  if (cardIdentifier) {
    const isPaid =
      cleanDocType === 'VOTER' && !isManual
        ? await hasPaidVoterLookupEntitlement(userId, cardIdentifier)
        : await isDocumentAlreadyPaid(userId, cleanDocType, cardIdentifier);

    if (isPaid) {
      return {
        fee: 0,
        originalFee: 0,
        discountPercent: 100,
        offerActive: false,
        isFreeReprint: true,
        docType: cleanDocType,
      };
    }
  }

  // If manual entry mode
  if (isManual) {
    const manualPricing = await getConfiguredServicePricing('MANUAL');
    return {
      fee: manualPricing.fee,
      originalFee: manualPricing.originalFee,
      discountPercent: manualPricing.discountPercent,
      offerActive: manualPricing.offerActive,
      isFreeReprint: false,
      docType: 'MANUAL',
    };
  }

  const pricing = await getConfiguredServicePricing(cleanDocType);

  return {
    fee: pricing.fee,
    originalFee: pricing.originalFee,
    discountPercent: pricing.discountPercent,
    offerActive: pricing.offerActive,
    isFreeReprint: false,
    docType: cleanDocType,
  };
}
