/**
 * StitchCacheInterface.ts
 * Generated from APML Interface Definition
 * Module: LearningEngine
 * 
 * Defines the contract for the StitchCache component that manages pre-assembled,
 * ready-to-stream stitch content for the Live Aid performance model.
 * Following APML Framework v1.4.2 and naming.apml conventions
 */

/**
 * Import types from other interfaces
 */
import { StitchId, TubeId } from './StitchManagerInterface';

/**
 * Complete, ready-to-display question (fully assembled)
 */
export interface ReadyQuestion {
  questionId: string; // Unique question instance ID
  questionText: string; // Minimal reading format: "Double 13", "19 × 4"
  correctAnswer: string; // Numeric answer: "26", "76"
  distractor: string; // Boundary-appropriate wrong answer: "24", "78"
  metadata: {
    conceptCode: string; // Which concept this question belongs to
    factId: string; // Source fact ID from FactRepository
    boundaryLevel: number; // Boundary level used for this question (1-5)
    questionFormat: string; // Question format template used
    assemblyTimestamp: string; // When this was assembled
  };
}

/**
 * Complete stitch ready for streaming playback
 */
export interface ReadyStitch {
  stitchId: StitchId;
  tubeId: TubeId;
  questions: ReadyQuestion[]; // 20 shuffled, complete questions
  metadata: {
    conceptName: string; // Human-readable concept
    boundaryLevel: number; // User's boundary level when assembled
    totalQuestions: number; // Should be 20 for standard stitches
    preparationTimestamp: string; // When fully assembled
    userId: string; // User this was prepared for
    isShuffled: boolean; // Confirms questions are in random order
    isSurprise: boolean; // Whether this was a surprise stitch
  };
}

/**
 * Cache state for a specific tube
 */
export interface TubeCacheState {
  tubeId: TubeId;
  readyStitch?: ReadyStitch; // Fully prepared stitch ready to stream
  preparingStitchId?: StitchId; // Stitch currently being assembled
  preparationProgress: number; // 0.0 to 1.0 completion of preparation
  lastCacheTime?: string; // When ready stitch was cached
  cacheValidUntil?: string; // When cache expires (boundary level changes)
}

/**
 * Complete Live Aid cache state for a user
 */
export interface LiveAidCacheState {
  userId: string;
  tube1: TubeCacheState;
  tube2: TubeCacheState;
  tube3: TubeCacheState;
  activeTubeId: TubeId; // Which tube is currently LIVE
  lastRotationTime?: string; // When tubes last rotated
}

/**
 * Cache invalidation criteria
 */
export interface CacheInvalidationCriteria {
  boundaryLevelChanged: boolean; // User's boundary level evolved
  maxCacheAge: number; // Maximum cache age in milliseconds
  userProgressionEvent: boolean; // Major progression milestone reached
  forceRefresh: boolean; // Manual cache refresh requested
}

/**
 * Cache performance metrics
 */
export interface CachePerformanceMetrics {
  cacheHitRate: number; // Percentage of requests served from cache
  averagePreparationTime: number; // Average time to prepare a stitch
  cacheMissCount: number; // Number of cache misses
  backgroundPreparationSuccessRate: number; // Success rate of background prep
}

/**
 * Error codes for StitchCacheInterface
 */
export enum StitchCacheErrorCode {
  CACHE_MISS = 'CACHE_MISS',
  STITCH_NOT_READY = 'STITCH_NOT_READY',
  CACHE_EXPIRED = 'CACHE_EXPIRED',
  PREPARATION_FAILED = 'PREPARATION_FAILED',
  INVALID_CACHE_STATE = 'INVALID_CACHE_STATE',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  TUBE_NOT_FOUND = 'TUBE_NOT_FOUND',
  CACHE_CORRUPTION = 'CACHE_CORRUPTION'
}

/**
 * StitchCacheInterface - Live Aid Performance Caching System
 * Following APML Framework v1.4.2 principles for smooth streaming performance
 */
export interface StitchCacheInterface {
  /**
   * Gets a ready-to-stream stitch from cache
   * @param userId - User identifier
   * @param tubeId - Tube identifier (should be READY or LIVE)
   * @returns Complete ready stitch for immediate playback
   * @throws CACHE_MISS if No ready stitch available in cache
   * @throws STITCH_NOT_READY if Stitch is still being prepared
   * @throws CACHE_EXPIRED if Cached stitch is no longer valid
   */
  getReadyStitch(userId: string, tubeId: TubeId): ReadyStitch;

  /**
   * Caches a complete ready stitch for a tube
   * @param readyStitch - Fully assembled stitch ready for streaming
   * @param tubeId - Target tube for caching
   * @returns Success confirmation with cache metadata
   * @throws PREPARATION_FAILED if Stitch preparation was incomplete
   * @throws INVALID_CACHE_STATE if Cache state is corrupted
   */
  cacheReadyStitch(readyStitch: ReadyStitch, tubeId: TubeId): {
    cached: boolean;
    cacheTimestamp: string;
    validUntil: string;
  };

  /**
   * Gets current Live Aid cache state for a user
   * @param userId - User identifier
   * @returns Complete cache state across all three tubes
   * @throws USER_NOT_FOUND if User not found in cache system
   */
  getLiveAidCacheState(userId: string): LiveAidCacheState;

  /**
   * Invalidates cache based on criteria (boundary level changes, etc.)
   * @param userId - User identifier
   * @param criteria - What triggered the invalidation
   * @returns List of cache entries that were invalidated
   */
  invalidateCache(userId: string, criteria: CacheInvalidationCriteria): {
    invalidatedTubes: TubeId[];
    invalidationReason: string;
    invalidationTimestamp: string;
  };

  /**
   * Checks if a tube has a ready stitch available
   * @param userId - User identifier
   * @param tubeId - Tube identifier
   * @returns Availability status and preparation progress
   */
  checkStitchAvailability(userId: string, tubeId: TubeId): {
    isReady: boolean;
    preparationProgress: number;
    estimatedReadyTime?: string;
  };

  /**
   * Preloads cache for user initialization (sets up initial READY stitches)
   * @param userId - User identifier
   * @returns Preload result with cache state
   * @throws PREPARATION_FAILED if Initial cache preparation failed
   */
  preloadUserCache(userId: string): Promise<{
    preloaded: boolean;
    readyTubes: TubeId[];
    preparingTubes: TubeId[];
  }>;

  /**
   * Gets cache performance metrics
   * @param userId - User identifier (optional, for user-specific metrics)
   * @returns Performance metrics for monitoring cache effectiveness
   */
  getCacheMetrics(userId?: string): CachePerformanceMetrics;

  /**
   * Clears all cache for a user (for testing or reset scenarios)
   * @param userId - User identifier
   * @returns Confirmation of cache clearance
   */
  clearUserCache(userId: string): {
    cleared: boolean;
    clearedTubes: TubeId[];
    clearTimestamp: string;
  };

}

// Export default interface
export default StitchCacheInterface;