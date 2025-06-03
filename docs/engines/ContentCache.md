# ContentCache Component

## Overview

The ContentCache component is responsible for managing the caching of content for offline use in the Zenjin Maths App. It ensures users can access learning materials without an internet connection, following a model similar to Spotify's offline content approach.

This component is a critical part of the OfflineSupport module, enabling seamless learning experiences regardless of connectivity status.

## Files

This implementation consists of four files:

1. `ContentCacheInterfaces.ts` - Contains all interface definitions
2. `ContentCache.ts` - Contains the ContentCache class implementation
3. `ContentCacheExample.ts` - Demonstrates example usage of the component
4. `README.md` - This documentation file

## Features

- **Spotify-like Offline Content Model**: Caches content ahead of time for offline access
- **Efficient Content Caching**: Minimizes storage usage and optimizes performance
- **Prioritized Content Management**: Supports high, medium, and low priority levels
- **Intelligent Cache Eviction**: Removes content based on priority, age, and size
- **Content Compression**: Compresses text-based content to reduce storage footprint
- **Cache Status Tracking**: Monitors cache status for all content items
- **Error Handling**: Comprehensive error handling with detailed failure information

## Usage Example

```typescript
import { ContentCache } from './ContentCache';
import { OfflineStorage } from '../OfflineStorage/OfflineStorage';

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
    const isCached = await contentCache.isCached(contentId);
    
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
```

## Implementation Considerations

### Storage Optimization

The component optimizes storage usage by:
- Compressing text-based content when beneficial
- Implementing intelligent cache eviction based on priority, age, and size
- Tracking and limiting total cache size

### Mobile Optimization

For optimal mobile performance:
- Minimizes storage operations during critical user interactions
- Implements efficient compression to reduce storage footprint
- Handles mobile-specific storage limitations and quotas

### Error Handling

The component implements robust error handling:
- Comprehensive error types with descriptive messages
- Detailed failure information for failed cache operations
- Graceful handling of storage quota exceeded errors

## Dependencies

- **OfflineStorage**: Required for persistent storage of cached content

## Validation Criteria

The implementation meets the following validation criteria:

### OS-003: Content Caching Efficiency

- Content is cached with minimal storage overhead through compression
- Retrieval of cached content is fast and efficient
- The component handles large content sets without performance degradation
- Caching operations are optimized to minimize battery and network usage

### OS-005: Offline Functionality

- Essential content is available offline through the cache
- The component prioritizes caching of content that is likely to be needed
- The user experience is seamless when transitioning between online and offline modes
- The component manages cache size to ensure efficient use of device storage