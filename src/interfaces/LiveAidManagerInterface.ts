/**
 * LiveAidManagerInterface.ts
 * Generated from APML Interface Definition
 * Module: ProgressionSystem
 * 
 * Defines the contract for the LiveAidManager component that coordinates
 * the PREPARING → READY → LIVE tube transitions for seamless performance.
 * Following APML Framework v1.4.2 and naming.apml conventions
 */

/**
 * Import types from other interfaces
 */
import { StitchId, TubeId } from './StitchManagerInterface';
import { ReadyStitch, TubeCacheState } from './StitchCacheInterface';

/**
 * Live Aid tube statuses
 */
export type LiveAidStatus = 'live' | 'ready' | 'preparing';

/**
 * Tube transition event
 */
export interface TubeTransition {
  fromStatus: LiveAidStatus;
  toStatus: LiveAidStatus;
  tubeId: TubeId;
  timestamp: string;
  triggerReason: string; // "stitch_completed", "user_rotation", "manual_trigger"
}

/**
 * Live Aid rotation result
 */
export interface LiveAidRotationResult {
  rotationId: string; // Unique rotation identifier
  previousLive: TubeId;
  newLive: TubeId;
  transitions: TubeTransition[]; // All three tube transitions
  rotationTimestamp: string;
  backgroundPreparationStarted: boolean; // Whether new PREPARING phase started
}

/**
 * Preparation request for background assembly
 */
export interface PreparationRequest {
  userId: string;
  tubeId: TubeId;
  nextStitchId: StitchId; // Which stitch to prepare
  priority: 'high' | 'normal' | 'low'; // Preparation priority
  estimatedCompletionTime?: number; // Expected prep time in milliseconds
}

/**
 * Preparation progress tracking
 */
export interface PreparationProgress {
  requestId: string;
  tubeId: TubeId;
  stitchId: StitchId;
  status: 'queued' | 'in_progress' | 'completed' | 'failed';
  progress: number; // 0.0 to 1.0
  startTime: string;
  estimatedCompleteTime?: string;
  actualCompleteTime?: string;
  errorMessage?: string;
}

/**
 * Live Aid system state for a user
 */
export interface LiveAidSystemState {
  userId: string;
  currentRotation: number; // How many rotations completed
  tubeStates: {
    [K in TubeId]: {
      status: LiveAidStatus;
      currentStitchId?: StitchId;
      cacheState: TubeCacheState;
      lastTransitionTime: string;
    };
  };
  activePreparations: PreparationProgress[]; // Background preparations in progress
  systemHealth: 'optimal' | 'degraded' | 'critical'; // Overall system performance
}

/**
 * Performance optimization metrics
 */
export interface LiveAidPerformanceMetrics {
  averageRotationTime: number; // Time to complete a rotation (ms)
  backgroundPreparationSuccessRate: number; // Success rate of background prep
  cacheHitRate: number; // Percentage of requests served instantly
  userWaitTime: number; // Average user wait time for content (should be ~0)
  systemThroughput: number; // Questions served per minute
}

/**
 * Error codes for LiveAidManagerInterface
 */
export enum LiveAidManagerErrorCode {
  ROTATION_FAILED = 'ROTATION_FAILED',
  NO_READY_CONTENT = 'NO_READY_CONTENT',
  PREPARATION_QUEUE_FULL = 'PREPARATION_QUEUE_FULL',
  INVALID_TUBE_STATE = 'INVALID_TUBE_STATE',
  BACKGROUND_PREPARATION_FAILED = 'BACKGROUND_PREPARATION_FAILED',
  USER_NOT_INITIALIZED = 'USER_NOT_INITIALIZED',
  CONCURRENT_ROTATION_CONFLICT = 'CONCURRENT_ROTATION_CONFLICT',
  SYSTEM_OVERLOAD = 'SYSTEM_OVERLOAD'
}

/**
 * LiveAidManagerInterface - Seamless Performance Coordination System
 * Following APML Framework v1.4.2 principles for zero-wait user experience
 */
export interface LiveAidManagerInterface {
  /**
   * Initiates Live Aid rotation (LIVE → PREPARING, READY → LIVE, PREPARING → READY)
   * @param userId - User identifier
   * @param triggerReason - What caused the rotation
   * @returns Rotation result with new tube states
   * @throws ROTATION_FAILED if Rotation could not be completed
   * @throws NO_READY_CONTENT if No READY tube available for promotion
   * @throws INVALID_TUBE_STATE if Tube states are inconsistent
   */
  rotateTubes(userId: string, triggerReason: string): Promise<LiveAidRotationResult>;

  /**
   * Gets current Live Aid system state for a user
   * @param userId - User identifier
   * @returns Complete system state including all tube statuses
   * @throws USER_NOT_INITIALIZED if User not found in Live Aid system
   */
  getLiveAidState(userId: string): LiveAidSystemState;

  /**
   * Requests background preparation of next stitch for a tube
   * @param request - Preparation request details
   * @returns Preparation tracking information
   * @throws PREPARATION_QUEUE_FULL if Background preparation queue is full
   * @throws BACKGROUND_PREPARATION_FAILED if Preparation could not start
   */
  requestBackgroundPreparation(request: PreparationRequest): Promise<PreparationProgress>;

  /**
   * Gets current background preparation progress
   * @param userId - User identifier
   * @param tubeId - Tube identifier (optional, for specific tube)
   * @returns Array of active preparation processes
   */
  getPreparationProgress(userId: string, tubeId?: TubeId): PreparationProgress[];

  /**
   * Initializes Live Aid system for a new user
   * @param userId - User identifier
   * @returns Initial system state with tubes set up
   * @throws USER_NOT_INITIALIZED if User initialization failed
   * @throws BACKGROUND_PREPARATION_FAILED if Initial preparation failed
   */
  initializeLiveAidSystem(userId: string): Promise<LiveAidSystemState>;

  /**
   * Forces immediate preparation of a specific stitch (emergency scenarios)
   * @param userId - User identifier
   * @param tubeId - Target tube
   * @param stitchId - Stitch to prepare immediately
   * @returns Emergency preparation result
   * @throws BACKGROUND_PREPARATION_FAILED if Emergency preparation failed
   */
  emergencyPreparation(userId: string, tubeId: TubeId, stitchId: StitchId): Promise<{
    prepared: boolean;
    preparationTime: number;
    readyStitch: ReadyStitch;
  }>;

  /**
   * Monitors system health and performance
   * @param userId - User identifier (optional, for user-specific metrics)
   * @returns Live Aid performance metrics
   */
  getPerformanceMetrics(userId?: string): LiveAidPerformanceMetrics;

  /**
   * Optimizes background preparation scheduling
   * @param userId - User identifier
   * @returns Optimization result with scheduling adjustments
   */
  optimizePreparationSchedule(userId: string): {
    optimized: boolean;
    adjustmentsMade: string[];
    expectedPerformanceImprovement: number;
  };

  /**
   * Handles system degradation scenarios (network issues, high load, etc.)
   * @param userId - User identifier
   * @param degradationType - Type of system degradation
   * @returns Degradation handling strategy applied
   */
  handleSystemDegradation(userId: string, degradationType: string): {
    strategyApplied: string;
    fallbackMeasures: string[];
    expectedRecoveryTime: number;
  };

}

// Export default interface
export default LiveAidManagerInterface;