import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  /**
   * Gets a value from cache by the given key.
   * @param key - Cache key.
   */
  get<T = any>(key: string): Promise<T | undefined> {
    return this.cacheManager.get<T>(key);
  }

  /**
   * Sets the given value to cache by the given key.
   * @param key - Cache key.
   * @param value - Value to cache.
   * @param ttl - Optional TTL in milliseconds. Falls back to the module default.
   */
  set<T = any>(key: string, value: T, ttl?: number): Promise<T> {
    return this.cacheManager.set<T>(key, value, ttl);
  }

  /**
   * Deletes the cached value under the given key.
   * @param key - Cache key.
   */
  delete(key: string): Promise<boolean> {
    return this.cacheManager.del(key);
  }

  /**
   * Returns all the keys in cache that match the given pattern.
   * The character '*' is used as a wildcard to represent any other characters.
   * Example:
   * If we wanted to get all keys that have the word 'enough' in them, we would send the pattern '*enough*'
   * @param pattern - Pattern to match
   * @returns Array of the keys
   */
  async keys(pattern = '*'): Promise<string[]> {
    const regex = this.patternToRegex(pattern);
    const keys = new Set<string>();

    for (const store of this.cacheManager.stores) {
      if (!store.iterator) {
        continue;
      }
      for await (const [key] of store.iterator(store.namespace)) {
        if (typeof key === 'string' && regex.test(key)) {
          keys.add(key);
        }
      }
    }

    return [...keys];
  }

  /**
   * Deletes the given keys from cache.
   * @param keys - Array of keys.
   */
  async deleteMultipleKeys(keys: string[]): Promise<void> {
    if (keys.length === 0) {
      return;
    }
    await this.cacheManager.mdel(keys);
  }

  /**
   * Deletes all keys from cache that match the given pattern.
   * The character '*' is used as a wildcard to represent any other characters.
   * Example:
   * If we wanted to delete all keys that have the word 'enough' in them, we would send the pattern '*enough*'
   * @param pattern - Pattern to match.
   */
  async deleteKeysByPattern(pattern = '*'): Promise<void> {
    const keys = await this.keys(pattern);
    return this.deleteMultipleKeys(keys);
  }

  /**
   * Converts a glob-like pattern ('*' wildcard) to an anchored RegExp.
   * @param pattern - Pattern with '*' wildcards.
   */
  private patternToRegex(pattern: string): RegExp {
    const escaped = pattern
      .split('*')
      .map((part) => part.replace(/[.+?^${}()|[\]\\]/g, '\\$&'))
      .join('.*');
    return new RegExp(`^${escaped}$`);
  }
}
