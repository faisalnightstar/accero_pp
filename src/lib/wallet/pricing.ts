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
} from './constants';
import {
  generateDocumentCacheKey,
  normalizeDocumentIdentifier,
} from '@/lib/documents/documentCache';

export { SERVICE_FEES, LOW_BALANCE_THRESHOLD, normalizeDocType };

export interface ResolvedServicePricing {
  serviceId: string;
  fee: number;
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
 * to official SERVICE_FEES defaults.
 */
export async function getConfiguredServicePricing(
  docType: string
): Promise<ResolvedServicePricing> {
  const cleanDocType = normalizeDocType(docType);
  const fallbackFee = SERVICE_FEES[cleanDocType] ?? 20;

  try {
    if (canQueryModel(ServiceConfig?.findOne)) {
      await connectToDatabase();
      const conf = await resolveQueryResult<any>(
        ServiceConfig.findOne({ serviceId: cleanDocType as any })
      );

      if (conf) {
        return {
          serviceId: cleanDocType,
          fee: typeof conf.fee === 'number' && conf.fee >= 0 ? conf.fee : fallbackFee,
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

  return {
    serviceId: cleanDocType,
    fee: fallbackFee,
    enabled: true,
    maintenanceMode: false,
    maintenanceNotice: '',
    timeoutMs: 8000,
  };
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
): Promise<{ fee: number; isFreeReprint: boolean; docType: string }> {
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
        isFreeReprint: true,
        docType: cleanDocType,
      };
    }
  }

  // If manual entry mode
  if (isManual) {
    return {
      fee: SERVICE_FEES.MANUAL,
      isFreeReprint: false,
      docType: 'MANUAL',
    };
  }

  const pricing = await getConfiguredServicePricing(cleanDocType);

  return {
    fee: pricing.fee,
    isFreeReprint: false,
    docType: cleanDocType,
  };
}
