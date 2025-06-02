/**
 * CacheManagerInterface.ts
 * Generated from APML Interface Definition
 * Module: LearningEngine
 */

import { StitchManagerInterface } from './StitchManagerInterface';
import { StitchCacheInterface } from './StitchCacheInterface';
import { LiveAidManagerInterface } from './LiveAidManagerInterface';

/**
 * Metadata for cached content
 */
export interface CacheEntryMetadata {
  /** Unique cache identifier */
  cache_key: string;
  user_id: string;
  created_at: string;
  last_accessed_at: string;
  access_count: number;
  size_bytes: number;
  ttl_seconds: number;
  expires_at: string;
}

/**
 * Generic cached content wrapper
 */
export interface CachedContent {
  /** The cached data */
  data: T;
  metadata: CacheEntryMetadata;
  /** Associated tube status if applicable */
  tube_status: LiveAidStatus;
}

/**
 * Request to warm cache for PREPARING state
 */
export interface CacheWarmingRequest {
  user_id: string;
  tube_id: TubeId;
  /** Stitches to pre-warm */
  stitch_ids: StitchId[];
  priority: string;
  warming_strategy: string;
}

/**
 * Progress tracking for cache warming
 */
export interface CacheWarmingProgress {
  request_id: string;
  user_id: string;
  tube_id: TubeId;
  total_stitches: number;
  completed_stitches: number;
  progress: number;
  estimated_completion_time: string;
  failed_stitches: StitchId[];
}

/**
 * Strategy for cache invalidation
 */
export interface CacheInvalidationStrategy {
  strategy_type: string;
  /** For TTL strategy */
  ttl_seconds: number;
  /** For LRU strategy */
  max_entries: number;
  /** For boundary change strategy */
  boundary_threshold: number;
  custom_rules: string[];
}

/**
 * Result of cache invalidation
 */
export interface CacheInvalidationResult {
  invalidated_keys: string[];
  invalidation_reason: string;
  invalidation_timestamp: string;
  freed_memory_bytes: number;
  affected_users: string[];
}

/**
 * Cache performance statistics
 */
export interface CacheStorageStats {
  total_entries: number;
  total_size_bytes: number;
  /** Cache hit percentage (0-100) */
  hit_rate: number;
  /** Cache miss percentage (0-100) */
  miss_rate: number;
  /** Average access time in milliseconds */
  average_access_time: number;
  /** Memory usage percentage (0-100) */
  memory_utilization: number;
  /** Number of evictions due to size limits */
  eviction_count: number;
}

/**
 * Configuration for content preloading
 */
export interface PreloadConfiguration {
  user_id: string;
  tube_id: TubeId;
  /** How many stitches ahead to preload */
  preload_depth: number;
  preload_strategy: string;
  max_preload_size_bytes: number;
  priority_factors: {
    /** Weight for user's historical patterns */
    user_history: number;
    /** Weight for logical concept progression */
    concept_progression: number;
    /** Weight for performance requirements */
    performance_metrics: number;
  };
}

/**
 * Options for cache retrieval
 */
export interface CacheRetrievalOptions {
  /** Generate if not cached */
  fallback_to_generation: boolean;
  /** Accept expired entries */
  accept_stale: boolean;
  /** How stale is acceptable */
  max_stale_seconds: number;
  /** Refresh cache after serving stale */
  refresh_in_background: boolean;
}

/**
 * Error codes for CacheManagerInterface
 */
export enum CacheManagerErrorCode {
  CACHE_MISS = 'CACHE_MISS',
  CACHE_EXPIRED = 'CACHE_EXPIRED',
  CACHE_FULL = 'CACHE_FULL',
  PRELOAD_FAILED = 'PRELOAD_FAILED',
  WARMING_IN_PROGRESS = 'WARMING_IN_PROGRESS',
  INVALIDATION_FAILED = 'INVALIDATION_FAILED',
  STORAGE_LIMIT_EXCEEDED = 'STORAGE_LIMIT_EXCEEDED',
  INVALID_CACHE_KEY = 'INVALID_CACHE_KEY',
  SERIALIZATION_ERROR = 'SERIALIZATION_ERROR',
}

