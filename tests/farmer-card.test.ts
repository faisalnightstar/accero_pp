import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  formatFarmerId,
  maskAadhaarNumber,
  formatFarmerAddress,
  mapToFarmerCardData,
  FarmerCardData,
} from '../src/types/cards';
import { analyzeDocumentCompleteness } from '../src/lib/missingFields';
import { DEFAULT_SERVICE_PRICING, SERVICE_FEES, normalizeDocType } from '../src/lib/wallet/constants';
import {
  getFarmerLanguageConfig,
  FARMER_LANGUAGE_OPTIONS,
  FarmerLanguageCode,
  FARMER_LANGUAGES,
  translateFarmerText,
} from '../src/lib/farmerLanguages';
import Wallet from '../src/models/Wallet';
import DocumentRecord from '../src/models/DocumentRecord';
import {
  normalizeDocTypeString,
  normalizeDocumentIdentifier,
  generateDocumentCacheKey,
} from '../src/lib/documents/documentCache';
import mongoose from 'mongoose';

describe('Farmer ID Card — Background Assets & Physical Sizing Validation', () => {
  const frontBgPath = path.join(process.cwd(), 'public/assets/farmer/farmer-card.png');
  const frontAssetPath = path.join(process.cwd(), 'public/assets/farmer/farmer-card-front.png');
  const backAssetPath = path.join(process.cwd(), 'public/assets/farmer/farmer-card-back.png');

  it('verifies the original supplied background exists', () => {
    expect(fs.existsSync(frontBgPath)).toBe(true);
  });

  it('verifies front and back background assets exist as reusable files', () => {
    expect(fs.existsSync(frontAssetPath)).toBe(true);
    expect(fs.existsSync(backAssetPath)).toBe(true);
  });

  it('verifies front and back backgrounds have identical dimensions and valid image format headers', () => {
    const frontBuf = fs.readFileSync(frontAssetPath);
    const backBuf = fs.readFileSync(backAssetPath);

    // PNG signature: 89 50 4E 47 0D 0A 1A 0A
    const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const isPng = (buf: Buffer) => buf.subarray(0, 8).equals(pngSignature);
    const isJpeg = (buf: Buffer) => buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;

    expect(isPng(frontBuf) || isJpeg(frontBuf)).toBe(true);
    expect(isPng(backBuf) || isJpeg(backBuf)).toBe(true);

    const getImageDimensions = (buf: Buffer) => {
      if (isPng(buf)) {
        return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
      }
      // Simple JPEG SOF0/SOF2 dimension parser
      let offset = 2;
      while (offset < buf.length) {
        if (buf[offset] !== 0xff) break;
        const marker = buf[offset + 1];
        if (marker === 0xc0 || marker === 0xc2) {
          const height = buf.readUInt16BE(offset + 5);
          const width = buf.readUInt16BE(offset + 7);
          return { width, height };
        }
        const length = buf.readUInt16BE(offset + 2);
        offset += 2 + length;
      }
      return { width: 0, height: 0 };
    };

    const frontDims = getImageDimensions(frontBuf);
    const backDims = getImageDimensions(backBuf);

    expect(frontDims.width).toBe(1576);
    expect(frontDims.height).toBe(998);
    expect(backDims.width).toBe(1576);
    expect(backDims.height).toBe(998);
    expect(frontDims.width).toBe(backDims.width);
    expect(frontDims.height).toBe(backDims.height);
  });
});

