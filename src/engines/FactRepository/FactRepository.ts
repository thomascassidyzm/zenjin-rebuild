/**
 * Implementation of the FactRepository component for Zenjin Maths App
 * This file defines the core FactRepository class and its implementation
 */

import { FactRepositoryInterface, MathematicalFact, FactQuery } from './FactRepositoryTypes';

/**
 * Implementation of the FactRepository that stores and retrieves mathematical facts
 */
export class FactRepository implements FactRepositoryInterface {
  private facts: Map<string, MathematicalFact> = new Map();
  private operationIndex: Map<string, Set<string>> = new Map();
  private difficultyIndex: Map<string, number> = new Map();
  private tagIndex: Map<string, Set<string>> = new Map();
  
  /**
   * Creates a new instance of FactRepository with initial facts
   */
  constructor() {
    console.log('🔄 FactRepository constructor: Starting initialization...');
    try {
      this.initializeRepository();
      console.log('✅ FactRepository constructor: Initialization complete');
    } catch (error) {
      console.error('❌ FactRepository constructor: Initialization failed:', error);
      throw error;
    }
  }
  
  /**
   * Gets a mathematical fact by its identifier
   * @param factId Fact identifier
   * @returns The mathematical fact
   * @throws Error if the fact is not found
   */
  public getFactById(factId: string): MathematicalFact {
    const fact = this.facts.get(factId);
    
    if (!fact) {
      throw new Error(`FACT_NOT_FOUND - The specified fact was not found: ${factId}`);
    }
    
    return fact;
  }
  
  /**
   * Queries mathematical facts based on criteria
   * @param query Query criteria
   * @returns Array of matching facts
   * @throws Error if the query is invalid
   */
  public queryFacts(query: FactQuery): MathematicalFact[] {
    // Validate query
    this.validateQuery(query);
    
    // Start with all fact IDs
    let candidateIds: Set<string> = new Set(this.facts.keys());
    
    // Filter by operation (most selective filter first)
    if (query.operation) {
      const operationIds = this.operationIndex.get(query.operation);
      if (!operationIds) {
        return []; // No facts for this operation
      }
      candidateIds = new Set(
        [...candidateIds].filter(id => operationIds.has(id))
      );
    }
    
    // Filter by tags
    if (query.tags && query.tags.length > 0) {
      for (const tag of query.tags) {
        const tagIds = this.tagIndex.get(tag);
        if (!tagIds) {
          return []; // No facts with this tag
        }
        candidateIds = new Set(
          [...candidateIds].filter(id => tagIds.has(id))
        );
      }
    }
    
    // Filter by difficulty
    if (query.difficulty) {
      const min = query.difficulty.min ?? 0;
      const max = query.difficulty.max ?? 1;
      
      candidateIds = new Set(
        [...candidateIds].filter(id => {
          const difficulty = this.difficultyIndex.get(id) ?? 0.5;
          return difficulty >= min && difficulty <= max;
        })
      );
    }
    
    // Convert IDs to facts
    let results = [...candidateIds]
      .map(id => this.facts.get(id)!)
      .sort((a, b) => (a.difficulty || 0.5) - (b.difficulty || 0.5));
    
    // Apply pagination
    const offset = query.offset || 0;
    const limit = query.limit || 100;
    
    return results.slice(offset, offset + limit);
  }
  
  /**
   * Gets facts related to a specific fact
   * @param factId Fact identifier
   * @param limit Maximum number of related facts to return (default: 10)
   * @returns Array of related facts
   * @throws Error if the fact is not found
   */
  public getRelatedFacts(factId: string, limit: number = 10): MathematicalFact[] {
    // Get the fact
    const fact = this.getFactById(factId);
    
    // Get related fact IDs
    const relatedIds = fact.relatedFactIds || [];
    
    // Get related facts
    const relatedFacts = relatedIds
      .map(id => {
        try {
          return this.getFactById(id);
        } catch (error) {
          // Skip facts that don't exist
          return null;
        }
      })
      .filter((f): f is MathematicalFact => f !== null);
    
    // Sort by relevance (could be enhanced with a relevance algorithm)
    // For now, just sort by difficulty similarity
    const factDifficulty = fact.difficulty || 0.5;
    relatedFacts.sort((a, b) => {
      const diffA = Math.abs((a.difficulty || 0.5) - factDifficulty);
      const diffB = Math.abs((b.difficulty || 0.5) - factDifficulty);
      return diffA - diffB;
    });
    
    // Apply limit
    return relatedFacts.slice(0, limit);
  }
  
