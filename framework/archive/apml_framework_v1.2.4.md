# APML Framework v1.2.4

## Overview

The APML (AI Project Markup Language) Framework is a structured approach for AI-assisted software development that leverages large language models (LLMs) to implement well-defined software components. This framework provides a systematic process for specifying, implementing, validating, and integrating components into a cohesive system.

Version 1.2.4 builds on previous versions with added support for version control integration, simplified testing approaches for non-coders, and improved component relationship visualization.

## Core Axioms

The framework is built on five core axioms:

1. **Clear Boundaries**: LLMs work best with explicit boundaries that clarify what they need to understand and implement.
2. **Consistent Structure**: Consistent documents, directories, and interfaces improve LLM comprehension and implementation.
3. **Component Isolation**: Components should be isolated with well-defined interfaces for independent implementation and testing.
4. **Persistent Context**: Projects should maintain a persistent context that outlives individual development sessions.
5. **Distinction-Based Validation**: Components must be validated through explicit test-linked criteria.

## Core Principles for Non-Coders

The framework emphasizes three core principles for non-coders:

1. **Better × Simpler × Cheaper**: All decisions should optimize for this combination, making development more accessible.
2. **Approachable Testing**: Testing should be simple enough for non-coders to verify component functionality.
3. **Minimal Tooling**: Rely on simple, widely available tools rather than complex development environments.

## Framework Phases

The framework defines a five-phase development process:

### Phase 1: Project Setup

Establish project goals, scope, and structure.

1. Define project purpose and key modules
2. Identify core components and their relationships
3. Set up project directories and documentation structure
4. Create project registry
5. Initialize version control (if desired)

### Phase 2: Interface Definition

Define the interfaces for all components.

1. Specify public APIs and data structures
2. Define input/output contracts
3. Document error handling
4. Identify component dependencies
5. Create visual relationship mappings

### Phase 3: Component Implementation

Implement individual components based on interface definitions.

1. Create implementation packages for each component
2. Submit packages to LLMs for implementation
3. Validate implementations against interface contracts
4. Document implementation details
5. Create simple test files for component verification

### Phase 4: Integration and Validation

Integrate components and validate system behavior.

1. Integrate components according to module structure
2. Test component interactions
3. Validate system behavior against requirements
4. Identify and resolve integration issues
5. Document integration patterns and relationships

### Phase 5: Reflection and Refinement

Reflect on the implementation and refine as needed.

1. Evaluate system against project goals
2. Identify areas for improvement
3. Refine implementation based on evaluation
4. Document lessons learned
5. Consider deployment options

## File Structure and Naming Conventions

### Directory Structure

```
/project-root/
├── registry.apml               # SINGLE SOURCE OF TRUTH for what needs to be built
├── status.html                 # Current project status visualization
├── README.md                   # Project overview
├── framework_relationships.md  # Visual mapping of component relationships
│
├── framework/                  # Framework definition
│   └── current/                # Current framework version
│       └── apml_framework_v1.2.4.md
│
├── docs/                       # Documentation and build artifacts
│   ├── build/                  # Build artifacts
│   │   ├── apml/               # APML definition files
│   │   └── implementation_packages/ # LLM implementation instructions
│   │
│   ├── integration/            # Integration documentation
│   └── testing/                # Testing documentation
│
├── src/                        # Source code
│   ├── components/             # UI components
│   └── engines/                # Business logic components
│
└── tests/                      # Global test configurations and fixtures
    └── visual/                 # Simple HTML-based component tests
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
- **Visual Test Files**: Simple HTML tests should be named `ComponentName-test.html`.

## Project Registry

The project registry (registry.apml) is the single source of truth for what needs to be built. It is stored at the project root and contains:

1. Project purpose and scope
2. Module definitions
3. Component specifications
4. Implementation status
5. Validation criteria
6. Module interactions

## Version Control Integration

The APML Framework supports optional version control integration to track changes and facilitate collaboration:

### Simple GitHub Integration

1. **Repository Setup**:
   - Use GitHub Desktop for a user-friendly interface
   - Initialize repository in the project root
   - Add a basic `.gitignore` file for common exclusions

2. **Basic Workflow**:
   - Make changes to project files
   - Commit changes with clear descriptions
   - Push to GitHub when ready to share or backup

3. **Branch Strategy** (Optional):
   - `main` branch for stable, working code
   - Feature branches for new components or major changes

### Benefits for Non-Coders

- **History**: Tracks all changes to project files
- **Safety**: Provides backups and ability to revert changes
- **Collaboration**: Makes sharing and reviewing code easier
- **Transparency**: Documents who made which changes and why

## Component Testing for Non-Coders

The APML Framework emphasizes simple testing approaches accessible to non-coders:

### HTML-Based Component Testing

1. **Create Simple HTML Test Files**:
   - One HTML file per component in `/tests/visual/`
   - Include necessary CSS and JavaScript files
   - Minimal setup to instantiate and test the component

2. **Test Structure**:
   - Basic HTML page that loads the component
   - Simple controls to test different component states
   - Visual verification of component behavior

3. **Usage**:
   - Open the HTML file directly in a browser
   - No build tools or servers required
   - Refresh to see changes after modifying component code

### Example Test File Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ComponentName Test</title>
    <link rel="stylesheet" href="../../src/components/ComponentName/componentName.css">
    <style>
        /* Test page styling */
        body { font-family: Arial, sans-serif; padding: 20px; }
        .container { max-width: 800px; margin: 0 auto; }
    </style>
</head>
<body>
    <div class="container">
        <h1>ComponentName Test</h1>
        <div id="component-container"></div>
        <div class="controls">
            <!-- Test controls -->
        </div>
    </div>

    <script src="../../src/components/ComponentName/ComponentName.js"></script>
    <script>
        // Test initialization and control logic
    </script>
</body>
</html>
```

## Component Relationship Visualization

The APML Framework now includes a visual mapping document to clarify component relationships:

### Framework Relationships Document

The `framework_relationships.md` file provides a visual representation of:

1. **Module Structure**: High-level module organization
2. **Interface-Component Relationships**: Which components implement which interfaces
3. **Component Dependencies**: How components depend on each other
4. **Cross-Module Interactions**: How modules interact with each other

### Visualization Format

The document uses simple markdown-based visualization with:

- ASCII box diagrams for module structure
- Indented lists for interface-component relationships
- Connection diagrams for cross-module interactions

## Change Log

### v1.2.4 (Current)
- Added version control integration guidelines
- Added simple HTML-based component testing approach
- Added component relationship visualization document
- Expanded framework principles for non-coders
- Updated directory structure to include visual tests

### v1.2.3
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