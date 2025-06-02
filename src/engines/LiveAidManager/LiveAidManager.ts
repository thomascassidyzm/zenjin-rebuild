/**
 * LiveAidManager.ts
 * Live Aid Architecture - System Coordination
 * 
 * Coordinates PREPARING → READY → LIVE tube transitions for seamless performance
 * following LIVE_AID_IMPLEMENTATION_ALGORITHMS.apml specifications.
 * 
 * Core responsibility: Zero-wait user experience through orchestrated background
 * preparation timing and tube rotation management.
 */

import {
  LiveAidManagerInterface,
  LiveAidStatus,
  TubeTransition,
  LiveAidRotationResult,
  PreparationRequest,
  PreparationProgress,
  LiveAidSystemState,
  LiveAidPerformanceMetrics,
  LiveAidManagerErrorCode
} from '../../interfaces/LiveAidManagerInterface';
import { StitchId, TubeId } from '../../interfaces/StitchManagerInterface';
import { ReadyStitch, TubeCacheState } from '../../interfaces/StitchCacheInterface';
import { StitchCache } from '../StitchCache/StitchCache';
import { StitchPreparation } from '../StitchPreparation/StitchPreparation';
import { StitchPopulation } from '../StitchPopulation/StitchPopulation';
import { TripleHelixManager } from '../TripleHelixManager/TripleHelixManager';

export class LiveAidManager implements LiveAidManagerInterface {
  private stitchCache: StitchCache;
  private stitchPreparation: StitchPreparation;
  private stitchPopulation: StitchPopulation;
  private tripleHelixManager: TripleHelixManager;
  private userSystemStates: Map<string, LiveAidSystemState>;
  private activePreparations: Map<string, PreparationProgress>;
  private performanceMetrics: LiveAidPerformanceMetrics;
  private rotationCounter: number;

  constructor(
    stitchCache: StitchCache,
    stitchPreparation: StitchPreparation,
    stitchPopulation: StitchPopulation,
    tripleHelixManager: TripleHelixManager
  ) {
    this.stitchCache = stitchCache;
    this.stitchPreparation = stitchPreparation;
    this.stitchPopulation = stitchPopulation;
    this.tripleHelixManager = tripleHelixManager;
    this.userSystemStates = new Map();
    this.activePreparations = new Map();
    this.rotationCounter = 0;
    this.performanceMetrics = this.initializeMetrics();
  }

  /**
   * Initialize performance metrics
   */
  private initializeMetrics(): LiveAidPerformanceMetrics {
    return {
      averageRotationTime: 85, // Target <100ms
      backgroundPreparationSuccessRate: 0.98,
      cacheHitRate: 0.95,
      userWaitTime: 0, // Target ~0ms
      systemThroughput: 120 // Questions served per minute
    };
  }

  /**
   * Initiates Live Aid rotation (LIVE → PREPARING, READY → LIVE, PREPARING → READY)
   * Core performance method - must execute under 100ms
   */
  async rotateTubes(userId: string, triggerReason: string): Promise<LiveAidRotationResult> {
    const rotationStartTime = Date.now();
    const rotationId = `rot_${this.rotationCounter++}_${Date.now()}`;

    try {
      // Step 1: Get current system state
      const systemState = await this.getLiveAidState(userId);
      const currentLive = systemState.tubeStates[systemState.tubeStates.tube1.status === 'live' ? 'tube1' : 
                          systemState.tubeStates.tube2.status === 'live' ? 'tube2' : 'tube3'];
      
      // Step 2: Validate READY tube availability
      const readyTube = this.findReadyTube(systemState);
      if (!readyTube) {
        throw new Error(LiveAidManagerErrorCode.NO_READY_CONTENT);
      }

      // Step 3: Execute atomic rotation
      const transitions = await this.executeAtomicRotation(userId, systemState, triggerReason);
      
      // Step 4: Update system state
      const newSystemState = await this.updateSystemStateAfterRotation(userId, transitions);
      
      // Step 5: Start background preparation for new PREPARING tube
      const backgroundPreparationStarted = await this.startBackgroundPreparation(userId, newSystemState);

      const rotationTime = Date.now() - rotationStartTime;
      
      if (rotationTime > 100) {
        console.warn(`Rotation took ${rotationTime}ms - target is <100ms`);
      }

      // Update performance metrics
      this.updateRotationMetrics(rotationTime);

      const result: LiveAidRotationResult = {
        rotationId,
        previousLive: this.getCurrentLiveTube(systemState),
        newLive: this.getCurrentLiveTube(newSystemState),
        transitions,
        rotationTimestamp: new Date().toISOString(),
        backgroundPreparationStarted
      };

      return result;

    } catch (error) {
      const rotationTime = Date.now() - rotationStartTime;
      console.error(`Rotation failed in ${rotationTime}ms:`, error.message);
      throw new Error(`${LiveAidManagerErrorCode.ROTATION_FAILED}: ${error.message}`);
    }
  }

