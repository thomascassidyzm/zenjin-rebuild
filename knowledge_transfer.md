# Zenjin Maths App Rebuild - Knowledge Transfer Summary

## Project Overview
This project implements the Fractal AI-Assisted Development Framework v1.1.0 for rebuilding the Zenjin Maths App. The framework provides a structured approach to AI-assisted development with clear separation of interfaces and implementation, enabling parallel development with multiple LLMs if desired.

## Project Structure
```
/home/ubuntu/zenjin-rebuild/
├── apml/
│   ├── phase0r/                 # Rebuild Knowledge Capture
│   │   ├── ExpertKnowledge.apml
│   │   ├── ImplementationAssessment.apml
│   │   ├── RebuildRequirements.apml
│   │   └── KnowledgeIntegrationStrategy.apml
│   ├── phase1/                  # Project Registry
│   │   └── ProjectRegistry.apml
│   ├── phase2/                  # Module Definitions
│   │   ├── UserInterface.apml
│   │   ├── LearningEngine.apml
│   │   ├── ProgressionSystem.apml
│   │   ├── MetricsSystem.apml
│   │   ├── SubscriptionSystem.apml
│   │   └── OfflineSupport.apml
│   ├── phase3/                  # Development Session Templates
│   │   ├── PlayerCard.DevelopmentSession.apml
│   │   ├── DistinctionManager.DevelopmentSession.apml
│   │   └── ... (other component templates)
│   └── interfaces/              # Interface Definitions
│       ├── PlayerCardInterface.apml
│       ├── FeedbackSystemInterface.apml
│       └── ... (other interface definitions)
└── todo.md                      # Project task list
```

## What Has Been Accomplished
1. **Phase 0R: Rebuild Knowledge Capture**
   - Created comprehensive APML artifacts capturing expert knowledge
   - Documented implementation assessment of the current system
   - Defined rebuild requirements and knowledge integration strategy

2. **Phase 1: Project Registry Creation**
   - Defined the project purpose, core modules, and critical interfaces
   - Established clear module boundaries and interactions

3. **Phase 2: Module Definition**
   - Created detailed Module.apml files for all six core modules:
     - UserInterface
     - LearningEngine
     - ProgressionSystem
     - MetricsSystem
     - SubscriptionSystem
     - OfflineSupport

4. **Phase 3: Component Implementation Preparation**
   - Created DevelopmentSession.apml templates for all key components
   - Each template includes implementation goals, context references, prompts, mock inputs, expected outputs, and validation criteria

5. **Interface Definitions**
   - Created detailed interface definitions for all components
   - Each interface includes data structures, method signatures, error handling, dependencies, and usage examples

## Core Modules and Components

### UserInterface Module
- **PlayerCard**: Presents questions with binary choices
- **FeedbackSystem**: Provides visual feedback for user actions
- **ThemeManager**: Controls application theming and styling

### LearningEngine Module
- **DistinctionManager**: Manages the five boundary levels of distinction
- **DistractorGenerator**: Creates appropriate distractors
- **QuestionGenerator**: Generates questions based on learning paths
- **FactRepository**: Stores and retrieves mathematical facts

### ProgressionSystem Module
- **TripleHelixManager**: Manages three parallel learning paths
- **StitchManager**: Handles learning units within paths
- **SpacedRepetitionSystem**: Implements the Stitch Repositioning Algorithm
- **ProgressTracker**: Tracks user progress through content

### MetricsSystem Module
- **SessionMetricsManager**: Calculates metrics for individual sessions
- **LifetimeMetricsManager**: Manages metrics across all user sessions
- **MetricsCalculator**: Performs core metric calculations

### SubscriptionSystem Module
- **SubscriptionManager**: Manages user subscriptions
- **ContentAccessController**: Controls access to premium content

### OfflineSupport Module
- **SynchronizationManager**: Manages data synchronization
- **OfflineStorage**: Handles local data storage

## Next Steps
1. **Component Implementation with Claude 3.7 Sonnet**
   - Use the interface definitions as contracts for implementation
   - Follow the DevelopmentSession.apml templates for each component
   - Test each component individually with mock inputs

2. **Integration Testing**
   - Verify that components work together according to interface contracts
   - Ensure all requirements from Phase 0R are met

3. **Deployment**
   - Prepare for launch by May 23, 2025

## Important Files for Implementation
- **Interface Definitions**: `/apml/interfaces/` - These define the contracts that implementations must follow
- **Module Definitions**: `/apml/phase2/` - These provide context about each module's purpose and components
- **Development Session Templates**: `/apml/phase3/` - These provide structured prompts for LLM implementation

## Implementation Approach
1. Select a component to implement
2. Provide Claude 3.7 Sonnet with:
   - The component's interface definition
   - The relevant Module.apml file for context
   - The component's DevelopmentSession.apml template
3. Request implementation following the interface contract
4. Test the implementation with mock inputs
5. Repeat for each component

## Project Timeline
- Launch deadline: Friday, May 23, 2025

## Special Considerations
- Focus on well-defined interface protocols to enable multiple LLMs to work in parallel
- Each component should be testable individually with mock inputs
- The implementation should follow the distinction-based learning principles outlined in ExpertKnowledge.apml