describe('Farmer ID Card — Data Mapping & Helpers', () => {
  it('formats Farmer ID into standard 4-3-4 grouping', () => {
    expect(formatFarmerId('42561776703')).toBe('4256 177 6703');
    expect(formatFarmerId('4256 177 6703')).toBe('4256 177 6703');
    expect(formatFarmerId('12345678901')).toBe('1234 567 8901');
    expect(formatFarmerId('')).toBe('');
  });

  it('masks Aadhaar number for privacy compliance', () => {
    expect(maskAadhaarNumber('411921789250', false)).toBe('XXXXXXXX9250');
    expect(maskAadhaarNumber('411921789250', true)).toBe('XXXX XXXX 9250');
    expect(maskAadhaarNumber('4119 2178 9250', false)).toBe('XXXXXXXX9250');
    expect(maskAadhaarNumber('')).toBe('');
  });

  it('formats structured farmer address into continuous comma-separated line', () => {
    const addr = {
      fatherOrSpouseName: 'S/O: Keshariya',
      locality: 'jatav muhalla',
      houseNumber: '12',
      village: 'Dahwa',
      district: 'Bharatpur',
      state: 'Rajasthan',
      pinCode: '321201',
    };
    const formatted = formatFarmerAddress(addr);
    expect(formatted).toBe('S/O: Keshariya, house no. 12, jatav muhalla, Dahwa, Bharatpur, Rajasthan - 321201');
  });

  it('uses fullAddress string directly if present in address record', () => {
    const addr = {
      fullAddress: 'S/O: Keshariya, jatav muhalla, house no., Dahwa, Bharatpur, Rajasthan - 321201',
    };
    expect(formatFarmerAddress(addr)).toBe('S/O: Keshariya, jatav muhalla, house no., Dahwa, Bharatpur, Rajasthan - 321201');
  });

  it('normalizes raw legacy API response into FarmerCardData structure preserving land precision', () => {
    const rawApi = {
      status: '200',
      application_no: '42561776703',
      name: 'Mohan Singh',
      regionalName: 'मोहन सिंह',
      gender: 'पुरुष / Male',
      dob: '01/01/1981',
      caste: 'OBC',
      area: 'Rural',
      aadhaar: '411921789250',
      address: {
        fatherOrSpouseName: 'S/O: Keshariya',
        village: 'Dahwa',
        district: 'Bharatpur',
        state: 'Rajasthan',
        pinCode: '321201',
      },
      landDetails: [
        { khata_no: '10', khasra_no: '218', rakba: '0.000833' },
        { khata_no: '10', khasra_no: '235', rakba: 0.010833 },
      ],
      approval_date: '15/06/2025',
    };

    const card = mapToFarmerCardData(rawApi);

    expect(card.farmerId).toBe('4256 177 6703');
    expect(card.farmerName).toBe('Mohan Singh');
    expect(card.farmerNameRegional).toBe('मोहन सिंह');
    expect(card.gender).toBe('Male');
    expect(card.genderRegional).toBe('पुरुष');
    expect(card.dateOfBirth).toBe('01/01/1981');
    expect(card.caste).toBe('OBC');
    expect(card.areaCategory).toBe('Rural');
    expect(card.aadhaarNumber).toBe('411921789250');
    expect(card.approvalDate).toBe('15/06/2025');
    expect(card.landRecords).toHaveLength(2);
    expect(card.landRecords?.[0].khata).toBe('10');
    expect(card.landRecords?.[0].khasra).toBe('218');
    expect(card.landRecords?.[0].area).toBe('0.000833');
    expect(card.landRecords?.[1].area).toBe(0.010833);
    expect(card.qrPayload).toContain('https://rjfr.agristack.gov.in/verify?id=42561776703');
    expect(card.departmentTitleEnglish).toBe('Government of India');
    expect(card.ministryTitleEnglish).toBe('Ministry of Agri & Farmers Welfare');
  });

  it('correctly maps regional headers and genderRegional fields', () => {
    const raw = {
      farmer_id: '42561776703',
      name: 'Mohan Singh',
      gender: 'Female',
      gender_regional: 'महिला',
      departmentHeaderRegional: 'भारत सरकार',
      ministryHeaderRegional: 'कृषि एवं किसान कल्याण मंत्रालय',
    };
    const mapped = mapToFarmerCardData(raw);
    expect(mapped.gender).toBe('Female');
    expect(mapped.genderRegional).toBe('महिला');
    expect(mapped.departmentHeaderRegional).toBe('भारत सरकार');
    expect(mapped.ministryHeaderRegional).toBe('कृषि एवं किसान कल्याण मंत्रालय');
    expect(mapped.ministryTitleEnglish).toBe('Ministry of Agri & Farmers Welfare');
  });

  it('handles empty or null raw responses without crashing', () => {
    const card = mapToFarmerCardData(null);
    expect(card).toBeDefined();
    expect(card.farmerId).toBeUndefined();
    expect(card.landRecords).toBeUndefined();
  });
});

