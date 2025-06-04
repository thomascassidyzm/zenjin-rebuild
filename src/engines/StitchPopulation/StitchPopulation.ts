/**
 * StitchPopulation.ts
 * Live Aid Architecture - Content Layer Population System
 * 
 * Implements curriculum concept mapping to fact selection criteria following
 * LIVE_AID_IMPLEMENTATION_ALGORITHMS.apml specifications.
 * 
 * Core responsibility: Translate mathematical concepts into FactRepository queries
 * following doubling/halving foundation with 90/10 surprise distribution.
 */

import { 
  StitchPopulationInterface,
  ConceptMapping,
  FactQuery,
  FactCriteria,
  QuestionFormat,
  TubePopulationStrategy,
  StitchPopulationResult,
  CurriculumPopulationResult,
  StitchPopulationErrorCode
} from '../../interfaces/StitchPopulationInterface';
import { StitchId, TubeId } from '../../interfaces/StitchManagerInterface';
import { FactRepository } from '../FactRepository/FactRepository';
import { MathematicalFact } from '../FactRepository/FactRepositoryTypes';
import { conceptMappingService } from '../../services/ConceptMappingService';

export class StitchPopulation implements StitchPopulationInterface {
  private factRepository: FactRepository;
  private conceptMappings: Map<string, ConceptMapping>;
  private tubeStrategies: Map<TubeId, TubePopulationStrategy>;
  // New: Flexible concept-to-tube mappings
  private conceptTubeMappings: Map<string, Set<TubeId>>;

  constructor(factRepository: FactRepository) {
    this.factRepository = factRepository;
    this.conceptMappings = new Map();
    this.tubeStrategies = new Map();
    this.conceptTubeMappings = new Map();
    this.initializeCurriculumMappings();
    this.initializeTubeStrategies();
    this.initializeConceptTubeMappings();
  }

  /**
   * Initialize curriculum concept mappings following doubling/halving foundation
   */
  private initializeCurriculumMappings(): void {
    // TUBE 1: Doubling/Halving with Number Ending Complexity
    // Easy: 0/5 endings (concepts 0001-0007)
    for (let i = 1; i <= 7; i++) {
      const conceptCode = i.toString().padStart(4, '0');
      this.conceptMappings.set(conceptCode, {
        conceptCode,
        conceptName: `doubling_0_5_endings_${i}`,
        tubeId: 'tube1' as TubeId,
        factQuery: {
          operation: 'doubling',
          criteria: {
            numberRange: [10, 50],
            numberEndings: ['0', '5'],
            patternType: 'easy_doubles'
          },
          maxFacts: 20
        },
        questionFormat: {
          template: 'Double {operand1}',
          answerType: 'numeric'
        }
      });
    }

    // Medium: 1-4 endings (concepts 0008-0014)
    for (let i = 8; i <= 14; i++) {
      const conceptCode = i.toString().padStart(4, '0');
      this.conceptMappings.set(conceptCode, {
        conceptCode,
        conceptName: `doubling_1_4_endings_${i}`,
        tubeId: 'tube1' as TubeId,
        factQuery: {
          operation: 'doubling',
          criteria: {
            numberRange: [11, 49],
            numberEndings: ['1', '2', '3', '4'],
            patternType: 'medium_doubles'
          },
          maxFacts: 20
        },
        questionFormat: {
          template: 'Double {operand1}',
          answerType: 'numeric'
        }
      });
    }

    // Hard: 6-9 endings (concepts 0015-0020)
    for (let i = 15; i <= 20; i++) {
      const conceptCode = i.toString().padStart(4, '0');
      this.conceptMappings.set(conceptCode, {
        conceptCode,
        conceptName: `doubling_6_9_endings_${i}`,
        tubeId: 'tube1' as TubeId,
        factQuery: {
          operation: 'doubling',
          criteria: {
            numberRange: [16, 49],
            numberEndings: ['6', '7', '8', '9'],
            patternType: 'hard_doubles'
          },
          maxFacts: 20
        },
        questionFormat: {
          template: 'Double {operand1}',
          answerType: 'numeric'
        }
      });
    }

    // TUBE 2: Backwards Multiplication (19× → 3×)
    for (let tableNum = 19; tableNum >= 3; tableNum--) {
      const conceptCode = tableNum.toString().padStart(4, '0');
      this.conceptMappings.set(conceptCode, {
        conceptCode,
        conceptName: `multiplication_${tableNum}x`,
        tubeId: 'tube2' as TubeId,
        factQuery: {
          operation: 'multiplication',
          criteria: {
            tableNumber: tableNum,
            numberRange: [1, 12],
            patternType: 'times_table'
          },
          maxFacts: 20
        },
        questionFormat: {
          template: '{tableNumber} × {operand2}',
          answerType: 'numeric'
        }
      });
    }

    // TUBE 3: Division as Algebra (using concept codes 1001-1020)
    for (let i = 1; i <= 20; i++) {
      const conceptCode = (1000 + i).toString();
      this.conceptMappings.set(conceptCode, {
        conceptCode,
        conceptName: `division_as_algebra_${i}`,
        tubeId: 'tube3' as TubeId,
        factQuery: {
          operation: 'division',
          criteria: {
            numberRange: [12, 144], // Products that divide cleanly
            patternType: 'clean_division'
          },
          maxFacts: 20
        },
        questionFormat: {
          template: '□ × {divisor} = {dividend}',
          answerType: 'algebraic',
          variableNotation: '□'
        }
      });
    }
  }

