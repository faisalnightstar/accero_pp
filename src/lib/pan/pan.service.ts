/**
 * Centralized PAN Lookup and Verification Service
 * Accero PrintPortal - Production WebAPI.in.net Integration
 *
 * Implements:
 * - Direct HTTPS requests to WebAPI V1 & V2 with strict SSRF and URL validation
 * - Configurable strategy: V1, V2, or V1-to-V2 fallback
 * - Sensitive credential isolation (zero token leakage in logs, responses, or client)
 * - Atomic idempotent wallet debits (single charge on success, zero charge on failure)
 * - MongoDB persistence to PanLookupRecord, VerificationRequest, and DocumentRecord
 * - Concurrency deduplication for in-flight requests (double-click safety)
 */

import crypto from 'crypto';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import Wallet from '@/models/Wallet';
import VerificationRequest from '@/models/VerificationRequest';
import PanLookupRecord from '@/models/PanLookupRecord';
import {
  PANLookupResult,
  PanLookupServiceParams,
  PanLookupStrategy,
  PanProviderVersion,
  RawWebApiResponse,
  SingleEndpointResult,
} from './pan.types';
import { validatePanNumber, validateProviderResponse } from './pan.validation';
import { normalizePanResponse } from './pan.normalizer';
import { PanLookupError, PAN_ERROR_MESSAGES, getSafePanErrorMessage } from './pan.errors';
import { getConfiguredServicePricing, isDocumentAlreadyPaid } from '@/lib/wallet/pricing';
import { saveDocumentToCache, findCachedDocument } from '@/lib/documents/documentCache';
import { checkRateLimit } from '@/lib/security/rateLimiter';
import { maskIdentifier } from '@/lib/network/proxy-config';
import { providerFetch } from '@/lib/network/provider-client';

const WEBAPI_V1_ENDPOINT = 'https://webapi.in.net/api/pan_verification.php';
const WEBAPI_V2_ENDPOINT = 'https://webapi.in.net/api/pan_verification1.php';
const DEFAULT_TIMEOUT_MS = 10000;

/**
 * In-process concurrency deduplication map keyed by `${userId}:PAN:${cleanPan}`.
 * Collapses simultaneous requests within the same worker so only one WebAPI request
 * and one wallet charge execute.
 */
const inFlightPanLookups = new Map<string, Promise<PANLookupResult>>();

export function clearInFlightPanLookupsForTesting(): void {
  inFlightPanLookups.clear();
}

function canQueryModel(modelFn: unknown): boolean {
  return (
    mongoose.connection?.readyState === 1 ||
    typeof (modelFn as any)?.mock !== 'undefined'
  );
}

async function resolveQuery<T = any>(q: any): Promise<T | null> {
  if (!q) return null;
  if (typeof q.lean === 'function') {
    return await q.lean();
  }
  return await q;
}

/**
 * Builds a deterministic wallet transaction reference ID.
 */
export function buildPanLookupReferenceId(userId: string, panNumber: string): string {
  return `PAN_LOOKUP:${userId}:${panNumber.toUpperCase()}`;
}

/**
 * Retrieves the configured WebAPI server token from environment.
 * Supports PAN_LOOKUP_API_TOKEN, WEBAPI_TOKEN, and WEBAPI_PAN_TOKEN.
 * Throws PanLookupError('INVALID_TOKEN') if missing.
 */
export function getPanLookupApiToken(): string {
  const token = (
    process.env.PAN_LOOKUP_API_TOKEN ||
    process.env.WEBAPI_TOKEN ||
    process.env.WEBAPI_PAN_TOKEN ||
    ''
  ).trim();
  if (!token) {
    console.warn(
      '[WebAPI:PAN] Configuration error: Missing PAN_LOOKUP_API_TOKEN or WEBAPI_TOKEN in environment.'
    );
    throw new PanLookupError(
      'INVALID_TOKEN',
      'PAN_LOOKUP_API_TOKEN is not configured in server environment.',
      500
    );
  }
  return token;
}

/**
 * Performs a single HTTP GET request to WebAPI V1 or V2.
 * Never logs the complete URL containing the token or raw PAN.
 */
