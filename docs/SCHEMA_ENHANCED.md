# QA Tracker - Updated PostgreSQL Schema (Post-Enhancement)

## New / Updated Tables

### features_feature
| Column      | Type         | Constraints        |
|-------------|--------------|--------------------|
| id          | SERIAL       | PK                 |
| name        | VARCHAR(255) | UNIQUE, NOT NULL   |
| created_by_id | INTEGER    | FK → auth_user.id, NULL |
| created_at  | TIMESTAMP    | DEFAULT NOW()      |

### worklogs_worklog
| Column                        | Type         | Constraints                    |
|-------------------------------|--------------|--------------------------------|
| id                            | SERIAL       | PK                             |
| user_id                       | INTEGER      | FK → auth_user.id, NOT NULL    |
| feature_id                    | INTEGER      | FK → features_feature.id, NOT NULL |
| project_id                    | INTEGER      | FK → projects_project.id, NULL |
| date                          | DATE         | NOT NULL                       |
| assigned_to_id                | INTEGER      | FK → auth_user.id, NULL        |
| test_cases_written            | INTEGER      | DEFAULT 0                      |
| test_cases_reviewed           | INTEGER      | DEFAULT 0                      |
| test_cases_executed           | INTEGER      | DEFAULT 0                      |
| test_cases_passed             | INTEGER      | DEFAULT 0                      |
| test_cases_failed             | INTEGER      | DEFAULT 0                      |
| test_cases_blocked            | INTEGER      | DEFAULT 0                      |
| test_cases_in_progress        | INTEGER      | DEFAULT 0                      |
| test_cases_future_execution   | INTEGER      | DEFAULT 0                      |
| test_cases_invalid            | INTEGER      | DEFAULT 0                      |
| retested_qa_review_tickets    | INTEGER      | DEFAULT 0                      |
| defects_raised                | INTEGER      | DEFAULT 0                      |
| ticket_number_with_priority   | VARCHAR(500) |                                |
| observations_found            | INTEGER      | DEFAULT 0                      |
| comments                      | TEXT         |                                |
| created_at                    | TIMESTAMP    | DEFAULT NOW()                  |
| updated_at                    | TIMESTAMP    | DEFAULT NOW()                  |

**Unique constraint:** (user_id, feature_id, date)

**Validation:** passed + failed + blocked + in_progress + future_execution + invalid <= test_cases_executed

### Legacy: reports_qareport
Retained for reference; data migrated into worklogs via migration `worklogs.0002_migrate_from_reports`.
