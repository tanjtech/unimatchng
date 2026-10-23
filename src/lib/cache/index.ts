import crypto from 'node:crypto';

export interface CacheAdapter {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
}

// In-Memory Fallback Adapter with TTL support
class InMemoryCacheAdapter implements CacheAdapter {
  private store = new Map<string, { value: unknown; expiresAt: number }>();

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds = 7 * 86400): Promise<void> {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.store.set(key, { value, expiresAt });
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }
}

// Upstash Redis REST API Adapter
class UpstashRedisCacheAdapter implements CacheAdapter {
  private url: string;
  private token: string;

  constructor(url: string, token: string) {
    this.url = url.replace(/\/$/, '');
    this.token = token;
  }

  private async request(command: string[]): Promise<unknown> {
    const res = await fetch(`${this.url}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(command),
    });

    if (!res.ok) {
      throw new Error(`Upstash Redis error: ${res.statusText}`);
    }

    const data = await res.json();
    return data.result;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const res = await this.request(['GET', key]);
      if (typeof res === 'string') {
        return JSON.parse(res) as T;
      }
      return null;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds = 7 * 86400): Promise<void> {
    try {
      const str = JSON.stringify(value);
      await this.request(['SETEX', key, ttlSeconds.toString(), str]);
    } catch (e) {
      console.warn('Failed to set Upstash Redis cache:', e);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.request(['DEL', key]);
    } catch {
      // Ignore deletion failure
    }
  }
}

// Default TTL in days, configurable via CACHE_TTL_DAYS
const DEFAULT_TTL_DAYS = parseInt(process.env.CACHE_TTL_DAYS || '7', 10);
export const DEFAULT_TTL_SECONDS = DEFAULT_TTL_DAYS * 86400;

function resolveCacheAdapter(): CacheAdapter {
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (upstashUrl && upstashToken) {
    return new UpstashRedisCacheAdapter(upstashUrl, upstashToken);
  }
  return new InMemoryCacheAdapter();
}

export const serverCache: CacheAdapter = resolveCacheAdapter();

/**
 * Computes a deterministic SHA-256 hash of an object/input.
 */
export function hashData(data: unknown): string {
  const normalized = JSON.stringify(data, Object.keys(data as object || {}).sort());
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

/**
 * Generate normalized cache key for recommendations
 */
export function createRecommendationsCacheKey(profile: unknown, promptVersion: string): string {
  const hash = hashData({ profile, promptVersion });
  return `unimatch:recs:v1:${hash}`;
}

/**
 * Generate cache key for university detail
 */
export function createDetailCacheKey(slug: string, promptVersion: string): string {
  const hash = hashData({ slug: slug.toLowerCase().trim(), promptVersion });
  return `unimatch:detail:v1:${hash}`;
}
