import crypto from 'crypto';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import DocumentRecord, { IDocumentRecord } from '@/models/DocumentRecord';
import { DocumentType } from '@/types/cards';
import { analyzeDocumentCompleteness } from '@/lib/missingFields';

/**
 * 72-Hour Cache Duration in Milliseconds
 * 72 hours * 60 minutes * 60 seconds * 1000 milliseconds = 259,200,000 ms
 */
export const CACHE_TTL_HOURS = 72;
export const CACHE_TTL_MS = CACHE_TTL_HOURS * 60 * 60 * 1000;

/**
 * Normalizes document identifiers according to service-specific formats.
 */
export function normalizeDocumentIdentifier(docType: string, rawId: string): string {
  const clean = (rawId || '').trim();
  const upperType = docType.toUpperCase().trim();

  switch (upperType) {
    case 'PAN':
      // Remove all spaces and uppercase
      return clean.replace(/\s+/g, '').toUpperCase();

    case 'AADHAAR':
    case 'UID':
      // Remove spaces and hyphens
      return clean.replace(/[\s-]+/g, '');

    case 'VOTER':
    case 'EPIC':
      // Remove all spaces and uppercase
      return clean.replace(/\s+/g, '').toUpperCase();

    case 'DL':
    case 'DRIVING_LICENSE':
      // Remove consecutive spaces/hyphens and uppercase
      return clean.replace(/\s+/g, ' ').toUpperCase();

    case 'RC':
    case 'VEHICLE_RC':
      // Remove all spaces and hyphens
      return clean.replace(/[\s-]+/g, '').toUpperCase();

    case 'RATION':
    case 'RATION_CARD':
      // Remove all spaces and uppercase
      return clean.replace(/\s+/g, '').toUpperCase();

    default:
      return clean.toUpperCase();
  }
}

/**
 * Normalize docType to standard uppercase string
 */
export function normalizeDocTypeString(type: string): 'PAN' | 'AADHAAR' | 'VOTER' | 'DL' | 'RC' | 'RATION' {
  const upper = type.toUpperCase().trim();
  if (upper === 'VOTER' || upper === 'EPIC') return 'VOTER';
  if (upper === 'PAN') return 'PAN';
  if (upper === 'AADHAAR' || upper === 'UID') return 'AADHAAR';
  if (upper === 'DL' || upper === 'DRIVING_LICENSE') return 'DL';
  if (upper === 'RC' || upper === 'VEHICLE_RC') return 'RC';
  if (upper === 'RATION' || upper === 'RATION_CARD') return 'RATION';
  return (upper as any) || 'PAN';
}

/**
 * Generates a deterministic HMAC-SHA256 hash for secure database lookup
 * without exposing plaintext identity numbers in indices.
 */
export function generateDocumentCacheKey(
  docType: string,
  documentNumber: string
): {
  normalizedType: 'PAN' | 'AADHAAR' | 'VOTER' | 'DL' | 'RC' | 'RATION';
  normalizedId: string;
  hash: string;
  cacheKey: string;
} {
  const normalizedType = normalizeDocTypeString(docType);
  const normalizedId = normalizeDocumentIdentifier(normalizedType, documentNumber);

  const secret = process.env.JWT_SECRET || 'accero_secure_cache_salt_fallback_min_32';
  const hash = crypto
    .createHmac('sha256', secret)
    .update(`${normalizedType}:${normalizedId}`)
    .digest('hex');

  return {
    normalizedType,
    normalizedId,
    hash,
    cacheKey: `${normalizedType}:${hash}`,
  };
}

/**
 * Determines whether a cached document is still valid and unexpired.
 * A document is valid ONLY if expiresAt > current time and it has valid non-empty data.
 */
export function isDocumentCacheValid(
  doc: IDocumentRecord | null | undefined
): boolean {
  if (!doc) return false;
  if (!doc.data || Object.keys(doc.data).length === 0) return false;
  if (!doc.expiresAt) return false;

  const expiresTime = new Date(doc.expiresAt).getTime();
  return expiresTime > Date.now();
}

/**
 * Searches MongoDB for a valid, unexpired cached document.
 * Strictly enforces tenant isolation: records are retrieved only for the authenticated userId.
 */