/**
 * CacheManagerInterface
 */
export interface CacheManagerInterface {
  /**
   * Preloads content for the PREPARING tube
   * @param config - config
   * @returns Result
   * @throws PRELOAD_FAILED if Preloading could not be completed
   * @throws STORAGE_LIMIT_EXCEEDED if Cache storage limit reached
   */
  preloadContent(config: PreloadConfiguration): { preloaded: boolean; cached_stitches: any[]; total_size_bytes: number; preload_duration: Promise<number }>;

  /**
   * Retrieves cached content (questions, stitches, etc.)
   * @param cache_key - cache_key
   * @param options - options
   * @returns Result
   * @throws CACHE_MISS if Content not found in cache
   * @throws CACHE_EXPIRED if Content exists but is expired
   */
  retrieveFromCache(cache_key: string, options: CacheRetrievalOptions): CachedContent<T>;

  /**
   * Stores content in cache with TTL support
   * @param cache_key - cache_key
   * @param data - data
   * @param ttl_seconds - ttl_seconds
   * @returns Result
   * @throws STORAGE_LIMIT_EXCEEDED if Cache storage limit reached
   * @throws SERIALIZATION_ERROR if Content cannot be serialized
   */
  storeInCache(cache_key: string, data: T, ttl_seconds: number): { stored: boolean; cache_key: string; expires_at: string; size_bytes: number };

  /**
   * Invalidates cache entries based on strategy
   * @param strategy - strategy
   * @param target_keys - target_keys
   * @returns Result
   * @throws INVALIDATION_FAILED if Invalidation process failed
   */
  invalidateCache(strategy: CacheInvalidationStrategy, target_keys: any[]): CacheInvalidationResult;

  /**
   * Warms cache for PREPARING state content
   * @param request - request
   * @returns Result
   * @throws WARMING_IN_PROGRESS if Another warming process is active
   * @throws STORAGE_LIMIT_EXCEEDED if Cache storage limit reached
   */
  warmCacheForPreparing(request: CacheWarmingRequest): Promise<CacheWarmingProgress>;

  /**
   * Gets current cache warming progress
   * @param user_id - user_id
   * @param request_id - request_id
   * @returns Result
   */
  getCacheWarmingProgress(user_id: string, request_id: string): any[];

  /**
   * Caches generated questions for performance
   * @param user_id - user_id
   * @param stitch_id - stitch_id
   * @param questions - questions
   * @returns Result
   * @throws STORAGE_LIMIT_EXCEEDED if Cache storage limit reached
   */
  cacheGeneratedQuestions(user_id: string, stitch_id: StitchId, questions: any[]): { cached: boolean; cache_key: string; question_count: number; expires_at: string };

  /**
   * Gets cached questions if available
   * @param user_id - user_id
   * @param stitch_id - stitch_id
   * @returns Result
   */
  getCachedQuestions(user_id: string, stitch_id: StitchId): any[];

  /**
   * Manages TTL expiration for cached entries
   * @param check_interval_seconds - check_interval_seconds
   * @returns Result
   */
  manageTTLExpiration(check_interval_seconds: number): { expired_count: number; freed_memory_bytes: number; next_check_time: string };

  /**
   * Gets cache storage statistics
   * @param user_id - For user-specific stats
   * @returns Result
   */
  getCacheStatistics(user_id: string): CacheStorageStats;

  /**
   * Optimizes cache based on usage patterns
   * @param user_id - user_id
   * @returns Result
   */
  optimizeCache(user_id: string): { optimized: boolean; evicted_entries: number; freed_memory_bytes: number; performance_improvement: number };

  /**
   * Clears all cache entries for a user
   * @param user_id - user_id
   * @returns Result
   */
  clearUserCache(user_id: string): { cleared: boolean; cleared_entries: number; freed_memory_bytes: number };

  /**
   * Builds cache key for consistent key generation
   * @param components - components
   * @returns Consistent cache key
   */
  buildCacheKey(components: any[]): string;

}

// Export default interface
export default CacheManagerInterface;
