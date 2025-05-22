import { ContentCache } from './ContentCache';
import { OfflineStorageInterface } from './ContentCacheInterfaces';

/**
 * Example implementation of OfflineStorage for demonstration purposes
 */
class MockOfflineStorage implements OfflineStorageInterface {
  private storage: Record<string, Record<string, any>> = {
    'content-cache': {}
  };

  async getItem(store: string, key: string): Promise<any | undefined> {
    if (!this.storage[store]) {
      return undefined;
    }
    return this.storage[store][key];
  }

  async setItem(store: string, key: string, value: any, options?: any): Promise<boolean> {
    if (!this.storage[store]) {
      this.storage[store] = {};
    }
    this.storage[store][key] = value;
    return true;
  }

  async removeItem(store: string, key: string): Promise<boolean> {
    if (!this.storage[store]) {
      return false;
    }
    if (key in this.storage[store]) {
      delete this.storage[store][key];
      return true;
    }
    return false;
  }

  async getAllKeys(store: string): Promise<string[]> {
    if (!this.storage[store]) {
      return [];
    }
    return Object.keys(this.storage[store]);
  }

  async getStorageStats(store: string): Promise<{
    totalSize: number;
    itemCount: number;
    quota?: number;
  }> {
    if (!this.storage[store]) {
      return { totalSize: 0, itemCount: 0 };
    }
    
    const keys = Object.keys(this.storage[store]);
    let totalSize = 0;
    
    for (const key of keys) {
      const item = this.storage[store][key];
      if (item.metadata && item.metadata.size) {
        totalSize += item.metadata.size;
      }
    }
    
    return {
      totalSize,
      itemCount: keys.length,
      quota: 100 * 1024 * 1024 // 100MB
    };
  }
}

/**
 * Example content provider for demonstration purposes
 */
const mockContentProvider = {
  getContentIdsAhead: async (userId: string, position: any, timeAhead: number): Promise<string[]> => {
    // In a real implementation, this would query the learning path API
    return ['stitch-add-3', 'stitch-add-4', 'stitch-mult-2'];
  },
  getRecommendedContent: async (userId: string): Promise<string[]> => {
    // In a real implementation, this would query the recommendations API
    return ['stitch-div-1', 'stitch-div-2'];
  }
};

/**
 * Example: Using the ContentCache component
 */
async function contentCacheExample() {
  // Initialize dependencies
  const offlineStorage = new MockOfflineStorage();
  
  // Initialize the content cache
  const contentCache = new ContentCache(offlineStorage);
  
  try {
    console.log("Example 1: Caching content");
    // Cache some content with high priority
    const contentIds = ['stitch-add-1', 'stitch-add-2', 'stitch-mult-1'];
    const result = await contentCache.cacheContent(contentIds, { priority: 'high' });
    console.log(`Cached ${result.cachedCount} content items (${result.totalSize} bytes)`);
    
    if (result.failedCount > 0) {
      console.warn(`Failed to cache ${result.failedCount} items:`, result.failures);
    }
    
    console.log("\nExample 2: Retrieving cached content");
    // Check if content is cached
    const contentId = 'stitch-add-1';
    const isCached = await contentCache.isCached(contentId);
    
    if (isCached) {
      // Get cached content
      const content = await contentCache.getCachedContent(contentId);
      console.log(`Content ${contentId}:`, content);
    } else {
      console.warn(`Content ${contentId} is not cached`);
    }
    
    console.log("\nExample 3: Checking cache status");
    // Get cache status for specific content IDs
    const statusContentIds = ['stitch-add-1', 'stitch-add-2', 'stitch-mult-3'];
    const status = await contentCache.getCacheStatus(statusContentIds);
    
    // Display cache status
    for (const [id, contentStatus] of Object.entries(status)) {
      if (contentStatus.cached) {
        console.log(`${id}: Cached (${contentStatus.size} bytes, cached at ${new Date(contentStatus.timestamp).toLocaleString()})`);
      } else {
        console.log(`${id}: Not cached`);
      }
    }
    
    console.log("\nExample 4: Prefetching content for a user");
    // Prefetch content for a user
    const userId = 'user-123';
    const currentPosition = { /* user's current position */ };
    
    const prefetchResult = await contentCache.prefetchContentForUser(userId, currentPosition, mockContentProvider);
    
    console.log(`Prefetched ${prefetchResult.cachedCount} content items (${prefetchResult.totalSize} bytes)`);
    
    if (prefetchResult.failedCount > 0) {
      console.warn(`Failed to prefetch ${prefetchResult.failedCount} items:`, prefetchResult.failures);
    }
  } catch (error) {
    console.error("Error in content cache example:", error);
  }
}

export { contentCacheExample };