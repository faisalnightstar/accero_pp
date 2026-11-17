import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getJwtSecretKey, signJwtToken, verifyJwtToken, hasAdminRole } from '@/lib/auth';

describe('JWT Secret Management & Role Authorization', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  it('safely falls back to secure default secret when environment variable is unset', () => {
    delete process.env.JWT_SECRET;
    delete process.env.ACCESS_TOKEN_SECRET;
    const key = getJwtSecretKey();
    expect(key).toBeInstanceOf(Uint8Array);
    expect(key.length).toBeGreaterThanOrEqual(32);
  });

  it('prefers configured ACCESS_TOKEN_SECRET or JWT_SECRET when set', () => {
    delete process.env.ACCESS_TOKEN_SECRET;
    const customSecret = 'custom_production_secret_key_with_at_least_32_characters_for_security';
    process.env.JWT_SECRET = customSecret;
    const key = getJwtSecretKey();
    expect(key).toBeInstanceOf(Uint8Array);
    expect(new TextDecoder().decode(key)).toBe(customSecret);
  });

  it('accepts a secure secret >= 32 characters', () => {
    process.env.JWT_SECRET = 'valid_production_secret_key_with_at_least_32_characters_for_security';
    const key = getJwtSecretKey();
    expect(key).toBeInstanceOf(Uint8Array);
    expect(key.length).toBeGreaterThanOrEqual(32);
  });

  it('signs and verifies a valid JWT session with issuer and audience', async () => {
    process.env.JWT_SECRET = 'valid_production_secret_key_with_at_least_32_characters_for_security';
    const sessionPayload = {
      userId: '60d5ec49f1b2c82b8c8e4567',
      email: 'operator@accero.app',
      name: 'John Operator',
      role: 'operator' as const,
    };

    const token = await signJwtToken(sessionPayload);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');

    const verified = await verifyJwtToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.userId).toBe(sessionPayload.userId);
    expect(verified?.email).toBe(sessionPayload.email);
    expect(verified?.role).toBe('operator');
  });

  it('rejects a tampered JWT token', async () => {
    process.env.JWT_SECRET = 'valid_production_secret_key_with_at_least_32_characters_for_security';
    const token = await signJwtToken({
      userId: '60d5ec49f1b2c82b8c8e4567',
      email: 'user@accero.app',
      name: 'User',
      role: 'user',
    });

    const tamperedToken = token.slice(0, -5) + 'xxxxx';
    const verified = await verifyJwtToken(tamperedToken);
    expect(verified).toBeNull();
  });

  it('correctly verifies administrative roles', () => {
    expect(hasAdminRole('admin')).toBe(true);
    expect(hasAdminRole('super_admin')).toBe(true);
    expect(hasAdminRole('operator')).toBe(false);
    expect(hasAdminRole('customer')).toBe(false);
    expect(hasAdminRole('user')).toBe(false);
    expect(hasAdminRole(undefined)).toBe(false);
  });
});

