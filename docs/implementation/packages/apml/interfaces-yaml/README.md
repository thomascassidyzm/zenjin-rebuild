# APML Interface Definitions

This directory contains the **single source of truth** for all interface definitions in YAML APML format (APML v2.2).

## Important Notes

1. **DO NOT EDIT** the TypeScript files in `/src/interfaces/` directly - they are generated from these YAML files
2. **YAML APML is the standard** - XML APML files have been deprecated and removed
3. All interface changes should be made to the `.apml` files in this directory

## Workflow

1. Edit the YAML APML files in this directory
2. Run the generator to create TypeScript interfaces:
   ```bash
   node scripts/yaml-apml-to-ts.js
   ```
3. The TypeScript interfaces will be generated in `/src/interfaces/`

## File Structure

- Each `.apml` file defines one interface
- The generator will create a corresponding `.ts` file with the same name
- An `index.ts` file is automatically maintained with all exports

## APML v2.2 Format

The YAML APML format uses structured YAML to define:
- Interface metadata
- Types and their properties
- Error definitions
- Interface methods with parameters and returns
- Dependencies on other interfaces