export async function fetchPanFromWebAPI(
  pan: string,
  version: PanProviderVersion,
  options?: { timeoutMs?: number; signal?: AbortSignal }
): Promise<SingleEndpointResult> {
  const startTime = Date.now();
  const maskedPan = maskIdentifier(pan);
  const timeoutMs = options?.timeoutMs || DEFAULT_TIMEOUT_MS;

  const endpointBase = version === 'v1' ? WEBAPI_V1_ENDPOINT : WEBAPI_V2_ENDPOINT;

  // Retrieve token safely
  let token: string;
  try {
    token = getPanLookupApiToken();
  } catch (err) {
    return {
      success: false,
      version,
      errorCode: 'INVALID_TOKEN',
      errorMessage: 'PAN verification gateway service configuration error.',
      latencyMs: Date.now() - startTime,
    };
  }

  // Build target URL with safe encoding
  const targetUrl = new URL(endpointBase);
  targetUrl.searchParams.set('token', token);
  targetUrl.searchParams.set('pan_no', pan);

  console.log('[WebAPI:PAN] Calling endpoint', {
    version,
    pan: maskedPan,
    endpointHost: targetUrl.hostname,
    timeoutMs,
  });

  try {
    const response = await providerFetch(targetUrl.toString(), {
      providerId: 'webapi',
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      timeoutMs,
      signal: options?.signal,
    });

    const latencyMs = Date.now() - startTime;
    console.log('[WebAPI:PAN] HTTP response received', {
      version,
      pan: maskedPan,
      httpStatus: response.status,
      latencyMs,
    });

    if (!response.ok && response.status !== 200) {
      if (response.status === 401 || response.status === 403) {
        return {
          success: false,
          version,
          httpStatus: response.status,
          errorCode: 'AUTH_ERROR',
          errorMessage: PAN_ERROR_MESSAGES.AUTH_ERROR,
          latencyMs,
        };
      }
      if (response.status === 429) {
        return {
          success: false,
          version,
          httpStatus: response.status,
          errorCode: 'RATE_LIMIT_EXCEEDED',
          errorMessage: PAN_ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
          latencyMs,
        };
      }
      return {
        success: false,
        version,
        httpStatus: response.status,
        errorCode: 'PROVIDER_UNAVAILABLE',
        errorMessage: PAN_ERROR_MESSAGES.PROVIDER_UNAVAILABLE,
        latencyMs,
      };
    }

    let rawJson: unknown;
    try {
      rawJson = await response.json();
    } catch {
      return {
        success: false,
        version,
        httpStatus: response.status,
        errorCode: 'INVALID_JSON',
        errorMessage: PAN_ERROR_MESSAGES.INVALID_JSON,
        latencyMs,
      };
    }

    // Validate structure and success code (status === "100")
    const validation = validateProviderResponse(rawJson, pan);
    if (!validation.valid || !validation.raw) {
      return {
        success: false,
        version,
        raw: rawJson as RawWebApiResponse,
        httpStatus: response.status,
        errorCode: validation.errorCode || 'NOT_FOUND',
        errorMessage: validation.reason || PAN_ERROR_MESSAGES.NOT_FOUND,
        latencyMs,
      };
    }

    return {
      success: true,
      version,
      raw: validation.raw,
      httpStatus: response.status,
      latencyMs,
    };
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    const safeError = getSafePanErrorMessage(err);

    console.warn('[WebAPI:PAN] Request failed', {
      version,
      pan: maskedPan,
      code: safeError.code,
      latencyMs,
    });

    return {
      success: false,
      version,
      errorCode: safeError.code,
      errorMessage: safeError.message,
      latencyMs,
    };
  }
}

/**
 * Executes the configured lookup strategy:
 * - 'v1': Calls V1 only
 * - 'v2': Calls V2 only
 * - 'fallback': Calls V1; if V1 fails or is not found, automatically falls back to V2
 */