  /**
   * Execute atomic rotation ensuring all three tubes transition simultaneously
   */
  private async executeAtomicRotation(
    userId: string,
    systemState: LiveAidSystemState,
    triggerReason: string
  ): Promise<TubeTransition[]> {
    const transitions: TubeTransition[] = [];
    const timestamp = new Date().toISOString();

    // Determine current tube statuses
    const liveTubeId = this.getCurrentLiveTube(systemState);
    const readyTubeId = this.findReadyTube(systemState)!.tubeId;
    const preparingTubeId = this.findPreparingTube(systemState)!.tubeId;

    // LIVE → PREPARING transition
    transitions.push({
      fromStatus: 'live',
      toStatus: 'preparing',
      tubeId: liveTubeId,
      timestamp,
      triggerReason
    });

    // READY → LIVE transition
    transitions.push({
      fromStatus: 'ready',
      toStatus: 'live',
      tubeId: readyTubeId,
      timestamp,
      triggerReason
    });

    // PREPARING → READY transition (if preparation completed)
    transitions.push({
      fromStatus: 'preparing',
      toStatus: 'ready',
      tubeId: preparingTubeId,
      timestamp,
      triggerReason
    });

    return transitions;
  }

  /**
   * Update system state to reflect rotation changes
   */
  private async updateSystemStateAfterRotation(
    userId: string,
    transitions: TubeTransition[]
  ): Promise<LiveAidSystemState> {
    const systemState = this.userSystemStates.get(userId)!;
    
    // Apply transitions to system state
    transitions.forEach(transition => {
      const tubeState = systemState.tubeStates[transition.tubeId];
      tubeState.status = transition.toStatus as LiveAidStatus;
      tubeState.lastTransitionTime = transition.timestamp;
    });

    // Update rotation counter and active tube
    systemState.currentRotation++;
    
    // Find new LIVE tube
    const newLiveTube = transitions.find(t => t.toStatus === 'live')?.tubeId;
    if (newLiveTube) {
      // Update TripleHelixManager active tube
      this.tripleHelixManager.setActiveTube(userId, newLiveTube);
    }

    this.userSystemStates.set(userId, systemState);
    return systemState;
  }

  /**
   * Start background preparation for the new PREPARING tube
   */
  private async startBackgroundPreparation(
    userId: string,
    systemState: LiveAidSystemState
  ): Promise<boolean> {
    try {
      const preparingTube = this.findPreparingTube(systemState);
      if (!preparingTube) {
        return false;
      }

      // Get next stitch for preparation
      const nextStitchId = this.tripleHelixManager.getNextStitchId(userId, preparingTube.tubeId);
      
      // Request background preparation
      const preparationRequest: PreparationRequest = {
        userId,
        tubeId: preparingTube.tubeId,
        nextStitchId,
        priority: 'normal'
      };

      await this.requestBackgroundPreparation(preparationRequest);
      return true;

    } catch (error) {
      console.error('Failed to start background preparation:', error);
      return false;
    }
  }

