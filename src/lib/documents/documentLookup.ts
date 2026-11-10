import { DocumentType } from '@/types/cards';
import { getProvidersForDocType } from '@/lib/verify/providerFactory';
import { executeProviderCascade } from '@/lib/verify/orchestrator';
import {
  findCachedDocument,
  saveDocumentToCache,
  findExistingDocumentRecord,
  generateDocumentCacheKey,
  normalizeDocTypeString,
} from './documentCache';
import { logAuditEvent } from '@/lib/logger/audit';
import { checkRateLimit } from '@/lib/security/rateLimiter';

export interface DocumentLookupParams {
  userId: string;
  docType: DocumentType | string;
  documentNumber: string;
  serviceMethod?: string;
  bypassCache?: boolean;
}

export interface DocumentLookupResult {
  success: boolean;
  documentType: string;
  documentNumber: string;
  data: Record<string, any>;
  cache: {
    hit: boolean;
    expiresAt?: Date | string;
    fetchedAt?: Date | string;
  };
  source: 'CACHE' | 'API' | 'MANUAL';
  provider?: string;
  isPartial?: boolean;
  missingFields?: string[];
  isComplete?: boolean;
  docId?: string;
  latencyMs?: number;
  errorMessage?: string;
}

/**
 * In-flight lookup deduplication map to prevent simultaneous external API calls
 * when multiple requests arrive for the exact same document identifier.
 */
const inFlightRequests = new Map<string, Promise<DocumentLookupResult>>();

/**
 * Centralized, Database-First Document Lookup Orchestrator.
 * 
 * Rules:
 * 1. Always checks MongoDB first.
 * 2. If a valid, unexpired (within 72 hours) cached document exists, returns it immediately.
 * 3. Never calls NeoAPI or external providers on a cache hit.
 * 4. Only calls external providers on cache misses or expired records.
 * 5. Saves valid external responses into MongoDB with a fresh 72-hour expiration.
 * 6. Downstream provider failures never overwrite or destroy existing records.
 * 7. Enforces strict tenant isolation: records are scoped to the authenticated user.
 */
