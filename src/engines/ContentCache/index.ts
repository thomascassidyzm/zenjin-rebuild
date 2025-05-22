import { ContentCache } from './ContentCache';
import { 
  ContentCachingInterface, 
  OfflineStorageInterface, 
  CachingOptions, 
  CacheResult, 
  CacheStatus 
} from './ContentCacheInterfaces';
import { contentCacheExample } from './ContentCacheExample';

/**
 * Factory function to create a new ContentCache instance
 * @param offlineStorage OfflineStorage implementation for persistent storage
 * @returns ContentCache instance
 */
export function createContentCache(offlineStorage: OfflineStorageInterface): ContentCachingInterface {
  return new ContentCache(offlineStorage);
}

export {
  ContentCache,
  ContentCachingInterface,
  OfflineStorageInterface,
  CachingOptions,
  CacheResult,
  CacheStatus,
  contentCacheExample
};