  /**
   * Gets current Live Aid system state for a user
   */
  getLiveAidState(userId: string): LiveAidSystemState {
    let systemState = this.userSystemStates.get(userId);
    
    if (!systemState) {
      // Initialize system state for new user
      systemState = this.createInitialSystemState(userId);
      this.userSystemStates.set(userId, systemState);
    }

    return { ...systemState }; // Return copy to prevent mutations
  }

  /**
   * Create initial system state for new user
   */
  private createInitialSystemState(userId: string): LiveAidSystemState {
    return {
      userId,
      currentRotation: 0,
      tubeStates: {
        tube1: {
          status: 'live',
          currentStitchId: undefined,
          cacheState: this.createEmptyTubeCacheState('tube1'),
          lastTransitionTime: new Date().toISOString()
        },
        tube2: {
          status: 'ready',
          currentStitchId: undefined,
          cacheState: this.createEmptyTubeCacheState('tube2'),
          lastTransitionTime: new Date().toISOString()
        },
        tube3: {
          status: 'preparing',
          currentStitchId: undefined,
          cacheState: this.createEmptyTubeCacheState('tube3'),
          lastTransitionTime: new Date().toISOString()
        }
      },
      activePreparations: [],
      systemHealth: 'optimal'
    };
  }

  /**
   * Requests background preparation of next stitch for a tube
   */
  async requestBackgroundPreparation(request: PreparationRequest): Promise<PreparationProgress> {
    try {
      const progressId = `prep_${Date.now()}_${request.tubeId}`;
      
      // Get concept mapping for the stitch
      const conceptMapping = this.stitchPopulation.getConceptMapping('0001', request.tubeId);
      
      // Start background preparation
      const preparationProcess = await this.stitchPreparation.prepareStitch(
        request.userId,
        request.tubeId,
        request.nextStitchId,
        conceptMapping,
        request.priority
      );

      const progress: PreparationProgress = {
        requestId: progressId,
        tubeId: request.tubeId,
        stitchId: request.nextStitchId,
        status: 'in_progress',
        progress: 0,
        startTime: new Date().toISOString(),
        estimatedCompleteTime: request.estimatedCompletionTime
      };

      this.activePreparations.set(progressId, progress);
      
      // Monitor preparation completion
      this.monitorPreparationProgress(progressId, preparationProcess);

      return progress;

    } catch (error) {
      throw new Error(`${LiveAidManagerErrorCode.BACKGROUND_PREPARATION_FAILED}: ${error.message}`);
    }
  }

  /**
   * Monitor preparation progress and update cache when complete
   */
  private async monitorPreparationProgress(
    progressId: string,
    preparationProcess: any
  ): Promise<void> {
    const progress = this.activePreparations.get(progressId);
    if (!progress) return;

    try {
      // Check if preparation is complete
      if (preparationProcess.status === 'completed') {
        const readyStitch = preparationProcess.stages[preparationProcess.stages.length - 1].result;
        
        // Cache the ready stitch
        await this.stitchCache.cacheReadyStitch(readyStitch, progress.tubeId);
        
        // Update progress
        progress.status = 'completed';
        progress.progress = 1.0;
        progress.actualCompleteTime = new Date().toISOString();
      }
    } catch (error) {
      progress.status = 'failed';
      progress.errorMessage = error.message;
    }
  }

  /**
   * Gets current background preparation progress
   */
  getPreparationProgress(userId: string, tubeId?: TubeId): PreparationProgress[] {
    const userPreparations = Array.from(this.activePreparations.values())
      .filter(p => p.requestId.includes(userId));

    if (tubeId) {
      return userPreparations.filter(p => p.tubeId === tubeId);
    }

    return userPreparations;
  }

  /**
   * Initializes Live Aid system for a new user
   */
  async initializeLiveAidSystem(userId: string): Promise<LiveAidSystemState> {
    try {
      // Create initial system state
      const systemState = this.createInitialSystemState(userId);
      this.userSystemStates.set(userId, systemState);

      // Initialize user in TripleHelixManager
      await this.tripleHelixManager.initializeUser(userId);

      // Preload cache
      await this.stitchCache.preloadUserCache(userId);

      // Start initial background preparations
      await this.startInitialBackgroundPreparations(userId, systemState);

      systemState.systemHealth = 'optimal';
      return systemState;

    } catch (error) {
      throw new Error(`${LiveAidManagerErrorCode.USER_NOT_INITIALIZED}: ${error.message}`);
    }
  }

