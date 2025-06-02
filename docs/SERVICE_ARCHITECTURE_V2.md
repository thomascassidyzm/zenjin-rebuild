# Service Architecture v2.2 - APML Compliant Dependency Injection

## Overview
This document defines the APML v2.2 compliant service architecture for the Zenjin Maths App. The architecture follows strict interface-first design principles with proper dependency injection and no singleton anti-patterns.

## Architecture Layers

```
🎮 USER INTERACTION LAYER
├── PlayerCard Components
├── Admin Interface
└── User Action Handlers
    │
    ▼ requests
🎯 ORCHESTRATION LAYER
├── EngineOrchestrator
│   ├── depends on → ContentGatingEngine
│   └── depends on → LearningEngineService
    │
    ▼ coordinates
🔒 APPLICATION LAYER
├── ContentGatingEngine
│   └── depends on → SubscriptionManager
├── LearningEngineService
│   └── depends on → UserSessionManager
    │
    ▼ uses
💼 BUSINESS LAYER
├── SubscriptionManager
│   └── depends on → PaymentProcessor
├── UserSessionManager
│   └── no dependencies
    │
    ▼ calls
🔧 INFRASTRUCTURE LAYER
├── PaymentProcessor
│   └── no dependencies
└── Database/API Services
    └── no dependencies
```

## Key APML v2.2 Principles

### 1. Interface-First Design
- All service contracts defined in `/src/interfaces/` before implementation
- Dependencies explicitly declared in interface contracts
- No implementation details leak into interfaces

### 2. Dependency Flow Direction
- **Unidirectional**: Bottom layers serve top layers only
- **No circular dependencies**: Lower layers never import higher layers
- **Explicit dependencies**: All dependencies declared in service registration

### 3. Proper Dependency Injection
- **No singletons**: Services created through factory pattern
- **Constructor injection**: Dependencies provided at construction time
- **Service container**: Manages service lifecycle and resolution

## Service Registration Contract

```typescript
// From ServiceRegistrationInterface.ts
export const DEFAULT_SERVICE_REGISTRATION: ServiceRegistrationContract = {
  // INFRASTRUCTURE LAYER (no dependencies)
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
  
  // BUSINESS LAYER (depends on infrastructure)
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
  
  // APPLICATION LAYER (depends on business)
  ContentGatingEngine: {
    dependencies: ['SubscriptionManager'],
    lifetime: 'singleton',
    interfaces: ['ContentGatingEngineInterface']
  },
  
  // ORCHESTRATION LAYER (depends on application)
  EngineOrchestrator: {
    dependencies: ['ContentGatingEngine', 'LearningEngineService'],
    lifetime: 'singleton',
    interfaces: ['EngineOrchestratorInterface']
  }
};
```

## Data Flow Examples

### 1. User Accesses Content
```
PlayerCard → EngineOrchestrator.getNextQuestion()
    ↓
EngineOrchestrator → ContentGatingEngine.canAccessStitch()
    ↓
ContentGatingEngine → SubscriptionManager.checkSubscriptionStatus()
    ↓
SubscriptionManager → PaymentProcessor.getPaymentStatus()
    ↓
Result flows back up: true/false → User sees content or upgrade prompt
```

### 2. Admin Creates Content
```
AdminInterface → EngineOrchestrator.createFact()
    ↓
EngineOrchestrator → LearningEngineService.storeFact()
    ↓
LearningEngineService → UserSessionManager.getCurrentUser()
    ↓
Result: Fact stored with proper user context
```

## Implementation Guidelines

### 1. Service Creation
```typescript
// ❌ BAD: Singleton pattern
export const subscriptionManager = new SubscriptionManager();

// ✅ GOOD: Factory pattern with DI
export class SubscriptionManagerFactory {
  static create(paymentProcessor: PaymentProcessingInterface): SubscriptionManagerInterface {
    return new SubscriptionManager(paymentProcessor);
  }
}
```

### 2. Service Usage
```typescript
// ❌ BAD: Direct import of singleton
import { subscriptionManager } from './SubscriptionManager';

// ✅ GOOD: Constructor injection
export class ContentGatingEngine {
  constructor(private subscriptionManager: SubscriptionManagerInterface) {}
  
  async canAccess(userId: string): Promise<boolean> {
    return this.subscriptionManager.checkSubscriptionStatus(userId);
  }
}
```

### 3. Service Container Usage
```typescript
// Application bootstrap
const container = new ServiceContainer();
await container.configure(DEFAULT_SERVICE_REGISTRATION);
await container.build();

// Get fully wired service
const orchestrator = container.getService<EngineOrchestrator>('EngineOrchestrator');
```

## Benefits of This Architecture

### 1. Testability
- Easy to mock dependencies for unit testing
- No hidden dependencies through singletons
- Clear service boundaries

### 2. Maintainability
- Changes to lower layers don't break higher layers
- Dependencies are explicit and trackable
- Service responsibilities are clear

### 3. Scalability
- Easy to add new services following the same pattern
- Service container manages complexity
- Can implement service scoping for performance

### 4. APML Compliance
- Interface-first design prevents architectural debt
- Dependency direction enforces clean architecture
- No anti-patterns like singletons or service locators

## Migration Path

### Phase 1: Interface Definition ✅
- Define all service interfaces
- Define service registration contracts
- Define dependency graph

### Phase 2: Service Container Implementation 🔄
- Implement ServiceContainer with proper DI
- Create service factories
- Wire up dependency resolution

### Phase 3: Service Migration
- Convert existing singletons to use DI
- Update all imports to use container
- Remove old singleton exports

### Phase 4: Validation
- Test all service resolutions
- Validate no circular dependencies
- Performance testing

## Next Steps

1. Implement ServiceContainer following ServiceContainerInterface
2. Create service factories for each service type
3. Update EngineOrchestrator to use dependency injection
4. Remove all singleton exports
5. Update application bootstrap to use container

This architecture ensures the Zenjin Maths App follows APML v2.2 principles while maintaining clean, testable, and maintainable code.