  /**
   * Gets facts for a specific mathematical operation
   * @param operation Mathematical operation
   * @returns Array of facts for the operation
   * @throws Error if the operation is invalid
   */
  public getFactsByOperation(operation: string): MathematicalFact[] {
    const operationIds = this.operationIndex.get(operation);
    
    if (!operationIds) {
      throw new Error(`INVALID_OPERATION - The specified operation is invalid: ${operation}`);
    }
    
    return [...operationIds]
      .map(id => this.facts.get(id)!)
      .sort((a, b) => (a.difficulty || 0.5) - (b.difficulty || 0.5));
  }
  
  /**
   * Gets the total count of facts in the repository
   * @param query Optional query criteria
   * @returns Number of facts matching the criteria
   * @throws Error if the query is invalid
   */
  public getFactCount(query?: FactQuery): number {
    if (!query) {
      return this.facts.size;
    }
    
    return this.queryFacts(query).length;
  }
  
  /**
   * Initialize the repository with basic mathematical facts
   */
  private initializeRepository(): void {
    console.log('🔄 FactRepository: Initializing facts...');
    // Initialize with well-defined mathematical facts first
    this.addBasicMultiplicationFacts();  // 20×20 = 400 facts
    this.addDoublingAndHalvingFacts();   // ~200 facts (doubling 1-100, halving even numbers)
    
    // TODO: Add these back later once core flow is working
    // this.addBasicAdditionFacts();     // Will add small scope later
    // this.addBasicSubtractionFacts();  // Will add small scope later  
    // this.addBasicDivisionFacts();     // Will add extensive scope later
    
    // Build indexes for efficient querying
    this.buildIndexes();
    console.log('✅ FactRepository: Facts initialized successfully');
  }
  
  /**
   * Adds specific doubling and halving facts to ensure complete coverage
   */
  private addDoublingAndHalvingFacts(): void {
    // Ensure doubling facts for essential numbers (1-50 for performance)
    for (let a = 1; a <= 50; a++) {
      const doubledResult = a * 2;
      const doublingId = `mult-${a}-2`;
      
      // Skip if already exists
      if (this.facts.has(doublingId)) continue;
      
      const doublingDifficulty = this.calculateMultiplicationDifficulty(a, 2);
      
      // Create doubling fact
      const doublingFact: MathematicalFact = {
        id: doublingId,
        operation: 'multiplication',
        operands: [a, 2],
        result: doubledResult,
        difficulty: doublingDifficulty,
        relatedFactIds: [
          `mult-2-${a}`, // Commutative property
          `div-${doubledResult}-${a}`,
          `div-${doubledResult}-2`
        ],
        tags: ['multiplication', 'doubling', 'two-times-table', this.getDifficultyLevel(doublingDifficulty)]
      };
      
      this.facts.set(doublingId, doublingFact);
      
      // Create commutative fact
      const commId = `mult-2-${a}`;
      if (!this.facts.has(commId)) {
        const commFact: MathematicalFact = {
          id: commId,
          operation: 'multiplication',
          operands: [2, a],
          result: doubledResult,
          difficulty: doublingDifficulty,
          relatedFactIds: [
            doublingId, // Original fact
            `div-${doubledResult}-${a}`,
            `div-${doubledResult}-2`
          ],
          tags: ['multiplication', 'doubling', 'two-times-table', this.getDifficultyLevel(doublingDifficulty)]
        };
        
        this.facts.set(commId, commFact);
      }
    }
    
    // Ensure halving facts for even numbers up to 100
    for (let a = 2; a <= 100; a += 2) { // Only even numbers
      const halvedResult = a / 2;
      const halvingId = `div-${a}-2`;
      
      // Skip if already exists
      if (this.facts.has(halvingId)) continue;
      
      const halvingDifficulty = this.calculateDivisionDifficulty(a, 2);
      
      const halvingFact: MathematicalFact = {
        id: halvingId,
        operation: 'division',
        operands: [a, 2],
        result: halvedResult,
        difficulty: halvingDifficulty,
        relatedFactIds: [
          `mult-2-${halvedResult}`, // Inverse operation
          `mult-${halvedResult}-2` // Inverse operation commutative
        ],
        tags: ['division', 'halving', 'division-by-two', this.getDifficultyLevel(halvingDifficulty)]
      };
      
      this.facts.set(halvingId, halvingFact);
    }
  }
  
