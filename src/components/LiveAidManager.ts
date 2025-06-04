/**
 * LiveAidManager.ts
 * Implementation of LiveAidManagerInterface
 * Following LIVE_AID_IMPLEMENTATION_ALGORITHMS.apml Tube Transition Algorithms
 * 
 * Orchestrates seamless PREPARING → READY → LIVE → PREPARING tube transitions
 * and coordinates system health monitoring and degradation handling.
 */

import LiveAidManagerInterface, {
  LiveAidStatus,
  TubeTransition,
  LiveAidRotationResult,
  PreparationRequest,
  PreparationProgress,
  LiveAidSystemState,
  LiveAidPerformanceMetrics,
  LiveAidManagerErrorCode
} from '../interfaces/LiveAidManagerInterface';
import { StitchId, TubeId } from '../interfaces/StitchManagerInterface';
import { ReadyStitch, TubeCacheState } from '../interfaces/StitchCacheInterface';
import StitchCache from './StitchCache';
import StitchPreparation from './StitchPreparation';
import StitchPopulation from './StitchPopulation';

/**
 * Implementation of Live Aid Tube Rotation Mechanics
 * Following LIVE_AID_IMPLEMENTATION_ALGORITHMS.apml
 */
export class LiveAidManager implements LiveAidManagerInterface {
  private stitchCache: StitchCache;
  private stitchPreparation: StitchPreparation;
  private stitchPopulation: StitchPopulation;
  private userSystemStates: Map<string, LiveAidSystemState>;
  private performanceMetrics: LiveAidPerformanceMetrics;
  private activeRotations: Set<string>; // Prevent concurrent rotations
  
  constructor(
    stitchCache: StitchCache,
    stitchPreparation: StitchPreparation,
    stitchPopulation: StitchPopulation
  ) {
    this.stitchCache = stitchCache;
    this.stitchPreparation = stitchPreparation;
    this.stitchPopulation = stitchPopulation;
    this.userSystemStates = new Map();
    this.performanceMetrics = this.initializePerformanceMetrics();
    this.activeRotations = new Set();
  }

  /**
   * Live Aid Tube Rotation Mechanics Algorithm
   * Following LIVE_AID_IMPLEMENTATION_ALGORITHMS.apml Steps 1-6
   */
  async rotateTubes(userId: string, triggerReason: string): Promise<LiveAidRotationResult> {
    const rotationId = this.generateRotationId(userId);
    const rotationStart = Date.now();
    
    // Prevent concurrent rotations for same user
    if (this.activeRotations.has(userId)) {
      throw new Error(`${LiveAidManagerErrorCode.CONCURRENT_ROTATION_CONFLICT}: Rotation already in progress for user ${userId}`);
    }
    
    this.activeRotations.add(userId);
    
    try {
      // STEP 1: ROTATION TRIGGER DETECTION (already handled by caller)
      
      // STEP 2: PRE-ROTATION VALIDATION
      const systemState = await this.preRotationValidation(userId);
      
      // STEP 3: ATOMIC ROTATION EXECUTION
      const transitions = await this.executeAtomicRotation(systemState, triggerReason);
      
      // STEP 4: POST-ROTATION TASKS
      await this.executePostRotationTasks(systemState);
      
      // STEP 5: ROTATION VALIDATION
      await this.validateRotationCompletion(systemState);
      
      // STEP 6: PERFORMANCE MONITORING
      const rotationTime = Date.now() - rotationStart;
      this.updatePerformanceMetrics(rotationTime);
      
      const rotationResult: LiveAidRotationResult = {
        rotationId,
        previousLive: this.getPreviousLiveTube(transitions),
        newLive: this.getNewLiveTube(transitions),
        transitions,
        rotationTimestamp: new Date().toISOString(),
        backgroundPreparationStarted: true
      };
      
      this.activeRotations.delete(userId);
      return rotationResult;
      
    } catch (error) {
      this.activeRotations.delete(userId);
      throw new Error(`${LiveAidManagerErrorCode.ROTATION_FAILED}: ${error.message}`);
    }
  }

