/**
 * Service Registration Interface - APML v2.2 Specification
 * 
 * Defines contracts for how services should be registered and wired together.
 * This ensures proper dependency flow and prevents circular dependencies.
 */

import { ServiceType, ServiceContainerInterface } from './ServiceContainerInterface';

/**
 * Service Registration Contract
 * Defines how each service type should be registered
 */
export interface ServiceRegistrationContract {
  // Core Engine Services
  SubscriptionManager: {
    dependencies: ['PaymentProcessor'];
    lifetime: 'singleton';
    interfaces: ['SubscriptionManagerInterface'];
  };
  
  ContentGatingEngine: {
    dependencies: ['SubscriptionManager'];
    lifetime: 'singleton';
    interfaces: ['ContentGatingEngineInterface'];
  };
  
  EngineOrchestrator: {
    dependencies: ['ContentGatingEngine', 'LearningEngineService'];
    lifetime: 'singleton';
    interfaces: ['EngineOrchestratorInterface'];
  };
  
  // Infrastructure Services
  PaymentProcessor: {
    dependencies: [];
    lifetime: 'singleton';
    interfaces: ['PaymentProcessingInterface'];
  };
  
  UserSessionManager: {
    dependencies: [];
    lifetime: 'singleton';
    interfaces: ['UserSessionManagerInterface'];
  };
  
  LearningEngineService: {
    dependencies: ['UserSessionManager'];
    lifetime: 'singleton';
    interfaces: ['LearningEngineServiceInterface'];
  };
}

/**
 * Service Dependency Graph Interface
 * Ensures proper resolution order and prevents cycles
 */
export interface ServiceDependencyGraphInterface {
  /**
   * Get services that have no dependencies (can be created first)
   */
  getRootServices(): ServiceType[];
  
  /**
   * Get services that depend on a given service
   */
  getDependentServices(serviceType: ServiceType): ServiceType[];
  
  /**
   * Get services that a given service depends on
   */
  getServiceDependencies(serviceType: ServiceType): ServiceType[];
  
  /**
   * Check for circular dependencies
   */
  hasCircularDependencies(): boolean;
  
  /**
   * Get topological sort order for service creation
   */
  getCreationOrder(): ServiceType[];
  
  /**
   * Validate the dependency graph
   */
  validate(): { isValid: boolean; errors: string[] };
}

/**
 * Service Factory Registration Interface
 * Maps service types to their factory functions
 */
export interface ServiceFactoryRegistrationInterface {
  /**
   * Register factory for SubscriptionManager
   */
  registerSubscriptionManagerFactory(
    factory: (paymentProcessor: any) => any
  ): void;
  
  /**
   * Register factory for ContentGatingEngine
   */
  registerContentGatingEngineFactory(
    factory: (subscriptionManager: any) => any
  ): void;
  
  /**
   * Register factory for EngineOrchestrator
   */
  registerEngineOrchestratorFactory(
    factory: (contentGatingEngine: any, learningEngine: any) => any
  ): void;
  
  /**
   * Register factory for PaymentProcessor
   */
  registerPaymentProcessorFactory(
    factory: () => any
  ): void;
  
  /**
   * Get registered factory for service type
   */
  getFactory(serviceType: ServiceType): ((...deps: any[]) => any) | null;
}

/**
 * Service Configuration Validation Interface
 * Validates service configurations before container build
 */
export interface ServiceConfigurationValidatorInterface {
  /**
   * Validate service registration configuration
   */
  validateConfiguration(
    serviceType: ServiceType,
    config: ServiceRegistrationContract[keyof ServiceRegistrationContract]
  ): { isValid: boolean; errors: string[] };
  
  /**
   * Validate entire service registration set
   */
  validateAllConfigurations(
    configurations: Partial<ServiceRegistrationContract>
  ): { isValid: boolean; errors: string[] };
  
  /**
   * Check if all required services are registered
   */
  checkRequiredServices(
    registered: ServiceType[],
    required: ServiceType[]
  ): { allPresent: boolean; missing: ServiceType[] };
}