  /**
   * Adds basic addition facts to the repository
   */
  private addBasicAdditionFacts(): void {
    // Add essential addition facts only (much smaller set)
    // Focus on facts actually needed for learning - 0-12 range for performance
    for (let a = 0; a <= 12; a++) {
      for (let b = 0; b <= 12; b++) {
        const result = a + b;
        const id = `add-${a}-${b}`;
        const difficulty = this.calculateAdditionDifficulty(a, b);
        
        // Create tags array
        const tags = ['addition', this.getDifficultyLevel(difficulty)];
        
        // Add tag for doubling if operands are the same
        if (a === b) {
          tags.push('doubling');
        }
        
        const fact: MathematicalFact = {
          id,
          operation: 'addition',
          operands: [a, b],
          result,
          difficulty,
          relatedFactIds: [
            `add-${b}-${a}`, // Commutative property
            `sub-${result}-${a}`, // Inverse operation
            `sub-${result}-${b}` // Inverse operation
          ],
          tags
        };
        
        this.facts.set(id, fact);
      }
    }
    
    // Add some larger round numbers for variety
    const largeNumbers = [25, 30, 40, 50, 60, 70, 80, 90, 100];
    for (const large of largeNumbers) {
      for (let small = 0; small <= 20; small++) {
        const result = large + small;
        const id = `add-${large}-${small}`;
        const difficulty = this.calculateAdditionDifficulty(large, small);
        
        const fact: MathematicalFact = {
          id,
          operation: 'addition',
          operands: [large, small],
          result,
          difficulty,
          relatedFactIds: [
            `add-${small}-${large}`, // Commutative property
            `sub-${result}-${large}`, // Inverse operation
            `sub-${result}-${small}` // Inverse operation
          ],
          tags: ['addition', this.getDifficultyLevel(difficulty), 'large-numbers']
        };
        
        this.facts.set(id, fact);
      }
    }
  }
  
  /**
   * Adds basic subtraction facts to the repository
   */
  private addBasicSubtractionFacts(): void {
    // Add essential subtraction facts (0-12 range for performance - small scope as requested)
    for (let a = 0; a <= 12; a++) {
      for (let b = 0; b <= a; b++) {
        const result = a - b;
        
        const id = `sub-${a}-${b}`;
        const difficulty = this.calculateSubtractionDifficulty(a, b);
        
        // Create tags array
        const tags = ['subtraction', this.getDifficultyLevel(difficulty)];
        
        // Add tag for halving if a is even and b is half of a
        if (a % 2 === 0 && b === a / 2 && a <= 100) {
          tags.push('halving');
        }
        
        const fact: MathematicalFact = {
          id,
          operation: 'subtraction',
          operands: [a, b],
          result,
          difficulty,
          relatedFactIds: [
            `add-${b}-${result}`, // Inverse operation
            `add-${result}-${b}`, // Inverse operation commutative
          ],
          tags
        };
        
        this.facts.set(id, fact);
      }
    }
  }
  
