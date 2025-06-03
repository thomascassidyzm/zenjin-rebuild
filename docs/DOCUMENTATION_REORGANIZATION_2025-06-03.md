# Documentation Reorganization - June 3, 2025

## What Was Done

### 1. Created New Directory Structure
```
/docs/
  /critical/           # Essential architectural docs
  /features/          # Feature-specific docs
  /implementation/    # Build packages and guides
    /packages/
    /guides/
  /components/        # Component-specific READMEs
  /engines/           # Engine-specific READMEs
  /handoffs/          # Integration handoff docs
```

### 2. Moved Critical Documentation
- `ARCHITECTURE.md` → `docs/critical/`
- `DATA_FLOWS.md` → `docs/critical/`
- `docs/SERVICE_ARCHITECTURE_V2.md` → `docs/critical/SERVICE_ARCHITECTURE.md`
- Created placeholder `docs/critical/USER_JOURNEYS.md`
- Created placeholder `docs/critical/APML_FRAMEWORK.md`

### 3. Moved Feature Documentation
- `docs/PREMIUM_TIER_IMPLEMENTATION.md` → `docs/features/PREMIUM_TIER.md`
- `docs/CONTENT_GATING_IMPLEMENTATION.md` → `docs/features/CONTENT_GATING.md`
- `BONUS_SYSTEM_INTERNALS.md` → `docs/features/BONUS_SYSTEM.md`
- Created placeholder `docs/features/PAYMENT_INTEGRATION.md`

### 4. Moved Implementation Documentation
- `docs/ADMIN_USER_CREATION_GUIDE.md` → `docs/implementation/guides/`
- `docs/CONTINUING_CHAT_PROTOCOL.md` → `docs/implementation/guides/`
- `docs/user_lifecycle_flow_diagram.md` → `docs/implementation/guides/`
- `DATA_FLOW_DIAGRAMS.md` → `docs/implementation/guides/`
- `DATA_STRUCTURES_REFERENCE.md` → `docs/implementation/guides/`
- `docs/build/*` → `docs/implementation/packages/`
- `README_old.md` → `docs/implementation/guides/README_old_backup.md`

### 5. Copied Component & Engine Documentation
- All component READMEs from `src/components/*/` → `docs/components/`
- All engine READMEs from `src/engines/*/` → `docs/engines/`
- `src/engines/README-engines.md` → `docs/engines/README.md`
- `src/utils/README-utils.md` → `docs/implementation/guides/utils.md`

### 6. Moved Handoff Documentation
- `HANDOFF_PREMIUM_TIER_2025-06-02.md` → `docs/handoffs/`

### 7. Updated Root Documentation
- Updated main `README.md` to include critical docs section at the top
- Created comprehensive `docs/README.md` as documentation index

## Files That Still Need Updates
1. `naming.apml` - May need path updates for documentation references
2. `registry.apml` - May need path updates for documentation references

## Benefits of New Structure
1. **Clear hierarchy** - Critical docs are easy to find
2. **Logical grouping** - Related documentation is together
3. **Scalable** - Easy to add new docs in appropriate locations
4. **Discoverable** - Index makes all docs accessible
5. **Clean root** - Less clutter in project root directory

## Next Steps
1. Review `naming.apml` and `registry.apml` for documentation path references
2. Fill in placeholder documents (USER_JOURNEYS.md, APML_FRAMEWORK.md, PAYMENT_INTEGRATION.md)
3. Update any broken links in existing documentation
4. Consider moving more scattered docs into the new structure