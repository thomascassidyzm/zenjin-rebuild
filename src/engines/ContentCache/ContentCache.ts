import { OfflineStorageInterface } from './ContentCacheInterfaces';
import {
  ContentCachingInterface,
  CachingOptions,
  CacheResult,
  CacheStatus
} from './ContentCacheInterfaces';

/**
 * Implementation of ContentCache component for managing caching of content for offline use
 * in the Zenjin Maths App, following Spotify's offline content approach.
 */
export class ContentCache implements ContentCachingInterface {
  private readonly CACHE_PREFIX = "zenjin-content-cache";
  private readonly DEFAULT_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days
  private readonly MAX_CACHE_SIZE = 100 * 1024 * 1024; // 100MB

  /**
   * Creates a new ContentCache instance
   * @param offlineStorage Storage interface for persisting cached content
   */
  constructor(private offlineStorage: OfflineStorageInterface) {}

  /**
   * Caches content for offline use
   * @param contentIds Array of content identifiers to cache
   * @param options Optional caching options
   * @returns Result of the caching operation
   * @throws Error if caching operation fails
   */
  async cacheContent(contentIds: string[], options?: CachingOptions): Promise<CacheResult> {
    if (!contentIds || contentIds.length === 0) {
      throw new Error("INVALID_INPUT - Content IDs array cannot be empty");
    }
    
    const result: CacheResult = {
      success: true,
      cachedCount: 0,
      failedCount: 0,
      totalSize: 0,
      failures: []
    };
    
    // Check available storage space
    const stats = await this.offlineStorage.getStorageStats("content-cache");
    const availableSpace = this.MAX_CACHE_SIZE - (stats.totalSize || 0);
    
    // Prioritize content if needed
    const prioritizedIds = this.prioritizeContent(contentIds, options?.priority || 'medium');
    
    // Fetch and cache content
    for (const contentId of prioritizedIds) {
      try {
        // Skip if already cached and not forcing refresh
        if (!options?.forceRefresh && await this.isCached(contentId)) {
          continue;
        }
        
        // Fetch content from server
        const content = await this.fetchContentFromServer(contentId);
        
        if (!content) {
          throw new Error(`CONTENT_NOT_FOUND - Content with ID ${contentId} not found`);
        }
        
        // Calculate content size
        const contentSize = this.calculateContentSize(content);
        
        // Check if we have enough space
        if (contentSize > availableSpace) {
          // Try to free up space
          const neededSpace = contentSize - availableSpace;
          const freedSpace = await this.freeUpSpace(neededSpace, options?.priority || 'medium');
          
          if (freedSpace < neededSpace) {
            throw new Error("QUOTA_EXCEEDED - Not enough storage space available");
          }
        }
        
        // Store content in offline storage
        const key = this.getCacheKey(contentId);
        const ttl = options?.ttl || this.DEFAULT_TTL;
        const expirationDate = new Date(Date.now() + ttl).toISOString();
        
        // Compress content if text-based
        const compressedContent = await this.compressContentIfPossible(content);
        
        const success = await this.offlineStorage.setItem("content-cache", key, {
          content: compressedContent,
          metadata: {
            contentId,
            size: contentSize,
            timestamp: Date.now(),
            expiresAt: Date.now() + ttl,
            priority: options?.priority || 'medium',
            compressed: compressedContent !== content
          }
        }, {
          syncStatus: "synced",
          expirationDate
        });
        
        if (success) {
          result.cachedCount++;
          result.totalSize += contentSize;
        } else {
          result.failedCount++;
          result.failures.push({
            contentId,
            reason: "STORAGE_ERROR - Failed to store content"
          });
        }
      } catch (error) {
        result.failedCount++;
        result.failures.push({
          contentId,
          reason: error.message || "Unknown error"
        });
      }
    }
    
    result.success = result.failedCount === 0;
    return result;
  }

