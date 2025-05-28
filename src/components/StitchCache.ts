/**
 * StitchCache.ts
 * Implementation of StitchCacheInterface
 * Following LIVE_AID_IMPLEMENTATION_ALGORITHMS.apml Cache Management Algorithms
 * 
 * Manages Live Aid cache state for zero-wait performance and handles cache invalidation
 * based on boundary level changes and other criteria.
 */

import StitchCacheInterface, {
  ReadyQuestion,
  ReadyStitch,
  TubeCacheState,
  LiveAidCacheState,
  CacheInvalidationCriteria,
  CachePerformanceMetrics,
  StitchCacheErrorCode
} from '../interfaces/StitchCacheInterface';
import { StitchId, TubeId } from '../interfaces/StitchManagerInterface';

/**
 * Implementation of Live Aid Cache State Management
 * Following LIVE_AID_IMPLEMENTATION_ALGORITHMS.apml Cache Management
 */
export class StitchCache implements StitchCacheInterface {
  private userCacheStates: Map<string, LiveAidCacheState>;
  private cacheMetrics: CachePerformanceMetrics;
  private cacheExpirationMs: number;
  
  constructor() {
    this.userCacheStates = new Map();
    this.cacheMetrics = this.initializeCacheMetrics();
    this.cacheExpirationMs = 24 * 60 * 60 * 1000; // 24 hours default
  }

  /**
   * Cache Hit Logic from LIVE_AID_IMPLEMENTATION_ALGORITHMS.apml
   * Step 2: Check if requested tube has READY status
   * Validate cache timestamp (not expired due to boundary level change)
   * Return ReadyStitch immediately if available
   */
  getReadyStitch(userId: string, tubeId: TubeId): ReadyStitch {
    const startTime = Date.now();
    
    try {
      // Check if requested tube has READY status
      const cacheState = this.getUserCacheState(userId);
      const tubeState = this.getTubeState(cacheState, tubeId);
      
      if (!tubeState.readyStitch) {
        this.recordCacheMiss();
        throw new Error(`${StitchCacheErrorCode.CACHE_MISS}: No ready stitch available for ${tubeId}`);
      }
      
      // Validate cache timestamp (not expired due to boundary level change)
      if (this.isCacheExpired(tubeState)) {
        this.recordCacheMiss();
        throw new Error(`${StitchCacheErrorCode.CACHE_EXPIRED}: Cache expired for ${tubeId}`);
      }
      
      // Return ReadyStitch immediately if available
      this.recordCacheHit(Date.now() - startTime);
      return tubeState.readyStitch;
      
    } catch (error) {
      this.recordCacheMiss();
      throw error;
    }
  }

  /**
   * Cache State Management from LIVE_AID_IMPLEMENTATION_ALGORITHMS.apml
   * Step 1: Cache state initialization and management
   */
  cacheReadyStitch(readyStitch: ReadyStitch, tubeId: TubeId): {
    cached: boolean;
    cacheTimestamp: string;
    validUntil: string;
  } {
    try {
      const userId = readyStitch.metadata.userId;
      const cacheState = this.getOrCreateUserCacheState(userId);
      
      // Update tube state with ready stitch
      const tubeState = this.getTubeState(cacheState, tubeId);
      const cacheTimestamp = new Date().toISOString();
      const validUntil = new Date(Date.now() + this.cacheExpirationMs).toISOString();
      
      tubeState.readyStitch = readyStitch;
      tubeState.lastCacheTime = cacheTimestamp;
      tubeState.cacheValidUntil = validUntil;
      tubeState.preparationProgress = 1.0;
      tubeState.preparingStitchId = undefined;
      
      return {
        cached: true,
        cacheTimestamp,
        validUntil
      };
      
    } catch (error) {
      throw new Error(`${StitchCacheErrorCode.PREPARATION_FAILED}: ${error.message}`);
    }
  }

  /**
   * Live Aid Cache State Management - Initialization
   * For new user: Set up three TubeCacheState objects
   * Tube 1: READY (pre-assembled stitch cached)
   * Tube 2: PREPARING (background assembly in progress)
   * Tube 3: LIVE (currently being consumed by user)
   */
  getLiveAidCacheState(userId: string): LiveAidCacheState {
    const cacheState = this.userCacheStates.get(userId);
    if (!cacheState) {
      throw new Error(`${StitchCacheErrorCode.USER_NOT_FOUND}: User ${userId} not found in cache`);
    }
    return cacheState;
  }

