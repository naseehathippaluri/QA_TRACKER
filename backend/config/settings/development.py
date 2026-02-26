"""
Development settings.
"""
import os
import dj_database_url
from .base import *

DEBUG = os.getenv('DEBUG', 'True').lower() in ('true', '1', 'yes')
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

# PostgreSQL for local development (same as production stack).
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('PGDATABASE', 'qa_tracker_dev'),
        'USER': os.getenv('PGUSER', 'qa_dev'),
        'PASSWORD': os.getenv('PGPASSWORD', ''),
        'HOST': os.getenv('PGHOST', 'localhost'),
        'PORT': os.getenv('PGPORT', '5432'),
        'CONN_MAX_AGE': 0,
        'OPTIONS': {},
    }
}
_db_url = os.getenv('DATABASE_URL')
if _db_url and _db_url.strip().lower().startswith('postgres'):
    DATABASES['default'] = dj_database_url.parse(_db_url, conn_max_age=0)
    if not DATABASES['default'].get('OPTIONS'):
        DATABASES['default']['OPTIONS'] = {}
    DATABASES['default']['OPTIONS'].pop('sslmode', None)

CORS_ALLOWED_ORIGINS = os.getenv('CORS_ALLOWED_ORIGINS', 'http://localhost:5173,http://127.0.0.1:5173').split(',')
