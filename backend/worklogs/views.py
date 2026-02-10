"""
Work Log CRUD, filtering. QA: own only. Admin: all + assign.
"""
from django.db.models import Sum, Count
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from .models import WorkLog
from .serializers import WorkLogSerializer
from common.permissions import IsAdminUser, IsOwnerOrAdmin


class WorkLogListCreateView(generics.ListCreateAPIView):
    serializer_class = WorkLogSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['date', 'feature', 'project']

    def get_queryset(self):
        qs = WorkLog.objects.select_related('user', 'feature', 'project', 'assigned_to').order_by('-date')
        if getattr(self.request.user, 'profile', None) and self.request.user.profile.role == 'ADMIN':
            return qs
        return qs.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class WorkLogAllListView(generics.ListAPIView):
    """Admin: list all work logs."""
    queryset = WorkLog.objects.all().select_related('user', 'feature', 'project', 'assigned_to').order_by('-date')
    serializer_class = WorkLogSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['date', 'feature', 'project', 'user']


class WorkLogFilterView(generics.ListAPIView):
    """GET /api/worklogs/filter?date_from=&date_to=&user=&feature= (Admin can filter by user)."""
    serializer_class = WorkLogSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['feature', 'project']

    def get_queryset(self):
        qs = WorkLog.objects.all().select_related('user', 'feature', 'project', 'assigned_to').order_by('-date')
        if getattr(self.request.user, 'profile', None) and self.request.user.profile.role != 'ADMIN':
            qs = qs.filter(user=self.request.user)
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        if date_from:
            qs = qs.filter(date__gte=date_from)
        if date_to:
            qs = qs.filter(date__lte=date_to)
        user_id = self.request.query_params.get('user')
        if user_id and getattr(self.request.user, 'profile', None) and self.request.user.profile.role == 'ADMIN':
            qs = qs.filter(user_id=user_id)
        feature_id = self.request.query_params.get('feature')
        if feature_id:
            qs = qs.filter(feature_id=feature_id)
        return qs


class WorkLogDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = WorkLog.objects.all().select_related('user', 'feature', 'project', 'assigned_to')
    serializer_class = WorkLogSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]
