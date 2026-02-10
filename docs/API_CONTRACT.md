# QA Daily Tracker - API Contract

Base URL: `{API_BASE_URL}/api` (e.g. `https://your-backend.onrender.com/api`)

Authentication: JWT Bearer token in `Authorization: Bearer <access_token>`.

---

## Authentication APIs

### POST /api/auth/register

**Request:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe",
  "role": "QA"
}
```
- `role`: `"QA"` or `"ADMIN"`

**Response (201):**
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "role": "QA"
}
```

**Errors:** 400 (validation), 409 (username/email exists)

---

### POST /api/auth/login

**Request:**
```json
{
  "username": "johndoe",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "QA"
  }
}
```

**Errors:** 401 (invalid credentials)

---

### POST /api/auth/refresh

**Request:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response (200):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Errors:** 401 (invalid/expired refresh token)

---

## Project APIs

All project write operations require Admin role.

### GET /api/projects

**Auth:** Required (any authenticated user)

**Response (200):**
```json
{
  "count": 2,
  "results": [
    {
      "id": 1,
      "name": "Project Alpha",
      "description": "Main product",
      "status": "active",
      "created_at": "2025-02-01T10:00:00Z",
      "updated_at": "2025-02-01T10:00:00Z"
    }
  ]
}
```

---

### POST /api/projects

**Auth:** Admin only

**Request:**
```json
{
  "name": "Project Alpha",
  "description": "Main product",
  "status": "active"
}
```

**Response (201):** Single project object (same shape as in list).

**Errors:** 400 (validation), 403 (not admin)

---

### GET /api/projects/{id}

**Auth:** Required

**Response (200):** Single project object.

**Errors:** 404

---

### PUT /api/projects/{id}

**Auth:** Admin only

**Request:** Same as POST (partial allowed).

**Response (200):** Updated project object.

**Errors:** 400, 403, 404

---

### DELETE /api/projects/{id}

**Auth:** Admin only

**Response (204):** No content.

**Errors:** 403, 404

---

## QA Report APIs

### POST /api/reports

**Auth:** Required (QA or Admin)

**Request:**
```json
{
  "project": 1,
  "date": "2025-02-04",
  "total_test_cases_written": 10,
  "total_test_cases_reviewed": 5,
  "total_test_cases_executed": 20,
  "test_cases_passed": 15,
  "test_cases_failed": 2,
  "test_cases_blocked": 1,
  "test_cases_in_progress": 1,
  "test_cases_future_execution": 1,
  "test_cases_invalid": 0,
  "retested_qa_review_tickets": 3,
  "total_defects_found": 2,
  "defects_raised": 2,
  "ticket_number_with_priority": "TKT-101 (High), TKT-102 (Medium)",
  "total_observations": 1,
  "observations_found": 1,
  "comments_remarks": "Sprint focus on login flow."
}
```

**Response (201):** Full report object (including `id`, `user`, `created_at`, `updated_at`).

**Errors:** 400 (validation: sum constraint, duplicate user/date/project), 403

**Validation rule:**  
`passed + failed + blocked + in_progress + future_execution + invalid <= executed`

---

### GET /api/reports/my

**Auth:** Required

**Response (200):** List of reports for the current user.

```json
{
  "count": 5,
  "results": [
    {
      "id": 1,
      "user": 1,
      "user_username": "johndoe",
      "project": 1,
      "project_name": "Project Alpha",
      "date": "2025-02-04",
      "total_test_cases_executed": 20,
      "test_cases_passed": 15,
      "...": "..."
    }
  ]
}
```

---

### GET /api/reports/all

**Auth:** Admin only

**Response (200):** Same list shape as `/api/reports/my` but for all users.

**Errors:** 403 (non-admin)

---

### GET /api/reports/filter

**Query params:** `date_from`, `date_to`, `user`, `project` (all optional)

**Auth:** Admin only (filtering across users); QA can only see own data via `/api/reports/my`.

**Response (200):** Same list shape with filtered results.

**Example:** `GET /api/reports/filter?date_from=2025-02-01&date_to=2025-02-04&project=1`

---

### GET /api/reports/{id}

**Auth:** Required. QA can only access own report; Admin can access any.

**Response (200):** Single report object.

**Errors:** 403, 404

---

### PUT /api/reports/{id}

**Auth:** Required. QA can only edit own report (same date); Admin can edit any.

**Request:** Same fields as POST (partial allowed).

**Response (200):** Updated report object.

**Errors:** 400, 403, 404

---

### DELETE /api/reports/{id}

**Auth:** Required. QA can delete own; Admin can delete any.

**Response (204):** No content.

**Errors:** 403, 404

---

## Summary APIs

### GET /api/reports/summary/user

**Auth:** Admin only

**Query params (optional):** `date_from`, `date_to`

**Response (200):** Aggregates per user.

```json
{
  "results": [
    {
      "user_id": 1,
      "username": "johndoe",
      "total_reports": 10,
      "total_executed": 200,
      "total_passed": 180,
      "total_failed": 15,
      "total_defects_raised": 8
    }
  ]
}
```

---

### GET /api/reports/summary/project

**Auth:** Admin only

**Query params (optional):** `date_from`, `date_to`

**Response (200):** Aggregates per project.

```json
{
  "results": [
    {
      "project_id": 1,
      "project_name": "Project Alpha",
      "total_reports": 25,
      "total_executed": 500,
      "total_passed": 450,
      "total_defects_raised": 20
    }
  ]
}
```

---

### GET /api/reports/summary/date

**Auth:** Admin only (or QA for own data if implemented).

**Query params (optional):** `date_from`, `date_to`

**Response (200):** Aggregates per date.

```json
{
  "results": [
    {
      "date": "2025-02-04",
      "total_reports": 5,
      "total_executed": 100,
      "total_passed": 90,
      "total_defects_raised": 5
    }
  ]
}
```

---

### GET /api/reports/summary/me

**Auth:** Required (QA or Admin for personal summary).

**Query params (optional):** `date_from`, `date_to`

**Response (200):** Personal summary for current user.

```json
{
  "total_reports": 10,
  "total_executed": 200,
  "total_passed": 180,
  "total_failed": 15,
  "total_defects_raised": 8,
  "date_from": "2025-02-01",
  "date_to": "2025-02-04"
}
```

---

## Error Response Format

All error responses use a consistent shape:

```json
{
  "detail": "Error message",
  "code": "error_code",
  "errors": {}
}
```

For validation errors (400), `errors` may contain field-level messages:

```json
{
  "detail": "Validation failed",
  "errors": {
    "test_cases_passed": ["Ensure this value is less than or equal to total_test_cases_executed."],
    "date": ["Report for this user and project on this date already exists."]
  }
}
```

---

## Pagination

List endpoints support optional query params:

- `page` (default: 1)
- `page_size` (default: 10, max: 100)

Response includes: `count`, `next`, `previous`, `results`.