/**
 * Service Container Builder Interface
 * Fluent API for building service containers
 */
export interface ServiceContainerBuilderInterface {
  /**
   * Add service registration
   */
  addService<T extends ServiceType>(
    serviceType: T,
    config: ServiceRegistrationContract[T]
  ): ServiceContainerBuilderInterface;
  
  /**
   * Add service provider
   */
  addProvider(
    provider: any // ServiceProviderInterface from ServiceContainerInterface
  ): ServiceContainerBuilderInterface;
  
  /**
   * Configure logging for service resolution
   */
  withLogging(enabled: boolean): ServiceContainerBuilderInterface;
  
  /**
   * Configure validation level
   */
  withValidation(level: 'none' | 'basic' | 'strict'): ServiceContainerBuilderInterface;
  
  /**
   * Build the container
   */
  build(): Promise<ServiceContainerInterface>;
  
  /**
   * Validate configuration before building
   */
  validateBeforeBuild(): Promise<{ isValid: boolean; errors: string[] }>;
}

/**
 * Service Resolution Context Interface
 * Provides context during service resolution
 */
export interface ServiceResolutionContextInterface {
  /**
   * Current service being resolved
   */
  getCurrentService(): ServiceType | null;
  
  /**
   * Services already resolved in this context
   */
  getResolvedServices(): Map<ServiceType, any>;
  
  /**
   * Add resolved service to context
   */
  addResolvedService(serviceType: ServiceType, instance: any): void;
  
  /**
   * Check if service is already resolved
   */
  isResolved(serviceType: ServiceType): boolean;
  
  /**
   * Get resolution metrics
   */
  getMetrics(): {
    totalResolutions: number;
    circularDependencyChecks: number;
    cacheHits: number;
  };
}

/**
 * Default Service Registration Configuration
 * APML-compliant default configuration for all services
 */
export const DEFAULT_SERVICE_REGISTRATION: ServiceRegistrationContract = {
  // Infrastructure layer (no dependencies)
  PaymentProcessor: {
    dependencies: [],
    lifetime: 'singleton',
    interfaces: ['PaymentProcessingInterface']
  },
  
  UserSessionManager: {
    dependencies: [],
    lifetime: 'singleton',
    interfaces: ['UserSessionManagerInterface']
  },
  
  // Business layer (depends on infrastructure)
  SubscriptionManager: {
    dependencies: ['PaymentProcessor'],
    lifetime: 'singleton',
    interfaces: ['SubscriptionManagerInterface']
  },
  
  LearningEngineService: {
    dependencies: ['UserSessionManager'],
    lifetime: 'singleton',
    interfaces: ['LearningEngineServiceInterface']
  },
  
  // Application layer (depends on business)
  ContentGatingEngine: {
    dependencies: ['SubscriptionManager'],
    lifetime: 'singleton',
    interfaces: ['ContentGatingEngineInterface']
  },
  
  // Orchestration layer (depends on application)
  EngineOrchestrator: {
    dependencies: ['ContentGatingEngine', 'LearningEngineService'],
    lifetime: 'singleton',
    interfaces: ['EngineOrchestratorInterface']
  }
};

/**
 * Service Registration Events Interface
 * Events fired during service registration and resolution
 */
export interface ServiceRegistrationEventsInterface {
  'service:registering': { serviceType: ServiceType; config: any };
  'service:registered': { serviceType: ServiceType; factory: any };
  'service:resolving': { serviceType: ServiceType; dependencies: ServiceType[] };
  'service:resolved': { serviceType: ServiceType; instance: any; resolutionTime: number };
  'service:error': { serviceType: ServiceType; error: Error; context: string };
  'container:building': { serviceCount: number; dependencyGraph: any };
  'container:built': { serviceCount: number; buildTime: number };
  'container:disposing': { serviceCount: number };
  'container:disposed': { disposeTime: number };
}