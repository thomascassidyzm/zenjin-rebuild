/**
 * DistractorGenerator Component
 * 
 * This component generates appropriate distractors for mathematical facts at different boundary levels
 * to support the distinction-based learning approach in the Zenjin Maths App.
 * 
 * Boundary Levels:
 * 1. Category Boundaries: Non-numerical distractors (e.g., "Fish" instead of 56)
 * 2. Magnitude Boundaries: Numerical distractors with incorrect magnitude (e.g., 784 instead of 56)
 * 3. Operation Boundaries: Results from incorrect operation (e.g., 7 + 8 = 15 instead of 7 × 8 = 56)
 * 4. Related Fact Boundaries: Results from adjacent facts (e.g., 7 × 9 = 63 instead of 7 × 8 = 56)
 * 5. Near Miss Boundaries: Very similar numerical answers (e.g., 54 instead of 56)
 */

/**
 * Request for generating distractors
 */
export type DistractorRequest = {
  /** Mathematical fact identifier */
  factId: string;
  
  /** Boundary level (1-5) */
  boundaryLevel: number;
  
  /** The correct answer */
  correctAnswer: string;
  
  /** Number of distractors to generate (default: 1) */
  count?: number;
};

/**
 * Distractor information
 */
export type Distractor = {
  /** The distractor value */
  value: string;
  
  /** The boundary level this distractor targets */
  boundaryLevel: number;
  
  /** Explanation of why this distractor was chosen */
  explanation?: string;
  
  /** Difficulty rating (0.0-1.0) */
  difficulty?: number;
};

/**
 * Custom error types for the DistractorGenerator
 */
export class InvalidFactError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'INVALID_FACT';
  }
}

export class InvalidBoundaryLevelError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'INVALID_BOUNDARY_LEVEL';
  }
}

export class GenerationFailedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GENERATION_FAILED';
  }
}

export class InvalidDistractorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'INVALID_DISTRACTOR';
  }
}

/**
 * Interface for the DistractorGenerator component
 */
export interface DistractorGeneratorInterface {
  /**
   * Generates a distractor based on the boundary level and mathematical fact
   * @param request Distractor generation request
   * @returns Generated distractor
   * @throws INVALID_FACT if the specified fact is invalid or not found
   * @throws INVALID_BOUNDARY_LEVEL if the specified boundary level is invalid
   * @throws GENERATION_FAILED if failed to generate a distractor
   */
  generateDistractor(request: DistractorRequest): Distractor;
  
  /**
   * Generates multiple distractors based on the boundary level and mathematical fact
   * @param request Distractor generation request
   * @returns Array of generated distractors
   * @throws INVALID_FACT if the specified fact is invalid or not found
   * @throws INVALID_BOUNDARY_LEVEL if the specified boundary level is invalid
   * @throws GENERATION_FAILED if failed to generate distractors
   */
  generateMultipleDistractors(request: DistractorRequest): Distractor[];
  
  /**
   * Gets an explanation for why a distractor was chosen
   * @param factId Mathematical fact identifier
   * @param distractor The distractor value
   * @param boundaryLevel Boundary level (1-5)
   * @returns Explanation of why the distractor was chosen
   * @throws INVALID_FACT if the specified fact is invalid or not found
   * @throws INVALID_DISTRACTOR if the specified distractor is invalid
   * @throws INVALID_BOUNDARY_LEVEL if the specified boundary level is invalid
   */
  getDistractorExplanation(
    factId: string,
    distractor: string,
    boundaryLevel: number
  ): string;
  
  /**
   * Validates whether a distractor is appropriate for the given boundary level and fact
   * @param factId Mathematical fact identifier
   * @param distractor The distractor value
   * @param boundaryLevel Boundary level (1-5)
   * @param correctAnswer The correct answer
   * @returns Validation result
   * @throws INVALID_FACT if the specified fact is invalid or not found
   * @throws INVALID_BOUNDARY_LEVEL if the specified boundary level is invalid
   */
  validateDistractor(
    factId: string,
    distractor: string,
    boundaryLevel: number,
    correctAnswer: string
  ): {
    isValid: boolean;
    reason: string;
  };
}

/**
 * Parsed fact information
 */
type ParsedFact = {
  operation: 'add' | 'sub' | 'mult' | 'div';
  operand1: number;
  operand2: number;
  result: number;
};

/**
 * DistractorGenerator implementation
 */
export class DistractorGenerator implements DistractorGeneratorInterface {
  // Category boundary distractors for level 1
  private readonly categoryDistractions = [
    "Fish", "Tree", "Sky", "Cat", "Dog", "Car", "House", "Book", 
    "Pencil", "Table", "Phone", "Cup", "XYZ", "ABC", "!@#", 
    "Blue", "Red", "Circle", "Square", "Triangle", "Star"
  ];
  