export async function lookupDocument({
  userId,
  docType,
  documentNumber,
  serviceMethod = 'auto',
  bypassCache = false,
}: DocumentLookupParams): Promise<DocumentLookupResult> {
  const startTime = Date.now();

  if (!userId) {
    return {
      success: false,
      documentType: String(docType),
      documentNumber,
      data: {},
      cache: { hit: false },
      source: 'API',
      errorMessage: 'Authentication required. Please sign in.',
    };
  }

  const { normalizedType, normalizedId, cacheKey } = generateDocumentCacheKey(
    String(docType),
    documentNumber
  );

  if (!normalizedId) {
    return {
      success: false,
      documentType: normalizedType,
      documentNumber: '',
      data: {},
      cache: { hit: false },
      source: 'API',
      errorMessage: 'Please enter a valid document number.',
    };
  }

  // Rate limit document lookups (15 lookups per minute per user)
  const rateLimit = await checkRateLimit('DOC_LOOKUP', userId);
  if (!rateLimit.allowed) {
    return {
      success: false,
      documentType: normalizedType,
      documentNumber: normalizedId,
      data: {},
      cache: { hit: false },
      source: 'API',
      errorMessage: `Too many lookup requests. Please wait ${rateLimit.retryAfterSeconds}s before searching again.`,
    };
  }

  // --------------------------------------------------------------------------
  // STEP 1: DATABASE-FIRST LOOKUP (Check MongoDB for valid 72-hour cache)
  // --------------------------------------------------------------------------
  if (!bypassCache) {
    const cachedDoc = await findCachedDocument({
      userId,
      docType: normalizedType,
      documentNumber: normalizedId,
    });

    if (cachedDoc && cachedDoc.data && Object.keys(cachedDoc.data).length > 0) {
      const latencyMs = Date.now() - startTime;

      await logAuditEvent({
        actorId: userId,
        action: 'DOCUMENT_CACHE_HIT',
        resourceType: 'DOCUMENT',
        resourceId: normalizedId,
        details: {
          docType: normalizedType,
          expiresAt: cachedDoc.expiresAt,
          fetchedAt: cachedDoc.fetchedAt,
          source: cachedDoc.source || 'CACHE',
        },
        status: 'SUCCESS',
      });

      return {
        success: true,
        documentType: normalizedType,
        documentNumber: normalizedId,
        data: cachedDoc.data,
        cache: {
          hit: true,
          expiresAt: cachedDoc.expiresAt,
          fetchedAt: cachedDoc.fetchedAt,
        },
        source: 'CACHE',
        provider: cachedDoc.provider || 'Cache',
        isPartial: !cachedDoc.isComplete,
        missingFields: cachedDoc.missingFields || [],
        isComplete: cachedDoc.isComplete || false,
        docId: cachedDoc._id.toString(),
        latencyMs,
      };
    }
  }

  // --------------------------------------------------------------------------
  // STEP 2: CONCURRENCY LOCK & DEDUPLICATION
  // --------------------------------------------------------------------------
  // If another asynchronous request is already fetching this exact document for this user,
  // reuse its promise to avoid dispatching redundant external API calls.
  const inflightKey = `${userId}:${cacheKey}`;
  const existingInflight = inFlightRequests.get(inflightKey);
  if (existingInflight) {
    return await existingInflight;
  }

  // --------------------------------------------------------------------------
  // STEP 3: EXTERNAL PROVIDER INVOCATION (Cache Miss or Expired Record)
  // --------------------------------------------------------------------------
  const executeLookupPromise = (async (): Promise<DocumentLookupResult> => {
    try {
      const lowerType = normalizedType.toLowerCase() as DocumentType;
      const providers = getProvidersForDocType(lowerType);

      if (providers.length === 0) {
        return {
          success: false,
          documentType: normalizedType,
          documentNumber: normalizedId,
          data: {},
          cache: { hit: false },
          source: 'API',
          errorMessage: `No active provider configured for ${normalizedType}. Please verify your API keys.`,
        };
      }

      // Execute provider cascade (NeoAPI -> Axen -> FastNexora)
      const cascadeResult = await executeProviderCascade(lowerType, normalizedId, providers);

      // Downstream Provider Failure
      if (!cascadeResult.success || !cascadeResult.data || Object.keys(cascadeResult.data).length === 0) {
        // Crucial requirement: Provider failure must never overwrite an existing record
        return {
          success: false,
          documentType: normalizedType,
          documentNumber: normalizedId,
          data: {},
          cache: { hit: false },
          source: 'API',
          provider: cascadeResult.provider,
          errorMessage: cascadeResult.errorMessage || 'Document record not found in provider database.',
        };
      }

      // ------------------------------------------------------------------------
      // STEP 4: PERSIST SUCCESSFUL RESPONSE TO MONGODB (72-Hour Expiration)
      // ------------------------------------------------------------------------
      const savedDoc = await saveDocumentToCache({
        userId,
        docType: normalizedType,
        documentNumber: normalizedId,
        data: cascadeResult.data,
        provider: cascadeResult.provider || 'NeoAPI',
        source: 'API',
        inputMode: 'API',
      });

      const latencyMs = Date.now() - startTime;

      await logAuditEvent({
        actorId: userId,
        action: 'DOCUMENT_API_FETCH_SUCCESS',
        resourceType: 'DOCUMENT',
        resourceId: normalizedId,
        details: {
          docType: normalizedType,
          provider: cascadeResult.provider,
          docId: savedDoc?._id?.toString(),
          expiresAt: savedDoc?.expiresAt,
        },
        status: 'SUCCESS',
      });

      return {
        success: true,
        documentType: normalizedType,
        documentNumber: normalizedId,
        data: cascadeResult.data,
        cache: {
          hit: false,
          expiresAt: savedDoc?.expiresAt,
          fetchedAt: savedDoc?.fetchedAt,
        },
        source: 'API',
        provider: cascadeResult.provider,
        isPartial: cascadeResult.isPartial,
        missingFields: savedDoc?.missingFields || [],
        isComplete: savedDoc?.isComplete || false,
        docId: savedDoc?._id?.toString(),
        latencyMs,
      };
    } finally {
      // Clear inflight lock after completion
      inFlightRequests.delete(inflightKey);
    }
  })();

  inFlightRequests.set(inflightKey, executeLookupPromise);
  return await executeLookupPromise;
}

