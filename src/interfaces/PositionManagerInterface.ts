/**
 * PositionManagerInterface.ts
 * Generated from APML Interface Definition
 * Module: ProgressionSystem
 */

import { StitchManagerInterface } from './StitchManagerInterface';
import { SpacedRepetitionSystemInterface } from './SpacedRepetitionSystemInterface';

/**
 * Position in the learning sequence (can be sparse)
 */
export interface LogicalPosition {
}

/**
 * Actual array index (continuous)
 */
export interface PhysicalPosition {
}

/**
 * Identifier for triple helix tubes
 */
export interface TubeId {
}

/**
 * Sparse map of logical positions to stitch IDs
 */
export interface PositionMap {
}

/**
 * Operation to move a stitch between positions
 */
export interface PositionMoveOperation {
  stitch_id: string;
  from_position: LogicalPosition;
  to_position: LogicalPosition;
  /** Whether to shift other stitches to make room */
  shift_others: boolean;
}

/**
 * Result of compressing sparse positions
 */
export interface CompressionResult {
  before: {
    total_positions: number;
    gaps: number;
    largest_position: number;
  };
  after: {
    total_positions: number;
    gaps: number;
    largest_position: number;
  };
  positions_changed: Record<string, any>[];
}

/**
 * Error codes for PositionManagerInterface
 */
export enum PositionManagerErrorCode {
  POSITION_OCCUPIED = 'POSITION_OCCUPIED',
  POSITION_NOT_FOUND = 'POSITION_NOT_FOUND',
  INVALID_POSITION_RANGE = 'INVALID_POSITION_RANGE',
  COMPRESSION_WOULD_BREAK_ORDERING = 'COMPRESSION_WOULD_BREAK_ORDERING',
  TUBE_NOT_FOUND = 'TUBE_NOT_FOUND',
}

/**
 * PositionManagerInterface
 */
export interface PositionManagerInterface {
  /**
   * Get the sparse position map for a tube
   * @param user_id - user_id
   * @param tube_id - tube_id
   * @returns Sparse map of logical positions to stitch IDs
   * @throws TUBE_NOT_FOUND if Specified tube does not exist
   */
  getPositionMap(user_id: string, tube_id: TubeId): PositionMap;

  /**
   * Get stitch at a specific logical position
   * @param user_id - user_id
   * @param tube_id - tube_id
   * @param position - position
   * @returns Stitch ID at that position
   * @throws POSITION_NOT_FOUND if No stitch found at specified position
   * @throws INVALID_POSITION_RANGE if Position is outside valid range
   */
  getStitchAtPosition(user_id: string, tube_id: TubeId, position: LogicalPosition): string;

  /**
   * Convert logical to physical position
   * @param user_id - user_id
   * @param tube_id - tube_id
   * @param logical_position - logical_position
   * @returns The physical position (1-based index)
   * @throws POSITION_NOT_FOUND if No stitch found at specified position
   */
  getPhysicalPosition(user_id: string, tube_id: TubeId, logical_position: LogicalPosition): PhysicalPosition;

  /**
   * Get the stitch at the lowest logical position (physical position 1)
   * @param user_id - user_id
   * @param tube_id - tube_id
   * @returns Result
   */
  getActiveStitch(user_id: string, tube_id: TubeId): { stitch_id: string; logical_position: LogicalPosition };

  /**
   * Move a stitch to a new position
   * @param user_id - user_id
   * @param tube_id - tube_id
   * @param operation - operation
   * @returns Updated position map
   * @throws POSITION_OCCUPIED if Target position is already occupied
   * @throws POSITION_NOT_FOUND if No stitch found at specified position
   * @throws INVALID_POSITION_RANGE if Position is outside valid range
   */
  moveStitch(user_id: string, tube_id: TubeId, operation: PositionMoveOperation): PositionMap;

  /**
   * Execute the spaced repetition repositioning algorithm
   * @param user_id - user_id
   * @param tube_id - tube_id
   * @param completed_stitch_id - completed_stitch_id
   * @param skip_number - skip_number
   * @returns Updated position map after repositioning
   */
  repositionForSpacedRepetition(user_id: string, tube_id: TubeId, completed_stitch_id: string, skip_number: number): PositionMap;

  /**
   * Remove gaps in position map while preserving order
   * @param user_id - user_id
   * @param tube_id - tube_id
   * @param dry_run - Preview compression without applying
   * @returns Details of the compression operation
   * @throws COMPRESSION_WOULD_BREAK_ORDERING if Compression would change relative stitch ordering
   */
  compressPositions(user_id: string, tube_id: TubeId, dry_run?: boolean): CompressionResult;

  /**
   * Initialize positions for a new user from defaults
   * @param user_id - user_id
   * @returns Initial position maps for all tubes
   */
  initializeDefaultPositions(user_id: string): { tube1: PositionMap; tube2: PositionMap; tube3: PositionMap };

}

// Export default interface
export default PositionManagerInterface;