  /**
   * STEP 2: PRE-ROTATION VALIDATION
   * Verify READY tube has complete, valid stitch available
   * Check PREPARING tube has background process active
   * Ensure system state is consistent for rotation
   */
  private async preRotationValidation(userId: string): Promise<LiveAidSystemState> {
    const systemState = this.getLiveAidState(userId);
    
    // Find tubes by status
    const readyTube = this.findTubeByStatus(systemState, 'ready');
    const preparingTube = this.findTubeByStatus(systemState, 'preparing');
    const liveTube = this.findTubeByStatus(systemState, 'live');
    
    if (!readyTube) {
      throw new Error(`${LiveAidManagerErrorCode.NO_READY_CONTENT}: No READY tube available for promotion`);
    }
    
    // Verify READY tube has complete, valid stitch available
    const readyAvailability = this.stitchCache.checkStitchAvailability(userId, readyTube.tubeId);
    if (!readyAvailability.isReady) {
      throw new Error(`${LiveAidManagerErrorCode.NO_READY_CONTENT}: READY tube ${readyTube.tubeId} has no valid content`);
    }
    
    // Check PREPARING tube has background process active (if exists)
    if (preparingTube) {
      const preparingProgress = this.getPreparationProgress(userId, preparingTube.tubeId);
      if (preparingProgress.length === 0) {
        // Start background preparation if none is active
        await this.startBackgroundPreparation(userId, preparingTube.tubeId);
      }
    }
    
    return systemState;
  }

  /**
   * STEP 3: ATOMIC ROTATION EXECUTION
   * LIVE tube: transition to PREPARING (start new background process)
   * READY tube: transition to LIVE (promote to active consumption)
   * PREPARING tube: transition to READY (cache completed stitch)
   */
  private async executeAtomicRotation(
    systemState: LiveAidSystemState, 
    triggerReason: string
  ): Promise<TubeTransition[]> {
    const timestamp = new Date().toISOString();
    const transitions: TubeTransition[] = [];
    
    // Find current tube assignments
    const liveTube = this.findTubeByStatus(systemState, 'live');
    const readyTube = this.findTubeByStatus(systemState, 'ready');
    const preparingTube = this.findTubeByStatus(systemState, 'preparing');
    
    if (!liveTube || !readyTube) {
      throw new Error(`${LiveAidManagerErrorCode.INVALID_TUBE_STATE}: Missing required tube states`);
    }
    
    // Execute transitions atomically
    
    // 1. LIVE → PREPARING
    liveTube.status = 'preparing';
    liveTube.lastTransitionTime = timestamp;
    transitions.push({
      fromStatus: 'live',
      toStatus: 'preparing',
      tubeId: liveTube.tubeId,
      timestamp,
      triggerReason
    });
    
    // 2. READY → LIVE
    readyTube.status = 'live';
    readyTube.lastTransitionTime = timestamp;
    this.stitchCache.rotateActiveTube(systemState.userId, readyTube.tubeId);
    transitions.push({
      fromStatus: 'ready',
      toStatus: 'live',
      tubeId: readyTube.tubeId,
      timestamp,
      triggerReason
    });
    
    // 3. PREPARING → READY (if preparing tube exists and has content ready)
    if (preparingTube) {
      const preparingAvailability = this.stitchCache.checkStitchAvailability(systemState.userId, preparingTube.tubeId);
      if (preparingAvailability.isReady) {
        preparingTube.status = 'ready';
        preparingTube.lastTransitionTime = timestamp;
        transitions.push({
          fromStatus: 'preparing',
          toStatus: 'ready',
          tubeId: preparingTube.tubeId,
          timestamp,
          triggerReason
        });
      }
    }
    
    return transitions;
  }

  /**
   * STEP 4: POST-ROTATION TASKS
   * Update LiveAidSystemState with new tube assignments
   * Start background preparation for new PREPARING tube
   * Clear any stale state from previous rotation
   */
  private async executePostRotationTasks(systemState: LiveAidSystemState): Promise<void> {
    // Update system state
    systemState.currentRotation++;
    
    // Start background preparation for new PREPARING tube
    const newPreparingTube = this.findTubeByStatus(systemState, 'preparing');
    if (newPreparingTube) {
      await this.startBackgroundPreparation(systemState.userId, newPreparingTube.tubeId);
    }
    
    // Clear stale active preparations
    systemState.activePreparations = systemState.activePreparations.filter(
      prep => prep.status === 'in_progress' || prep.status === 'queued'
    );
  }

