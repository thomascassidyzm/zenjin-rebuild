/**
 * StitchPopulation.ts
 * Implementation of StitchPopulationInterface
 * Following LIVE_AID_IMPLEMENTATION_ALGORITHMS.apml
 * 
 * Maps curriculum concepts to fact selection and implements the 90/10 surprise distribution.
 * Core foundation for the Live Aid content layer.
 */

import StitchPopulationInterface, {
  ConceptMapping,
  FactQuery,
  FactCriteria,
  QuestionFormat,
  TubePopulationStrategy,
  StitchPopulationResult,
  CurriculumPopulationResult,
  StitchPopulationErrorCode
} from '../interfaces/StitchPopulationInterface';
import { StitchId, TubeId } from '../interfaces/StitchManagerInterface';

/**
 * Implementation of concept-to-fact query translation algorithm
 * Following LIVE_AID_IMPLEMENTATION_ALGORITHMS.apml Step-by-Step Process
 */
export class StitchPopulation implements StitchPopulationInterface {
  private factRepository: any; // TODO: Import proper FactRepository interface
  private tubeStrategies: Map<TubeId, TubePopulationStrategy>;
  
  constructor(factRepository: any) {
    this.factRepository = factRepository;
    this.tubeStrategies = this.initializeTubeStrategies();
  }

  /**
   * Initialize the three-tube curriculum following doubling/halving foundation
   * Based on curriculum insights from LIVE_AID_IMPLEMENTATION_ALGORITHMS.apml
   */
  private initializeTubeStrategies(): Map<TubeId, TubePopulationStrategy> {
    const strategies = new Map<TubeId, TubePopulationStrategy>();
    
    // Tube 1: Doubling/Halving Multiplicative Base (~20 stitches)
    strategies.set('tube1' as TubeId, {
      tubeId: 'tube1' as TubeId,
      progressionType: 'complexity_based',
      conceptMappings: this.generateDoublingHalvingConcepts(),
      surpriseRate: 0.1, // 10% surprise stitches
      surpriseConcepts: ['strategic_addition', 'strategic_subtraction']
    });
    
    // Tube 2: Backwards Multiplication (19× → 3×, 17 stitches)
    strategies.set('tube2' as TubeId, {
      tubeId: 'tube2' as TubeId,
      progressionType: 'backward',
      conceptMappings: this.generateBackwardsMultiplicationConcepts(),
      surpriseRate: 0.1,
      surpriseConcepts: ['division_as_algebra', 'doubling_cross_reference']
    });
    
    // Tube 3: Division as Algebra
    strategies.set('tube3' as TubeId, {
      tubeId: 'tube3' as TubeId,
      progressionType: 'complexity_based',
      conceptMappings: this.generateDivisionAlgebraConcepts(),
      surpriseRate: 0.1,
      surpriseConcepts: ['halving_cross_reference', 'backwards_multiplication']
    });
    
    return strategies;
  }

  /**
   * Concept-to-Fact Query Translation Algorithm
   * Step 1-6 from LIVE_AID_IMPLEMENTATION_ALGORITHMS.apml
   */
  async populateStitch(conceptMapping: ConceptMapping, stitchId: StitchId): Promise<StitchPopulationResult> {
    try {
      // Step 1: Parse ConceptMapping.conceptName to determine operation type
      const operationType = this.parseOperationType(conceptMapping.conceptName);
      
      // Step 2: Extract complexity level from concept
      const complexityLevel = this.extractComplexityLevel(conceptMapping.conceptName);
      
      // Step 3: Build FactQuery with specific criteria
      const factQuery: FactQuery = {
        operation: operationType,
        criteria: this.buildFactCriteria(conceptMapping, complexityLevel),
        maxFacts: 20
      };
      
      // Step 4: Add exclusion criteria for recently used facts
      factQuery.criteria.excludeFactIds = await this.getRecentlyUsedFacts(stitchId);
      
      // Step 5: Execute query against FactRepository with validation
      const selectedFacts = await this.executeFactQuery(factQuery);
      
      // Step 6: If insufficient facts (<20), expand criteria or flag concept as under-populated
      if (selectedFacts.length < 20) {
        const expandedFacts = await this.expandFactCriteria(factQuery);
        if (expandedFacts.length < 20) {
          throw new Error(`${StitchPopulationErrorCode.INSUFFICIENT_FACTS}: Only ${expandedFacts.length} facts available for concept ${conceptMapping.conceptName}`);
        }
        selectedFacts.push(...expandedFacts.slice(selectedFacts.length));
      }
      
      return {
        stitchId,
        conceptCode: conceptMapping.conceptCode,
        conceptName: conceptMapping.conceptName,
        factIds: selectedFacts.map(fact => fact.id),
        questionFormat: conceptMapping.questionFormat,
        populationTimestamp: new Date().toISOString(),
        isSurprise: false // Will be determined by surprise generation
      };
      
    } catch (error) {
      throw new Error(`${StitchPopulationErrorCode.POPULATION_FAILED}: ${error.message}`);
    }
  }

