/**
 * APML v2.2 Service Factory Implementations
 * 
 * All factories follow dependency injection principles.
 * Core engine components are created as singletons and injected into higher-level services.
 */

import { ServiceFactory, ServiceResolver } from '../interfaces/ServiceResolutionV2Interface';
import { ServiceType } from '../interfaces/ServiceContainerInterface';
import { LearningEngineDependencies } from '../interfaces/LearningEngineServiceInterface';

// Import service implementations
import { ContentGatingEngine } from '../engines/ContentGatingEngine';
import { EngineOrchestrator } from '../engines/EngineOrchestrator';
import { FactRepository } from '../engines/FactRepository/FactRepository';
import { ContentManager } from '../engines/ContentManager/ContentManager';
import { DistinctionManager } from '../engines/DistinctionManager/DistinctionManager';
import { DistractorGenerator } from '../engines/DistractorGenerator/DistractorGenerator';
import { TripleHelixManager } from '../engines/TripleHelixManager/TripleHelixManager';
import { QuestionGenerator } from '../engines/QuestionGenerator/QuestionGenerator';
import { StitchPopulation } from '../engines/StitchPopulation/StitchPopulation';
import { StitchPreparation } from '../engines/StitchPreparation/StitchPreparation';
import { StitchCache } from '../engines/StitchCache/StitchCache';
import { LiveAidManager } from '../engines/LiveAidManager/LiveAidManager';
import { LearningEngineService } from './LearningEngineService';

// For now, using existing singletons until full migration
import { userSessionManager } from './UserSessionManager';

/**
 * Mock Payment Processor for development
 */
class MockPaymentProcessor {
  async processPayment(amount: number, currency: string): Promise<boolean> {
    console.log(`[MockPaymentProcessor] Processing payment: ${amount} ${currency}`);
    return true;
  }
  
  async refund(transactionId: string): Promise<boolean> {
    console.log(`[MockPaymentProcessor] Refunding transaction: ${transactionId}`);
    return true;
  }
}

/**
 * Subscription Manager implementation
 */
class SubscriptionManager {
  constructor(private paymentProcessor: any) {}
  
  async getSubscriptionTier(userId: string): Promise<'Free' | 'Premium' | 'Enterprise'> {
    // For now, always return Free
    return 'Free';
  }
  
  async canAccessPremiumContent(userId: string): Promise<boolean> {
    const tier = await this.getSubscriptionTier(userId);
    return tier !== 'Free';
  }
  
  // Methods expected by ContentGatingEngine
  checkSubscriptionStatus(userId: string) {
    return {
      hasActiveSubscription: false, // Always false for now
      tier: 'Free'
    };
  }
  
  getUserSubscription(userId: string) {
    return {
      planId: 'free',
      tier: 'free'
    };
  }
}

/**
 * Service factory definitions
 * Note: Order matters! Dependencies must be defined before dependents.
 */
