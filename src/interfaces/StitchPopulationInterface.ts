/**
 * StitchPopulationInterface.ts
 * Generated from APML Interface Definition
 * Module: LearningEngine
 * 
 * Defines the contract for the StitchPopulation component that maps mathematical concepts
 * to specific stitches and populates them with appropriate facts from the FactRepository.
 * Following APML Framework v1.4.2 and naming.apml conventions
 */

/**
 * Import types from other interfaces
 */
import { StitchId, TubeId } from './StitchManagerInterface';

/**
 * Concept mapping for stitch population
 */
export interface ConceptMapping {
  conceptCode: string; // e.g., "0001", "0002", "0003"
  conceptName: string; // e.g., "doubling_0_5_endings", "multiplication_19x"
  tubeId: TubeId; // Which tube this concept belongs to
  factQuery: FactQuery; // How to query FactRepository for relevant facts
  questionFormat: QuestionFormat; // How to present questions to learners
}

/**
 * Query criteria for selecting facts from FactRepository
 */
export interface FactQuery {
  operation: string; // "multiplication", "doubling", "halving", etc.
  criteria: FactCriteria; // Specific selection criteria
  maxFacts: number; // Usually 20 for standard stitches
}

/**
 * Specific criteria for fact selection
 */
export interface FactCriteria {
  numberRange?: [number, number]; // Range of numbers to include
  numberEndings?: string[]; // Specific digit endings (e.g., ["0", "5"])
  tableNumber?: number; // For multiplication tables (e.g., 19 for 19x table)
  patternType?: string; // "even_tens", "odd_tens", "decimal_halves", etc.
  excludeFactIds?: string[]; // Specific facts to exclude
  includeFactIds?: string[]; // Specific facts to force include
}

/**
 * Question presentation format
 */
export interface QuestionFormat {
  template: string; // e.g., "{operand1} × {operand2}", "Double {number}", "Half of {number}"
  answerType: 'numeric' | 'algebraic'; // Answer format expected
  variableNotation?: string; // For algebra: "□", "n", "p", etc.
}

/**
 * Population strategy for a specific tube
 */
export interface TubePopulationStrategy {
  tubeId: TubeId;
  progressionType: 'forward' | 'backward' | 'complexity_based'; // How concepts are ordered
  conceptMappings: ConceptMapping[]; // All concepts in this tube
  surpriseRate: number; // Percentage of surprise stitches (e.g., 0.1 for 10%)
  surpriseConcepts: string[]; // Which concepts can be used as surprises
}

/**
 * Result of populating a single stitch
 */
export interface StitchPopulationResult {
  stitchId: StitchId;
  conceptCode: string;
  conceptName: string;
  factIds: string[]; // IDs of facts selected from FactRepository
  questionFormat: QuestionFormat;
  populationTimestamp: string;
  isSurprise: boolean; // Whether this was a surprise stitch
}

/**
 * Complete curriculum population result
 */
export interface CurriculumPopulationResult {
  tube1Stitches: StitchPopulationResult[];
  tube2Stitches: StitchPopulationResult[];
  tube3Stitches: StitchPopulationResult[];
  totalStitches: number;
  surpriseStitches: number;
  populationStrategy: string; // Description of strategy used
}

/**
 * Error codes for StitchPopulationInterface
 */
export enum StitchPopulationErrorCode {
  CONCEPT_NOT_FOUND = 'CONCEPT_NOT_FOUND',
  INSUFFICIENT_FACTS = 'INSUFFICIENT_FACTS',
  INVALID_TUBE_STRATEGY = 'INVALID_TUBE_STRATEGY',
  FACT_QUERY_FAILED = 'FACT_QUERY_FAILED',
  POPULATION_FAILED = 'POPULATION_FAILED',
  INVALID_CONCEPT_CODE = 'INVALID_CONCEPT_CODE',
  DUPLICATE_STITCH_ID = 'DUPLICATE_STITCH_ID',
  SURPRISE_RATE_INVALID = 'SURPRISE_RATE_INVALID'
}

/**
 * StitchPopulationInterface - Content Layer Population System
 * Following APML Framework v1.4.2 principles for clean separation architecture
 */
export interface StitchPopulationInterface {
  /**
   * Populates a single stitch with facts based on concept mapping
   * @param conceptMapping - How to select and format facts for this stitch
   * @param stitchId - Target stitch ID to populate
   * @returns Population result with selected facts and formatting
   * @throws CONCEPT_NOT_FOUND if The concept mapping is invalid
   * @throws INSUFFICIENT_FACTS if Not enough facts available for the criteria
   * @throws POPULATION_FAILED if Failed to populate the stitch
   */
  populateStitch(conceptMapping: ConceptMapping, stitchId: StitchId): Promise<StitchPopulationResult>;

  /**
   * Populates an entire tube following its progression strategy
   * @param strategy - Tube-specific population strategy
   * @returns Array of populated stitches for the tube
   * @throws INVALID_TUBE_STRATEGY if The strategy is invalid
   * @throws POPULATION_FAILED if Failed to populate the tube
   */
  populateTube(strategy: TubePopulationStrategy): Promise<StitchPopulationResult[]>;

  /**
   * Populates the complete curriculum across all three tubes
   * @returns Complete population result for all tubes
   * @throws POPULATION_FAILED if Failed to populate the curriculum
   */
  populateCompleteCurriculum(): Promise<CurriculumPopulationResult>;

  /**
   * Gets the concept mapping for a specific concept code
   * @param conceptCode - Concept code (e.g., "0001", "0019")
   * @param tubeId - Which tube to look in
   * @returns Concept mapping if found
   * @throws CONCEPT_NOT_FOUND if The concept code is not found
   * @throws INVALID_CONCEPT_CODE if The concept code format is invalid
   */
  getConceptMapping(conceptCode: string, tubeId: TubeId): Promise<ConceptMapping>;

  /**
   * Validates that sufficient facts exist for a concept mapping
   * @param conceptMapping - Concept mapping to validate
   * @returns Validation result with available fact count
   */
  validateConceptMapping(conceptMapping: ConceptMapping): {
    isValid: boolean;
    availableFactCount: number;
    requiredFactCount: number;
    missingCriteria?: string[];
  };

  /**
   * Generates surprise stitches based on tube strategy
   * @param strategy - Tube strategy containing surprise configuration
   * @param stitchCount - Total number of stitches in tube
   * @returns Array of surprise stitch positions and concepts
   * @throws SURPRISE_RATE_INVALID if Surprise rate is invalid
   */
  generateSurpriseStitches(strategy: TubePopulationStrategy, stitchCount: number): {
    position: number;
    conceptCode: string;
    stitchId: StitchId;
  }[];

  /**
   * Gets progression order for concepts in a tube
   * @param tubeId - Tube identifier
   * @returns Ordered list of concept codes following tube strategy
   * @throws INVALID_TUBE_STRATEGY if No strategy found for tube
   */
  getConceptProgression(tubeId: TubeId): string[];

}

// Export default interface
export default StitchPopulationInterface;