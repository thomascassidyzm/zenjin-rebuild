/**
 * APML v2.2 Compliant Service Architecture
 * 
 * Following APML Axiom F6 - Context Boundary Principle:
 * "Formal interfaces are required only when interactions cross defined context boundaries.
 * Within boundaries, implementation is free."
 * 
 * Multiple FactRepository instances are CORRECT - each context boundary manages its own services.
 * This removes inappropriate singleton constraints within context boundaries.
 */

import { FactRepository } from '../engines/FactRepository/FactRepository';
import { LearningEngineService } from './LearningEngineService';
import { ContentManager } from '../engines/ContentManager/ContentManager';
import { QuestionGenerator } from '../engines/QuestionGenerator/QuestionGenerator';
import { DistractorGenerator } from '../engines/DistractorGenerator/DistractorGenerator';
import { DistinctionManager } from '../engines/DistinctionManager/DistinctionManager';
import { TripleHelixManager } from '../engines/TripleHelixManager/TripleHelixManager';
import { StitchPopulation } from '../engines/StitchPopulation/StitchPopulation';
import { StitchPreparation } from '../engines/StitchPreparation/StitchPreparation';
import { StitchCache } from '../engines/StitchCache/StitchCache';
import { LiveAidManager } from '../engines/LiveAidManager/LiveAidManager';
import { ContentGatingEngine } from '../engines/ContentGatingEngine';
import { offlineContentManager } from '../engines/OfflineContentManager';

// APML-compliant service instances - each context boundary owns its services
let learningEngineService: LearningEngineService | null = null;

/**
 * Initialize services following APML v2.2 Context Boundary Principle
 * Creates service instances within appropriate context boundaries
 */
export async function initializeServiceContainer(): Promise<void> {
  if (learningEngineService) {
    return; // Already initialized
  }
  
  try {
    console.log('🏗️ Initializing APML-compliant service architecture...');
    
    // Content Generation Context - can have its own FactRepository
    const contentFactRepo = new FactRepository();
    console.log('📦 FactRepository created for content generation context');
    
    const contentManager = new ContentManager(contentFactRepo);
    const distinctionManager = new DistinctionManager(contentFactRepo);
    const distractorGenerator = new DistractorGenerator(contentFactRepo);
    
    // Engine Context - can have its own FactRepository  
    const engineFactRepo = new FactRepository();
    console.log('📦 FactRepository created for engine context');
    
    const tripleHelixManager = new TripleHelixManager();
    const stitchCache = new StitchCache();
    const stitchPopulation = new StitchPopulation(engineFactRepo);
    
    const questionGenerator = new QuestionGenerator(
      engineFactRepo,
      distinctionManager,
      tripleHelixManager as any,
      distractorGenerator
    );
    
    const stitchPreparation = new StitchPreparation(
      engineFactRepo,
      distinctionManager,
      distractorGenerator,
      questionGenerator
    );
    
    const liveAidManager = new LiveAidManager(
      stitchCache,
      stitchPreparation,
      stitchPopulation,
      tripleHelixManager as any
    );
    
    // Application Context - cross-boundary services
    // Create a proper subscription manager for ContentGatingEngine
    const mockPaymentProcessor = {
      async processPayment() { return true; },
      async refund() { return true; }
    };
    const subscriptionManager = {
      checkSubscriptionStatus: (userId: string) => ({
        hasActiveSubscription: false,
        tier: 'Free'
      }),
      getUserSubscription: (userId: string) => ({
        planId: 'free',
        tier: 'free'
      })
    };
    
    const contentGatingEngine = new ContentGatingEngine(subscriptionManager);
    
    // Learning Engine Service - orchestrates across contexts
    learningEngineService = new LearningEngineService({
      factRepository: contentFactRepo, // Uses content context FactRepository
      contentManager,
      questionGenerator,
      distractorGenerator,
      distinctionManager,
      tripleHelixManager,
      stitchPopulation,
      stitchPreparation,
      stitchCache,
      liveAidManager,
      contentGatingEngine,
      offlineContentManager
    });
    
    console.log('✅ APML-compliant service architecture initialized');
    console.log('📊 Multiple FactRepository instances created (APML-compliant)');
    
  } catch (error) {
    console.error('❌ Failed to initialize service architecture:', error);
    throw error;
  }
}

/**
 * Get service following APML context boundaries
 * @throws Error if services not initialized
 */
export function getService<T>(type: string): T {
  if (!learningEngineService) {
    throw new Error(
      'Services not initialized. Call initializeServiceContainer() first.'
    );
  }
  
  switch (type) {
    case 'LearningEngineService':
      return learningEngineService as unknown as T;
    default:
      throw new Error(`Service '${type}' not available. APML-compliant architecture provides specific services.`);
  }
}

/**
 * Check if services are initialized
 */
export function isServiceContainerInitialized(): boolean {
  return learningEngineService !== null;
}

/**
 * Get the LearningEngineService directly
 * This is the main service orchestrator that crosses context boundaries
 */
export function getLearningEngineService(): LearningEngineService {
  if (!learningEngineService) {
    throw new Error('LearningEngineService not initialized');
  }
  return learningEngineService;
}