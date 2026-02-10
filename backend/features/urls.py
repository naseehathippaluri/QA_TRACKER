from django.urls import path
from .views import FeatureListCreateView, FeatureDetailView

urlpatterns = [
    path('', FeatureListCreateView.as_view(), name='feature_list_create'),
    path('<int:pk>/', FeatureDetailView.as_view(), name='feature_detail'),
]
