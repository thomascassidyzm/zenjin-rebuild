# APML Framework Relationships

This document provides a visual representation of the relationships between Modules, Interfaces, and Components in the Zenjin Maths App rebuild project. It follows the APML Framework v1.2.3 structure and shows how these elements are connected.

## Framework Structure

```
APML Framework
├── Modules          # Logical groupings of functionality
│   ├── Interfaces   # Contracts that define component behavior
│   └── Components   # Implementations of interfaces
```

## Module Relationship Map

```
┌──────────────────────────────────────────────────────────────────┐
│ Module: UserInterface                                            │
├──────────────────────────────────────────────────────────────────┤
│ Purpose: Provide a calming, anxiety-free visual experience with  │
│          appropriate feedback for user interactions              │
└─┬────────────────────────────────────────────────────────────────┘
  │
  ├── Interface: PlayerCardInterface
  │   └── Component: PlayerCard
  │       └── Implementation: /src/components/PlayerCard/
  │
  ├── Interface: FeedbackSystemInterface
  │   └── Component: FeedbackSystem
  │       └── Implementation: /src/components/FeedbackSystem/
  │
  ├── Interface: ThemeManagerInterface
  │   └── Component: ThemeManager
  │       └── Implementation: /src/components/ThemeManager/
  │
  ├── Interface: SessionSummaryInterface
  │   └── Component: SessionSummary
  │       └── Implementation: /src/components/SessionSummary/
  │
  └── Interface: DashboardInterface
      └── Component: Dashboard
          └── Implementation: /src/components/Dashboard/
```

```
┌──────────────────────────────────────────────────────────────────┐
│ Module: LearningEngine                                           │
├──────────────────────────────────────────────────────────────────┤
│ Purpose: Implement the distinction-based learning approach with  │
│          five boundary levels and manage question generation     │
└─┬────────────────────────────────────────────────────────────────┘
  │
  ├── Interface: DistinctionManagerInterface
  │   └── Component: DistinctionManager
  │       └── Implementation: /src/engines/DistinctionManager/
  │
  ├── Interface: DistractorGeneratorInterface
  │   └── Component: DistractorGenerator
  │       └── Implementation: /src/engines/DistractorGenerator/
  │
  ├── Interface: QuestionGeneratorInterface
  │   └── Component: QuestionGenerator
  │       └── Implementation: /src/engines/QuestionGenerator/
  │
  ├── Interface: FactRepositoryInterface
  │   └── Component: FactRepository
  │       └── Implementation: /src/engines/FactRepository/
  │
  └── Interface: ContentManagerInterface
      └── Component: ContentManager
          └── Implementation: /src/engines/ContentManager/
```

```
┌──────────────────────────────────────────────────────────────────┐
│ Module: MetricsSystem                                            │
├──────────────────────────────────────────────────────────────────┤
│ Purpose: Calculate and manage session and lifetime metrics       │
└─┬────────────────────────────────────────────────────────────────┘
  │
  ├── Interface: SessionMetricsInterface
  │   └── Component: SessionMetricsManager
  │       └── Implementation: /src/engines/SessionMetricsManager/
  │
  ├── Interface: LifetimeMetricsInterface
  │   └── Component: LifetimeMetricsManager
  │       └── Implementation: /src/engines/LifetimeMetricsManager/
  │
  ├── Interface: MetricsStorageInterface
  │   └── Component: MetricsStorage
  │       └── Implementation: /src/engines/MetricsStorage/
  │
  └── Interface: MetricsCalculatorInterface
      └── Component: MetricsCalculator
          └── Implementation: /src/engines/MetricsCalculator/
```

```
┌──────────────────────────────────────────────────────────────────┐
│ Module: ProgressionSystem                                        │
├──────────────────────────────────────────────────────────────────┤
│ Purpose: Implement the Triple Helix model with three parallel    │
│          learning paths and spaced repetition algorithm          │
└─┬────────────────────────────────────────────────────────────────┘
  │
  ├── Interface: TripleHelixManagerInterface
  │   └── Component: TripleHelixManager
  │       └── Implementation: /src/engines/TripleHelixManager/
  │
  ├── Interface: SpacedRepetitionInterface
  │   └── Component: SpacedRepetitionSystem
  │       └── Implementation: /src/engines/SpacedRepetitionSystem/
  │
  └── Interface: ProgressTrackingInterface
      └── Component: ProgressTracker
          └── Implementation: /src/engines/ProgressTracker/
```