  /**
   * Adds basic multiplication facts to the repository
   */
  private addBasicMultiplicationFacts(): void {
    // Generate multiplication facts for numbers 0-20
    for (let a = 0; a <= 20; a++) {
      for (let b = 0; b <= 20; b++) {
        const result = a * b;
        const id = `mult-${a}-${b}`;
        const difficulty = this.calculateMultiplicationDifficulty(a, b);
        
        // Create related fact IDs
        const relatedFactIds: string[] = [
          `mult-${b}-${a}`, // Commutative property
        ];
        
        // Add division as related fact
        if (result !== 0) {
          relatedFactIds.push(`div-${result}-${a}`);
          relatedFactIds.push(`div-${result}-${b}`);
        }
        
        // Add nearby facts (limited to stay within our range)
        if (a > 0) relatedFactIds.push(`mult-${a-1}-${b}`);
        if (b > 0) relatedFactIds.push(`mult-${a}-${b-1}`);
        if (a < 20) relatedFactIds.push(`mult-${a+1}-${b}`);
        if (b < 20) relatedFactIds.push(`mult-${a}-${b+1}`);
        
        // Create tags array
        const tags = ['multiplication', 'times-tables', this.getDifficultyLevel(difficulty)];
        
        // Add tag for doubling if it's multiplying by 2
        if (a === 2 || b === 2) {
          tags.push('doubling');
        }
        
        // Add tag for halving if it's dividing by 2
        if (a === 0.5 || b === 0.5) {
          tags.push('halving');
        }
        
        // Add specific tags for common tables
        if (a === 10 || b === 10) tags.push('ten-times-table');
        if (a === 5 || b === 5) tags.push('five-times-table');
        if (a === 2 || b === 2) tags.push('two-times-table');
        
        const fact: MathematicalFact = {
          id,
          operation: 'multiplication',
          operands: [a, b],
          result,
          difficulty,
          relatedFactIds,
          tags
        };
        
        this.facts.set(id, fact);
      }
    }
    
    // Add specific doubling facts up to 100
    for (let a = 21; a <= 100; a++) {
      const b = 2;
      const result = a * b;
      const id = `mult-${a}-${b}`;
      const difficulty = this.calculateMultiplicationDifficulty(a, b);
      
      const fact: MathematicalFact = {
        id,
        operation: 'multiplication',
        operands: [a, b],
        result,
        difficulty,
        relatedFactIds: [
          `mult-${b}-${a}`, // Commutative property
          `div-${result}-${a}`,
          `div-${result}-${b}`
        ],
        tags: ['multiplication', 'doubling', 'two-times-table', this.getDifficultyLevel(difficulty)]
      };
      
      this.facts.set(id, fact);
      
      // Add commutative fact
      const commId = `mult-${b}-${a}`;
      const commFact: MathematicalFact = {
        id: commId,
        operation: 'multiplication',
        operands: [b, a],
        result,
        difficulty,
        relatedFactIds: [
          id, // Original fact
          `div-${result}-${a}`,
          `div-${result}-${b}`
        ],
        tags: ['multiplication', 'doubling', 'two-times-table', this.getDifficultyLevel(difficulty)]
      };
      
      this.facts.set(commId, commFact);
    }
  }
  
