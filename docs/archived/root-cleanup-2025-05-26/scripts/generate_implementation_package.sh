#!/bin/bash
# Script to generate an implementation package from APML files
# Usage: ./generate_implementation_package.sh ComponentName

# Check if component name was provided
if [ -z "$1" ]; then
    echo "Error: No component name provided"
    echo "Usage: ./generate_implementation_package.sh ComponentName"
    exit 1
fi

COMPONENT_NAME=$1
PROJECT_ROOT="/Users/tomcassidy/claude-code-experiments/APML-Projects/zenjin-rebuild"
INTERFACE_PATH="$PROJECT_ROOT/docs/build/apml/interfaces/${COMPONENT_NAME}Interface.apml"
DEVELOPMENT_SESSION_PATH="$PROJECT_ROOT/docs/build/apml/sessions/${COMPONENT_NAME}.DevelopmentSession.apml"
OUTPUT_PATH="$PROJECT_ROOT/docs/build/implementation_packages/${COMPONENT_NAME}_Implementation_Package.md"

# Check if necessary files exist
if [ ! -f "$INTERFACE_PATH" ]; then
    echo "Error: Interface file not found at $INTERFACE_PATH"
    exit 1
fi

if [ ! -f "$DEVELOPMENT_SESSION_PATH" ]; then
    echo "Error: Development session file not found at $DEVELOPMENT_SESSION_PATH"
    exit 1
fi

# Extract module name from the interface file
MODULE_NAME=$(grep -o 'module="[^"]*"' "$INTERFACE_PATH" | head -1 | cut -d'"' -f2)
MODULE_PATH="$PROJECT_ROOT/docs/build/apml/modules/${MODULE_NAME}.apml"

# Check if module file exists
if [ ! -f "$MODULE_PATH" ]; then
    echo "Error: Module file not found at $MODULE_PATH"
    exit 1
fi

echo "Generating implementation package for $COMPONENT_NAME..."
echo "Component: $COMPONENT_NAME"
echo "Module: $MODULE_NAME"
echo "Interface file: $INTERFACE_PATH"
echo "Development session file: $DEVELOPMENT_SESSION_PATH"
echo "Module file: $MODULE_PATH"
echo "Output file: $OUTPUT_PATH"

# Extract data from the files using grep and awk
IMPLEMENTATION_GOAL=$(grep -A 5 '<ImplementationGoal>' "$DEVELOPMENT_SESSION_PATH" | grep -v '<ImplementationGoal>' | grep -v '</ImplementationGoal>' | sed 's/^[[:space:]]*//' | head -1)
IMPLEMENTATION_PROMPT=$(grep -A 50 '<ImplementationPrompt>' "$DEVELOPMENT_SESSION_PATH" | grep -v '<ImplementationPrompt>' | grep -v '</ImplementationPrompt>' | sed 's/^[[:space:]]*//' | grep -v '^$')
VALIDATION_CRITERIA=$(grep -A 10 '<ValidationCriteria>' "$DEVELOPMENT_SESSION_PATH" | grep -v '<ValidationCriteria>' | grep -v '</ValidationCriteria>' | grep '<Criterion' | sed 's/^[[:space:]]*//')

# Generate the implementation package file
cat > "$OUTPUT_PATH" << EOF
# ${COMPONENT_NAME} Implementation Package for Claude 3.7 Sonnet

## Implementation Goal
${IMPLEMENTATION_GOAL}

## Component Context
The ${COMPONENT_NAME} is a component of the ${MODULE_NAME} module. It is responsible for...
[This section should be filled in manually with more context about the component's role in the system]

## Technical Requirements
[This section should be filled in manually with technical requirements]

## Interface Definition
\`\`\`xml
$(cat "$INTERFACE_PATH")
\`\`\`

## Module Definition (Relevant Sections)
\`\`\`xml
$(grep -A 20 "<Component name=\"${COMPONENT_NAME}\"" "$MODULE_PATH")
\`\`\`

## Implementation Prompt
${IMPLEMENTATION_PROMPT}

## Mock Inputs for Testing
[This section should be filled in manually with example inputs for testing]

## Expected Outputs
[This section should be filled in manually with expected outputs]

## Validation Criteria
${VALIDATION_CRITERIA}

## Domain-Specific Context
[This section should be filled in manually with additional context about how this component fits into the domain model]

## Token Optimization
If this component requires token-optimized APML for performance reasons, use the following command after implementation:

```bash
./scripts/generate_token_optimized.sh /docs/build/apml/interfaces/${COMPONENT_NAME}Interface.apml /docs/build/apml/interfaces/${COMPONENT_NAME}Interface.tokenopt.apml
```

Token-optimized APML uses a more compact representation while preserving the semantics of the interface.
EOF

echo "Implementation package generated at $OUTPUT_PATH"
echo "Please review and fill in the sections marked for manual completion."