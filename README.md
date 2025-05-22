# Zenjin Maths App Rebuild

## Project Overview

This project is a rebuild of the Zenjin Maths App using the APML Framework v1.2.3. The rebuild preserves the effective theoretical foundation and user experience while improving component separation, interface clarity, and testability to support ongoing adaptation and enhancement.

## Key Project Files

- **Project Registry**: [`/registry.apml`](./registry.apml) - The single source of truth for all components, interfaces, and implementation status
- **Project Status**: [`/status.html`](./status.html) - Visual representation of current project progress
- **Framework Definition**: [`/framework/current/apml_framework_v1.2.3.md`](./framework/current/apml_framework_v1.2.3.md) - The latest version of the APML Framework (v1.2.3)
- **Knowledge Transfer**: [`/knowledge_transfer.md`](./knowledge_transfer.md) - Overview of the project structure and implementation approach

## Implementation Status

All 24 components have been successfully implemented:

### UI Components (5/5)
- ✅ PlayerCard
- ✅ FeedbackSystem
- ✅ ThemeManager
- ✅ SessionSummary
- ✅ Dashboard

### Learning Engine (5/5)
- ✅ FactRepository
- ✅ ContentManager
- ✅ DistinctionManager
- ✅ DistractorGenerator
- ✅ QuestionGenerator

### Progression System (3/3)
- ✅ TripleHelixManager
- ✅ SpacedRepetitionSystem
- ✅ ProgressTracker

### Metrics System (4/4)
- ✅ MetricsCalculator
- ✅ SessionMetricsManager
- ✅ LifetimeMetricsManager
- ✅ MetricsStorage

### Subscription System (3/3)
- ✅ SubscriptionManager
- ✅ ContentAccessController
- ✅ PaymentProcessor

### Offline Support (3/3)
- ✅ OfflineStorage
- ✅ SynchronizationManager
- ✅ ContentCache

### User Management (1/1)
- ✅ AnonymousUserManager

## Directory Structure

```
/zenjin-rebuild/
├── registry.apml               # SINGLE SOURCE OF TRUTH for what needs to be built
├── status.html                 # Current project status visualization
├── README.md                   # This file - project overview
│
├── framework/                  # Framework definition
│   └── current/                # Current framework version
│       └── apml_framework_v1.2.3.md
│
├── docs/                       # Documentation and build artifacts
│   ├── build/                  # Build artifacts
│   │   ├── apml/               # APML definition files
│   │   └── implementation_packages/ # LLM implementation instructions
│   │
│   ├── integration/            # Integration documentation and testing
│   ├── testing/                # Testing documentation
│   └── archived/               # Archived files and documents
│
├── src/                        # Source code
│   ├── components/             # UI components
│   │   ├── PlayerCard/
│   │   ├── FeedbackSystem/
│   │   ├── ThemeManager/
│   │   ├── SessionSummary/
│   │   └── Dashboard/
│   │
│   └── engines/                # Business logic components
│       ├── DistinctionManager/
│       ├── DistractorGenerator/
│       ├── QuestionGenerator/
│       └── ...                 # Other engine components
│
└── tests/                      # Global test configurations and fixtures
```

## Component Organization

Each component follows a consistent file structure:

### UI Components (`/src/components/ComponentName/`)
- `ComponentName.tsx` - Main component implementation
- `ComponentName.test.tsx` - Component tests
- `ComponentNameExample.tsx` - Usage examples
- `componentName.css` - Component styles (if needed)
- `ComponentName.README.md` - Component documentation
- `index.ts` - Exports for the component

### Engine Components (`/src/engines/ComponentName/`)
- `ComponentName.ts` - Main implementation
- `ComponentNameTypes.ts` - Type definitions
- `ComponentName.test.ts` - Component tests
- `ComponentNameExample.ts` - Usage examples
- `ComponentName.README.md` - Component documentation
- `index.ts` - Exports for the component

## Module Structure

The application is divided into six core modules:

1. **UserInterface** - Visual components and user interaction
2. **LearningEngine** - Distinction-based learning implementation
3. **ProgressionSystem** - Triple Helix model and learning progression
4. **MetricsSystem** - Session and lifetime metrics calculation
5. **SubscriptionSystem** - Subscription management and content access
6. **OfflineSupport** - Offline functionality and synchronization

## Next Steps

1. Run comprehensive integration tests (tests already created)
2. Set up end-to-end testing for critical user flows
3. Optimize performance and bundle size
4. Prepare for beta deployment
5. Develop user documentation and tutorials

## Contact

For questions about this project, please contact the Zenjin team.