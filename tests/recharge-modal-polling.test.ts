import { describe, it, expect, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import * as walletActions from '@/actions/wallet';
import * as auth from '@/lib/auth';

// Mock getSession
vi.mock('@/lib/auth', () => ({
  getSession: vi.fn(),
}));

// Mock payment helper
vi.mock('@/lib/payment/paytm', () => ({
  verifyAndCreditPaytmPayment: vi.fn().mockResolvedValue({
    success: true,
    status: 'paid',
    newBalance: 250,
    amount: 100,
    bankTxnId: 'TXN123456',
  }),
  createDynamicPaymentOrder: vi.fn(),
  getPaytmAccountConfig: vi.fn(),
}));

describe('RechargeModal Polling & Render Safety', () => {
  it('ensures RechargeModal source code has no side-effects inside state updater functions', () => {
    const modalPath = path.resolve(process.cwd(), 'src/components/wallet/RechargeModal.tsx');
    const content = fs.readFileSync(modalPath, 'utf8');

    // Verify setPollCount((prev) => { ... }) pattern is eliminated
    expect(content).not.toContain('setPollCount((prev)');
    expect(content).not.toContain('setPollCount(');

    // Verify poll count is tracked using a mutable ref instead of trigger-happy state
    expect(content).toContain('pollCountRef = useRef<number>(0)');
    expect(content).toContain('isCheckingStatusRef = useRef<boolean>(false)');
    expect(content).toContain('isComponentMounted.current = false');

    // Verify polling timer directly calls checkPaytmStatus outside of any setState updater
    const pollingRegex = /pollingTimerRef\.current\s*=\s*setInterval\(\(\)\s*=>\s*\{[\s\S]*?checkPaytmStatus\(/;
    expect(pollingRegex.test(content)).toBe(true);
  });

  it('verifies that no component in src calls async side effects inside setState callbacks', () => {
    const modalPath = path.resolve(process.cwd(), 'src/components/wallet/RechargeModal.tsx');
    const content = fs.readFileSync(modalPath, 'utf8');

    // Matches setX((prev) => { ... await/fetch/action ... })
    const badUpdaterRegex = /set[A-Z]\w*\(\s*\([^)]*\)\s*=>\s*\{[^}]*(?:await|fetch|Action|checkPaytmStatus)/;
    expect(badUpdaterRegex.test(content)).toBe(false);
  });

  it('verifyPaytmOrderAction returns unauthorized gracefully when unauthenticated', async () => {
    vi.mocked(auth.getSession).mockResolvedValueOnce(null as any);
    const res = await walletActions.verifyPaytmOrderAction('ORDER_TEST_123');

    expect(res.success).toBe(false);
    expect(res.status).toBe('failed');
    expect(res.error).toMatch(/Unauthorized/i);
  });

  it('verifyPaytmOrderAction successfully delegates to verifyAndCreditPaytmPayment when authenticated', async () => {
    vi.mocked(auth.getSession).mockResolvedValueOnce({
      userId: 'user_12345',
      email: 'user@example.com',
      role: 'RETAILER',
    } as any);

    const res = await walletActions.verifyPaytmOrderAction('ORDER_TEST_456');

    expect(res.success).toBe(true);
    expect(res.status).toBe('paid');
    expect(res.newBalance).toBe(250);
  });
});

