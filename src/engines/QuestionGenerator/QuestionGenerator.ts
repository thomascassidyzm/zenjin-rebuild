import { v4 as uuidv4 } from 'uuid';

import { 
  QuestionGeneratorInterface,
  Question,
  QuestionRequest,
  QuestionSetInfo
} from '../../interfaces/QuestionGeneratorInterface';
import { FactRepositoryInterface } from '../../interfaces/FactRepositoryInterface';
import { DistinctionManagerInterface } from '../../interfaces/DistinctionManagerInterface';
import { TripleHelixManagerInterface } from '../../interfaces/TripleHelixManagerInterface';
import { DistractorGeneratorInterface, DistractorRequest } from '../../interfaces/DistractorGeneratorInterface';

// Simple logger interface
interface Logger {
  debug(message: string): void;
  error(message: string): void;
}

// Simple console logger implementation
class SimpleLogger implements Logger {
  debug(message: string): void {
    console.log(`[DEBUG] ${message}`);
  }
  
  error(message: string): void {
    console.error(`[ERROR] ${message}`);
  }
}

/**
 * Implementation of QuestionGenerator component
 * Generates mathematical questions based on the user's active learning path,
 * mastery level, and progression through the Triple Helix learning model.
 */
export class QuestionGenerator implements QuestionGeneratorInterface {
  private readonly factRepository: FactRepositoryInterface;
  private readonly distinctionManager: DistinctionManagerInterface;
  private readonly tripleHelixManager: TripleHelixManagerInterface;
  private readonly distractorGenerator: DistractorGeneratorInterface;
  private readonly logger: Logger;
  
  // Cache for recently generated questions to avoid repetition
  private recentQuestionsCache: Map<string, Set<string>> = new Map();
  private readonly MAX_CACHE_SIZE = 20; // Maximum number of recent questions to remember per user
  
  /**
   * Constructor for QuestionGenerator
   * @param factRepository Repository for accessing mathematical facts
   * @param distinctionManager Manager for tracking user mastery levels
   * @param tripleHelixManager Manager for tracking user learning paths
   * @param logger Logger for recording events and errors
   */
  constructor(
    factRepository: FactRepositoryInterface,
    distinctionManager: DistinctionManagerInterface,
    tripleHelixManager: TripleHelixManagerInterface,
    distractorGenerator: DistractorGeneratorInterface,
    logger: Logger = new SimpleLogger()
  ) {
    this.factRepository = factRepository;
    this.distinctionManager = distinctionManager;
    this.tripleHelixManager = tripleHelixManager;
    this.distractorGenerator = distractorGenerator;
    this.logger = logger;
  }
  
