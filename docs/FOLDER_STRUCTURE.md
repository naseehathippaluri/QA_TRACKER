# QA Daily Tracker - Folder Structure

## Monorepo Layout

```
qa-tracker-app/   (TOO_APP)
│
├── backend/              # Django + DRF
├── frontend/             # React + Vite (JavaScript)
├── docs/                 # API & architecture
│   ├── DATABASE_SCHEMA.md
│   ├── API_CONTRACT.md
│   ├── FOLDER_STRUCTURE.md
│   └── SAMPLE_JSON.md
├── README.md
└── .gitignore
```

---

## Backend Structure

```
backend/
├── config/                 # Django project settings
│   ├── __init__.py
│   ├── settings/
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── development.py
│   │   └── production.py
│   ├── urls.py             # Root URLconf
│   └── wsgi.py
│
├── accounts/               # User & auth
│   ├── __init__.py
│   ├── models.py           # UserProfile (role)
│   ├── serializers.py
│   ├── views.py            # Register, Login, Refresh
│   ├── urls.py
│   ├── permissions.py
│   └── migrations/
│
├── projects/
│   ├── __init__.py
│   ├── models.py           # Project
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
│   ├── permissions.py
│   └── migrations/
│
├── reports/
│   ├── __init__.py
│   ├── models.py           # QAReport
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
│   ├── permissions.py
│   ├── validators.py       # execution sum validation
│   └── migrations/
│
├── common/                 # Shared utilities
│   ├── __init__.py
│   ├── permissions.py      # IsAdmin, IsOwnerOrAdmin
│   └── pagination.py
│
├── manage.py
├── requirements.txt
├── .env.example
└── .gitignore
```

---

## Frontend Structure

```
frontend/
├── public/
│   └── vite.svg
├── src/
│   ├── api/                # Centralized API layer
│   │   ├── client.js       # Axios instance + base URL
│   │   ├── auth.js
│   │   ├── projects.js
│   │   └── reports.js
│   │
│   ├── components/         # Reusable UI
│   │   ├── common/
│   │   │   ├── Layout.jsx
│   │   │   ├── PrivateRoute.jsx
│   │   │   ├── Loading.jsx
│   │   │   └── ErrorMessage.jsx
│   │   └── charts/
│   │       └── SummaryCharts.jsx
│   │
│   ├── contexts/
│   │   └── AuthContext.jsx
│   │
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── Dashboard.jsx
│   │   ├── ReportForm.jsx
│   │   ├── MyReports.jsx
│   │   ├── AdminDashboard.jsx
│   │   └── FilterReports.jsx
│   │
│   ├── hooks/
│   │   └── useAuth.js
│   │
│   ├── utils/
│   │   └── constants.js
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── index.html
├── package.json
├── vite.config.js
├── .env.example
└── .gitignore
```

---

## Deployment Artifacts

- **Backend (Render):** `backend/requirements.txt`, `backend/config/settings/production.py`, optional `render.yaml` or Render dashboard config.
- **Frontend (Vercel):** `frontend/` root; build command `npm run build`, output `dist`; env `VITE_API_BASE_URL`.
- **Database:** PostgreSQL connection string in backend env (`DATABASE_URL`).
