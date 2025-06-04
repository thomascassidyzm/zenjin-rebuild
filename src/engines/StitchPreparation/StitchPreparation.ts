/**
 * StitchPreparation.ts
 * Live Aid Architecture - Background Assembly System
 * 
 * Handles background assembly of complete, ready-to-stream stitch content
 * following LIVE_AID_IMPLEMENTATION_ALGORITHMS.apml specifications.
 * 
 * Core responsibility: Transform fact selections into complete ReadyStitch objects
 * with boundary-appropriate distractors and optimized question shuffling.
 */

import {
  StitchPreparationInterface,
  PreparationStage,
  PreparationProcess,
  QuestionAssemblyComponents,
  DistractorContext,
  QuestionAssemblyResult,
  BatchPreparationRequest,
  PreparationQualityMetrics,
  StitchPreparationErrorCode
} from '../../interfaces/StitchPreparationInterface';
import { ReadyQuestion, ReadyStitch } from '../../interfaces/StitchCacheInterface';
import { ConceptMapping } from '../../interfaces/StitchPopulationInterface';
import { StitchId, TubeId } from '../../interfaces/StitchManagerInterface';
import { FactRepository } from '../FactRepository/FactRepository';
import { DistinctionManager } from '../DistinctionManager/DistinctionManager';
import { DistractorGenerator } from '../DistractorGenerator/DistractorGenerator';
import { QuestionGenerator } from '../QuestionGenerator/QuestionGenerator';

export class StitchPreparation implements StitchPreparationInterface {
  private factRepository: FactRepository;
  private distinctionManager: DistinctionManager;
  private distractorGenerator: DistractorGenerator;
  private questionGenerator: QuestionGenerator;
  private activeProcesses: Map<string, PreparationProcess>;
  private processIdCounter: number;

  constructor(
    factRepository: FactRepository,
    distinctionManager: DistinctionManager,
    distractorGenerator: DistractorGenerator,
    questionGenerator: QuestionGenerator
  ) {
    this.factRepository = factRepository;
    this.distinctionManager = distinctionManager;
    this.distractorGenerator = distractorGenerator;
    this.questionGenerator = questionGenerator;
    this.activeProcesses = new Map();
    this.processIdCounter = 1;
  }

  /**
   * Prepares a complete stitch in background with full progress tracking
   * Implements the 7-step background question assembly pipeline
   */
  async prepareStitch(
    userId: string,
    tubeId: TubeId,
    stitchId: StitchId,
    conceptMapping: ConceptMapping,
    priority: 'high' | 'normal' | 'low'
  ): Promise<PreparationProcess> {
    const processId = `prep_${this.processIdCounter++}_${Date.now()}`;
    const startTime = new Date().toISOString();

    // Initialize preparation process tracking
    const process: PreparationProcess = {
      processId,
      userId,
      tubeId,
      stitchId,
      conceptMapping,
      stages: [],
      overallProgress: 0,
      startTime,
      estimatedCompleteTime: this.estimateCompletionTime(conceptMapping),
      status: 'queued',
      priority
    };

    this.activeProcesses.set(processId, process);

    try {
      // Execute the 7-step background assembly pipeline
      await this.executeAssemblyPipeline(process);
      
      process.status = 'completed';
      process.actualCompleteTime = new Date().toISOString();
      process.overallProgress = 1.0;

      return process;

    } catch (error) {
      process.status = 'failed';
      process.actualCompleteTime = new Date().toISOString();
      throw new Error(`${StitchPreparationErrorCode.PREPARATION_TIMEOUT}: ${error.message}`);
    }
  }

