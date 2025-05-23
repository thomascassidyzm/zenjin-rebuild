/**
 * FactRepositoryInterface.ts
 * Generated from APML Interface Definition
 * Module: LearningEngine
 */

/**
 * 
    Defines the contract for the FactRepository component that stores and retrieves mathematical facts used in the learning process.
  
 */
/**
 * MathematicalFact
 */
export interface MathematicalFact {
  id: string; // Unique identifier for the fact
  operation: string; // Mathematical operation (e.g., 'addition', 'multiplication')
  operands: number[]; // Operands involved in the fact
  result: number; // Result of the operation
  difficulty?: number; // Inherent difficulty rating (0.0-1.0)
  relatedFactIds?: string[]; // IDs of related facts
  tags?: string[]; // Tags for categorization
}

/**
 * FactQuery
 */
export interface FactQuery {
  operation?: string; // Filter by operation
  difficulty?: Record<string, any>; // Filter by difficulty range
  tags?: string[]; // Filter by tags
  limit?: number; // Maximum number of results
  offset?: number; // Result offset for pagination
}

/**
 * Error codes for FactRepositoryInterface
 */
export enum FactRepositoryErrorCode {
  FACT_NOT_FOUND = 'FACT_NOT_FOUND',
  INVALID_QUERY = 'INVALID_QUERY',
  FACT_NOT_FOUND = 'FACT_NOT_FOUND',
  INVALID_OPERATION = 'INVALID_OPERATION',
  INVALID_QUERY = 'INVALID_QUERY',
}

/**
 * FactRepositoryInterface
 */
export interface FactRepositoryInterface {
  /**
   * Gets a mathematical fact by its identifier
   * @param factId - Fact identifier
   * @returns The mathematical fact
   * @throws FACT_NOT_FOUND if The specified fact was not found
   */
  getFactById(factId: string): MathematicalFact;

  /**
   * Queries mathematical facts based on criteria
   * @param query - Query criteria
   * @returns Array of matching facts
   * @throws INVALID_QUERY if The query is invalid
   */
  queryFacts(query: FactQuery): MathematicalFact[];

  /**
   * Gets facts related to a specific fact
   * @param factId - Fact identifier
   * @param limit - Maximum number of related facts to return
   * @returns Array of related facts
   * @throws FACT_NOT_FOUND if The specified fact was not found
   */
  getRelatedFacts(factId: string, limit?: number): MathematicalFact[];

  /**
   * Gets facts for a specific mathematical operation
   * @param operation - Mathematical operation
   * @returns Array of facts for the operation
   * @throws INVALID_OPERATION if The specified operation is invalid
   */
  getFactsByOperation(operation: string): MathematicalFact[];

  /**
   * Gets the total count of facts in the repository
   * @param query - Optional query criteria
   * @returns Number of facts matching the criteria
   * @throws INVALID_QUERY if The query is invalid
   */
  getFactCount(query?: FactQuery): number;

}

// Export default interface
export default FactRepositoryInterface;
