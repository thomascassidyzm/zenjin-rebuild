/**
 * Implementation of the ContentManager component for Zenjin Maths App
 * This file defines the ContentManager class that manages curriculum content
 */

import { FactRepositoryInterface, MathematicalFact, FactQuery } from './fact-repository-types';
import { 
  ContentManagerInterface, 
  MathematicalFactInput, 
  CurriculumMetadata,
  Curriculum,
  ImportOptions,
  ImportResult,
  RelationshipType,
  DifficultyAlgorithm
} from './content-manager-types';

/**
 * Implementation of ContentManager that manages mathematical facts and curriculum content
 */
export class ContentManager implements ContentManagerInterface {
  private factRepository: FactRepositoryInterface;
  private curriculumStore: Map<string, CurriculumMetadata> = new Map();
  
  /**
   * Creates a new instance of ContentManager
   * @param factRepository The fact repository to use for storage
   */
  constructor(factRepository: FactRepositoryInterface) {
    this.factRepository = factRepository;
    this.initializeCurriculumStore();
  }
  
  /**
   * Creates a new mathematical fact
   * @param factInput Fact data to create
   * @returns The created mathematical fact
   * @throws Error if the fact data is invalid
   */
  public createFact(factInput: MathematicalFactInput): MathematicalFact {
    // Validate fact input
    this.validateFactInput(factInput);
    
    // Generate ID if not provided
    if (!factInput.id) {
      factInput.id = this.generateFactId(factInput.operation, factInput.operands);
    }
    
    // Check if fact already exists
    try {
      this.factRepository.getFactById(factInput.id);
      throw new Error(`INVALID_FACT - A fact with ID '${factInput.id}' already exists`);
    } catch (error) {
      // Only proceed if error is FACT_NOT_FOUND, otherwise rethrow
      if (!error.message.includes('FACT_NOT_FOUND')) {
        throw error;
      }
    }
    
    // Calculate difficulty if not provided
    if (factInput.difficulty === undefined) {
      factInput.difficulty = this.calculateFactDifficulty(
        factInput.operation, 
        factInput.operands, 
        factInput.result
      );
    }
    
    // Create fact object
    const fact: MathematicalFact = {
      id: factInput.id,
      operation: factInput.operation,
      operands: factInput.operands,
      result: factInput.result,
      difficulty: factInput.difficulty,
      relatedFactIds: factInput.relatedFactIds || [],
      tags: factInput.tags || []
    };
    
    // Add difficulty level tag if not present
    if (!fact.tags?.some(tag => tag.startsWith('level-'))) {
      const levelTag = this.getDifficultyLevelTag(fact.difficulty);
      fact.tags = [...(fact.tags || []), levelTag];
    }
    
    // Import into repository
    const importResult = this.factRepository.importFacts(JSON.stringify([fact]));
    
    if (importResult === 0) {
      throw new Error(`INVALID_FACT - Failed to import fact into repository`);
    }
    
    return fact;
  }
  
  /**
   * Updates an existing mathematical fact
   * @param factId ID of the fact to update
   * @param factUpdates Fact data updates
   * @returns The updated mathematical fact
   * @throws Error if the fact is not found or the updated data is invalid
   */
  public updateFact(factId: string, factUpdates: Partial<MathematicalFactInput>): MathematicalFact {
    // Get existing fact
    const existingFact = this.factRepository.getFactById(factId);
    
    // Validate updates
    if (factUpdates.operation && factUpdates.operation !== existingFact.operation) {
      this.validateOperation(factUpdates.operation);
    }
    
    if (factUpdates.operands && !Array.isArray(factUpdates.operands)) {
      throw new Error(`INVALID_FACT - Operands must be an array`);
    }
    
    if (factUpdates.difficulty !== undefined && (
      typeof factUpdates.difficulty !== 'number' || 
      factUpdates.difficulty < 0 || 
      factUpdates.difficulty > 1
    )) {
      throw new Error(`INVALID_FACT - Difficulty must be a number between 0 and 1`);
    }
    
    // Create updated fact
    const updatedFact: MathematicalFact = {
      ...existingFact,
      operation: factUpdates.operation || existingFact.operation,
      operands: factUpdates.operands || existingFact.operands,
      result: factUpdates.result !== undefined ? factUpdates.result : existingFact.result,
      difficulty: factUpdates.difficulty !== undefined ? factUpdates.difficulty : existingFact.difficulty,
      relatedFactIds: factUpdates.relatedFactIds || existingFact.relatedFactIds,
      tags: factUpdates.tags || existingFact.tags
    };
    
    // Add difficulty level tag if needed
    if (
      factUpdates.difficulty !== undefined && 
      !updatedFact.tags?.some(tag => tag.startsWith('level-'))
    ) {
      const levelTag = this.getDifficultyLevelTag(updatedFact.difficulty || 0.5);
      updatedFact.tags = [...(updatedFact.tags || []), levelTag];
    }
    
    // Update in repository by removing and re-adding
    const deleteResult = this.factRepository.clearFacts();
    const importResult = this.factRepository.importFacts(JSON.stringify([updatedFact]));
    
    if (importResult === 0) {
      throw new Error(`INVALID_FACT - Failed to update fact in repository`);
    }
    
    return updatedFact;
  }
  