export async function executePanLookupStrategy(
  pan: string,
  strategy: PanLookupStrategy = 'fallback',
  options?: { timeoutMs?: number; signal?: AbortSignal }
): Promise<{
  success: boolean;
  version: PanProviderVersion;
  fallbackUsed: boolean;
  raw?: RawWebApiResponse;
  errorCode?: string;
  errorMessage?: string;
  latencyMs: number;
}> {
  const startTime = Date.now();

  if (strategy === 'v2') {
    const res = await fetchPanFromWebAPI(pan, 'v2', options);
    return {
      success: res.success,
      version: 'v2',
      fallbackUsed: false,
      raw: res.raw,
      errorCode: res.errorCode,
      errorMessage: res.errorMessage,
      latencyMs: res.latencyMs,
    };
  }

  if (strategy === 'v1') {
    const res = await fetchPanFromWebAPI(pan, 'v1', options);
    return {
      success: res.success,
      version: 'v1',
      fallbackUsed: false,
      raw: res.raw,
      errorCode: res.errorCode,
      errorMessage: res.errorMessage,
      latencyMs: res.latencyMs,
    };
  }

  // Strategy === 'fallback': Try V1 first
  const v1Res = await fetchPanFromWebAPI(pan, 'v1', options);
  if (v1Res.success && v1Res.raw) {
    return {
      success: true,
      version: 'v1',
      fallbackUsed: false,
      raw: v1Res.raw,
      latencyMs: v1Res.latencyMs,
    };
  }

  // V1 failed -> Execute V2 fallback
  console.log('[WebAPI:PAN] V1 attempt failed or not found, falling back to V2', {
    pan: maskIdentifier(pan),
    v1Error: v1Res.errorCode,
  });

  const v2Res = await fetchPanFromWebAPI(pan, 'v2', options);
  const totalLatencyMs = Date.now() - startTime;

  if (v2Res.success && v2Res.raw) {
    return {
      success: true,
      version: 'v2',
      fallbackUsed: true,
      raw: v2Res.raw,
      latencyMs: totalLatencyMs,
    };
  }

  // Both failed
  return {
    success: false,
    version: 'v2',
    fallbackUsed: true,
    errorCode: v2Res.errorCode || v1Res.errorCode || 'NOT_FOUND',
    errorMessage: v2Res.errorMessage || v1Res.errorMessage || PAN_ERROR_MESSAGES.NOT_FOUND,
    latencyMs: totalLatencyMs,
  };
}

/**
 * End-to-end PAN Lookup with Wallet billing, caching, deduplication, and persistence.
 */