  /**
   * Doubling/Halving Number Ending Selection Algorithm
   * Following LIVE_AID_IMPLEMENTATION_ALGORITHMS.apml complexity bands
   */
  private buildFactCriteria(conceptMapping: ConceptMapping, complexityLevel: string): FactCriteria {
    const criteria: FactCriteria = {};
    
    if (conceptMapping.conceptName.includes('doubling') || conceptMapping.conceptName.includes('halving')) {
      // Step 1-2: Determine complexity band and build number pool
      switch (complexityLevel) {
        case 'easy': // 0/5 endings
          criteria.numberEndings = ['0', '5'];
          criteria.numberRange = [10, 50];
          break;
        case 'medium': // 1-4 endings
          criteria.numberEndings = ['1', '2', '3', '4'];
          criteria.numberRange = [11, 49];
          break;
        case 'hard': // 6-9 endings
          criteria.numberEndings = ['6', '7', '8', '9'];
          criteria.numberRange = [16, 49];
          break;
      }
      
      // Step 3: Filter by operation appropriateness
      if (conceptMapping.conceptName.includes('doubling')) {
        criteria.patternType = 'ensure_double_under_100';
      } else if (conceptMapping.conceptName.includes('halving')) {
        criteria.patternType = 'prioritize_even_include_half_numbers';
      }
    }
    
    if (conceptMapping.conceptName.includes('multiplication')) {
      // Backwards Multiplication Table Selection Algorithm
      // Step 1: Parse concept code to determine table number
      const tableNumber = this.parseTableNumber(conceptMapping.conceptCode);
      criteria.tableNumber = tableNumber;
      criteria.numberRange = [1, 12]; // Standard times table range
      criteria.patternType = 'skip_trivial_include_decimals';
    }
    
    return criteria;
  }

  /**
   * 90/10 Surprise Distribution Algorithm
   * Steps 1-5 from LIVE_AID_IMPLEMENTATION_ALGORITHMS.apml
   */
  generateSurpriseStitches(strategy: TubePopulationStrategy, stitchCount: number): {
    position: number;
    conceptCode: string;
    stitchId: StitchId;
  }[] {
    // Step 1: Calculate total stitches across all tubes (approximated)
    const totalStitches = 60; // ~20 per tube as per curriculum design
    
    // Step 2: Determine surprise stitch count: totalStitches × 0.1
    const surpriseCount = Math.floor(totalStitches * strategy.surpriseRate);
    const tubeSupriseCount = Math.floor(surpriseCount / 3); // Distribute across 3 tubes
    
    const surprises: { position: number; conceptCode: string; stitchId: StitchId }[] = [];
    
    // Step 4: Select surprise positions using pseudo-random spacing
    const positions = this.generateSurprisePositions(stitchCount, tubeSupriseCount);
    
    // Step 5: Select surprise concepts that maintain cognitive disruption
    positions.forEach((position, index) => {
      const surpriseConcept = this.selectSurpriseConcept(strategy, index);
      surprises.push({
        position,
        conceptCode: `surprise_${position}_${surpriseConcept}`,
        stitchId: `${strategy.tubeId}-surprise-${position}` as StitchId
      });
    });
    
    return surprises;
  }