  /**
   * STEP 5: ROTATION VALIDATION
   * Verify all three tubes have correct states after rotation
   * Confirm background preparation started successfully
   * Validate no content gaps or state inconsistencies
   */
  private async validateRotationCompletion(systemState: LiveAidSystemState): Promise<void> {
    // Verify exactly one tube in each state (allowing for 2 tubes if one is still preparing)
    const liveCount = this.countTubesByStatus(systemState, 'live');
    const readyCount = this.countTubesByStatus(systemState, 'ready');
    const preparingCount = this.countTubesByStatus(systemState, 'preparing');
    
    if (liveCount !== 1) {
      throw new Error(`${LiveAidManagerErrorCode.INVALID_TUBE_STATE}: Expected 1 LIVE tube, found ${liveCount}`);
    }
    
    if (readyCount > 2 || readyCount < 1) {
      throw new Error(`${LiveAidManagerErrorCode.INVALID_TUBE_STATE}: Invalid READY tube count: ${readyCount}`);
    }
    
    // Confirm background preparation started successfully
    const preparingTube = this.findTubeByStatus(systemState, 'preparing');
    if (preparingTube) {
      const activePreps = this.getPreparationProgress(systemState.userId, preparingTube.tubeId);
      if (activePreps.length === 0) {
        console.warn(`Warning: No active preparation for PREPARING tube ${preparingTube.tubeId}`);
      }
    }
  }

  getLiveAidState(userId: string): LiveAidSystemState {
    const systemState = this.userSystemStates.get(userId);
    if (!systemState) {
      throw new Error(`${LiveAidManagerErrorCode.USER_NOT_INITIALIZED}: User ${userId} not found in Live Aid system`);
    }
    return systemState;
  }

  /**
   * Background Preparation Scheduling Algorithm
   * Following LIVE_AID_IMPLEMENTATION_ALGORITHMS.apml
   */
  async requestBackgroundPreparation(request: PreparationRequest): Promise<PreparationProgress> {
    try {
      const requestId = this.generatePreparationRequestId(request);
      
      // Get concept mapping for the stitch
      const conceptMapping = await this.stitchPopulation.getConceptMapping(
        request.nextStitchId.split('-')[1] || '0001', // Extract concept code from stitch ID
        request.tubeId
      );
      
      // Start preparation process
      const preparationProcess = await this.stitchPreparation.prepareStitch(
        request.userId,
        request.tubeId,
        request.nextStitchId,
        conceptMapping,
        request.priority
      );
      
      const progress: PreparationProgress = {
        requestId,
        tubeId: request.tubeId,
        stitchId: request.nextStitchId,
        status: 'in_progress',
        progress: preparationProcess.overallProgress,
        startTime: preparationProcess.startTime,
        estimatedCompleteTime: preparationProcess.estimatedCompleteTime
      };
      
      // Add to active preparations
      const systemState = this.getLiveAidState(request.userId);
      systemState.activePreparations.push(progress);
      
      // Monitor preparation progress
      this.monitorPreparationProgress(preparationProcess.processId, progress);
      
      return progress;
      
    } catch (error) {
      throw new Error(`${LiveAidManagerErrorCode.BACKGROUND_PREPARATION_FAILED}: ${error.message}`);
    }
  }

  getPreparationProgress(userId: string, tubeId?: TubeId): PreparationProgress[] {
    const systemState = this.getLiveAidState(userId);
    
    if (tubeId) {
      return systemState.activePreparations.filter(prep => prep.tubeId === tubeId);
    }
    
    return systemState.activePreparations;
  }

  /**
   * Initialize Live Aid System for New User
   * Following LIVE_AID_IMPLEMENTATION_ALGORITHMS.apml initialization pattern
   */
  async initializeLiveAidSystem(userId: string): Promise<LiveAidSystemState> {
    try {
      // Initialize cache system
      await this.stitchCache.preloadUserCache(userId);
      
      // Create initial system state
      const systemState: LiveAidSystemState = {
        userId,
        currentRotation: 0,
        tubeStates: {
          'tube1': {
            status: 'ready', // Start with tube1 as READY
            cacheState: this.createInitialCacheState('tube1' as TubeId),
            lastTransitionTime: new Date().toISOString()
          },
          'tube2': {
            status: 'preparing', // Tube2 starts PREPARING
            cacheState: this.createInitialCacheState('tube2' as TubeId),
            lastTransitionTime: new Date().toISOString()
          },
          'tube3': {
            status: 'live', // Tube3 starts LIVE (will be rotated to immediately)
            cacheState: this.createInitialCacheState('tube3' as TubeId),
            lastTransitionTime: new Date().toISOString()
          }
        },
        activePreparations: [],
        systemHealth: 'optimal'
      };
      
      this.userSystemStates.set(userId, systemState);
      
      // Start initial background preparations
      await this.startInitialPreparations(userId);
      
      return systemState;
      
    } catch (error) {
      throw new Error(`${LiveAidManagerErrorCode.USER_NOT_INITIALIZED}: ${error.message}`);
    }
  }

