# ContentCache Implementation Package

## Implementation Goal and Component Context

The ContentCache component is responsible for managing the caching of content for offline use in the Zenjin Maths App. It ensures users can access learning materials without an internet connection, following a model similar to Spotify's offline content approach. This component is a critical part of the OfflineSupport module, enabling seamless learning experiences regardless of connectivity status.

The component must implement efficient content caching strategies, prioritize essential content, track cache status, and optimize storage usage. It should support approximately 30 minutes of cached content with intelligent prioritization based on the user's current learning path.

## Interface Definition

```typescript
/**
 * Interface for managing caching of content for offline use
 */
export interface ContentCachingInterface {
  /**
   * Caches content for offline use
   * @param contentIds Array of content identifiers to cache
   * @param options Optional caching options
   * @returns Result of the caching operation
   * @throws Error if caching operation fails
   */
  cacheContent(contentIds: string[], options?: CachingOptions): CacheResult;
  
  /**
   * Retrieves cached content
   * @param contentId Content identifier
   * @returns Cached content or undefined if not cached
   * @throws Error if retrieval operation fails
   */
  getCachedContent(contentId: string): any | undefined;
  
  /**
   * Checks if content is cached
   * @param contentId Content identifier
   * @returns Whether the content is cached
   */
  isCached(contentId: string): boolean;
  
  /**
   * Gets cache status for specified content
   * @param contentIds Optional array of content identifiers
   * @returns Cache status for the specified content
   */
  getCacheStatus(contentIds?: string[]): CacheStatus;
}

/**
 * Options for content caching
 */
export interface CachingOptions {
  /**
   * Priority level for caching ('high', 'medium', 'low')
   */
  priority?: 'high' | 'medium' | 'low';
  
  /**
   * Time-to-live in milliseconds
   */
  ttl?: number;
  
  /**
   * Whether to force cache refresh even if content is already cached
   */
  forceRefresh?: boolean;
  
  /**
   * Maximum size in bytes to allocate for this caching operation
   */
  maxSize?: number;
}

/**
 * Result of a caching operation
 */
export interface CacheResult {
  /**
   * Whether the operation was successful overall
   */
  success: boolean;
  
  /**
   * Number of content items successfully cached
   */
  cachedCount: number;
  
  /**
   * Number of content items that failed to cache
   */
  failedCount: number;
  
  /**
   * Total size in bytes of cached content
   */
  totalSize: number;
  
  /**
   * Optional details about failed items
   */
  failures?: {
    contentId: string;
    reason: string;
  }[];
}

/**
 * Cache status for content items
 */
export interface CacheStatus {
  /**
   * Map of content IDs to their cache status
   */
  [contentId: string]: {
    /**
     * Whether the content is cached
     */
    cached: boolean;
    
    /**
     * Size in bytes (only present if cached)
     */
    size?: number;
    
    /**
     * Timestamp when the content was cached (only present if cached)
     */
    timestamp?: number;
    
    /**
     * Expiration timestamp (only present if cached and has TTL)
     */
    expiresAt?: number;
    
    /**
     * Priority level (only present if cached)
     */
    priority?: string;
  };
}
```

## Module Context

The ContentCache component is part of the OfflineSupport module, which provides offline functionality with local storage of content and progress, synchronizing with the server only at the beginning and end of sessions. This module ensures the application functions properly without an internet connection.

### Module Structure

The OfflineSupport module consists of the following components:

1. **OfflineStorage**: Implements local storage using IndexedDB
2. **SynchronizationManager**: Manages data synchronization between local storage and server
3. **ContentCache** (this component): Manages caching of content for offline use
4. **ConnectivityManager**: Detects and handles network connectivity changes

### Component Dependencies

The ContentCache component has the following dependencies:

1. **OfflineStorageInterface**: Used to store and retrieve cached content

### Module Dependencies

The OfflineSupport module has dependencies on:

1. **MetricsSystem**: For metrics storage
2. **ProgressionSystem**: For progress tracking
3. **SubscriptionSystem**: For subscription management

## Implementation Requirements

### Caching Strategy

1. **Spotify-like Offline Content Model**
   - Implement a caching system similar to Spotify's offline content model
   - Cache content ahead of time for offline access
   - Support prioritized caching of essential content
   - Implement intelligent prefetching based on user's learning path

2. **Content Organization**
   - Organize cached content by type (stitches, questions, media assets)
   - Use content IDs as primary keys for efficient retrieval
   - Support metadata storage for cache management
   - Implement versioning to handle content updates

