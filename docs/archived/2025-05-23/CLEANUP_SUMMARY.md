# Documentation Cleanup - May 23, 2025

## Overview
Comprehensive cleanup and reorganization of project documentation to eliminate obsolete files and create a cleaner, more maintainable documentation structure.

## Files Archived Today

### Root Level Documentation Moved to Archive
- `docs/APML_TO_TYPESCRIPT.md` - Obsolete tool documentation
- `docs/framework_relationships.md` - Historical framework analysis  
- `docs/README.md` - Outdated documentation overview
- `docs/naming_convention_audit.md` - Point-in-time audit from earlier development

### Directories Archived
- `docs/integration/` - Historical integration summaries
- `docs/testing/` - Point-in-time testing strategy documents

## Rationale for Archival

### APML_TO_TYPESCRIPT.md
- Tool-specific documentation for conversion utilities
- Not part of core project documentation
- Historical value only

### framework_relationships.md  
- Point-in-time analysis of framework relationships
- Superseded by current registry.apml and README.md

### integration/ and testing/ directories
- Contained historical summaries and strategies from May 20-22
- Not living documentation - represented snapshots in time
- Testing strategy should be part of ongoing development docs, not separate

### naming_convention_audit.md
- Point-in-time audit results
- Conventions are now established and documented in registry.apml

## New Documentation Structure

### Current Active Documentation
- `/README.md` - Main project overview with status tracking
- `/registry.apml` - Single source of truth for all components  
- `/docs/README.md` - Clean documentation directory overview
- `/docs/build/` - Current APML specifications and implementation packages

### Archive Organization
- `/docs/archived/2025-05-23/` - Today's cleanup
- `/docs/archived/components_pending_integration/` - Historical component staging  
- `/docs/archived/project-docs/` - Historical project management docs

## Benefits of Cleanup

1. **Reduced Confusion** - Eliminated outdated documentation that could mislead developers
2. **Cleaner Navigation** - Fewer files in active docs directory
3. **Clear Separation** - Living documentation vs. historical records
4. **Maintainability** - Easier to keep current docs up to date
5. **Single Source of Truth** - registry.apml and README.md are now clearly the authoritative sources

## Future Documentation Maintenance

1. **Keep active docs minimal** - Only current, living documentation in main docs/
2. **Regular archival** - Move point-in-time documents to dated archive folders
3. **Update registry.apml** - Primary source for component status and file locations
4. **Clear ownership** - Each document should have a clear purpose and maintenance owner

## Files Preserved

All APML specifications and implementation packages in `docs/build/` were preserved as they represent the current framework definitions and development instructions for components.