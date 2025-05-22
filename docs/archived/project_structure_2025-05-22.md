# Zenjin Maths App Rebuild - Project Structure

**Last Updated:** May 22, 2025

## Overview

This document outlines the standardized project structure for the Zenjin Maths App Rebuild project. It serves as a guide for maintaining consistency across the codebase and documentation.

## Directory Structure

```
/project-root/
├── framework/                      # Framework definition
│   ├── current/                    # Current version of the framework
│   │   └── apml_framework_v1.2.3.md # Current framework definition
│   └── archive/                    # Previous versions
│
├── registry.apml                   # SINGLE SOURCE OF TRUTH for what needs to be built
│
├── docs/                           # Documentation
│   ├── build/                      # Build artifacts
│   │   ├── apml/                   # APML files
│   │   │   ├── interfaces/         # Interface definitions
│   │   │   ├── modules/            # Module definitions
│   │   │   └── sessions/           # Development sessions
│   │   │
│   │   └── implementation_packages/ # LLM implementation instructions
│   │
│   ├── project/                    # Project tracking
│   │   ├── registry/               # Registry archives (not source of truth)
│   │   │   ├── Registry.README.md
│   │   │   └── archive/            # Historical registry versions
│   │   │
│   │   ├── progress/               # Project progress tracking
│   │   │   ├── Progress.README.md
│   │   │   ├── progress.apml       # Source of truth for progress
│   │   │   └── project_status.html # HTML view of progress
│   │   │
│   │   └── archived/               # Historical snapshots by date
│   │       └── YYYY-MM-DD/
│   │
│   └── testing/                    # Testing documentation
│
├── src/                            # Application code
│   ├── components/                 # UI components
│   │   └── ComponentName/          # Each UI component in its own directory
│   │       ├── ComponentName.tsx
│   │       ├── ComponentName.test.tsx
│   │       ├── ComponentNameExample.tsx
│   │       ├── componentName.css   # Optional styles
│   │       └── ComponentName.README.md
│   │
│   ├── engines/                    # Business logic components
│   │   └── EngineName/             # Each engine in its own directory
│   │       ├── EngineName.ts
│   │       ├── EngineNameTypes.ts
│   │       ├── EngineName.test.ts
│   │       ├── EngineNameExample.ts
│   │       ├── index.ts
│   │       └── EngineName.README.md
│   │
│   └── utils/                      # Utility functions
│
└── tests/                          # Global test configurations
```

## File Naming Conventions

### README Files

- **Project Root**: Only the root directory should contain a plain `README.md` file.
- **Component Documentation**: Each component directory should have a `ComponentName.README.md` file.
- **Directory Documentation**: Empty or purpose-specific directories should have a `DirectoryName.README.md` file.

### Source Code Files

- **Components**: 
  - `ComponentName.tsx` - Main component file
  - `ComponentName.test.tsx` - Component tests
  - `ComponentNameExample.tsx` - Usage examples
  - `componentName.css` - Component styles (if needed)

- **Engines**: 
  - `EngineName.ts` - Main implementation
  - `EngineNameTypes.ts` - Type definitions
  - `EngineName.test.ts` - Engine tests
  - `EngineNameExample.ts` - Usage examples
  - `index.ts` - Exports and factory functions

### Documentation Files

- **Implementation Packages**: `ComponentName_Implementation_Package.md`
- **Interface Definitions**: `ComponentNameInterface.apml`
- **Development Sessions**: `ComponentName.DevelopmentSession.apml`

## Single Source of Truth

- **Project Registry**: `/registry.apml` is the single source of truth for what needs to be built
- **Project Progress**: `/docs/project/progress/progress.apml` is the single source of truth for project status

## Archive Strategy

- **Registry Archives**: Stored in `/docs/project/registry/archive/registry.apml.YYYY-MM-DD`
- **Progress Archives**: Stored in `/docs/project/archived/YYYY-MM-DD/progress.apml`

## Framework Version

This project follows APML Framework v1.2.3, which:
- Mandates the ComponentName.README.md naming convention
- Specifies registry.apml at the project root as the single source of truth
- Defines clear separation between build and execution artifacts

## Conclusion

Following this standardized project structure ensures consistency, clarity, and maintainability across the codebase. It helps prevent redundancies, clarifies the sources of truth, and facilitates efficient knowledge transfer.