3. **Cache Prioritization**
   - Implement priority levels (high, medium, low) for content caching
   - Prioritize content based on the user's current learning path
   - Cache approximately 30 minutes of content ahead of the user's current position
   - Implement intelligent eviction policies based on priority and usage patterns

### Storage Optimization

1. **Space Efficiency**
   - Optimize storage usage for potentially large content sets
   - Implement compression for text-based content where appropriate
   - Store binary assets efficiently
   - Monitor and manage cache size to prevent exceeding storage limits

2. **Performance Optimization**
   - Implement efficient indexing for fast content retrieval
   - Use bulk operations for caching multiple content items
   - Minimize main thread blocking during cache operations
   - Implement background caching for non-urgent content

### Cache Management

1. **Cache Status Tracking**
   - Track cache status for all content items
   - Monitor cache size and usage
   - Track cache timestamps for freshness assessment
   - Implement TTL (time-to-live) for cached content

2. **Cache Maintenance**
   - Implement automatic cache cleanup for expired content
   - Support manual cache refresh for outdated content
   - Implement cache size management to prevent storage quota issues
   - Support cache invalidation when content is updated on the server

### Error Handling

1. **Robust Error Management**
   - Implement comprehensive error handling for all caching operations
   - Provide detailed error information for failed cache operations
   - Handle storage quota exceeded errors gracefully
   - Implement retry mechanisms for transient errors

2. **Fallback Mechanisms**
   - Implement fallback content delivery when cached content is unavailable
   - Support partial content caching when full caching fails
   - Provide degraded experience with essential content when storage is limited
   - Implement progressive enhancement based on available cached content

## Mock Inputs and Expected Outputs

### cacheContent

**Input:**
```typescript
const input = {
  contentIds: ['stitch-add-1', 'stitch-add-2', 'stitch-mult-1'],
  options: {
    priority: 'high'
  }
};
```

**Expected Output:**
```typescript
const expectedOutput = {
  success: true,
  cachedCount: 3,
  failedCount: 0,
  totalSize: 256000
};
```

### getCachedContent

**Input:**
```typescript
const input = {
  contentId: 'stitch-add-1'
};
```

**Expected Output:**
```typescript
const expectedOutput = {
  id: 'stitch-add-1',
  type: 'stitch',
  questions: [
    // Array of question objects
  ],
  metadata: {
    // Content metadata
  }
};
```

### isCached

**Input:**
```typescript
const input = {
  contentId: 'stitch-add-1'
};
```

**Expected Output:**
```typescript
const expectedOutput = true;
```

### getCacheStatus

**Input:**
```typescript
const input = {
  contentIds: ['stitch-add-1', 'stitch-add-2', 'stitch-mult-3']
};
```

**Expected Output:**
```typescript
const expectedOutput = {
  'stitch-add-1': {
    cached: true,
    size: 85000,
    timestamp: 1621234567890,
    priority: 'high'
  },
  'stitch-add-2': {
    cached: true,
    size: 92000,
    timestamp: 1621234567890,
    priority: 'high'
  },
  'stitch-mult-3': {
    cached: false
  }
};
```

## Error Scenarios

### Content Not Found

**Input:**
```typescript
const input = {
  contentId: 'nonexistent-content'
};
```

**Expected Error:**
```
Error: CONTENT_NOT_FOUND - The specified content was not found
```

### Storage Quota Exceeded

**Input:**
```typescript
const input = {
  contentIds: ['large-content-1', 'large-content-2', 'large-content-3'],
  options: {
    priority: 'high'
  }
};
```

**Expected Error:**
```
Error: QUOTA_EXCEEDED - Storage quota exceeded
```

### Invalid Content ID

**Input:**
```typescript
const input = {
  contentId: ''
};
```

**Expected Error:**
```
Error: INVALID_CONTENT_ID - Content ID cannot be empty
```

### Fetch Error

**Input:**
```typescript
const input = {
  contentIds: ['stitch-network-error'],
  options: {
    priority: 'high'
  }
};
```

**Expected Error:**
```
Error: FETCH_ERROR - Failed to fetch content from server
```

## Validation Criteria

### OS-003: Content Caching Efficiency

The ContentCache component must efficiently cache and retrieve content for offline use. This means:

1. Content must be cached with minimal storage overhead
2. Retrieval of cached content must be fast and efficient
3. The component must handle large content sets without performance degradation
4. Caching operations must be optimized to minimize battery and network usage

### OS-005: Offline Functionality

The application must function correctly without an internet connection, using cached content and local storage. This means:

