from django.urls import path
from .views import WorkLogListCreateView, WorkLogAllListView, WorkLogFilterView, WorkLogDetailView

urlpatterns = [
    path('', WorkLogListCreateView.as_view(), name='worklog_list_create'),
    path('my/', WorkLogListCreateView.as_view(), name='worklog_my'),
    path('all/', WorkLogAllListView.as_view(), name='worklog_all'),
    path('filter/', WorkLogFilterView.as_view(), name='worklog_filter'),
    path('<int:pk>/', WorkLogDetailView.as_view(), name='worklog_detail'),
]
