# APML Framework Relationships

This document provides a visual representation of the relationships between Modules, Interfaces, and Components in the Zenjin Maths App rebuild project. It follows the APML Framework v1.2.6 structure and shows how these elements are connected.

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
  - Status: Fully implemented and tested

- **ContentManager**:
  - Module: LearningEngine
  - Interface: ContentManagerInterface
  - Purpose: Administrative tool for managing curriculum content
  - Status: Fully implemented with interface definition

- **MetricsCalculator**:
  - Module: MetricsSystem
  - Interface: MetricsCalculatorInterface
  - Purpose: Performs calculations for various performance metrics
  - Status: Fully implemented with validation criteria

- **OfflineStorage**:
  - Module: OfflineSupport
  - Interface: OfflineStorageInterface
  - Purpose: Provides offline functionality with local storage
  - Status: Fully implemented with IndexedDB support

## Missing Framework Elements

- **Interface Definitions**:
  - PaymentProcessingInterface.apml (listed as PaymentProcessingInterface in registry)
  - ContentCachingInterface.apml (listed as ContentCachingInterface in registry)

- **Naming Consistency**:
  - ContentAccessInterface.apml vs ContentAccessControllerInterface.apml (needs to be aligned across all documents)

- **Development Sessions**:
  - FactRepository.DevelopmentSession.apml
  - ContentManager.DevelopmentSession.apml
  - PaymentProcessor.DevelopmentSession.apml
  - Dashboard.DevelopmentSession.apml

## Next Steps

1. Create remaining missing interface definitions
2. Create missing development session files
3. Update module APML files to include all interfaces and components
4. Ensure consistent naming across all framework documents
5. Integrate the HTML visual test files into the CI/CD pipeline
6. Expand visual testing coverage to include additional components
7. Update the registry.apml to reflect the latest APML Framework v1.2.6 features
8. Implement Component Test Harness with Modular Build for better testing

## Visual Testing Resources

HTML test files have been created to provide visual testing capabilities for key components:

- **PlayerCard Testing**: `/tests/visual/PlayerCard-test.html`
  - Tests different boundary levels and question difficulties
  - Provides interactive controls for customizing component behavior
  - Logs user responses for testing feedback mechanisms

- **ThemeManager Testing**: `/tests/visual/ThemeManager-test.html`
  - Tests theme switching between dark, light and ocean themes
  - Provides interactive controls for customizing theme properties
  - Demonstrates real-time animation and styling capabilities

- **FeedbackSystem Testing**: `/tests/visual/FeedbackSystem-test.html`
  - Tests different feedback animations and styles
  - Allows testing of accessibility features
  - Provides interactive controls for customizing feedback behavior

These test files can be run directly in a browser without requiring the full application build, making them ideal for rapid visual testing and development.

## Component Test Harness

A planned Component Test Harness with Modular Build will provide a more comprehensive testing approach that combines:

- **Visual UI/UX Testing**: For non-coders to evaluate user experience
- **Component Interface Testing**: For verifying technical integration points
- **Progressive Integration**: For testing modules in isolation before connecting them

This approach will be implemented in the next phase to create a more robust testing framework for the application.