  /**
   * Adds basic division facts to the repository
   */
  private addBasicDivisionFacts(): void {
    // Generate essential division facts based on times tables
    // Focus on realistic range (up to 144 = 12×12) for performance
    for (let dividend = 1; dividend <= 144; dividend++) {
      for (let divisor = 1; divisor <= 12; divisor++) {
        // Only include facts with whole number results
        if (dividend % divisor !== 0) continue;
        
        const result = dividend / divisor;
        // Only include results up to 12 for times tables coverage
        if (result > 12) continue;
        
        const id = `div-${dividend}-${divisor}`;
        const difficulty = this.calculateDivisionDifficulty(dividend, divisor);
        
        // Create tags array
        const tags = ['division', this.getDifficultyLevel(difficulty)];
        
        // Add tag for halving
        if (divisor === 2 && dividend <= 100) {
          tags.push('halving');
        }
        
        // Add specific tags for common division facts
        if (divisor === 10) tags.push('division-by-ten');
        if (divisor === 5) tags.push('division-by-five');
        if (divisor === 2) tags.push('division-by-two');
        
        const fact: MathematicalFact = {
          id,
          operation: 'division',
          operands: [dividend, divisor],
          result,
          difficulty,
          relatedFactIds: [
            `mult-${divisor}-${result}`, // Inverse operation
            `mult-${result}-${divisor}`, // Inverse operation commutative
            `div-${dividend}-${result}` // Related division
          ],
          tags
        };
        
        this.facts.set(id, fact);
      }
    }
    
    // Add specific halving facts up to 100
    for (let a = 2; a <= 200; a += 2) { // Only even numbers
      const divisor = 2;
      const result = a / divisor;
      const id = `div-${a}-${divisor}`;
      
      // Skip if already added
      if (this.facts.has(id)) continue;
      
      const difficulty = this.calculateDivisionDifficulty(a, divisor);
      
      const fact: MathematicalFact = {
        id,
        operation: 'division',
        operands: [a, divisor],
        result,
        difficulty,
        relatedFactIds: [
          `mult-${divisor}-${result}`, // Inverse operation
          `mult-${result}-${divisor}` // Inverse operation commutative
        ],
        tags: ['division', 'halving', 'division-by-two', this.getDifficultyLevel(difficulty)]
      };
      
      this.facts.set(id, fact);
    }
  }
  
  /**
   * Calculates difficulty for addition facts
   * @param a First operand
   * @param b Second operand
   * @returns Difficulty rating (0.0-1.0)
   */
  private calculateAdditionDifficulty(a: number, b: number): number {
    let difficulty = 0.1; // Base difficulty
    
    // Larger numbers are more difficult
    difficulty += (a + b) / 100;
    
    // Crossing 10 is more difficult
    if ((a < 10 && b < 10 && a + b >= 10) || 
        (a < 20 && b < 20 && a + b >= 20)) {
      difficulty += 0.2;
    }
    
    // Operations with 0 or 1 are easier
    if (a === 0 || b === 0) {
      difficulty -= 0.05;
    }
    if (a === 1 || b === 1) {
      difficulty -= 0.03;
    }
    
    // Ensure difficulty is within bounds
    return Math.max(0.1, Math.min(0.9, difficulty));
  }
  
  /**
   * Calculates difficulty for subtraction facts
   * @param minuend Number being subtracted from
   * @param subtrahend Number being subtracted
   * @returns Difficulty rating (0.0-1.0)
   */
  private calculateSubtractionDifficulty(minuend: number, subtrahend: number): number {
    let difficulty = 0.15; // Base difficulty (slightly harder than addition)
    
    // Larger numbers are more difficult
    difficulty += minuend / 100;
    
    // Crossing 10 is more difficult
    if ((minuend >= 10 && minuend - subtrahend < 10) || 
        (minuend >= 20 && minuend - subtrahend < 20)) {
      difficulty += 0.2;
    }
    
    // Subtracting 0 is easier
    if (subtrahend === 0) {
      difficulty -= 0.1;
    }
    
    // Subtracting to 0 is easier
    if (minuend === subtrahend) {
      difficulty -= 0.05;
    }
    
    // Ensure difficulty is within bounds
    return Math.max(0.1, Math.min(0.9, difficulty));
  }
  
  /**
   * Calculates difficulty for multiplication facts
   * @param a First operand
   * @param b Second operand
   * @returns Difficulty rating (0.0-1.0)
   */
  private calculateMultiplicationDifficulty(a: number, b: number): number {
    let difficulty = 0.2; // Base difficulty
    
    // Larger numbers are more difficult
    difficulty += (a * b) / 200;
    
    // Operations with 0, 1, or 10 are easier
    if (a === 0 || b === 0) {
      difficulty = 0.1; // Very easy
      return difficulty;
    }
    
    if (a === 1 || b === 1) {
      difficulty = 0.15; // Easy
      return difficulty;
    }
    
    if (a === 10 || b === 10) {
      difficulty = 0.2; // Relatively easy
      return difficulty;
    }
    
    // Square numbers are slightly easier to remember
    if (a === b) {
      difficulty -= 0.05;
    }
    
    // Ensure difficulty is within bounds
    return Math.max(0.1, Math.min(0.9, difficulty));
  }
  
