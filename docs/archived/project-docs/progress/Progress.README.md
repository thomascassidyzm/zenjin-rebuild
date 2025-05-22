# Progress Tracking

## Purpose

This directory contains the source of truth for the current project implementation status and progress tracking.

## Files

- `progress.apml`: The single source of truth for project status in APML format
- `project_status.html`: A formatted HTML view of the progress data for easy viewing in a browser

## Primary Source of Truth

The `progress.apml` file is the primary source of truth for project status. The HTML file is generated from the APML data and should be considered a display-only format.

## Viewing Project Status

- For machine-readable status: Use the APML file
- For human-readable status: Use the HTML file in a web browser

## Updating Progress

When updating project progress:
1. First update the `progress.apml` file with the latest status
2. Then regenerate the HTML view if needed using the conversion script

## Archived Progress

Historical snapshots of project progress are stored in:
```
/docs/project/archived/YYYY-MM-DD/progress.apml
```