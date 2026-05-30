import { AggregatorResult, RawProduct, AggregatorConfig } from '../types';
import { createScopedLogger } from '../utils/logger';

const log = createScopedLogger('aggregator');

export interface PlatformClient {
  platform: AggregatorResult['platform'];
  search(query: string): Promise<AggregatorResult>;
  rateLimitConfig: { requestsPerSecond: number; burst: number };
}

export class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly maxTokens: number;
  private readonly refillRate: number;

  constructor(requestsPerSecond: number, burst: number) {
    this.tokens = burst;
    this.maxTokens = burst;
    this.refillRate = requestsPerSecond / 1000;
    this.lastRefill = Date.now();
  }

  async acquire(): Promise<void> {
    this.refill();
    if (this.tokens < 1) {
      const waitMs = Math.ceil((1 - this.tokens) / this.refillRate);
      log.trace({ waitMs }, 'Rate limit wait');
      await new Promise(resolve => setTimeout(resolve, waitMs));
      this.refill();
    }
    this.tokens -= 1;
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    this.tokens = Math.min(this.maxTokens, this.tokens + elapsed * this.refillRate);
    this.lastRefill = now;
  }
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  retries: number,
  baseDelayMs: number = 1000
): Promise<T> {
  let lastError: Error | undefined;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err as Error;
      if (attempt < retries) {
        const delay = baseDelayMs * Math.pow(2, attempt) + Math.random() * 1000;
        log.warn({ attempt, delay, error: (err as Error).message }, 'Retry attempt');
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

export abstract class BasePlatformClient implements PlatformClient {
  abstract platform: AggregatorResult['platform'];
  abstract rateLimitConfig: { requestsPerSecond: number; burst: number };
  source: AggregatorResult['source'] = 'api';
  private _rateLimiter: RateLimiter | null = null;
  protected log = createScopedLogger(this.constructor.name);

  protected get rateLimiter(): RateLimiter {
    if (!this._rateLimiter) {
      this._rateLimiter = new RateLimiter(
        this.rateLimitConfig.requestsPerSecond,
        this.rateLimitConfig.burst
      );
    }
    return this._rateLimiter;
  }

  abstract fetchProducts(query: string): Promise<RawProduct[]>;

  async search(query: string): Promise<AggregatorResult> {
    const start = Date.now();
    try {
      await this.rateLimiter.acquire();
      const products = await withRetry(() => this.fetchProducts(query), 2);
      this.log.info({ query, platform: this.platform, count: products.length, duration: Date.now() - start }, 'Fetch success');
      return { platform: this.platform, products, source: 'api' };
    } catch (err) {
      this.log.error({ query, platform: this.platform, error: (err as Error).message }, 'Fetch failed');
      return { platform: this.platform, products: [], error: (err as Error).message, source: 'error' };
    }
  }
}