  /**
   * Generate surprise positions with strategic spacing
   * Avoid first 3 or last 3 positions, minimum 3 stitches between surprises
   */
  private generateSurprisePositions(stitchCount: number, surpriseCount: number): number[] {
    const positions: number[] = [];
    const minPosition = 3;
    const maxPosition = stitchCount - 3;
    const minSpacing = 3;
    
    // Use deterministic pseudo-random for consistency
    let seed = 12345; // TODO: Use user ID as seed
    
    for (let i = 0; i < surpriseCount; i++) {
      let position: number;
      let attempts = 0;
      
      do {
        seed = (seed * 1103515245 + 12345) % Math.pow(2, 31);
        position = minPosition + (seed % (maxPosition - minPosition + 1));
        attempts++;
      } while (attempts < 100 && positions.some(p => Math.abs(p - position) < minSpacing));
      
      if (attempts < 100) {
        positions.push(position);
      }
    }
    
    return positions.sort((a, b) => a - b);
  }

  /**
   * Generate concept mappings for Tube 1: Doubling/Halving
   * Following curriculum foundation from LIVE_AID_IMPLEMENTATION_ALGORITHMS.apml
   */
  private generateDoublingHalvingConcepts(): ConceptMapping[] {
    const concepts: ConceptMapping[] = [];
    
    // Easy concepts (0001-0007): 0/5 endings
    for (let i = 1; i <= 7; i++) {
      concepts.push({
        conceptCode: i.toString().padStart(4, '0'),
        conceptName: `doubling_0_5_endings_${i}`,
        tubeId: 'tube1' as TubeId,
        factQuery: {
          operation: 'doubling',
          criteria: { numberEndings: ['0', '5'], numberRange: [10, 50] },
          maxFacts: 20
        },
        questionFormat: {
          template: 'Double {number}',
          answerType: 'numeric'
        }
      });
    }
    
    // Medium concepts (0008-0014): 1-4 endings
    for (let i = 8; i <= 14; i++) {
      concepts.push({
        conceptCode: i.toString().padStart(4, '0'),
        conceptName: `doubling_1_4_endings_${i}`,
        tubeId: 'tube1' as TubeId,
        factQuery: {
          operation: 'doubling',
          criteria: { numberEndings: ['1', '2', '3', '4'], numberRange: [11, 49] },
          maxFacts: 20
        },
        questionFormat: {
          template: 'Double {number}',
          answerType: 'numeric'
        }
      });
    }
    
    // Hard concepts (0015-0020): 6-9 endings
    for (let i = 15; i <= 20; i++) {
      concepts.push({
        conceptCode: i.toString().padStart(4, '0'),
        conceptName: `doubling_6_9_endings_${i}`,
        tubeId: 'tube1' as TubeId,
        factQuery: {
          operation: 'doubling',
          criteria: { numberEndings: ['6', '7', '8', '9'], numberRange: [16, 49] },
          maxFacts: 20
        },
        questionFormat: {
          template: 'Double {number}',
          answerType: 'numeric'
        }
      });
    }
    
    return concepts;
  }

  /**
   * Generate concept mappings for Tube 2: Backwards Multiplication
   * 19× → 18× → 17× → ... → 3× (skip 1×, 2× as trivial)
   */
  private generateBackwardsMultiplicationConcepts(): ConceptMapping[] {
    const concepts: ConceptMapping[] = [];
    
    // Generate backwards from 19× to 3×
    for (let table = 19; table >= 3; table--) {
      concepts.push({
        conceptCode: table.toString().padStart(4, '0'),
        conceptName: `multiplication_${table}x`,
        tubeId: 'tube2' as TubeId,
        factQuery: {
          operation: 'multiplication',
          criteria: { tableNumber: table, numberRange: [1, 12] },
          maxFacts: 20
        },
        questionFormat: {
          template: '{table} × {multiplier}',
          answerType: 'numeric'
        }
      });
    }
    
    return concepts;
  }

  /**
   * Generate concept mappings for Tube 3: Division as Algebra
   * Format: "□ × 7 = 35" instead of "35 ÷ 7 = ?"
   */
  private generateDivisionAlgebraConcepts(): ConceptMapping[] {
    const concepts: ConceptMapping[] = [];
    
    // Generate division concepts as algebraic format
    for (let i = 1; i <= 20; i++) {
      concepts.push({
        conceptCode: (2000 + i).toString(),
        conceptName: `division_algebra_${i}`,
        tubeId: 'tube3' as TubeId,
        factQuery: {
          operation: 'division',
          criteria: { patternType: 'clean_division_no_remainders' },
          maxFacts: 20
        },
        questionFormat: {
          template: '□ × {divisor} = {dividend}',
          answerType: 'numeric',
          variableNotation: '□'
        }
      });
    }
    
    return concepts;
  }

