# APML to TypeScript Interface Converter

This document explains how to use the APML-to-TypeScript interface converter tool in the Zenjin Maths App project. This tool helps maintain consistency between APML interface definitions and TypeScript implementations.

## Overview

The APML Framework uses XML-based interface definitions (`.apml` files) to define the contract for components. While these provide a solid architectural foundation, there was previously a disconnect between these APML definitions and the TypeScript implementation.

The APML-to-TypeScript converter bridges this gap by:

1. Reading APML interface definitions from `.apml` files
2. Generating corresponding TypeScript interface files (`.ts`)
3. Creating a unified index file that exports all interfaces

This ensures that TypeScript implementations can correctly implement the interfaces defined in the APML Framework.

## Usage

### Prerequisites

The converter requires the following dependencies:
- Node.js (v14 or later)
- npm packages:
  - `xml2js` for XML parsing
  - `mkdirp` for directory creation

These dependencies are already included in the project's `package.json`.

### Running the Converter

You can run the converter using the following npm script:

```bash
npm run generate:interfaces
```

This will:
1. Scan the `/docs/build/apml/interfaces/` directory for APML interface files
2. Generate TypeScript interfaces in the `/src/interfaces/` directory
3. Create an `index.ts` file that exports all interfaces

### Generated Files

For each APML interface file (e.g., `ComponentNameInterface.apml`), the converter generates:

1. A TypeScript interface file (`ComponentNameInterface.ts`) with:
   - All data structures defined in the APML file
   - An enum for all error codes
   - The main interface with all methods
   - JSDoc comments for documentation

2. An `index.ts` file that exports all interfaces for easy importing

### Using Generated Interfaces in Components

After running the converter, you can import and implement the generated interfaces in your components:

```typescript
import { ComponentNameInterface } from '../interfaces';

// For React components
const MyComponent: React.FC<Props> = () => {
  // Implementation...
};

// For implementation classes
export class ComponentNameImpl implements ComponentNameInterface {
  // Implementation...
}
```

## Integration with Build Process

### When to Run the Converter

You should run the converter:

1. After updating or adding any APML interface definitions
2. During the initial setup of a new component
3. When synchronizing TypeScript implementations with APML definitions

### Automated Checks

To ensure TypeScript implementations match APML definitions, you can:

1. Add the converter to your CI/CD pipeline
2. Run TypeScript checks after generating interfaces: `npm run type-check`
3. Add a pre-commit hook to verify interface implementation

## Customization

### Modifying the Converter

The converter script is located at `/scripts/apml-to-ts-fixed.js`. You can modify it to:

- Change the output format or style
- Add additional TypeScript features
- Customize error handling
- Modify the parsing behavior

### Handling Special Cases

The converter includes special handling for:

- XML errors in APML files (automatically fixes common issues)
- Complex data structures
- Event handlers
- Async methods

## Troubleshooting

### Common Issues

1. **XML Parsing Errors**: Check your APML files for proper XML formatting
2. **Missing Types**: Ensure all types in APML files have corresponding TypeScript types
3. **Directory Issues**: Make sure the output directory exists and is writable

### Debugging

To debug converter issues:

1. Run with Node.js debugger: `node --inspect scripts/apml-to-ts-fixed.js`
2. Check the console output for errors
3. Examine the generated TypeScript files

## Best Practices

1. **Keep APML and TypeScript in Sync**: Always update both when making changes
2. **Validate Generated Interfaces**: Review generated interfaces for correctness
3. **Regular Generation**: Run the converter regularly to maintain consistency
4. **Type Checking**: Use TypeScript's type checking to verify implementations

## Related Documentation

- [APML Framework Guide](./apml_framework_v1.3.0.md)
- [TypeScript Guide](./TYPESCRIPT_GUIDE.md)
- [Framework Relationships](./framework_relationships.md)