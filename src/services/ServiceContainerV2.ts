/**
 * APML v2.2 Compliant Service Container Implementation
 * 
 * This implementation follows these principles:
 * 1. Build phase instantiates all singletons
 * 2. Resolution phase is infallible
 * 3. All operations are async for consistency
 * 4. Type safety throughout
 * 5. Immutable after build
 */

import {
  ServiceContainerBuilder,
  ImmutableServiceContainer,
  ServiceFactory,
  ServiceResolver,
  ServiceInstance,
  BuildValidationResult,
  BuildError,
  BuildWarning,
  DependencyGraphNode,
  BuildException
} from '../interfaces/ServiceResolutionV2Interface';
import { ServiceType } from '../interfaces/ServiceContainerInterface';

/**
 * Internal service resolver used during build phase
 */
class BuildPhaseResolver implements ServiceResolver {
  constructor(
    private instances: Map<ServiceType, any>,
    private factories: Map<ServiceType, ServiceFactory>
  ) {}

  resolve<T>(type: ServiceType): T {
    const instance = this.instances.get(type);
    if (!instance) {
      throw new Error(`Service ${type} not found during resolution`);
    }
    return instance as T;
  }

  async resolveAsync<T>(type: ServiceType): Promise<T> {
    return this.resolve<T>(type);
  }

  hasService(type: ServiceType): boolean {
    return this.instances.has(type);
  }
}

/**
 * Immutable container implementation
 */
class ImmutableContainer implements ImmutableServiceContainer {
  constructor(
    private instances: Map<ServiceType, ServiceInstance>,
    private scopedFactories: Map<ServiceType, ServiceFactory>
  ) {}

  getService<T>(type: ServiceType): T {
    const serviceInstance = this.instances.get(type);
    if (!serviceInstance) {
      // This should never happen after successful build
      throw new Error(`CRITICAL: Service ${type} not found. This indicates a bug in the container.`);
    }
    return serviceInstance.instance as T;
  }

  hasService(type: ServiceType): boolean {
    return this.instances.has(type);
  }

  getRegisteredTypes(): ServiceType[] {
    return Array.from(this.instances.keys());
  }

  getServiceMetadata(type: ServiceType): ServiceInstance | undefined {
    return this.instances.get(type);
  }

  createScope(): ImmutableServiceContainer {
    // For now, return this. In future, handle scoped services
    return this;
  }
}

/**
 * Container builder implementation
 */
export class ServiceContainerBuilderImpl implements ServiceContainerBuilder {
  private factories = new Map<ServiceType, ServiceFactory>();
  private instances = new Map<ServiceType, any>();

  register<T>(type: ServiceType, factory: ServiceFactory<T>): ServiceContainerBuilder {
    this.factories.set(type, factory);
    return this;
  }

  registerInstance<T>(type: ServiceType, instance: T): ServiceContainerBuilder {
    this.instances.set(type, instance);
    return this;
  }

  validate(): BuildValidationResult {
    const errors: BuildError[] = [];
    const warnings: BuildWarning[] = [];
    const dependencyGraph: DependencyGraphNode[] = [];

    // Check for missing dependencies
    for (const [type, factory] of this.factories) {
      for (const dep of factory.dependencies) {
        if (!this.factories.has(dep) && !this.instances.has(dep)) {
          errors.push({
            type: 'MISSING_DEPENDENCY',
            service: type,
            message: `Service ${type} depends on ${dep} which is not registered`
          });
        }
      }
    }

    // Check for circular dependencies
    const visited = new Set<ServiceType>();
    const recursionStack = new Set<ServiceType>();

    const hasCycle = (type: ServiceType): boolean => {
      visited.add(type);
      recursionStack.add(type);

      const factory = this.factories.get(type);
      if (factory) {
        for (const dep of factory.dependencies) {
          if (!visited.has(dep)) {
            if (hasCycle(dep)) return true;
          } else if (recursionStack.has(dep)) {
            errors.push({
              type: 'CIRCULAR_DEPENDENCY',
              service: type,
              message: `Circular dependency detected: ${type} -> ${dep}`
            });
            return true;
          }
        }
      }

      recursionStack.delete(type);
      return false;
    };

    for (const type of this.factories.keys()) {
      if (!visited.has(type)) {
        hasCycle(type);
      }
    }

    // Build dependency graph
    for (const [type, factory] of this.factories) {
      const dependents: ServiceType[] = [];
      for (const [otherType, otherFactory] of this.factories) {
        if (otherFactory.dependencies.includes(type)) {
          dependents.push(otherType);
        }
      }

      dependencyGraph.push({
        service: type,
        dependencies: factory.dependencies,
        dependents,
        depth: this.calculateDepth(type)
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      dependencyGraph
    };
  }

  async build(): Promise<ImmutableServiceContainer> {
    // Validate first
    const validation = this.validate();
    if (!validation.valid) {
      throw new BuildException(
        'Container validation failed',
        validation.errors,
        validation.warnings
      );
    }

    // Sort services by dependency depth (leaf nodes first)
    const sortedTypes = Array.from(this.factories.keys()).sort(
      (a, b) => this.calculateDepth(a) - this.calculateDepth(b)
    );

    // Build phase resolver
    const resolver = new BuildPhaseResolver(this.instances, this.factories);

    // Instantiate all singletons
    const serviceInstances = new Map<ServiceType, ServiceInstance>();

    for (const type of sortedTypes) {
      const factory = this.factories.get(type)!;
      
      if (factory.lifetime === 'singleton') {
        try {
          const instance = await factory.createInstance(resolver);
          this.instances.set(type, instance);
          
          serviceInstances.set(type, {
            instance,
            type,
            initialized: true,
            dependencies: factory.dependencies
          });
        } catch (error) {
          throw new BuildException(
            `Failed to instantiate service ${type}`,
            [{
              type: 'INITIALIZATION_FAILED',
              service: type,
              message: error instanceof Error ? error.message : 'Unknown error'
            }],
            []
          );
        }
      }
    }

    // Add pre-registered instances
    for (const [type, instance] of this.instances) {
      if (!serviceInstances.has(type)) {
        serviceInstances.set(type, {
          instance,
          type,
          initialized: true,
          dependencies: []
        });
      }
    }

    // Create immutable container
    const scopedFactories = new Map(
      Array.from(this.factories.entries())
        .filter(([_, factory]) => factory.lifetime !== 'singleton')
    );

    return new ImmutableContainer(serviceInstances, scopedFactories);
  }

  private calculateDepth(type: ServiceType): number {
    const factory = this.factories.get(type);
    if (!factory || factory.dependencies.length === 0) {
      return 0;
    }

    let maxDepth = 0;
    for (const dep of factory.dependencies) {
      maxDepth = Math.max(maxDepth, this.calculateDepth(dep) + 1);
    }
    return maxDepth;
  }
}

/**
 * Factory function to create a new container builder
 */
export function createServiceContainer(): ServiceContainerBuilder {
  return new ServiceContainerBuilderImpl();
}