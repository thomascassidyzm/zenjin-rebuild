/**
 * SpacedRepetitionSystemInterface.ts
 * Generated from APML Interface Definition
 * Module: ProgressionSystem
 */

import { StitchManagerInterface } from './StitchManagerInterface';

/**
 * Defines the contract for the SpacedRepetitionSystem component that implements 
 * the Stitch Repositioning Algorithm within tube positions.
 * Tube-based architecture with position compression following APML Framework v1.4.2.
 */
/**
 * Valid skip numbers in the progression sequence
 */
export type SkipNumber = 4 | 8 | 15 | 30 | 100 | 1000;

/**
 * Performance data for spaced repetition calculations
 */
export interface PerformanceData {
  /** Number of correct answers */
  correctCount: number;
  /** Total number of questions */
  totalCount: number;
  /** Average response time in milliseconds */
  averageResponseTime: number;
  /** ISO date string of completion */
  completionDate: string;
  /** Whether score was 20/20 */
  isPerfectScore: boolean;
}

/**
 * Compression operation result
 */
export interface CompressionResult {
  /** Tube identifier */
  tubeId: string;
  /** Number of positions before compression */
  originalPositionCount: number;
  /** Number of positions after compression */
  compressedPositionCount: number;
  /** Number of gaps removed */
  gapsRemoved: number;
  /** Ratio of compression achieved */
  compressionRatio: number;
  /** When compression occurred */
  timestamp: string;
}

/**
 * Skip number calculation result
 */
export interface SkipCalculationResult {
  /** Calculated skip number */
  skipNumber: SkipNumber;
  /** Whether this advances in the sequence */
  isAdvancement: boolean;
  /** Whether this resets to beginning */
  isReset: boolean;
  /** Updated consecutive perfect count */
  consecutivePerfect: number;
  /** Explanation of calculation */
  reasoning: string;
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
  STITCH_ALREADY_RETIRED = 'STITCH_ALREADY_RETIRED',
}

/**
 * SpacedRepetitionSystemInterface
 */
export interface SpacedRepetitionSystemInterface {
  /**
   * Repositions a stitch within its tube based on the Stitch Repositioning Algorithm.
Algorithm: If score = 20/20, move to position [skip number], else no change

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
  repositionStitch(userId: string, stitchId: string, sessionResults: Record<string, any>): Record<string, any>;

  /**
   * Calculates the next skip number based on performance and current progression.
Sequence: [4, 8, 15, 30, 100, 1000] - advances on 20/20, resets on ≠20/20

   * @param currentSkipNumber - Current skip number
   * @param consecutivePerfect - Number of consecutive 20/20 scores
   * @param sessionResults - Latest session performance
   * @returns Skip calculation result
   * @throws INVALID_PERFORMANCE_DATA if The session results are invalid
   * @throws INVALID_SKIP_NUMBER if The skip number is invalid
   */
  calculateSkipNumber(currentSkipNumber: SkipNumber, consecutivePerfect: number, sessionResults: Record<string, any>): SkipCalculationResult;

  /**
   * Applies the repositioning algorithm: temporarily assign position -1, 
shift positions 1 through [skip number] down one position,
place stitch at position [skip number]

   * @param tubeId - Tube identifier
   * @param stitchId - Stitch to reposition
   * @param skipNumber - Skip number for new position
   * @returns Repositioning operation result
   * @throws TUBE_NOT_FOUND if The specified tube was not found
   * @throws STITCH_NOT_FOUND if The specified stitch was not found
   * @throws REPOSITIONING_FAILED if Failed to reposition the stitch
   */
  applyRepositioningAlgorithm(tubeId: string, stitchId: string, skipNumber: SkipNumber): Record<string, any>;

  /**
   * Compresses tube positions to remove gaps (maintains logical position integrity)
   * @param tubeId - Tube identifier to compress
   * @returns Compression operation result
   * @throws TUBE_NOT_FOUND if The specified tube was not found
   * @throws COMPRESSION_FAILED if Failed to compress positions
   */
  compressTubePositions(tubeId: string): CompressionResult;

  /**
   * Gets the current position order for a tube (sorted by logical position)
   * @param tubeId - Tube identifier
   * @returns Array of stitches in position order
   * @throws TUBE_NOT_FOUND if The specified tube was not found
   */
  getTubePositionOrder(tubeId: string): any[];

  /**
   * Gets all retired stitches (skipNumber = 1000) for monthly review
   * @param userId - User identifier
   * @returns Array of retired stitches across all tubes
   * @throws USER_NOT_FOUND if The specified user was not found
   */
  getRetiredStitches(userId: string): any[];

  /**
   * Gets the repositioning history for a specific stitch
   * @param userId - User identifier
   * @param stitchId - Stitch identifier
   * @param limit - Maximum number of history entries to return
   * @returns Array of repositioning history entries
   * @throws USER_NOT_FOUND if The specified user was not found
   * @throws STITCH_NOT_FOUND if The specified stitch was not found
   */
  getRepositioningHistory(userId: string, stitchId: string, limit?: number): any[];

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
