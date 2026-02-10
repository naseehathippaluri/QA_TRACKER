# Sample JSON Request/Response

## Register

**Request:** `POST /api/auth/register`
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

---

## Login

**Request:** `POST /api/auth/login`
```json
{
  "username": "johndoe",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
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

---

## Create Report

**Request:** `POST /api/reports`
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

**Response (201):**
```json
{
  "id": 1,
  "user": 1,
  "user_username": "johndoe",
  "project": 1,
  "project_name": "Project Alpha",
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
  "comments_remarks": "Sprint focus on login flow.",
  "created_at": "2025-02-04T14:30:00Z",
  "updated_at": "2025-02-04T14:30:00Z"
}
```

---

## Validation Error (400)

**Response:** `POST /api/reports` with invalid sum (e.g. passed+failed+... > executed)
```json
{
  "detail": "Validation failed",
  "errors": {
    "non_field_errors": [
      "Sum of passed, failed, blocked, in_progress, future_execution and invalid must not exceed total_test_cases_executed."
    ]
  }
}
```

---

## Duplicate Report (400)

**Response:** `POST /api/reports` when report for same user, project, date exists
```json
{
  "detail": "Validation failed",
  "errors": {
    "non_field_errors": [
      "A report for this user and project on this date already exists."
    ]
  }
}
```

---

## Create Project (Admin)

**Request:** `POST /api/projects`
```json
{
  "name": "Project Alpha",
  "description": "Main product QA",
  "status": "active"
}
```

**Response (201):**
```json
{
  "id": 1,
  "name": "Project Alpha",
  "description": "Main product QA",
  "status": "active",
  "created_at": "2025-02-01T10:00:00Z",
  "updated_at": "2025-02-01T10:00:00Z"
}
```
