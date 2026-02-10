# QA Daily Tracker - Database Schema

## Overview

PostgreSQL schema designed for normalized data, proper foreign keys, and indexed queries for date/user filtering.

---

## Entity Relationship Diagram (Logical)

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     User        │       │    Project      │       │   QAReport      │
│  (Django Auth)  │       │                 │       │                 │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │───┐   │ id (PK)         │───┐   │ id (PK)         │
│ username        │   │   │ name            │   │   │ user_id (FK)    │──→ User
│ email           │   └──→│ description     │   └──→│ project_id(FK)  │──→ Project
│ password        │       │ status          │       │ date            │
│ ...             │       │ created_at      │       │ (metrics...)    │
└─────────────────┘       └─────────────────┘       │ created_at     │
        ↑                           ↑                │ updated_at     │
        │                           │                └─────────────────┘
   UserProfile                  (indexed)
   (extends User)
   - role (QA/Admin)
```

---

## Tables

### 1. auth_user (Django built-in)

| Column       | Type         | Constraints |
|-------------|--------------|-------------|
| id          | SERIAL       | PK          |
| username    | VARCHAR(150) | UNIQUE, NOT NULL |
| first_name  | VARCHAR(150) |             |
| last_name   | VARCHAR(150) |             |
| email       | VARCHAR(254) |             |
| password    | VARCHAR(128) | NOT NULL    |
| is_staff    | BOOLEAN      | DEFAULT FALSE |
| is_active   | BOOLEAN      | DEFAULT TRUE  |
| is_superuser| BOOLEAN      | DEFAULT FALSE |
| date_joined | TIMESTAMP    |             |
| last_login  | TIMESTAMP    |             |

---

### 2. accounts_userprofile (extends User)

| Column    | Type         | Constraints                    |
|-----------|--------------|--------------------------------|
| id        | SERIAL       | PK                             |
| user_id   | INTEGER      | FK → auth_user.id, UNIQUE      |
| role      | VARCHAR(20)  | NOT NULL, CHECK IN ('QA', 'ADMIN') |

**Indexes:** `user_id` (unique FK)

---

### 3. projects_project

| Column      | Type         | Constraints     |
|-------------|--------------|-----------------|
| id          | SERIAL       | PK              |
| name        | VARCHAR(255) | NOT NULL        |
| description | TEXT         |                 |
| status      | VARCHAR(50)  | DEFAULT 'active'|
| created_at  | TIMESTAMP    | DEFAULT NOW()   |
| updated_at  | TIMESTAMP    | DEFAULT NOW()   |

**Indexes:** `name`, `status`

---

### 4. reports_qareport

| Column                        | Type         | Constraints                    |
|-------------------------------|--------------|--------------------------------|
| id                            | SERIAL       | PK                             |
| user_id                       | INTEGER      | FK → auth_user.id, NOT NULL    |
| project_id                    | INTEGER      | FK → projects_project.id       |
| date                          | DATE         | NOT NULL                       |
| total_test_cases_written      | INTEGER      | DEFAULT 0, >= 0                |
| total_test_cases_reviewed     | INTEGER      | DEFAULT 0, >= 0                |
| total_test_cases_executed    | INTEGER      | DEFAULT 0, >= 0                |
| test_cases_passed             | INTEGER      | DEFAULT 0, >= 0                |
| test_cases_failed             | INTEGER      | DEFAULT 0, >= 0                |
| test_cases_blocked            | INTEGER      | DEFAULT 0, >= 0                |
| test_cases_in_progress        | INTEGER      | DEFAULT 0, >= 0                |
| test_cases_future_execution   | INTEGER      | DEFAULT 0, >= 0                |
| test_cases_invalid            | INTEGER      | DEFAULT 0, >= 0                |
| retested_qa_review_tickets    | INTEGER      | DEFAULT 0, >= 0                |
| total_defects_found           | INTEGER      | DEFAULT 0, >= 0                |
| defects_raised                | INTEGER      | DEFAULT 0, >= 0                |
| ticket_number_with_priority   | VARCHAR(500) |                                |
| total_observations            | INTEGER      | DEFAULT 0, >= 0                |
| observations_found            | INTEGER      | DEFAULT 0, >= 0                |
| comments_remarks              | TEXT         |                                |
| created_at                    | TIMESTAMP    | DEFAULT NOW()                  |
| updated_at                    | TIMESTAMP    | DEFAULT NOW()                  |

**Unique constraint:** `(user_id, project_id, date)` — one report per user per project per date.

**Indexes:**
- `(user_id, date)` — for "my reports" and user summaries
- `(project_id, date)` — for project summaries
- `date` — for date range filters

**Validation (application layer):**
```
passed + failed + blocked + in_progress + future_execution + invalid <= executed
```

---

## Migration Order

1. Django migrations for `auth` (built-in)
2. `accounts` app: UserProfile
3. `projects` app: Project
4. `reports` app: QAReport

---

## Future Enhancement Readiness

- **File attachments:** Add `reports_reportattachment(id, report_id, file_path, uploaded_at)`
- **Notifications:** Add `notifications_notification(id, user_id, message, read, created_at)`
- **Role hierarchy:** Extend `UserProfile.role` with choices (e.g. QA_LEAD, MANAGER)
- **Multi-project assignment:** Junction table `projects_projectmember(user_id, project_id, role)`
- **Analytics:** Materialized views or summary tables keyed by (user_id, project_id, date_range)
- **Export:** Use same schema; export services read from QAReport + Project + User