describe('Farmer ID Card — Completeness Rules & Service Pricing', () => {
  it('detects missing required fields for farmer card', () => {
    const incompleteData: Partial<FarmerCardData> = {
      farmerName: 'Mohan Singh',
    };
    const result = analyzeDocumentCompleteness('farmer', incompleteData);
    expect(result.isPrintReady).toBe(false);
    expect(result.missingKeys).toContain('farmerId');
    expect(result.missingKeys).toContain('dateOfBirth');
    expect(result.missingKeys).toContain('gender');
    expect(result.missingKeys).toContain('address');
  });

  it('evaluates fully populated farmer card data as complete', () => {
    const completeData: Partial<FarmerCardData> = {
      farmerId: '4256 177 6703',
      farmerName: 'Mohan Singh',
      dateOfBirth: '01/01/1981',
      gender: 'Male / Male',
      address: {
        fullAddress: 'S/O: Keshariya, Dahwa, Bharatpur, Rajasthan - 321201',
      },
    };
    const result = analyzeDocumentCompleteness('farmer', completeData);
    expect(result.isPrintReady).toBe(true);
    expect(result.missingKeys).toHaveLength(0);
  });

  it('registers FARMER in DEFAULT_SERVICE_PRICING and SERVICE_FEES', () => {
    expect(SERVICE_FEES['FARMER']).toBe(25);
    expect(DEFAULT_SERVICE_PRICING['FARMER']).toBeDefined();
    expect(DEFAULT_SERVICE_PRICING['FARMER'].serviceId).toBe('FARMER');
    expect(DEFAULT_SERVICE_PRICING['FARMER'].fee).toBe(25);
    expect(normalizeDocType('farmer')).toBe('FARMER');
    expect(normalizeDocType('agristack')).toBe('FARMER');
  });
});

describe('Farmer ID Card — Multi-Lingual Regional Translations', () => {
  it('supports 12 distinct Indian languages in options catalog', () => {
    expect(FARMER_LANGUAGE_OPTIONS).toHaveLength(12);
    const codes = FARMER_LANGUAGE_OPTIONS.map((opt) => opt.code);
    expect(codes).toEqual(
      expect.arrayContaining(['HI', 'EN', 'PA', 'GU', 'MR', 'TA', 'KN', 'BN', 'TE', 'OR', 'ML', 'AS'])
    );
  });

  it('resolves correct language configuration for each language code with Hindi default', () => {
    expect(getFarmerLanguageConfig('HI').name).toBe('Hindi');
    expect(getFarmerLanguageConfig('PA').name).toBe('Punjabi');
    expect(getFarmerLanguageConfig('GU').name).toBe('Gujarati');
    expect(getFarmerLanguageConfig('MR').name).toBe('Marathi');
    expect(getFarmerLanguageConfig('TA').name).toBe('Tamil');
    expect(getFarmerLanguageConfig('TE').name).toBe('Telugu');
    expect(getFarmerLanguageConfig('KN').name).toBe('Kannada');
    expect(getFarmerLanguageConfig('BN').name).toBe('Bengali');
    expect(getFarmerLanguageConfig('OR').name).toBe('Odia');
    expect(getFarmerLanguageConfig('ML').name).toBe('Malayalam');
    expect(getFarmerLanguageConfig('AS').name).toBe('Assamese');
    expect(getFarmerLanguageConfig('EN').name).toBe('English');

    // Default fallback on invalid/missing language
    expect(getFarmerLanguageConfig(undefined).code).toBe('HI');
    expect(getFarmerLanguageConfig('UNKNOWN' as any).code).toBe('HI');
  });

  it('provides native script headers and ministry titles for regional cards', () => {
    const punjabi = getFarmerLanguageConfig('PA');
    expect(punjabi.headerTitle.regional).toBe('ਭਾਰਤ ਸਰਕਾਰ');
    expect(punjabi.ministryTitle.regional).toBe('ਖੇਤੀਬਾੜੀ ਅਤੇ ਕਿਸਾਨ ਭਲਾਈ ਮੰਤਰਾਲਾ');

    const gujarati = getFarmerLanguageConfig('GU');
    expect(gujarati.headerTitle.regional).toBe('ભારત સરકાર');
    expect(gujarati.ministryTitle.regional).toBe('કૃષિ અને ખેડૂત કલ્યાણ મંત્રાલય');

    const tamil = getFarmerLanguageConfig('TA');
    expect(tamil.headerTitle.regional).toBe('இந்திய அரசு');
    expect(tamil.ministryTitle.regional).toBe('வேளாண்மை மற்றும் உழவர் நல அமைச்சகம்');

    const bengali = getFarmerLanguageConfig('BN');
    expect(bengali.headerTitle.regional).toBe('ভারত সরকার');
    expect(bengali.ministryTitle.regional).toBe('কৃষি ও কৃষক কল্যাণ মন্ত্রক');
  });

  it('provides translateFarmerText helper for auto-translating farmer names and fields', async () => {
    // English returns as-is
    expect(await translateFarmerText('Mohan Singh', 'EN')).toBe('Mohan Singh');
    // Empty strings return as-is
    expect(await translateFarmerText('', 'HI')).toBe('');
  });
});

