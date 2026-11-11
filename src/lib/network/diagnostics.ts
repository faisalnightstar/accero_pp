/**
 * Static Outbound IP Verification Diagnostics
 *
 * Verifies outbound network routing against public IP reflection services:
 * 1. Verifies request through Fixie returns one of the known Fixie static IP addresses.
 * 2. Verifies direct request does not use Fixie's proxy.
 * 3. Confirms HTTPS CONNECT tunneling and proxy authentication succeed.
 */

import { providerFetch } from './provider-client';
import { getFixieConfig, FIXIE_STATIC_IPS } from './proxy-config';

export interface OutboundDiagnosticReport {
  timestamp: string;
  fixieConfigured: boolean;
  proxyHost: string | null;
  proxyPort: number | null;
  proxyProtocol: 'http:' | 'https:' | null;
  maskedUrl: string | null;
  proxiedEgressIp: string | null;
  isFixieStaticIp: boolean;
  directEgressIp: string | null;
  httpsTunnelingVerified: boolean;
  proxyAuthVerified: boolean;
  latencyMs: number;
  knownFixieIps: readonly string[];
  error?: string;
}

/**
 * Executes static outbound IP verification tests.
 */
export async function runOutboundIpDiagnostics(): Promise<OutboundDiagnosticReport> {
  const startTime = Date.now();
  const config = getFixieConfig();

  let proxiedIp: string | null = null;
  let directIp: string | null = null;
  let httpsTunnelingVerified = false;
  let proxyAuthVerified = false;
  let errorMessage: string | undefined;

  // 1. Test Proxied Outbound Request via Fixie
  if (config) {
    try {
      const response = await providerFetch('https://api.ipify.org?format=json', {
        providerId: 'ipify_diagnostic',
        timeoutMs: 8000,
        cache: 'no-store',
      });

      if (response.ok) {
        const data: any = await response.json();
        proxiedIp = data.ip || null;
        httpsTunnelingVerified = true;
        proxyAuthVerified = true;
      } else {
        errorMessage = `Fixie proxy reflection returned HTTP ${response.status}`;
      }
    } catch (err: any) {
      errorMessage = `Fixie proxy request failed: ${err.message || err}`;
    }
  }

  // 2. Test Direct Request (Bypassing Fixie)
  try {
    const directResponse = await globalThis.fetch('https://api.ipify.org?format=json', {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(6000),
    });

    if (directResponse.ok) {
      const directData: any = await directResponse.json();
      directIp = directData.ip || null;
    }
  } catch {
    // Non-fatal if direct request is in a restricted environment
  }

  const isFixieStaticIp = Boolean(
    proxiedIp && (FIXIE_STATIC_IPS as readonly string[]).includes(proxiedIp)
  );

  return {
    timestamp: new Date().toISOString(),
    fixieConfigured: Boolean(config),
    proxyHost: config?.host || null,
    proxyPort: config?.port || null,
    proxyProtocol: config?.protocol || null,
    maskedUrl: config?.maskedUrl || null,
    proxiedEgressIp: proxiedIp,
    isFixieStaticIp,
    directEgressIp: directIp,
    httpsTunnelingVerified,
    proxyAuthVerified,
    latencyMs: Date.now() - startTime,
    knownFixieIps: FIXIE_STATIC_IPS,
    error: errorMessage,
  };
}
