/**
 * Implementation of the ContentManager component for Zenjin Maths App
 * This file defines the ContentManager class that manages curriculum content
 */

import { FactRepositoryInterface, MathematicalFact, FactQuery } from '../FactRepository/FactRepositoryTypes';
import { 
  ContentManagerInterface, 
  MathematicalFactInput, 
  CurriculumMetadata,
  Curriculum,
  ImportOptions,
  ImportResult,
  RelationshipType,
  DifficultyAlgorithm
} from './ContentManagerTypes';

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
      }
      
      // Initialize counters
      let updatedCount = 0;
      
      // Process facts
      for (const fact of facts) {
        let relationships: string[] = [...fact.relatedFactIds];
        let relationshipsAdded = false;
        
        // Generate relationships based on type
        for (const type of types) {
          const relatedFacts = this.generateRelationships(fact, type);
          
          // Add new relationships
          for (const relatedFactId of relatedFacts) {
            if (!relationships.includes(relatedFactId)) {
              relationships.push(relatedFactId);
              relationshipsAdded = true;
            }
          }
        }
        
        // Update fact if relationships changed
        if (relationshipsAdded) {
          this.updateFact(fact.id, { relatedFactIds: relationships });
          updatedCount++;
        }
      }
      
      return updatedCount;
    } catch (error) {
      throw new Error(`RELATIONSHIP_ERROR - Failed to generate fact relationships: ${error.message}`);
    }
  }
  
  /**
   * Automatically generates difficulty ratings for facts
   * @param factIds IDs of facts to process (all if not specified)
   * @param algorithm Difficulty calculation algorithm to use
   * @returns Number of facts updated with new difficulty ratings
   * @throws Error if generation fails
   */
  public async generateDifficultyRatings(factIds?: string[], algorithm?: string): Promise<number> {
    try {
      // Select algorithm
      const difficultyAlgorithm = algorithm || DifficultyAlgorithm.DEFAULT;
      
      // Get facts to process
      let facts: MathematicalFact[];
      if (factIds && factIds.length > 0) {
        facts = factIds.map(id => this.factRepository.getFactById(id));
      } else {
        facts = this.factRepository.queryFacts({});
      }
      
      // Initialize counters
      let updatedCount = 0;
      
      // Process facts
      for (const fact of facts) {
        // Calculate new difficulty
        const newDifficulty = this.calculateFactDifficulty(
          fact.operation, 
          fact.operands, 
          fact.result, 
          difficultyAlgorithm
        );
        
        // Update fact if difficulty changed
        if (newDifficulty !== fact.difficulty) {
          this.updateFact(fact.id, { difficulty: newDifficulty });
          updatedCount++;
        }
      }
      
      return updatedCount;
    } catch (error) {
      throw new Error(`DIFFICULTY_ERROR - Failed to generate difficulty ratings: ${error.message}`);
    }
  }
  
  /**
   * Lists available curriculum sets
   * @param tags Filter by tags
   * @returns Available curriculum sets
   */
  public listCurriculumSets(tags?: string[]): CurriculumMetadata[] {
    let curricula = Array.from(this.curriculumStore.values());
    
    // Filter by tags if specified
    if (tags && tags.length > 0) {
      curricula = curricula.filter(curriculum => 
        tags.some(tag => curriculum.tags.includes(tag))
      );
    }
    
    return curricula;
  }
  
  /**
   * Gets a specific curriculum set
   * @param curriculumId Curriculum identifier
   * @returns The curriculum data
   * @throws Error if the curriculum is not found
   */
  public async getCurriculumSet(curriculumId: string): Promise<Curriculum> {
    // Check if curriculum exists
    if (!this.curriculumStore.has(curriculumId)) {
      throw new Error(`CURRICULUM_NOT_FOUND - No curriculum found with ID: ${curriculumId}`);
    }
    
    const metadata = this.curriculumStore.get(curriculumId);
    
    // Get all facts
    const facts = this.factRepository.queryFacts({
      tags: metadata.tags
    });
    
    return {
      name: metadata.name,
      description: metadata.description,
      version: metadata.version,
      createdAt: metadata.createdAt,
      updatedAt: metadata.updatedAt,
      facts: facts
    };
  }
  
  // Helper methods
  
  /**
   * Validates fact input
   * @param factInput Fact data to validate
   * @throws Error if the data is invalid
   */
  private validateFactInput(factInput: MathematicalFactInput): void {
    // Validate operation
    this.validateOperation(factInput.operation);
    
    // Validate operands
    if (!Array.isArray(factInput.operands)) {
      throw new Error(`INVALID_FACT - Operands must be an array`);
    }
    
    if (factInput.operands.length === 0) {
      throw new Error(`INVALID_FACT - Operands array cannot be empty`);
    }
    
    // Validate difficulty if provided
    if (factInput.difficulty !== undefined && (
      typeof factInput.difficulty !== 'number' || 
      factInput.difficulty < 0 || 
      factInput.difficulty > 1
    )) {
      throw new Error(`INVALID_FACT - Difficulty must be a number between 0 and 1`);
    }
    
    // Validate tags if provided
    if (factInput.tags && !Array.isArray(factInput.tags)) {
      throw new Error(`INVALID_FACT - Tags must be an array`);
    }
    
    // Validate related fact IDs if provided
    if (factInput.relatedFactIds && !Array.isArray(factInput.relatedFactIds)) {
      throw new Error(`INVALID_FACT - Related fact IDs must be an array`);
    }
  }
  
  /**
   * Validates operation
   * @param operation Operation to validate
   * @throws Error if the operation is invalid
   */
  private validateOperation(operation: string): void {
    const validOperations = [
      'addition', 'subtraction', 'multiplication', 'division', 
      'square', 'cube', 'square-root', 'exponentiation'
    ];
    
    if (!validOperations.includes(operation)) {
      throw new Error(`INVALID_FACT - Invalid operation: ${operation}`);
    }
  }
  
  /**
   * Validates curriculum structure
   * @param curriculum Curriculum to validate
   * @throws Error if the structure is invalid
   */
  private validateCurriculumStructure(curriculum: any): void {
    // Validate name
    if (!curriculum.name || typeof curriculum.name !== 'string') {
      throw new Error(`INVALID_CURRICULUM - Name is required and must be a string`);
    }
    
    // Validate facts
    if (!curriculum.facts || !Array.isArray(curriculum.facts)) {
      throw new Error(`INVALID_CURRICULUM - Facts must be an array`);
    }
    
    // Validate each fact
    for (let i = 0; i < curriculum.facts.length; i++) {
      const fact = curriculum.facts[i];
      
      if (!fact.operation) {
        throw new Error(`INVALID_CURRICULUM - Fact at index ${i} is missing operation`);
      }
      
      if (!fact.operands || !Array.isArray(fact.operands)) {
        throw new Error(`INVALID_CURRICULUM - Fact at index ${i} is missing operands or operands is not an array`);
      }
      
      if (fact.result === undefined) {
        throw new Error(`INVALID_CURRICULUM - Fact at index ${i} is missing result`);
      }
    }
  }
  
  /**
   * Initializes the curriculum store with default data
   */
  private initializeCurriculumStore(): void {
    // Core Arithmetic curriculum
    const coreArithmetic: CurriculumMetadata = {
      id: 'core-arithmetic',
      name: 'Core Arithmetic',
      description: 'Basic arithmetic facts for addition, subtraction, multiplication, and division',
      version: '1.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['core', 'arithmetic']
    };
    
    this.curriculumStore.set(coreArithmetic.id, coreArithmetic);
  }
  
  /**
   * Generates a fact ID based on operation and operands
   * @param operation Operation
   * @param operands Operands
   * @returns Generated fact ID
   */
  private generateFactId(operation: string, operands: (number | string)[]): string {
    const operandString = operands.join('-');
    return `${operation}-${operandString}`;
  }
  
  /**
   * Generates a curriculum ID based on name
   * @param name Curriculum name
   * @returns Generated curriculum ID
   */
  private generateCurriculumId(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  }
  
  /**
   * Calculates fact difficulty based on operation and operands
   * @param operation Operation
   * @param operands Operands
   * @param result Result
   * @param algorithm Optional algorithm to use
   * @returns Calculated difficulty (0-1)
   */
  private calculateFactDifficulty(
    operation: string, 
    operands: (number | string)[], 
    result: number | string,
    algorithm: string = DifficultyAlgorithm.DEFAULT
  ): number {
    // Default algorithm - scale with operand values and operation complexity
    let baseDifficulty = 0.5;
    
    // Adjust by operation
    switch (operation) {
      case 'addition':
        baseDifficulty = 0.3;
        break;
      case 'subtraction':
        baseDifficulty = 0.4;
        break;
      case 'multiplication':
        baseDifficulty = 0.6;
        break;
      case 'division':
        baseDifficulty = 0.7;
        break;
      case 'square':
        baseDifficulty = 0.5;
        break;
      case 'cube':
        baseDifficulty = 0.7;
        break;
      case 'square-root':
        baseDifficulty = 0.8;
        break;
      case 'exponentiation':
        baseDifficulty = 0.9;
        break;
    }
    
    // Adjust by operand magnitude
    const numericOperands = operands.map(o => Number(o)).filter(o => !isNaN(o));
    if (numericOperands.length > 0) {
      const maxOperand = Math.max(...numericOperands);
      
      // Scale based on magnitude
      if (maxOperand <= 5) {
        baseDifficulty -= 0.2;
      } else if (maxOperand <= 10) {
        baseDifficulty -= 0.1;
      } else if (maxOperand <= 20) {
        // No adjustment
      } else if (maxOperand <= 50) {
        baseDifficulty += 0.1;
      } else if (maxOperand <= 100) {
        baseDifficulty += 0.2;
      } else {
        baseDifficulty += 0.3;
      }
    }
    
    // Ensure result is in valid range
    return Math.max(0, Math.min(1, baseDifficulty));
  }
  
  /**
   * Gets the difficulty level tag for a given difficulty value
   * @param difficulty Difficulty value (0-1)
   * @returns Difficulty level tag
   */
  private getDifficultyLevelTag(difficulty: number): string {
    if (difficulty < 0.2) {
      return 'level-1';
    } else if (difficulty < 0.4) {
      return 'level-2';
    } else if (difficulty < 0.6) {
      return 'level-3';
    } else if (difficulty < 0.8) {
      return 'level-4';
    } else {
      return 'level-5';
    }
  }
  
  /**
   * Finds facts that reference a given fact
   * @param factId Fact ID to check
   * @returns Array of facts that reference the given fact
   */
  private findReferencingFacts(factId: string): MathematicalFact[] {
    const allFacts = this.factRepository.queryFacts({});
    return allFacts.filter(fact => 
      fact.relatedFactIds && fact.relatedFactIds.includes(factId)
    );
  }
  
  /**
   * Generates related facts based on relationship type
   * @param fact Fact to generate relationships for
   * @param relationshipType Type of relationship
   * @returns Array of related fact IDs
   */
  private generateRelationships(fact: MathematicalFact, relationshipType: string): string[] {
    const relatedFactIds: string[] = [];
    
    switch (relationshipType) {
      case RelationshipType.COMMUTATIVE:
        // Only applicable to addition and multiplication
        if (fact.operation === 'addition' || fact.operation === 'multiplication') {
          // Only if there are 2 operands
          if (fact.operands.length === 2) {
            const commutativeFact = {
              operation: fact.operation,
              operands: [fact.operands[1], fact.operands[0]]
            };
            const commutativeFactId = this.generateFactId(
              commutativeFact.operation, 
              commutativeFact.operands
            );
            
            // Check if the fact exists
            try {
              this.factRepository.getFactById(commutativeFactId);
              relatedFactIds.push(commutativeFactId);
            } catch (error) {
              // Fact doesn't exist, which is fine
            }
          }
        }
        break;
        
      case RelationshipType.INVERSE:
        // Addition <-> Subtraction
        if (fact.operation === 'addition' && fact.operands.length === 2) {
          const inverseFact1 = {
            operation: 'subtraction',
            operands: [fact.result, fact.operands[0]]
          };
          const inverseFact2 = {
            operation: 'subtraction',
            operands: [fact.result, fact.operands[1]]
          };
          
          const inverseFactId1 = this.generateFactId(
            inverseFact1.operation, 
            inverseFact1.operands
          );
          const inverseFactId2 = this.generateFactId(
            inverseFact2.operation, 
            inverseFact2.operands
          );
          
          // Check if the facts exist
          try {
            this.factRepository.getFactById(inverseFactId1);
            relatedFactIds.push(inverseFactId1);
          } catch (error) {}
          
          try {
            this.factRepository.getFactById(inverseFactId2);
            relatedFactIds.push(inverseFactId2);
          } catch (error) {}
        }
        
        // Subtraction -> Addition
        if (fact.operation === 'subtraction' && fact.operands.length === 2) {
          const inverseFact = {
            operation: 'addition',
            operands: [fact.result, fact.operands[1]]
          };
          
          const inverseFactId = this.generateFactId(
            inverseFact.operation, 
            inverseFact.operands
          );
          
          // Check if the fact exists
          try {
            this.factRepository.getFactById(inverseFactId);
            relatedFactIds.push(inverseFactId);
          } catch (error) {}
        }
        
        // Multiplication <-> Division
        if (fact.operation === 'multiplication' && fact.operands.length === 2) {
          const inverseFact1 = {
            operation: 'division',
            operands: [fact.result, fact.operands[0]]
          };
          const inverseFact2 = {
            operation: 'division',
            operands: [fact.result, fact.operands[1]]
          };
          
          const inverseFactId1 = this.generateFactId(
            inverseFact1.operation, 
            inverseFact1.operands
          );
          const inverseFactId2 = this.generateFactId(
            inverseFact2.operation, 
            inverseFact2.operands
          );
          
          // Check if the facts exist
          try {
            this.factRepository.getFactById(inverseFactId1);
            relatedFactIds.push(inverseFactId1);
          } catch (error) {}
          
          try {
            this.factRepository.getFactById(inverseFactId2);
            relatedFactIds.push(inverseFactId2);
          } catch (error) {}
        }
        
        // Division -> Multiplication
        if (fact.operation === 'division' && fact.operands.length === 2) {
          const inverseFact = {
            operation: 'multiplication',
            operands: [fact.result, fact.operands[1]]
          };
          
          const inverseFactId = this.generateFactId(
            inverseFact.operation, 
            inverseFact.operands
          );
          
          // Check if the fact exists
          try {
            this.factRepository.getFactById(inverseFactId);
            relatedFactIds.push(inverseFactId);
          } catch (error) {}
        }
        break;
        
      case RelationshipType.ADJACENT:
        // For addition and subtraction, adjacent facts differ by 1
        if (fact.operation === 'addition' && fact.operands.length === 2) {
          const adjacentFacts = [
            {
              operation: 'addition',
              operands: [Number(fact.operands[0]) + 1, fact.operands[1]]
            },
            {
              operation: 'addition',
              operands: [Number(fact.operands[0]) - 1, fact.operands[1]]
            },
            {
              operation: 'addition',
              operands: [fact.operands[0], Number(fact.operands[1]) + 1]
            },
            {
              operation: 'addition',
              operands: [fact.operands[0], Number(fact.operands[1]) - 1]
            }
          ];
          
          for (const adjFact of adjacentFacts) {
            const adjFactId = this.generateFactId(
              adjFact.operation, 
              adjFact.operands
            );
            
            // Check if the fact exists
            try {
              this.factRepository.getFactById(adjFactId);
              relatedFactIds.push(adjFactId);
            } catch (error) {}
          }
        }
        
        // For multiplication, adjacent facts differ by multiplication table
        if (fact.operation === 'multiplication' && fact.operands.length === 2) {
          const adjacentFacts = [
            {
              operation: 'multiplication',
              operands: [Number(fact.operands[0]) + 1, fact.operands[1]]
            },
            {
              operation: 'multiplication',
              operands: [Number(fact.operands[0]) - 1, fact.operands[1]]
            },
            {
              operation: 'multiplication',
              operands: [fact.operands[0], Number(fact.operands[1]) + 1]
            },
            {
              operation: 'multiplication',
              operands: [fact.operands[0], Number(fact.operands[1]) - 1]
            }
          ];
          
          for (const adjFact of adjacentFacts) {
            const adjFactId = this.generateFactId(
              adjFact.operation, 
              adjFact.operands
            );
            
            // Check if the fact exists
            try {
              this.factRepository.getFactById(adjFactId);
              relatedFactIds.push(adjFactId);
            } catch (error) {}
          }
        }
        break;
    }
    
    return relatedFactIds;
  }
}