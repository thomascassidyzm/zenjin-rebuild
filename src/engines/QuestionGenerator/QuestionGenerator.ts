import { v4 as uuidv4 } from 'uuid';

import { 
  QuestionGeneratorInterface,
  Question,
  QuestionRequest,
  QuestionSetInfo
} from './interfaces/QuestionGeneratorInterface';
import { FactRepositoryInterface } from './interfaces/FactRepositoryInterface';
import { DistinctionManagerInterface } from './interfaces/DistinctionManagerInterface';
import { TripleHelixManagerInterface } from '../ProgressionSystem/interfaces/TripleHelixManagerInterface';
import { Logger } from '../utils/Logger';

/**
 * Implementation of QuestionGenerator component
 * Generates mathematical questions based on the user's active learning path,
 * mastery level, and progression through the Triple Helix learning model.
 */
export class QuestionGenerator implements QuestionGeneratorInterface {
  private readonly factRepository: FactRepositoryInterface;
  private readonly distinctionManager: DistinctionManagerInterface;
  private readonly tripleHelixManager: TripleHelixManagerInterface;
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
    logger: Logger
  ) {
    this.factRepository = factRepository;
    this.distinctionManager = distinctionManager;
    this.tripleHelixManager = tripleHelixManager;
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
      const userMasteryLevels = this.distinctionManager.getUserMasteryLevels(request.userId);
      const currentLearningPath = this.tripleHelixManager.getUserActiveLearningPath(request.userId);
      
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
      
      // Create and return the question
      const question: Question = {
        id: `q-${uuidv4()}`,
        factId: selectedFact.id,
        text: questionText,
        correctAnswer: selectedFact.result.toString(),
        boundaryLevel,
        learningPathId: request.learningPathId,
        operation: selectedFact.operation,
        difficulty: selectedFact.difficulty,
        tags: [...selectedFact.tags]
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
      
      // Get user's mastery levels
      const userMasteryLevels = this.distinctionManager.getUserMasteryLevels(userId);
      
      // Calculate metrics
      const totalQuestions = allFacts.length;
      const userCompletedFacts = this.distinctionManager.getUserCompletedFacts(userId, learningPathId);
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
      
      // Replace template placeholders with values from the fact
      let formattedText = template;
      
      // Replace common placeholders
      formattedText = formattedText.replace(/{{operand1}}/g, fact.operand1.toString());
      formattedText = formattedText.replace(/{{operand2}}/g, fact.operand2.toString());
      formattedText = formattedText.replace(/{{result}}/g, fact.result.toString());
      formattedText = formattedText.replace(/{{operation}}/g, fact.operation);
      
      // Replace any additional custom placeholders
      Object.entries(fact).forEach(([key, value]) => {
        const placeholder = new RegExp(`{{${key}}}`, 'g');
        formattedText = formattedText.replace(placeholder, value.toString());
      });
      
      return formattedText;
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
    
    // Check if learning path exists
    if (!this.tripleHelixManager.learningPathExists(learningPathId)) {
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
    const activeHelixPath = this.tripleHelixManager.getUserActiveLearningPath(userId);
    
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
      const timeSinceLastPractice = this.distinctionManager.getTimeSinceLastPractice(userId, fact.id);
      
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
    
    // Get templates for this operation and boundary level
    const templates = this.factRepository.getQuestionTemplates(fact.operation, boundaryLevel);
    
    if (!templates || templates.length === 0) {
      // Fall back to a default template if none found
      switch (fact.operation) {
        case 'addition':
          return 'What is {{operand1}} + {{operand2}}?';
        case 'subtraction':
          return 'What is {{operand1}} - {{operand2}}?';
        case 'multiplication':
          return 'What is {{operand1}} × {{operand2}}?';
        case 'division':
          return 'What is {{operand1}} ÷ {{operand2}}?';
        default:
          return `Calculate {{operand1}} ${fact.operation} {{operand2}}.`;
      }
    }
    
    // Select a random template from the available ones
    const randomIndex = Math.floor(Math.random() * templates.length);
    return templates[randomIndex];
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