export async function findCachedDocument({
  userId,
  docType,
  documentNumber,
}: {
  userId: string;
  docType: string;
  documentNumber: string;
}): Promise<IDocumentRecord | null> {
  if (!userId || !documentNumber) return null;

  await connectToDatabase();
  const { normalizedType, normalizedId, hash } = generateDocumentCacheKey(docType, documentNumber);

  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const record = await DocumentRecord.findOne({
      userId: userObjectId,
      docType: normalizedType,
      $or: [
        { documentNumberHash: hash },
        { cardIdentifier: normalizedId },
      ],
      expiresAt: { $gt: new Date() }, // Explicit application-level validity check
    });

    if (record && isDocumentCacheValid(record)) {
      return record;
    }

    return null;
  } catch (err) {
    console.error('[DocumentCache] Error finding cached document:', err);
    return null;
  }
}

/**
 * Finds any existing document record (even if expired) to prevent losing previous
 * valid data when a refresh or re-verification fails downstream.
 */
export async function findExistingDocumentRecord({
  userId,
  docType,
  documentNumber,
}: {
  userId: string;
  docType: string;
  documentNumber: string;
}): Promise<IDocumentRecord | null> {
  if (!userId || !documentNumber) return null;

  await connectToDatabase();
  const { normalizedType, normalizedId, hash } = generateDocumentCacheKey(docType, documentNumber);

  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    return await DocumentRecord.findOne({
      userId: userObjectId,
      docType: normalizedType,
      $or: [
        { documentNumberHash: hash },
        { cardIdentifier: normalizedId },
      ],
    });
  } catch (err) {
    console.error('[DocumentCache] Error finding existing record:', err);
    return null;
  }
}

const PRESERVED_USER_KEYS = new Set([
  'photoUrl',
  'signatureUrl',
  'layoutFormat',
  'templateVariant',
  'language',
  'houseNo',
  'tehsil',
  'issueDate',
  'downloadDate',
  'pollDate',
  'timings',
  'serialNo',
  'pollingStation',
  'labelNameRegional',
  'labelRelationRegional',
  'labelGenderRegional',
  'labelDobRegional',
  'labelAddressRegional',
  'labelSignRegional',
]);

function isEmptyFieldValue(val: unknown): boolean {
  if (val === undefined || val === null) return true;
  if (typeof val === 'string' && val.trim() === '') return true;
  if (Array.isArray(val) && val.length === 0) return true;
  return false;
}

/**
 * Merges incoming API data onto an existing record without overwriting existing
 * user-edited values, media, template settings, or non-empty fields with missing API values.
 */
export function mergeDocumentDataPreservingEdits(
  existingData: Record<string, any> | null | undefined,
  incomingData: Record<string, any>,
  existingInputMode?: string
): Record<string, any> {
  if (!existingData || typeof existingData !== 'object') {
    return { ...incomingData };
  }

  const merged: Record<string, any> = { ...existingData };

  for (const [key, newVal] of Object.entries(incomingData)) {
    const existingVal = existingData[key];
    const hasExisting = !isEmptyFieldValue(existingVal);
    const hasIncoming = !isEmptyFieldValue(newVal);

    // Never replace non-empty existing data with empty/null API values
    if (!hasIncoming && hasExisting) {
      continue;
    }

    // Always preserve user media, layout, template, language, houseNo, and labels if already set
    if (PRESERVED_USER_KEYS.has(key) && hasExisting) {
      continue;
    }

    // If the operator previously edited & saved the record manually, preserve their edited fields
    if (existingInputMode === 'MANUAL' && hasExisting) {
      continue;
    }

    merged[key] = newVal;
  }

  return merged;
}

/**
 * Persists a newly fetched document in MongoDB with a 72-hour cache expiration.
 * Never caches empty responses, mock data in production, or failed requests.
 */
