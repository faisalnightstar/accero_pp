import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { WebApiInProvider } from '@/lib/verify/providers/webapiIn';
import * as providerClient from '@/lib/network/provider-client';

describe('WebAPI.in Voter Provider Adapter', () => {
  const originalEnv = { ...process.env };
  let providerFetchSpy: any;

  beforeEach(() => {
    process.env.WEBAPI_IN_TOKEN = 'test_secret_webapi_token_123';
    providerFetchSpy = vi.spyOn(providerClient, 'providerFetch');
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  const sampleSuccessData = {
    status: true,
    message: 'voter details fetched successfully',
    debited: 2,
    remaining_balance: 4980440,
    epic: 'TMV0654962',
    data: {
      id: '219049822_TMV0654962_S24',
      epicNumber: 'TMV0654962',
      applicantFirstName: 'Mo Wahid',
      applicantFirstNameL1: 'मो वाहिद',
      relationName: 'Mo Khalil',
      relationNameL1: 'मो खलील',
      relationType: 'FTHR',
      age: 50,
      gender: 'M',
      partNumber: 212,
      partName: 'MASTER MAIND PUBLIC SCHOOL ROOM NO.2',
      partNameL1: 'मास्टर माइंड पब्लिक स्कूल कक्ष सं0-२',
      asmblyName: 'Unnao',
      asmblyNameL1: 'उन्नाव',
      acNumber: 165,
      districtValue: 'Unnao',
      districtValueL1: 'उन्नाव',
      stateName: 'Uttar Pradesh',
      stateNameL1: 'उत्तर प्रदेश',
      stateCd: 'S24',
    },
  };

  describe('Direct Voter Lookup (GET /api/voter_details.php)', () => {
    it('successfully fetches and normalizes voter details on valid direct lookup', async () => {
      providerFetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify(sampleSuccessData), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const provider = new WebApiInProvider();
      const res = await provider.lookup('voter', 'TMV0654962');

      expect(res.success).toBe(true);
      expect(res.documentType).toBe('voter');
      expect(res.idNumber).toBe('TMV0654962');
      expect(res.provider).toBe('WebAPI.in');
      expect(res.data.electorName).toBe('Mo Wahid');
      expect(res.data.electorNameRegional).toBe('मो वाहिद');
      expect(res.data.assemblyConstituency).toBe('165 - Unnao');

      expect(providerFetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('https://webapi.in.net/api/voter_details.php?token=test_secret_webapi_token_123&voter_no=TMV0654962'),
        expect.objectContaining({ providerId: 'webapi_in' })
      );
    });

    it('returns controlled error when WEBAPI_IN_TOKEN is missing', async () => {
      delete process.env.WEBAPI_IN_TOKEN;
      const provider = new WebApiInProvider();
      const res = await provider.lookup('voter', 'TMV0654962');

      expect(res.success).toBe(false);
      expect(res.errorCode).toBe('MISSING_TOKEN');
      expect(res.errorMessage).toContain('WEBAPI_IN_TOKEN is not configured');
      expect(providerFetchSpy).not.toHaveBeenCalled();
    });

    it('rejects invalid EPIC format without calling external endpoint', async () => {
      const provider = new WebApiInProvider();
      const res = await provider.lookup('voter', 'INVALID_SHORT');

      expect(res.success).toBe(false);
      expect(res.errorCode).toBe('INVALID_EPIC');
      expect(providerFetchSpy).not.toHaveBeenCalled();
    });

    it('handles HTTP 500 error gracefully', async () => {
      providerFetchSpy.mockResolvedValueOnce(
        new Response('Internal Server Error', { status: 500 })
      );

      const provider = new WebApiInProvider();
      const res = await provider.lookup('voter', 'TMV0654962');

      expect(res.success).toBe(false);
      expect(res.statusCode).toBe(500);
      expect(res.errorMessage).toContain('HTTP 500');
    });

    it('handles invalid token upstream response', async () => {
      providerFetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify({ status: false, message: 'Invalid token' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const provider = new WebApiInProvider();
      const res = await provider.lookup('voter', 'TMV0654962');

      expect(res.success).toBe(false);
      expect(res.errorCode).toBe('AUTH_ERROR');
    });

    it('handles record not found upstream response', async () => {
      providerFetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify({ status: false, message: 'No voter record found' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const provider = new WebApiInProvider();
      const res = await provider.lookup('voter', 'TMV0654962');

      expect(res.success).toBe(false);
      expect(res.errorCode).toBe('NOT_FOUND');
    });
  });

  describe('Captcha Generation (GET /api/voter_captcha.php)', () => {
    it('successfully generates captcha session and base64 data URI', async () => {
      providerFetchSpy.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            success: true,
            captcha: 'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAA...',
            captchaId: '2B73AF6CC915445BD939F0EF7A7C93B1',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );

      const provider = new WebApiInProvider();
      const res = await provider.getCaptcha();

      expect(res.success).toBe(true);
      expect(res.captchaId).toBe('2B73AF6CC915445BD939F0EF7A7C93B1');
      expect(res.captchaDataUri).toBe('data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAA...');
    });

    it('adds data:image/jpeg;base64 prefix if raw base64 returned', async () => {
      providerFetchSpy.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            success: true,
            captcha: 'raw_base64_data_without_prefix',
            captchaId: 'TEST_ID_123',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );

      const provider = new WebApiInProvider();
      const res = await provider.getCaptcha();

      expect(res.success).toBe(true);
      expect(res.captchaDataUri).toBe('data:image/jpeg;base64,raw_base64_data_without_prefix');
    });
  });

  describe('Captcha-Based Lookup (GET /api/voter_captcha_info.php)', () => {
    it('successfully performs lookup using verified captcha answer', async () => {
      providerFetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify(sampleSuccessData), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const provider = new WebApiInProvider();
      const res = await provider.lookupWithCaptcha(
        'TMV0654962',
        '2B73AF6CC915445BD939F0EF7A7C93B1',
        'AB12CD',
        'S24'
      );

      expect(res.success).toBe(true);
      expect(res.data.electorName).toBe('Mo Wahid');
      expect(providerFetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('voter_captcha_info.php?token=test_secret_webapi_token_123&voter_no=TMV0654962&captchaId=2B73AF6CC915445BD939F0EF7A7C93B1&captcha=AB12CD&stateCd=S24'),
        expect.objectContaining({ providerId: 'webapi_in' })
      );
    });

    it('classifies wrong captcha response as CAPTCHA_INVALID', async () => {
      providerFetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify({ status: false, message: 'Invalid captcha entered' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const provider = new WebApiInProvider();
      const res = await provider.lookupWithCaptcha('TMV0654962', 'CAPTCHA_ID', 'WRONG', 'S24');

      expect(res.success).toBe(false);
      expect(res.errorCode).toBe('CAPTCHA_INVALID');
    });

    it('classifies expired captcha response as CAPTCHA_EXPIRED', async () => {
      providerFetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify({ status: false, message: 'Captcha expired' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const provider = new WebApiInProvider();
      const res = await provider.lookupWithCaptcha('TMV0654962', 'CAPTCHA_ID', 'EXPIRED', 'S24');

      expect(res.success).toBe(false);
      expect(res.errorCode).toBe('CAPTCHA_EXPIRED');
    });
  });
});