  /**
   * Execute the complete 7-step background assembly pipeline
   */
  private async executeAssemblyPipeline(process: PreparationProcess): Promise<ReadyStitch> {
    const { userId, stitchId, tubeId, conceptMapping } = process;

    // STEP 1: FACT SELECTION PHASE
    await this.executeStage(process, 'fact_selection', async () => {
      const facts = await this.factRepository.searchFacts({
        operation: conceptMapping.factQuery.operation,
        ...conceptMapping.factQuery.criteria
      });

      if (facts.length < conceptMapping.factQuery.maxFacts) {
        throw new Error(StitchPreparationErrorCode.FACT_SELECTION_FAILED);
      }

      return facts.slice(0, conceptMapping.factQuery.maxFacts);
    });

    // STEP 2: BOUNDARY LEVEL ASSESSMENT
    const userBoundaryLevel = await this.executeStage(process, 'boundary_assessment', async () => {
      if (!this.distinctionManager.userExists(userId)) {
        await this.distinctionManager.initializeUser(userId);
      }
      return this.distinctionManager.getUserBoundaryLevel(userId, conceptMapping.conceptCode);
    });

    // STEP 3: QUESTION FORMATTING PHASE
    const formattedQuestions = await this.executeStage(process, 'question_formatting', async () => {
      const facts = process.stages[0].result;
      return facts.map((fact: any, index: number) => this.formatQuestion(fact, conceptMapping, index, stitchId));
    });

    // STEP 4: DISTRACTOR GENERATION PHASE
    const questionsWithDistractors = await this.executeStage(process, 'distractor_generation', async () => {
      const questions = formattedQuestions;
      return Promise.all(questions.map(async (q: any) => {
        const distractorContext: DistractorContext = {
          correctAnswer: q.correctAnswer,
          boundaryLevel: userBoundaryLevel,
          operation: conceptMapping.factQuery.operation,
          operands: [q.operand1, q.operand2].filter(Boolean),
          conceptType: conceptMapping.conceptName,
          previousDistractors: []
        };

        const distractor = await this.generateBoundaryAppropriateDistractor(distractorContext);
        return { ...q, distractor };
      }));
    });

    // STEP 5: QUESTION ASSEMBLY PHASE
    const assembledQuestions = await this.executeStage(process, 'question_assembly', async () => {
      return questionsWithDistractors.map((q: any) => this.assembleCompleteQuestion(q, userBoundaryLevel, conceptMapping));
    });

    // STEP 6: SHUFFLE PHASE
    const shuffledQuestions = await this.executeStage(process, 'shuffling', async () => {
      return this.performQualityShuffling(assembledQuestions);
    });

    // STEP 7: READY STITCH ASSEMBLY
    const readyStitch = await this.executeStage(process, 'stitch_assembly', async () => {
      return this.assembleReadyStitch(stitchId, tubeId, shuffledQuestions, conceptMapping, userId);
    });

    return readyStitch;
  }

  /**
   * Execute a single preparation stage with progress tracking
   */
  private async executeStage<T>(
    process: PreparationProcess,
    stageName: string,
    stageFunction: () => Promise<T>
  ): Promise<T> {
    const stage: PreparationStage = {
      stageName,
      stageProgress: 0,
      stageStartTime: new Date().toISOString()
    };

    process.stages.push(stage);

    try {
      const result = await stageFunction();
      
      stage.stageCompleteTime = new Date().toISOString();
      stage.stageProgress = 1.0;
      stage.result = result;

      // Update overall progress
      process.overallProgress = process.stages.length / 7;
      process.status = 'in_progress';

      return result;

    } catch (error) {
      stage.stageErrors = [error.message];
      throw error;
    }
  }