  /**
   * Retrieves cached content
   * @param contentId Content identifier
   * @returns Cached content or undefined if not cached
   * @throws Error if retrieval operation fails
   */
  async getCachedContent(contentId: string): Promise<any | undefined> {
    if (!contentId) {
      throw new Error("INVALID_CONTENT_ID - Content ID cannot be empty");
    }
    
    try {
      const key = this.getCacheKey(contentId);
      const cachedData = await this.offlineStorage.getItem("content-cache", key);
      
      if (!cachedData) {
        return undefined;
      }
      
      // Decompress content if it was compressed
      if (cachedData.metadata?.compressed) {
        return await this.decompressContent(cachedData.content);
      }
      
      return cachedData.content;
    } catch (error) {
      throw new Error(`RETRIEVAL_ERROR - Failed to retrieve cached content: ${error.message}`);
    }
  }

  /**
   * Checks if content is cached
   * @param contentId Content identifier
   * @returns Whether the content is cached
   */
  async isCached(contentId: string): Promise<boolean> {
    if (!contentId) {
      throw new Error("INVALID_CONTENT_ID - Content ID cannot be empty");
    }
    
    try {
      const key = this.getCacheKey(contentId);
      const metadata = await this.getCacheMetadata(contentId);
      
      if (!metadata) {
        return false;
      }
      
      // Check if content is expired
      if (metadata.expiresAt && metadata.expiresAt < Date.now()) {
        // Remove expired content
        await this.offlineStorage.removeItem("content-cache", key);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error(`Error checking cache status for ${contentId}:`, error);
      return false;
    }
  }

  /**
   * Gets cache status for specified content
   * @param contentIds Optional array of content identifiers
   * @returns Cache status for the specified content
   */
  async getCacheStatus(contentIds?: string[]): Promise<CacheStatus> {
    const result: CacheStatus = {};
    
    try {
      // If no content IDs specified, get all cached content
      if (!contentIds || contentIds.length === 0) {
        const allCachedContent = await this.getAllCachedContentMetadata();
        
        for (const item of allCachedContent) {
          const contentId = item.metadata.contentId;
          result[contentId] = {
            cached: true,
            size: item.metadata.size,
            timestamp: item.metadata.timestamp,
            expiresAt: item.metadata.expiresAt,
            priority: item.metadata.priority
          };
        }
      } else {
        // Get cache status for specified content IDs
        for (const contentId of contentIds) {
          const isCached = await this.isCached(contentId);
          
          if (isCached) {
            const metadata = await this.getCacheMetadata(contentId);
            result[contentId] = {
              cached: true,
              size: metadata.size,
              timestamp: metadata.timestamp,
              expiresAt: metadata.expiresAt,
              priority: metadata.priority
            };
          } else {
            result[contentId] = {
              cached: false
            };
          }
        }
      }
      
      return result;
    } catch (error) {
      throw new Error(`STATUS_ERROR - Failed to get cache status: ${error.message}`);
    }
  }

  /**
   * Removes cached content
   * @param contentId Content identifier to remove
   * @returns Whether the operation was successful
   */
  async removeCachedContent(contentId: string): Promise<boolean> {
    if (!contentId) {
      throw new Error("INVALID_CONTENT_ID - Content ID cannot be empty");
    }
    
    try {
      const key = this.getCacheKey(contentId);
      return await this.offlineStorage.removeItem("content-cache", key);
    } catch (error) {
      throw new Error(`REMOVAL_ERROR - Failed to remove cached content: ${error.message}`);
    }
  }

  /**
   * Clears all cached content
   * @returns Whether the operation was successful
   */
  async clearCache(): Promise<boolean> {
    try {
      // Get all cached content keys
      const allCachedContent = await this.getAllCachedContentMetadata();
      let success = true;
      
      // Remove each item
      for (const item of allCachedContent) {
        const key = this.getCacheKey(item.metadata.contentId);
        const removed = await this.offlineStorage.removeItem("content-cache", key);
        if (!removed) {
          success = false;
        }
      }
      
      return success;
    } catch (error) {
      throw new Error(`CLEAR_ERROR - Failed to clear cache: ${error.message}`);
    }
  }

  /**
   * Prefetches content for a user's learning path
   * @param userId User identifier
   * @param currentPosition Current position in learning path
   * @param contentProvider Provider for fetching content IDs
   * @returns Result of the prefetch operation
   */
  async prefetchContentForUser(
    userId: string, 
    currentPosition: any,
    contentProvider: {
      getContentIdsAhead: (userId: string, position: any, timeAhead: number) => Promise<string[]>,
      getRecommendedContent: (userId: string) => Promise<string[]>
    }
  ): Promise<CacheResult> {
    try {
      const PREFETCH_AHEAD_TIME = 30 * 60 * 1000; // 30 minutes of content
      
      // Get content IDs for the next 30 minutes of learning
      const contentIds = await contentProvider.getContentIdsAhead(
        userId,
        currentPosition,
        PREFETCH_AHEAD_TIME
      );
      
      // Cache content with high priority
      const result = await this.cacheContent(contentIds, { priority: 'high' });
      
      // Get additional recommended content with medium priority
      const recommendedContentIds = await contentProvider.getRecommendedContent(userId);
      
      // Cache recommended content with medium priority
      const recommendedResult = await this.cacheContent(recommendedContentIds, { priority: 'medium' });
      
      // Combine results
      return {
        success: result.success && recommendedResult.success,
        cachedCount: result.cachedCount + recommendedResult.cachedCount,
        failedCount: result.failedCount + recommendedResult.failedCount,
        totalSize: result.totalSize + recommendedResult.totalSize,
        failures: [...(result.failures || []), ...(recommendedResult.failures || [])]
      };
    } catch (error) {
      throw new Error(`PREFETCH_ERROR - Failed to prefetch content: ${error.message}`);
    }
  }

  // Private helper methods

  /**
   * Gets cache key for a content ID
   */
  private getCacheKey(contentId: string): string {
    return `${this.CACHE_PREFIX}:${contentId}`;
  }

  /**
   * Gets cache metadata for a content ID
   */
  private async getCacheMetadata(contentId: string): Promise<any> {
    const key = this.getCacheKey(contentId);
    const cachedData = await this.offlineStorage.getItem("content-cache", key);
    return cachedData?.metadata;
  }

  /**
   * Fetches content from server
   */
  private async fetchContentFromServer(contentId: string): Promise<any> {
    try {
      // In a real implementation, this would be an API call
      // Simulated fetch implementation
      return {
        id: contentId,
        type: contentId.split('-')[0], // 'stitch', 'question', etc.
        data: { /* content data */ },
        timestamp: Date.now()
      };
    } catch (error) {
      throw new Error(`FETCH_ERROR - Failed to fetch content from server: ${error.message}`);
    }
  }

  /**
   * Calculates size of content in bytes
   */
  private calculateContentSize(content: any): number {
    // A more accurate estimate would involve actual serialization
    return JSON.stringify(content).length * 2; // Rough estimate
  }

  /**
   * Prioritizes content based on learning path position
   */
  private prioritizeContent(contentIds: string[], basePriority: string): string[] {
    // In a real implementation, this would use learning path data
    // Simple implementation: return content IDs in the same order
    return contentIds;
  }

  /**
   * Frees up space by removing low-priority content
   */
  private async freeUpSpace(requiredSpace: number, newContentPriority: string): Promise<number> {
    // Get all cached content metadata
    const cachedContent = await this.getAllCachedContentMetadata();
    
    // Sort by eviction priority (lowest priority first)
    const sortedContent = this.sortByEvictionPriority(cachedContent, newContentPriority);
    
    let freedSpace = 0;
    
    // Remove content until we have enough space or run out of content to remove
    for (const item of sortedContent) {
      if (freedSpace >= requiredSpace) {
        break;
      }
      
      // Skip high priority content if new content is not high priority
      if (item.metadata.priority === 'high' && newContentPriority !== 'high') {
        continue;
      }
      
      // Remove the content
      const key = this.getCacheKey(item.metadata.contentId);
      const success = await this.offlineStorage.removeItem("content-cache", key);
      
      if (success) {
        freedSpace += item.metadata.size;
      }
    }
    
    return freedSpace;
  }

  /**
   * Gets all cached content metadata
   */
  private async getAllCachedContentMetadata(): Promise<Array<{
    key: string;
    metadata: {
      contentId: string;
      size: number;
      timestamp: number;
      expiresAt?: number;
      priority: string;
    };
  }>> {
    // Get all keys with the cache prefix
    const keys = await this.offlineStorage.getAllKeys("content-cache");
    const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
    
    const result = [];
    
    // Get metadata for each key
    for (const key of cacheKeys) {
      const data = await this.offlineStorage.getItem("content-cache", key);
      if (data && data.metadata) {
        result.push({
          key,
          metadata: data.metadata
        });
      }
    }
    
    return result;
  }

  /**
   * Sorts content by eviction priority
   */
  private sortByEvictionPriority(
    content: Array<{
      key: string;
      metadata: {
        contentId: string;
        size: number;
        timestamp: number;
        expiresAt?: number;
        priority: string;
      };
    }>,
    newContentPriority: string
  ): Array<{
    key: string;
    metadata: {
      contentId: string;
      size: number;
      timestamp: number;
      expiresAt?: number;
      priority: string;
    };
  }> {
    // Sort content by eviction priority:
    // 1. Priority (low before medium before high)
    // 2. Last accessed time (oldest first)
    // 3. Size (largest first if we need to free up space quickly)
    return [...content].sort((a, b) => {
      // Priority comparison
      const priorityOrder = { 'low': 0, 'medium': 1, 'high': 2 };
      const priorityDiff = priorityOrder[a.metadata.priority] - priorityOrder[b.metadata.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Timestamp comparison (oldest first)
      const timestampDiff = a.metadata.timestamp - b.metadata.timestamp;
      if (timestampDiff !== 0) return timestampDiff;
      
      // Size comparison (largest first)
      return b.metadata.size - a.metadata.size;
    });
  }

  /**
   * Compresses content if possible
   */
  private async compressContentIfPossible(content: any): Promise<any> {
    // Only compress text-based content
    if (typeof content !== 'object') {
      return content;
    }
    
    try {
      // Convert content to string
      const contentString = JSON.stringify(content);
      
      // Check if compression would be beneficial (only for larger content)
      if (contentString.length < 1024) {
        return content; // Don't compress small content
      }
      
      // Convert string to Uint8Array
      const contentBytes = new TextEncoder().encode(contentString);
      
      // Use CompressionStream if available (modern browsers)
      if (typeof CompressionStream !== 'undefined') {
        const cs = new CompressionStream('gzip');
        const writer = cs.writable.getWriter();
        writer.write(contentBytes);
        writer.close();
        
        return new Response(cs.readable).arrayBuffer();
      } else {
        // Fallback for browsers without CompressionStream
        return content;
      }
    } catch (error) {
      console.warn("Compression failed, storing uncompressed:", error);
      return content;
    }
  }

  /**
   * Decompresses content
   */
  private async decompressContent(compressedData: ArrayBuffer): Promise<any> {
    try {
      // Use DecompressionStream if available (modern browsers)
      if (typeof DecompressionStream !== 'undefined') {
        const ds = new DecompressionStream('gzip');
        const writer = ds.writable.getWriter();
        writer.write(new Uint8Array(compressedData));
        writer.close();
        
        const decompressedBytes = await new Response(ds.readable).arrayBuffer();
        const decompressedString = new TextDecoder().decode(decompressedBytes);
        
        return JSON.parse(decompressedString);
      } else {
        // Fallback for browsers without DecompressionStream
        if (compressedData instanceof ArrayBuffer) {
          const decompressedString = new TextDecoder().decode(compressedData);
          return JSON.parse(decompressedString);
        }
        return compressedData;
      }
    } catch (error) {
      throw new Error(`DECOMPRESSION_ERROR - Failed to decompress content: ${error.message}`);
    }
  }
}