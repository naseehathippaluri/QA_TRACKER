# Migration Strategy: Reports → Work Logs

## Overview
Legacy `reports.QAReport` data was migrated into `worklogs.WorkLog` with a one-time data migration.

## Steps Performed

1. **New apps**
   - `features`: Feature model (name unique, created_by, created_at).
   - `worklogs`: WorkLog model (feature FK required, project optional, no "total_" prefix, assigned_to for admin).

2. **Data migration** (`worklogs.0002_migrate_from_reports`)
   - For each existing `projects.Project`, created a `Feature` with name `"Feature: {project.name}"`.
   - If no projects existed, created a single `Feature` named `"Legacy"`.
   - For each `QAReport` row, created a `WorkLog` with:
     - feature = Feature for that report’s project (or Legacy)
     - project = original report’s project
     - user, date, and all metrics mapped (total_* → non-prefixed names, comments_remarks → comments).
   - Used `get_or_create` on (user, feature, date) to avoid duplicates.

3. **Frontend**
   - All “Report” terminology switched to “Work Log” (Create Work Log, Work Log Reports, Total Work Logs).
   - New APIs used: `/api/worklogs/`, `/api/features/`, `/api/dashboard/summary`, `/api/dashboard/analytics`.
   - Old `/api/reports/` endpoints remain for backward compatibility but are no longer used by the new UI.

## Rollback
- No automatic rollback of the data migration; WorkLog rows are retained.
- To revert UI only, point frontend back to report endpoints and wording.

## Future
- Optionally deprecate `reports` app and remove `/api/reports/` once all consumers use worklogs.