  /**
   * Cache Invalidation Decision Tree Algorithm
   * Following LIVE_AID_IMPLEMENTATION_ALGORITHMS.apml
   */
  invalidateCache(userId: string, criteria: CacheInvalidationCriteria): {
    invalidatedTubes: TubeId[];
    invalidationReason: string;
    invalidationTimestamp: string;
  } {
    const cacheState = this.getUserCacheState(userId);
    const invalidatedTubes: TubeId[] = [];
    let invalidationReason = "";
    
    // STEP 1: BOUNDARY LEVEL CHANGE DETECTION
    if (criteria.boundaryLevelChanged) {
      // If change detected: invalidate ALL cached content for user
      invalidatedTubes.push('tube1' as TubeId, 'tube2' as TubeId, 'tube3' as TubeId);
      this.clearAllTubesForUser(cacheState);
      invalidationReason = "Boundary level change detected";
    }
    
    // STEP 2: TEMPORAL INVALIDATION
    else if (this.shouldInvalidateByAge(cacheState, criteria.maxCacheAge)) {
      const expiredTubes = this.getExpiredTubes(cacheState, criteria.maxCacheAge);
      invalidatedTubes.push(...expiredTubes);
      this.clearExpiredTubes(cacheState, expiredTubes);
      invalidationReason = "Cache age exceeded maximum";
    }
    
    // STEP 3: PROGRESSION MILESTONE INVALIDATION
    else if (criteria.userProgressionEvent) {
      // Detect when user completes significant progression markers
      invalidatedTubes.push('tube1' as TubeId, 'tube2' as TubeId, 'tube3' as TubeId);
      this.clearAllTubesForUser(cacheState);
      invalidationReason = "User progression milestone reached";
    }
    
    // STEP 4: FORCE REFRESH
    else if (criteria.forceRefresh) {
      invalidatedTubes.push('tube1' as TubeId, 'tube2' as TubeId, 'tube3' as TubeId);
      this.clearAllTubesForUser(cacheState);
      invalidationReason = "Manual cache refresh requested";
    }
    
    const invalidationTimestamp = new Date().toISOString();
    
    // STEP 5: INVALIDATION NOTIFICATION
    this.notifyInvalidation(userId, invalidatedTubes, invalidationReason);
    
    return {
      invalidatedTubes,
      invalidationReason,
      invalidationTimestamp
    };
  }

  checkStitchAvailability(userId: string, tubeId: TubeId): {
    isReady: boolean;
    preparationProgress: number;
    estimatedReadyTime?: string;
  } {
    try {
      const cacheState = this.getUserCacheState(userId);
      const tubeState = this.getTubeState(cacheState, tubeId);
      
      const isReady = !!tubeState.readyStitch && !this.isCacheExpired(tubeState);
      const preparationProgress = tubeState.preparationProgress;
      
      let estimatedReadyTime: string | undefined;
      if (!isReady && preparationProgress < 1.0) {
        const remainingProgress = 1.0 - preparationProgress;
        const estimatedMs = remainingProgress * 2000; // 2 seconds total prep time
        estimatedReadyTime = new Date(Date.now() + estimatedMs).toISOString();
      }
      
      return {
        isReady,
        preparationProgress,
        estimatedReadyTime
      };
      
    } catch (error) {
      return {
        isReady: false,
        preparationProgress: 0.0
      };
    }
  }

  /**
   * Preload User Cache - Initial Setup
   * Following cache initialization pattern from LIVE_AID_IMPLEMENTATION_ALGORITHMS.apml
   */
  async preloadUserCache(userId: string): Promise<{
    preloaded: boolean;
    readyTubes: TubeId[];
    preparingTubes: TubeId[];
  }> {
    try {
      // Create initial cache state for user
      const cacheState = this.initializeUserCacheState(userId);
      this.userCacheStates.set(userId, cacheState);
      
      // Set initial tube states:
      // Tube 1: READY (will need background preparation)
      // Tube 2: PREPARING (background assembly in progress)
      // Tube 3: LIVE (currently being consumed - starts empty)
      
      const readyTubes: TubeId[] = [];
      const preparingTubes: TubeId[] = ['tube1' as TubeId, 'tube2' as TubeId];
      
      // Mark tubes as preparing (actual preparation handled by StitchPreparation)
      cacheState.tube1.preparationProgress = 0.0;
      cacheState.tube2.preparationProgress = 0.0;
      cacheState.tube3.preparationProgress = 0.0;
      
      return {
        preloaded: true,
        readyTubes,
        preparingTubes
      };
      
    } catch (error) {
      throw new Error(`${StitchCacheErrorCode.PREPARATION_FAILED}: Preload failed for user ${userId}`);
    }
  }

