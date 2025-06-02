/**
 * ContentManagerInterface.ts
 * Generated from APML Interface Definition
 * Module: undefined
 */


/**
 * Provide an administrative interface for managing mathematical facts and curriculum content
 */
/**
 * ContentManagerInterface
 */
export interface ContentManagerInterface {
  /**
   * Creates a new mathematical fact in the repository
   * @param factInput - Fact data to create
   * @returns The created mathematical fact
   */
  createFact(factInput: MathematicalFactInput): MathematicalFact;

  /**
   * Updates an existing mathematical fact in the repository
   * @param factId - ID of the fact to update
   * @param factUpdates - Fact data updates
   * @returns The updated mathematical fact
   */
  updateFact(factId: string, factUpdates: Partial<MathematicalFactInput>): MathematicalFact;

  /**
   * Deletes a mathematical fact from the repository
   * @param factId - ID of the fact to delete
   * @returns Whether the deletion was successful
   */
  deleteFact(factId: string): boolean;

  /**
   * Imports curriculum content from JSON format
   * @param jsonData - JSON curriculum data
   * @param options - Import options
   * @returns Import operation result
   */
  importCurriculum(jsonData: string, options?: ImportOptions): ImportResult;

  /**
   * Exports curriculum content to JSON format
   * @param curriculumName - Name for the exported curriculum
   * @param description - Description of the curriculum
   * @param query - Optional query to filter facts to export
   * @returns JSON curriculum data
   */
  exportCurriculum(curriculumName: string, description?: string, query?: FactQuery): string;

  /**
   * Automatically generates relationships between facts
   * @param factIds - IDs of facts to process (all if not specified)
   * @param relationshipTypes - Types of relationships to generate
   * @returns Number of facts updated with new relationships
   */
  generateFactRelationships(factIds?: any[], relationshipTypes?: any[]): number;

  /**
   * Automatically calculates difficulty ratings for facts
   * @param factIds - IDs of facts to process (all if not specified)
   * @param algorithm - Difficulty calculation algorithm to use
   * @returns Number of facts updated with new difficulty ratings
   */
  generateDifficultyRatings(factIds?: any[], algorithm?: string): number;

  /**
   * Lists available curriculum sets
   * @param tags - Filter by tags
   * @returns Available curriculum sets
   */
  listCurriculumSets(tags?: any[]): any[];

  /**
   * Gets a specific curriculum set
   * @param curriculumId - Curriculum identifier
   * @returns The curriculum data
   */
  getCurriculumSet(curriculumId: string): Curriculum;

}

// Export default interface
export default ContentManagerInterface;
