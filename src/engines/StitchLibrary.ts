/**
 * Stitch Library
 * Predefined learning stitches for mathematical content
 */

import { FactRepository } from './FactRepository/FactRepository';

export interface Stitch {
  id: string;
  name: string;
  description?: string;
  learningPathId: string;
  position: number;
  difficulty: number;
  factIds: string[];
  prerequisites?: string[];
  metadata?: Record<string, any>;
}

/**
 * Creates predefined math stitches based on FactRepository content
 */
export class StitchLibrary {
  private factRepository: FactRepository;
  
  constructor(factRepository: FactRepository) {
    this.factRepository = factRepository;
  }
  
  /**
   * Creates addition stitches
   */
  createAdditionStitches(): Stitch[] {
    const stitches: Stitch[] = [];
    
    // Stitch 1: Adding numbers to 5
    stitches.push({
      id: 'add-to-5',
      name: 'Adding Numbers to 5',
      description: 'Master addition facts with sums up to 5',
      learningPathId: 'addition',
      position: 1,
      difficulty: 1,
      factIds: this.getAdditionFactsWithSumRange(1, 5),
      metadata: {
        category: 'basic-addition',
        tags: ['beginner', 'number-bonds'],
        estimatedTime: 10
      }
    });
    
    // Stitch 2: Adding numbers to 10
    stitches.push({
      id: 'add-to-10',
      name: 'Adding Numbers to 10',
      description: 'Master addition facts with sums up to 10',
      learningPathId: 'addition',
      position: 2,
      difficulty: 2,
      factIds: this.getAdditionFactsWithSumRange(6, 10),
      prerequisites: ['add-to-5'],
      metadata: {
        category: 'basic-addition',
        tags: ['number-bonds', 'ten-frame'],
        estimatedTime: 15
      }
    });
    
    // Stitch 3: Doubling numbers 1-10
    stitches.push({
      id: 'doubling-1-10',
      name: 'Doubling Numbers 1-10',
      description: 'Learn to double numbers from 1 to 10',
      learningPathId: 'addition',
      position: 3,
      difficulty: 2,
      factIds: this.getDoublingFacts(1, 10),
      prerequisites: ['add-to-10'],
      metadata: {
        category: 'doubling',
        tags: ['doubling', 'patterns'],
        estimatedTime: 12
      }
    });
    
    // Stitch 4: Adding to next 10 (9+2, 8+3, etc.)
    stitches.push({
      id: 'add-near-10',
      name: 'Adding Near 10',
      description: 'Add numbers that cross 10 (9+2, 8+3, etc.)',
      learningPathId: 'addition',
      position: 4,
      difficulty: 3,
      factIds: this.getNearTenAdditionFacts(),
      prerequisites: ['add-to-10'],
      metadata: {
        category: 'bridging-ten',
        tags: ['bridging', 'mental-math'],
        estimatedTime: 18
      }
    });
    
    // Stitch 5: Adding numbers to 20
    stitches.push({
      id: 'add-to-20',
      name: 'Adding Numbers to 20',
      description: 'Master addition facts with sums up to 20',
      learningPathId: 'addition',
      position: 5,
      difficulty: 3,
      factIds: this.getAdditionFactsWithSumRange(11, 20),
      prerequisites: ['add-near-10'],
      metadata: {
        category: 'extended-addition',
        tags: ['twenty-frame', 'extended-facts'],
        estimatedTime: 20
      }
    });
    
    return stitches;
  }
  
  /**
   * Creates multiplication stitches
   */
  createMultiplicationStitches(): Stitch[] {
    const stitches: Stitch[] = [];
    
    // Create stitches for each times table
    const timesTables = [2, 5, 10, 3, 4, 6, 7, 8, 9];
    
    timesTables.forEach((table, index) => {
      stitches.push({
        id: `times-${table}`,
        name: `${table} Times Table`,
        description: `Master the ${table} times table`,
        learningPathId: 'multiplication',
        position: index + 1,
        difficulty: this.getTimesTableDifficulty(table),
        factIds: this.getTimesTableFacts(table),
        prerequisites: index > 0 ? [`times-${timesTables[index - 1]}`] : undefined,
        metadata: {
          category: 'times-tables',
          tags: ['multiplication', `${table}-times`, 'fluency'],
          estimatedTime: 15
        }
      });
    });
    
    return stitches;
  }
  
