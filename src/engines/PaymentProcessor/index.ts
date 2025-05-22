// index.ts - Main export

import { PaymentGatewayAdapterFactory } from './PaymentGatewayAdapter';
import { PaymentRepositoryFactory } from './PaymentRepository';
import { PaymentProcessor } from './PaymentProcessor';

// Re-export types and interfaces
export * from './PaymentProcessorTypes';
export * from './PaymentProcessorErrors';
export * from './PaymentProcessorUtils';
export * from './PaymentProcessorLogger';
export * from './PaymentProcessorValidators';
export * from './PaymentGatewayAdapter';
export * from './PaymentRepository';
export * from './PaymentProcessor';

/**
 * Convenience factory function to create a fully configured PaymentProcessor
 */
export function createPaymentProcessor(config: {
  repositoryType: 'memory' | 'database';
  repositoryConfig?: Record<string, any>;
  defaultGateway: string;
  gatewayConfig: Record<string, any>;
}) {
  const { 
    repositoryType, 
    repositoryConfig, 
    defaultGateway, 
    gatewayConfig 
  } = config;

  // Create repository
  const repository = PaymentRepositoryFactory.createRepository(
    repositoryType,
    repositoryConfig
  );

  // Create gateway adapter
  const gateway = PaymentGatewayAdapterFactory.createAdapter(
    defaultGateway,
    gatewayConfig
  );

  // Create and return the PaymentProcessor
  return new PaymentProcessor(gateway, repository);
}