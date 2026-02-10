"""
Auth URL routes.
POST /api/auth/register  - signup (email, full_name, password)
POST /api/auth/login    - login (email, password) -> access_token, refresh_token, user
POST /api/auth/token/refresh - body: { refresh }
POST /api/auth/logout   - body: { refresh } blacklist
GET  /api/auth/users/  - list users (Admin only)
"""
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import RegisterView, LoginView, LogoutView, UserListView

urlpatterns = [
    path('register', RegisterView.as_view(), name='auth_register'),
    path('login', LoginView.as_view(), name='auth_login'),
    path('token/refresh', TokenRefreshView.as_view(), name='auth_token_refresh'),
    path('logout', LogoutView.as_view(), name='auth_logout'),
    path('users/', UserListView.as_view(), name='auth_users'),
]
