from django.urls import path
from .views import DashboardSummaryView, DashboardAnalyticsView, DashboardExportView

urlpatterns = [
    path('summary', DashboardSummaryView.as_view(), name='dashboard_summary'),
    path('analytics', DashboardAnalyticsView.as_view(), name='dashboard_analytics'),
    path('export', DashboardExportView.as_view(), name='dashboard_export'),
]