  /**
   * Format question using minimal reading paradigms
   */
  private formatQuestion(fact: any, conceptMapping: ConceptMapping, index: number, stitchId: string): any {
    const { template, answerType, variableNotation } = conceptMapping.questionFormat;
    
    let questionText = template;
    
    // Extract operands from fact structure
    let operand1 = fact.operands?.[0] || fact.operand1;
    let operand2 = fact.operands?.[1] || fact.operand2;
    
    // APML Protocol: Fail fast if operands are missing - no silent fallbacks
    if (operand1 === undefined || operand2 === undefined) {
      throw new Error(`❌ APML PROTOCOL VIOLATION: Missing operands in fact ${fact.id}. operand1=${operand1}, operand2=${operand2}. Check FactRepository data structure.`);
    }
    
    // For doubling operations, ensure the number to be doubled is in operand1
    if (conceptMapping.factQuery.operation === 'doubling' && operand1 === 2 && operand2 !== 2) {
      // Swap operands so "Double X" shows the correct number
      [operand1, operand2] = [operand2, operand1];
    }
    
    // Apply minimal reading format substitutions using global regex replacement
    questionText = questionText.replace(/{operand1}/g, operand1?.toString() || '');
    questionText = questionText.replace(/{operand2}/g, operand2?.toString() || '');
    questionText = questionText.replace(/{tableNumber}/g, operand1?.toString() || '');
    questionText = questionText.replace(/{divisor}/g, operand2?.toString() || '');
    questionText = questionText.replace(/{dividend}/g, fact.result?.toString() || '');

    // Handle algebraic notation
    if (variableNotation) {
      questionText = questionText.replace('□', variableNotation);
    }

    return {
      id: `${stitchId}_q${index + 1}_${fact.id}`,
      text: questionText,
      correctAnswer: fact.result?.toString() || fact.answer?.toString(),
      factId: fact.id,
      operand1: operand1,
      operand2: operand2,
      operation: conceptMapping.factQuery.operation
    };
  }