  /**
   * Calculates difficulty for division facts
   * @param dividend Number being divided
   * @param divisor Number dividing by
   * @returns Difficulty rating (0.0-1.0)
   */
  private calculateDivisionDifficulty(dividend: number, divisor: number): number {
    let difficulty = 0.25; // Base difficulty (harder than multiplication)
    
    // Larger numbers are more difficult
    difficulty += dividend / 200;
    
    // Division by 1 is easier
    if (divisor === 1) {
      difficulty = 0.15;
      return difficulty;
    }
    
    // Division by 10 is easier
    if (divisor === 10) {
      difficulty = 0.2;
      return difficulty;
    }
    
    // Division where dividend = divisor is easier
    if (dividend === divisor) {
      difficulty -= 0.1;
    }
    
    // Ensure difficulty is within bounds
    return Math.max(0.1, Math.min(0.9, difficulty));
  }
  
  /**
   * Gets difficulty level tag based on difficulty rating
   * @param difficulty Difficulty rating (0.0-1.0)
   * @returns Difficulty level tag
   */
  private getDifficultyLevel(difficulty: number): string {
    if (difficulty < 0.2) return 'level-1';
    if (difficulty < 0.4) return 'level-2';
    if (difficulty < 0.6) return 'level-3';
    if (difficulty < 0.8) return 'level-4';
    return 'level-5';
  }
  
  /**
   * Builds indexes for efficient querying
   */
  private buildIndexes(): void {
    // Clear existing indexes
    this.operationIndex.clear();
    this.difficultyIndex.clear();
    this.tagIndex.clear();
    
    // Build indexes for efficient querying
    for (const [id, fact] of this.facts.entries()) {
      // Operation index
      if (!this.operationIndex.has(fact.operation)) {
        this.operationIndex.set(fact.operation, new Set());
      }
      this.operationIndex.get(fact.operation)!.add(id);
      
      // Difficulty index
      this.difficultyIndex.set(id, fact.difficulty || 0.5);
      
      // Tag index
      if (fact.tags) {
        for (const tag of fact.tags) {
          if (!this.tagIndex.has(tag)) {
            this.tagIndex.set(tag, new Set());
          }
          this.tagIndex.get(tag)!.add(id);
        }
      }
    }
  }
  
  /**
   * Validates query parameters
   * @param query Query to validate
   * @throws Error if the query is invalid
   */
  private validateQuery(query: FactQuery): void {
    // Validate operation
    if (query.operation && !this.operationIndex.has(query.operation)) {
      throw new Error(`INVALID_OPERATION - The specified operation is invalid: ${query.operation}`);
    }
    
    // Validate difficulty range
    if (query.difficulty) {
      const min = query.difficulty.min ?? 0;
      const max = query.difficulty.max ?? 1;
      
      if (min < 0 || min > 1) {
        throw new Error(`INVALID_QUERY - Difficulty min must be between 0 and 1`);
      }
      
      if (max < 0 || max > 1) {
        throw new Error(`INVALID_QUERY - Difficulty max must be between 0 and 1`);
      }
      
      if (min > max) {
        throw new Error(`INVALID_QUERY - Invalid difficulty range: min cannot be greater than max`);
      }
    }
    
    // Validate pagination
    if (query.offset !== undefined && query.offset < 0) {
      throw new Error(`INVALID_QUERY - Offset cannot be negative`);
    }
    
    if (query.limit !== undefined && query.limit <= 0) {
      throw new Error(`INVALID_QUERY - Limit must be positive`);
    }
  }
  
