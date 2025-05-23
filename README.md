# Zenjin Maths App Rebuild

## Project Overview

This project is a rebuild of the Zenjin Maths App using the APML Framework v1.3.0. The rebuild preserves the effective theoretical foundation and user experience while improving component separation, interface clarity, and testability to support ongoing adaptation and enhancement.

## Key Project Files

- **Project Registry**: [`/registry.apml`](./registry.apml) - The single source of truth for all components, interfaces, and implementation status
- **Project Status**: [`/status.html`](./status.html) - Visual representation of current project progress
- **Framework Definition**: [`/apml_framework_v1.3.0.md`](./apml_framework_v1.3.0.md) - The latest version of the APML Framework (v1.3.0)
- **Framework Explainer**: [`/APML_EXPLAINER.md`](./APML_EXPLAINER.md) - Overview of the APML methodology and parallel AI development approach
- **Knowledge Transfer**: [`/knowledge_transfer.md`](./knowledge_transfer.md) - Overview of the project structure and implementation approach
- **Deployment Guide**: [`/DEPLOYMENT.md`](./DEPLOYMENT.md) - Instructions for deploying the app to Vercel

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
├── apml_framework_v1.3.0.md    # Current framework version
├── APML_EXPLAINER.md           # APML methodology explanation
├── DEPLOYMENT.md               # Deployment instructions
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
- `ComponentNameDemo.tsx` - Interactive demo
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

1. Deploy to Vercel for testing (see DEPLOYMENT.md)
2. Run comprehensive integration tests (tests already created)
3. Set up end-to-end testing for critical user flows
4. Optimize performance and bundle size
5. Prepare for beta deployment

## Contact

For questions about this project, please contact the Zenjin team.