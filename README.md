# Zenjin Maths App Rebuild

## Project Overview

This project is a rebuild of the Zenjin Maths App using the APML Framework v1.3.0. The rebuild preserves the effective theoretical foundation and user experience while improving component separation, interface clarity, and testability to support ongoing adaptation and enhancement.

## Key Project Files

### Primary Documentation
- **Project Registry**: [`/registry.apml`](./registry.apml) - Single source of truth for all components and implementation status
- **Project Handoff**: [`/PROJECT_HANDOFF.apml`](./PROJECT_HANDOFF.apml) - Comprehensive handoff document for new developers/LLMs
- **Quick Reference**: [`/QUICK_HANDOFF.md`](./QUICK_HANDOFF.md) - Fast orientation for immediate context

### Framework & Methodology  
- **Framework Definition**: [`/apml_framework_v1.3.2.md`](./apml_framework_v1.3.2.md) - APML Framework v1.3.2 with 6-phase status tracking
- **Framework Explainer**: [`/APML_EXPLAINER.md`](./APML_EXPLAINER.md) - Overview of APML methodology and interface-first development
- **Knowledge Transfer**: [`/knowledge_transfer.md`](./knowledge_transfer.md) - Project structure and implementation approach

### Operational
- **Project Status**: [`/status.html`](./status.html) - Visual project progress dashboard
- **Deployment Guide**: [`/DEPLOYMENT.md`](./DEPLOYMENT.md) - Instructions for deploying to Vercel

## Implementation Status

All 26 components across 7 modules have been implemented with varying levels of completion:

## Status Levels
- 🔴 **not-started**: Not implemented at all
- 🟡 **scaffolded**: Basic structure exists but not functional  
- 🟠 **functional**: Basic functionality works but not polished
- 🟢 **integrated**: Works with other components properly
- 🔵 **tested**: Has comprehensive tests
- ⭐ **optimized**: Performance optimized and production-ready

## Module Overview

| Module | Status | Components | Completion | Priority Issues |
|---|---|---|---|---|
| **UserInterface** | 🟢 integrated | 5/5 | 95% | Mobile accessibility |
| **LearningEngine** | 🟠 functional | 6/6 | 85% | Curriculum admin tools |
| **ProgressionSystem** | 🟠 functional | 4/4 | 85% | ✅ **Spaced repetition working!** |
| **MetricsSystem** | 🟠 functional | 4/4 | 90% | Global ranking |
| **SubscriptionSystem** | 🟡 scaffolded | 4/4 | 65% | Payment integration |
| **OfflineSupport** | 🟠 functional | 4/4 | 75% | Sync conflict resolution |
| **UserManagement** | 🟠 functional | 1/1 | 90% | - |
| **BackendServices** | 🟡 scaffolded | 6/6 | 65% | ✅ **Runtime config working!** |

## Detailed Component Status

### UserInterface (🟢 95% complete)
- 🟢 PlayerCard - Core interaction component
- 🟠 FeedbackSystem - Visual feedback working
- 🟠 ThemeManager - Theme switching working  
- 🟠 SessionSummary - Session metrics display
- 🟠 Dashboard - Analytics dashboard

### LearningEngine (🟠 85% complete) 
- 🟠 FactRepository - Mathematical facts storage
- 🟡 ContentManager - Missing import/export tools
- 🟠 DistinctionManager - 5 boundary levels working
- 🟠 DistractorGenerator - Appropriate distractors
- 🟠 QuestionGenerator - Question generation working

### ProgressionSystem (🟠 85% complete) ⭐ **Recently Enhanced**
- 🟠 TripleHelixManager - Live Aid model rotation
- 🟠 **SpacedRepetitionSystem** - ✅ **Fixed sequence [4,8,15,30,100,1000]**
- 🟠 **StitchManager** - ✅ **Positions-as-first-class-citizens**
- 🟠 ProgressTracker - Learning progress tracking

### MetricsSystem (🟠 90% complete)
- 🟠 MetricsCalculator - FTC/EC/Bonus calculations
- 🟠 SessionMetricsManager - Session tracking
- 🟠 LifetimeMetricsManager - Lifetime aggregation  
- 🟠 MetricsStorage - Data persistence

### SubscriptionSystem (🟡 65% complete)
- 🟡 SubscriptionManager - Basic tier management
- 🟠 ContentAccessController - Access control working
- 🟡 PaymentProcessor - Mock implementation only

### OfflineSupport (🟡 60% complete)
- 🟡 OfflineStorage - Basic IndexedDB implementation
- 🟡 SynchronizationManager - No conflict resolution
- 🟡 ContentCache - Basic caching only

### UserManagement (🟠 90% complete)
- 🟠 AnonymousUserManager - TTL and conversion working

### BackendServices (🟡 65% complete) ⭐ **Recently Added**
- 🟡 **SupabaseAuth** - Authentication with runtime config
- 🟡 **SupabaseRealTime** - Real-time subscriptions  
- 🟡 **SupabaseUserState** - User state persistence
- 🟡 **APIServiceClient** - API communication layer
- 🟡 **DatabaseServiceClient** - Database operations
- 🟡 **BackendServiceOrchestrator** - Service coordination

## Directory Structure