  /**
   * Gets facts for a specific learning path
   * @param learningPathId Learning path identifier
   * @returns Array of facts for the learning path
   */
  public getFactsByLearningPath(learningPathId: string): MathematicalFact[] {
    // Map learning paths to operations and difficulty ranges
    const pathMapping: Record<string, FactQuery> = {
      'addition': { operation: 'addition', difficulty: { min: 0, max: 1 } },
      'subtraction': { operation: 'subtraction', difficulty: { min: 0, max: 1 } },
      'multiplication': { operation: 'multiplication', difficulty: { min: 0, max: 1 } },
      'division': { operation: 'division', difficulty: { min: 0, max: 1 } },
      'basic-arithmetic': { difficulty: { min: 0, max: 0.6 } },
      'advanced-arithmetic': { difficulty: { min: 0.4, max: 1 } }
    };
    
    const query = pathMapping[learningPathId];
    if (!query) {
      // If no specific mapping, return basic addition facts as default
      return this.getFactsByOperation('addition').slice(0, 20);
    }
    
    return this.queryFacts(query);
  }
  
  /**
   * Gets question templates for an operation and boundary level
   * @param operation Mathematical operation
   * @param boundaryLevel Boundary level (1-5)
   * @returns Array of question templates
   */
  public getQuestionTemplates(operation: string, boundaryLevel: number): string[] {
    const templates: Record<string, Record<number, string[]>> = {
      'addition': {
        1: ['What is {{operand1}} + {{operand2}}?'],
        2: ['{{operand1}} + {{operand2}} = ?', 'Add {{operand1}} and {{operand2}}'],
        3: ['Find the sum of {{operand1}} and {{operand2}}', '{{operand1}} + {{operand2}} = ?'],
        4: ['Calculate {{operand1}} + {{operand2}}', 'What is the total of {{operand1}} and {{operand2}}?'],
        5: ['Determine the sum: {{operand1}} + {{operand2}}', 'Solve: {{operand1}} + {{operand2}}']
      },
      'subtraction': {
        1: ['What is {{operand1}} - {{operand2}}?'],
        2: ['{{operand1}} - {{operand2}} = ?', 'Subtract {{operand2}} from {{operand1}}'],
        3: ['Find the difference of {{operand1}} and {{operand2}}', '{{operand1}} - {{operand2}} = ?'],
        4: ['Calculate {{operand1}} - {{operand2}}', 'What is {{operand1}} minus {{operand2}}?'],
        5: ['Determine the difference: {{operand1}} - {{operand2}}', 'Solve: {{operand1}} - {{operand2}}']
      },
      'multiplication': {
        1: ['What is {{operand1}} × {{operand2}}?'],
        2: ['{{operand1}} × {{operand2}} = ?', 'Multiply {{operand1}} by {{operand2}}'],
        3: ['Find the product of {{operand1}} and {{operand2}}', '{{operand1}} × {{operand2}} = ?'],
        4: ['Calculate {{operand1}} × {{operand2}}', 'What is {{operand1}} times {{operand2}}?'],
        5: ['Determine the product: {{operand1}} × {{operand2}}', 'Solve: {{operand1}} × {{operand2}}']
      },
      'division': {
        1: ['What is {{operand1}} ÷ {{operand2}}?'],
        2: ['{{operand1}} ÷ {{operand2}} = ?', 'Divide {{operand1}} by {{operand2}}'],
        3: ['Find the quotient of {{operand1}} and {{operand2}}', '{{operand1}} ÷ {{operand2}} = ?'],
        4: ['Calculate {{operand1}} ÷ {{operand2}}', 'What is {{operand1}} divided by {{operand2}}?'],
        5: ['Determine the quotient: {{operand1}} ÷ {{operand2}}', 'Solve: {{operand1}} ÷ {{operand2}}']
      }
    };
    
    const operationTemplates = templates[operation];
    if (!operationTemplates) {
      return [`Calculate {{operand1}} ${operation} {{operand2}}.`];
    }
    
    const levelTemplates = operationTemplates[boundaryLevel];
    if (!levelTemplates) {
      return operationTemplates[1] || [`Calculate {{operand1}} ${operation} {{operand2}}.`];
    }
    
    return levelTemplates;
  }
}