export async function lookupAndBillPan({
  userId,
  panNumber,
  strategy = 'fallback',
  requestId,
  bypassCache = false,
}: PanLookupServiceParams): Promise<PANLookupResult> {
  const startTime = Date.now();

  // 1. Validate PAN format
  const validation = validatePanNumber(panNumber);
  if (!validation.valid) {
    return {
      pan: validation.normalized || (panNumber || '').trim().toUpperCase(),
      fullName: null,
      fatherName: null,
      dateOfBirth: null,
      gender: null,
      aadhaarNumberAvailable: null,
      providerVersion: 'v1',
      message: validation.errorMessage || PAN_ERROR_MESSAGES.INVALID_PAN,
      status: 'FAILED',
      errorCode: validation.errorCode || 'INVALID_PAN',
      errorMessage: validation.errorMessage || PAN_ERROR_MESSAGES.INVALID_PAN,
      feeDeducted: 0,
      latencyMs: Date.now() - startTime,
    };
  }

  const cleanPan = validation.normalized;
  const maskedPan = maskIdentifier(cleanPan);
  const attemptRequestId = requestId || `pan_${crypto.randomUUID()}`;

  // 2. Validate authentication
  if (!userId) {
    return {
      pan: cleanPan,
      fullName: null,
      fatherName: null,
      dateOfBirth: null,
      gender: null,
      aadhaarNumberAvailable: null,
      providerVersion: 'v1',
      message: PAN_ERROR_MESSAGES.UNAUTHORIZED,
      status: 'FAILED',
      errorCode: 'UNAUTHORIZED',
      errorMessage: PAN_ERROR_MESSAGES.UNAUTHORIZED,
      feeDeducted: 0,
      latencyMs: Date.now() - startTime,
    };
  }

  // 3. Concurrency deduplication (prevents simultaneous double-click submissions)
  const dedupKey = `${userId}:PAN:${cleanPan}`;
  const existingInFlight = inFlightPanLookups.get(dedupKey);
  if (existingInFlight) {
    console.log('[PanService] Joining in-flight PAN lookup', { pan: maskedPan });
    return await existingInFlight;
  }

  const executionPromise = (async (): Promise<PANLookupResult> => {
    try {
      await connectToDatabase();
      const userObjectId = new mongoose.Types.ObjectId(userId);

      // Rate limit check
      const rateLimit = await checkRateLimit('PAN_LOOKUP', userId);
      if (!rateLimit.allowed) {
        return {
          pan: cleanPan,
          fullName: null,
          fatherName: null,
          dateOfBirth: null,
          gender: null,
          aadhaarNumberAvailable: null,
          providerVersion: 'v1',
          message: PAN_ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
          status: 'FAILED',
          errorCode: 'RATE_LIMIT_EXCEEDED',
          errorMessage: PAN_ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
          feeDeducted: 0,
          latencyMs: Date.now() - startTime,
        };
      }

      // Check MongoDB 72h Cache first (unless bypassed)
      let cachedDoc: any = null;
      if (!bypassCache) {
        cachedDoc = await findCachedDocument({
          userId,
          docType: 'PAN',
          documentNumber: cleanPan,
        });

        if (cachedDoc && cachedDoc.data && Object.keys(cachedDoc.data).length > 0) {
          console.log('[PanService] Cache hit (MongoDB 72h)', { pan: maskedPan });
          const d = cachedDoc.data;
          const userWallet = await resolveQuery<any>(Wallet.findOne({ userId: userObjectId }));

          return {
            pan: cleanPan,
            fullName: d.fullName || null,
            fatherName: d.fatherName || null,
            dateOfBirth: d.dateOfBirth || null,
            gender: d.gender || null,
            aadhaarNumberAvailable: typeof d.aadhaarNumberAvailable === 'boolean' ? d.aadhaarNumberAvailable : null,
            providerVersion: (d.providerVersion as PanProviderVersion) || 'v1',
            message: 'Retrieved verified PAN record from secure cache',
            status: 'SUCCESS',
            feeDeducted: 0,
            currentBalance: userWallet?.balance ?? 0,
            isFreeReprint: true,
            docId: cachedDoc._id?.toString(),
            latencyMs: Date.now() - startTime,
          };
        }
      }

      // Resolve Service Pricing, payment status, and user wallet in parallel
      const [pricing, isAlreadyPaid, userWallet] = await Promise.all([
        getConfiguredServicePricing('PAN'),
        cachedDoc?.isPaid
          ? Promise.resolve(true)
          : isDocumentAlreadyPaid(userId, 'PAN', cleanPan),
        resolveQuery<any>(Wallet.findOne({ userId: userObjectId })),
      ]);
      const fee = pricing.fee;
      const effectiveFee = isAlreadyPaid ? 0 : fee;
      const availableBalance = typeof userWallet?.balance === 'number' ? userWallet.balance : 0;

      if (!isAlreadyPaid && availableBalance < effectiveFee) {
        console.warn('[PanService] Insufficient balance for PAN lookup', {
          pan: maskedPan,
          balance: availableBalance,
          required: effectiveFee,
        });
        return {
          pan: cleanPan,
          fullName: null,
          fatherName: null,
          dateOfBirth: null,
          gender: null,
          aadhaarNumberAvailable: null,
          providerVersion: 'v1',
          message: PAN_ERROR_MESSAGES.INSUFFICIENT_BALANCE,
          status: 'FAILED',
          errorCode: 'INSUFFICIENT_BALANCE',
          errorMessage: `Insufficient wallet balance. PAN verification requires ₹${effectiveFee}, but your balance is ₹${availableBalance.toFixed(2)}.`,
          feeDeducted: 0,
          currentBalance: availableBalance,
          latencyMs: Date.now() - startTime,
        };
      }

      // Execute External Provider Strategy (V1, V2, or Fallback)
      const providerRes = await executePanLookupStrategy(cleanPan, strategy);

      if (!providerRes.success || !providerRes.raw) {
        console.warn('[PanService] Provider lookup unsuccessful', {
          pan: maskedPan,
          errorCode: providerRes.errorCode,
          errorMessage: providerRes.errorMessage,
        });

        // Persist failed lookup record for auditing (WITHOUT wallet deduction)
        try {
          if (canQueryModel(PanLookupRecord?.create)) {
            await PanLookupRecord.create({
              userId: userObjectId,
              panNumber: cleanPan,
              providerVersion: providerRes.version,
              status: 'FAILED',
              serviceFee: 0,
              requestTimestamp: new Date(),
              errorMessage: providerRes.errorMessage || PAN_ERROR_MESSAGES.NOT_FOUND,
            });
          }
        } catch {
          // Non-blocking persistence error
        }

        return {
          pan: cleanPan,
          fullName: null,
          fatherName: null,
          dateOfBirth: null,
          gender: null,
          aadhaarNumberAvailable: null,
          providerVersion: providerRes.version,
          message: providerRes.errorMessage || PAN_ERROR_MESSAGES.NOT_FOUND,
          status: 'FAILED',
          errorCode: providerRes.errorCode || 'NOT_FOUND',
          errorMessage: providerRes.errorMessage || PAN_ERROR_MESSAGES.NOT_FOUND,
          feeDeducted: 0,
          currentBalance: availableBalance,
          fallbackUsed: providerRes.fallbackUsed,
          latencyMs: Date.now() - startTime,
        };
      }

      // Normalize verified response
      const normalized = normalizePanResponse(providerRes.raw, providerRes.version, cleanPan);

      // Perform atomic conditional wallet deduction (Deducted EXACTLY ONCE on success)
      const txReferenceId = buildPanLookupReferenceId(userId, cleanPan);
      let feeDeducted = 0;
      let postTxBalance = availableBalance;

      if (effectiveFee > 0) {
        const updatedWallet = await Wallet.findOneAndUpdate(
          {
            userId: userObjectId,
            balance: { $gte: effectiveFee },
            transactions: {
              $not: {
                $elemMatch: {
                  referenceId: txReferenceId,
                  type: 'debit',
                  status: 'COMPLETED',
                },
              },
            },
          },
          {
            $inc: { balance: -effectiveFee, totalDebited: effectiveFee },
            $push: {
              transactions: {
                amount: effectiveFee,
                type: 'debit',
                category: 'VERIFICATION',
                docType: 'PAN',
                documentType: 'PAN',
                referenceId: txReferenceId,
                description: `PAN Card Verification Fee (${cleanPan})`,
                balanceBefore: availableBalance,
                balanceAfter: availableBalance - effectiveFee,
                status: 'COMPLETED',
                createdAt: new Date(),
              },
            },
          },
          { returnDocument: 'after' }
        );

        if (updatedWallet) {
          feeDeducted = effectiveFee;
          postTxBalance = updatedWallet.balance;
        } else {
          // If update failed, check if a concurrent sibling transaction already completed the debit
          const latestWallet = await resolveQuery<any>(Wallet.findOne({ userId: userObjectId }));
          const alreadyDebited = Boolean(
            latestWallet?.transactions?.some(
              (t: any) =>
                t.referenceId === txReferenceId && t.type === 'debit' && t.status === 'COMPLETED'
            )
          );

          if (alreadyDebited) {
            feeDeducted = 0;
            postTxBalance = latestWallet?.balance ?? availableBalance;
          } else {
            // Balance dropped concurrently
            return {
              pan: cleanPan,
              fullName: null,
              fatherName: null,
              dateOfBirth: null,
              gender: null,
              aadhaarNumberAvailable: null,
              providerVersion: providerRes.version,
              message: PAN_ERROR_MESSAGES.INSUFFICIENT_BALANCE,
              status: 'FAILED',
              errorCode: 'INSUFFICIENT_BALANCE',
              errorMessage: PAN_ERROR_MESSAGES.INSUFFICIENT_BALANCE,
              feeDeducted: 0,
              currentBalance: latestWallet?.balance ?? 0,
              latencyMs: Date.now() - startTime,
            };
          }
        }
      }

      // Persist verification request, document record, and lookup history in parallel
      let savedDocId: string | undefined;
      await Promise.all([
        (async () => {
          try {
            if (canQueryModel(VerificationRequest?.findOneAndUpdate)) {
              await VerificationRequest.findOneAndUpdate(
                { requestId: attemptRequestId },
                {
                  $set: {
                    userId: userObjectId,
                    docType: 'PAN',
                    idNumber: cleanPan,
                    fee: feeDeducted,
                    status: 'COMPLETED',
                    provider: 'WebAPI',
                    providerVersion: providerRes.version,
                    fallbackUsed: providerRes.fallbackUsed,
                    transactionReferenceId: txReferenceId,
                  },
                },
                { upsert: true, returnDocument: 'after' }
              );
            }
          } catch (err) {
            console.warn('[PanService] Non-blocking VerificationRequest logging error:', err);
          }
        })(),
        (async () => {
          try {
            const savedDoc = await saveDocumentToCache({
              userId,
              docType: 'PAN',
              documentNumber: cleanPan,
              data: {
                panNumber: cleanPan,
                fullName: normalized.fullName || '',
                fatherName: normalized.fatherName || '',
                dateOfBirth: normalized.dateOfBirth || '',
                gender: normalized.gender || '',
                aadhaarNumberAvailable: normalized.aadhaarNumberAvailable,
                providerVersion: normalized.providerVersion,
                qrData: `PAN:${cleanPan}|NAME:${normalized.fullName || ''}|FNAME:${normalized.fatherName || ''}|DOB:${normalized.dateOfBirth || ''}`,
              },
              provider: `WebAPI (${normalized.providerVersion.toUpperCase()})`,
              source: 'API',
              inputMode: 'API',
              isPaid: true,
              paymentReferenceId: txReferenceId,
            });
            savedDocId = savedDoc?._id?.toString();
          } catch (err) {
            console.warn('[PanService] Non-blocking DocumentRecord save error:', err);
          }
        })(),
        (async () => {
          try {
            if (canQueryModel(PanLookupRecord?.create)) {
              await PanLookupRecord.create({
                userId: userObjectId,
                panNumber: cleanPan,
                fullName: normalized.fullName,
                fatherName: normalized.fatherName,
                dateOfBirth: normalized.dateOfBirth,
                gender: normalized.gender,
                aadhaarNumberAvailable: normalized.aadhaarNumberAvailable,
                providerVersion: normalized.providerVersion,
                status: 'SUCCESS',
                serviceFee: feeDeducted,
                walletTransactionRef: txReferenceId,
                requestTimestamp: new Date(),
                providerResponseRef: attemptRequestId,
              });
            }
          } catch (err) {
            console.warn('[PanService] Non-blocking PanLookupRecord save error:', err);
          }
        })(),
      ]);

      return {
        ...normalized,
        feeDeducted,
        currentBalance: postTxBalance,
        isFreeReprint: effectiveFee === 0,
        docId: savedDocId,
        transactionReferenceId: txReferenceId,
        fallbackUsed: providerRes.fallbackUsed,
        latencyMs: Date.now() - startTime,
      };
    } finally {
      inFlightPanLookups.delete(dedupKey);
    }
  })();

  inFlightPanLookups.set(dedupKey, executionPromise);
  return await executionPromise;
}

