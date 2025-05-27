/**
 * SpacedRepetitionSystemInterface.ts
 * Generated from APML Interface Definition
 * Module: ProgressionSystem
 * 
 * UPDATED: Tube-based architecture with position compression
 * Following APML Framework v1.4.2 and naming.apml conventions
 */

/**
 * Defines the contract for the SpacedRepetitionSystem component that implements 
 * the Stitch Repositioning Algorithm within tube positions.
 */
/**
 * Import types from other interfaces
 */
import { StitchId, TubeId, LogicalPosition, SessionResults, RepositionResult } from './StitchManagerInterface';

/**
 * Skip number progression sequence: [4, 8, 15, 30, 100, 1000]
 */
export type SkipSequence = readonly [4, 8, 15, 30, 100, 1000];
export type SkipNumber = 4 | 8 | 15 | 30 | 100 | 1000;

/**
 * Performance data for spaced repetition calculations
 */
export interface PerformanceData {
  correctCount: number; // Number of correct answers
  totalCount: number; // Total number of questions
  averageResponseTime: number; // Average response time in milliseconds
  completionDate: string; // ISO date string of completion
  isPerfectScore: boolean; // Whether score was 20/20
}

/**
 * Compression operation result
 */
export interface CompressionResult {
  tubeId: TubeId;
  originalPositionCount: number;
  compressedPositionCount: number;
  gapsRemoved: number;
  compressionRatio: number;
  timestamp: string;
}

/**
 * Skip number calculation result
 */
export interface SkipCalculationResult {
  skipNumber: SkipNumber;
  isAdvancement: boolean; // Whether this advances in the sequence
  isReset: boolean; // Whether this resets to beginning
  consecutivePerfect: number; // Updated consecutive perfect count
  reasoning: string; // Explanation of calculation
}

/**
 * Error codes for SpacedRepetitionSystemInterface
 */
export enum SpacedRepetitionSystemErrorCode {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  STITCH_NOT_FOUND = 'STITCH_NOT_FOUND',
  TUBE_NOT_FOUND = 'TUBE_NOT_FOUND',
  INVALID_PERFORMANCE_DATA = 'INVALID_PERFORMANCE_DATA',
  REPOSITIONING_FAILED = 'REPOSITIONING_FAILED',
  NO_STITCHES_IN_TUBE = 'NO_STITCHES_IN_TUBE',
  COMPRESSION_FAILED = 'COMPRESSION_FAILED',
  INVALID_SKIP_NUMBER = 'INVALID_SKIP_NUMBER',
  POSITION_CONFLICT = 'POSITION_CONFLICT',
  STITCH_ALREADY_RETIRED = 'STITCH_ALREADY_RETIRED'
}

/**
 * SpacedRepetitionSystemInterface - Tube-based position management
 * Following APML Framework v1.4.2 principles
 */
export interface SpacedRepetitionSystemInterface {
  /**
   * Repositions a stitch within its tube based on the Stitch Repositioning Algorithm
   * Algorithm: If score = 20/20, move to position [skip number], else no change
   * @param userId - User identifier
   * @param stitchId - Stitch identifier
   * @param sessionResults - Session performance data
   * @returns Result of the repositioning operation
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws STITCH_NOT_FOUND if The specified stitch was not found
   * @throws INVALID_PERFORMANCE_DATA if The session results are invalid
   * @throws REPOSITIONING_FAILED if Failed to reposition the stitch
   * @throws STITCH_ALREADY_RETIRED if Stitch is already retired (skipNumber = 1000)
   */
  repositionStitch(userId: string, stitchId: StitchId, sessionResults: SessionResults): RepositionResult;

  /**
   * Calculates the next skip number based on performance and current progression
   * Sequence: [4, 8, 15, 30, 100, 1000] - advances on 20/20, resets on ≠20/20
   * @param currentSkipNumber - Current skip number
   * @param consecutivePerfect - Number of consecutive 20/20 scores
   * @param sessionResults - Latest session performance
   * @returns Skip calculation result
   * @throws INVALID_PERFORMANCE_DATA if The session results are invalid
   * @throws INVALID_SKIP_NUMBER if The current skip number is invalid
   */
  calculateSkipNumber(currentSkipNumber: SkipNumber, consecutivePerfect: number, sessionResults: SessionResults): SkipCalculationResult;

  /**
   * Applies the repositioning algorithm: temporarily assign position -1, 
   * shift positions 1 through [skip number] down one position,
   * place stitch at position [skip number]
   * @param tubeId - Tube identifier
   * @param stitchId - Stitch to reposition
   * @param skipNumber - Skip number for new position
   * @returns Repositioning operation result
   * @throws TUBE_NOT_FOUND if The specified tube was not found
   * @throws STITCH_NOT_FOUND if The specified stitch was not found
   * @throws REPOSITIONING_FAILED if Failed to execute repositioning
   */
  applyRepositioningAlgorithm(tubeId: TubeId, stitchId: StitchId, skipNumber: SkipNumber): RepositionResult;

  /**
   * Compresses tube positions to remove gaps (maintains logical position integrity)
   * @param tubeId - Tube identifier to compress
   * @returns Compression operation result
   * @throws TUBE_NOT_FOUND if The specified tube was not found
   * @throws COMPRESSION_FAILED if Failed to compress positions
   */
  compressTubePositions(tubeId: TubeId): CompressionResult;

  /**
   * Gets the current position order for a tube (sorted by logical position)
   * @param tubeId - Tube identifier
   * @returns Array of stitches in position order
   * @throws TUBE_NOT_FOUND if The specified tube was not found
   */
  getTubePositionOrder(tubeId: TubeId): Array<{ stitchId: StitchId; logicalPosition: LogicalPosition }>;

  /**
   * Gets all retired stitches (skipNumber = 1000) for monthly review
   * @param userId - User identifier
   * @returns Array of retired stitches across all tubes
   * @throws USER_NOT_FOUND if The specified user was not found
   */
  getRetiredStitches(userId: string): Array<{ stitchId: StitchId; tubeId: TubeId; retiredDate: string }>;

  /**
   * Gets the repositioning history for a specific stitch
   * @param userId - User identifier
   * @param stitchId - Stitch identifier
   * @param limit - Maximum number of history entries to return
   * @returns Array of repositioning history entries
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws STITCH_NOT_FOUND if The specified stitch was not found
   */
  getRepositioningHistory(userId: string, stitchId: StitchId, limit?: number): RepositionResult[];

  /**
   * Validates that the skip sequence is maintained correctly
   * @param currentSkipNumber - Current skip number
   * @param consecutivePerfect - Consecutive perfect scores
   * @returns Whether the progression is valid
   */
  validateSkipSequence(currentSkipNumber: SkipNumber, consecutivePerfect: number): boolean;

}

// Export default interface
export default SpacedRepetitionSystemInterface;
