import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  executeVoterCascade,
  getPrioritizedVoterProviders,
  getVoterCaptchaChallenge,
  executeVoterLookupWithCaptcha,
} from '@/lib/verify/voterOrchestrator';
import { circuitBreaker } from '@/lib/reliability/circuitBreaker';
import * as providerClient from '@/lib/network/provider-client';

describe('Voter Multi-Provider Failover & Reliability Cascade', () => {
  const originalEnv = { ...process.env };
  let providerFetchSpy: any;

  beforeEach(() => {
    process.env.NEO_API_KEY = 'test_neo_api_key_123';
    process.env.WEBAPI_IN_TOKEN = 'test_webapi_token_456';
    process.env.FIXIE_URL = 'http://fixie:pass@proxy.usefixie.com:80';
    delete process.env.FASTNEXORA_API_KEY;
    delete process.env.VOTER_PROVIDER_ORDER;

    circuitBreaker.resetAll();
    providerFetchSpy = vi.spyOn(providerClient, 'providerFetch');
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
    circuitBreaker.resetAll();
  });

  const sampleNeoV1Success = {
    Message: 'Success',
    response: {
      docs: [
        {
          Message: 'Success',
          status: 'true',
          sampleCode: '200',
          epic_no: 'IFV1949684',
          name: 'amrendra',
          name_v1: 'अमरेन्द्र',
          rln_name: 'nandkishor',
          rln_name_v1: 'नन्दकिशोर',
          rln_type: 'FTHR',
          gender: 'M',
          age: '32',
          ac_no: '331',
          ac_name: 'TAMKUHI RAJ',
          ac_name_v1: 'तमकुही राज',
          part_no: '306',
          part_name: 'PRIMARY SCHOOL PARASAUN',
          part_name_v1: 'प्रा0 वि0 परसौन',
          district: 'KUSHINAGAR',
          state: 'UTTAR PRADESH',
          state_v1: 'उत्तर प्रदेश',
        },
      ],
    },
  };

  const sampleWebApiSuccess = {
    status: true,
    message: 'voter details fetched successfully',
    debited: 2,
    remaining_balance: 4980440,
    epic: 'IFV1949684',
    data: {
      epicNumber: 'IFV1949684',
      applicantFirstName: 'Amrendra',
      applicantFirstNameL1: 'अमरेन्द्र',
      relationName: 'Nandkishor',
      relationNameL1: 'नन्दकिशोर',
      relationType: 'FTHR',
      gender: 'M',
      age: 32,
      acNumber: 331,
      asmblyName: 'Tamkuhi Raj',
      asmblyNameL1: 'तमकुही राज',
      partNumber: 306,
      partName: 'PRIMARY SCHOOL PARASAUN',
      partNameL1: 'प्रा0 वि0 परसौन',
      districtValue: 'Kushinagar',
      districtValueL1: 'कुशीनगर',
      stateName: 'Uttar Pradesh',
      stateNameL1: 'उत्तर प्रदेश',
      stateCd: 'S24',
    },
  };

  describe('Priority Resolution & Dynamic Configuration', () => {
    it('defaults to [NeoAPI, WebAPI.in] when priority is unspecified', () => {
      const providers = getPrioritizedVoterProviders();
      expect(providers.map((p) => p.id)).toEqual(['neoapi', 'webapi_in']);
    });

    it('respects custom priority order when provided (e.g. WebAPI.in first)', () => {
      const providers = getPrioritizedVoterProviders(['webapi_in', 'neoapi']);
      expect(providers.map((p) => p.id)).toEqual(['webapi_in', 'neoapi']);
    });

    it('respects VOTER_PROVIDER_ORDER environment variable', () => {
      process.env.VOTER_PROVIDER_ORDER = 'webapi_in,neoapi';
      const providers = getPrioritizedVoterProviders();
      expect(providers.map((p) => p.id)).toEqual(['webapi_in', 'neoapi']);
    });
  });

  describe('Failover Scenarios', () => {
    it('primary provider (NeoAPI) succeeds -> secondary (WebAPI.in) is NOT called', async () => {
      providerFetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify(sampleNeoV1Success), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await executeVoterCascade('IFV1949684');

      expect(result.success).toBe(true);
      expect(result.provider).toBe('NeoAPI');
      expect(result.data.electorName).toBe('amrendra');
      expect(providerFetchSpy).toHaveBeenCalledTimes(1);
      expect(providerFetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('core.neoapi.io/v1/voter/detail.php'),
        expect.any(Object)
      );
    });

    it('primary provider (NeoAPI V1 & V2) fails with 500 -> automatically falls back to secondary (WebAPI.in) and succeeds', async () => {
      // NeoAPI V1 fails with 500
      providerFetchSpy.mockResolvedValueOnce(new Response('Gateway 500', { status: 500 }));
      // NeoAPI V2 fails with 502
      providerFetchSpy.mockResolvedValueOnce(new Response('Bad Gateway', { status: 502 }));
      // WebAPI.in succeeds!
      providerFetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify(sampleWebApiSuccess), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await executeVoterCascade('IFV1949684');

      expect(result.success).toBe(true);
      expect(result.provider).toBe('WebAPI.in');
      expect(result.data.electorName).toBe('Amrendra');
      expect(providerFetchSpy).toHaveBeenCalledTimes(3);
      expect(providerFetchSpy).toHaveBeenNthCalledWith(
        3,
        expect.stringContaining('webapi.in.net/api/voter_details.php'),
        expect.objectContaining({ providerId: 'webapi_in' })
      );
    });

    it('non-retryable NOT_FOUND halts failover immediately without calling secondary provider', async () => {
      // NeoAPI V1 returns NOT_FOUND ("No record found")
      providerFetchSpy.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            Message: 'Failed',
            response: {
              docs: [{ Message: 'No record found', status: 'false', sampleCode: '404' }],
            },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );
      // NeoAPI V2 also confirms not found
      providerFetchSpy.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            Message: 'Failed',
            response: {
              docs: [{ Message: 'No record found', status: 'false', sampleCode: '404' }],
            },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );

      const result = await executeVoterCascade('IFV1949684');

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('NOT_FOUND');
      // Secondary provider (WebAPI.in) must NOT be called when record definitively not found!
      expect(providerFetchSpy).toHaveBeenCalledTimes(2);
    });

    it('skips providers whose circuit breaker is OPEN', async () => {
      // Manually trip NeoAPI circuit breaker
      circuitBreaker.recordFailure('neoapi', true);
      circuitBreaker.recordFailure('neoapi', true);
      circuitBreaker.recordFailure('neoapi', true);
      expect(circuitBreaker.canExecute('neoapi')).toBe(false);

      // WebAPI.in succeeds
      providerFetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify(sampleWebApiSuccess), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await executeVoterCascade('IFV1949684');

      expect(result.success).toBe(true);
      expect(result.provider).toBe('WebAPI.in');
      // NeoAPI was skipped completely due to OPEN circuit!
      expect(providerFetchSpy).toHaveBeenCalledTimes(1);
      expect(providerFetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('webapi.in.net/api/voter_details.php'),
        expect.any(Object)
      );
    });

    it('returns controlled error when all providers fail without throwing unhandled exceptions', async () => {
      // NeoAPI V1 & V2 fail
      providerFetchSpy.mockResolvedValueOnce(new Response('Error', { status: 500 }));
      providerFetchSpy.mockResolvedValueOnce(new Response('Error', { status: 500 }));
      // WebAPI.in fails
      providerFetchSpy.mockResolvedValueOnce(new Response('Error', { status: 500 }));

      const result = await executeVoterCascade('IFV1949684');

      expect(result.success).toBe(false);
      expect(result.data).toEqual({});
      expect(result.errorMessage).toBeDefined();
    });
  });

  describe('Captcha Challenge & Captcha-Based Lookup', () => {
    it('generates a valid captcha challenge via getVoterCaptchaChallenge', async () => {
      providerFetchSpy.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            success: true,
            captcha: 'data:image/jpeg;base64,sample_captcha_data_uri',
            captchaId: 'TEST_CAPTCHA_ID_999',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );

      const challenge = await getVoterCaptchaChallenge('webapi_in');

      expect(challenge.success).toBe(true);
      expect(challenge.captchaId).toBe('TEST_CAPTCHA_ID_999');
      expect(challenge.captchaDataUri).toBe('data:image/jpeg;base64,sample_captcha_data_uri');
    });

    it('performs captcha-verified lookup via executeVoterLookupWithCaptcha', async () => {
      providerFetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify(sampleWebApiSuccess), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await executeVoterLookupWithCaptcha({
        epicNumber: 'IFV1949684',
        captchaId: 'TEST_CAPTCHA_ID_999',
        captchaAnswer: 'XYZ123',
        stateCd: 'S24',
        providerId: 'webapi_in',
      });

      expect(result.success).toBe(true);
      expect(result.data.electorName).toBe('Amrendra');
      expect(providerFetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('voter_captcha_info.php?token=test_webapi_token_456&voter_no=IFV1949684&captchaId=TEST_CAPTCHA_ID_999&captcha=XYZ123&stateCd=S24'),
        expect.objectContaining({ providerId: 'webapi_in' })
      );
    });
  });
});