1. All essential content must be available offline through the cache
2. The component must prioritize caching of content that is likely to be needed
3. The user experience must be seamless when transitioning between online and offline modes
4. The component must manage cache size to ensure efficient use of device storage

## Implementation Notes

### Content Caching Strategy

The implementation should use a structured approach to content caching:

```typescript
class ContentCache implements ContentCachingInterface {
  private readonly CACHE_PREFIX = "zenjin-content-cache";
  private readonly DEFAULT_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days
  private readonly MAX_CACHE_SIZE = 100 * 1024 * 1024; // 100MB
  
  constructor(private offlineStorage: OfflineStorageInterface) {}
  
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
    const stats = await this.offlineStorage.getStorageStats("system");
    const availableSpace = this.MAX_CACHE_SIZE - stats.totalSize;
    
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
        
        // Calculate content size
        const contentSize = this.calculateContentSize(content);
        
        // Check if we have enough space
        if (contentSize > availableSpace) {
          // Try to free up space
          const freedSpace = await this.freeUpSpace(contentSize - availableSpace, options?.priority || 'medium');
          
          if (freedSpace < contentSize - availableSpace) {
            throw new Error("QUOTA_EXCEEDED - Not enough storage space available");
          }
        }
        
        // Store content in offline storage
        const key = `${this.CACHE_PREFIX}:${contentId}`;
        const ttl = options?.ttl || this.DEFAULT_TTL;
        const expirationDate = new Date(Date.now() + ttl).toISOString();
        
        const success = await this.offlineStorage.setItem("system", key, {
          content,
          metadata: {
            contentId,
            size: contentSize,
            timestamp: Date.now(),
            priority: options?.priority || 'medium'
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
  
  // Implementation of other interface methods...
  
  private async fetchContentFromServer(contentId: string): Promise<any> {
    // Implementation to fetch content from server
    // This would be replaced with actual API calls in the real implementation
    return {};
  }
  
  private calculateContentSize(content: any): number {
    // Calculate size of content in bytes
    return JSON.stringify(content).length * 2; // Rough estimate
  }
  
  private prioritizeContent(contentIds: string[], basePriority: string): string[] {
    // Implement prioritization logic
    // This could be based on learning path position, content type, etc.
    return contentIds;
  }
  
  private async freeUpSpace(requiredSpace: number, newContentPriority: string): Promise<number> {
    // Implement space freeing logic
    // This should remove lowest priority content first
    return 0;
  }
}
```

### Content Prefetching Strategy

Implement intelligent prefetching to ensure content is available when needed:

```typescript
class ContentPrefetcher {
  private readonly PREFETCH_AHEAD_TIME = 30 * 60 * 1000; // 30 minutes of content
  
  constructor(
    private contentCache: ContentCachingInterface,
    private learningPathProvider: LearningPathProvider
  ) {}
  
  async prefetchContentForUser(userId: string): Promise<void> {
    try {
      // Get user's current position in learning path
      const currentPosition = await this.learningPathProvider.getCurrentPosition(userId);
      
      // Get content IDs for the next 30 minutes of learning
      const contentIds = await this.learningPathProvider.getContentIdsAhead(
        userId,
        currentPosition,
        this.PREFETCH_AHEAD_TIME
      );
      
      // Cache content with high priority
      await this.contentCache.cacheContent(contentIds, { priority: 'high' });
      
      // Get additional recommended content with medium priority
      const recommendedContentIds = await this.learningPathProvider.getRecommendedContent(userId);
      
      // Cache recommended content with medium priority
      await this.contentCache.cacheContent(recommendedContentIds, { priority: 'medium' });
      
      console.log(`Prefetched ${contentIds.length} essential and ${recommendedContentIds.length} recommended content items`);
    } catch (error) {
      console.error("Error during content prefetching:", error);
    }
  }
}

interface LearningPathProvider {
  getCurrentPosition(userId: string): Promise<any>;
  getContentIdsAhead(userId: string, currentPosition: any, timeAhead: number): Promise<string[]>;
  getRecommendedContent(userId: string): Promise<string[]>;
}
```

### Cache Eviction Strategy

Implement an intelligent cache eviction policy:

