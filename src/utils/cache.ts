// src/utils/cache.ts
// Cache utilities

const cache = new Map<string, any>();

export function getCache<T>(key: string): T | undefined {
  return cache.get(key);
}

export function setCache(key: string, value: any): void {
  cache.set(key, value);
}
