/**
 * TripleHelixManagerInterface.ts
 * Generated from APML Interface Definition
 * Module: ProgressionSystem
 */

import { StitchManagerInterface } from './StitchManagerInterface';
import { PositionManagerInterface } from './PositionManagerInterface';

/**
 * Defines the contract for the TripleHelixManager component that manages 
 * three tubes and their rotation according to the Live Aid Stage Model. 
 * Each tube contains stitches at various positions using sparse position storage.
 * 
 * Key concepts:
 * - Three tubes (tube1, tube2, tube3) rotate through LIVE/READY/PREPARING states
 * - Sparse position storage allows positions up to 1000+ without memory waste
 * - Active stitch is always at position 1 in the LIVE tube
 */
/**
 * Identifier for a tube
 */
export type TubeId = "tube1" | "tube2" | "tube3";

/**
 * Current state of a single tube
 */
export interface TubeState {
  /** Tube identifier (tube1, tube2, or tube3) */
  tubeId: TubeId;
  /** Sparse position map: {[logicalPosition: number]: stitchId} */
  positions: { [logicalPosition: number]: string };
  /** Lowest occupied position in this tube */
  lowestPosition: number;
  /** Highest occupied position in this tube */
  highestPosition: number;
  /** The stitch at position 1 (if any) */
  activeStitchId?: string;
}

/**
 * Complete state of the triple helix for a user
 */
export interface TripleHelixState {
  /** User identifier */
  userId: string;
  /** Currently active tube number */
  activeTube: 1 | 2 | 3;
  /** State of tube 1 */
  tube1State: TubeState;
  /** State of tube 2 */
  tube2State: TubeState;
  /** State of tube 3 */
  tube3State: TubeState;
  /** ISO date string of last rotation */
  lastRotationTime?: string;
  /** Number of rotations performed */
  rotationCount: number;
  /** Live Aid status for each tube */
  liveAidStatus: {
    /** Tube currently LIVE */
    live: TubeId;
    /** Tube currently READY */
    ready: TubeId;
    /** Tube currently PREPARING */
    preparing: TubeId;
  };
}

/**
 * Result of a tube rotation operation
 */
export interface RotationResult {
  /** Previously active tube number */
  previousActiveTube: number;
  /** New active tube number */
  newActiveTube: number;
  /** Total rotations performed */
  rotationCount: number;
  /** Live Aid status changes */
  liveAidTransition: {
    oldLive: TubeId;
    newLive: TubeId;
    oldReady: TubeId;
    newReady: TubeId;
    oldPreparing: TubeId;
    newPreparing: TubeId;
  };
}

/**
 * Error codes for TripleHelixManagerInterface
 */
export enum TripleHelixManagerErrorCode {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  NO_TRIPLE_HELIX = 'NO_TRIPLE_HELIX',
  INVALID_TUBE_ID = 'INVALID_TUBE_ID',
  NO_ACTIVE_STITCH = 'NO_ACTIVE_STITCH',
  ROTATION_FAILED = 'ROTATION_FAILED',
  ALREADY_INITIALIZED = 'ALREADY_INITIALIZED',
  INITIALIZATION_FAILED = 'INITIALIZATION_FAILED',
}

/**
 * TripleHelixManagerInterface
 */
export interface TripleHelixManagerInterface {
  /**
   * Gets the currently active tube number for a user
   * @param userId - User identifier
   * @returns Active tube number (1, 2, or 3)
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws NO_TRIPLE_HELIX if No triple helix state exists for this user
   */
  getActiveTube(userId: string): 1 | 2 | 3;

  /**
   * Gets the state of a specific tube for a user
   * @param userId - User identifier
   * @param tubeId - Tube identifier
   * @returns State of the requested tube
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws INVALID_TUBE_ID if Invalid tube identifier
   * @throws NO_TRIPLE_HELIX if No triple helix state exists for this user
   */
  getTubeState(userId: string, tubeId: TubeId): TubeState;

  /**
   * Gets the active stitch (at position 1) in the currently active tube
   * @param userId - User identifier
   * @returns Result
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws NO_TRIPLE_HELIX if No triple helix state exists for this user
   * @throws NO_ACTIVE_STITCH if No stitch at position 1 in active tube
   */
  getActiveStitch(userId: string): { stitchId: string; tubeId: TubeId; position: number };

  /**
   * Rotates tubes: LIVE → PREPARING, READY → LIVE, PREPARING → READY
   * @param userId - User identifier
   * @returns Result
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws NO_TRIPLE_HELIX if No triple helix state exists for this user
   * @throws ROTATION_FAILED if Failed to rotate tubes
   */
  rotateTubes(userId: string): RotationResult;

  /**
   * Sets up initial triple helix state with default tube positions
   * @param userId - User identifier
   * @returns Result
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws ALREADY_INITIALIZED if Triple helix already initialized for this user
   * @throws INITIALIZATION_FAILED if Failed to initialize triple helix
   */
  initializeTripleHelix(userId: string): TripleHelixState;

  /**
   * Gets the complete triple helix state for a user
   * @param userId - User identifier
   * @returns Result
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws NO_TRIPLE_HELIX if No triple helix state exists for this user
   */
  getTripleHelixState(userId: string): TripleHelixState;

  /**
   * Gets current Live Aid status showing which tube is LIVE, READY, PREPARING
   * @param userId - User identifier
   * @returns Result
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws NO_TRIPLE_HELIX if No triple helix state exists for this user
   */
  getLiveAidStatus(userId: string): { live: TubeId; ready: TubeId; preparing: TubeId };

}

// Export default interface
export default TripleHelixManagerInterface;
