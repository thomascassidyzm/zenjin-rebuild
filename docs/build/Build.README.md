# Build Artifacts

This directory contains all build-related artifacts for the Zenjin Maths App rebuild project, following the APML Framework.

## Directory Structure

- `implementation_packages/`: Contains the implementation packages for all components
- `development_sessions/`: Contains records of development sessions
- `design_decisions/`: Contains documentation of key design decisions

## Purpose

Build artifacts provide guidance and documentation for the development process. They are used by developers and LLMs during development but are not required at runtime. They represent the "how" of the development process.

## Relationship to Execution Artifacts

Build artifacts are separate from execution artifacts, which are located in the `/src/` directory. This separation follows Axiom 6 of the APML Framework: Build-Execution Separation.

## Implementation Packages

Implementation packages are key build artifacts that provide all necessary information for an LLM to implement a component. All implementation packages follow a standardized structure to ensure consistency and completeness.

Example implementation packages:
- `PlayerCard_Implementation_Package.md`
- `FeedbackSystem_Implementation_Package.md`
- `ThemeManager_Implementation_Package.md`
- `SessionSummary_Implementation_Package.md`
- `Dashboard_Implementation_Package.md`