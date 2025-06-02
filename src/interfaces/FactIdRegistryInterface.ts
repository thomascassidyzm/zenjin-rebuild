/**
 * FactIdRegistryInterface.ts
 * Generated from APML Interface Definition
 * Module: ContentRepository
 */

import { FactRepositoryInterface } from './FactRepositoryInterface';

/**
 * Simple fact identifier that describes the mathematical fact
 */
export interface FactId {
}

/**
 * Supported mathematical concept types
 */
export interface ConceptType {
}

/**
 * Mapping of concept types to prefixes
 */
export interface ConceptPrefix {
  multiplication: undefined;
  addition: undefined;
  subtraction: undefined;
  division: undefined;
  fraction: undefined;
  decimal: undefined;
  percentage: undefined;
  mixed_operation: undefined;
}

/**
 * Parameters for generating a fact ID
 */
export interface FactIdGenerationParams {
  concept_type: string;
  /** Concept-specific parameters */
  parameters: Record<string, any>;
  /** Separator character (e.g., '_' or '-') */
  separator: string;
}

/**
 * Result of parsing a fact ID
 */
export interface ParsedFactId {
  original_id: string;
  concept_type: string;
  concept_prefix: string;
  /** Extracted parameters (e.g., {operand1: 6, operand2: 7}) */
  parameters: Record<string, any>;
  /** Separator used in the ID */
  separator: string;
  is_valid: boolean;
}

/**
 * Result of fact ID validation
 */
export interface FactIdValidationResult {
  is_valid: boolean;
  /** Detected concept type if valid */
  concept_type: string;
  errors: string[];
  warnings: string[];
}

/**
 * Error codes for FactIdRegistryInterface
 */
export enum FactIdRegistryErrorCode {
  INVALID_CONCEPT_TYPE = 'INVALID_CONCEPT_TYPE',
  INVALID_PARAMETERS = 'INVALID_PARAMETERS',
  INVALID_FACT_ID_FORMAT = 'INVALID_FACT_ID_FORMAT',
  PARSING_ERROR = 'PARSING_ERROR',
  GENERATION_ERROR = 'GENERATION_ERROR',
  UNSUPPORTED_FORMAT = 'UNSUPPORTED_FORMAT',
  MISSING_REQUIRED_PARAMETER = 'MISSING_REQUIRED_PARAMETER',
}

/**
 * FactIdRegistryInterface
 */
export interface FactIdRegistryInterface {
  /**
   * Generate a standardized fact ID based on concept type and parameters
   * @param params - params
   * @returns Result
   * @throws INVALID_CONCEPT_TYPE if Concept type is not recognized
   * @throws INVALID_PARAMETERS if Parameters insufficient for ID generation
   * @throws GENERATION_ERROR if Unable to generate fact ID
   */
  generateFactId(params: FactIdGenerationParams): FactId;

  /**
   * Validate a fact ID format
   * @param fact_id - fact_id
   * @returns Result
   */
  validateFactId(fact_id: string): FactIdValidationResult;

  /**
   * Parse a fact ID to extract concept information
   * @param fact_id - fact_id
   * @returns Result
   * @throws PARSING_ERROR if Unable to parse fact ID
   * @throws INVALID_FACT_ID_FORMAT if Fact ID does not match any known format
   */
  parseFactId(fact_id: string): ParsedFactId;

  /**
   * Normalize a fact ID (e.g., different separators or formats)
   * @param fact_id - fact_id
   * @param target_separator - target_separator
   * @returns Result
   * @throws INVALID_FACT_ID_FORMAT if Fact ID does not match any known format
   * @throws PARSING_ERROR if Unable to parse fact ID
   */
  normalizeFactId(fact_id: string, target_separator: string): FactId;

  /**
   * Check if two fact IDs represent the same fact (format-agnostic)
   * @param fact_id1 - fact_id1
   * @param fact_id2 - fact_id2
   * @returns Result
   */
  areFactIdsEquivalent(fact_id1: string, fact_id2: string): boolean;

  /**
   * Get all valid concept type prefixes
   * @returns Map of concept types to their prefixes
   */
  getConceptPrefixes(): Record<string, any>;

  /**
   * Register a custom concept type with its prefix
   * @param concept_type - concept_type
   * @param prefix - prefix
   * @returns Result
   * @throws INVALID_CONCEPT_TYPE if Concept type is not recognized
   */
  registerConceptType(concept_type: string, prefix: string): boolean;

  /**
   * Get the expected parameter schema for a concept type
   * @param concept_type - concept_type
   * @returns JSON Schema for concept parameters
   * @throws INVALID_CONCEPT_TYPE if Concept type is not recognized
   */
  getParameterSchema(concept_type: string): Record<string, any>;

  /**
   * Generate a batch of fact IDs efficiently
   * @param params_list - params_list
   * @returns Result
   * @throws GENERATION_ERROR if Unable to generate fact ID
   */
  generateFactIdBatch(params_list: any[]): any[];

  /**
   * Generate a multiplication fact ID
   * @param operand1 - operand1
   * @param operand2 - operand2
   * @param separator - separator
   * @returns Result
   */
  generateMultiplicationId(operand1: number, operand2: number, separator: string): string;

  /**
   * Generate an addition fact ID
   * @param operand1 - operand1
   * @param operand2 - operand2
   * @param separator - separator
   * @returns Result
   */
  generateAdditionId(operand1: number, operand2: number, separator: string): string;

  /**
   * Check if a fact ID uses the legacy format
   * @param fact_id - fact_id
   * @returns Result
   */
  isLegacyFormat(fact_id: string): boolean;

  /**
   * Check if a fact ID uses the standard format
   * @param fact_id - fact_id
   * @returns Result
   */
  isStandardFormat(fact_id: string): boolean;

}

// Export default interface
export default FactIdRegistryInterface;
