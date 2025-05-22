# Project Tracking

This directory contains all project tracking artifacts for the Zenjin Maths App rebuild project, following the APML Framework.

## Directory Structure

- `registry/`: Contains the project registry (what needs to be built)
- `progress/`: Contains the project progress (current status)
- `archived/`: Contains historical snapshots of project tracking

## Single Source of Truth

The project tracking directory provides a single source of truth for:

1. **What needs to be built**: The registry.apml file defines all components, interfaces, and modules that need to be implemented.
2. **Current project status**: The progress.apml file tracks the current implementation status of all components.

## Historical Tracking

The archived directory contains historical snapshots of project tracking, organized by date. This allows for tracking progress over time and provides a historical record of project development.

## Repository Updates

The registry and progress files should be updated after each component implementation to reflect the current state of the project. When significant milestones are reached, snapshots should be created in the archived directory.