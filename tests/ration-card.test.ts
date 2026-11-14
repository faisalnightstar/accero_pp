import { describe, it, expect } from 'vitest';
import {
  formatRationCardNumber,
  mapToRationCardData,
  RationCardData,
} from '../src/types/cards';
import { analyzeDocumentCompleteness } from '../src/lib/missingFields';
import { DEFAULT_SERVICE_PRICING, SERVICE_FEES, normalizeDocType } from '../src/lib/wallet/constants';
import Wallet from '../src/models/Wallet';
import DocumentRecord from '../src/models/DocumentRecord';
import {
  normalizeDocTypeString,
  normalizeDocumentIdentifier,
  generateDocumentCacheKey,
} from '../src/lib/documents/documentCache';
import mongoose from 'mongoose';

describe('Ration Card — Data Mapping & Number Formatting', () => {
  it('formats 20-digit Ration Card number with standard 4-digit grouping', () => {
    expect(formatRationCardNumber('10350050028009409992')).toBe('1035 0050 0280 0940 9992');
  });

  it('formats 12-digit Ration Card number with standard 4-digit grouping', () => {
    expect(formatRationCardNumber('212345678901')).toBe('2123 4567 8901');
  });

  it('preserves already spaced ration card number or returns empty string for empty input', () => {
    expect(formatRationCardNumber('1035 0050 0280 0940 9992')).toBe('1035 0050 0280 0940 9992');
    expect(formatRationCardNumber('')).toBe('');
    expect(formatRationCardNumber(undefined)).toBe('');
  });

  it('maps partial data with safe fallbacks and complete family members roster', () => {
    const raw: Partial<RationCardData> = {
      rationCardNumber: '10350050028009409992',
      headOfFamily: 'Sunita Devi',
      headOfFamilyRegional: 'सुनीता देवी',
      category: 'PHH',
    };

    const mapped = mapToRationCardData(raw);

    expect(mapped.rationCardNumber).toBe('10350050028009409992');
    expect(mapped.headOfFamily).toBe('Sunita Devi');
    expect(mapped.headOfFamilyRegional).toBe('सुनीता देवी');
    expect(mapped.category).toBe('PHH');
    expect(mapped.schemeName).toContain('Priority Household');
    expect(mapped.familyMembers).toBeDefined();
    expect(mapped.familyMembers!.length).toBeGreaterThan(0);
    expect(mapped.memberCount).toBe(mapped.familyMembers!.length);
    expect(mapped.layoutFormat).toBe('cr80');
    expect(mapped.departmentHeaderRegional).toBe('खाद्य एवं नागरिक आपूर्ति विभाग');
    expect(mapped.helplineNumber).toContain('1967');
  });

  it('correctly maps user-provided family members and syncs memberCount', () => {
    const customMembers = [
      { slNo: 1, name: 'Ramesh Singh', relation: 'Self (Head)', gender: 'Male', age: 50, uidLinked: true },
      { slNo: 2, name: 'Geeta Devi', relation: 'Wife', gender: 'Female', age: 48, uidLinked: true },
      { slNo: 3, name: 'Sanjay Singh', relation: 'Son', gender: 'Male', age: 22, uidLinked: false },
    ];

    const mapped = mapToRationCardData({
      headOfFamily: 'Ramesh Singh',
      familyMembers: customMembers,
    });

    expect(mapped.familyMembers?.length).toBe(3);
    expect(mapped.memberCount).toBe(3);
    expect(mapped.familyMembers?.[0].name).toBe('Ramesh Singh');
    expect(mapped.familyMembers?.[2].uidLinked).toBe(false);
  });

  it('handles large families (> 5 members) cleanly without truncation', () => {
    const largeFamily = Array.from({ length: 9 }, (_, i) => ({
      slNo: i + 1,
      name: `Member ${i + 1}`,
      relation: i === 0 ? 'Head' : 'Dependent',
      gender: i % 2 === 0 ? 'Female' : 'Male',
      age: 20 + i,
      uidLinked: i % 2 === 0,
    }));

    const mapped = mapToRationCardData({
      headOfFamily: 'Member 1',
      familyMembers: largeFamily,
    });

    expect(mapped.memberCount).toBe(9);
    expect(mapped.familyMembers).toHaveLength(9);
    // Verify calculation for total pages (5 members per reverse card)
    const membersPerPage = 5;
    const totalPages = Math.ceil(mapped.familyMembers!.length / membersPerPage);
    expect(totalPages).toBe(2);
  });
});

