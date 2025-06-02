/**
 * ContentAdminInterface.ts
 * Generated from APML Interface Definition
 * Module: AdminSystem
 */

import { ContentManagerInterface } from './ContentManagerInterface';
import { PositionManagerInterface } from './PositionManagerInterface';
import { StitchGeneratorInterface } from './StitchGeneratorInterface';

/**
 * Conceptual grouping for batch stitch creation
 */
export interface StitchGroup {
  id: string;
  name: string;
  description: string;
  tube_id: TubeId;
  /** Template for generating multiple related stitches */
  concept_template: Record<string, any>;
  stitch_count: number;
  /** Where to place these stitches in the tube */
  position_range_start: number;
}

/**
 * Request to generate multiple stitches
 */
export interface BatchGenerationRequest {
  group_id: string;
  naming_pattern: string;
  position_strategy: string;
  preview_only: boolean;
}

/**
 * A stitch created by batch generation
 */
export interface GeneratedStitch {
  id: string;
  name: string;
  concept_type: string;
  concept_params: Record<string, any>;
  assigned_position: number;
  /** Fact IDs this stitch will use */
  fact_coverage: string[];
}

/**
 * A position change in the tube
 */
export interface TubePositionChange {
  stitch_id: string;
  old_position: number;
  new_position: number;
  reason: string;
}

/**
 * A deployment of content changes
 */
export interface ContentDeployment {
  id: string;
  timestamp: string;
  changes: Record<string, any>[];
  affected_users: number;
  deployed_by: string;
}

/**
 * Preview of questions from a stitch
 */
export interface StitchTestRun {
  stitch_id: string;
  boundary_level: number;
  questions: Record<string, any>[];
}

/**
 * Error codes for ContentAdminInterface
 */
export enum ContentAdminErrorCode {
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  POSITION_CONFLICT = 'POSITION_CONFLICT',
  FACT_COVERAGE_GAP = 'FACT_COVERAGE_GAP',
  DEPLOYMENT_VALIDATION_FAILED = 'DEPLOYMENT_VALIDATION_FAILED',
  ROLLBACK_FAILED = 'ROLLBACK_FAILED',
}

/**
 * ContentAdminInterface
 */
export interface ContentAdminInterface {
  /**
   * Create a conceptual group for batch stitch generation
   * @param group - group
   * @returns Created stitch group
   * @throws INSUFFICIENT_PERMISSIONS if User lacks admin permissions
   */
  createStitchGroup(group: StitchGroup): StitchGroup;

  /**
   * Generate multiple stitches from a group template
   * @param request - request
   * @returns Result
   * @throws FACT_COVERAGE_GAP if Not enough facts to support stitch generation
   */
  generateStitches(request: BatchGenerationRequest): { generated: any[]; warnings: any[]; fact_gaps: any[] };

  /**
   * Preview tube with proposed changes
   * @param tube_id - tube_id
   * @param changes - changes
   * @returns Result
   */
  previewTubePositions(tube_id: TubeId, changes: any[]): { current_state: PositionMap; proposed_state: PositionMap; affected_users: number; warnings: any[] };

  /**
   * Apply position changes to default tube configuration
   * @param tube_id - tube_id
   * @param changes - changes
   * @param deployment_note - deployment_note
   * @returns Deployment record
   * @throws POSITION_CONFLICT if Position changes would conflict with existing content
   * @throws DEPLOYMENT_VALIDATION_FAILED if Content deployment failed validation
   */
  applyTubePositionChanges(tube_id: TubeId, changes: any[], deployment_note: string): ContentDeployment;

  /**
   * Generate test questions from a stitch
   * @param stitch_id - stitch_id
   * @param boundary_level - boundary_level
   * @param user_context - Optional user ID for personalized preview
   * @returns Preview of 20 questions
   */
  testRunStitch(stitch_id: string, boundary_level: number, user_context?: string): StitchTestRun;

  /**
   * Analyze content coverage across tubes
   * @param include_gaps - include_gaps
   * @returns Result
   */
  getContentCoverage(include_gaps: boolean): { tubes: Record<string, any> };

  /**
   * Rollback a content deployment
   * @param deployment_id - deployment_id
   * @param reason - reason
   * @returns Rollback deployment record
   * @throws ROLLBACK_FAILED if Failed to rollback deployment
   */
  rollbackDeployment(deployment_id: string, reason: string): ContentDeployment;

  /**
   * Import multiple facts for stitch generation
   * @param facts - facts
   * @param validate_ids - validate_ids
   * @returns Result
   */
  importFactsBatch(facts: any[], validate_ids: boolean): { imported: number; skipped: number; errors: any[] };

}

// Export default interface
export default ContentAdminInterface;
