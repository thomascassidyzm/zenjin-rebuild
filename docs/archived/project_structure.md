# Zenjin Rebuild Project Structure

This document describes the updated project structure for the Zenjin Maths App rebuild using the APML Framework.

## Directory Structure Overview

```
/zenjin-rebuild/
├── framework/                      # Framework definition only
│   ├── current/                    # Current version of the framework
│   │   └── apml_framework_v1.2.2.md  # Framework definition
│   └── archive/                    # Previous versions of the framework
│
├── docs/                           # Documentation
│   ├── build/                      # Build artifacts
│   │   ├── apml/                   # AI Project Markup Language files
│   │   │   ├── interfaces/         # Interface definitions (APML)
│   │   │   ├── modules/            # Module definitions (APML)
│   │   │   └── sessions/           # Development sessions (APML)
│   │   │
│   │   └── implementation_packages/  # LLM implementation instructions (Markdown)
│   │
│   ├── project/                    # Project tracking
│   │   ├── registry/               # Single source of truth for WHAT needs to be built
│   │   │   └── registry.apml
│   │   ├── progress/               # Single source of truth for project STATUS
│   │   │   └── progress.apml
│   │   └── knowledge/              # Knowledge transfer documentation
│   │       └── knowledge_transfer.md
│   │
│   └── testing/                    # Testing documentation
│       └── testing_strategy.md
│
├── src/                            # Source code
│   ├── components/                 # UI components
│   │   └── ComponentName/          # Each component in its own directory
│   │       ├── ComponentName.tsx   # Main component file
│   │       ├── ComponentName.test.tsx  # Component tests
│   │       ├── ComponentNameExample.tsx  # Example usage
│   │       ├── componentName.css   # Component styles (if needed)
│   │       └── README.md           # Component documentation
│   ├── engines/                    # Core engine components
│   │   └── README-engines.md       # Documentation about engine components
│   └── utils/                      # Shared utilities
│       └── README-utils.md         # Documentation about utility functions
│
├── scripts/                        # Automation scripts
│   ├── generate_implementation_package.sh  # Converts DevelopmentSession to Implementation Package
│   └── generate_token_optimized.sh         # Generates token-optimized APML
│
├── tests/                          # Global test configurations and fixtures
│   └── README-tests.md             # Documentation about test strategy
│
└── archived_files/                 # Files archived during restructuring
    └── README-archive.md           # Documentation about archived files
```

## APML and Implementation Packages

The project uses two primary types of files for the AI-assisted development process:

### APML Files (AI Project Markup Language)

Located in `/docs/build/apml/`, these are structured XML files that serve as the machine-readable single source of truth for the project. They include:

1. **Interface Definitions** (`/docs/build/apml/interfaces/`):
   - Define the contract that components must implement
   - Specify data structures, method signatures, and error handling
   - Example: `FeedbackSystemInterface.apml`
   - Can be converted to token-optimized format using the script: `/scripts/generate_token_optimized.sh`

2. **Module Definitions** (`/docs/build/apml/modules/`):
   - Define the purpose and structure of each module
   - Specify the components within each module and their relationships
   - Example: `UserInterface.apml`

3. **Development Sessions** (`/docs/build/apml/sessions/`):
   - Record the development sessions for each component
   - Include implementation goals, context references, and validation criteria
   - Example: `FeedbackSystem.DevelopmentSession.apml`

### Implementation Packages

Located in `/docs/build/implementation_packages/`, these are Markdown files optimized for LLM consumption. They are generated from Development Sessions using the script: `/scripts/generate_implementation_package.sh`. They contain:

1. **Implementation Goal**: Concise description of what the component should accomplish
2. **Component Context**: Explanation of the component's role in the system
3. **Technical Requirements**: Detailed technical constraints and requirements
4. **Interface Definition**: Code representation of the interface
5. **Implementation Prompt**: Detailed instructions for the LLM
6. **Mock Inputs**: Example inputs for testing
7. **Expected Outputs**: Expected results for the mock inputs
8. **Validation Criteria**: Criteria for validating the implementation
9. **Token Optimization**: Instructions for generating token-optimized APML if needed

Example: `FeedbackSystem_Implementation_Package.md`

## Documentation Files

The project uses specific naming conventions for documentation files:

1. **Component Documentation**: 
   - Standard `README.md` files inside component directories
   - Documents a specific component's usage and implementation details

2. **Purpose-Specific Documentation**:
   - Format: `README-{purpose}.md`
   - Used for empty directories to explain their purpose
   - Examples: `README-engines.md`, `README-utils.md`, `README-tests.md`

3. **Archive Documentation**:
   - Format: `README-{purpose}-archive.md`
   - Documents archived files and why they were moved
   - Examples: `README-registry-archive.md`, `README-progress-archive.md`

## Workflow

The development workflow follows these steps:

1. **Define Interface**: Create or update an interface definition in APML
2. **Create Development Session**: Document the development session in APML
3. **Generate Implementation Package**: Use `/scripts/generate_implementation_package.sh ComponentName` to convert the Development Session to an Implementation Package
4. **LLM Implementation**: Submit the implementation package to Claude 3.7 Sonnet for implementation
5. **Integration**: Integrate the implementation into the project
6. **Validation**: Validate the implementation against the defined criteria
7. **Update Progress**: Update the project registry and progress tracking
8. **Optimization (Optional)**: Generate token-optimized APML using `/scripts/generate_token_optimized.sh` if needed

## Separation of Framework and Project Files

The `/framework/` directory contains only the Fractal Framework definition and documentation, while all project-specific files are stored in the `/docs/` directory. This separation ensures that:

1. The framework can be updated independently of the project
2. Multiple projects can use the same framework without modification
3. Project-specific artifacts are clearly separated from the framework definition

## File Relationships

- **Interface Definitions → Module Definitions**: Modules reference interfaces
- **Module Definitions → Development Sessions**: Development sessions reference modules
- **Development Sessions → Implementation Packages**: Implementation packages are generated from development sessions using automation scripts
- **Implementation Packages → Source Code**: Source code is generated from implementation packages
- **Standard APML → Token-Optimized APML**: Token-optimized APML is generated from standard APML using automation scripts