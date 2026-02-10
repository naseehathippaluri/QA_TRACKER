# Future Enhancement Suggestions

The system is designed to support the following extensions with minimal schema/architecture changes.

---

## 1. File attachments

- **Schema:** Add `reports_reportattachment(id, report_id, file_path, file_name, uploaded_at)`.
- **API:** `POST/GET/DELETE /api/reports/{id}/attachments/`.
- **Storage:** Use Django `FileField` with S3/Render disk or external storage; serve via signed URLs or proxy.
- **Frontend:** Upload component in report form and detail view; list/delete attachments.

---

## 2. Notifications

- **Schema:** Add `notifications_notification(id, user_id, message, read, created_at)` or use a generic notification table with type (report_reminder, defect_comment, etc.).
- **API:** `GET /api/notifications/`, `PATCH /api/notifications/{id}/read/`.
- **Delivery:** Optional email/push via Celery or background tasks; in-app badge + list in header.

---

## 3. Role hierarchy

- **Schema:** Extend `UserProfile.role` with choices: `QA`, `QA_LEAD`, `MANAGER`, `ADMIN`; or add a separate `role_level` for ordering.
- **Logic:** Permissions (e.g. view team reports, approve reports) based on role level; `IsAdminUser` generalized to “has role in [ADMIN, MANAGER]” etc.
- **Frontend:** Role-based menu items and dashboards (already partially in place with QA vs Admin).

---

## 4. Multi-project assignment

- **Schema:** Add `projects_projectmember(user_id, project_id, role, assigned_at)` with unique (user, project).
- **Logic:** QA can submit reports only for projects they are assigned to; admin can assign/unassign.
- **API:** `GET/POST/DELETE /api/projects/{id}/members/`, optional filter “my projects” for report form project dropdown.

---

## 5. Analytics dashboards

- **Current:** Summary APIs by user, project, date already support basic dashboards.
- **Enhancements:** Pre-aggregated tables or materialized views for large datasets; date-range presets (this week, this month); trend charts (executed/passed over time); defect rate by project.
- **Frontend:** More chart types (line, pie), export chart as image, dashboard layout customization.

---

## 6. Export reports (Excel/PDF)

- **Backend:** Use `openpyxl` (Excel) and `reportlab` or `weasyprint` (PDF); endpoints e.g. `GET /api/reports/export/?format=xlsx&date_from=&date_to=&project=`.
- **Frontend:** “Export” button on filter/list views; optional server-rendered PDF for single report.
- **Security:** Respect same filters and permissions as list APIs (e.g. admin only for team export, QA for own).

---

## Implementation priority (suggested)

1. **Export (Excel/PDF)** — High value for managers, low complexity.
2. **File attachments** — High value for evidence and traceability.
3. **Multi-project assignment** — Clarifies who can report on which project.
4. **Notifications** — Improves engagement and reminders.
5. **Role hierarchy** — When you need QA Lead / Manager tiers.
6. **Advanced analytics** — When data volume and reporting needs grow.
