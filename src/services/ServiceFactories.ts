/**
 * APML v2.2 Service Factory Implementations
 * 
 * All factories are async-first and follow the interface contract
 */

import { ServiceFactory, ServiceResolver } from '../interfaces/ServiceResolutionV2Interface';
import { ServiceType } from '../interfaces/ServiceContainerInterface';

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
}

/**
 * Service factory definitions
 */
export const serviceFactories: Record<ServiceType, ServiceFactory> = {
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
  
  LearningEngineService: {
    createInstance: async (resolver: ServiceResolver) => {
      // Get dependencies
      const contentGatingEngine = resolver.resolve('ContentGatingEngine');
      const offlineContentManager = resolver.resolve('OfflineContentManager');
      
      // Create new instance with injected dependencies
      const { LearningEngineService } = await import('./LearningEngineService');
      return new LearningEngineService(contentGatingEngine, offlineContentManager);
    },
    dependencies: ['UserSessionManager', 'ContentGatingEngine', 'OfflineContentManager'],
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