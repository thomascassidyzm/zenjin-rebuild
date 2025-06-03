/**
 * APML v2.2 Application Service Container
 * 
 * This is the global service container instance for the application.
 * It's built once during app initialization and provides infallible service resolution.
 */

import { ImmutableServiceContainer, BuildException } from '../interfaces/ServiceResolutionV2Interface';
import { createServiceContainer } from './ServiceContainerV2';
import { registerAllServices } from './ServiceFactoriesV2';

let serviceContainer: ImmutableServiceContainer | null = null;
let initializationPromise: Promise<ImmutableServiceContainer> | null = null;

/**
 * Initialize the service container
 * This should be called once during app startup
 */
export async function initializeServiceContainer(): Promise<ImmutableServiceContainer> {
  // If already initializing, return the same promise
  if (initializationPromise) {
    return initializationPromise;
  }
  
  // If already initialized, return the container
  if (serviceContainer) {
    return serviceContainer;
  }
  
  // Start initialization
  initializationPromise = (async () => {
    try {
      console.log('🏗️ Building service container...');
      
      const builder = createServiceContainer();
      registerAllServices(builder);
      
      // Validate before building
      const validation = builder.validate();
      if (!validation.valid) {
        console.error('❌ Service container validation failed:', validation.errors);
        throw new BuildException(
          'Service container validation failed',
          validation.errors,
          validation.warnings
        );
      }
      
      // Build the container
      const container = await builder.build();
      serviceContainer = container;
      
      console.log('✅ Service container built successfully');
      console.log('📦 Registered services:', container.getRegisteredTypes());
      
      return container;
    } catch (error) {
      console.error('❌ Failed to build service container:', error);
      initializationPromise = null; // Reset so it can be retried
      throw error;
    }
  })();
  
  return initializationPromise;
}

/**
 * Get the service container
 * @throws Error if container not initialized
 */
export function getServiceContainer(): ImmutableServiceContainer {
  if (!serviceContainer) {
    throw new Error(
      'Service container not initialized. Call initializeServiceContainer() first.'
    );
  }
  return serviceContainer;
}

/**
 * Check if the service container is initialized
 */
export function isServiceContainerInitialized(): boolean {
  return serviceContainer !== null;
}

/**
 * Type-safe service getter
 * This provides compile-time type safety for service resolution
 */
export function getService<T>(type: string): T {
  const container = getServiceContainer();
  return container.getService<T>(type);
}