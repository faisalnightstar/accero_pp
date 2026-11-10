import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as paytmModule from '@/lib/payment/paytm';
import Payment from '@/models/Payment';
import Wallet from '@/models/Wallet';

// Mock mongodb connection
vi.mock('@/lib/mongodb', () => ({
  default: vi.fn().mockResolvedValue({}),
  connectToDatabase: vi.fn().mockResolvedValue({}),
}));

// Mock Audit logging
vi.mock('@/lib/logger/audit', () => ({
  logAuditEvent: vi.fn().mockResolvedValue(undefined),
}));

// Mock rate limiter
vi.mock('@/lib/security/rateLimiter', () => ({
  checkRateLimit: vi.fn().mockResolvedValue({
    allowed: true,
    remaining: 10,
    resetSeconds: 60,
    retryAfterSeconds: 0,
  }),
}));

// Mock Mongoose models
vi.mock('@/models/Payment', () => ({
  default: {
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock('@/models/Wallet', () => ({
  default: {
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
  },
}));

describe('Paytm Payment Atomicity & Concurrency Protection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects order creation if amount is below ₹10 or exceeds ₹50,000', async () => {
    process.env.PAYTM_MID = 'TEST_MID_1';
    process.env.PAYTM_UPI = 'test@pty';

    const resTooLow = await paytmModule.createPaytmPaymentOrder('user_123', 5);
    expect(resTooLow.success).toBe(false);
    expect(resTooLow.error).toMatch(/Minimum recharge amount is ₹10/i);

    const resTooHigh = await paytmModule.createPaytmPaymentOrder('user_123', 60000);
    expect(resTooHigh.success).toBe(false);
    expect(resTooHigh.error).toMatch(/Maximum recharge limit/i);
  });

  it('generates unique paymentId, orderId, and PENDING status on valid order creation', async () => {
    process.env.PAYTM_MID = 'TEST_MID_1';
    process.env.PAYTM_UPI = 'test@pty';

    vi.mocked(Payment.create).mockResolvedValue({} as any);

    const res = await paytmModule.createPaytmPaymentOrder('60d5ec49f1b2c82b8c8e1111', 250);
    expect(res.success).toBe(true);
    expect(res.orderId).toMatch(/^wallet_\d+_[a-f0-9]+$/);
    expect(res.paymentId).toMatch(/^pay_/);
    expect(res.qrDataUrl).toBeDefined();

    expect(Payment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 250,
        status: 'PENDING',
        upiId: 'test@pty',
        paytmMid: 'TEST_MID_1',
      })
    );
  });

  it('returns alreadyCredited=true without incrementing wallet when payment is already marked PAID', async () => {
    const existingPayment = {
      _id: 'payment_123',
      orderId: 'wallet_171000_abc',
      userId: '60d5ec49f1b2c82b8c8e1111',
      amount: 500,
      status: 'PAID',
      bankTxnId: 'BANK_TXN_999',
    };

    vi.mocked(Payment.findOne).mockResolvedValue(existingPayment as any);
    vi.mocked(Wallet.findOne).mockResolvedValue({ balance: 750 } as any);

    const result = await paytmModule.verifyAndCreditPaytmPayment('wallet_171000_abc');
    expect(result.success).toBe(true);
    expect(result.status).toBe('paid');
    expect(result.alreadyCredited).toBe(true);
    expect(result.newBalance).toBe(750);

    // CRITICAL: No database update or wallet increment executed
    expect(Payment.findOneAndUpdate).not.toHaveBeenCalled();
    expect(Wallet.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it('prevents double-crediting when two concurrent verification requests race', async () => {
    const pendingPayment = {
      _id: 'payment_123',
      orderId: 'wallet_171000_concurrent',
      userId: '60d5ec49f1b2c82b8c8e1111',
      amount: 300,
      status: 'PENDING',
      paytmMid: 'TEST_MID',
    };

    vi.mocked(Payment.findOne).mockResolvedValue(pendingPayment as any);

    // Mock fetch for Paytm gateway API
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        STATUS: 'TXN_SUCCESS',
        TXNAMOUNT: '300.00',
        BANKTXNID: 'BANK_TXN_CONCURRENT',
      }),
    } as any);

    // Simulate Race Condition: First thread succeeds in claiming status to PROCESSING,
    // Second thread fails (returns null because status is no longer PENDING)
    vi.mocked(Payment.findOneAndUpdate).mockResolvedValue(null); // Thread 2 loses race
    vi.mocked(Payment.findById).mockResolvedValue({
      _id: 'payment_123',
      status: 'PAID',
      bankTxnId: 'BANK_TXN_CONCURRENT',
    } as any);
    vi.mocked(Wallet.findOne).mockResolvedValue({ balance: 600 } as any);

    const result = await paytmModule.verifyAndCreditPaytmPayment('wallet_171000_concurrent');
    expect(result.success).toBe(true);
    expect(result.status).toBe('paid');
    expect(result.alreadyCredited).toBe(true);

    // CRITICAL: Second thread did NOT credit wallet
    expect(Wallet.findOneAndUpdate).not.toHaveBeenCalled();

    global.fetch = originalFetch;
  });
});
