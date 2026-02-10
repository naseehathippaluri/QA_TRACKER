from django.urls import path
from .views import (
    ReportListCreateView,
    ReportAllListView,
    ReportFilterView,
    ReportDetailView,
    SummaryUserView,
    SummaryProjectView,
    SummaryDateView,
    SummaryMeView,
)

urlpatterns = [
    path('', ReportListCreateView.as_view(), name='report_list_create'),
    path('my/', ReportListCreateView.as_view(), name='report_my'),
    path('all/', ReportAllListView.as_view(), name='report_all'),
    path('filter/', ReportFilterView.as_view(), name='report_filter'),
    path('summary/user/', SummaryUserView.as_view(), name='summary_user'),
    path('summary/project/', SummaryProjectView.as_view(), name='summary_project'),
    path('summary/date/', SummaryDateView.as_view(), name='summary_date'),
    path('summary/me/', SummaryMeView.as_view(), name='summary_me'),
    path('<int:pk>/', ReportDetailView.as_view(), name='report_detail'),
]
