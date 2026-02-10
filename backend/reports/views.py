"""
QA Report CRUD, filtering, and summary APIs.
"""
from django.db.models import Sum, Count
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from .models import QAReport
from .serializers import QAReportSerializer
from common.permissions import IsAdminUser, IsOwnerOrAdmin


class ReportListCreateView(generics.ListCreateAPIView):
    """GET /api/reports/my - list own reports; POST - create report."""
    serializer_class = QAReportSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['date', 'project']

    def get_queryset(self):
        return QAReport.objects.filter(user=self.request.user).select_related('user', 'project').order_by('-date')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ReportAllListView(generics.ListAPIView):
    """GET /api/reports/all - list all reports (Admin only)."""
    queryset = QAReport.objects.all().select_related('user', 'project').order_by('-date')
    serializer_class = QAReportSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['date', 'project', 'user']


class ReportFilterView(generics.ListAPIView):
    """GET /api/reports/filter?date_from=&date_to=&user=&project= (Admin only)."""
    serializer_class = QAReportSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['user', 'project']

    def get_queryset(self):
        qs = QAReport.objects.all().select_related('user', 'project').order_by('-date')
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        if date_from:
            qs = qs.filter(date__gte=date_from)
        if date_to:
            qs = qs.filter(date__lte=date_to)
        return qs


class ReportDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PUT/DELETE /api/reports/{id} - owner or Admin."""
    queryset = QAReport.objects.all().select_related('user', 'project')
    serializer_class = QAReportSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]


class SummaryUserView(APIView):
    """GET /api/reports/summary/user - aggregates per user (Admin only)."""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        qs = QAReport.objects.all()
        if date_from:
            qs = qs.filter(date__gte=date_from)
        if date_to:
            qs = qs.filter(date__lte=date_to)
        results = qs.values('user__id', 'user__username').annotate(
            total_reports=Count('id'),
            total_executed=Sum('total_test_cases_executed'),
            total_passed=Sum('test_cases_passed'),
            total_failed=Sum('test_cases_failed'),
            total_defects_raised=Sum('defects_raised'),
        ).order_by('-total_reports')
        data = [
            {
                'user_id': r['user__id'],
                'username': r['user__username'],
                'total_reports': r['total_reports'] or 0,
                'total_executed': r['total_executed'] or 0,
                'total_passed': r['total_passed'] or 0,
                'total_failed': r['total_failed'] or 0,
                'total_defects_raised': r['total_defects_raised'] or 0,
            }
            for r in results
        ]
        return Response({'results': data})


class SummaryProjectView(APIView):
    """GET /api/reports/summary/project - aggregates per project (Admin only)."""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        qs = QAReport.objects.all()
        if date_from:
            qs = qs.filter(date__gte=date_from)
        if date_to:
            qs = qs.filter(date__lte=date_to)
        results = qs.values('project__id', 'project__name').annotate(
            total_reports=Count('id'),
            total_executed=Sum('total_test_cases_executed'),
            total_passed=Sum('test_cases_passed'),
            total_defects_raised=Sum('defects_raised'),
        ).order_by('-total_reports')
        data = [
            {
                'project_id': r['project__id'],
                'project_name': r['project__name'],
                'total_reports': r['total_reports'] or 0,
                'total_executed': r['total_executed'] or 0,
                'total_passed': r['total_passed'] or 0,
                'total_defects_raised': r['total_defects_raised'] or 0,
            }
            for r in results
        ]
        return Response({'results': data})


class SummaryDateView(APIView):
    """GET /api/reports/summary/date - aggregates per date (Admin only)."""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        qs = QAReport.objects.all()
        if date_from:
            qs = qs.filter(date__gte=date_from)
        if date_to:
            qs = qs.filter(date__lte=date_to)
        results = qs.values('date').annotate(
            total_reports=Count('id'),
            total_executed=Sum('total_test_cases_executed'),
            total_passed=Sum('test_cases_passed'),
            total_defects_raised=Sum('defects_raised'),
        ).order_by('-date')
        data = [
            {
                'date': str(r['date']),
                'total_reports': r['total_reports'] or 0,
                'total_executed': r['total_executed'] or 0,
                'total_passed': r['total_passed'] or 0,
                'total_defects_raised': r['total_defects_raised'] or 0,
            }
            for r in results
        ]
        return Response({'results': data})


class SummaryMeView(APIView):
    """GET /api/reports/summary/me - personal summary for current user."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = QAReport.objects.filter(user=request.user)
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        if date_from:
            qs = qs.filter(date__gte=date_from)
        if date_to:
            qs = qs.filter(date__lte=date_to)
        agg = qs.aggregate(
            total_reports=Count('id'),
            total_executed=Sum('total_test_cases_executed'),
            total_passed=Sum('test_cases_passed'),
            total_failed=Sum('test_cases_failed'),
            total_defects_raised=Sum('defects_raised'),
        )
        return Response({
            'total_reports': agg['total_reports'] or 0,
            'total_executed': agg['total_executed'] or 0,
            'total_passed': agg['total_passed'] or 0,
            'total_failed': agg['total_failed'] or 0,
            'total_defects_raised': agg['total_defects_raised'] or 0,
            'date_from': date_from,
            'date_to': date_to,
        })