describe('Ration Card — Completeness Analysis & Zero-Missing-Data Rules', () => {
  it('flags missing required fields for incomplete data', () => {
    const incompleteData = {
      rationCardNumber: '',
      headOfFamily: '',
      category: 'PHH',
    };

    const result = analyzeDocumentCompleteness('ration', incompleteData);

    expect(result.isPrintReady).toBe(false);
    expect(result.missingKeys).toContain('rationCardNumber');
    expect(result.missingKeys).toContain('headOfFamily');
    expect(result.missingKeys).toContain('address');
    expect(result.completionScore).toBeLessThan(100);
  });

  it('marks document as 100% complete and print-ready when all mandatory fields are present', () => {
    const completeData: Partial<RationCardData> = {
      rationCardNumber: '10350050028009409992',
      headOfFamily: 'Sunita Devi',
      category: 'PHH',
      address: 'House No. 42, Ward 12, Rampur, Patna, Bihar - 800001',
    };

    const result = analyzeDocumentCompleteness('ration', completeData);

    expect(result.isPrintReady).toBe(true);
    expect(result.missingKeys).toHaveLength(0);
    expect(result.completionScore).toBe(100);
  });
});

describe('Ration Card — Service Pricing & Wallet Integration', () => {
  it('verifies RATION service pricing exists in DEFAULT_SERVICE_PRICING SSOT catalog', () => {
    const pricing = DEFAULT_SERVICE_PRICING.RATION;

    expect(pricing).toBeDefined();
    expect(pricing.serviceId).toBe('RATION');
    expect(pricing.fee).toBe(25);
    expect(pricing.originalFee).toBe(35);
    expect(pricing.discountPercent).toBe(29);
    expect(pricing.offerActive).toBe(true);
  });

  it('verifies RATION fallback fee in SERVICE_FEES constant', () => {
    expect(SERVICE_FEES.RATION).toBe(25);
  });

  it('normalizes document type variants for RATION', () => {
    expect(normalizeDocType('ration')).toBe('RATION');
    expect(normalizeDocType('RATION')).toBe('RATION');
    expect(normalizeDocType('Ration')).toBe('RATION');
    expect(normalizeDocTypeString('ration')).toBe('RATION');
  });

  it('normalizes Ration Card numbers for consistent cache keys', () => {
    const normalized = normalizeDocumentIdentifier('RATION', ' 1035 0050 0280 0940 9992 ');
    expect(normalized).toBe('10350050028009409992');

    const cacheResult = generateDocumentCacheKey('RATION', ' 1035 0050 0280 0940 9992 ');
    expect(cacheResult.normalizedId).toBe('10350050028009409992');
    expect(cacheResult.normalizedType).toBe('RATION');
    expect(cacheResult.cacheKey).toContain('RATION:');
  });
});

describe('Ration Card — Mongoose Schema & Model Validation', () => {
  it('verifies DocumentRecord schema accepts RATION docType enum', () => {
    const doc = new DocumentRecord({
      userId: new mongoose.Types.ObjectId(),
      docType: 'RATION',
      cardIdentifier: '10350050028009409992',
      inputMode: 'MANUAL',
      data: {
        rationCardNumber: '10350050028009409992',
        headOfFamily: 'Sunita Devi',
        category: 'PHH',
      },
      isComplete: true,
      missingFields: [],
    });

    const error = doc.validateSync();
    expect(error?.errors?.docType).toBeUndefined();
  });

  it('verifies Wallet schema transaction accepts RATION docType enum', () => {
    const wallet = new Wallet({
      userId: new mongoose.Types.ObjectId(),
      balance: 100,
      transactions: [
        {
          transactionId: 'tx_ration_test_123',
          type: 'DEBIT',
          category: 'PRINT_FEE',
          amount: 25,
          balanceAfter: 75,
          docType: 'RATION',
          description: 'Ration Card Print Fee',
        },
      ],
    });

    const error = wallet.validateSync();
    expect(error?.errors?.['transactions.0.docType']).toBeUndefined();
  });
});