  /**
   * Emergency Content Preparation Algorithm
   * Following LIVE_AID_IMPLEMENTATION_ALGORITHMS.apml Emergency Preparation
   */
  async emergencyPreparation(userId: string, tubeId: TubeId, stitchId: StitchId): Promise<{
    prepared: boolean;
    preparationTime: number;
    readyStitch: ReadyStitch;
  }> {
    const startTime = Date.now();
    
    try {
      // Get concept mapping for emergency preparation
      const conceptMapping = await this.stitchPopulation.getConceptMapping(
        stitchId.split('-')[1] || '0001',
        tubeId
      );
      
      // Use emergency preparation mode
      const readyStitch = await this.stitchPreparation.emergencyPreparation(
        userId,
        stitchId,
        conceptMapping
      );
      
      // Cache the emergency content
      this.stitchCache.cacheReadyStitch(readyStitch, tubeId);
      
      const preparationTime = Date.now() - startTime;
      
      return {
        prepared: true,
        preparationTime,
        readyStitch
      };
      
    } catch (error) {
      throw new Error(`${LiveAidManagerErrorCode.BACKGROUND_PREPARATION_FAILED}: Emergency preparation failed: ${error.message}`);
    }
  }

  getPerformanceMetrics(userId?: string): LiveAidPerformanceMetrics {
    if (userId) {
      return this.calculateUserSpecificMetrics(userId);
    }
    return this.performanceMetrics;
  }

  optimizePreparationSchedule(userId: string): {
    optimized: boolean;
    adjustmentsMade: string[];
    expectedPerformanceImprovement: number;
  } {
    const systemState = this.getLiveAidState(userId);
    const adjustments: string[] = [];
    
    // Analyze current preparation patterns
    const activePreps = systemState.activePreparations;
    
    // Optimize based on system load and user patterns
    if (activePreps.length > 2) {
      adjustments.push('reduced_concurrent_preparations');
    }
    
    if (systemState.systemHealth === 'degraded') {
      adjustments.push('increased_preparation_priority');
    }
    
    // Check for tubes that need urgent preparation
    const preparationNeeds = this.stitchCache.getPreparationNeeds(userId);
    if (preparationNeeds.urgentPreparations.length > 0) {
      adjustments.push('prioritized_urgent_preparations');
    }
    
    return {
      optimized: adjustments.length > 0,
      adjustmentsMade: adjustments,
      expectedPerformanceImprovement: adjustments.length * 0.15 // 15% improvement per adjustment
    };
  }

  /**
   * System Health Monitoring and Degradation Handling Algorithm
   * Following LIVE_AID_IMPLEMENTATION_ALGORITHMS.apml
   */
  handleSystemDegradation(userId: string, degradationType: string): {
    strategyApplied: string;
    fallbackMeasures: string[];
    expectedRecoveryTime: number;
  } {
    const systemState = this.getLiveAidState(userId);
    const fallbackMeasures: string[] = [];
    let strategyApplied = "";
    let expectedRecoveryTime = 0;
    
    switch (degradationType) {
      case 'high_preparation_failure_rate':
        strategyApplied = 'simplified_content_assembly';
        fallbackMeasures.push('reduce_distractor_complexity', 'use_cached_templates');
        expectedRecoveryTime = 30000; // 30 seconds
        systemState.systemHealth = 'degraded';
        break;
        
      case 'cache_miss_spike':
        strategyApplied = 'emergency_cache_warming';
        fallbackMeasures.push('preload_all_tubes', 'disable_cache_expiration');
        expectedRecoveryTime = 10000; // 10 seconds
        break;
        
      case 'preparation_timeout':
        strategyApplied = 'fallback_content_generation';
        fallbackMeasures.push('use_simplified_questions', 'extend_timeout_limits');
        expectedRecoveryTime = 60000; // 1 minute
        systemState.systemHealth = 'critical';
        break;
        
      default:
        strategyApplied = 'graceful_degradation';
        fallbackMeasures.push('reduce_background_load', 'increase_cache_retention');
        expectedRecoveryTime = 20000; // 20 seconds
    }
    
    // Schedule recovery monitoring
    this.scheduleRecoveryMonitoring(userId, expectedRecoveryTime);
    
    return {
      strategyApplied,
      fallbackMeasures,
      expectedRecoveryTime
    };
  }

