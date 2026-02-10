# QA Daily Tracker

Production-ready web application for QA team members to log and track daily testing activities. Built with a **monorepo**: Django REST backend and React (Vite) frontend.

## Repository structure

```
qa-tracker-app/   (TOO_APP)
├── backend/        → Django + Django REST Framework + JWT
├── frontend/       → React + Vite (JavaScript)
├── docs/           → API docs, schema, deployment
└── README.md
```

## Features

- **QA members:** Register/login, submit and edit daily QA reports, view own reports and personal summary.
- **Admins:** View all reports, filter by date/user/project, summary dashboards and defect/observation metrics.
- **Reports:** Execution metrics (written, reviewed, executed, passed, failed, blocked, etc.), defect tracking, observations, comments.
- **Validation:** One report per user per project per date; execution breakdown sum ≤ executed.
- **Auth:** JWT (access + refresh), role-based access (QA / Admin).

## Tech stack

| Layer    | Stack |
|----------|--------|
| Backend  | Python, Django, Django REST Framework, PostgreSQL, JWT (Simple JWT), django-filter, drf-spectacular |
| Frontend | React, Vite, JavaScript, Axios, React Router, React Hook Form, Recharts |
| Deploy   | Backend → Render, Frontend → Vercel, DB → PostgreSQL |

## Quick start (local)

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env     # Edit SECRET_KEY, optional CORS/DATABASE_URL
python manage.py migrate
python manage.py runserver
```

- API: http://localhost:8000  
- Swagger: http://localhost:8000/api/docs/

### Frontend

```bash
cd frontend
cp .env.example .env     # VITE_API_BASE_URL=http://localhost:8000
npm install
npm run dev
```

- App: http://localhost:5173

### First user

- Sign up via **Sign up** in the app (or `POST /api/auth/register`).
- For admin capabilities, set role `ADMIN` when registering or via Django admin after creating a user.

## Documentation

| Document | Description |
|----------|-------------|
| [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) | PostgreSQL schema, tables, indexes |
| [docs/API_CONTRACT.md](docs/API_CONTRACT.md) | REST API endpoints and request/response |
| [docs/FOLDER_STRUCTURE.md](docs/FOLDER_STRUCTURE.md) | Backend and frontend folder layout |
| [docs/SAMPLE_JSON.md](docs/SAMPLE_JSON.md) | Sample JSON request/response |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Deploy backend (Render), frontend (Vercel), DB |

## API overview

- **Auth:** `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh`
- **Projects:** `GET/POST /api/projects/`, `GET/PUT/DELETE /api/projects/{id}/` (write = Admin)
- **Reports:** `POST /api/reports/`, `GET /api/reports/my/`, `GET /api/reports/all/` (Admin), `GET /api/reports/filter/?date_from=&date_to=&user=&project=`, `GET/PUT/DELETE /api/reports/{id}/`
- **Summary:** `GET /api/reports/summary/me/`, `GET /api/reports/summary/user/`, `summary/project/`, `summary/date/` (latter three = Admin)

## Testing

### Backend

```bash
cd backend
.venv\Scripts\activate
python manage.py test
```

### Frontend

```bash
cd frontend
npm run test   # if test script is configured
```

## Deployment

- **Backend (Render):** Set `DJANGO_SETTINGS_MODULE=config.settings.production`, `DATABASE_URL`, `SECRET_KEY`, `CORS_ALLOWED_ORIGINS`. Start with `gunicorn config.wsgi:application`.
- **Frontend (Vercel):** Root directory `frontend`, build `npm run build`, output `dist`, env `VITE_API_BASE_URL` = backend URL.
- **Database:** Use Render Postgres or any PostgreSQL; set `DATABASE_URL` in backend.

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for step-by-step instructions.

## Future enhancements

- File attachments on reports
- Notifications (in-app or email)
- Role hierarchy (e.g. QA Lead, Manager)
- Multi-project assignment per user
- Richer analytics and export (Excel/PDF)

## License

Proprietary / internal use as needed.
