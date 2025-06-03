/**
 * APML v2.2 Service Resolution Interface
 * 
 * Design Principles:
 * 1. Build-time validation - All services instantiated during build phase
 * 2. Infallible resolution - Getting a service after build never fails
 * 3. Type safety - All service types known at compile time
 * 4. Immutable container - No mutations after build
 * 5. Async-first - All operations are async for consistency
 */

import { ServiceType } from './ServiceContainerInterface';

/**
 * Service instance with metadata
 */
export interface ServiceInstance<T = any> {
  instance: T;
  type: ServiceType;
  initialized: boolean;
  dependencies: ServiceType[];
}

/**
 * Build-time validation result
 */
export interface BuildValidationResult {
  valid: boolean;
  errors: BuildError[];
  warnings: BuildWarning[];
  dependencyGraph: DependencyGraphNode[];
}

export interface BuildError {
  type: 'MISSING_DEPENDENCY' | 'CIRCULAR_DEPENDENCY' | 'INITIALIZATION_FAILED';
  service: ServiceType;
  message: string;
}

export interface BuildWarning {
  type: 'UNUSED_SERVICE' | 'DEPRECATED_SERVICE';
  service: ServiceType;
  message: string;
}

export interface DependencyGraphNode {
  service: ServiceType;
  dependencies: ServiceType[];
  dependents: ServiceType[];
  depth: number; // Distance from root services
}

/**
 * Service factory that produces instances
 * ALL factories must be async for consistency
 */
export interface ServiceFactory<T = any> {
  createInstance: (resolver: ServiceResolver) => Promise<T>;
  dependencies: ServiceType[];
  lifetime: 'singleton' | 'scoped' | 'transient';
}

/**
 * Service resolver used during build phase
 * This is only available to factories during construction
 */
export interface ServiceResolver {
  resolve<T>(type: ServiceType): T;
  resolveAsync<T>(type: ServiceType): Promise<T>;
  hasService(type: ServiceType): boolean;
}

/**
 * Immutable service container after build
 * Resolution is infallible - services are guaranteed to exist
 */
export interface ImmutableServiceContainer {
  /**
   * Get a service instance - infallible after build
   * @throws Never - this method cannot fail after successful build
   */
  getService<T>(type: ServiceType): T;
  
  /**
   * Check if a service exists
   */
  hasService(type: ServiceType): boolean;
  
  /**
   * Get all registered service types
   */
  getRegisteredTypes(): ServiceType[];
  
  /**
   * Get service metadata
   */
  getServiceMetadata(type: ServiceType): ServiceInstance | undefined;
  
  /**
   * Create a scoped container for request-scoped services
   */
  createScope(): ImmutableServiceContainer;
}

/**
 * Service container builder
 * This is the mutable phase where services are registered and built
 */
export interface ServiceContainerBuilder {
  /**
   * Register a service factory
   */
  register<T>(type: ServiceType, factory: ServiceFactory<T>): ServiceContainerBuilder;
  
  /**
   * Register a singleton instance directly
   */
  registerInstance<T>(type: ServiceType, instance: T): ServiceContainerBuilder;
  
  /**
   * Validate the container configuration
   */
  validate(): BuildValidationResult;
  
  /**
   * Build the container - this instantiates all singletons
   * @throws BuildException if validation fails
   */
  build(): Promise<ImmutableServiceContainer>;
}

/**
 * Exception thrown during build phase
 */
export class BuildException extends Error {
  constructor(
    message: string,
    public readonly errors: BuildError[],
    public readonly warnings: BuildWarning[]
  ) {
    super(message);
    this.name = 'BuildException';
  }
}

/**
 * Type-safe service registration
 */
export interface TypedServiceRegistration<T> {
  type: ServiceType;
  factory: ServiceFactory<T>;
  contract: new (...args: any[]) => T; // Constructor function for type checking
}

/**
 * Service registration manifest
 * This ensures all services are known at compile time
 */
export interface ServiceManifest {
  // Infrastructure Layer
  PaymentProcessor: TypedServiceRegistration<any>;
  UserSessionManager: TypedServiceRegistration<any>;
  
  // Business Layer
  SubscriptionManager: TypedServiceRegistration<any>;
  LearningEngineService: TypedServiceRegistration<any>;
  
  // Application Layer  
  ContentGatingEngine: TypedServiceRegistration<any>;
  
  // Orchestration Layer
  EngineOrchestrator: TypedServiceRegistration<any>;
}