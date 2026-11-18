/**
 * In-Memory Circuit Breaker for Verification API Providers
 *
 * Implements the standard three-state pattern:
 * - CLOSED: Normal operation. Requests flow freely. Consecutive failures increment a counter.
 * - OPEN: Tripped after `failureThreshold` consecutive retryable failures. All requests are blocked.
 * - HALF_OPEN: Entered after `cooldownPeriodMs` passes while in OPEN state. Allows a single probe
 *   request. If successful, state returns to CLOSED; if failed, state trips back to OPEN.
 *
 * Crucial Safeguards:
 * - Non-retryable errors (e.g. invalid EPIC format, record not found, invalid captcha) NEVER trip the breaker.
 * - Thread/worker-safe in-memory state with reset capabilities for admin operations.
 */

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerConfig {
  failureThreshold?: number; // default: 3
  cooldownPeriodMs?: number; // default: 60000 (60s)
  halfOpenSuccessThreshold?: number; // default: 1
}

export interface CircuitBreakerStatus {
  providerId: string;
  state: CircuitState;
  consecutiveFailures: number;
  lastFailureTime: number | null;
  openedAt: number | null;
  cooldownRemainingMs: number;
}

class CircuitBreakerManager {
  private readonly defaultFailureThreshold: number;
  private readonly defaultCooldownPeriodMs: number;
  private readonly defaultHalfOpenSuccessThreshold: number;

  private breakers = new Map<
    string,
    {
      state: CircuitState;
      consecutiveFailures: number;
      lastFailureTime: number | null;
      openedAt: number | null;
      successCountInHalfOpen: number;
    }
  >();

  constructor(config?: CircuitBreakerConfig) {
    this.defaultFailureThreshold = config?.failureThreshold ?? 3;
    this.defaultCooldownPeriodMs = config?.cooldownPeriodMs ?? 60000;
    this.defaultHalfOpenSuccessThreshold = config?.halfOpenSuccessThreshold ?? 1;
  }

  private getOrCreate(providerId: string) {
    const key = providerId.toLowerCase().trim();
    let breaker = this.breakers.get(key);
    if (!breaker) {
      breaker = {
        state: 'CLOSED',
        consecutiveFailures: 0,
        lastFailureTime: null,
        openedAt: null,
        successCountInHalfOpen: 0,
      };
      this.breakers.set(key, breaker);
    }
    return { key, breaker };
  }

  /**
   * Checks whether a request to this provider is permitted to execute.
   * If OPEN and cooldown has passed, transitions to HALF_OPEN for a trial probe.
   */
  canExecute(providerId: string): boolean {
    const { breaker } = this.getOrCreate(providerId);

    if (breaker.state === 'CLOSED') {
      return true;
    }

    const now = Date.now();

    if (breaker.state === 'OPEN') {
      const elapsed = breaker.openedAt ? now - breaker.openedAt : Infinity;
      if (elapsed >= this.defaultCooldownPeriodMs) {
        // Cooldown passed: transition to HALF_OPEN to probe upstream health
        breaker.state = 'HALF_OPEN';
        breaker.successCountInHalfOpen = 0;
        return true;
      }
      return false; // Circuit still OPEN
    }

    if (breaker.state === 'HALF_OPEN') {
      // In HALF_OPEN, allow probe
      return true;
    }

    return true;
  }

  /**
   * Records a successful execution.
   * Resets failures and restores CLOSED state if previously HALF_OPEN.
   */
  recordSuccess(providerId: string): void {
    const { breaker } = this.getOrCreate(providerId);
    breaker.consecutiveFailures = 0;
    breaker.lastFailureTime = null;
    breaker.openedAt = null;
    breaker.successCountInHalfOpen = 0;
    breaker.state = 'CLOSED';
  }

  /**
   * Records a failure.
   * Only retryable infrastructure/upstream errors increment the counter and trip the breaker.
   */
  recordFailure(providerId: string, isRetryable: boolean = true): void {
    if (!isRetryable) {
      // Non-retryable errors (e.g. invalid user input, not found) must never trip the circuit
      return;
    }

    const { breaker } = this.getOrCreate(providerId);
    const now = Date.now();
    breaker.lastFailureTime = now;

    if (breaker.state === 'HALF_OPEN') {
      // Probe failed: trip immediately back to OPEN
      breaker.state = 'OPEN';
      breaker.openedAt = now;
      return;
    }

    if (breaker.state === 'CLOSED') {
      breaker.consecutiveFailures += 1;
      if (breaker.consecutiveFailures >= this.defaultFailureThreshold) {
        breaker.state = 'OPEN';
        breaker.openedAt = now;
        console.warn(
          `[CircuitBreaker] Provider "${providerId}" tripped OPEN after ${breaker.consecutiveFailures} consecutive failures. Cooldown: ${this.defaultCooldownPeriodMs}ms.`
        );
      }
    }
  }

  /**
   * Returns current status of a provider's circuit.
   */
  getStatus(providerId: string): CircuitBreakerStatus {
    const { key, breaker } = this.getOrCreate(providerId);
    const now = Date.now();

    let cooldownRemaining = 0;
    if (breaker.state === 'OPEN' && breaker.openedAt) {
      cooldownRemaining = Math.max(0, this.defaultCooldownPeriodMs - (now - breaker.openedAt));
    }

    return {
      providerId: key,
      state: breaker.state,
      consecutiveFailures: breaker.consecutiveFailures,
      lastFailureTime: breaker.lastFailureTime,
      openedAt: breaker.openedAt,
      cooldownRemainingMs: cooldownRemaining,
    };
  }

  /**
   * Manually resets a provider's circuit back to CLOSED.
   */
  reset(providerId: string): void {
    const { breaker } = this.getOrCreate(providerId);
    breaker.state = 'CLOSED';
    breaker.consecutiveFailures = 0;
    breaker.lastFailureTime = null;
    breaker.openedAt = null;
    breaker.successCountInHalfOpen = 0;
  }

  /**
   * Resets all provider circuits.
   */
  resetAll(): void {
    this.breakers.clear();
  }

  /**
   * Returns status for all tracked providers.
   */
  getAllStatuses(): Record<string, CircuitBreakerStatus> {
    const statuses: Record<string, CircuitBreakerStatus> = {};
    for (const [key] of this.breakers) {
      statuses[key] = this.getStatus(key);
    }
    return statuses;
  }
}

export const circuitBreaker = new CircuitBreakerManager();