export const serviceFactories: Record<ServiceType, ServiceFactory> = {
  // Core Engine Components (no dependencies)
  FactRepository: {
    createInstance: async (resolver: ServiceResolver) => {
      return new FactRepository();
    },
    dependencies: [],
    lifetime: 'singleton'
  },
  
  TripleHelixManager: {
    createInstance: async (resolver: ServiceResolver) => {
      return new TripleHelixManager();
    },
    dependencies: [],
    lifetime: 'singleton'
  },
  
  StitchCache: {
    createInstance: async (resolver: ServiceResolver) => {
      return new StitchCache();
    },
    dependencies: [],
    lifetime: 'singleton'
  },
  
  // Engine Components with FactRepository dependency
  ContentManager: {
    createInstance: async (resolver: ServiceResolver) => {
      const factRepository = resolver.resolve('FactRepository');
      return new ContentManager(factRepository);
    },
    dependencies: ['FactRepository'],
    lifetime: 'singleton'
  },
  
  DistinctionManager: {
    createInstance: async (resolver: ServiceResolver) => {
      const factRepository = resolver.resolve('FactRepository');
      return new DistinctionManager(factRepository);
    },
    dependencies: ['FactRepository'],
    lifetime: 'singleton'
  },
  
  DistractorGenerator: {
    createInstance: async (resolver: ServiceResolver) => {
      const factRepository = resolver.resolve('FactRepository');
      return new DistractorGenerator(factRepository);
    },
    dependencies: ['FactRepository'],
    lifetime: 'singleton'
  },
  
  StitchPopulation: {
    createInstance: async (resolver: ServiceResolver) => {
      const factRepository = resolver.resolve('FactRepository');
      return new StitchPopulation(factRepository);
    },
    dependencies: ['FactRepository'],
    lifetime: 'singleton'
  },
  
  // QuestionGenerator with multiple dependencies
  QuestionGenerator: {
    createInstance: async (resolver: ServiceResolver) => {
      const factRepository = resolver.resolve('FactRepository');
      const distinctionManager = resolver.resolve('DistinctionManager');
      const tripleHelixManager = resolver.resolve('TripleHelixManager');
      const distractorGenerator = resolver.resolve('DistractorGenerator');
      return new QuestionGenerator(
        factRepository,
        distinctionManager,
        tripleHelixManager as any,
        distractorGenerator
      );
    },
    dependencies: ['FactRepository', 'DistinctionManager', 'TripleHelixManager', 'DistractorGenerator'],
    lifetime: 'singleton'
  },
  
  // StitchPreparation with multiple dependencies
  StitchPreparation: {
    createInstance: async (resolver: ServiceResolver) => {
      const factRepository = resolver.resolve('FactRepository');
      const distinctionManager = resolver.resolve('DistinctionManager');
      const distractorGenerator = resolver.resolve('DistractorGenerator');
      const questionGenerator = resolver.resolve('QuestionGenerator');
      return new StitchPreparation(
        factRepository,
        distinctionManager,
        distractorGenerator,
        questionGenerator
      );
    },
    dependencies: ['FactRepository', 'DistinctionManager', 'DistractorGenerator', 'QuestionGenerator'],
    lifetime: 'singleton'
  },
  
  // LiveAidManager with multiple dependencies
  LiveAidManager: {
    createInstance: async (resolver: ServiceResolver) => {
      const stitchCache = resolver.resolve('StitchCache');
      const stitchPreparation = resolver.resolve('StitchPreparation');
      const stitchPopulation = resolver.resolve('StitchPopulation');
      const tripleHelixManager = resolver.resolve('TripleHelixManager');
      return new LiveAidManager(
        stitchCache,
        stitchPreparation,
        stitchPopulation,
        tripleHelixManager as any
      );
    },
    dependencies: ['StitchCache', 'StitchPreparation', 'StitchPopulation', 'TripleHelixManager'],
    lifetime: 'singleton'
  },
  
  // Infrastructure Layer
  PaymentProcessor: {
    createInstance: async (resolver: ServiceResolver) => {
      return new MockPaymentProcessor();
    },
    dependencies: [],
    lifetime: 'singleton'
  },
  
  UserSessionManager: {
    createInstance: async (resolver: ServiceResolver) => {
      // Return existing singleton for now
      return userSessionManager;
    },
    dependencies: [],
    lifetime: 'singleton'
  },
  
  // Business Layer
  SubscriptionManager: {
    createInstance: async (resolver: ServiceResolver) => {
      const paymentProcessor = resolver.resolve('PaymentProcessor');
      return new SubscriptionManager(paymentProcessor);
    },
    dependencies: ['PaymentProcessor'],
    lifetime: 'singleton'
  },
  
  // Application Layer
  ContentGatingEngine: {
    createInstance: async (resolver: ServiceResolver) => {
      const subscriptionManager = resolver.resolve('SubscriptionManager');
      return new ContentGatingEngine(subscriptionManager);
    },
    dependencies: ['SubscriptionManager'],
    lifetime: 'singleton'
  },
  
  OfflineContentManager: {
    createInstance: async (resolver: ServiceResolver) => {
      // Return existing singleton for now
      const { offlineContentManager } = await import('../engines/OfflineContentManager');
      return offlineContentManager;
    },
    dependencies: [],
    lifetime: 'singleton'
  },
  
  // LearningEngineService with ALL dependencies injected
  LearningEngineService: {
    createInstance: async (resolver: ServiceResolver) => {
      // Build dependencies object
      const dependencies: LearningEngineDependencies = {
        factRepository: resolver.resolve('FactRepository'),
        contentManager: resolver.resolve('ContentManager'),
        questionGenerator: resolver.resolve('QuestionGenerator'),
        distractorGenerator: resolver.resolve('DistractorGenerator'),
        distinctionManager: resolver.resolve('DistinctionManager'),
        tripleHelixManager: resolver.resolve('TripleHelixManager'),
        stitchPopulation: resolver.resolve('StitchPopulation'),
        stitchPreparation: resolver.resolve('StitchPreparation'),
        stitchCache: resolver.resolve('StitchCache'),
        liveAidManager: resolver.resolve('LiveAidManager'),
        contentGatingEngine: resolver.resolve('ContentGatingEngine'),
        offlineContentManager: resolver.resolve('OfflineContentManager')
      };
      
      // Create new instance with injected dependencies
      return new LearningEngineService(dependencies);
    },
    dependencies: [
      'FactRepository',
      'ContentManager',
      'QuestionGenerator',
      'DistractorGenerator',
      'DistinctionManager',
      'TripleHelixManager',
      'StitchPopulation',
      'StitchPreparation',
      'StitchCache',
      'LiveAidManager',
      'ContentGatingEngine',
      'OfflineContentManager'
    ],
    lifetime: 'singleton'
  },
  
  // Orchestration Layer
  EngineOrchestrator: {
    createInstance: async (resolver: ServiceResolver) => {
      const contentGatingEngine = resolver.resolve('ContentGatingEngine');
      const learningEngineService = resolver.resolve('LearningEngineService');
      return new EngineOrchestrator(contentGatingEngine, learningEngineService);
    },
    dependencies: ['ContentGatingEngine', 'LearningEngineService'],
    lifetime: 'singleton'
  }
} as const;

/**
 * Register all services with the container builder
 */
export function registerAllServices(builder: any): void {
  for (const [type, factory] of Object.entries(serviceFactories)) {
    builder.register(type as ServiceType, factory);
  }
}