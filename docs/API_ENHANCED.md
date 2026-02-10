# QA Tracker - Enhanced API Summary

Base URL: `{VITE_API_BASE_URL}/api`

## Auth
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/refresh
- GET /api/auth/users/ (Admin only – list users for filters)

## Features
- GET /api/features/
- POST /api/features/ (Admin)
- GET /api/features/{id}/
- PUT /api/features/{id}/ (Admin)
- DELETE /api/features/{id}/ (Admin)

## Work Logs
- POST /api/worklogs/
- GET /api/worklogs/my/
- GET /api/worklogs/all/ (Admin)
- GET /api/worklogs/filter/?date_from=&date_to=&user=&feature= (Admin can filter by user)
- GET /api/worklogs/{id}/
- PUT /api/worklogs/{id}/
- DELETE /api/worklogs/{id}/

## Dashboard
- GET /api/dashboard/summary?date_from=&date_to=&feature=&user=  
  Returns: total_features, total_work_logs, total_test_cases_written, total_test_cases_executed, total_passed, total_failed, total_observations_found, total_qa_review_tickets, total_defects_raised
- GET /api/dashboard/analytics?date_from=&date_to=&feature=&user=  
  Returns: defects_trend, test_cases_executed, test_cases_written, jira_tickets_raised (arrays of { date, count })

## Projects (unchanged)
- GET/POST /api/projects/
- GET/PUT/DELETE /api/projects/{id}/

## Legacy Reports (still available)
- /api/reports/... (existing endpoints; prefer worklogs for new usage)