export async function saveDocumentToCache({
  userId,
  docType,
  documentNumber,
  data,
  provider = 'NeoAPI',
  inputMode = 'API',
  source = 'API',
  isPaid,
  paidAt,
  paymentReferenceId,
}: {
  userId: string;
  docType: string;
  documentNumber: string;
  data: Record<string, any>;
  provider?: string;
  inputMode?: 'API' | 'MANUAL';
  source?: string;
  isPaid?: boolean;
  paidAt?: Date;
  paymentReferenceId?: string;
}): Promise<IDocumentRecord | null> {
  if (!userId || !documentNumber || !data || Object.keys(data).length === 0) {
    return null;
  }

  // Strictly block caching mock simulation data in production mode
  if (process.env.NODE_ENV === 'production' && (provider === 'MockProvider' || provider === 'MockSimulation')) {
    console.warn('[DocumentCache] Rejected attempt to cache mock data in production');
    return null;
  }

  await connectToDatabase();
  const { normalizedType, normalizedId, hash } = generateDocumentCacheKey(docType, documentNumber);

  const existing = await findExistingDocumentRecord({
    userId,
    docType: normalizedType,
    documentNumber: normalizedId,
  });

  const mergedData = mergeDocumentDataPreservingEdits(
    existing?.data,
    data,
    existing?.inputMode
  );

  const fetchedAt = new Date();
  const expiresAt = new Date(fetchedAt.getTime() + CACHE_TTL_MS); // Exactly 72 hours

  const lowerType = normalizedType.toLowerCase() as DocumentType;
  const completeness = analyzeDocumentCompleteness(lowerType, mergedData);

  const effectiveIsPaid = Boolean(isPaid || (existing as any)?.isPaid);
  const effectivePaidAt = paidAt || (existing as any)?.paidAt || (effectiveIsPaid ? fetchedAt : undefined);
  const effectivePaymentRef = paymentReferenceId || (existing as any)?.paymentReferenceId;
  const effectiveInputMode = existing?.inputMode === 'MANUAL' ? 'MANUAL' : inputMode;

  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const filter = existing?._id
      ? { _id: existing._id, userId: userObjectId }
      : {
          userId: userObjectId,
          docType: normalizedType,
          cardIdentifier: normalizedId,
        };

    const setPayload: Record<string, any> = {
      cardIdentifier: normalizedId,
      data: mergedData,
      missingFields: completeness.missingKeys,
      isComplete: completeness.isPrintReady,
      inputMode: effectiveInputMode,
      source,
      provider,
      status: 'ACTIVE',
      documentNumberHash: hash,
      fetchedAt,
      expiresAt,
      updatedAt: new Date(),
    };

    if (effectiveIsPaid) {
      setPayload.isPaid = true;
      if (effectivePaidAt) setPayload.paidAt = effectivePaidAt;
      if (effectivePaymentRef) setPayload.paymentReferenceId = effectivePaymentRef;
    }

    const updated = await DocumentRecord.findOneAndUpdate(
      filter,
      {
        $set: setPayload,
        $setOnInsert: {
          userId: userObjectId,
          docType: normalizedType,
          createdAt: new Date(),
          printCount: 0,
          ...(!effectiveIsPaid ? { isPaid: false } : {}),
        },
      },
      { upsert: true, new: true }
    );

    return updated;
  } catch (err) {
    console.error('[DocumentCache] Error saving document to cache:', err);
    return null;
  }
}

/**
 * Refreshes an existing document record with newly fetched provider data and resets the 72-hour timer.
 */
export async function refreshCachedDocument({
  userId,
  docType,
  documentNumber,
  newData,
  provider,
}: {
  userId: string;
  docType: string;
  documentNumber: string;
  newData: Record<string, any>;
  provider?: string;
}): Promise<IDocumentRecord | null> {
  return await saveDocumentToCache({
    userId,
    docType,
    documentNumber,
    data: newData,
    provider,
    inputMode: 'API',
    source: 'API',
  });
}

/**
 * Explicitly invalidates a cached document by setting its expiration timestamp to the past.
 */
export async function invalidateDocumentCache({
  userId,
  docType,
  documentNumber,
}: {
  userId: string;
  docType: string;
  documentNumber: string;
}): Promise<boolean> {
  if (!userId || !documentNumber) return false;

  await connectToDatabase();
  const { normalizedType, normalizedId, hash } = generateDocumentCacheKey(docType, documentNumber);

  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const res = await DocumentRecord.updateOne(
      {
        userId: userObjectId,
        docType: normalizedType,
        $or: [{ documentNumberHash: hash }, { cardIdentifier: normalizedId }],
      },
      {
        $set: {
          expiresAt: new Date(0),
          status: 'EXPIRED',
          updatedAt: new Date(),
        },
      }
    );

    return res.modifiedCount > 0;
  } catch (err) {
    console.error('[DocumentCache] Error invalidating cache:', err);
    return false;
  }
}