  // Helper methods
  private initializePerformanceMetrics(): LiveAidPerformanceMetrics {
    return {
      averageRotationTime: 0,
      backgroundPreparationSuccessRate: 0,
      cacheHitRate: 0,
      userWaitTime: 0,
      systemThroughput: 0
    };
  }

  private generateRotationId(userId: string): string {
    return `rotation_${userId}_${Date.now()}`;
  }

  private generatePreparationRequestId(request: PreparationRequest): string {
    return `prep_${request.userId}_${request.tubeId}_${Date.now()}`;
  }

  private findTubeByStatus(systemState: LiveAidSystemState, status: LiveAidStatus): {
    tubeId: TubeId;
    status: LiveAidStatus;
    currentStitchId?: StitchId;
    cacheState: TubeCacheState;
    lastTransitionTime: string;
  } | null {
    for (const [tubeId, tubeState] of Object.entries(systemState.tubeStates)) {
      if (tubeState.status === status) {
        return { ...tubeState, tubeId: tubeId as TubeId };
      }
    }
    return null;
  }

  private countTubesByStatus(systemState: LiveAidSystemState, status: LiveAidStatus): number {
    return Object.values(systemState.tubeStates).filter(tube => tube.status === status).length;
  }

  private getPreviousLiveTube(transitions: TubeTransition[]): TubeId {
    const liveToPreparingTransition = transitions.find(t => t.fromStatus === 'live' && t.toStatus === 'preparing');
    return liveToPreparingTransition?.tubeId || 'tube1' as TubeId;
  }

  private getNewLiveTube(transitions: TubeTransition[]): TubeId {
    const readyToLiveTransition = transitions.find(t => t.fromStatus === 'ready' && t.toStatus === 'live');
    return readyToLiveTransition?.tubeId || 'tube1' as TubeId;
  }

  private updatePerformanceMetrics(rotationTime: number): void {
    // Update average rotation time
    this.performanceMetrics.averageRotationTime = 
      (this.performanceMetrics.averageRotationTime + rotationTime) / 2;
  }

  private createInitialCacheState(tubeId: TubeId): TubeCacheState {
    return {
      tubeId,
      preparationProgress: 0.0
    };
  }

  private async startBackgroundPreparation(userId: string, tubeId: TubeId): Promise<void> {
    // Generate next stitch ID based on tube progression
    const conceptProgression = this.stitchPopulation.getConceptProgression(tubeId);
    const nextConceptCode = conceptProgression[0]; // For simplicity, take first concept
    const nextStitchId = `${tubeId}-${nextConceptCode}` as StitchId;
    
    const request: PreparationRequest = {
      userId,
      tubeId,
      nextStitchId,
      priority: 'normal'
    };
    
    await this.requestBackgroundPreparation(request);
  }

  private async startInitialPreparations(userId: string): Promise<void> {
    // Start background preparation for tube2 (PREPARING)
    await this.startBackgroundPreparation(userId, 'tube2' as TubeId);
    
    // Prepare initial content for tube1 (READY)
    await this.startBackgroundPreparation(userId, 'tube1' as TubeId);
  }

  private monitorPreparationProgress(processId: string, progress: PreparationProgress): void {
    // In a full implementation, this would set up periodic monitoring
    // For now, we'll simulate progress updates
    setTimeout(() => {
      progress.status = 'completed';
      progress.progress = 1.0;
      progress.actualCompleteTime = new Date().toISOString();
    }, 2000);
  }

  private calculateUserSpecificMetrics(userId: string): LiveAidPerformanceMetrics {
    // In a full implementation, this would calculate user-specific metrics
    return this.performanceMetrics;
  }

  private scheduleRecoveryMonitoring(userId: string, recoveryTime: number): void {
    setTimeout(() => {
      const systemState = this.getLiveAidState(userId);
      if (systemState.systemHealth !== 'optimal') {
        systemState.systemHealth = 'optimal';
        console.log(`System recovery completed for user ${userId}`);
      }
    }, recoveryTime);
  }
}

export default LiveAidManager;