```typescript
class CacheEvictionManager {
  constructor(private offlineStorage: OfflineStorageInterface) {}
  
  async evictContent(requiredSpace: number, newContentPriority: string): Promise<number> {
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
      const key = `zenjin-content-cache:${item.metadata.contentId}`;
      const success = await this.offlineStorage.removeItem("system", key);
      
      if (success) {
        freedSpace += item.metadata.size;
      }
    }
    
    return freedSpace;
  }
  
  private async getAllCachedContentMetadata(): Promise<Array<{
    key: string;
    metadata: {
      contentId: string;
      size: number;
      timestamp: number;
      priority: string;
    };
  }>> {
    // Implementation to get all cached content metadata
    // This would query the offline storage for all cache entries
    return [];
  }
  
  private sortByEvictionPriority(
    content: Array<{
      key: string;
      metadata: {
        contentId: string;
        size: number;
        timestamp: number;
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
}
```

### Content Compression Strategy

Implement compression for text-based content to optimize storage:

```typescript
class ContentCompressor {
  async compressContent(content: any): Promise<ArrayBuffer> {
    // Convert content to string
    const contentString = JSON.stringify(content);
    
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
      // In a real implementation, you might use a JS-based compression library
      return contentBytes.buffer;
    }
  }
  
  async decompressContent(compressedData: ArrayBuffer): Promise<any> {
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
      const decompressedString = new TextDecoder().decode(compressedData);
      return JSON.parse(decompressedString);
    }
  }
}
```

## Usage Example

```typescript
// Example usage of ContentCache component
import { ContentCache } from './components/ContentCache';
import { OfflineStorage } from './components/OfflineStorage';

// Initialize dependencies
const offlineStorage = new OfflineStorage();

// Initialize the content cache
const contentCache = new ContentCache(offlineStorage);

// Cache content for offline use
async function cacheEssentialContent() {
  try {
    // Get content IDs for the current learning path
    const contentIds = ['stitch-add-1', 'stitch-add-2', 'stitch-mult-1'];
    
    // Cache content with high priority
    const result = await contentCache.cacheContent(contentIds, { priority: 'high' });
    
    console.log(`Cached ${result.cachedCount} content items (${result.totalSize} bytes)`);
    
    if (result.failedCount > 0) {
      console.warn(`Failed to cache ${result.failedCount} items:`, result.failures);
    }
  } catch (error) {
    console.error('Error caching content:', error);
  }
}

// Retrieve cached content
async function displayCachedContent(contentId) {
  try {
    // Check if content is cached
    const isCached = contentCache.isCached(contentId);
    
    if (isCached) {
      // Get cached content
      const content = await contentCache.getCachedContent(contentId);
      
      // Display content
      console.log(`Content ${contentId}:`, content);
    } else {
      console.warn(`Content ${contentId} is not cached`);
    }
  } catch (error) {
    console.error('Error retrieving cached content:', error);
  }
}

// Check cache status
async function checkCacheStatus() {
  try {
    // Get cache status for specific content IDs
    const contentIds = ['stitch-add-1', 'stitch-add-2', 'stitch-mult-3'];
    const status = await contentCache.getCacheStatus(contentIds);
    
    // Display cache status
    for (const [contentId, contentStatus] of Object.entries(status)) {
      if (contentStatus.cached) {
        console.log(`${contentId}: Cached (${contentStatus.size} bytes, cached at ${new Date(contentStatus.timestamp).toLocaleString()})`);
      } else {
        console.log(`${contentId}: Not cached`);
      }
    }
  } catch (error) {
    console.error('Error checking cache status:', error);
  }
}

// Execute example functions
cacheEssentialContent()
  .then(() => displayCachedContent('stitch-add-1'))
  .then(() => checkCacheStatus());
```

## Implementation Considerations

### Browser Compatibility

The implementation should handle browser differences in storage and compression:

1. Use feature detection for advanced features like CompressionStream
2. Implement fallbacks for browsers with limited or no support for modern APIs
3. Test thoroughly across different browsers and versions
4. Handle Safari's quirks with IndexedDB in private browsing mode

### Mobile Optimization

For optimal mobile performance:

1. Minimize storage operations during critical user interactions
2. Implement efficient compression to reduce storage footprint
3. Be mindful of mobile data usage when fetching content for caching
4. Implement background caching using Service Workers where supported
5. Handle mobile-specific storage limitations and quotas

### Testing Strategy

The implementation should be tested with:

1. Unit tests for all public methods
2. Integration tests with mock content server
3. Performance tests with large content sets
4. Compatibility tests across browsers
5. Offline functionality tests
6. Storage quota tests

### Security Considerations

Consider the following security aspects:

1. Validate content integrity before and after caching
2. Implement access controls based on user ID
3. Handle sensitive content appropriately
4. Ensure cached content cannot be accessed by unauthorized users
5. Implement secure content invalidation when needed