```
/zenjin-rebuild/
├── registry.apml               # SINGLE SOURCE OF TRUTH for all components and status
├── status.html                 # Visual project status dashboard  
├── README.md                   # This file - project overview with 6-phase status tracking
├── apml_framework_v1.3.2.md   # Current framework version
├── APML_EXPLAINER.md          # APML methodology explanation
├── DEPLOYMENT.md              # Deployment instructions
├── knowledge_transfer.md      # Project structure and implementation knowledge
│
├── docs/                      # Clean documentation structure
│   ├── README.md              # Documentation directory overview
│   ├── build/                 # Current APML specifications
│   │   ├── apml/modules/      # Module definitions (LearningEngine, ProgressionSystem, etc.)
│   │   ├── apml/interfaces/   # Interface specifications for all components
│   │   ├── apml/sessions/     # Development session specs for LLM implementation
│   │   └── implementation_packages/ # Detailed component implementation guides
│   │
│   └── archived/              # Historical documentation (date-organized)
│       ├── 2025-05-23/        # Latest cleanup - obsolete docs moved here
│       ├── components_pending_integration/ # Historical component staging
│       └── project-docs/      # Historical project management docs
│
├── src/                       # Source code with modular structure
│   ├── components/            # UI components (React/TypeScript)
│   │   ├── PlayerCard/        # Core learning interaction component
│   │   ├── FeedbackSystem/    # Visual feedback and animations
│   │   ├── ThemeManager/      # Dark/light theme management
│   │   ├── SessionSummary/    # Session results and metrics display
│   │   ├── Dashboard/         # Analytics and progress dashboard
│   │   ├── ProjectStatusDashboard/ # APML project status visualization
│   │   └── APMLBackendTester/ # APML-compliant backend validation
│   │
│   ├── engines/               # Business logic engines (TypeScript)
│   │   ├── EngineOrchestrator.ts    # Central coordination and session management
│   │   ├── DistinctionManager/      # 5-boundary distinction system
│   │   ├── DistractorGenerator/     # Appropriate distractor generation
│   │   ├── QuestionGenerator/       # Question generation for learning paths
│   │   ├── TripleHelixManager/      # Live Aid model tube rotation
│   │   ├── SpacedRepetitionSystem/  # Fixed sequence [4,8,15,30,100,1000]
│   │   ├── StitchManager/           # Positions-as-first-class-citizens
│   │   ├── MetricsCalculator/       # FTC/EC/Bonus metrics calculation
│   │   └── ...                      # Other engine components
│   │
│   ├── services/              # Backend service integrations (TypeScript)
│   │   ├── ConfigurationService.ts  # Runtime config loader for Vercel env vars
│   │   ├── SupabaseAuth.ts         # Authentication with lazy initialization
│   │   ├── SupabaseRealTime.ts     # Real-time subscriptions
│   │   ├── SupabaseUserState.ts    # User state persistence
│   │   └── BackendServiceOrchestrator.ts # Service coordination
│   │
│   └── interfaces/            # Shared TypeScript interfaces
│
└── tests/                     # Test configurations and fixtures
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

## Recent Achievements 🎉

### 2025-05-24: Backend Services Runtime Configuration
- ✅ **Implemented ConfigurationService** for runtime environment variable access
- ✅ **Created /api/config endpoint** to expose Vercel's auto-configured Supabase variables
- ✅ **Updated SupabaseAuth & SupabaseRealTime** with lazy initialization pattern
- ✅ **Enhanced APMLBackendTester** to validate both build-time and runtime configs
- ✅ **Solved Vercel-Supabase integration** environment variable mismatch issue
- ✅ **Maintained full APML compliance** with evidence-based validation

### 2025-05-23: Spaced Repetition System Completed
- ✅ **Fixed core algorithm conflicts** between APML spec and engine implementation
- ✅ **Implemented fixed sequence [4, 8, 15, 30, 100, 1000]** for optimal spacing  
- ✅ **Positions-as-first-class-citizens** architecture working perfectly
- ✅ **Perfect/Imperfect completion rules**: <20/20 stays active, =20/20 advances
- ✅ **Integration testing**: Engine logs show correct repositioning behavior
- ✅ **Visual testing UI**: Added Perfect/Imperfect buttons for manual testing

### Current Working Features
- 🟢 **Triple Helix rotation** - Seamless tube switching (addition → multiplication → subtraction)
- 🟢 **Spaced repetition** - Stitches advance through scientific sequence based on performance
- 🟢 **No more "No stitches available" errors** - Fixed stitch availability algorithm
- 🟢 **Live Aid model** - Continuous learning flow without session breaks
- 🟢 **Comprehensive logging** - Clear visibility into stitch IDs and repositioning

## Critical Gaps to Address

### High Priority
1. **ConnectivityManagerInterface** (OfflineSupport) - Not implemented
2. **Synchronization conflict resolution** - Essential for multi-device usage
3. **Mobile accessibility** - WCAG compliance needed

### Medium Priority  
4. **Payment processing integration** - Currently mock implementation
5. **Curriculum import/export tools** - Admin functionality incomplete
6. **Performance optimization** - Bundle size and caching improvements

### Low Priority
7. **Global ranking system** - Algorithm needs implementation
8. **Advanced metrics** - Evolution calculations refinement

## Next Steps

### Phase 1: Core Functionality (1-2 weeks)
1. **Implement ConnectivityManagerInterface** for offline detection
2. **Add conflict resolution** to SynchronizationManager
3. **Deploy to Vercel** for testing (see DEPLOYMENT.md)
4. **Run integration tests** on all modules

### Phase 2: Production Readiness (2-3 weeks)  
5. **Mobile accessibility audit** and WCAG compliance
6. **Performance optimization** - lazy loading, code splitting
7. **Payment integration** with Stripe/similar
8. **End-to-end testing** for critical user flows

### Phase 3: Enhancement (1-2 weeks)
9. **Global ranking implementation**
10. **Curriculum admin tools** completion
11. **Advanced analytics** and reporting
12. **Beta deployment** preparation

## Contact

For questions about this project, please contact the Zenjin team.