  getCacheMetrics(userId?: string): CachePerformanceMetrics {
    if (userId) {
      // Return user-specific metrics if needed
      return this.calculateUserSpecificMetrics(userId);
    }
    return this.cacheMetrics;
  }

  clearUserCache(userId: string): {
    cleared: boolean;
    clearedTubes: TubeId[];
    clearTimestamp: string;
  } {
    const cacheState = this.userCacheStates.get(userId);
    if (cacheState) {
      this.clearAllTubesForUser(cacheState);
      this.userCacheStates.delete(userId);
    }
    
    return {
      cleared: true,
      clearedTubes: ['tube1' as TubeId, 'tube2' as TubeId, 'tube3' as TubeId],
      clearTimestamp: new Date().toISOString()
    };
  }

  // Helper methods for cache management
  private initializeCacheMetrics(): CachePerformanceMetrics {
    return {
      cacheHitRate: 0.0,
      averagePreparationTime: 0.0,
      cacheMissCount: 0,
      backgroundPreparationSuccessRate: 0.0
    };
  }

  private getUserCacheState(userId: string): LiveAidCacheState {
    const cacheState = this.userCacheStates.get(userId);
    if (!cacheState) {
      throw new Error(`${StitchCacheErrorCode.USER_NOT_FOUND}: User ${userId} not found`);
    }
    return cacheState;
  }

  private getOrCreateUserCacheState(userId: string): LiveAidCacheState {
    let cacheState = this.userCacheStates.get(userId);
    if (!cacheState) {
      cacheState = this.initializeUserCacheState(userId);
      this.userCacheStates.set(userId, cacheState);
    }
    return cacheState;
  }

  private initializeUserCacheState(userId: string): LiveAidCacheState {
    return {
      userId,
      tube1: this.initializeTubeState('tube1' as TubeId),
      tube2: this.initializeTubeState('tube2' as TubeId),
      tube3: this.initializeTubeState('tube3' as TubeId),
      activeTubeId: 'tube1' as TubeId // Start with tube1
    };
  }

  private initializeTubeState(tubeId: TubeId): TubeCacheState {
    return {
      tubeId,
      preparationProgress: 0.0
    };
  }

  private getTubeState(cacheState: LiveAidCacheState, tubeId: TubeId): TubeCacheState {
    switch (tubeId) {
      case 'tube1': return cacheState.tube1;
      case 'tube2': return cacheState.tube2;
      case 'tube3': return cacheState.tube3;
      default:
        throw new Error(`${StitchCacheErrorCode.TUBE_NOT_FOUND}: Invalid tube ${tubeId}`);
    }
  }

  private isCacheExpired(tubeState: TubeCacheState): boolean {
    if (!tubeState.cacheValidUntil) return true;
    return new Date() > new Date(tubeState.cacheValidUntil);
  }

  private recordCacheHit(responseTime: number): void {
    // Update cache hit metrics
    this.cacheMetrics.cacheHitRate = this.calculateNewHitRate(true);
    // Update average response time for cache hits
  }

  private recordCacheMiss(): void {
    this.cacheMetrics.cacheMissCount++;
    this.cacheMetrics.cacheHitRate = this.calculateNewHitRate(false);
  }

  private calculateNewHitRate(wasHit: boolean): number {
    // Simple hit rate calculation - in production this would be more sophisticated
    const totalRequests = this.cacheMetrics.cacheMissCount + (wasHit ? 1 : 0);
    const hits = totalRequests - this.cacheMetrics.cacheMissCount;
    return totalRequests > 0 ? hits / totalRequests : 0;
  }

  private clearAllTubesForUser(cacheState: LiveAidCacheState): void {
    this.clearTubeState(cacheState.tube1);
    this.clearTubeState(cacheState.tube2);
    this.clearTubeState(cacheState.tube3);
  }