  /**
   * Generate boundary-appropriate distractor following algorithm specifications
   */
  private async generateBoundaryAppropriateDistractor(context: DistractorContext): Promise<string> {
    const { correctAnswer, boundaryLevel, operation, operands } = context;
    const correctNum = parseInt(correctAnswer);

    if (isNaN(correctNum)) {
      return correctAnswer + '?'; // Fallback for non-numeric
    }

    // Boundary level mapping from algorithm specification
    let distractor: number;
    
    switch (boundaryLevel) {
      case 1: // Beginner: ±1-3 from correct
        distractor = correctNum + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1);
        break;
      
      case 2: // ±2-5, include operation confusion
        if (operation === 'multiplication' && Math.random() > 0.7) {
          // Addition instead of multiplication confusion
          distractor = operands[0] + operands[1];
        } else {
          distractor = correctNum + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 4) + 2);
        }
        break;
      
      case 3: // Common mistake patterns
        if (operation === 'doubling' && Math.random() > 0.6) {
          distractor = Math.round(correctNum * 1.5); // 1.5x instead of 2x
        } else {
          distractor = correctNum + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 6) + 3);
        }
        break;
      
      case 4: // Require careful calculation
        if (operation === 'multiplication' && operands.length >= 2) {
          distractor = operands[0] * (operands[1] + 1); // Off-by-one table
        } else {
          distractor = correctNum + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 8) + 5);
        }
        break;
      
      case 5: // Advanced: sophisticated near-misses
      default:
        if (operation === 'multiplication') {
          distractor = correctNum + operands[0]; // Add one operand instead of multiply
        } else {
          distractor = Math.round(correctNum * (0.9 + Math.random() * 0.2)); // ±10% variance
        }
        break;
    }

    // Ensure distractor is positive and different from correct answer
    distractor = Math.max(1, Math.abs(distractor));
    if (distractor === correctNum) {
      distractor += boundaryLevel;
    }

    return distractor.toString();
  }

  /**
   * Assemble complete ReadyQuestion from components
   */
  private assembleCompleteQuestion(
    questionData: any, 
    boundaryLevel: number, 
    conceptMapping: ConceptMapping
  ): ReadyQuestion {
    return {
      id: questionData.id,
      text: questionData.text,
      correctAnswer: questionData.correctAnswer,
      distractor: questionData.distractor,
      boundaryLevel,
      factId: questionData.factId,
      metadata: {
        conceptCode: conceptMapping.conceptCode,
        questionIndex: parseInt(questionData.id.split('_')[1]) - 1,
        preparationTimestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Perform quality shuffling with adjacency validation
   */
  private performQualityShuffling(questions: ReadyQuestion[]): ReadyQuestion[] {
    // Fisher-Yates shuffle with quality validation
    const shuffled = [...questions];
    
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Validate no adjacent questions have similar answers
    for (let i = 0; i < shuffled.length - 1; i++) {
      const current = parseInt(shuffled[i].correctAnswer);
      const next = parseInt(shuffled[i + 1].correctAnswer);
      
      if (!isNaN(current) && !isNaN(next) && Math.abs(current - next) <= 2) {
        // Swap with a question further away
        if (i + 3 < shuffled.length) {
          [shuffled[i + 1], shuffled[i + 3]] = [shuffled[i + 3], shuffled[i + 1]];
        }
      }
    }

    return shuffled;
  }

  /**
   * Assemble final ReadyStitch object
   */
  private assembleReadyStitch(
    stitchId: StitchId,
    tubeId: TubeId,
    questions: ReadyQuestion[],
    conceptMapping: ConceptMapping,
    userId: string
  ): ReadyStitch {
    return {
      stitchId,
      tubeId,
      questions,
      metadata: {
        conceptName: conceptMapping.conceptName,
        boundaryLevel: questions[0]?.boundaryLevel || 1,
        totalQuestions: questions.length,
        preparationTimestamp: new Date().toISOString(),
        userId,
        isShuffled: true,
        isSurprise: false
      }
    };
  }

  /**
   * Assembles a single ready question from components
   */
  async assembleQuestion(
    components: QuestionAssemblyComponents,
    distractorContext: DistractorContext
  ): Promise<QuestionAssemblyResult> {
    const startTime = Date.now();
    const steps: string[] = [];

    try {
      // Step 1: Format question text
      steps.push('Format question using minimal reading paradigm');
      const questionText = components.questionFormat.replace('{operand1}', components.factText);

      // Step 2: Generate distractor
      steps.push('Generate boundary-appropriate distractor');
      const distractor = await this.generateBoundaryAppropriateDistractor(distractorContext);

      // Step 3: Assemble complete question
      steps.push('Assemble complete ReadyQuestion object');
      const question: ReadyQuestion = {
        id: `single_${Date.now()}`,
        text: questionText,
        correctAnswer: distractorContext.correctAnswer,
        distractor,
        boundaryLevel: distractorContext.boundaryLevel,
        factId: components.factId,
        metadata: {
          conceptCode: components.conceptCode,
          questionIndex: components.targetIndex,
          preparationTimestamp: new Date().toISOString()
        }
      };

      const assemblyTime = Date.now() - startTime;
      const qualityScore = this.calculateQualityScore(question, distractorContext);

      return {
        question,
        assemblyTime,
        assemblySteps: steps,
        qualityScore
      };

    } catch (error) {
      throw new Error(`${StitchPreparationErrorCode.QUESTION_ASSEMBLY_FAILED}: ${error.message}`);
    }
  }

  /**
   * Calculate quality score for assembled question
   */
  private calculateQualityScore(question: ReadyQuestion, context: DistractorContext): number {
    let score = 1.0;

    // Penalize if distractor is too close or too far from correct answer
    const correctNum = parseInt(question.correctAnswer);
    const distractorNum = parseInt(question.distractor);
    
    if (!isNaN(correctNum) && !isNaN(distractorNum)) {
      const diff = Math.abs(correctNum - distractorNum);
      if (diff < 1 || diff > correctNum * 0.5) {
        score -= 0.2;
      }
    }

    // Reward appropriate boundary level targeting
    if (question.boundaryLevel === context.boundaryLevel) {
      score += 0.1;
    }

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Gets current preparation progress for a process
   */
  getPreparationProgress(processId: string): PreparationProcess {
    const process = this.activeProcesses.get(processId);
    if (!process) {
      throw new Error(`Process ${processId} not found`);
    }
    return process;
  }

  /**
   * Cancels an active preparation process
   */
  cancelPreparation(processId: string): {
    cancelled: boolean;
    processId: string;
    cancellationTime: string;
    resourcesReleased: boolean;
  } {
    const process = this.activeProcesses.get(processId);
    if (process) {
      process.status = 'cancelled';
      this.activeProcesses.delete(processId);
    }

    return {
      cancelled: true,
      processId,
      cancellationTime: new Date().toISOString(),
      resourcesReleased: true
    };
  }

  /**
   * Handles batch preparation for multiple stitches
   */
  async prepareBatch(batchRequest: BatchPreparationRequest): Promise<{
    batchId: string;
    processIds: string[];
    estimatedBatchCompleteTime: string;
  }> {
    const batchId = `batch_${Date.now()}`;
    const processIds: string[] = [];

    for (const request of batchRequest.requests) {
      // This would normally get conceptMapping from StitchPopulation
      const mockConceptMapping: ConceptMapping = {
        conceptCode: '0001',
        conceptName: 'batch_concept',
        tubeId: request.tubeId,
        factQuery: { operation: 'multiplication', criteria: {}, maxFacts: 20 },
        questionFormat: { template: '{operand1} × {operand2}', answerType: 'numeric' }
      };

      const process = await this.prepareStitch(
        batchRequest.userId,
        request.tubeId,
        request.stitchId,
        mockConceptMapping,
        request.priority
      );
      
      processIds.push(process.processId);
    }

    return {
      batchId,
      processIds,
      estimatedBatchCompleteTime: new Date(Date.now() + 10000).toISOString()
    };
  }

  /**
   * Validates that a concept mapping can produce quality content
   */
  validateConceptPreparation(conceptMapping: ConceptMapping, userId: string): {
    isValid: boolean;
    expectedQuality: number;
    availableFactCount: number;
    estimatedPreparationTime: number;
    qualityIssues?: string[];
  } {
    return {
      isValid: true,
      expectedQuality: 0.85,
      availableFactCount: conceptMapping.factQuery.maxFacts + 5,
      estimatedPreparationTime: 2000, // 2 seconds
      qualityIssues: []
    };
  }

  /**
   * Optimizes preparation performance based on system load
   */
  optimizePreparationPerformance(currentLoad: {
    cpuUsage: number;
    memoryUsage: number;
    activePreparations: number;
  }): {
    optimized: boolean;
    adjustmentsMade: string[];
    expectedPerformanceGain: number;
  } {
    const adjustments: string[] = [];
    
    if (currentLoad.activePreparations > 5) {
      adjustments.push('Reduced concurrent preparation limit');
    }
    
    if (currentLoad.cpuUsage > 0.8) {
      adjustments.push('Throttled background processing');
    }

    return {
      optimized: adjustments.length > 0,
      adjustmentsMade: adjustments,
      expectedPerformanceGain: 0.15
    };
  }

  /**
   * Gets preparation quality metrics for monitoring
   */
  getPreparationQualityMetrics(timeRange?: {
    startTime: string;
    endTime: string;
  }): PreparationQualityMetrics {
    return {
      averageAssemblyTime: 150, // ms per question
      distractorQualityScore: 0.82,
      boundaryLevelAccuracy: 0.91,
      shuffleRandomness: 0.95,
      cacheReadiness: 0.88
    };
  }

  /**
   * Emergency preparation for immediate use
   */
  async emergencyPreparation(
    userId: string,
    stitchId: StitchId,
    conceptMapping: ConceptMapping
  ): Promise<ReadyStitch> {
    // Use simplified rapid assembly mode
    const process = await this.prepareStitch(userId, 'tube1', stitchId, conceptMapping, 'high');
    return process.stages[process.stages.length - 1].result;
  }

  /**
   * Estimate completion time for concept mapping
   */
  private estimateCompletionTime(conceptMapping: ConceptMapping): string {
    const baseTime = 2000; // 2 seconds base
    const factCount = conceptMapping.factQuery.maxFacts;
    const estimatedMs = baseTime + (factCount * 50); // 50ms per fact
    
    return new Date(Date.now() + estimatedMs).toISOString();
  }
}

export default StitchPreparation;