# Documentation Directory

This directory contains the current documentation and APML specifications for the Zenjin Maths App rebuild project.

## Current Structure

### `/build/` - APML Framework Artifacts
Contains the current APML specifications and development sessions:

- **`apml/modules/`** - Core module definitions (LearningEngine, ProgressionSystem, etc.)
- **`apml/interfaces/`** - Interface specifications for all components  
- **`apml/sessions/`** - Development session specifications for LLM implementation
- **`implementation_packages/`** - Detailed implementation packages for each component

### `/archived/` - Historical Documentation
Contains archived documentation that is no longer current but kept for reference:

- **`2025-05-23/`** - Documentation cleanup (obsolete docs moved here)
- **`components_pending_integration/`** - Old component staging area
- **`project-docs/`** - Historical project documentation

## Key Files

The primary documentation now lives at the project root:

- **`/README.md`** - Main project overview with current status
- **`/registry.apml`** - Single source of truth for all components and implementation status
- **`/status.html`** - Visual project status dashboard
- **`/knowledge_transfer.md`** - Project structure and implementation knowledge

## Documentation Philosophy

Following APML Framework v1.3.1:
1. **Single source of truth** for project status (registry.apml)
2. **Living documentation** that stays current with implementation
3. **Clear separation** between current specs (build/) and historical records (archived/)
4. **Implementation-focused** documentation that helps developers

## Next Documentation Tasks

1. Update any outdated implementation packages in `build/implementation_packages/`
2. Create integration testing documentation
3. Add deployment and production readiness checklists
4. Document the critical gaps and remediation plans