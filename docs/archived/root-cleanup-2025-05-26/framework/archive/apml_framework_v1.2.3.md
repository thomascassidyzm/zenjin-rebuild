# APML Framework v1.2.3

## Overview

The APML (AI Project Markup Language) Framework is a structured approach for AI-assisted software development that leverages large language models (LLMs) to implement well-defined software components. This framework provides a systematic process for specifying, implementing, validating, and integrating components into a cohesive system.

Version 1.2.3 builds on previous versions with standardized file naming conventions, improved project structure, and clarified responsibilities for project tracking.

## Core Axioms

The framework is built on five core axioms:

1. **Clear Boundaries**: LLMs work best with explicit boundaries that clarify what they need to understand and implement.
2. **Consistent Structure**: Consistent documents, directories, and interfaces improve LLM comprehension and implementation.
3. **Component Isolation**: Components should be isolated with well-defined interfaces for independent implementation and testing.
4. **Persistent Context**: Projects should maintain a persistent context that outlives individual development sessions.
5. **Distinction-Based Validation**: Components must be validated through explicit test-linked criteria.

## Framework Phases

The framework defines a five-phase development process:

### Phase 1: Project Setup

Establish project goals, scope, and structure.

1. Define project purpose and key modules
2. Identify core components and their relationships
3. Set up project directories and documentation structure
4. Create project registry

### Phase 2: Interface Definition

Define the interfaces for all components.

1. Specify public APIs and data structures
2. Define input/output contracts
3. Document error handling
4. Identify component dependencies

### Phase 3: Component Implementation

Implement individual components based on interface definitions.

1. Create implementation packages for each component
2. Submit packages to LLMs for implementation
3. Validate implementations against interface contracts
4. Document implementation details

### Phase 4: Integration and Validation

Integrate components and validate system behavior.

1. Integrate components according to module structure
2. Test component interactions
3. Validate system behavior against requirements
4. Identify and resolve integration issues

### Phase 5: Reflection and Refinement

Reflect on the implementation and refine as needed.

1. Evaluate system against project goals
2. Identify areas for improvement
3. Refine implementation based on evaluation
4. Document lessons learned

## File Structure and Naming Conventions

### Directory Structure

```
/project-root/
├── registry.apml               # SINGLE SOURCE OF TRUTH for what needs to be built
├── status.html                 # Current project status visualization
├── README.md                   # Project overview
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
│   ├── project/                # Project tracking and archives
│   └── testing/                # Testing documentation
│
├── src/                        # Source code
│   ├── components/             # UI components
│   └── engines/                # Business logic components
│
└── tests/                      # Global test configurations and fixtures
```

### Component Organization

Components should be organized into their own directories with standardized file structure:

#### UI Components (`/src/components/ComponentName/`)
- `ComponentName.tsx` - Main component implementation
- `ComponentName.test.tsx` - Component tests
- `ComponentNameExample.tsx` - Usage examples
- `componentName.css` - Component styles (if needed)
- `ComponentName.README.md` - Component documentation
- `index.ts` - Exports for the component

#### Engine Components (`/src/engines/ComponentName/`)
- `ComponentName.ts` - Main implementation
- `ComponentNameTypes.ts` - Type definitions
- `ComponentName.test.ts` - Component tests
- `ComponentNameExample.ts` - Usage examples
- `ComponentName.README.md` - Component documentation
- `index.ts` - Exports for the component

### File Naming Conventions

- **README Files**: Each component directory should have a `ComponentName.README.md` file.
- **Interface Files**: Interface definitions should be named `ComponentNameInterface.apml`.
- **Development Session Files**: Development sessions should be named `ComponentName.DevelopmentSession.apml`.
- **Implementation Package Files**: Implementation packages should be named `ComponentName_Implementation_Package.md`.

## Project Registry

The project registry (registry.apml) is the single source of truth for what needs to be built. It is stored at the project root and contains:

1. Project purpose and scope
2. Module definitions
3. Component specifications
4. Implementation status
5. Validation criteria
6. Module interactions

## Change Log

### v1.2.3 (Current)
- Updated README file naming convention to `ComponentName.README.md`
- Moved registry.apml to project root as the single source of truth
- Added status.html for project status visualization
- Standardized component exports with index.ts files
- Clarified project structure and documentation organization

### v1.2.2
- Added explicit framework phases
- Expanded validation requirements
- Improved implementation package format
- Added module interaction documentation

### v1.2.1
- Added token optimization guidelines
- Improved documentation structure
- Enhanced component validation criteria

### v1.2.0
- Added support for APML (AI Project Markup Language)
- Introduced project registry concept
- Added component validation framework

### v1.1.0
- Added persistent context management
- Improved component isolation
- Enhanced interface definition guidelines

### v1.0.0
- Initial framework definition
- Core axioms established
- Basic project structure defined