# Project Structure Optimization Plan

This document outlines the plan for optimizing the project structure to remove redundancies and improve organization.

## Issues to Address

1. **Duplicate Registry Files**
   - `/docs/project/registry.apml`
   - `/docs/project/registry/registry.apml`
   - `/framework/phase1/ProjectRegistry.apml`

2. **Duplicate Progress Files**
   - `/docs/project/progress.apml`
   - `/docs/project/progress/progress.apml`

3. **Files to Consolidate**
   - `/docs/knowledge_transfer.md` - Should be moved to more appropriate location
   - `/docs/todo.md` - Should be consolidated with the formal tracking system

4. **Empty Directories to Clean Up**
   - `/tests/` - Empty directory
   - `/src/engines/` - Empty directory
   - `/src/utils/` - Empty directory
   - `/docs/project/archived/` - Low-value directory with duplicates

## Action Plan

1. **Registry Files**
   - Keep the newest, most detailed version in `/docs/project/registry/registry.apml`
   - Move older versions to `/archived_files/registry/`

2. **Progress Files**
   - Keep the newest, most detailed version in `/docs/project/progress/progress.apml`
   - Move older versions to `/archived_files/progress/`

3. **Other Files**
   - Move `knowledge_transfer.md` to `/docs/project/knowledge_transfer.md`
   - Move `todo.md` to `/archived_files/`

4. **Empty Directories**
   - Keep empty placeholder directories with README files explaining their purpose
   - Clean up unnecessary archived directories

## Expected Outcome

After optimization, the project structure will be cleaner, with no redundant files, clear single sources of truth for each artifact, and well-documented placeholders for future expansion.