describe('Farmer ID Card — Mongoose Wallet Transaction Schema Enum Validation', () => {
  it('validates a wallet with FARMER docType transaction without enum errors', async () => {
    const dummyUserId = new mongoose.Types.ObjectId();
    const wallet = new Wallet({
      userId: dummyUserId,
      balance: 100,
      promotionalBalance: 0,
      purchasedBalance: 100,
      currency: 'INR',
      totalCredited: 100,
      totalDebited: 25,
      transactions: [
        {
          amount: 25,
          type: 'debit',
          category: 'DOCUMENT_PRINT',
          docType: 'FARMER',
          documentType: 'farmer',
          description: 'Print generation fee for Farmer ID: 4256 177 6703',
          balanceBefore: 100,
          balanceAfter: 75,
          status: 'COMPLETED',
          createdAt: new Date(),
        },
      ],
    });

    let error: any = null;
    try {
      await wallet.validate();
    } catch (err) {
      error = err;
    }
    expect(error).toBeNull();
  });

  it('rejects an invalid docType in transactions while allowing FARMER', async () => {
    const dummyUserId = new mongoose.Types.ObjectId();
    const wallet = new Wallet({
      userId: dummyUserId,
      balance: 100,
      promotionalBalance: 0,
      purchasedBalance: 100,
      currency: 'INR',
      totalCredited: 100,
      totalDebited: 25,
      transactions: [
        {
          amount: 25,
          type: 'debit',
          category: 'DOCUMENT_PRINT',
          docType: 'INVALID_CARD_TYPE' as any,
          description: 'Test invalid',
          balanceAfter: 75,
          createdAt: new Date(),
        },
      ],
    });

    let error: any = null;
    try {
      await wallet.validate();
    } catch (err) {
      error = err;
    }
    expect(error).toBeDefined();
    expect(error?.errors['transactions.0.docType']).toBeDefined();
    expect(error?.errors['transactions.0.docType'].message).toContain('is not a valid enum value');
  });
});

describe('Farmer ID Card — Document Storage & Cache Normalization', () => {
  it('normalizes farmer docType string and document identifier', () => {
    expect(normalizeDocTypeString('farmer')).toBe('FARMER');
    expect(normalizeDocTypeString('agristack')).toBe('FARMER');
    expect(normalizeDocTypeString('FARMER')).toBe('FARMER');

    expect(normalizeDocumentIdentifier('FARMER', '4256 177 6703')).toBe('42561776703');
    expect(normalizeDocumentIdentifier('agristack', '4256 177 6703')).toBe('42561776703');

    const cacheKey = generateDocumentCacheKey('farmer', '4256 177 6703');
    expect(cacheKey.normalizedType).toBe('FARMER');
    expect(cacheKey.normalizedId).toBe('42561776703');
    expect(cacheKey.hash).toBeDefined();
  });

  it('validates a DocumentRecord with FARMER docType without Mongoose enum errors', async () => {
    const doc = new DocumentRecord({
      userId: new mongoose.Types.ObjectId(),
      docType: 'FARMER',
      cardIdentifier: '42561776703',
      documentNumberHash: 'mock-hash-123',
      inputMode: 'MANUAL',
      data: {
        farmerId: '4256 177 6703',
        farmerName: 'Mohan Singh',
      },
      missingFields: [],
      isComplete: true,
      printCount: 0,
      status: 'ACTIVE',
    });

    let error: any = null;
    try {
      await doc.validate();
    } catch (err) {
      error = err;
    }
    expect(error).toBeNull();
  });
});
