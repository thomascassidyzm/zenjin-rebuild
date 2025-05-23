/**
 * Type definitions for the FactRepository component
 * This file contains all interfaces and types used by the FactRepository
 */

/**
 * Interface for the FactRepository component that stores and retrieves mathematical facts
 */
export interface FactRepositoryInterface {
  /**
   * Gets a mathematical fact by its identifier
   * @param factId Fact identifier
   * @returns The mathematical fact
   * @throws Error if the fact is not found
   */
  getFactById(factId: string): MathematicalFact;
  
  /**
   * Queries mathematical facts based on criteria
   * @param query Query criteria
   * @returns Array of matching facts
   * @throws Error if the query is invalid
   */
  queryFacts(query: FactQuery): MathematicalFact[];
  
  /**
   * Gets facts related to a specific fact
   * @param factId Fact identifier
   * @param limit Maximum number of related facts to return (default: 10)
   * @returns Array of related facts
   * @throws Error if the fact is not found
   */
  getRelatedFacts(factId: string, limit?: number): MathematicalFact[];
  
  /**
   * Gets facts for a specific mathematical operation
   * @param operation Mathematical operation
   * @returns Array of facts for the operation
   * @throws Error if the operation is invalid
   */
  getFactsByOperation(operation: string): MathematicalFact[];
  
  /**
   * Gets the total count of facts in the repository
   * @param query Optional query criteria
   * @returns Number of facts matching the criteria
   * @throws Error if the query is invalid
   */
  getFactCount(query?: FactQuery): number;
  
  /**
   * Gets facts for a specific learning path
   * @param learningPathId Learning path identifier
   * @returns Array of facts for the learning path
   */
  getFactsByLearningPath(learningPathId: string): MathematicalFact[];
  
  /**
   * Gets question templates for an operation and boundary level
   * @param operation Mathematical operation
   * @param boundaryLevel Boundary level (1-5)
   * @returns Array of question templates
   */
  getQuestionTemplates(operation: string, boundaryLevel: number): string[];
}

/**
 * Represents a mathematical fact
 */
export interface MathematicalFact {
  /**
   * Unique identifier for the fact
   */
  id: string;
  
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
 * Query criteria for facts
 */
export interface FactQuery {
  /**
   * Filter by operation
   */
  operation?: string;
  
  /**
   * Filter by difficulty range
   */
  difficulty?: {
    /**
     * Minimum difficulty
     */
    min?: number;
    
    /**
     * Maximum difficulty
     */
    max?: number;
  };
  
  /**
   * Filter by tags
   */
  tags?: string[];
  
  /**
   * Maximum number of results (default: 100)
   */
  limit?: number;
  
  /**
   * Result offset for pagination (default: 0)
   */
  offset?: number;
}

/**
 * Supported mathematical operations
 */
export enum MathOperation {
  ADDITION = 'addition',
  SUBTRACTION = 'subtraction',
  MULTIPLICATION = 'multiplication',
  DIVISION = 'division'
}

/**
 * Difficulty level constants
 */
export enum DifficultyLevel {
  LEVEL_1 = 'level-1', // Very Easy (0.0-0.2)
  LEVEL_2 = 'level-2', // Easy (0.2-0.4)
  LEVEL_3 = 'level-3', // Medium (0.4-0.6)
  LEVEL_4 = 'level-4', // Hard (0.6-0.8)
  LEVEL_5 = 'level-5'  // Very Hard (0.8-1.0)
}

/**
 * Error codes used by the FactRepository
 */
export enum FactRepositoryErrorCode {
  FACT_NOT_FOUND = 'FACT_NOT_FOUND',
  INVALID_OPERATION = 'INVALID_OPERATION',
  INVALID_QUERY = 'INVALID_QUERY'
}
