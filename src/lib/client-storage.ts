/**
 * Client storage utility using versioned prefix "unimatch_v1_"
 * Handles storage quota exceptions, corruption, and offline reads.
 */

const PREFIX = 'unimatch_v1_';

export interface CachedEnvelope<T> {
  data: T;
  timestamp: number;
}

export function saveClientCache<T>(key: string, data: T): void {
  try {
    const envelope: CachedEnvelope<T> = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(envelope));
  } catch (err) {
    console.warn(`Local storage quota exceeded or unavailable for ${key}:`, err);
    // If quota exceeded, clean older keys under our prefix
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(PREFIX) && !k.includes('profile') && !k.includes('shortlist')) {
          localStorage.removeItem(k);
          break;
        }
      }
    } catch {
      // Ignore fallback errors
    }
  }
}

export function getClientCache<T>(key: string): { data: T; timestamp: number } | null {
  try {
    const raw = localStorage.getItem(`${PREFIX}${key}`);
    if (!raw) return null;
    return JSON.parse(raw) as CachedEnvelope<T>;
  } catch (err) {
    console.warn(`Error reading client cache for ${key}:`, err);
    return null;
  }
}

export function removeClientCache(key: string): void {
  try {
    localStorage.removeItem(`${PREFIX}${key}`);
  } catch (err) {
    console.warn(`Error deleting client cache for ${key}:`, err);
  }
}

export function clearAllClientCache(): void {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PREFIX)) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch {
    // Ignore error
  }
}