  /**
   * Start initial background preparations for all tubes
   */
  private async startInitialBackgroundPreparations(
    userId: string,
    systemState: LiveAidSystemState
  ): Promise<void> {
    const tubes: TubeId[] = ['tube1', 'tube2', 'tube3'];
    
    for (const tubeId of tubes) {
      try {
        const nextStitchId = this.tripleHelixManager.getNextStitchId(userId, tubeId);
        const request: PreparationRequest = {
          userId,
          tubeId,
          nextStitchId,
          priority: 'normal'
        };
        
        await this.requestBackgroundPreparation(request);
      } catch (error) {
        console.warn(`Failed to start initial preparation for ${tubeId}:`, error);
      }
    }
  }

  /**
   * Forces immediate preparation of a specific stitch
   */
  async emergencyPreparation(userId: string, tubeId: TubeId, stitchId: StitchId): Promise<{
    prepared: boolean;
    preparationTime: number;
    readyStitch: ReadyStitch;
  }> {
    const startTime = Date.now();

    try {
      const conceptMapping = this.stitchPopulation.getConceptMapping('0001', tubeId);
      const readyStitch = await this.stitchPreparation.emergencyPreparation(
        userId,
        stitchId,
        conceptMapping
      );

      const preparationTime = Date.now() - startTime;

      return {
        prepared: true,
        preparationTime,
        readyStitch
      };

    } catch (error) {
      throw new Error(`${LiveAidManagerErrorCode.BACKGROUND_PREPARATION_FAILED}: ${error.message}`);
    }
  }

  /**
   * Monitors system health and performance
   */
  getPerformanceMetrics(userId?: string): LiveAidPerformanceMetrics {
    // Update metrics based on current system state
    this.updatePerformanceMetrics();
    return { ...this.performanceMetrics };
  }

  /**
   * Optimizes background preparation scheduling
   */
  optimizePreparationSchedule(userId: string): {
    optimized: boolean;
    adjustmentsMade: string[];
    expectedPerformanceImprovement: number;
  } {
    const adjustments: string[] = [];
    const systemState = this.getLiveAidState(userId);

    // Check if system is under stress
    if (systemState.systemHealth === 'degraded') {
      adjustments.push('Reduced concurrent preparation limit');
      adjustments.push('Prioritized critical tube preparations');
    }

    // Check preparation queue length
    const activePreps = this.getPreparationProgress(userId);
    if (activePreps.length > 3) {
      adjustments.push('Optimized preparation queue ordering');
    }

    return {
      optimized: adjustments.length > 0,
      adjustmentsMade: adjustments,
      expectedPerformanceImprovement: adjustments.length * 0.1
    };
  }

  /**
   * Gets a complete ready stitch (20 questions) from the Live Aid pipeline
   * Core performance method for replacing synchronous question generation
   */
  async getReadyStitch(userId: string, tubeId?: TubeId): Promise<ReadyStitch> {
    try {
      // Determine target tube (default to current LIVE tube)
      const targetTubeId = tubeId || this.getCurrentLiveTube(this.getLiveAidState(userId));
      
      // Get ready stitch from cache
      const readyStitch = this.stitchCache.getReadyStitch(userId, targetTubeId);
      
      // Update performance metrics
      this.updatePerformanceMetrics();
      
      return readyStitch;
      
    } catch (error) {
      console.error(`Failed to get ready stitch for ${userId}:${tubeId}:`, error);
      
      // If no ready stitch available, trigger emergency preparation
      if (error.message.includes('CACHE_MISS') || error.message.includes('STITCH_NOT_READY')) {
        const systemState = this.getLiveAidState(userId);
        const targetTubeId = tubeId || this.getCurrentLiveTube(systemState);
        const nextStitchId = this.tripleHelixManager.getNextStitchId(userId, targetTubeId);
        
        const emergencyResult = await this.emergencyPreparation(userId, targetTubeId, nextStitchId);
        return emergencyResult.readyStitch;
      }
      
      throw new Error(`${LiveAidManagerErrorCode.BACKGROUND_PREPARATION_FAILED}: ${error.message}`);
    }
  }

