"""
Production settings for Render / deployment.
"""
import os
from .base import *

DEBUG = False
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '').split(',')

# PostgreSQL from DATABASE_URL (Render provides this)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('PGDATABASE', 'qa_tracker_db'),
        'USER': os.getenv('PGUSER', ''),
        'PASSWORD': os.getenv('PGPASSWORD', ''),
        'HOST': os.getenv('PGHOST', ''),
        'PORT': os.getenv('PGPORT', '5432'),
        'CONN_MAX_AGE': 600,
        'OPTIONS': {'sslmode': 'require'} if os.getenv('PGSSLMODE') else {},
    }
}

# Render / external DB URL takes precedence
_db_url = os.getenv('DATABASE_URL')
if _db_url and _db_url.startswith('postgres'):
    import dj_database_url
    try:
        DATABASES['default'] = dj_database_url.parse(_db_url, conn_max_age=600)
        if not DATABASES['default'].get('OPTIONS'):
            DATABASES['default']['OPTIONS'] = {}
        DATABASES['default']['OPTIONS']['sslmode'] = 'require'
    except Exception:
        pass

CORS_ALLOWED_ORIGINS = os.getenv('CORS_ALLOWED_ORIGINS', '').split(',')
if not CORS_ALLOWED_ORIGINS or CORS_ALLOWED_ORIGINS == ['']:
    CORS_ALLOWED_ORIGINS = []

SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
CSRF_TRUSTED_ORIGINS = [o.replace('http://', 'https://') for o in CORS_ALLOWED_ORIGINS if o]
SECURE_SSL_REDIRECT = os.getenv('SECURE_SSL_REDIRECT', 'True').lower() in ('true', '1', 'yes')
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

STATIC_ROOT = BASE_DIR / 'staticfiles'
