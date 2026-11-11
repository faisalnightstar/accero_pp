/**
 * Centralized External Provider Registry & Routing Policy
 *
 * Defines explicit provider hostnames, static IP whitelisting requirements,
 * and routing policies (Fixie vs Direct).
 *
 * Security:
 * Only explicitly registered hostnames requiring IP whitelisting may utilize
 * Fixie's static IP proxy. Unregistered or direct services are never proxied.
 */

export type RoutingPolicy = 'fixie' | 'direct';

export interface ProviderRegistration {
  /** Unique provider identifier */
  id: string;
  /** Human-readable provider name */
  name: string;
  /** Routing strategy */
  routing: RoutingPolicy;
  /** Whitelisted destination hostnames for this provider */
  allowedHostnames: readonly string[];
  /** Whether the provider requires static IP whitelisting on their firewall */
  requiresWhitelisting: boolean;
  /** Default timeout in milliseconds */
  defaultTimeoutMs: number;
  /** Purpose description */
  description: string;
}

/**
 * Explicit registry of external providers and their network routing policy.
 */
export const PROVIDER_REGISTRY: Record<string, ProviderRegistration> = {
  // 1. NeoAPI: Core Government Identity & Document Verification
  neoapi: {
    id: 'neoapi',
    name: 'NeoAPI',
    routing: 'fixie',
    allowedHostnames: ['core.neoapi.io'],
    requiresWhitelisting: true,
    defaultTimeoutMs: 8000,
    description: 'PAN & Voter ID verification gateway requiring static IP whitelisting',
  },

  // 2. FastNexora: Voter ID Verification Provider
  fastnexora: {
    id: 'fastnexora',
    name: 'FastNexora',
    routing: 'fixie',
    allowedHostnames: ['auth.fastnexora.xyz'],
    requiresWhitelisting: true,
    defaultTimeoutMs: 8000,
    description: 'Voter verification API requiring static IP whitelisting',
  },

  // 3. AxenAPI: DL & Vehicle RC Verification Provider
  axenapi: {
    id: 'axenapi',
    name: 'AxenAPI',
    routing: 'fixie',
    allowedHostnames: ['test.axenapi.co.in'],
    requiresWhitelisting: true,
    defaultTimeoutMs: 8000,
    description: 'Driving Licence and Vehicle RC verification requiring static IP whitelisting',
  },

  // 4. Paytm: Payment Gateway (STRICTLY DIRECT - NO PROXY)
  paytm: {
    id: 'paytm',
    name: 'Paytm Payment Gateway',
    routing: 'direct',
    allowedHostnames: ['securegw.paytm.in', 'securegw-stage.paytm.in'],
    requiresWhitelisting: false,
    defaultTimeoutMs: 10000,
    description: 'Payment transactions and order status polling (always direct connection)',
  },

  // 5. WhatsApp Business Cloud API (STRICTLY DIRECT - NO PROXY)
  whatsapp: {
    id: 'whatsapp',
    name: 'WhatsApp Business API',
    routing: 'direct',
    allowedHostnames: ['graph.facebook.com', 'api.whatsapp.com'],
    requiresWhitelisting: false,
    defaultTimeoutMs: 10000,
    description: 'Transactional WhatsApp notifications via Meta Cloud API',
  },

  // 6. MongoDB Atlas Database (STRICTLY DIRECT - NO PROXY)
  mongodb: {
    id: 'mongodb',
    name: 'MongoDB Atlas',
    routing: 'direct',
    allowedHostnames: [], // Handled by native MongoDB wire protocol driver
    requiresWhitelisting: false,
    defaultTimeoutMs: 15000,
    description: 'Primary database cluster connection',
  },

  // 7. Protected Egress IP Verification Diagnostic (Used solely by admin diagnostics)
  ipify_diagnostic: {
    id: 'ipify_diagnostic',
    name: 'Outbound IP Diagnostic Reflection',
    routing: 'fixie',
    allowedHostnames: ['api.ipify.org', 'icanhazip.com'],
    requiresWhitelisting: true,
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
 * Matches a destination URL or hostname against registered provider hostnames.
 */
export function getProviderByHostname(hostname: string): ProviderRegistration | undefined {
  const cleanHost = hostname.toLowerCase().trim();
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
 * Determines whether requests to a given provider or URL should route via Fixie.
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
 * Validates whether an outbound request destination is permitted to use the Fixie proxy.
 *
 * Security:
 * Prevents arbitrary user-supplied URLs from using Fixie's proxy infrastructure.
 * Only explicitly registered hostnames with `routing: 'fixie'` are authorized to tunnel.
 */
export function validateProxyEligibility(url: string | URL, explicitProviderId?: string): {
  authorized: boolean;
  routing: RoutingPolicy;
  provider?: ProviderRegistration;
  rejectionReason?: string;
} {
  let hostname = '';
  try {
    const parsed = typeof url === 'string' ? new URL(url) : url;
    hostname = parsed.hostname;
  } catch {
    return {
      authorized: false,
      routing: 'direct',
      rejectionReason: 'Invalid destination URL.',
    };
  }

  // 1. If an explicit provider ID was supplied, verify it matches
  if (explicitProviderId) {
    const registered = getProviderById(explicitProviderId);
    if (!registered) {
      return {
        authorized: false,
        routing: 'direct',
        rejectionReason: `Unregistered provider ID: "${explicitProviderId}". Requests must be explicitly registered.`,
      };
    }

    const hostAllowed = registered.allowedHostnames.some(
      (h) => h.toLowerCase() === hostname.toLowerCase()
    );

    if (!hostAllowed) {
      return {
        authorized: false,
        routing: 'direct',
        rejectionReason: `Hostname "${hostname}" is not authorized for provider "${explicitProviderId}".`,
      };
    }

    return {
      authorized: registered.routing === 'fixie',
      routing: registered.routing,
      provider: registered,
    };
  }

  // 2. Lookup provider by hostname
  const provider = getProviderByHostname(hostname);
  if (!provider) {
    // Unregistered service: Not allowed to use Fixie proxy. Routes direct.
    return {
      authorized: false,
      routing: 'direct',
      rejectionReason: `Hostname "${hostname}" is not in the provider allowlist. Defaulting to direct routing.`,
    };
  }

  return {
    authorized: provider.routing === 'fixie',
    routing: provider.routing,
    provider,
  };
}
