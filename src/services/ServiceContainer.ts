/**
 * Service Container Implementation - APML v2.2 Compliant
 * 
 * Implements ServiceContainerInterface with proper dependency injection,
 * following APML interface-first design principles.
 */

import {
  ServiceContainerInterface,
  ServiceResolutionInterface,
  ServiceFactory,
  ServiceType,
  ServiceConfiguration,
  ServiceLifecycleInterface,
  DIContextInterface
} from '../interfaces/ServiceContainerInterface';

import {
  ServiceRegistrationContract,
  DEFAULT_SERVICE_REGISTRATION,
  ServiceDependencyGraphInterface
} from '../interfaces/ServiceRegistrationInterface';

// Import V2 service factories
import { serviceFactories } from './ServiceFactoriesV2';

/**
 * Dependency Graph Implementation
 * Validates service dependencies and provides creation order
 */
class ServiceDependencyGraph implements ServiceDependencyGraphInterface {
  constructor(private configurations: Map<ServiceType, ServiceConfiguration>) {}

  getRootServices(): ServiceType[] {
    const roots: ServiceType[] = [];
    for (const [serviceType, config] of this.configurations) {
      if (config.dependencies.length === 0) {
        roots.push(serviceType);
      }
    }
    return roots;
  }

  getDependentServices(serviceType: ServiceType): ServiceType[] {
    const dependents: ServiceType[] = [];
    for (const [type, config] of this.configurations) {
      if (config.dependencies.includes(serviceType)) {
        dependents.push(type);
      }
    }
    return dependents;
  }

  getServiceDependencies(serviceType: ServiceType): ServiceType[] {
    const config = this.configurations.get(serviceType);
    return config?.dependencies || [];
  }

  hasCircularDependencies(): boolean {
    const visited = new Set<ServiceType>();
    const recursionStack = new Set<ServiceType>();

    const hasCycle = (serviceType: ServiceType): boolean => {
      if (recursionStack.has(serviceType)) return true;
      if (visited.has(serviceType)) return false;

      visited.add(serviceType);
      recursionStack.add(serviceType);

      const dependencies = this.getServiceDependencies(serviceType);
      for (const dep of dependencies) {
        if (hasCycle(dep)) return true;
      }

      recursionStack.delete(serviceType);
      return false;
    };

    for (const serviceType of this.configurations.keys()) {
      if (hasCycle(serviceType)) return true;
    }

    return false;
  }

  getCreationOrder(): ServiceType[] {
    const order: ServiceType[] = [];
    const visited = new Set<ServiceType>();

    const visit = (serviceType: ServiceType) => {
      if (visited.has(serviceType)) return;
      
      visited.add(serviceType);
      const dependencies = this.getServiceDependencies(serviceType);
      
      for (const dep of dependencies) {
        visit(dep);
      }
      
      order.push(serviceType);
    };

    for (const serviceType of this.configurations.keys()) {
      visit(serviceType);
    }

    return order;
  }

  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for circular dependencies
    if (this.hasCircularDependencies()) {
      errors.push('Circular dependencies detected in service graph');
    }

