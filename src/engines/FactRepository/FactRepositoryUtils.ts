/**
 * Utility functions for the FactRepository component
 * This file contains helper functions for working with mathematical facts
 */

import { MathematicalFact, FactQuery, MathOperation, DifficultyLevel } from './fact-repository-types';

/**
 * Formats a mathematical fact for display
 * @param fact The mathematical fact to format
 * @returns A string representation of the fact
 */
export function formatFact(fact: MathematicalFact): string {
  switch (fact.operation) {
    case MathOperation.ADDITION:
      return `${fact.operands[0]} + ${fact.operands[1]} = ${fact.result}`;
    case MathOperation.SUBTRACTION:
      return `${fact.operands[0]} - ${fact.operands[1]} = ${fact.result}`;
    case MathOperation.MULTIPLICATION:
      return `${fact.operands[0]} × ${fact.operands[1]} = ${fact.result}`;
    case MathOperation.DIVISION:
      return `${fact.operands[0]} ÷ ${fact.operands[1]} = ${fact.result}`;
    default:
      return `${fact.operands.join(' ')} = ${fact.result}`;
  }
}

/**
 * Creates a fact ID based on operation and operands
 * @param operation The mathematical operation
 * @param operands The operands involved
 * @returns A fact ID string
 */
export function createFactId(operation: string, operands: number[]): string {
  const opPrefix = getOperationPrefix(operation);
  return `${opPrefix}-${operands.join('-')}`;
}

/**
 * Gets a short prefix for an operation
 * @param operation The mathematical operation
 * @returns A short prefix string
 */
export function getOperationPrefix(operation: string): string {
  switch (operation) {
    case MathOperation.ADDITION:
      return 'add';
    case MathOperation.SUBTRACTION:
      return 'sub';
    case MathOperation.MULTIPLICATION:
      return 'mult';
    case MathOperation.DIVISION:
      return 'div';
    default:
      return operation.substring(0, 4);
  }
}

/**
 * Groups facts by type (doubling, halving, etc.)
 * @param facts Array of mathematical facts
 * @returns Object mapping types to arrays of facts
 */
export function groupFactsByType(facts: MathematicalFact[]): Record<string, MathematicalFact[]> {
  const result: Record<string, MathematicalFact[]> = {
    'doubling': [],
    'halving': [],
    'addition': [],
    'subtraction': [],
    'multiplication': [],
    'division': [],
    'times-tables': [],
    'other': []
  };
  
  for (const fact of facts) {
    // Check for specific tags first
    if (fact.tags?.includes('doubling')) {
      result['doubling'].push(fact);
    }
    
    if (fact.tags?.includes('halving')) {
      result['halving'].push(fact);
    }
    
    if (fact.tags?.includes('times-tables')) {
      result['times-tables'].push(fact);
    }
    
    // Group by operation
    if (result[fact.operation]) {
      result[fact.operation].push(fact);
    } else {
      result['other'].push(fact);
    }
  }
  
  return result;
}

/**
 * Creates a query for facts with a specific difficulty level
 * @param operation Optional operation filter
 * @param level Difficulty level
 * @returns A fact query object
 */
export function createDifficultyLevelQuery(operation: string | undefined, level: DifficultyLevel): FactQuery {
  let min = 0;
  let max = 1;
  
  switch (level) {
    case DifficultyLevel.LEVEL_1:
      min = 0; max = 0.2;
      break;
    case DifficultyLevel.LEVEL_2:
      min = 0.2; max = 0.4;
      break;
    case DifficultyLevel.LEVEL_3:
      min = 0.4; max = 0.6;
      break;
    case DifficultyLevel.LEVEL_4:
      min = 0.6; max = 0.8;
      break;
    case DifficultyLevel.LEVEL_5:
      min = 0.8; max = 1;
      break;
  }
  
  return {
    operation,
    difficulty: { min, max },
    tags: [level]
  };
}

/**
 * Finds facts with the same result for a different operation
 * @param fact The source fact
 * @param targetOperation The target operation
 * @param facts Array of all available facts
 * @returns Array of facts with the same result
 */
