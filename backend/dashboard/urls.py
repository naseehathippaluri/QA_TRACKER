from django.urls import path
from .views import (
    DashboardSummaryView,
    DashboardAnalyticsView,
    DashboardAnalyticsSummaryView,
    DashboardExportView,
)

urlpatterns = [
    path('summary', DashboardSummaryView.as_view(), name='dashboard_summary'),
    path('analytics', DashboardAnalyticsView.as_view(), name='dashboard_analytics'),
    path('analytics/summary', DashboardAnalyticsSummaryView.as_view(), name='dashboard_analytics_summary'),
    path('export', DashboardExportView.as_view(), name='dashboard_export'),
]
