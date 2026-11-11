/**
 * Legacy Outbound Fixie Adapter (Re-exports from src/lib/network)
 *
 * Provides backwards-compatible exports while delegating all routing
 * to the centralized provider networking layer.
 */

import {
  getFixieConfig as getNetworkFixieConfig,
  isFixieConfigured as isNetworkFixieConfigured,
  parseFixieProxyUrl,
  FixieProxyConfig,
} from '@/lib/network/proxy-config';
import {
  getFixieDispatcher as getNetworkFixieDispatcher,
  getFixieHttpsAgent,
  getFixieAxiosProxyConfig,
  resetFixieCache,
  setTestingFetch,
} from '@/lib/network/fixie';
import { providerFetch } from '@/lib/network/provider-client';
import { runOutboundIpDiagnostics } from '@/lib/network/diagnostics';

export type { FixieProxyConfig as FixieConfig };

export interface OutboundIpResult {
  success: boolean;
  ip?: string;
  proxied: boolean;
  latencyMs: number;
  fixieConfigured: boolean;
  proxyHost?: string;
  error?: string;
}

export function parseFixieUrl(rawUrl?: string): FixieProxyConfig | null {
  return parseFixieProxyUrl(rawUrl);
}

export function isFixieConfigured(): boolean {
  return isNetworkFixieConfigured();
}

export function getFixieUrl(): string | undefined {
  return getNetworkFixieConfig()?.url;
}

export function getFixieConfig(): FixieProxyConfig | null {
  return getNetworkFixieConfig();
}

export function getFixieDispatcher() {
  return getNetworkFixieDispatcher();
}

export function getFixieAgent() {
  return getFixieHttpsAgent();
}

export function getAxiosProxyConfig() {
  return getFixieAxiosProxyConfig();
}

export function resetFixieAgentCache(): void {
  resetFixieCache();
}

export function setFixieFetchForTesting(fn: any): void {
  setTestingFetch(fn);
}

/**
 * Drop-in fixed fetch: routes through centralized providerFetch.
 */
export async function fixedFetch(
  input: string | URL | Request,
  init?: RequestInit & { timeoutMs?: number; providerId?: string }
): Promise<Response> {
  return providerFetch(input, init);
}

/**
 * Diagnostic utility to verify outbound IP address.
 */
export async function checkOutboundIp(): Promise<OutboundIpResult> {
  const report = await runOutboundIpDiagnostics();
  return {
    success: Boolean(report.proxiedEgressIp || report.directEgressIp),
    ip: report.proxiedEgressIp || report.directEgressIp || undefined,
    proxied: report.fixieConfigured && Boolean(report.proxiedEgressIp),
    latencyMs: report.latencyMs,
    fixieConfigured: report.fixieConfigured,
    proxyHost: report.proxyHost || undefined,
    error: report.error,
  };
}
