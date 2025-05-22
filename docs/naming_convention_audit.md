# APML Framework Naming Convention Audit

**Date:** May 22, 2025  
**Framework Version:** v1.2.6

This document provides a comprehensive audit of naming convention adherence across the Zenjin-Rebuild project based on the APML Framework v1.2.6 naming guidelines.

## Summary of Findings

| Category | Adherence Level | Key Issues |
|----------|-----------------|------------|
| UI Components | ⚠️ 80% | README naming, missing tests, inconsistent file extensions |
| Engine Components | ⚠️ 85% | Type definition naming, example file inconsistencies |
| APML Files | ✅ 100% | Component-interface name discrepancies |
| CSS Files | ✅ 90% | Some class naming inconsistencies |
| Visual Test Files | ✅ 100% | No issues found |

## 1. UI Components

### Strengths
- All component implementations use correct `PascalCase.tsx` format
- All components have proper `index.ts` files
- Most components have appropriate examples and tests

### Discrepancies
- README files use `Component.README.md` format instead of the required `PascalCase.README.md` format
- Missing test files for `ThemeManager` and `Dashboard`
- Missing example file for `ThemeManager`
- `PlayerCardDemo.jsx` uses `.jsx` extension instead of `.tsx`
- Missing CSS files for `ThemeManager` and `Dashboard`

### Recommendations
1. Rename all README files to follow the `PascalCase.README.md` format
2. Create missing test files for `ThemeManager` and `Dashboard`
3. Create an example file for `ThemeManager`
4. Convert `PlayerCardDemo.jsx` to `.tsx` extension for consistency

## 2. Engine Components

### Strengths
- All main implementations use correct `PascalCase.ts` format
- All engine directories include an `index.ts` file
- All README files follow correct `PascalCase.README.md` format

### Discrepancies
- Inconsistent type definition files: some use `*Types.ts`, others use `*Interfaces.ts`
- Inconsistent example/usage files: some use `*Example.ts`, others use `*Usage.ts`
- Missing test files for several engines (e.g., `AnonymousUserManager`, `ContentCache`, `ProgressTracker`)
- Some example file names don't match their parent component names (e.g., `SpacedRepetitionExample.ts` vs `SpacedRepetitionSystem.ts`)

### Recommendations
1. Standardize type definition files to use `ComponentNameTypes.ts` consistently
2. Standardize example files to use `ComponentNameExample.ts` format
3. Add missing test files for engines lacking them
4. Ensure example file names match their parent component names

## 3. APML Files

### Strengths
- All interface definitions correctly follow `ComponentNameInterface.apml` pattern (100% compliance)
- All development session files correctly follow `ComponentName.DevelopmentSession.apml` pattern (100% compliance)
- Files are correctly organized in appropriate directories

### Discrepancies
- Several components have naming inconsistencies between their interface and implementation files:
  1. `ProgressTracking` (interface) vs `ProgressTracker` (implementation)
  2. `LifetimeMetrics` (interface) vs `LifetimeMetricsManager` (implementation)
  3. `SessionMetrics` (interface) vs `SessionMetricsManager` (implementation)
  4. `SpacedRepetition` (interface) vs `SpacedRepetitionSystem` (implementation)
- Some components have either an interface or implementation file, but not both:
  - Missing development sessions: `Dashboard`, `StitchManager`
  - Missing interfaces: `ContentCache`

### Recommendations
1. Standardize component naming between interfaces and implementations
2. Create missing implementation files for `Dashboard` and `StitchManager`
3. Create a missing interface for `ContentCache`
4. Document whether appending "Manager" or "System" to implementation names is acceptable practice

## 4. CSS Files

### Strengths
- All CSS filenames follow the `camelCase.css` convention consistently
- Most CSS class names follow kebab-case convention
- Good integration between components and their CSS files

### Discrepancies
- Some inconsistencies in `playerCardAnimations.css` class naming
- Inconsistent approach to styling across components (direct CSS, Tailwind, CSS variables)

### Recommendations
1. Create a CSS style guide that explicitly defines kebab-case as the standard for CSS class names
2. Update `playerCardAnimations.css` to be fully consistent with kebab-case
3. Document the relationship between components and their CSS files
4. Consider adopting a more structured naming convention like BEM for complex components

## 5. Visual Test Files

### Strengths
- All visual test files follow the `ComponentName-test.html` convention (100% compliance)

### Discrepancies
- No issues found

### Recommendations
- Continue using this pattern for new visual test files
- Consider creating visual tests for other key components

## Overall Recommendations

1. **Create a naming convention cheat sheet** for quick reference by developers
2. **Update existing files** to conform to naming conventions
3. **Add missing files** (tests, examples, interfaces) to ensure complete component sets
4. **Document exceptions** where naming conventions are intentionally not followed
5. **Implement CI/CD checks** to enforce naming conventions on new code
6. **Standardize component naming** between interfaces and implementations

## Priority Actions

1. **High Priority**
   - Standardize interface and implementation naming
   - Create missing test files for key components

2. **Medium Priority**
   - Rename README files to follow correct format
   - Standardize example and type definition file naming

3. **Low Priority**
   - Update CSS class naming for consistency
   - Convert file extensions for consistency

This audit serves as a baseline for improving naming convention adherence across the project. Following these recommendations will enhance code consistency, readability, and maintainability.

---

*This audit was conducted in accordance with the APML Framework v1.2.6 naming conventions guidelines.*