  private clearTubeState(tubeState: TubeCacheState): void {
    tubeState.readyStitch = undefined;
    tubeState.preparingStitchId = undefined;
    tubeState.preparationProgress = 0.0;
    tubeState.lastCacheTime = undefined;
    tubeState.cacheValidUntil = undefined;
  }

  private shouldInvalidateByAge(cacheState: LiveAidCacheState, maxAge: number): boolean {
    const now = Date.now();
    
    // Check if any tube has exceeded max age
    return [cacheState.tube1, cacheState.tube2, cacheState.tube3].some(tube => {
      if (!tube.lastCacheTime) return false;
      const cacheAge = now - new Date(tube.lastCacheTime).getTime();
      return cacheAge > maxAge;
    });
  }

  private getExpiredTubes(cacheState: LiveAidCacheState, maxAge: number): TubeId[] {
    const now = Date.now();
    const expiredTubes: TubeId[] = [];
    
    [cacheState.tube1, cacheState.tube2, cacheState.tube3].forEach(tube => {
      if (tube.lastCacheTime) {
        const cacheAge = now - new Date(tube.lastCacheTime).getTime();
        if (cacheAge > maxAge) {
          expiredTubes.push(tube.tubeId);
        }
      }
    });
    
    return expiredTubes;
  }

  private clearExpiredTubes(cacheState: LiveAidCacheState, expiredTubes: TubeId[]): void {
    expiredTubes.forEach(tubeId => {
      const tubeState = this.getTubeState(cacheState, tubeId);
      this.clearTubeState(tubeState);
    });
  }

  private notifyInvalidation(userId: string, invalidatedTubes: TubeId[], reason: string): void {
    // In a full implementation, this would notify LiveAidManager or other components
    console.log(`Cache invalidated for user ${userId}, tubes: ${invalidatedTubes.join(', ')}, reason: ${reason}`);
  }

  private calculateUserSpecificMetrics(userId: string): CachePerformanceMetrics {
    // In a full implementation, this would calculate user-specific metrics
    return this.cacheMetrics;
  }

  // Public methods for system integration
  
  /**
   * Updates preparation progress for a tube
   * Called by StitchPreparation during background assembly
   */
  updatePreparationProgress(userId: string, tubeId: TubeId, progress: number, stitchId?: StitchId): void {
    try {
      const cacheState = this.getUserCacheState(userId);
      const tubeState = this.getTubeState(cacheState, tubeId);
      
      tubeState.preparationProgress = progress;
      if (stitchId) {
        tubeState.preparingStitchId = stitchId;
      }
      
    } catch (error) {
      // Log error but don't throw - preparation progress updates should be non-blocking
      console.error(`Failed to update preparation progress: ${error.message}`);
    }
  }

  /**
   * Checks if background preparation is needed for any tubes
   * Used by LiveAidManager to trigger background preparation
   */
  getPreparationNeeds(userId: string): {
    tubesNeedingPreparation: TubeId[];
    urgentPreparations: TubeId[];
  } {
    try {
      const cacheState = this.getUserCacheState(userId);
      const tubesNeedingPreparation: TubeId[] = [];
      const urgentPreparations: TubeId[] = [];
      
      [cacheState.tube1, cacheState.tube2, cacheState.tube3].forEach(tube => {
        if (!tube.readyStitch || this.isCacheExpired(tube)) {
          tubesNeedingPreparation.push(tube.tubeId);
          
          // Mark as urgent if it's the active tube with no content
          if (tube.tubeId === cacheState.activeTubeId && !tube.readyStitch) {
            urgentPreparations.push(tube.tubeId);
          }
        }
      });
      
      return {
        tubesNeedingPreparation,
        urgentPreparations
      };
      
    } catch (error) {
      return {
        tubesNeedingPreparation: [],
        urgentPreparations: []
      };
    }
  }

  /**
   * Rotates the active tube for Live Aid rotation
   * Called by LiveAidManager during tube transitions
   */
  rotateActiveTube(userId: string, newActiveTubeId: TubeId): void {
    try {
      const cacheState = this.getUserCacheState(userId);
      cacheState.activeTubeId = newActiveTubeId;
      cacheState.lastRotationTime = new Date().toISOString();
      
    } catch (error) {
      console.error(`Failed to rotate active tube: ${error.message}`);
    }
  }
}

export default StitchCache;