import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import AuditLog, { AuditAction } from '@/models/AuditLog';

interface AuditEventParams {
  actorId?: string | mongoose.Types.ObjectId;
  actorEmail?: string;
  action: AuditAction;
  resourceType: 'AUTH' | 'WALLET' | 'PAYMENT' | 'DOCUMENT' | 'SECURITY' | 'PRINT_JOB';
  resourceId?: string;
  details?: Record<string, any>;
  ip?: string;
  userAgent?: string;
  status?: 'SUCCESS' | 'FAILURE' | 'WARNING';
}

/**
 * Strips or masks sensitive credentials and citizen PII before persisting audit logs
 */
function sanitizeDetails(details: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(details)) {
    const lowerKey = key.toLowerCase();

    // Redact credentials completely
    if (
      lowerKey.includes('password') ||
      lowerKey.includes('secret') ||
      lowerKey.includes('token') ||
      lowerKey.includes('merchantkey') ||
      lowerKey.includes('apikey')
    ) {
      sanitized[key] = '[REDACTED_SECRET]';
      continue;
    }

    // Mask sensitive identity numbers
    if (typeof value === 'string') {
      if (lowerKey.includes('aadhaar') || lowerKey.includes('uid')) {
        const clean = value.replace(/\s+/g, '');
        sanitized[key] = clean.length === 12 ? `XXXX-XXXX-${clean.slice(-4)}` : '[REDACTED_AADHAAR]';
        continue;
      }

      if (lowerKey.includes('pan') && value.length === 10) {
        sanitized[key] = `${value.slice(0, 3)}XXXXX${value.slice(-2)}`;
        continue;
      }
    }

    // Pass through safe primitives
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeDetails(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Records an immutable security audit event
 */
export async function logAuditEvent(params: AuditEventParams): Promise<void> {
  try {
    await connectToDatabase();

    const sanitizedDetails = params.details ? sanitizeDetails(params.details) : {};

    await AuditLog.create({
      actorId:
        params.actorId && mongoose.Types.ObjectId.isValid(params.actorId.toString())
          ? new mongoose.Types.ObjectId(params.actorId.toString())
          : undefined,
      actorEmail: params.actorEmail?.toLowerCase().trim(),
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      details: sanitizedDetails,
      ip: params.ip,
      userAgent: params.userAgent,
      status: params.status || 'SUCCESS',
      createdAt: new Date(),
    });
  } catch (err) {
    // Audit log failure must not crash parent flow, but must be logged to stderr
    console.error('[AUDIT LOG FATAL] Failed to persist audit event:', err);
  }
}

