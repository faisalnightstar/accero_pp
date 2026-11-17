/**
 * PAN Lookup and Verification Types
 * Accero PrintPortal - WebAPI.in.net Integration
 */

export type PanLookupStrategy = 'v1' | 'v2' | 'fallback';
export type PanProviderVersion = 'v1' | 'v2';
export type PanLookupStatus = 'SUCCESS' | 'FAILED';

/**
 * Raw JSON response structure from WebAPI V1:
 * GET https://webapi.in.net/api/pan_verification.php?token={API_TOKEN}&pan_no={PAN_NUMBER}
 */
export interface RawWebApiPanV1Response {
  status: string | number;
  message: string;
  pan: string;
  fullname?: string;
  fathername?: string;
  dob?: string;
  gender?: string;
  aadhaar_no?: boolean | string;
  [key: string]: unknown;
}

/**
 * Raw JSON response structure from WebAPI V2:
 * GET https://webapi.in.net/api/pan_verification1.php?token={API_TOKEN}&pan_no={PAN_NUMBER}
 */
export interface RawWebApiPanV2Response {
  status: string | number;
  message: string;
  pan: string;
  fullname?: string;
  fathername?: string;
  dob?: string;
  [key: string]: unknown;
}

export type RawWebApiResponse = RawWebApiPanV1Response | RawWebApiPanV2Response;

/**
 * Normalized Common PAN Lookup Result
 */
export interface PANLookupResult {
  /** 10-character PAN Number */
  pan: string;
  /** Full Name of PAN holder */
  fullName: string | null;
  /** Father's Name of PAN holder */
  fatherName: string | null;
  /** Date of Birth in normalized DD-MM-YYYY format */
  dateOfBirth: string | null;
  /** Gender (Male/Female/Other when provided by API V1, null for V2) */
  gender: string | null;
  /** Whether Aadhaar is linked / available (boolean from V1, null for V2) */
  aadhaarNumberAvailable: boolean | null;
  /** Provider endpoint version that fulfilled the lookup ('v1' | 'v2') */
  providerVersion: PanProviderVersion;
  /** Status message returned by the provider */
  message: string;
  /** Standardized lookup status: 'SUCCESS' or 'FAILED' */
  status: PanLookupStatus;

  // Operational Metadata
  /** Service fee deducted in INR (0 if cached/already paid or on failure) */
  feeDeducted?: number;
  /** Current user wallet balance in INR after transaction */
  currentBalance?: number;
  /** Whether this was a free reprint of a previously generated record */
  isFreeReprint?: boolean;
  /** Saved MongoDB DocumentRecord ObjectId string */
  docId?: string;
  /** Deterministic wallet transaction reference ID */
  transactionReferenceId?: string;
  /** Request duration in milliseconds */
  latencyMs?: number;
  /** Whether fallback from V1 to V2 occurred */
  fallbackUsed?: boolean;
  /** Standardized error code if status === 'FAILED' */
  errorCode?: string;
  /** User-friendly error message if status === 'FAILED' */
  errorMessage?: string;
}

/**
 * Parameters for executing a PAN lookup
 */
export interface PanLookupServiceParams {
  userId: string;
  panNumber: string;
  strategy?: PanLookupStrategy;
  requestId?: string;
  bypassCache?: boolean;
}

/**
 * Internal result from single endpoint fetch
 */
export interface SingleEndpointResult {
  success: boolean;
  version: PanProviderVersion;
  raw?: RawWebApiResponse;
  errorCode?: string;
  errorMessage?: string;
  httpStatus?: number;
  latencyMs: number;
}
