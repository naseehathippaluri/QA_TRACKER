# QA Daily Tracker - Deployment Guide

## Overview

- **Backend:** Render (Django + Gunicorn)
- **Frontend:** Vercel (React/Vite)
- **Database:** PostgreSQL (Render Postgres or external)

---

## Backend (Render)

### 1. Prepare repository

- Ensure `backend/` contains `requirements.txt`, `manage.py`, and `config/`.
- Ensure production settings use `config.settings.production` and read from env.

### 2. Create Render Web Service

1. Connect your Git repo to Render.
2. Create a **Web Service**.
3. **Root Directory:** `backend`
4. **Build Command:**  
   `pip install -r requirements.txt && python manage.py migrate --noinput && python manage.py collectstatic --noinput`
5. **Start Command:**  
   `gunicorn config.wsgi:application`
6. **Environment:**
   - `DJANGO_SETTINGS_MODULE` = `config.settings.production`
   - `SECRET_KEY` = (generate a strong secret)
   - `ALLOWED_HOSTS` = your Render URL, e.g. `qa-tracker-api.onrender.com`
   - `DATABASE_URL` = (from Render Postgres if you add a Postgres instance, or your external DB URL)
   - `CORS_ALLOWED_ORIGINS` = your Vercel frontend URL, e.g. `https://qa-tracker.vercel.app`
   - Optional: `SIMPLE_JWT_ACCESS_TOKEN_LIFETIME_MINUTES`, `SIMPLE_JWT_REFRESH_TOKEN_LIFETIME_DAYS`

### 3. PostgreSQL on Render

- Add a **PostgreSQL** instance in the same Render account.
- Copy the **Internal Database URL** (or External if frontend/other services need it).
- Set `DATABASE_URL` in the Web Service to this URL.
- Run migrations via Build Command or manually:  
  `python manage.py migrate`
- Create superuser if needed:  
  `python manage.py createsuperuser` (run in Render Shell).

### 4. Gunicorn

- Render runs the **Start Command** in a long-running process.  
- Use: `gunicorn config.wsgi:application` (or `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT` if Render sets `PORT`).

---

## Frontend (Vercel)

### 1. Prepare repository

- Frontend lives in `frontend/` (Vite + React).
- API base URL must come from env: `VITE_API_BASE_URL`.

### 2. Create Vercel project

1. Import your Git repo.
2. **Root Directory:** `frontend`
3. **Framework Preset:** Vite
4. **Build Command:** `npm run build`
5. **Output Directory:** `dist`
6. **Environment variable:**
   - `VITE_API_BASE_URL` = your Render backend URL, e.g. `https://qa-tracker-api.onrender.com`  
   (no trailing slash)

### 3. Deploy

- Push to the connected branch; Vercel will build and deploy.
- After first deploy, ensure `CORS_ALLOWED_ORIGINS` on the backend includes your Vercel URL (e.g. `https://your-app.vercel.app`).

---

## Post-deployment checklist

- [ ] Backend health: open `https://your-api.onrender.com/api/docs/` (Swagger).
- [ ] Frontend loads and redirects to login.
- [ ] Register a user and log in.
- [ ] Create a report and view it in “My Reports”.
- [ ] If admin: create project, view “All Reports” and summary APIs.
- [ ] JWT refresh works (stay logged in after token expiry if refresh is valid).

---

## Local development

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
cp .env.example .env     # set SECRET_KEY, optional DATABASE_URL
python manage.py migrate
python manage.py runserver
```

- Default: SQLite. For PostgreSQL set `DATABASE_URL` in `.env` (and use `dj-database-url` in settings if desired).

### Frontend

```bash
cd frontend
cp .env.example .env      # VITE_API_BASE_URL=http://localhost:8000
npm install
npm run dev
```

- Open `http://localhost:5173` and use `http://localhost:8000` as API.

### CORS

- Backend `CORS_ALLOWED_ORIGINS` must include `http://localhost:5173` (and `http://127.0.0.1:5173` if you use that).
