/**
 * Centralized External Provider Registry & Routing Policy
 *
 * Enforces three distinct security categories:
 * 1. Registered Fixie providers: Mandatory static IP proxy routing via Fixie.
 * 2. Registered direct providers: Direct connections only (never routed via Fixie).
 * 3. Unregistered providers/hostnames: Rejected by default (SSRF & open-proxy prevention).
 */

export type RoutingPolicy = 'fixie' | 'direct';

export interface ProviderRegistration {
  /** Unique provider identifier */
  id: string;
  /** Human-readable provider name */
  name: string;
  /** Routing strategy */
  routing: RoutingPolicy;
  /** Exact allowed destination hostnames for this provider */
  allowedHostnames: readonly string[];
  /** Whether the provider requires static IP whitelisting on their firewall */
  requiresWhitelisting: boolean;
  /** Enforce HTTPS-only destinations (prevents HTTP downgrade attacks) */
  requireHttps: boolean;
  /** Default timeout in milliseconds */
  defaultTimeoutMs: number;
  /** Purpose description */
  description: string;
}

export interface TargetValidationResult {
  /** Whether the target URL is permitted to execute at all */
  allowed: boolean;
  /** Whether Fixie proxy is mandatory for this request */
  useFixie: boolean;
  /** Resolved routing policy if allowed */
  routing: RoutingPolicy | 'rejected';
  /** Matched registered provider */
  provider?: ProviderRegistration;
  /** Reason for rejection if allowed === false */
  rejectionReason?: string;
}

/**
 * Explicit allowlist registry of external providers and their network routing policy.
 */
export const PROVIDER_REGISTRY: Record<string, ProviderRegistration> = {
  // 1. NeoAPI: Core Government Identity & Document Verification (MANDATORY FIXIE)
  neoapi: {
    id: 'neoapi',
    name: 'NeoAPI',
    routing: 'fixie',
    allowedHostnames: ['core.neoapi.io'],
    requiresWhitelisting: true,
    requireHttps: true,
    defaultTimeoutMs: 8000,
    description: 'PAN & Voter ID verification gateway requiring static IP whitelisting',
  },

  // 2. FastNexora: Voter ID Verification Provider (MANDATORY FIXIE)
  fastnexora: {
    id: 'fastnexora',
    name: 'FastNexora',
    routing: 'fixie',
    allowedHostnames: ['auth.fastnexora.xyz'],
    requiresWhitelisting: true,
    requireHttps: true,
    defaultTimeoutMs: 8000,
    description: 'Voter verification API requiring static IP whitelisting',
  },

  // 3. AxenAPI: DL & Vehicle RC Verification Provider (MANDATORY FIXIE)
  axenapi: {
    id: 'axenapi',
    name: 'AxenAPI',
    routing: 'fixie',
    allowedHostnames: ['test.axenapi.co.in'],
    requiresWhitelisting: true,
    requireHttps: true,
    defaultTimeoutMs: 8000,
    description: 'Driving Licence and Vehicle RC verification requiring static IP whitelisting',
  },

  // 4. Paytm: Payment Gateway (REGISTERED DIRECT ONLY - NEVER PROXIED)
  paytm: {
    id: 'paytm',
    name: 'Paytm Payment Gateway',
    routing: 'direct',
    allowedHostnames: ['securegw.paytm.in', 'securegw-stage.paytm.in'],
    requiresWhitelisting: false,
    requireHttps: true,
    defaultTimeoutMs: 10000,
    description: 'Payment transactions and order status polling (always direct connection)',
  },

  // 5. WhatsApp Business Cloud API (REGISTERED DIRECT ONLY - NEVER PROXIED)
  whatsapp: {
    id: 'whatsapp',
    name: 'WhatsApp Business API',
    routing: 'direct',
    allowedHostnames: ['graph.facebook.com', 'api.whatsapp.com'],
    requiresWhitelisting: false,
    requireHttps: true,
    defaultTimeoutMs: 10000,
    description: 'Transactional WhatsApp notifications via Meta Cloud API',
  },

  // 6. MongoDB Atlas Database (REGISTERED DIRECT ONLY - Native Driver)
  mongodb: {
    id: 'mongodb',
    name: 'MongoDB Atlas',
    routing: 'direct',
    allowedHostnames: [],
    requiresWhitelisting: false,
    requireHttps: true,
    defaultTimeoutMs: 15000,
    description: 'Primary database cluster connection',
  },

  // 7. Protected Egress IP Verification Diagnostic (Admin diagnostics only)
  ipify_diagnostic: {
    id: 'ipify_diagnostic',
    name: 'Outbound IP Diagnostic Reflection',
    routing: 'fixie',
    allowedHostnames: ['api.ipify.org', 'icanhazip.com'],
    requiresWhitelisting: true,
    requireHttps: false, // Allows testing HTTP & HTTPS proxy forwarding in diagnostics
    defaultTimeoutMs: 6000,
    description: 'Internal diagnostic endpoint for verifying Fixie static IP egress',
  },
} as const;

/**
 * Finds a registered provider by its identifier.
 */
export function getProviderById(providerId: string): ProviderRegistration | undefined {
  return PROVIDER_REGISTRY[providerId.toLowerCase()];
}

/**
 * Matches a destination hostname strictly against exact registered provider hostnames.
 * Rejects trailing dots, suffix tricks, or partial matches.
 */