  // Helper methods for algorithm implementation
  private parseOperationType(conceptName: string): string {
    if (conceptName.includes('doubling')) return 'doubling';
    if (conceptName.includes('halving')) return 'halving';
    if (conceptName.includes('multiplication')) return 'multiplication';
    if (conceptName.includes('division')) return 'division';
    throw new Error(`${StitchPopulationErrorCode.CONCEPT_NOT_FOUND}: Unknown operation in ${conceptName}`);
  }

  private extractComplexityLevel(conceptName: string): string {
    if (conceptName.includes('0_5_endings')) return 'easy';
    if (conceptName.includes('1_4_endings')) return 'medium';
    if (conceptName.includes('6_9_endings')) return 'hard';
    return 'medium'; // Default
  }

  private parseTableNumber(conceptCode: string): number {
    const num = parseInt(conceptCode);
    if (num >= 3 && num <= 19) return num;
    throw new Error(`${StitchPopulationErrorCode.INVALID_CONCEPT_CODE}: Invalid table number ${conceptCode}`);
  }

  private async getRecentlyUsedFacts(stitchId: StitchId): Promise<string[]> {
    // TODO: Implement recent fact tracking
    return [];
  }

  private async executeFactQuery(factQuery: FactQuery): Promise<any[]> {
    // TODO: Implement actual FactRepository query
    return [];
  }

  private async expandFactCriteria(factQuery: FactQuery): Promise<any[]> {
    // TODO: Implement criteria expansion logic
    return [];
  }

  private selectSurpriseConcept(strategy: TubePopulationStrategy, index: number): string {
    return strategy.surpriseConcepts[index % strategy.surpriseConcepts.length];
  }

  // Interface implementation (remaining methods)
  async populateTube(strategy: TubePopulationStrategy): Promise<StitchPopulationResult[]> {
    const results: StitchPopulationResult[] = [];
    
    for (const conceptMapping of strategy.conceptMappings) {
      const stitchId = `${strategy.tubeId}-${conceptMapping.conceptCode}` as StitchId;
      const result = await this.populateStitch(conceptMapping, stitchId);
      results.push(result);
    }
    
    return results;
  }

  async populateCompleteCurriculum(): Promise<CurriculumPopulationResult> {
    const tube1Results = await this.populateTube(this.tubeStrategies.get('tube1' as TubeId)!);
    const tube2Results = await this.populateTube(this.tubeStrategies.get('tube2' as TubeId)!);
    const tube3Results = await this.populateTube(this.tubeStrategies.get('tube3' as TubeId)!);
    
    const totalStitches = tube1Results.length + tube2Results.length + tube3Results.length;
    const surpriseStitches = Math.floor(totalStitches * 0.1);
    
    return {
      tube1Stitches: tube1Results,
      tube2Stitches: tube2Results,
      tube3Stitches: tube3Results,
      totalStitches,
      surpriseStitches,
      populationStrategy: 'Doubling/Halving Foundation with 90/10 Surprise Distribution'
    };
  }

  async getConceptMapping(conceptCode: string, tubeId: TubeId): Promise<ConceptMapping> {
    const strategy = this.tubeStrategies.get(tubeId);
    if (!strategy) {
      throw new Error(`${StitchPopulationErrorCode.INVALID_TUBE_STRATEGY}: No strategy for ${tubeId}`);
    }
    
    const mapping = strategy.conceptMappings.find(m => m.conceptCode === conceptCode);
    if (!mapping) {
      throw new Error(`${StitchPopulationErrorCode.CONCEPT_NOT_FOUND}: Concept ${conceptCode} not found in ${tubeId}`);
    }
    
    return mapping;
  }

  validateConceptMapping(conceptMapping: ConceptMapping): {
    isValid: boolean;
    availableFactCount: number;
    requiredFactCount: number;
    missingCriteria?: string[];
  } {
    // TODO: Implement validation logic
    return {
      isValid: true,
      availableFactCount: 20,
      requiredFactCount: 20
    };
  }

  getConceptProgression(tubeId: TubeId): string[] {
    const strategy = this.tubeStrategies.get(tubeId);
    if (!strategy) {
      throw new Error(`${StitchPopulationErrorCode.INVALID_TUBE_STRATEGY}: No strategy for ${tubeId}`);
    }
    
    return strategy.conceptMappings.map(m => m.conceptCode);
  }
}

export default StitchPopulation;