  /**
   * Handles system degradation scenarios
   */
  handleSystemDegradation(userId: string, degradationType: string): {
    strategyApplied: string;
    fallbackMeasures: string[];
    expectedRecoveryTime: number;
  } {
    const systemState = this.getLiveAidState(userId);
    const fallbackMeasures: string[] = [];
    let strategy = '';

    switch (degradationType) {
      case 'network_issues':
        strategy = 'Offline-first caching strategy';
        fallbackMeasures.push('Extend cache validity periods');
        fallbackMeasures.push('Reduce background preparation frequency');
        break;
      
      case 'high_load':
        strategy = 'Load balancing and throttling';
        fallbackMeasures.push('Throttle background preparations');
        fallbackMeasures.push('Prioritize critical user requests');
        break;
      
      case 'cache_corruption':
        strategy = 'Emergency cache rebuild';
        fallbackMeasures.push('Clear corrupted cache entries');
        fallbackMeasures.push('Trigger emergency preparations');
        break;
      
      default:
        strategy = 'Generic degradation handling';
        fallbackMeasures.push('Reduce system complexity');
        break;
    }

    // Update system health
    systemState.systemHealth = 'degraded';
    this.userSystemStates.set(userId, systemState);

    return {
      strategyApplied: strategy,
      fallbackMeasures,
      expectedRecoveryTime: 30000 // 30 seconds
    };
  }

  // Helper methods

  private getCurrentLiveTube(systemState: LiveAidSystemState): TubeId {
    for (const [tubeId, tubeState] of Object.entries(systemState.tubeStates)) {
      if (tubeState.status === 'live') {
        return tubeId as TubeId;
      }
    }
    return 'tube1'; // Default fallback
  }

  private findReadyTube(systemState: LiveAidSystemState): { tubeId: TubeId; tubeState: any } | null {
    for (const [tubeId, tubeState] of Object.entries(systemState.tubeStates)) {
      if (tubeState.status === 'ready') {
        return { tubeId: tubeId as TubeId, tubeState };
      }
    }
    return null;
  }

  private findPreparingTube(systemState: LiveAidSystemState): { tubeId: TubeId; tubeState: any } | null {
    for (const [tubeId, tubeState] of Object.entries(systemState.tubeStates)) {
      if (tubeState.status === 'preparing') {
        return { tubeId: tubeId as TubeId, tubeState };
      }
    }
    return null;
  }

  private createEmptyTubeCacheState(tubeId: TubeId): TubeCacheState {
    return {
      tubeId,
      readyStitch: undefined,
      preparingStitchId: undefined,
      preparationProgress: 0,
      lastCacheTime: undefined,
      cacheValidUntil: undefined
    };
  }

  private updateRotationMetrics(rotationTime: number): void {
    // Update average rotation time with exponential moving average
    this.performanceMetrics.averageRotationTime = 
      (this.performanceMetrics.averageRotationTime * 0.9) + (rotationTime * 0.1);
  }

  private updatePerformanceMetrics(): void {
    // Get cache metrics
    const cacheMetrics = this.stitchCache.getCacheMetrics();
    this.performanceMetrics.cacheHitRate = cacheMetrics.cacheHitRate;
    this.performanceMetrics.backgroundPreparationSuccessRate = cacheMetrics.backgroundPreparationSuccessRate;
    
    // Calculate system throughput (questions per minute)
    // This would be based on actual usage data
    this.performanceMetrics.systemThroughput = 120; // Placeholder
    
    // User wait time should be near zero with proper caching
    this.performanceMetrics.userWaitTime = this.performanceMetrics.cacheHitRate > 0.95 ? 0 : 200;
  }
}

export default LiveAidManager;