import { circuitBreaker, CircuitState } from './circuitBreaker';

export interface ProviderHealthMetrics {
  providerId: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  timeoutCount: number;
  successRate: number; // percentage (0 - 100)
  avgLatencyMs: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  lastSuccessAt: string | null;
  lastFailureAt: string | null;
  lastErrorMessage: string | null;
  circuitState: CircuitState;
  consecutiveFailures: number;
}

interface RawProviderMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  timeoutCount: number;
  latencies: number[];
  lastSuccessAt: number | null;
  lastFailureAt: number | null;
  lastErrorMessage: string | null;
}

const MAX_TRACKED_LATENCIES = 100;

class ProviderHealthTracker {
  private metrics = new Map<string, RawProviderMetrics>();

  private getOrCreate(providerId: string): RawProviderMetrics {
    const key = providerId.toLowerCase().trim();
    let m = this.metrics.get(key);
    if (!m) {
      m = {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        timeoutCount: 0,
        latencies: [],
        lastSuccessAt: null,
        lastFailureAt: null,
        lastErrorMessage: null,
      };
      this.metrics.set(key, m);
    }
    return m;
  }

  /**
   * Records execution of a request against a provider.
   */
  recordExecution(params: {
    providerId: string;
    success: boolean;
    latencyMs: number;
    isTimeout?: boolean;
    isRetryable?: boolean;
    errorMessage?: string;
  }): void {
    const { providerId, success, latencyMs, isTimeout, isRetryable = true, errorMessage } = params;
    const m = this.getOrCreate(providerId);

    m.totalRequests += 1;

    // Track latency
    if (latencyMs > 0) {
      m.latencies.push(latencyMs);
      if (m.latencies.length > MAX_TRACKED_LATENCIES) {
        m.latencies.shift();
      }
    }

    const now = Date.now();

    if (success) {
      m.successfulRequests += 1;
      m.lastSuccessAt = now;
      circuitBreaker.recordSuccess(providerId);
    } else {
      m.failedRequests += 1;
      m.lastFailureAt = now;
      if (errorMessage) {
        m.lastErrorMessage = errorMessage;
      }
      if (isTimeout) {
        m.timeoutCount += 1;
      }
      circuitBreaker.recordFailure(providerId, isRetryable);
    }
  }

  /**
   * Calculates percentile latency from the rolling buffer.
   */
  private calculatePercentile(latencies: number[], percentile: number): number {
    if (latencies.length === 0) return 0;
    const sorted = [...latencies].sort((a, b) => a - b);
    const index = Math.min(
      sorted.length - 1,
      Math.floor((percentile / 100) * sorted.length)
    );
    return Math.round(sorted[index]);
  }

  /**
   * Returns current health metrics for a provider.
   */
  getMetrics(providerId: string): ProviderHealthMetrics {
    const key = providerId.toLowerCase().trim();
    const m = this.getOrCreate(key);
    const cbStatus = circuitBreaker.getStatus(key);

    const total = m.totalRequests;
    const successRate = total > 0 ? Math.round((m.successfulRequests / total) * 100) : 100;
    const avgLatency =
      m.latencies.length > 0
        ? Math.round(m.latencies.reduce((acc, v) => acc + v, 0) / m.latencies.length)
        : 0;

    return {
      providerId: key,
      totalRequests: m.totalRequests,
      successfulRequests: m.successfulRequests,
      failedRequests: m.failedRequests,
      timeoutCount: m.timeoutCount,
      successRate,
      avgLatencyMs: avgLatency,
      p50LatencyMs: this.calculatePercentile(m.latencies, 50),
      p95LatencyMs: this.calculatePercentile(m.latencies, 95),
      lastSuccessAt: m.lastSuccessAt ? new Date(m.lastSuccessAt).toISOString() : null,
      lastFailureAt: m.lastFailureAt ? new Date(m.lastFailureAt).toISOString() : null,
      lastErrorMessage: m.lastErrorMessage,
      circuitState: cbStatus.state,
      consecutiveFailures: cbStatus.consecutiveFailures,
    };
  }

  /**
   * Returns health metrics for all known providers.
   */
  getAllMetrics(): Record<string, ProviderHealthMetrics> {
    const result: Record<string, ProviderHealthMetrics> = {};
    for (const key of this.metrics.keys()) {
      result[key] = this.getMetrics(key);
    }
    return result;
  }

  /**
   * Resets metrics for a provider.
   */
  resetMetrics(providerId: string): void {
    const key = providerId.toLowerCase().trim();
    this.metrics.delete(key);
    circuitBreaker.reset(key);
  }
}

export const providerHealthTracker = new ProviderHealthTracker();
