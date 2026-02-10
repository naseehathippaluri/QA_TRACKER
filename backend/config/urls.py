"""
Root URL configuration for QA Daily Tracker API.
"""
from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/projects/', include('projects.urls')),
    path('api/reports/', include('reports.urls')),
    path('api/features/', include('features.urls')),
    path('api/worklogs/', include('worklogs.urls')),
    path('api/dashboard/', include('dashboard.urls')),
    # OpenAPI schema & Swagger UI
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]