  /**
   * Deletes a mathematical fact
   * @param factId ID of the fact to delete
   * @returns Whether the deletion was successful
   * @throws Error if the fact is not found or is in use
   */
  public deleteFact(factId: string): boolean {
    // Get the fact to verify it exists
    const fact = this.factRepository.getFactById(factId);
    
    // Check if the fact is referenced by other facts
    const referencingFacts = this.findReferencingFacts(factId);
    
    if (referencingFacts.length > 0) {
      const factIds = referencingFacts.map(f => f.id).join(', ');
      throw new Error(`FACT_IN_USE - The fact is referenced by other facts: ${factIds}`);
    }
    
    // Remove the fact
    try {
      // To delete a fact, we'll get all facts, filter out the one to delete, and reimport
      const allFacts = this.factRepository.queryFacts({});
      const remainingFacts = allFacts.filter(f => f.id !== factId);
      
      // Clear repository and reimport
      this.factRepository.clearFacts();
      
      if (remainingFacts.length > 0) {
        this.factRepository.importFacts(JSON.stringify(remainingFacts));
      }
      
      return true;
    } catch (error) {
      throw new Error(`Failed to delete fact: ${error.message}`);
    }
  }
  
  /**
   * Imports curriculum content from JSON format
   * @param jsonData JSON curriculum data
   * @param options Import options
   * @returns Import operation result
   * @throws Error if the JSON or curriculum structure is invalid
   */
  public async importCurriculum(jsonData: string, options: ImportOptions = {}): Promise<ImportResult> {
    try {
      // Parse JSON data
      let curriculum;
      try {
        curriculum = JSON.parse(jsonData);
      } catch (error) {
        throw new Error(`INVALID_JSON - Failed to parse JSON: ${error.message}`);
      }
      
      // Validate curriculum structure
      this.validateCurriculumStructure(curriculum);
      
      // Initialize result
      const result: ImportResult = {
        success: true,
        importedCount: 0,
        skippedCount: 0,
        errorCount: 0,
        curriculumName: curriculum.name,
        errors: [],
        message: ""
      };
      
      // Validation only mode
      if (options.validateOnly) {
        result.message = `Validation successful for curriculum '${curriculum.name}'`;
        return result;
      }
      
      // Process facts
      for (const factData of curriculum.facts) {
        try {
          // Generate ID if not provided
          if (!factData.id) {
            factData.id = this.generateFactId(factData.operation, factData.operands);
          }
          
          // Check if fact exists
          let factExists = false;
          try {
            this.factRepository.getFactById(factData.id);
            factExists = true;
          } catch (error) {
            // Fact doesn't exist, which is fine
          }
          
          // Handle existing facts
          if (factExists) {
            if (options.replaceExisting) {
              // Update existing fact
              this.updateFact(factData.id, factData);
              result.importedCount++;
            } else {
              // Skip existing fact
              result.skippedCount++;
            }
          } else {
            // Create new fact
            this.createFact(factData);
            result.importedCount++;
          }
        } catch (error) {
          result.errorCount++;
          result.errors?.push(`Error processing fact: ${error.message}`);
        }
      }
      
      // Store curriculum metadata
      const curriculumMetadata: CurriculumMetadata = {
        id: this.generateCurriculumId(curriculum.name),
        name: curriculum.name,
        description: curriculum.description || "",
        version: curriculum.version || "1.0",
        createdAt: curriculum.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: curriculum.tags || []
      };
      
      this.curriculumStore.set(curriculumMetadata.id, curriculumMetadata);
      
      // Set message
      result.message = `Successfully imported ${result.importedCount} facts for curriculum '${curriculum.name}'`;
      if (result.skippedCount > 0) {
        result.message += `, skipped ${result.skippedCount} existing facts`;
      }
      if (result.errorCount > 0) {
        result.message += `, encountered ${result.errorCount} errors`;
        result.success = false;
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        importedCount: 0,
        skippedCount: 0,
        errorCount: 1,
        errors: [error.message],
        message: `Failed to import curriculum: ${error.message}`
      };
    }
  }
  
  /**
   * Exports curriculum content to JSON format
   * @param curriculumName Name for the exported curriculum
   * @param description Description of the curriculum
   * @param query Optional query to filter facts to export
   * @returns JSON curriculum data
   * @throws Error if export fails
   */
  public async exportCurriculum(curriculumName: string, description?: string, query?: FactQuery): Promise<string> {
    try {
      // Get facts from repository
      const facts = this.factRepository.queryFacts(query || {});
      
      // Create curriculum structure
      const curriculum = {
        name: curriculumName,
        description: description || `${curriculumName} curriculum`,
        version: "1.0",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        facts: facts
      };
      
      // Store curriculum metadata if it doesn't exist
      const curriculumId = this.generateCurriculumId(curriculumName);
      if (!this.curriculumStore.has(curriculumId)) {
        const curriculumMetadata: CurriculumMetadata = {
          id: curriculumId,
          name: curriculumName,
          description: description || `${curriculumName} curriculum`,
          version: "1.0",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: []
        };
        
        this.curriculumStore.set(curriculumId, curriculumMetadata);
      }
      
      return JSON.stringify(curriculum, null, 2);
    } catch (error) {
      throw new Error(`EXPORT_ERROR - Failed to export curriculum: ${error.message}`);
    }
  }
  
  /**
   * Automatically generates relationships between facts
   * @param factIds IDs of facts to process (all if not specified)
   * @param relationshipTypes Types of relationships to generate
   * @returns Number of facts updated with new relationships
   * @throws Error if generation fails
   */
  public async generateFactRelationships(factIds?: string[], relationshipTypes?: string[]): Promise<number> {
    try {
      // Default relationship types if not specified
      const types = relationshipTypes || [
        RelationshipType.COMMUTATIVE, 
        RelationshipType.INVERSE, 
        RelationshipType.ADJACENT
      ];
      
      // Get facts to process
      let facts: MathematicalFact[];
      if (factIds && factIds.length > 0) {
        facts = factIds.map(id => this.factRepository.getFactById(id));
      } else {
        facts = this.factRepository.queryFacts({});
      