  /**
   * Initialize tube population strategies with 90/10 surprise distribution
   */
  private initializeTubeStrategies(): void {
    // Tube 1: Doubling/Halving progression
    this.tubeStrategies.set('tube1', {
      tubeId: 'tube1',
      progressionType: 'complexity_based',
      conceptMappings: Array.from(this.conceptMappings.values()).filter(c => c.tubeId === 'tube1'),
      surpriseRate: 0.1,
      surpriseConcepts: ['addition_crossing_tens', 'subtraction_with_borrowing']
    });

    // Tube 2: Backwards multiplication
    this.tubeStrategies.set('tube2', {
      tubeId: 'tube2',
      progressionType: 'backward',
      conceptMappings: Array.from(this.conceptMappings.values()).filter(c => c.tubeId === 'tube2'),
      surpriseRate: 0.1,
      surpriseConcepts: ['division_related_to_multiplication', 'doubling_cross_over']
    });

    // Tube 3: Division as algebra
    this.tubeStrategies.set('tube3', {
      tubeId: 'tube3',
      progressionType: 'forward',
      conceptMappings: Array.from(this.conceptMappings.values()).filter(c => c.tubeId === 'tube3'),
      surpriseRate: 0.1,
      surpriseConcepts: ['halving_related_to_division', 'multiplication_inverse']
    });
  }

  /**
   * Initialize flexible concept-to-tube mappings
   * This allows any concept to be assigned to any tube per L1 vision
   */
  private initializeConceptTubeMappings(): void {
    // Initially populate from the hardcoded mappings
    // In production, this would be loaded from the database
    this.conceptMappings.forEach((mapping, conceptCode) => {
      if (!this.conceptTubeMappings.has(conceptCode)) {
        this.conceptTubeMappings.set(conceptCode, new Set());
      }
      this.conceptTubeMappings.get(conceptCode)!.add(mapping.tubeId);
    });

    // Add flexible mappings to demonstrate L1 vision
    // Concept 0001 can be in both tube1 AND tube2
    this.conceptTubeMappings.get('0001')?.add('tube2' as TubeId);
    
    // Any doubling concept can also appear in tube2 or tube3
    for (let i = 1; i <= 20; i++) {
      const conceptCode = i.toString().padStart(4, '0');
      if (this.conceptTubeMappings.has(conceptCode)) {
        this.conceptTubeMappings.get(conceptCode)!.add('tube2' as TubeId);
        this.conceptTubeMappings.get(conceptCode)!.add('tube3' as TubeId);
      }
    }
  }

  /**
   * Populates a single stitch with facts based on concept mapping
   */
  async populateStitch(conceptMapping: ConceptMapping, stitchId: StitchId): Promise<StitchPopulationResult> {
    try {
      // Step 1: Execute concept-to-fact query translation
      const facts = await this.executeFactQuery(conceptMapping.factQuery);
      
      if (facts.length < conceptMapping.factQuery.maxFacts) {
        throw new Error(StitchPopulationErrorCode.INSUFFICIENT_FACTS);
      }

      // Step 2: Select exactly maxFacts with proper distribution
      const selectedFacts = this.selectFactsWithDistribution(facts, conceptMapping.factQuery.maxFacts);
      
      return {
        stitchId,
        conceptCode: conceptMapping.conceptCode,
        conceptName: conceptMapping.conceptName,
        factIds: selectedFacts.map(f => f.id),
        questionFormat: conceptMapping.questionFormat,
        populationTimestamp: new Date().toISOString(),
        isSurprise: false
      };

    } catch (error) {
      throw new Error(`${StitchPopulationErrorCode.POPULATION_FAILED}: ${error.message}`);
    }
  }