/**
 * Retrieves the authenticated user's recent PAN lookup history.
 */
export async function getPanLookupHistory(
  userId: string,
  limit = 25
): Promise<Array<{
  id: string;
  panNumber: string;
  fullName: string | null;
  fatherName: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  aadhaarNumberAvailable: boolean | null;
  providerVersion: 'v1' | 'v2';
  status: 'SUCCESS' | 'FAILED';
  serviceFee: number;
  createdAt: string;
}>> {
  if (!userId) return [];

  try {
    await connectToDatabase();
    if (!canQueryModel(PanLookupRecord?.find)) return [];

    const records = await resolveQuery<any[]>(
      PanLookupRecord.find({ userId: new mongoose.Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .limit(Math.min(limit, 100))
    );

    if (!Array.isArray(records)) return [];

    return records.map((r) => ({
      id: r._id.toString(),
      panNumber: r.panNumber,
      fullName: r.fullName,
      fatherName: r.fatherName,
      dateOfBirth: r.dateOfBirth,
      gender: r.gender,
      aadhaarNumberAvailable: r.aadhaarNumberAvailable,
      providerVersion: r.providerVersion,
      status: r.status,
      serviceFee: r.serviceFee,
      createdAt: (r.createdAt || r.requestTimestamp || new Date()).toISOString(),
    }));
  } catch (err) {
    console.error('[PanService] Error retrieving PAN lookup history:', err);
    return [];
  }
}