  /**
   * Generates a question based on the user's active learning path and progress
   * @param request Question generation request
   * @returns Generated question
   * @throws Error if user not found, learning path not found, no appropriate questions, or generation fails
   */
  public generateQuestion(request: QuestionRequest): Question {
    const startTime = performance.now();
    
    try {
      // Validate user and learning path
      this.validateUserAndLearningPath(request.userId, request.learningPathId);
      
      // Get user's current learning state
      // Note: APML spec provides per-fact boundary levels, aggregate method needed
      // Using getCurrentBoundaryLevel for individual facts as per APML interface
      const userMasteryLevels = {}; // Will be populated per-fact as needed
      const currentLearningPath = this.tripleHelixManager.getActiveLearningPath(request.userId);
      
      // Get appropriate facts based on learning path and user's mastery
      const eligibleFacts = this.getEligibleFacts(
        request.userId,
        request.learningPathId,
        userMasteryLevels,
        request.preferredOperations,
        request.excludeFactIds,
        request.maxDifficulty
      );
      
      if (eligibleFacts.length === 0) {
        throw new Error('NO_APPROPRIATE_QUESTIONS');
      }
      
      // Select a fact based on spaced repetition principles
      const selectedFact = this.selectFactBySpacedRepetition(request.userId, eligibleFacts, userMasteryLevels);
      
      // Get user's current boundary level for this fact
      const boundaryLevel = this.getBoundaryLevel(request.userId, selectedFact.id);
      
      // Generate question text from template
      const questionTemplate = this.getQuestionTemplate(selectedFact.id, boundaryLevel);
      const questionText = this.formatQuestionText(selectedFact.id, questionTemplate);
      
      // Generate distractors using DistractorGenerator (APML-compliant integration)
      const correctAnswer = selectedFact.result.toString();
      let primaryDistractor = "";
      
      try {
        const distractorRequest: DistractorRequest = {
          factId: selectedFact.id,
          boundaryLevel: boundaryLevel,
          correctAnswer: correctAnswer
        };
        
        const multipleDistractors = this.distractorGenerator.generateMultipleDistractors(distractorRequest);
        if (multipleDistractors.length > 0) {
          primaryDistractor = multipleDistractors[0].value || multipleDistractors[0].toString();
        }
      } catch (error) {
        this.logger.error(`Failed to generate distractors: ${error.message}`);
        // Generate a simple fallback distractor
        primaryDistractor = this.generateFallbackDistractor(correctAnswer);
      }
      
      // Ensure we have a valid question text
      const finalQuestionText = questionText || this.generateFallbackQuestionText(selectedFact);
      
      // Create and return the question (matching QuestionGeneratorInterface)
      const question: Question = {
        id: `q-${uuidv4()}`,
        factId: selectedFact.id,
        text: finalQuestionText,
        correctAnswer: correctAnswer,
        distractor: primaryDistractor,
        boundaryLevel,
        difficulty: selectedFact.difficulty || 0.5,
        metadata: {
          learningPathId: request.learningPathId,
          operation: selectedFact.operation,
          tags: selectedFact.tags || []
        }
      };
      
      // Add to recent questions cache
      this.addToRecentQuestionsCache(request.userId, selectedFact.id);
      
      const endTime = performance.now();
      this.logger.debug(`Question generated in ${(endTime - startTime).toFixed(2)}ms`);
      
      return question;
    } catch (error) {
      this.logger.error(`Failed to generate question: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Generates multiple questions based on the user's active learning path and progress
   * @param request Question generation request
   * @returns Array of generated questions
   * @throws Error if user not found, learning path not found, no appropriate questions, or generation fails
   */
  public generateMultipleQuestions(request: QuestionRequest): Question[] {
    const startTime = performance.now();
    const count = request.count || 1;
    const questions: Question[] = [];
    const usedFactIds: Set<string> = new Set(request.excludeFactIds || []);
    
    try {
      // Create a modified request that gets updated with each loop
      const modifiedRequest: QuestionRequest = {
        ...request,
        excludeFactIds: [...(request.excludeFactIds || [])]
      };
      
      for (let i = 0; i < count; i++) {
        // Update excluded facts to prevent repetition within this batch
        modifiedRequest.excludeFactIds = [...usedFactIds];
        
        // Generate a single question
        const question = this.generateQuestion(modifiedRequest);
        
        // Add the fact ID to used facts to prevent repetition
        usedFactIds.add(question.factId);
        
        questions.push(question);
      }
      
      const endTime = performance.now();
      this.logger.debug(`Generated ${count} questions in ${(endTime - startTime).toFixed(2)}ms`);
      
      return questions;
    } catch (error) {
      this.logger.error(`Failed to generate multiple questions: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Gets the next question for a user based on their learning path and progress
   * @param userId User identifier
   * @param learningPathId Identifier for the active learning path
   * @returns Next question in the sequence
   * @throws Error if user not found, learning path not found, or no appropriate questions
   */
  public getNextQuestion(userId: string, learningPathId: string): Question {
    this.logger.debug(`Getting next question for user ${userId} on learning path ${learningPathId}`);
    
    // Delegate to generateQuestion with appropriate parameters
    const request: QuestionRequest = {
      userId,
      learningPathId
    };
    
    return this.generateQuestion(request);
  }
  
  /**
   * Gets information about the current question set for a user and learning path
   * @param userId User identifier
   * @param learningPathId Identifier for the learning path
   * @returns Information about the question set
   * @throws Error if user not found or learning path not found
   */
  public getQuestionSetInfo(userId: string, learningPathId: string): QuestionSetInfo {
    try {
      // Validate user and learning path
      this.validateUserAndLearningPath(userId, learningPathId);
      
      // Get all facts for the learning path
      const allFacts = this.factRepository.getFactsByLearningPath(learningPathId);
      
      // APML: getUserMasteryLevels not in interface - using placeholder
      const userMasteryLevels: Record<string, number> = {}; // TODO: Implement with per-fact boundary levels
      
      // Calculate metrics
      const totalQuestions = allFacts.length;
      // APML: getUserCompletedFacts not in interface - using placeholder
      const userCompletedFacts: string[] = []; // TODO: Implement with APML-compliant aggregation
      const completedQuestions = userCompletedFacts.length;
      
      let masteredFacts = 0;
      let inProgressFacts = 0;
      let totalBoundaryLevels = 0;
      
      // Count mastered and in-progress facts
      allFacts.forEach(fact => {
        const level = userMasteryLevels[fact.id] || 0;
        totalBoundaryLevels += level;
        
        if (level === 5) {
          masteredFacts++;
        } else if (level > 0) {
          inProgressFacts++;
        }
      });
      
      const averageBoundaryLevel = totalQuestions > 0 
        ? totalBoundaryLevels / totalQuestions 
        : 0;
      
      return {
        totalQuestions,
        completedQuestions,
        masteredFacts,
        inProgressFacts,
        averageBoundaryLevel
      };
    } catch (error) {
      this.logger.error(`Failed to get question set info: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Formats a question text template with the appropriate values
   * @param factId Mathematical fact identifier
   * @param template Question text template
   * @returns Formatted question text
   * @throws Error if fact is invalid or template is invalid
   */
  public formatQuestionText(factId: string, template: string): string {
    try {
      const fact = this.factRepository.getFactById(factId);
      
      if (!fact) {
        throw new Error('INVALID_FACT');
      }
      
      if (!template) {
        throw new Error('INVALID_TEMPLATE');
      }
      
      // Replace template placeholders with actual values
      let questionText = template;
      
      // Extract operands from the fact
      let operands = this.extractOperands(fact);
      
      // Special handling for doubling templates
      // If this is a doubling question (template contains "double" or "Double") and operand1 is 2,
      // we need to ensure the number being doubled is in operand1 position
      if ((template.toLowerCase().includes('double') || template.toLowerCase().includes('twice')) && 
          operands.operand1 === 2 && operands.operand2 !== 2) {
        // Swap operands so the number being doubled is operand1
        operands = { operand1: operands.operand2, operand2: operands.operand1 };
      }
      
      questionText = questionText.replace(/\{\{operand1\}\}/g, operands.operand1.toString());
      questionText = questionText.replace(/\{\{operand2\}\}/g, operands.operand2.toString());
      questionText = questionText.replace(/\{\{result\}\}/g, fact.result.toString());
      questionText = questionText.replace(/\{\{operation\}\}/g, fact.operation);
      
      return questionText;
    } catch (error) {
      this.logger.error(`Failed to format question text: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Validates that the user and learning path exist
   * @param userId User identifier
   * @param learningPathId Learning path identifier
   * @throws Error if user not found or learning path not found
   */
  private validateUserAndLearningPath(userId: string, learningPathId: string): void {
    // Check if user exists
    if (!this.distinctionManager.userExists(userId)) {
      throw new Error('USER_NOT_FOUND');
    }
    
    // Validate learning path exists by attempting to get active path
    try {
      this.tripleHelixManager.getActiveLearningPath(userId);
    } catch (error) {
      throw new Error('LEARNING_PATH_NOT_FOUND');
    }
  }
  
  /**
   * Gets eligible facts based on the user's mastery level and learning path
   * @param userId User identifier
   * @param learningPathId Learning path identifier
   * @param userMasteryLevels User's current mastery levels
   * @param preferredOperations Preferred operations to focus on
   * @param excludeFactIds Fact IDs to exclude
   * @param maxDifficulty Maximum difficulty level
   * @returns Array of eligible facts
   */
  private getEligibleFacts(
    userId: string,
    learningPathId: string,
    userMasteryLevels: Record<string, number>,
    preferredOperations?: string[],
    excludeFactIds?: string[],
    maxDifficulty?: number
  ) {
    // Get facts for the learning path
    const facts = this.factRepository.getFactsByLearningPath(learningPathId);
    
    // Get user's active learning path in the Triple Helix model
    const activeHelixPath = this.tripleHelixManager.getActiveLearningPath(userId);
    
    // Get recent questions to avoid repetition
    const recentFactIds = this.getRecentFactIds(userId);
    
    // Filter facts based on criteria
    return facts.filter(fact => {
      // Skip excluded facts
      if (excludeFactIds?.includes(fact.id)) {
        return false;
      }
      
      // Skip recently used facts to prevent repetition
      if (recentFactIds.has(fact.id)) {
        return false;
      }
      
      // Filter by operation if specified
      if (preferredOperations && preferredOperations.length > 0) {
        if (!preferredOperations.includes(fact.operation)) {
          return false;
        }
      }
      
      // Filter by difficulty if specified
      if (maxDifficulty !== undefined && fact.difficulty > maxDifficulty) {
        return false;
      }
      
      // Apply Triple Helix model filtering
      const factMasteryLevel = userMasteryLevels[fact.id] || 0;
      
      // Filter based on active helix path
      switch (activeHelixPath) {
        case 'knowledge-acquisition':
          // Focus on new or barely learned facts (level 0-1)
          return factMasteryLevel <= 1;
        
        case 'skill-development':
          // Focus on facts in progress (level 2-4)
          return factMasteryLevel >= 2 && factMasteryLevel <= 4;
        
        case 'application':
          // Focus on facts with higher mastery (level 3-5)
          return factMasteryLevel >= 3;
        
        default:
          // Default behavior if no specific helix path is active
          return true;
      }
    });
  }
  
  /**
   * Selects a fact based on spaced repetition principles
   * @param userId User identifier
   * @param facts Array of eligible facts
   * @param userMasteryLevels User's current mastery levels
   * @returns Selected fact
   */
  private selectFactBySpacedRepetition(
    userId: string,
    facts: any[],
    userMasteryLevels: Record<string, number>
  ) {
    if (facts.length === 0) {
      throw new Error('NO_APPROPRIATE_QUESTIONS');
    }
    
    // Create a weighted selection based on mastery levels and time since last practice
    const weightedFacts = facts.map(fact => {
      const masteryLevel = userMasteryLevels[fact.id] || 0;
      // APML: getTimeSinceLastPractice not in interface - using default spaced repetition
      const timeSinceLastPractice = 86400000; // Default: 1 day in milliseconds
      
      // Calculate priority score:
      // - Lower mastery = higher priority
      // - Longer time since practice = higher priority
      let priority = (5 - masteryLevel) * 10; // Base priority on inverse of mastery
      
      // Add time factor - facts not practiced recently get a boost
      if (timeSinceLastPractice > 86400000) { // More than 1 day
        priority += Math.min(timeSinceLastPractice / 86400000, 5) * 5; // Up to +25 for 5+ days
      }
      
      return {
        fact,
        priority
      };
    });
    
    // Sort by priority (highest first)
    weightedFacts.sort((a, b) => b.priority - a.priority);
    
    // Select one of the top facts (with some randomness for variety)
    const topFactsCount = Math.min(3, weightedFacts.length);
    const selectedIndex = Math.floor(Math.random() * topFactsCount);
    
    return weightedFacts[selectedIndex].fact;
  }
  
  /**
   * Gets the boundary level for a user and fact
   * @param userId User identifier
   * @param factId Fact identifier
   * @returns Boundary level (1-5)
   */
  private getBoundaryLevel(userId: string, factId: string): number {
    // Get user's mastery level for this fact
    const masteryLevel = this.distinctionManager.getUserMasteryLevel(userId, factId);
    
    // For new facts, start at boundary level 1
    if (masteryLevel === 0) {
      return 1;
    }
    
    // For facts in progress, use their current mastery level
    // with a chance to present a slightly higher level for challenge
    if (masteryLevel < 5) {
      // 20% chance to present a question one level higher (for challenge)
      if (Math.random() < 0.2 && masteryLevel < 5) {
        return masteryLevel + 1;
      }
      return masteryLevel;
    }
    
    // For mastered facts, use highest level
    return 5;
  }
  
  /**
   * Gets an appropriate question template for a fact and boundary level
   * @param factId Fact identifier
   * @param boundaryLevel Boundary level (1-5)
   * @returns Question template
   */
  private getQuestionTemplate(factId: string, boundaryLevel: number): string {
    const fact = this.factRepository.getFactById(factId);
    
    if (!fact) {
      throw new Error('INVALID_FACT');
    }
    
    // Extract operands to check for doubling/halving context
    const operands = this.extractOperands(fact);
    
    // Determine the actual operation context
    let effectiveOperation = fact.operation;
    
    // Check for doubling context: multiplication where one operand is 2
    if (fact.operation === 'multiplication' && (operands.operand1 === 2 || operands.operand2 === 2)) {
      effectiveOperation = 'doubling';
    }
    // Check for halving context: division where operand2 = 2
    else if (fact.operation === 'division' && operands.operand2 === 2) {
      effectiveOperation = 'halving';
    }
    
    // Get templates for the effective operation and boundary level
    const templates = this.factRepository.getQuestionTemplates(effectiveOperation, boundaryLevel);
    
    if (!templates || templates.length === 0) {
      // Fall back to a default template if none found
      switch (effectiveOperation) {
        case 'addition':
          return 'What is {{operand1}} + {{operand2}}?';
        case 'subtraction':
          return 'What is {{operand1}} - {{operand2}}?';
        case 'multiplication':
          return 'What is {{operand1}} × {{operand2}}?';
        case 'division':
          return 'What is {{operand1}} ÷ {{operand2}}?';
        case 'doubling':
          return 'Double {{operand1}}';
        case 'halving':
          return 'Half of {{operand1}}';
        default:
          return `Calculate {{operand1}} ${fact.operation} {{operand2}}.`;
      }
    }
    
    // Select a random template from the available ones
    const randomIndex = Math.floor(Math.random() * templates.length);
    return templates[randomIndex];
  }


  /**
   * Extracts operands from a mathematical fact
   * @param fact Mathematical fact
   * @returns Operands object
   */
  private extractOperands(fact: any): { operand1: number; operand2: number } {
    // For facts with ID like "mult-6-4", extract operands from ID
    const factIdParts = fact.id.split('-');
    
    if (factIdParts.length >= 3) {
      const operand1 = parseInt(factIdParts[1], 10);
      const operand2 = parseInt(factIdParts[2], 10);
      
      if (!isNaN(operand1) && !isNaN(operand2)) {
        return { operand1, operand2 };
      }
    }
    
    // Fallback: try to extract from statement if available
    if (fact.statement) {
      const statementMatch = fact.statement.match(/(\d+)\s*[+\-×÷*\/]\s*(\d+)/);
      if (statementMatch) {
        return {
          operand1: parseInt(statementMatch[1], 10),
          operand2: parseInt(statementMatch[2], 10)
        };
      }
    }
    
    // Final fallback: use default values
    return { operand1: 1, operand2: 1 };
  }

  /**
   * Generates a fallback distractor when primary distractor generation fails
   * @param correctAnswer The correct answer
   * @returns Fallback distractor
   */
  private generateFallbackDistractor(correctAnswer: string): string {
    const answer = parseInt(correctAnswer, 10);
    if (!isNaN(answer)) {
      // Generate a simple numeric distractor
      const offset = Math.floor(Math.random() * 3) + 1;
      const distractor = Math.random() > 0.5 ? answer + offset : Math.max(0, answer - offset);
      return distractor.toString();
    }
    
    // Non-numeric fallback
    return "?";
  }

  /**
   * Generates a fallback question text when template formatting fails
   * @param fact Mathematical fact
   * @returns Fallback question text
   */
  private generateFallbackQuestionText(fact: any): string {
    const operands = this.extractOperands(fact);
    const operation = fact.operation || 'calculate';
    
    switch (operation) {
      case 'addition':
        return `What is ${operands.operand1} + ${operands.operand2}?`;
      case 'subtraction':
        return `What is ${operands.operand1} - ${operands.operand2}?`;
      case 'multiplication':
        return `What is ${operands.operand1} × ${operands.operand2}?`;
      case 'division':
        return `What is ${operands.operand1} ÷ ${operands.operand2}?`;
      default:
        return `Calculate ${operands.operand1} ${operation} ${operands.operand2}`;
    }
  }
  
  /**
   * Adds a fact ID to the recent questions cache for a user
   * @param userId User identifier
   * @param factId Fact identifier
   */
  private addToRecentQuestionsCache(userId: string, factId: string): void {
    if (!this.recentQuestionsCache.has(userId)) {
      this.recentQuestionsCache.set(userId, new Set());
    }
    
    const userCache = this.recentQuestionsCache.get(userId)!;
    
    // If cache is at max size, remove oldest entries
    if (userCache.size >= this.MAX_CACHE_SIZE) {
      // Convert to array to remove oldest entries
      const factArray = Array.from(userCache);
      // Remove oldest entries (keep most recent MAX_CACHE_SIZE/2)
      const newFactArray = factArray.slice(-Math.floor(this.MAX_CACHE_SIZE / 2));
      // Create new set with remaining entries
      userCache.clear();
      newFactArray.forEach(id => userCache.add(id));
    }
    
    // Add new fact ID to cache
    userCache.add(factId);
  }
  
  /**
   * Gets the set of recent fact IDs for a user
   * @param userId User identifier
   * @returns Set of recent fact IDs
   */
  private getRecentFactIds(userId: string): Set<string> {
    return this.recentQuestionsCache.get(userId) || new Set();
  }
}