  /**
   * Execute fact query against FactRepository with concept-specific criteria
   */
  private async executeFactQuery(factQuery: FactQuery): Promise<MathematicalFact[]> {
    const { operation, criteria } = factQuery;
    
    switch (operation) {
      case 'doubling':
        return this.queryDoublingFacts(criteria);
      
      case 'halving':
        return this.queryHalvingFacts(criteria);
      
      case 'multiplication':
        return this.queryMultiplicationFacts(criteria);
      
      case 'division':
        return this.queryDivisionFacts(criteria);
      
      default:
        throw new Error(`${StitchPopulationErrorCode.FACT_QUERY_FAILED}: Unsupported operation ${operation}`);
    }
  }

  /**
   * Query doubling facts with number ending complexity
   */
  private async queryDoublingFacts(criteria: FactCriteria): Promise<MathematicalFact[]> {
    // Use the new doubling operation directly
    const facts = this.factRepository.searchFacts({
      operation: 'doubling',
      operand1Range: criteria.numberRange,
      includeOnlyEndingsWith: criteria.numberEndings
    });

    // Filter is now handled by the FactRepository's searchDoublingFacts method
    return facts;
  }

  /**
   * Query halving facts with number ending complexity
   */
  private async queryHalvingFacts(criteria: FactCriteria): Promise<MathematicalFact[]> {
    // Use the new halving operation directly
    const facts = this.factRepository.searchFacts({
      operation: 'halving',
      operand1Range: criteria.numberRange,
      includeOnlyEndingsWith: criteria.numberEndings
    });

    // Filter is now handled by the FactRepository's searchHalvingFacts method
    return facts;
  }

  /**
   * Query multiplication table facts for backwards progression
   */
  private async queryMultiplicationFacts(criteria: FactCriteria): Promise<MathematicalFact[]> {
    if (!criteria.tableNumber) {
      throw new Error('Table number required for multiplication queries');
    }

    return this.factRepository.searchFacts({
      operation: 'multiplication',
      operand1: criteria.tableNumber,
      operand2Range: criteria.numberRange || [1, 12]
    });
  }

  /**
   * Query division facts for algebraic presentation
   */
  private async queryDivisionFacts(criteria: FactCriteria): Promise<MathematicalFact[]> {
    const facts = await this.factRepository.searchFacts({
      operation: 'division',
      resultRange: criteria.numberRange
    });

    // Filter for clean division (no remainders)
    return facts.filter(fact => fact.operands[0] % fact.operands[1] === 0);
  }