```
┌──────────────────────────────────────────────────────────────────┐
│ Module: SubscriptionSystem                                       │
├──────────────────────────────────────────────────────────────────┤
│ Purpose: Manage subscription tiers and control access to content │
└─┬────────────────────────────────────────────────────────────────┘
  │
  ├── Interface: SubscriptionManagerInterface
  │   └── Component: SubscriptionManager
  │       └── Implementation: /src/engines/SubscriptionManager/
  │
  ├── Interface: ContentAccessInterface
  │   └── Component: ContentAccessController
  │       └── Implementation: /src/engines/ContentAccessController/
  │
  └── Interface: PaymentProcessingInterface
      └── Component: PaymentProcessor
          └── Implementation: /src/engines/PaymentProcessor/
```

```
┌──────────────────────────────────────────────────────────────────┐
│ Module: OfflineSupport                                           │
├──────────────────────────────────────────────────────────────────┤
│ Purpose: Provide offline functionality with local storage        │
└─┬────────────────────────────────────────────────────────────────┘
  │
  ├── Interface: OfflineStorageInterface
  │   └── Component: OfflineStorage
  │       └── Implementation: /src/engines/OfflineStorage/
  │
  ├── Interface: SynchronizationManagerInterface
  │   └── Component: SynchronizationManager
  │       └── Implementation: /src/engines/SynchronizationManager/
  │
  └── Interface: ContentCachingInterface
      └── Component: ContentCache
          └── Implementation: /src/engines/ContentCache/
```

```
┌──────────────────────────────────────────────────────────────────┐
│ Module: UserManagement                                           │
├──────────────────────────────────────────────────────────────────┤
│ Purpose: Manage user accounts, including anonymous users         │
└─┬────────────────────────────────────────────────────────────────┘
  │
  └── Interface: AnonymousUserManagerInterface
      └── Component: AnonymousUserManager
          └── Implementation: /src/engines/AnonymousUserManager/
```

## Cross-Module Dependencies

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│  UserInterface  │◄────►│  LearningEngine │◄────►│ProgressionSystem│
└────────┬────────┘      └────────┬────────┘      └────────┬────────┘
         │                        │                        │
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│  MetricsSystem  │◄────►│SubscriptionSystem◄────►│ OfflineSupport  │
└────────┬────────┘      └────────┬────────┘      └────────┬────────┘
         │                        │                        │
         │                        │                        │
         └────────────────►UserManagement◄────────────────┘
```

## Key Interactions

1. **Player Card - Learning Engine**
   - Player Card requests questions from Question Generator
   - Player Card requests distractors from Distractor Generator

2. **Player Card - Feedback System**
   - Player Card uses Feedback System for visual response feedback

3. **Session Metrics - Session Summary**
   - Session Metrics provides data to Session Summary for visualization

4. **Distinction Manager - Triple Helix Manager**
   - Distinction Manager informs Triple Helix Manager about mastery levels

5. **Synchronization Manager - Metrics Storage**
   - Ensures metrics are properly stored locally and synchronized

6. **Content Cache - Offline Storage**
   - Content Cache uses Offline Storage for persisting cached content

7. **Anonymous User Manager - Subscription Manager**
   - Works together to manage anonymous user subscriptions

## Recently Integrated Components

- **FactRepository**:
  - Module: LearningEngine
  - Interface: FactRepositoryInterface
  - Purpose: Core knowledge base for mathematical facts

- **ContentManager**:
  - Module: LearningEngine
  - Interface: ContentManagerInterface (needs definition)
  - Purpose: Administrative tool for managing curriculum content

- **MetricsCalculator**:
  - Module: MetricsSystem
  - Interface: MetricsCalculatorInterface
  - Purpose: Performs calculations for various performance metrics

## Missing Framework Elements

- **Interface Definitions**:
  - ContentManagerInterface.apml
  - ContentAccessInterface.apml (listed as ContentAccessInterface in registry, ContentAccessControllerInterface in files)
  - PaymentProcessingInterface.apml (listed as PaymentProcessingInterface in registry)
  - ContentCachingInterface.apml (listed as ContentCachingInterface in registry)

- **Development Sessions**:
  - FactRepository.DevelopmentSession.apml
  - ContentManager.DevelopmentSession.apml
  - Several others need verification for correct naming and relationship mapping

## Next Steps

1. Create missing interface definitions
2. Create missing development session files
3. Update module APML files to include all interfaces and components
4. Ensure consistent naming across all framework documents

This mapping is designed to provide a clear visual representation of the relationships between components in the APML Framework. It serves as a reference for developers working with the codebase and helps maintain the structural integrity of the system.