    // Check that all dependencies are registered
    for (const [serviceType, config] of this.configurations) {
      for (const dep of config.dependencies) {
        if (!this.configurations.has(dep)) {
          errors.push(`Service ${serviceType} depends on unregistered service ${dep}`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

/**
 * DI Context Implementation
 * Tracks service resolution to prevent circular dependencies
 */
class DIContext implements DIContextInterface {
  private resolutionStack: ServiceType[] = [];

  getResolutionStack(): ServiceType[] {
    return [...this.resolutionStack];
  }

  pushResolution(serviceType: ServiceType): void {
    this.resolutionStack.push(serviceType);
  }

  popResolution(): ServiceType | undefined {
    return this.resolutionStack.pop();
  }

  hasCircularDependency(serviceType: ServiceType): boolean {
    return this.resolutionStack.includes(serviceType);
  }
}

/**
 * Service Factory Implementation
 * Maps service types to their factory functions
 */
class ServiceFactoryRegistry {
  private factories = new Map<ServiceType, ServiceFactory<any>>();

  register<T>(serviceType: ServiceType, factory: ServiceFactory<T>): void {
    this.factories.set(serviceType, factory);
  }

  get<T>(serviceType: ServiceType): ServiceFactory<T> | undefined {
    return this.factories.get(serviceType);
  }

  has(serviceType: ServiceType): boolean {
    return this.factories.has(serviceType);
  }
}

/**
 * Main Service Container Implementation
 */
export class ServiceContainer implements ServiceContainerInterface {
  private configurations = new Map<ServiceType, ServiceConfiguration>();
  private instances = new Map<ServiceType, any>();
  private factories = new ServiceFactoryRegistry();
  private lifecycleListeners: ServiceLifecycleInterface[] = [];
  private dependencyGraph?: ServiceDependencyGraph;
  private isBuilt = false;

  async configure(configurations: ServiceConfiguration[]): Promise<void> {
    // Clear existing configuration
    this.configurations.clear();
    this.instances.clear();

    // Register configurations
    for (const config of configurations) {
      this.configurations.set(config.serviceType, config);
    }

    // Create dependency graph
    this.dependencyGraph = new ServiceDependencyGraph(this.configurations);
  }

  async build(): Promise<void> {
    if (!this.dependencyGraph) {
      throw new Error('Container must be configured before building');
    }

    // Validate dependency graph
    const validation = this.dependencyGraph.validate();
    if (!validation.isValid) {
      throw new Error(`Service container validation failed: ${validation.errors.join(', ')}`);
    }

    // Register default factories
    this.registerDefaultFactories();

    this.isBuilt = true;
    console.log('✅ Service container built successfully');
  }

  async getService<T>(serviceType: ServiceType): Promise<T> {
    if (!this.isBuilt) {
      throw new Error('Container must be built before resolving services');
    }

    return this.resolve<T>(serviceType);
  }

  async resolve<T>(serviceType: ServiceType): Promise<T> {
    // Check if already instantiated (singleton)
    if (this.instances.has(serviceType)) {
      return this.instances.get(serviceType);
    }

    const context = new DIContext();
    return this.resolveWithContext<T>(serviceType, context);
  }

  private async resolveWithContext<T>(serviceType: ServiceType, context: DIContextInterface): Promise<T> {
    // Check for circular dependency
    if (context.hasCircularDependency(serviceType)) {
      throw new Error(`Circular dependency detected: ${context.getResolutionStack().join(' -> ')} -> ${serviceType}`);
    }

    // Add to resolution stack
    context.pushResolution(serviceType);

    try {
      // Get configuration
      const config = this.configurations.get(serviceType);
      if (!config) {
        throw new Error(`Service ${serviceType} is not registered`);
      }

      // Get factory
      const factory = this.factories.get(serviceType);
      if (!factory) {
        throw new Error(`No factory registered for service ${serviceType}`);
      }

      // Resolve dependencies
      const dependencies: any[] = [];
      for (const depType of config.dependencies) {
        const dependency = await this.resolveWithContext(depType, context);
        dependencies.push(dependency);
      }

      // Create instance
      const instanceOrPromise = this.createInstance(factory, dependencies, context);
      
      // Handle async factories
      if (instanceOrPromise instanceof Promise) {
        const instance = await instanceOrPromise;
        
        // Cache if singleton
        if (config.lifetime === 'singleton') {
          this.instances.set(serviceType, instance);
        }

        // Notify lifecycle listeners
        this.lifecycleListeners.forEach(listener => 
          listener.onServiceCreated(serviceType, instance)
        );

        return instance;
      } else {
        // Synchronous factory
        const instance = instanceOrPromise;
        
        // Cache if singleton
        if (config.lifetime === 'singleton') {
          this.instances.set(serviceType, instance);
        }

        // Notify lifecycle listeners
        this.lifecycleListeners.forEach(listener => 
          listener.onServiceCreated(serviceType, instance)
        );

        return instance;
      }
    } finally {
      // Remove from resolution stack
      context.popResolution();
    }
  }

  private createInstance<T>(factory: ServiceFactory<T>, dependencies: any[], context: DIContextInterface): T | Promise<T> {
    // Create mock resolver for factory
    const resolver: ServiceResolutionInterface = {
      resolve: async <U>(serviceType: ServiceType) => this.resolveWithContext<U>(serviceType, context),
      canResolve: (serviceType: ServiceType) => this.configurations.has(serviceType),
      register: () => { throw new Error('Cannot register services during resolution'); }
    };

    return factory.create(resolver);
  }

  canResolve(serviceType: ServiceType): boolean {
    return this.configurations.has(serviceType) && this.factories.has(serviceType);
  }

  register<T>(serviceType: ServiceType, factory: ServiceFactory<T>): void {
    this.factories.register(serviceType, factory);
  }

  createScope(): ServiceContainerInterface {
    // For now, return the same container
    // In a full implementation, this would create a scoped container
    return this;
  }

  async dispose(): Promise<void> {
    // Notify lifecycle listeners
    for (const [serviceType, instance] of this.instances) {
      this.lifecycleListeners.forEach(listener => 
        listener.onServiceDisposed(serviceType, instance)
      );
    }

    // Clear instances
    this.instances.clear();
    this.isBuilt = false;
  }

  addLifecycleListener(listener: ServiceLifecycleInterface): void {
    this.lifecycleListeners.push(listener);
  }

  async validate(): Promise<{ isValid: boolean; errors: string[] }> {
    if (!this.dependencyGraph) {
      return { isValid: false, errors: ['Container not configured'] };
    }

    return this.dependencyGraph.validate();
  }

  /**
   * Register default factories for all service types
   */
  private registerDefaultFactories(): void {
    // Register all factories from ServiceFactoriesV2
    for (const [serviceType, factory] of Object.entries(serviceFactories)) {
      this.register(serviceType as ServiceType, {
        create: async (resolver) => factory.createInstance(resolver),
        getDependencies: () => factory.dependencies,
        isSingleton: () => factory.lifetime === 'singleton'
      });
    }
  }
}


/**
 * Create configured service container with default registrations
 */
export async function createServiceContainer(): Promise<ServiceContainerInterface> {
  const container = new ServiceContainer();
  
  // Convert DEFAULT_SERVICE_REGISTRATION to ServiceConfiguration array
  const configurations: ServiceConfiguration[] = Object.entries(DEFAULT_SERVICE_REGISTRATION).map(
    ([serviceType, config]) => ({
      serviceType: serviceType as ServiceType,
      implementationType: serviceType,
      lifetime: config.lifetime as 'singleton' | 'transient' | 'scoped',
      dependencies: config.dependencies,
      configuration: {}
    })
  );

  await container.configure(configurations);
  await container.build();
  
  return container;
}

// Export singleton container instance for application use
let containerInstance: ServiceContainerInterface | null = null;

export async function getServiceContainer(): Promise<ServiceContainerInterface> {
  if (!containerInstance) {
    containerInstance = await createServiceContainer();
  }
  return containerInstance;
}