export function findFactsWithSameResult(
  fact: MathematicalFact, 
  targetOperation: string, 
  facts: MathematicalFact[]
): MathematicalFact[] {
  return facts.filter(f => 
    f.operation === targetOperation && 
    f.result === fact.result &&
    f.id !== fact.id
  );
}

/**
 * Creates inverse fact based on the given fact
 * @param fact The source fact
 * @returns The inverse fact (e.g., addition → subtraction, multiplication → division)
 */
export function createInverseFact(fact: MathematicalFact): MathematicalFact | null {
  switch (fact.operation) {
    case MathOperation.ADDITION:
      // a + b = c → c - b = a
      return {
        id: createFactId(MathOperation.SUBTRACTION, [fact.result, fact.operands[1]]),
        operation: MathOperation.SUBTRACTION,
        operands: [fact.result, fact.operands[1]],
        result: fact.operands[0],
        difficulty: (fact.difficulty || 0.5) + 0.1, // Subtraction is slightly harder
        relatedFactIds: [fact.id],
        tags: ['subtraction', 'inverse']
      };
      
    case MathOperation.SUBTRACTION:
      // a - b = c → a - c = b
      return {
        id: createFactId(MathOperation.ADDITION, [fact.operands[1], fact.result]),
        operation: MathOperation.ADDITION,
        operands: [fact.operands[1], fact.result],
        result: fact.operands[0],
        difficulty: (fact.difficulty || 0.5) - 0.1, // Addition is slightly easier
        relatedFactIds: [fact.id],
        tags: ['addition', 'inverse']
      };
      
    case MathOperation.MULTIPLICATION:
      // a * b = c → c / b = a
      if (fact.operands[1] === 0) return null; // Can't divide by zero
      
      return {
        id: createFactId(MathOperation.DIVISION, [fact.result, fact.operands[1]]),
        operation: MathOperation.DIVISION,
        operands: [fact.result, fact.operands[1]],
        result: fact.operands[0],
        difficulty: (fact.difficulty || 0.5) + 0.1, // Division is slightly harder
        relatedFactIds: [fact.id],
        tags: ['division', 'inverse']
      };
      
    case MathOperation.DIVISION:
      // a / b = c → a = c * b
      return {
        id: createFactId(MathOperation.MULTIPLICATION, [fact.result, fact.operands[1]]),
        operation: MathOperation.MULTIPLICATION,
        operands: [fact.result, fact.operands[1]],
        result: fact.operands[0],
        difficulty: (fact.difficulty || 0.5) - 0.1, // Multiplication is slightly easier
        relatedFactIds: [fact.id],
        tags: ['multiplication', 'inverse']
      };
      
    default:
      return null;
  }
}

/**
 * Generates a fact description suitable for display to students
 * @param fact The mathematical fact
 * @returns A user-friendly description string
 */
export function generateFactDescription(fact: MathematicalFact): string {
  const difficultyText = getDifficultyDescription(fact.difficulty || 0.5);
  
  switch (fact.operation) {
    case MathOperation.ADDITION:
      return `Adding ${fact.operands[0]} and ${fact.operands[1]} equals ${fact.result}. (${difficultyText})`;
    
    case MathOperation.SUBTRACTION:
      return `${fact.operands[0]} minus ${fact.operands[1]} equals ${fact.result}. (${difficultyText})`;
    
    case MathOperation.MULTIPLICATION:
      return `${fact.operands[0]} multiplied by ${fact.operands[1]} equals ${fact.result}. (${difficultyText})`;
    
    case MathOperation.DIVISION:
      return `${fact.operands[0]} divided by ${fact.operands[1]} equals ${fact.result}. (${difficultyText})`;
    
    default:
      return `${fact.operands.join(' ')} equals ${fact.result}. (${difficultyText})`;
  }
}

/**
 * Gets a text description of a difficulty value
 * @param difficulty The difficulty value (0.0-1.0)
 * @returns A text description
 */
function getDifficultyDescription(difficulty: number): string {
  if (difficulty < 0.2) return 'Very Easy';
  if (difficulty < 0.4) return 'Easy';
  if (difficulty < 0.6) return 'Medium';
  if (difficulty < 0.8) return 'Hard';
  return 'Very Hard';
}
