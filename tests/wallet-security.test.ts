import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as auth from '@/lib/auth';
import * as walletActions from '@/actions/wallet';
import ManualRechargeRequest from '@/models/ManualRechargeRequest';
import Wallet from '@/models/Wallet';

// Mock getSession to control user context in unit tests
vi.mock('@/lib/auth', async () => {
  const actual = await vi.importActual<typeof auth>('@/lib/auth');
  return {
    ...actual,
    getSession: vi.fn(),
  };
});

// Mock database connection
vi.mock('@/lib/mongodb', () => ({
  default: vi.fn().mockResolvedValue({}),
  connectToDatabase: vi.fn().mockResolvedValue({}),
}));

// Mock Audit logging
vi.mock('@/lib/logger/audit', () => ({
  logAuditEvent: vi.fn().mockResolvedValue(undefined),
}));

// Mock RateLimiter so tests run in memory without connecting to network/mongo
vi.mock('@/lib/security/rateLimiter', () => ({
  checkRateLimit: vi.fn().mockResolvedValue({
    allowed: true,
    remaining: 10,
    resetSeconds: 60,
    retryAfterSeconds: 0,
  }),
}));

// Mock Mongoose models
vi.mock('@/models/Wallet', () => ({
  default: {
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock('@/models/ManualRechargeRequest', () => ({
  default: {
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
    create: vi.fn(),
    find: vi.fn(),
  },
}));

describe('Wallet Financial Integrity & Security Controls', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  it('strictly blocks SANDBOX wallet credits when running in production', async () => {
    (process.env as any).NODE_ENV = 'production';
    delete process.env.ALLOW_SANDBOX_RECHARGE;

    vi.mocked(auth.getSession).mockResolvedValue({
      userId: '60d5ec49f1b2c82b8c8e1111',
      email: 'attacker@test.com',
      name: 'Attacker',
      role: 'user',
    });

    const result = await walletActions.rechargeWallet(5000, 'SANDBOX');
    expect(result.success).toBe(false);
    expect(result.newBalance).toBe(0);
    expect(result.error).toMatch(/Sandbox instant simulation is disabled in this environment/i);
    expect(Wallet.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it('rejects manual UTR submissions with invalid length or characters', async () => {
    vi.mocked(auth.getSession).mockResolvedValue({
      userId: '60d5ec49f1b2c82b8c8e1111',
      email: 'user@test.com',
      name: 'User',
      role: 'user',
    });

    // Too short (less than 8 chars)
    const result = await walletActions.submitManualRechargeRequest(100, '123');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/valid 8-22 character UPI UTR/i);
    expect(ManualRechargeRequest.create).not.toHaveBeenCalled();
  });

  it('never automatically credits wallet when user submits a manual UTR', async () => {
    vi.mocked(auth.getSession).mockResolvedValue({
      userId: '60d5ec49f1b2c82b8c8e1111',
      email: 'user@test.com',
      name: 'User',
      role: 'user',
    });

    vi.mocked(ManualRechargeRequest.findOne).mockResolvedValue(null);
    vi.mocked(ManualRechargeRequest.create).mockResolvedValue({
      _id: '60d5ec49f1b2c82b8c8e1234',
      status: 'PENDING',
    } as any);
    vi.mocked(Wallet.findOne).mockResolvedValue({ balance: 25 } as any);

    const result = await walletActions.rechargeWallet(500, 'UPI_QR', 'UTR987654321');
    expect(result.success).toBe(true);
    expect(result.pending).toBe(true);
    expect(result.message).toMatch(/verified by an administrator/i);

    // CRITICAL: Wallet balance was NOT incremented!
    expect(Wallet.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it('blocks non-admin users from approving manual recharge requests', async () => {
    vi.mocked(auth.getSession).mockResolvedValue({
      userId: '60d5ec49f1b2c82b8c8e1111',
      email: 'operator@test.com',
      name: 'Operator',
      role: 'operator', // Not admin
    });

    const result = await walletActions.approveManualRecharge('60d5ec49f1b2c82b8c8e1234');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Forbidden: Admin access required/i);
    expect(ManualRechargeRequest.findOneAndUpdate).not.toHaveBeenCalled();
    expect(Wallet.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it('allows authorized administrators to approve pending recharges and credit wallet', async () => {
    vi.mocked(auth.getSession).mockResolvedValue({
      userId: '60d5ec49f1b2c82b8c8e9999',
      email: 'admin@accero.app',
      name: 'Admin',
      role: 'admin',
    });

    const targetUserId = '60d5ec49f1b2c82b8c8e1111';
    const validRequestId = '60d5ec49f1b2c82b8c8e1234';

    vi.mocked(ManualRechargeRequest.findOneAndUpdate).mockResolvedValue({
      _id: validRequestId,
      userId: targetUserId,
      amount: 500,
      utrNumber: 'UTR987654321',
      status: 'APPROVED',
    } as any);

    vi.mocked(Wallet.findOneAndUpdate).mockResolvedValue({
      balance: 500,
      transactions: [{ balanceAfter: 0 }],
      save: vi.fn(),
    } as any);

    const result = await walletActions.approveManualRecharge(validRequestId);
    expect(result.success).toBe(true);
    expect(Wallet.findOneAndUpdate).toHaveBeenCalledWith(
      { userId: targetUserId },
      expect.objectContaining({
        $inc: { balance: 500, totalCredited: 500 },
      }),
      expect.anything()
    );
  });
});