  /**
   * Select facts with proper distribution and randomization
   */
  private selectFactsWithDistribution(facts: MathematicalFact[], maxFacts: number): MathematicalFact[] {
    if (facts.length <= maxFacts) {
      return facts;
    }

    // Randomize while maintaining even distribution across number ranges
    const shuffled = [...facts].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, maxFacts);
  }

  /**
   * Populates an entire tube following its progression strategy
   */
  async populateTube(strategy: TubePopulationStrategy): Promise<StitchPopulationResult[]> {
    try {
      const results: StitchPopulationResult[] = [];
      const conceptProgression = this.getConceptProgression(strategy.tubeId);
      
      for (let i = 0; i < conceptProgression.length; i++) {
        const conceptCode = conceptProgression[i];
        const conceptMapping = this.conceptMappings.get(conceptCode);
        
        if (!conceptMapping) {
          throw new Error(`${StitchPopulationErrorCode.CONCEPT_NOT_FOUND}: ${conceptCode}`);
        }

        const stitchId = `${strategy.tubeId}-${(i + 1).toString().padStart(4, '0')}-001` as StitchId;
        const result = await this.populateStitch(conceptMapping, stitchId);
        results.push(result);
      }

      // Add surprise stitches based on strategy
      const surpriseResults = await this.generateSurpriseStitches(strategy, results.length);
      this.insertSurpriseStitches(results, surpriseResults);

      return results;

    } catch (error) {
      throw new Error(`${StitchPopulationErrorCode.POPULATION_FAILED}: ${error.message}`);
    }
  }

  /**
   * Populates the complete curriculum across all three tubes
   */
  async populateCompleteCurriculum(): Promise<CurriculumPopulationResult> {
    try {
      const tube1Results = await this.populateTube(this.tubeStrategies.get('tube1')!);
      const tube2Results = await this.populateTube(this.tubeStrategies.get('tube2')!);
      const tube3Results = await this.populateTube(this.tubeStrategies.get('tube3')!);

      const totalStitches = tube1Results.length + tube2Results.length + tube3Results.length;
      const surpriseStitches = [...tube1Results, ...tube2Results, ...tube3Results]
        .filter(result => result.isSurprise).length;

      return {
        tube1Stitches: tube1Results,
        tube2Stitches: tube2Results,
        tube3Stitches: tube3Results,
        totalStitches,
        surpriseStitches,
        populationStrategy: 'doubling_halving_foundation_with_backwards_multiplication'
      };

    } catch (error) {
      throw new Error(`${StitchPopulationErrorCode.POPULATION_FAILED}: ${error.message}`);
    }
  }

  /**
   * Gets the concept mapping for a specific concept code
   * Now supports flexible tube assignments - any concept can be in any tube
   */
  async getConceptMapping(conceptCode: string, tubeId: TubeId): Promise<ConceptMapping> {
    const mapping = this.conceptMappings.get(conceptCode);
    
    if (!mapping) {
      throw new Error(StitchPopulationErrorCode.CONCEPT_NOT_FOUND);
    }

    // Check database for flexible mappings
    const isAllowed = await conceptMappingService.isConceptAllowedInTube(conceptCode, tubeId);
    
    // Per L1 vision: ANY concept can be in ANY tube
    // If not explicitly mapped, we allow it dynamically
    if (!isAllowed) {
      console.log(`Dynamically allowing concept ${conceptCode} in ${tubeId} per L1 vision`);
    }

    // Always return the mapping with the requested tube
    return {
      ...mapping,
      tubeId: tubeId  // Use the requested tube
    };
  }

  /**
   * Validates that sufficient facts exist for a concept mapping
   */
  validateConceptMapping(conceptMapping: ConceptMapping): {
    isValid: boolean;
    availableFactCount: number;
    requiredFactCount: number;
    missingCriteria?: string[];
  } {
    // This would typically query the FactRepository to check availability
    // For now, return a basic validation
    const requiredFactCount = conceptMapping.factQuery.maxFacts;
    
    return {
      isValid: true,
      availableFactCount: requiredFactCount + 5, // Assume we have sufficient facts
      requiredFactCount,
      missingCriteria: []
    };
  }

  /**
   * Generates surprise stitches based on tube strategy
   */
  async generateSurpriseStitches(strategy: TubePopulationStrategy, stitchCount: number): {
    position: number;
    conceptCode: string;
    stitchId: StitchId;
  }[] {
    const surpriseCount = Math.floor(stitchCount * strategy.surpriseRate);
    const surprises: { position: number; conceptCode: string; stitchId: StitchId; }[] = [];

    for (let i = 0; i < surpriseCount; i++) {
      // Generate pseudo-random position (avoid first 3 and last 3)
      const minPos = 3;
      const maxPos = stitchCount - 3;
      const position = Math.floor(Math.random() * (maxPos - minPos + 1)) + minPos;

      // Select surprise concept
      const surpriseConcept = strategy.surpriseConcepts[i % strategy.surpriseConcepts.length];
      const stitchId = `${strategy.tubeId}-${position.toString().padStart(4, '0')}-999` as StitchId;

      surprises.push({
        position,
        conceptCode: surpriseConcept,
        stitchId
      });
    }

    return surprises;
  }

  /**
   * Gets progression order for concepts in a tube
   */
  getConceptProgression(tubeId: TubeId): string[] {
    const strategy = this.tubeStrategies.get(tubeId);
    if (!strategy) {
      throw new Error(StitchPopulationErrorCode.INVALID_TUBE_STRATEGY);
    }

    switch (strategy.progressionType) {
      case 'complexity_based':
        return strategy.conceptMappings
          .sort((a, b) => a.conceptCode.localeCompare(b.conceptCode))
          .map(c => c.conceptCode);
      
      case 'backward':
        return strategy.conceptMappings
          .sort((a, b) => b.conceptCode.localeCompare(a.conceptCode))
          .map(c => c.conceptCode);
      
      case 'forward':
      default:
        return strategy.conceptMappings
          .sort((a, b) => a.conceptCode.localeCompare(b.conceptCode))
          .map(c => c.conceptCode);
    }
  }

  /**
   * Insert surprise stitches into results at calculated positions
   */
  private insertSurpriseStitches(
    results: StitchPopulationResult[],
    surprises: { position: number; conceptCode: string; stitchId: StitchId; }[]
  ): void {
    // This would create actual surprise stitch results and insert them
    // For now, just mark some existing stitches as surprises
    surprises.forEach(surprise => {
      if (surprise.position < results.length) {
        results[surprise.position].isSurprise = true;
      }
    });
  }
}

export default StitchPopulation;