/**
 * Type definitions for the ContentManager component
 * This file contains all interfaces and types used by the ContentManager
 */

import { MathematicalFact, FactQuery } from '../FactRepository';

/**
 * Interface for the ContentManager component that manages curriculum content
 */
export interface ContentManagerInterface {
  /**
   * Creates a new mathematical fact
   * @param factInput Fact data to create
   * @returns The created mathematical fact
   * @throws Error if the fact data is invalid
   */
  createFact(factInput: MathematicalFactInput): MathematicalFact;
  
  /**
   * Updates an existing mathematical fact
   * @param factId ID of the fact to update
   * @param factUpdates Fact data updates
   * @returns The updated mathematical fact
   * @throws Error if the fact is not found or the updated data is invalid
   */
  updateFact(factId: string, factUpdates: Partial<MathematicalFactInput>): MathematicalFact;
  
  /**
   * Deletes a mathematical fact
   * @param factId ID of the fact to delete
   * @returns Whether the deletion was successful
   * @throws Error if the fact is not found or is in use
   */
  deleteFact(factId: string): boolean;
  
  /**
   * Imports curriculum content from JSON format
   * @param jsonData JSON curriculum data
   * @param options Import options
   * @returns Import operation result
   * @throws Error if the JSON or curriculum structure is invalid
   */
  importCurriculum(jsonData: string, options?: ImportOptions): Promise<ImportResult>;
  
  /**
   * Exports curriculum content to JSON format
   * @param curriculumName Name for the exported curriculum
   * @param description Description of the curriculum
   * @param query Optional query to filter facts to export
   * @returns JSON curriculum data
   * @throws Error if export fails
   */
  exportCurriculum(curriculumName: string, description?: string, query?: FactQuery): Promise<string>;
  
  /**
   * Automatically generates relationships between facts
   * @param factIds IDs of facts to process (all if not specified)
   * @param relationshipTypes Types of relationships to generate
   * @returns Number of facts updated with new relationships
   * @throws Error if generation fails
   */
  generateFactRelationships(factIds?: string[], relationshipTypes?: string[]): Promise<number>;
  
  /**
   * Automatically calculates difficulty ratings for facts
   * @param factIds IDs of facts to process (all if not specified)
   * @param algorithm Difficulty calculation algorithm to use
   * @returns Number of facts updated with new difficulty ratings
   * @throws Error if calculation fails or algorithm is invalid
   */
  generateDifficultyRatings(factIds?: string[], algorithm?: string): Promise<number>;
  
  /**
   * Lists available curriculum sets
   * @param tags Filter by tags
   * @returns Available curriculum sets
   * @throws Error if listing fails
   */
  listCurriculumSets(tags?: string[]): CurriculumMetadata[];
  
  /**
   * Gets a specific curriculum set
   * @param curriculumId Curriculum identifier
   * @returns The curriculum data
   * @throws Error if the curriculum is not found
   */
  getCurriculumSet(curriculumId: string): Curriculum;
}

/**
 * Input for creating a mathematical fact
 */
export interface MathematicalFactInput {
  /**
   * Unique identifier for the fact (auto-generated if not provided)
   */
  id?: string;
  
  /**
   * Mathematical operation (e.g., 'addition', 'multiplication')
   */
  operation: string;
  
  /**
   * Operands involved in the fact
   */
  operands: number[];
  
  /**
   * Result of the operation
   */
  result: number;
  
  /**
   * Inherent difficulty rating (0.0-1.0)
   */
  difficulty?: number;
  
  /**
   * IDs of related facts
   */
  relatedFactIds?: string[];
  
  /**
   * Tags for categorization
   */
  tags?: string[];
}

/**
 * Curriculum metadata
 */
export interface CurriculumMetadata {
  /**
   * Unique identifier for the curriculum
   */
  id: string;
  
  /**
   * Name of the curriculum
   */
  name: string;
  
  /**
   * Description of the curriculum content
   */
  description: string;
  
  /**
   * Version of the curriculum
   */
  version: string;
  
  /**
   * Creation timestamp (ISO format)
   */
  createdAt: string;
  
  /**
   * Last update timestamp (ISO format)
   */
  updatedAt: string;
  
  /**
   * Tags for categorization
   */
  tags?: string[];
}

/**
 * Curriculum with facts
 */
export interface Curriculum {
  /**
   * Curriculum metadata
   */
  metadata: CurriculumMetadata;
  
  /**
   * Mathematical facts in this curriculum
   */
  facts: MathematicalFact[];
}

/**
 * Import options
 */
export interface ImportOptions {
  /**
   * Whether to replace existing facts
   */
  replaceExisting?: boolean;
  
  /**
   * Only validate without importing
   */
  validateOnly?: boolean;
}

/**
 * Import operation result
 */
export interface ImportResult {
  /**
   * Whether the import was successful
   */
  success: boolean;
  
  /**
   * Number of facts imported
   */
  importedCount: number;
  
  /**
   * Number of facts skipped
   */
  skippedCount: number;
  
  /**
   * Number of errors encountered
   */
  errorCount: number;
  
  /**
   * Name of the imported curriculum
   */
  curriculumName?: string;
  
  /**
   * Error messages for failed imports
   */
  errors?: string[];
  
  /**
   * Summary message of the import operation
   */
  message: string;
}

/**
 * Types of relationships between facts
 */
export enum RelationshipType {
  COMMUTATIVE = 'commutative',
  INVERSE = 'inverse',
  ADJACENT = 'adjacent',
  EQUIVALENT = 'equivalent'
}

/**
 * Difficulty calculation algorithms
 */
export enum DifficultyAlgorithm {
  DEFAULT = 'default',
  COGNITIVE_LOAD = 'cognitive-load'
}

/**
 * Error codes used by the ContentManager
 */
export enum ContentManagerErrorCode {
  INVALID_FACT = 'INVALID_FACT',
  FACT_NOT_FOUND = 'FACT_NOT_FOUND',
  FACT_IN_USE = 'FACT_IN_USE',
  INVALID_JSON = 'INVALID_JSON',
  INVALID_CURRICULUM = 'INVALID_CURRICULUM',
  EXPORT_ERROR = 'EXPORT_ERROR',
  GENERATION_ERROR = 'GENERATION_ERROR',
  CALCULATION_ERROR = 'CALCULATION_ERROR',
  INVALID_ALGORITHM = 'INVALID_ALGORITHM',
  LIST_ERROR = 'LIST_ERROR',
  CURRICULUM_NOT_FOUND = 'CURRICULUM_NOT_FOUND'
}
