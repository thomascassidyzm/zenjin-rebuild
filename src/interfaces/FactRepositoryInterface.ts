/**
 * FactRepositoryInterface.ts
 * Generated from APML Interface Definition
 * Module: ContentRepository
 */

import { FactIdRegistryInterface } from './FactIdRegistryInterface';
import { DistinctionManagerInterface } from './DistinctionManagerInterface';

/**
 * Atomic unit of knowledge with concept metadata
 */
export interface Fact {
  /** Unique fact identifier */
  id: string;
  /** Type of mathematical concept */
  concept_type: string;
  /** Concept-specific parameters */
  parameters: Record<string, any>;
  /** Correct answer for this fact */
  answer: any;
  metadata: {
    difficulty: number;
    tags: string[];
    /** Fact IDs that should be mastered first */
    prerequisites: string[];
    last_updated: string;
  };
}

/**
 * Criteria for querying facts by concept
 */
export interface FactQueryCriteria {
  concept_type: string;
  /** Partial match on concept parameters */
  parameters: Record<string, any>;
  tags: string[];
  difficulty_range: {
    min: number;
    max: number;
  };
  limit: number;
  offset: number;
}

/**
 * Result of a fact query operation
 */
export interface FactQueryResult {
  facts: Fact[];
  /** Total facts matching criteria */
  total: number;
  /** Whether more results are available */
  has_more: boolean;
}

/**
 * Result of fact validation
 */
export interface FactValidationResult {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Error codes for FactRepositoryInterface
 */
export enum FactRepositoryErrorCode {
  FACT_NOT_FOUND = 'FACT_NOT_FOUND',
  INVALID_CONCEPT_TYPE = 'INVALID_CONCEPT_TYPE',
  INVALID_PARAMETERS = 'INVALID_PARAMETERS',
  DUPLICATE_FACT = 'DUPLICATE_FACT',
  REPOSITORY_ERROR = 'REPOSITORY_ERROR',
  INVALID_QUERY = 'INVALID_QUERY',
}

/**
 * FactRepositoryInterface
 */
export interface FactRepositoryInterface {
  /**
   * Get a fact by its unique identifier
   * @param fact_id - fact_id
   * @returns Result
   * @throws FACT_NOT_FOUND if Specified fact does not exist
   */
  getFactById(fact_id: string): Fact;

  /**
   * Query facts by concept type and parameters
   * @param criteria - criteria
   * @returns Result
   * @throws INVALID_QUERY if Query criteria are invalid
   * @throws INVALID_CONCEPT_TYPE if Concept type is not recognized
   */
  queryFacts(criteria: FactQueryCriteria): FactQueryResult;

  /**
   * Check if a fact exists in the repository - CRITICAL MISSING METHOD
   * @param fact_id - fact_id
   * @returns True if fact exists, false otherwise
   */
  factExists(fact_id: string): boolean;

  /**
   * Get multiple facts by their IDs (batch operation)
   * @param fact_ids - fact_ids
   * @returns Result
   * @throws FACT_NOT_FOUND if Specified fact does not exist
   */
  getFactsByIds(fact_ids: any[]): any[];

  /**
   * Validate a fact's structure and content
   * @param fact - fact
   * @returns Result
   */
  validateFact(fact: Fact): FactValidationResult;

  /**
   * Check if facts are available for a given concept
   * @param concept_type - concept_type
   * @param parameters - parameters
   * @returns Result
   * @throws INVALID_CONCEPT_TYPE if Concept type is not recognized
   */
  hasFactsForConcept(concept_type: string, parameters: Record<string, any>): boolean;

  /**
   * Get all available concept types
   * @returns Result
   */
  getAvailableConceptTypes(): any[];

  /**
   * Get expected parameters for a concept type
   * @param concept_type - concept_type
   * @returns JSON Schema for concept parameters
   * @throws INVALID_CONCEPT_TYPE if Concept type is not recognized
   */
  getConceptParameterSchema(concept_type: string): Record<string, any>;

  /**
   * Search facts by operation and additional criteria
   * @param searchCriteria - Search criteria including operation and filters
   * @returns Array of matching facts
   * @throws INVALID_QUERY if Search criteria are invalid
   */
  searchFacts(searchCriteria: { operation: string; [key: string]: any }): Fact[];

}

// Export default interface
export default FactRepositoryInterface;
