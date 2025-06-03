/**
 * Service Container Interface - APML v2.2 Specification
 * 
 * Defines contracts for dependency injection without singleton anti-patterns.
 * Interface-first design ensures proper separation of concerns and testability.
 */

import { SubscriptionManagerInterface } from '../engines/SubscriptionManager/SubscriptionManagerInterfaces';
import { ContentGatingEngine } from '../engines/ContentGatingEngine';

/**
 * Service Resolution Interface
 * Defines how services can be resolved with proper lifecycle management
 */
export interface ServiceResolutionInterface {
  /**
   * Resolve a service instance with proper dependencies
   * @param serviceType - The service type to resolve
   * @returns Properly configured service instance
   */
  resolve<T>(serviceType: ServiceType): T;
  
  /**
   * Check if a service can be resolved
   * @param serviceType - The service type to check
   */
  canResolve(serviceType: ServiceType): boolean;
  
  /**
   * Register a service factory
   * @param serviceType - The service type
   * @param factory - Factory function that creates the service
   */
  register<T>(serviceType: ServiceType, factory: ServiceFactory<T>): void;
}

/**
 * Service Factory Interface
 * Defines how services should be created with dependencies
 */
export interface ServiceFactory<T> {
  /**
   * Create service instance with resolved dependencies
   * @param resolver - Service resolver for dependencies
   */
  create(resolver: ServiceResolutionInterface): T;
  
  /**
   * Define service dependencies that must be resolved first
   */
  getDependencies(): ServiceType[];
  
  /**
   * Check if this is a singleton service (cached after first creation)
   */
  isSingleton(): boolean;
}

/**
 * Service Lifecycle Interface
 * Manages service lifecycle events
 */
export interface ServiceLifecycleInterface {
  /**
   * Called when service is first created
   */
  onServiceCreated(serviceType: ServiceType, instance: any): void;
  
  /**
   * Called when service container is disposed
   */
  onServiceDisposed(serviceType: ServiceType, instance: any): void;
  
  /**
   * Called when dependencies change
   */
  onDependenciesChanged(serviceType: ServiceType): void;
}

/**
 * Supported Service Types
 * Enum-like type for service identification
 */
export type ServiceType = 
  | 'SubscriptionManager'
  | 'ContentGatingEngine'
  | 'OfflineContentManager'
  | 'PaymentProcessor'
  | 'UserSessionManager'
  | 'EngineOrchestrator'
  | 'LearningEngineService'
  | 'FactRepository'
  | 'ContentManager'
  | 'DistinctionManager'
  | 'DistractorGenerator'
  | 'TripleHelixManager'
  | 'QuestionGenerator'
  | 'StitchPopulation'
  | 'StitchPreparation'
  | 'StitchCache'
  | 'LiveAidManager';

/**
 * Service Configuration Interface
 * Defines how services should be configured
 */
export interface ServiceConfiguration {
  serviceType: ServiceType;
  implementationType: string;
  lifetime: 'singleton' | 'transient' | 'scoped';
  dependencies: ServiceType[];
  configuration?: Record<string, any>;
}

/**
 * Main Service Container Interface
 * APML-compliant dependency injection container
 */
export interface ServiceContainerInterface extends ServiceResolutionInterface {
  /**
   * Configure the container with service definitions
   * @param configurations - Array of service configurations
   */
  configure(configurations: ServiceConfiguration[]): void;
  
  /**
   * Build the container after configuration
   * Validates dependencies and creates resolution graph
   */
  build(): Promise<void>;
  
  /**
   * Get service with type safety
   * @param serviceType - The service type to resolve
   */
  getService<T>(serviceType: ServiceType): T;
  
  /**
   * Create a scoped container for request/session-specific services
   */
  createScope(): ServiceContainerInterface;
  
  /**
   * Dispose of all services and cleanup resources
   */
  dispose(): Promise<void>;
  
  /**
   * Add lifecycle listener
   */
  addLifecycleListener(listener: ServiceLifecycleInterface): void;
  
  /**
   * Validate container configuration
   * Ensures all dependencies can be resolved
   */
  validate(): Promise<{ isValid: boolean; errors: string[] }>;
}

/**
 * Service Provider Interface
 * For registering services with the container
 */
export interface ServiceProviderInterface {
  /**
   * Register services with the container
   * @param container - The service container to register with
   */
  registerServices(container: ServiceContainerInterface): void;
  
  /**
   * Get the services this provider registers
   */
  getProvidedServices(): ServiceType[];
  
  /**
   * Check if this provider can provide a service
   */
  canProvide(serviceType: ServiceType): boolean;
}

/**
 * Dependency Injection Context Interface
 * Provides context for service resolution
 */
export interface DIContextInterface {
  /**
   * Current resolution stack (prevents circular dependencies)
   */
  getResolutionStack(): ServiceType[];
  
  /**
   * Add service to resolution stack
   */
  pushResolution(serviceType: ServiceType): void;
  
  /**
   * Remove service from resolution stack
   */
  popResolution(): ServiceType | undefined;
  
  /**
   * Check for circular dependencies
   */
  hasCircularDependency(serviceType: ServiceType): boolean;
}

/**
 * Service Registration Builder Interface
 * Fluent API for service registration
 */
export interface ServiceRegistrationBuilderInterface<T> {
  /**
   * Register as singleton (cached after first creation)
   */
  asSingleton(): ServiceRegistrationBuilderInterface<T>;
  
  /**
   * Register as transient (new instance every time)
   */
  asTransient(): ServiceRegistrationBuilderInterface<T>;
  
  /**
   * Register as scoped (one instance per scope)
   */
  asScoped(): ServiceRegistrationBuilderInterface<T>;
  
  /**
   * Add dependency requirement
   */
  withDependency(serviceType: ServiceType): ServiceRegistrationBuilderInterface<T>;
  
  /**
   * Add configuration
   */
  withConfiguration(config: Record<string, any>): ServiceRegistrationBuilderInterface<T>;
  
  /**
   * Complete registration
   */
  build(): void;
}

/**
 * Factory Method Interface
 * For creating services with complex initialization
 */
export interface FactoryMethodInterface<T> {
  /**
   * Create service instance
   * @param context - DI context with resolved dependencies
   */
  create(context: DIContextInterface): Promise<T> | T;
  
  /**
   * Dispose of service instance
   * @param instance - The instance to dispose
   */
  dispose?(instance: T): Promise<void> | void;
}