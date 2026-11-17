'use client';

export interface ClientUserData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  walletBalance: number;
}

export interface ClientSessionResponse {
  authenticated: boolean;
  user: ClientUserData | null;
}

const SESSION_STORAGE_KEY = 'accero_session_user';

let inFlightPromise: Promise<ClientSessionResponse> | null = null;
let cachedResponse: ClientSessionResponse | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 5000; // 5-second in-memory dedup window across concurrent components

/**
 * Returns cached session from sessionStorage immediately (if available on client).
 */
export function getStoredSession(): ClientUserData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && (parsed.id || parsed.name)) {
      return parsed as ClientUserData;
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Store session to sessionStorage and update short-term memory cache.
 */
export function storeClientSession(user: ClientUserData | null) {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
      cachedResponse = { authenticated: true, user };
      cacheTimestamp = Date.now();
    } else {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      cachedResponse = { authenticated: false, user: null };
      cacheTimestamp = Date.now();
    }
  } catch {
    // ignore
  }
}

/**
 * Fetches the user session from /api/auth/me with in-flight deduplication and memory caching.
 */
export async function fetchClientSession(force = false): Promise<ClientSessionResponse> {
  const now = Date.now();
  if (!force && cachedResponse && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedResponse;
  }

  if (inFlightPromise) {
    return inFlightPromise;
  }

  inFlightPromise = (async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) {
        storeClientSession(null);
        return { authenticated: false, user: null };
      }
      const data = await res.json();
      if (data?.authenticated && data?.user) {
        const userData: ClientUserData = {
          id: data.user.id || data.user._id,
          name: data.user.name || '',
          email: data.user.email || '',
          phone: data.user.phone || '',
          role: data.user.role || 'user',
          walletBalance:
            typeof data.user.walletBalance === 'number' ? data.user.walletBalance : 0,
        };
        storeClientSession(userData);
        return { authenticated: true, user: userData };
      }

      storeClientSession(null);
      return { authenticated: false, user: null };
    } catch {
      return { authenticated: false, user: null };
    } finally {
      inFlightPromise = null;
    }
  })();

  return inFlightPromise;
}

/**
 * Updates wallet balance across client memory, storage and dispatches event.
 */
export function updateClientWalletBalance(newBalance: number) {
  if (typeof window === 'undefined') return;
  const current = getStoredSession();
  if (current) {
    current.walletBalance = newBalance;
    storeClientSession(current);
  }
}