export function getProviderByHostname(hostname: string): ProviderRegistration | undefined {
  const cleanHost = hostname.toLowerCase().trim();
  if (!cleanHost || cleanHost.endsWith('.')) {
    return undefined;
  }

  return Object.values(PROVIDER_REGISTRY).find((provider) =>
    provider.allowedHostnames.some((allowed) => allowed.toLowerCase() === cleanHost)
  );
}

/**
 * Resolves the provider configuration for an arbitrary destination URL.
 */
export function getProviderForUrl(url: string | URL): ProviderRegistration | undefined {
  try {
    const parsed = typeof url === 'string' ? new URL(url) : url;
    return getProviderByHostname(parsed.hostname);
  } catch {
    return undefined;
  }
}

/**
 * Determines whether requests to a given registered provider or URL should route via Fixie.
 */
export function shouldRouteViaFixie(providerIdOrUrl: string | URL): boolean {
  let provider: ProviderRegistration | undefined;

  if (typeof providerIdOrUrl === 'string' && PROVIDER_REGISTRY[providerIdOrUrl.toLowerCase()]) {
    provider = PROVIDER_REGISTRY[providerIdOrUrl.toLowerCase()];
  } else {
    provider = getProviderForUrl(providerIdOrUrl);
  }

  return provider?.routing === 'fixie';
}

/**
 * Validates an outbound destination URL against the explicit provider allowlist.
 *
 * Security Guarantees:
 * - Enforces three distinct categories:
 *   1. Registered Fixie provider -> allowed = true, useFixie = true
 *   2. Registered Direct provider -> allowed = true, useFixie = false
 *   3. Unregistered provider/hostname -> allowed = false (REJECTED by default)
 * - Blocks embedded credentials in destination URL (`user:pass@host`)
 * - Blocks trailing dots and hostname suffix tricks
 * - Blocks non-HTTP/HTTPS schemes and non-standard ports
 * - Blocks HTTP downgrades on HTTPS-only providers
 */
export function validateOutboundTarget(
  url: string | URL,
  explicitProviderId?: string
): TargetValidationResult {
  let parsed: URL;
  try {
    parsed = typeof url === 'string' ? new URL(url) : url;
  } catch {
    return {
      allowed: false,
      useFixie: false,
      routing: 'rejected',
      rejectionReason: 'Invalid destination URL format.',
    };
  }

  // Reject non-HTTP/HTTPS protocols
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return {
      allowed: false,
      useFixie: false,
      routing: 'rejected',
      rejectionReason: `Disallowed URL protocol "${parsed.protocol}". Only HTTP/HTTPS are permitted.`,
    };
  }

  // Prevent userinfo@host confusion attacks in destination URL
  if (parsed.username || parsed.password) {
    return {
      allowed: false,
      useFixie: false,
      routing: 'rejected',
      rejectionReason: 'Destination URLs containing embedded credentials are not permitted.',
    };
  }

  // Reject trailing dots (e.g. core.neoapi.io.) and empty hostnames
  const hostname = parsed.hostname.toLowerCase();
  if (!hostname || hostname.endsWith('.')) {
    return {
      allowed: false,
      useFixie: false,
      routing: 'rejected',
      rejectionReason: `Invalid destination hostname "${parsed.hostname}".`,
    };
  }

  // Reject non-standard ports (prevents SSRF port scanning)
  if (parsed.port && parsed.port !== '80' && parsed.port !== '443') {
    return {
      allowed: false,
      useFixie: false,
      routing: 'rejected',
      rejectionReason: `Non-standard destination port "${parsed.port}" is blocked.`,
    };
  }

  // Resolve provider registration
  let provider: ProviderRegistration | undefined;

  if (explicitProviderId) {
    provider = getProviderById(explicitProviderId);
    if (!provider) {
      return {
        allowed: false,
        useFixie: false,
        routing: 'rejected',
        rejectionReason: `Unregistered provider ID: "${explicitProviderId}". Request rejected by policy.`,
      };
    }

    const hostExactMatch = provider.allowedHostnames.some(
      (allowed) => allowed.toLowerCase() === hostname
    );
    if (!hostExactMatch) {
      return {
        allowed: false,
        useFixie: false,
        routing: 'rejected',
        provider,
        rejectionReason: `Destination hostname "${hostname}" is not in allowlist for provider "${provider.id}".`,
      };
    }
  } else {
    provider = getProviderByHostname(hostname);
    if (!provider) {
      return {
        allowed: false,
        useFixie: false,
        routing: 'rejected',
        rejectionReason: `Unregistered destination hostname "${hostname}". Requests to unregistered external hosts are rejected.`,
      };
    }
  }

  // Enforce HTTPS for providers requiring encrypted transport
  if (provider.requireHttps && parsed.protocol !== 'https:') {
    return {
      allowed: false,
      useFixie: false,
      routing: 'rejected',
      provider,
      rejectionReason: `Provider "${provider.id}" requires HTTPS; insecure HTTP connection blocked.`,
    };
  }

  return {
    allowed: true,
    useFixie: provider.routing === 'fixie',
    routing: provider.routing,
    provider,
  };
}

/**
 * Legacy helper alias retained for backwards compatibility with existing callers/tests.
 */
export function validateProxyEligibility(url: string | URL, explicitProviderId?: string): {
  authorized: boolean;
  routing: RoutingPolicy;
  provider?: ProviderRegistration;
  rejectionReason?: string;
} {
  const res = validateOutboundTarget(url, explicitProviderId);
  return {
    authorized: res.allowed && res.useFixie,
    routing: res.routing === 'fixie' ? 'fixie' : 'direct',
    provider: res.provider,
    rejectionReason: res.rejectionReason,
  };
}