  /**
   * Generates a distractor based on the boundary level and mathematical fact
   * @param request Distractor generation request
   * @returns Generated distractor
   * @throws INVALID_FACT if the specified fact is invalid or not found
   * @throws INVALID_BOUNDARY_LEVEL if the specified boundary level is invalid
   * @throws GENERATION_FAILED if failed to generate a distractor
   */
  public generateDistractor(request: DistractorRequest): Distractor {
    this.validateRequest(request);
    
    try {
      const parsedFact = this.parseFact(request.factId, request.correctAnswer);
      const boundaryLevel = request.boundaryLevel;
      
      let distractor: Distractor;
      
      switch (boundaryLevel) {
        case 1:
          distractor = this.generateCategoryDistractor(parsedFact);
          break;
        case 2:
          distractor = this.generateMagnitudeDistractor(parsedFact);
          break;
        case 3:
          distractor = this.generateOperationDistractor(parsedFact);
          break;
        case 4:
          distractor = this.generateRelatedFactDistractor(parsedFact);
          break;
        case 5:
          distractor = this.generateNearMissDistractor(parsedFact);
          break;
        default:
          throw new InvalidBoundaryLevelError(`Boundary level must be between 1 and 5, got ${boundaryLevel}`);
      }
      
      return distractor;
    } catch (error) {
      if (error instanceof InvalidFactError || error instanceof InvalidBoundaryLevelError) {
        throw error;
      }
      throw new GenerationFailedError(`Failed to generate distractor: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Generates multiple distractors based on the boundary level and mathematical fact
   * @param request Distractor generation request
   * @returns Array of generated distractors
   * @throws INVALID_FACT if the specified fact is invalid or not found
   * @throws INVALID_BOUNDARY_LEVEL if the specified boundary level is invalid
   * @throws GENERATION_FAILED if failed to generate distractors
   */
  public generateMultipleDistractors(request: DistractorRequest): Distractor[] {
    const count = request.count || 1;
    if (count < 1) {
      throw new Error('Count must be at least 1');
    }
    
    const distractors: Distractor[] = [];
    const usedValues = new Set<string>();
    
    // Attempt to generate unique distractors up to 3 times the requested count
    // This provides room for filtering out duplicates
    for (let attempt = 0; attempt < count * 3 && distractors.length < count; attempt++) {
      try {
        const distractor = this.generateDistractor(request);
        
        // Only add if this value hasn't been used yet
        if (!usedValues.has(distractor.value)) {
          usedValues.add(distractor.value);
          distractors.push(distractor);
        }
      } catch (error) {
        if (attempt >= count * 2 && distractors.length === 0) {
          // If we've made many attempts and still have no distractors, propagate the error
          if (error instanceof InvalidFactError || error instanceof InvalidBoundaryLevelError || 
              error instanceof GenerationFailedError) {
            throw error;
          }
          throw new GenerationFailedError(`Failed to generate distractors: ${error instanceof Error ? error.message : String(error)}`);
        }
        // Otherwise continue trying
      }
    }
    
    // If we couldn't generate enough unique distractors
    if (distractors.length < count) {
      throw new GenerationFailedError(`Could only generate ${distractors.length} unique distractors, but ${count} were requested`);
    }
    
    return distractors;
  }
  
  /**
   * Gets an explanation for why a distractor was chosen
   * @param factId Mathematical fact identifier
   * @param distractor The distractor value
   * @param boundaryLevel Boundary level (1-5)
   * @returns Explanation of why the distractor was chosen
   * @throws INVALID_FACT if the specified fact is invalid or not found
   * @throws INVALID_DISTRACTOR if the specified distractor is invalid
   * @throws INVALID_BOUNDARY_LEVEL if the specified boundary level is invalid
   */
  public getDistractorExplanation(
    factId: string,
    distractor: string,
    boundaryLevel: number
  ): string {
    this.validateBoundaryLevel(boundaryLevel);
    
    try {
      const correctAnswer = this.calculateCorrectAnswer(factId);
      const parsedFact = this.parseFact(factId, correctAnswer);
      
      switch (boundaryLevel) {
        case 1:
          return this.getCategoryDistractorExplanation(distractor, parsedFact);
        case 2:
          return this.getMagnitudeDistractorExplanation(distractor, parsedFact);
        case 3:
          return this.getOperationDistractorExplanation(distractor, parsedFact);
        case 4:
          return this.getRelatedFactDistractorExplanation(distractor, parsedFact);
        case 5:
          return this.getNearMissDistractorExplanation(distractor, parsedFact);
        default:
          throw new InvalidBoundaryLevelError(`Boundary level must be between 1 and 5, got ${boundaryLevel}`);
      }
    } catch (error) {
      if (error instanceof InvalidFactError || error instanceof InvalidBoundaryLevelError) {
        throw error;
      }
      throw new InvalidDistractorError(`Failed to get explanation: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Validates whether a distractor is appropriate for the given boundary level and fact
   * @param factId Mathematical fact identifier
   * @param distractor The distractor value
   * @param boundaryLevel Boundary level (1-5)
   * @param correctAnswer The correct answer
   * @returns Validation result
   * @throws INVALID_FACT if the specified fact is invalid or not found
   * @throws INVALID_BOUNDARY_LEVEL if the specified boundary level is invalid
   */
  public validateDistractor(
    factId: string,
    distractor: string,
    boundaryLevel: number,
    correctAnswer: string
  ): { isValid: boolean; reason: string } {
    this.validateBoundaryLevel(boundaryLevel);
    
    try {
      const parsedFact = this.parseFact(factId, correctAnswer);
      
      switch (boundaryLevel) {
        case 1:
          return this.validateCategoryDistractor(distractor, parsedFact);
        case 2:
          return this.validateMagnitudeDistractor(distractor, parsedFact);
        case 3:
          return this.validateOperationDistractor(distractor, parsedFact);
        case 4:
          return this.validateRelatedFactDistractor(distractor, parsedFact);
        case 5:
          return this.validateNearMissDistractor(distractor, parsedFact);
        default:
          throw new InvalidBoundaryLevelError(`Boundary level must be between 1 and 5, got ${boundaryLevel}`);
      }
    } catch (error) {
      if (error instanceof InvalidFactError || error instanceof InvalidBoundaryLevelError) {
        throw error;
      }
      return {
        isValid: false,
        reason: `Validation failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
  
  /**
   * Validates the distractor generation request
   * @param request Distractor generation request
   * @throws INVALID_FACT if the specified fact is invalid or not found
   * @throws INVALID_BOUNDARY_LEVEL if the specified boundary level is invalid
   */
  private validateRequest(request: DistractorRequest): void {
    // Validate fact ID
    if (!request.factId || !this.isValidFactId(request.factId)) {
      throw new InvalidFactError(`Invalid fact ID: ${request.factId}`);
    }
    
    // Validate boundary level
    this.validateBoundaryLevel(request.boundaryLevel);
    
    // Validate correct answer
    if (!request.correctAnswer) {
      throw new Error('Correct answer must be provided');
    }
  }
  
  /**
   * Validates the boundary level
   * @param boundaryLevel Boundary level to validate
   * @throws INVALID_BOUNDARY_LEVEL if the specified boundary level is invalid
   */
  private validateBoundaryLevel(boundaryLevel: number): void {
    if (!boundaryLevel || boundaryLevel < 1 || boundaryLevel > 5 || !Number.isInteger(boundaryLevel)) {
      throw new InvalidBoundaryLevelError(`Boundary level must be an integer between 1 and 5, got ${boundaryLevel}`);
    }
  }
  
  /**
   * Checks if a fact ID is valid
   * @param factId Fact ID to validate
   * @returns True if the fact ID is valid, false otherwise
   */
  private isValidFactId(factId: string): boolean {
    // Fact ID format: operation-operand1-operand2
    // e.g., add-3-4, sub-7-3, mult-7-8, div-56-8
    const factRegex = /^(add|sub|mult|div)-\d+-\d+$/;
    return factRegex.test(factId);
  }
  
  /**
   * Parses a fact ID into its components
   * @param factId Fact ID to parse
   * @param correctAnswer The correct answer
   * @returns Parsed fact
   * @throws INVALID_FACT if the fact ID is invalid
   */
  private parseFact(factId: string, correctAnswer: string): ParsedFact {
    if (!this.isValidFactId(factId)) {
      throw new InvalidFactError(`Invalid fact ID: ${factId}`);
    }
    
    const parts = factId.split('-');
    const operation = parts[0] as 'add' | 'sub' | 'mult' | 'div';
    const operand1 = parseInt(parts[1], 10);
    const operand2 = parseInt(parts[2], 10);
    const result = parseInt(correctAnswer, 10);
    
    // Verify that the correct answer matches the fact
    if (isNaN(result)) {
      throw new InvalidFactError(`Correct answer "${correctAnswer}" is not a valid number`);
    }
    
    // Verify that the correct answer matches the calculation
    const calculatedResult = this.calculateResult(operation, operand1, operand2);
    if (calculatedResult !== result) {
      throw new InvalidFactError(
        `Correct answer "${correctAnswer}" does not match the calculation result ${calculatedResult} for fact ${factId}`
      );
    }
    
    return { operation, operand1, operand2, result };
  }
  
  /**
   * Calculates the result of a mathematical operation
   * @param operation Operation to perform
   * @param operand1 First operand
   * @param operand2 Second operand
   * @returns Result of the operation
   * @throws Error if the operation is invalid
   */
  private calculateResult(
    operation: 'add' | 'sub' | 'mult' | 'div',
    operand1: number,
    operand2: number
  ): number {
    switch (operation) {
      case 'add':
        return operand1 + operand2;
      case 'sub':
        return operand1 - operand2;
      case 'mult':
        return operand1 * operand2;
      case 'div':
        if (operand2 === 0) {
          throw new Error('Division by zero');
        }
        return operand1 / operand2;
      default:
        throw new Error(`Invalid operation: ${operation}`);
    }
  }
  
  /**
   * Calculates the correct answer for a mathematical fact
   * @param factId Fact ID
   * @returns Correct answer
   * @throws INVALID_FACT if the fact ID is invalid
   */
  private calculateCorrectAnswer(factId: string): string {
    if (!this.isValidFactId(factId)) {
      throw new InvalidFactError(`Invalid fact ID: ${factId}`);
    }
    
    const parts = factId.split('-');
    const operation = parts[0] as 'add' | 'sub' | 'mult' | 'div';
    const operand1 = parseInt(parts[1], 10);
    const operand2 = parseInt(parts[2], 10);
    
    const result = this.calculateResult(operation, operand1, operand2);
    return result.toString();
  }
  
  /**
   * Generates a category boundary distractor (Level 1)
   * @param fact Parsed fact
   * @returns Generated distractor
   */
  private generateCategoryDistractor(fact: ParsedFact): Distractor {
    // Select a random non-numerical distractor
    const index = Math.floor(Math.random() * this.categoryDistractions.length);
    const value = this.categoryDistractions[index];
    
    return {
      value,
      boundaryLevel: 1,
      explanation: this.getCategoryDistractorExplanation(value, fact),
      difficulty: 0.2 // Level 1 is generally the easiest
    };
  }
  
  /**
   * Generates a magnitude boundary distractor (Level 2)
   * @param fact Parsed fact
   * @returns Generated distractor
   */
  private generateMagnitudeDistractor(fact: ParsedFact): Distractor {
    const correctResult = fact.result;
    let value: string;
    
    // Generate a distractor with a significantly different magnitude
    const options = [
      // Much larger value (10-20 times)
      Math.floor(correctResult * (10 + Math.random() * 10)).toString(),
      // Much smaller value (if possible)
      correctResult > 10 ? Math.max(1, Math.floor(correctResult / (5 + Math.random() * 5))).toString() : (100 + Math.floor(Math.random() * 100)).toString()
    ];
    
    // Randomly select one of the options
    value = options[Math.floor(Math.random() * options.length)];
    
    return {
      value,
      boundaryLevel: 2,
      explanation: this.getMagnitudeDistractorExplanation(value, fact),
      difficulty: 0.4 // Level 2 is relatively easy
    };
  }
  
  /**
   * Generates an operation boundary distractor (Level 3)
   * @param fact Parsed fact
   * @returns Generated distractor
   */
  private generateOperationDistractor(fact: ParsedFact): Distractor {
    const { operation, operand1, operand2 } = fact;
    let incorrectOperation: 'add' | 'sub' | 'mult' | 'div';
    let value: string;
    let distractorResult: number;
    
    // Select an incorrect operation (different from the current one)
    const operations: Array<'add' | 'sub' | 'mult' | 'div'> = ['add', 'sub', 'mult', 'div'];
    incorrectOperation = operations.filter(op => op !== operation)[Math.floor(Math.random() * 3)];
    
    // Calculate the result using the incorrect operation
    try {
      distractorResult = this.calculateResult(incorrectOperation, operand1, operand2);
      
      // Format the value to show the operation
      const opSymbol = this.getOperationSymbol(incorrectOperation);
      value = `${operand1} ${opSymbol} ${operand2} = ${distractorResult}`;
      
      return {
        value,
        boundaryLevel: 3,
        explanation: this.getOperationDistractorExplanation(value, fact),
        difficulty: 0.6 // Level 3 is moderately difficult
      };
    } catch (error) {
      // If calculation fails (e.g., division by zero), try another operation
      incorrectOperation = operations.filter(op => op !== operation && op !== incorrectOperation)[0];
      distractorResult = this.calculateResult(incorrectOperation, operand1, operand2);
      
      const opSymbol = this.getOperationSymbol(incorrectOperation);
      value = `${operand1} ${opSymbol} ${operand2} = ${distractorResult}`;
      
      return {
        value,
        boundaryLevel: 3,
        explanation: this.getOperationDistractorExplanation(value, fact),
        difficulty: 0.6
      };
    }
  }
  
  /**
   * Generates a related fact boundary distractor (Level 4)
   * @param fact Parsed fact
   * @returns Generated distractor
   */
  private generateRelatedFactDistractor(fact: ParsedFact): Distractor {
    const { operation, operand1, operand2 } = fact;
    let value: string;
    let relatedFactResult: number;
    let modifiedOperand1 = operand1;
    let modifiedOperand2 = operand2;
    
    // Randomly decide which operand to modify (or both)
    const modificationStrategy = Math.floor(Math.random() * 3);
    
    switch (modificationStrategy) {
      case 0: // Modify first operand
        modifiedOperand1 = this.getAdjacentNumber(operand1);
        break;
      case 1: // Modify second operand
        modifiedOperand2 = this.getAdjacentNumber(operand2);
        break;
      case 2: // Modify both operands slightly
        modifiedOperand1 = Math.max(1, operand1 + (Math.random() < 0.5 ? -1 : 1));
        modifiedOperand2 = Math.max(1, operand2 + (Math.random() < 0.5 ? -1 : 1));
        break;
    }
    
    // Calculate the result using the related fact
    try {
      relatedFactResult = this.calculateResult(operation, modifiedOperand1, modifiedOperand2);
      
      // Format the value to show the related fact
      const opSymbol = this.getOperationSymbol(operation);
      value = `${modifiedOperand1} ${opSymbol} ${modifiedOperand2} = ${relatedFactResult}`;
      
      return {
        value,
        boundaryLevel: 4,
        explanation: this.getRelatedFactDistractorExplanation(value, fact),
        difficulty: 0.8 // Level 4 is quite difficult
      };
    } catch (error) {
      // If calculation fails, try again with different operands
      modifiedOperand1 = this.getAdjacentNumber(operand1, 2); // Ensure different from original
      modifiedOperand2 = operand2;
      
      relatedFactResult = this.calculateResult(operation, modifiedOperand1, modifiedOperand2);
      
      const opSymbol = this.getOperationSymbol(operation);
      value = `${modifiedOperand1} ${opSymbol} ${modifiedOperand2} = ${relatedFactResult}`;
      
      return {
        value,
        boundaryLevel: 4,
        explanation: this.getRelatedFactDistractorExplanation(value, fact),
        difficulty: 0.8
      };
    }
  }
  
  /**
   * Generates a near miss boundary distractor (Level 5)
   * @param fact Parsed fact
   * @returns Generated distractor
   */
  private generateNearMissDistractor(fact: ParsedFact): Distractor {
    const correctResult = fact.result;
    
    // Generate a near miss by adding or subtracting a small value (1-3)
    const deviation = 1 + Math.floor(Math.random() * 3) * (Math.random() < 0.5 ? -1 : 1);
    let nearMissValue = correctResult + deviation;
    
    // Ensure the value is positive
    if (nearMissValue <= 0) {
      nearMissValue = correctResult + Math.abs(deviation);
    }
    
    // Ensure the value is different from the correct result
    if (nearMissValue === correctResult) {
      nearMissValue += 1;
    }
    
    const value = nearMissValue.toString();
    
    return {
      value,
      boundaryLevel: 5,
      explanation: this.getNearMissDistractorExplanation(value, fact),
      difficulty: 0.9 // Level 5 is the most difficult
    };
  }
  
  /**
   * Gets an adjacent number (for related fact distractors)
   * @param num Number to find an adjacent value for
   * @param minDifference Minimum difference from the original number
   * @returns Adjacent number
   */
  private getAdjacentNumber(num: number, minDifference: number = 1): number {
    // For single-digit numbers, preferably go up to maintain positivity
    if (num < 10) {
      return num + minDifference;
    }
    
    // For larger numbers, randomly go up or down
    const direction = Math.random() < 0.5 ? -1 : 1;
    return Math.max(1, num + (direction * minDifference));
  }
  
  /**
   * Gets the symbol for a mathematical operation
   * @param operation Operation
   * @returns Symbol representing the operation
   */
  private getOperationSymbol(operation: 'add' | 'sub' | 'mult' | 'div'): string {
    switch (operation) {
      case 'add': return '+';
      case 'sub': return '-';
      case 'mult': return '×';
      case 'div': return '÷';
      default: return '?';
    }
  }
  
  /**
   * Gets an explanation for a category boundary distractor
   * @param distractor Distractor value
   * @param fact Parsed fact
   * @returns Explanation
   */
  private getCategoryDistractorExplanation(distractor: string, fact: ParsedFact): string {
    const { operation, operand1, operand2, result } = fact;
    const opSymbol = this.getOperationSymbol(operation);
    
    return `This distractor ("${distractor}") is a non-numerical answer instead of the correct numerical result (${result}) for ${operand1} ${opSymbol} ${operand2}. It tests whether the learner understands that math problems require numerical answers.`;
  }
  
  /**
   * Gets an explanation for a magnitude boundary distractor
   * @param distractor Distractor value
   * @param fact Parsed fact
   * @returns Explanation
   */
  private getMagnitudeDistractorExplanation(distractor: string, fact: ParsedFact): string {
    const { operation, operand1, operand2, result } = fact;
    const opSymbol = this.getOperationSymbol(operation);
    
    const distractorValue = parseInt(distractor, 10);
    let magnitudeDescription: string;
    
    if (distractorValue > result) {
      magnitudeDescription = distractorValue > result * 5 
        ? "much larger than" 
        : "larger than";
    } else {
      magnitudeDescription = distractorValue < result / 5 
        ? "much smaller than" 
        : "smaller than";
    }
    
    return `This distractor (${distractor}) has a ${magnitudeDescription} the correct answer (${result}) for ${operand1} ${opSymbol} ${operand2}. It tests whether the learner understands the approximate magnitude of the result.`;
  }
  
  /**
   * Gets an explanation for an operation boundary distractor
   * @param distractor Distractor value
   * @param fact Parsed fact
   * @returns Explanation
   */
  private getOperationDistractorExplanation(distractor: string, fact: ParsedFact): string {
    const { operation, operand1, operand2, result } = fact;
    const correctOpSymbol = this.getOperationSymbol(operation);
    
    // Parse the distractor to extract the used operation
    const match = distractor.match(/(\d+)\s*([+\-×÷])\s*(\d+)\s*=\s*(\d+)/);
    if (!match) {
      return `This distractor represents the result of using a different operation than ${correctOpSymbol} with the same numbers (${operand1} and ${operand2}). It tests whether the learner knows which operation to apply.`;
    }
    
    const distractorSymbol = match[2];
    const distractorResult = match[4];
    
    let operationName: string;
    switch (distractorSymbol) {
      case '+': operationName = 'addition'; break;
      case '-': operationName = 'subtraction'; break;
      case '×': operationName = 'multiplication'; break;
      case '÷': operationName = 'division'; break;
      default: operationName = 'a different operation';
    }
    
    let correctOperationName: string;
    switch (correctOpSymbol) {
      case '+': correctOperationName = 'addition'; break;
      case '-': correctOperationName = 'subtraction'; break;
      case '×': correctOperationName = 'multiplication'; break;
      case '÷': correctOperationName = 'division'; break;
      default: correctOperationName = 'the correct operation';
    }
    
    return `This distractor represents the result of ${operationName} (${distractor}) instead of ${correctOperationName} (${operand1} ${correctOpSymbol} ${operand2} = ${result}). It tests whether the learner knows which operation to apply to the given numbers.`;
  }
  
  /**
   * Gets an explanation for a related fact boundary distractor
   * @param distractor Distractor value
   * @param fact Parsed fact
   * @returns Explanation
   */
  private getRelatedFactDistractorExplanation(distractor: string, fact: ParsedFact): string {
    const { operation, operand1, operand2, result } = fact;
    const correctOpSymbol = this.getOperationSymbol(operation);
    
    // Parse the distractor to extract the related fact
    const match = distractor.match(/(\d+)\s*([+\-×÷])\s*(\d+)\s*=\s*(\d+)/);
    if (!match) {
      return `This distractor represents the result of a related but different mathematical fact than ${operand1} ${correctOpSymbol} ${operand2} = ${result}. It tests whether the learner can distinguish between similar facts.`;
    }
    
    const relatedOperand1 = parseInt(match[1], 10);
    const relatedOperand2 = parseInt(match[3], 10);
    const relatedResult = match[4];
    
    let description: string;
    
    if (relatedOperand1 !== operand1 && relatedOperand2 !== operand2) {
      description = `both numbers changed (from ${operand1} and ${operand2} to ${relatedOperand1} and ${relatedOperand2})`;
    } else if (relatedOperand1 !== operand1) {
      description = `the first number changed (from ${operand1} to ${relatedOperand1})`;
    } else {
      description = `the second number changed (from ${operand2} to ${relatedOperand2})`;
    }
    
    return `This distractor represents a related fact (${distractor}) with ${description} compared to the correct fact (${operand1} ${correctOpSymbol} ${operand2} = ${result}). It tests whether the learner can distinguish between similar facts.`;
  }
  
  /**
   * Gets an explanation for a near miss boundary distractor
   * @param distractor Distractor value
   * @param fact Parsed fact
   * @returns Explanation
   */
  private getNearMissDistractorExplanation(distractor: string, fact: ParsedFact): string {
    const { operation, operand1, operand2, result } = fact;
    const opSymbol = this.getOperationSymbol(operation);
    
    const distractorValue = parseInt(distractor, 10);
    const difference = Math.abs(distractorValue - result);
    
    return `This distractor (${distractor}) is a near miss to the correct answer (${result}), differing by only ${difference}. It tests the learner's precise knowledge of the ${this.getOperationName(operation)} fact ${operand1} ${opSymbol} ${operand2} = ${result} versus the similar-looking value ${distractor}.`;
  }
  
  /**
   * Gets the name of an operation
   * @param operation Operation
   * @returns Name of the operation
   */
  private getOperationName(operation: 'add' | 'sub' | 'mult' | 'div'): string {
    switch (operation) {
      case 'add': return 'addition';
      case 'sub': return 'subtraction';
      case 'mult': return 'multiplication';
      case 'div': return 'division';
      default: return 'mathematical';
    }
  }
  
  /**
   * Validates a category boundary distractor
   * @param distractor Distractor value
   * @param fact Parsed fact
   * @returns Validation result
   */
  private validateCategoryDistractor(
    distractor: string,
    fact: ParsedFact
  ): { isValid: boolean; reason: string } {
    // For level 1, the distractor should be non-numerical
    const isNumerical = /^-?\d+(\.\d+)?$/.test(distractor);
    
    if (isNumerical) {
      return {
        isValid: false,
        reason: `The distractor "${distractor}" is numerical, but category boundary distractors (level 1) should be non-numerical.`
      };
    }
    
    return {
      isValid: true,
      reason: `The distractor "${distractor}" is a valid category boundary distractor for the fact, as it presents a non-numerical option instead of the correct numerical answer ${fact.result}.`
    };
  }
  
  /**
   * Validates a magnitude boundary distractor
   * @param distractor Distractor value
   * @param fact Parsed fact
   * @returns Validation result
   */
  private validateMagnitudeDistractor(
    distractor: string,
    fact: ParsedFact
  ): { isValid: boolean; reason: string } {
    // For level 2, the distractor should be numerical with significantly different magnitude
    if (!/^-?\d+(\.\d+)?$/.test(distractor)) {
      return {
        isValid: false,
        reason: `The distractor "${distractor}" is not numerical, but magnitude boundary distractors (level 2) should be numerical.`
      };
    }
    
    const distractorValue = parseFloat(distractor);
    const correctValue = fact.result;
    const ratio = distractorValue / correctValue;
    
    // Check if the magnitude is significantly different (less than 0.5x or more than 2x)
    if (ratio > 0.5 && ratio < 2) {
      return {
        isValid: false,
        reason: `The distractor "${distractor}" is too close in magnitude to the correct answer ${correctValue}. Magnitude boundary distractors (level 2) should have significantly different magnitude.`
      };
    }
    
    return {
      isValid: true,
      reason: `The distractor "${distractor}" is a valid magnitude boundary distractor for the fact, as it has a significantly different magnitude than the correct answer ${correctValue}.`
    };
  }
  
  /**
   * Validates an operation boundary distractor
   * @param distractor Distractor value
   * @param fact Parsed fact
   * @returns Validation result
   */
  private validateOperationDistractor(
    distractor: string,
    fact: ParsedFact
  ): { isValid: boolean; reason: string } {
    const { operation, operand1, operand2 } = fact;
    
    // For level 3, the distractor should represent a different operation
    // Try to parse the distractor as an equation
    const match = distractor.match(/(\d+)\s*([+\-×÷])\s*(\d+)\s*=\s*(\d+)/);
    
    if (!match) {
      // If it doesn't match the expected format, check if it's just a numerical result
      if (/^-?\d+(\.\d+)?$/.test(distractor)) {
        // Check if this numerical result matches any of the alternative operations
        const operations: Array<'add' | 'sub' | 'mult' | 'div'> = ['add', 'sub', 'mult', 'div'];
        const distractorValue = parseFloat(distractor);
        
        for (const op of operations) {
          if (op === operation) continue; // Skip the correct operation
          
          try {
            const alternativeResult = this.calculateResult(op, operand1, operand2);
            if (Math.abs(alternativeResult - distractorValue) < 0.001) {
              return {
                isValid: true,
                reason: `The distractor "${distractor}" is a valid operation boundary distractor as it represents the result of using ${this.getOperationName(op)} instead of ${this.getOperationName(operation)} with the operands ${operand1} and ${operand2}.`
              };
            }
          } catch (error) {
            // Skip invalid operations (e.g., division by zero)
            continue;
          }
        }
        
        return {
          isValid: false,
          reason: `The distractor "${distractor}" does not appear to represent the result of an alternative operation using the operands ${operand1} and ${operand2}.`
        };
      }
      
      return {
        isValid: false,
        reason: `The distractor "${distractor}" does not match the expected format for an operation boundary distractor (level 3).`
      };
    }
    
    const distractorOperand1 = parseInt(match[1], 10);
    const distractorSymbol = match[2];
    const distractorOperand2 = parseInt(match[3], 10);
    const distractorResult = parseInt(match[4], 10);
    
    // Check if the operands are the same
    if (distractorOperand1 !== operand1 || distractorOperand2 !== operand2) {
      return {
        isValid: false,
        reason: `The distractor uses different operands (${distractorOperand1} and ${distractorOperand2}) than the original fact (${operand1} and ${operand2}). Operation boundary distractors should use the same operands with a different operation.`
      };
    }
    
    // Check if the operation is different
    const distractorOperation = this.symbolToOperation(distractorSymbol);
    if (distractorOperation === operation) {
      return {
        isValid: false,
        reason: `The distractor uses the same operation (${this.getOperationName(operation)}) as the original fact. Operation boundary distractors should use a different operation.`
      };
    }
    
    // Check if the result is correct for the alternative operation
    const expectedResult = this.calculateResult(distractorOperation, operand1, operand2);
    if (Math.abs(expectedResult - distractorResult) > 0.001) {
      return {
        isValid: false,
        reason: `The distractor shows an incorrect result for ${operand1} ${distractorSymbol} ${operand2}. The expected result is ${expectedResult}, but the distractor shows ${distractorResult}.`
      };
    }
    
    return {
      isValid: true,
      reason: `The distractor "${distractor}" is a valid operation boundary distractor as it represents the result of using ${this.getOperationName(distractorOperation)} instead of ${this.getOperationName(operation)} with the same operands.`
    };
  }
  
  /**
   * Validates a related fact boundary distractor
   * @param distractor Distractor value
   * @param fact Parsed fact
   * @returns Validation result
   */
  private validateRelatedFactDistractor(
    distractor: string,
    fact: ParsedFact
  ): { isValid: boolean; reason: string } {
    const { operation, operand1, operand2 } = fact;
    
    // For level 4, the distractor should represent a related but different fact
    // Try to parse the distractor as an equation
    const match = distractor.match(/(\d+)\s*([+\-×÷])\s*(\d+)\s*=\s*(\d+)/);
    
    if (!match) {
      // If it doesn't match the expected format, check if it's just a numerical result
      if (/^-?\d+(\.\d+)?$/.test(distractor)) {
        // For simple numerical answers, we can't reliably validate if it's from a related fact
        // without additional context, so we provide a more general validation
        return {
          isValid: false,
          reason: `For related fact boundary distractors (level 4), the distractor should represent a related fact such as (${operand1+1} ${this.getOperationSymbol(operation)} ${operand2}) or (${operand1} ${this.getOperationSymbol(operation)} ${operand2+1}), not just a numerical value "${distractor}".`
        };
      }
      
      return {
        isValid: false,
        reason: `The distractor "${distractor}" does not match the expected format for a related fact boundary distractor (level 4).`
      };
    }
    
    const distractorOperand1 = parseInt(match[1], 10);
    const distractorSymbol = match[2];
    const distractorOperand2 = parseInt(match[3], 10);
    const distractorResult = parseInt(match[4], 10);
    
    // Check if the operation is the same
    const distractorOperation = this.symbolToOperation(distractorSymbol);
    if (distractorOperation !== operation) {
      return {
        isValid: false,
        reason: `The distractor uses a different operation (${this.getOperationName(distractorOperation)}) than the original fact (${this.getOperationName(operation)}). Related fact boundary distractors should use the same operation with slightly different operands.`
      };
    }
    
    // Check if the operands are slightly different
    if (distractorOperand1 === operand1 && distractorOperand2 === operand2) {
      return {
        isValid: false,
        reason: `The distractor uses the same operands (${operand1} and ${operand2}) as the original fact. Related fact boundary distractors should use slightly different operands.`
      };
    }
    
    // Check if the operands are too different (more than ±3)
    if (Math.abs(distractorOperand1 - operand1) > 3 && Math.abs(distractorOperand2 - operand2) > 3) {
      return {
        isValid: false,
        reason: `The distractor uses operands (${distractorOperand1} and ${distractorOperand2}) that are too different from the original fact (${operand1} and ${operand2}). Related fact boundary distractors should use slightly different operands.`
      };
    }
    
    // Check if the result is correct for the related fact
    const expectedResult = this.calculateResult(operation, distractorOperand1, distractorOperand2);
    if (Math.abs(expectedResult - distractorResult) > 0.001) {
      return {
        isValid: false,
        reason: `The distractor shows an incorrect result for ${distractorOperand1} ${distractorSymbol} ${distractorOperand2}. The expected result is ${expectedResult}, but the distractor shows ${distractorResult}.`
      };
    }
    
    return {
      isValid: true,
      reason: `The distractor "${distractor}" is a valid related fact boundary distractor as it represents a similar but different fact using the same operation with slightly different operands.`
    };
  }
  
  /**
   * Validates a near miss boundary distractor
   * @param distractor Distractor value
   * @param fact Parsed fact
   * @returns Validation result
   */
  private validateNearMissDistractor(
    distractor: string,
    fact: ParsedFact
  ): { isValid: boolean; reason: string } {
    // For level 5, the distractor should be a near miss to the correct answer
    if (!/^-?\d+(\.\d+)?$/.test(distractor)) {
      return {
        isValid: false,
        reason: `The distractor "${distractor}" is not numerical, but near miss boundary distractors (level 5) should be numerical values close to the correct answer.`
      };
    }
    
    const distractorValue = parseFloat(distractor);
    const correctValue = fact.result;
    const difference = Math.abs(distractorValue - correctValue);
    
    // Check if it's too far from the correct answer (more than ±5 or ±20% for larger numbers)
    const threshold = Math.max(5, correctValue * 0.2);
    if (difference > threshold) {
      return {
        isValid: false,
        reason: `The distractor "${distractor}" is too far from the correct answer ${correctValue}. Near miss boundary distractors (level 5) should be very close to the correct answer.`
      };
    }
    
    // Check if it's identical to the correct answer
    if (difference < 0.001) {
      return {
        isValid: false,
        reason: `The distractor "${distractor}" is identical to the correct answer ${correctValue}. Near miss boundary distractors (level 5) should be close to but different from the correct answer.`
      };
    }
    
    // For smaller numbers, a difference of 1-3 is ideal
    if (correctValue < 100 && difference <= 3) {
      return {
        isValid: true,
        reason: `The distractor ${distractor} is a valid near miss (boundary level 5) for the ${this.getOperationName(fact.operation)} fact ${fact.operand1} ${this.getOperationSymbol(fact.operation)} ${fact.operand2} = ${correctValue}, as it differs by only ${difference} and is likely to confuse learners who don't have precise knowledge of this fact.`
      };
    }
    
    return {
      isValid: true,
      reason: `The distractor ${distractor} is a valid near miss (boundary level 5) for the correct answer ${correctValue}, as it is close enough to confuse learners who don't have precise knowledge of the exact result.`
    };
  }
  
  /**
   * Converts an operation symbol to its corresponding operation
   * @param symbol Operation symbol
   * @returns Operation
   */
  private symbolToOperation(symbol: string): 'add' | 'sub' | 'mult' | 'div' {
    switch (symbol) {
      case '+': return 'add';
      case '-': return 'sub';
      case '×': return 'mult';
      case '÷': return 'div';
      default: throw new Error(`Invalid operation symbol: ${symbol}`);
    }
  }
}