  /**
   * Creates subtraction stitches
   */
  createSubtractionStitches(): Stitch[] {
    const stitches: Stitch[] = [];
    
    // Stitch 1: Subtracting from numbers to 10
    stitches.push({
      id: 'sub-from-10',
      name: 'Subtracting from 10',
      description: 'Master subtraction facts from numbers up to 10',
      learningPathId: 'subtraction',
      position: 1,
      difficulty: 2,
      factIds: this.getSubtractionFactsFromRange(1, 10),
      metadata: {
        category: 'basic-subtraction',
        tags: ['number-bonds', 'inverse-addition'],
        estimatedTime: 15
      }
    });
    
    // Stitch 2: Subtracting from numbers to 20
    stitches.push({
      id: 'sub-from-20',
      name: 'Subtracting from 20',
      description: 'Master subtraction facts from numbers up to 20',
      learningPathId: 'subtraction',
      position: 2,
      difficulty: 3,
      factIds: this.getSubtractionFactsFromRange(11, 20),
      prerequisites: ['sub-from-10'],
      metadata: {
        category: 'extended-subtraction',
        tags: ['bridging-ten', 'mental-strategies'],
        estimatedTime: 18
      }
    });
    
    return stitches;
  }
  
  /**
   * Creates division stitches
   */
  createDivisionStitches(): Stitch[] {
    const stitches: Stitch[] = [];
    
    // Create division stitches based on times tables
    const timesTables = [2, 5, 10, 3, 4, 6, 7, 8, 9];
    
    timesTables.forEach((table, index) => {
      stitches.push({
        id: `div-by-${table}`,
        name: `Dividing by ${table}`,
        description: `Master division facts for dividing by ${table}`,
        learningPathId: 'division',
        position: index + 1,
        difficulty: this.getTimesTableDifficulty(table),
        factIds: this.getDivisionByNumberFacts(table),
        prerequisites: index > 0 ? [`div-by-${timesTables[index - 1]}`] : undefined,
        metadata: {
          category: 'division-facts',
          tags: ['division', `divide-by-${table}`, 'inverse-multiplication'],
          estimatedTime: 15
        }
      });
    });
    
    return stitches;
  }
  
  /**
   * Gets all stitches for all learning paths
   */
  getAllStitches(): Stitch[] {
    return [
      ...this.createAdditionStitches(),
      ...this.createMultiplicationStitches(),
      ...this.createSubtractionStitches(),
      ...this.createDivisionStitches()
    ];
  }
  
  // Helper methods to get specific fact sets
  
  private getAdditionFactsWithSumRange(minSum: number, maxSum: number): string[] {
    const facts = this.factRepository.getFactsByOperation('addition');
    return facts
      .filter(fact => fact.result >= minSum && fact.result <= maxSum)
      .map(fact => fact.id)
      .slice(0, 20); // Limit to ~20 facts per stitch
  }
  
  private getDoublingFacts(min: number, max: number): string[] {
    const facts = this.factRepository.getFactsByOperation('addition');
    return facts
      .filter(fact => 
        fact.operands[0] === fact.operands[1] && 
        fact.operands[0] >= min && 
        fact.operands[0] <= max
      )
      .map(fact => fact.id);
  }
  
  private getNearTenAdditionFacts(): string[] {
    const facts = this.factRepository.getFactsByOperation('addition');
    return facts
      .filter(fact => {
        const [a, b] = fact.operands;
        // Facts like 9+2, 8+3, 7+4, etc. that cross 10
        return (a >= 7 && a <= 9 && b >= 2 && b <= 5 && fact.result > 10);
      })
      .map(fact => fact.id)
      .slice(0, 15);
  }
  
  private getTimesTableFacts(table: number): string[] {
    const facts = this.factRepository.getFactsByOperation('multiplication');
    return facts
      .filter(fact => 
        (fact.operands[0] === table || fact.operands[1] === table) &&
        Math.max(fact.operands[0], fact.operands[1]) <= 12 // Up to 12x table
      )
      .map(fact => fact.id);
  }
  
  private getSubtractionFactsFromRange(min: number, max: number): string[] {
    const facts = this.factRepository.getFactsByOperation('subtraction');
    return facts
      .filter(fact => fact.operands[0] >= min && fact.operands[0] <= max)
      .map(fact => fact.id)
      .slice(0, 20);
  }
  
  private getDivisionByNumberFacts(divisor: number): string[] {
    const facts = this.factRepository.getFactsByOperation('division');
    return facts
      .filter(fact => fact.operands[1] === divisor)
      .map(fact => fact.id);
  }
  
  private getTimesTableDifficulty(table: number): number {
    // Difficulty based on common perception of times tables
    const difficultyMap: Record<number, number> = {
      2: 1, 5: 1, 10: 1,  // Easy
      3: 2, 4: 2,          // Medium-easy
      6: 3, 7: 4, 8: 4, 9: 4  // Harder
    };
    return difficultyMap[table] || 3;
  }
}