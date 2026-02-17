"""
Dashboard APIs: summary, analytics, export to Excel.
Filters: date range, feature, user (Admin only).
"""
from django.db.models import Sum, Count
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from features.models import Feature
from worklogs.models import WorkLog
from common.permissions import IsAdminUser


def _user_role(request):
    """Safe role lookup; avoids 500 when user has no UserProfile."""
    if not request.user or not request.user.is_authenticated:
        return None
    try:
        return request.user.profile.role
    except Exception:
        return None


def _worklog_queryset(request):
    qs = WorkLog.objects.all()
    if _user_role(request) != 'ADMIN':
        qs = qs.filter(user=request.user)
    date_from = request.query_params.get('date_from')
    date_to = request.query_params.get('date_to')
    if date_from:
        qs = qs.filter(date__gte=date_from)
    if date_to:
        qs = qs.filter(date__lte=date_to)
    feature_id = request.query_params.get('feature')
    if feature_id:
        qs = qs.filter(feature_id=feature_id)
    user_id = request.query_params.get('user')
    if user_id and _user_role(request) == 'ADMIN':
        qs = qs.filter(user_id=user_id)
    return qs


class DashboardSummaryView(APIView):
    """GET /api/dashboard/summary - Total Features, Work Logs, TCs, Defects, etc."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = _worklog_queryset(request)
        agg = qs.aggregate(
            total_work_logs=Count('id'),
            total_test_cases_written=Sum('test_cases_written'),
            total_test_cases_executed=Sum('test_cases_executed'),
            total_passed=Sum('test_cases_passed'),
            total_failed=Sum('test_cases_failed'),
            total_observations_found=Sum('observations_found'),
            total_qa_review_tickets=Sum('retested_qa_review_tickets'),
            total_defects_raised=Sum('defects_raised'),
        )
        total_features = Feature.objects.count()
        if _user_role(request) != 'ADMIN':
            total_features = Feature.objects.filter(
                id__in=qs.values_list('feature_id', flat=True).distinct()
            ).count()
        return Response({
            'total_features': total_features,
            'total_work_logs': agg['total_work_logs'] or 0,
            'total_test_cases_written': agg['total_test_cases_written'] or 0,
            'total_test_cases_executed': agg['total_test_cases_executed'] or 0,
            'total_passed': agg['total_passed'] or 0,
            'total_failed': agg['total_failed'] or 0,
            'total_observations_found': agg['total_observations_found'] or 0,
            'total_qa_review_tickets': agg['total_qa_review_tickets'] or 0,
            'total_defects_raised': agg['total_defects_raised'] or 0,
        })


class DashboardAnalyticsView(APIView):
    """
    GET /api/dashboard/analytics - Graph datasets (Admin only).
    Returns: defects_trend, test_cases_executed (TCE), test_cases_written (TCW), jira_tickets_raised.
    """
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        qs = _worklog_queryset(request)
        by_date = list(qs.values('date').annotate(
            defects_raised=Sum('defects_raised'),
            test_cases_executed=Sum('test_cases_executed'),
            test_cases_written=Sum('test_cases_written'),
        ).order_by('date'))
        # defects_raised and jira_tickets_raised use the same metric (defects raised)
        defects_trend = [{'date': str(r['date']), 'count': (r['defects_raised'] or 0)} for r in by_date]
        tce = [{'date': str(r['date']), 'count': (r['test_cases_executed'] or 0)} for r in by_date]
        tcw = [{'date': str(r['date']), 'count': (r['test_cases_written'] or 0)} for r in by_date]
        jira_issues = [{'date': str(r['date']), 'count': (r['defects_raised'] or 0)} for r in by_date]
        return Response({
            'defects_trend': defects_trend,
            'test_cases_executed': tce,
            'test_cases_written': tcw,
            'jira_tickets_raised': jira_issues,
        })


class DashboardAnalyticsSummaryView(APIView):
    """
    GET /api/dashboard/analytics/summary - Aggregated totals for Analytics pie charts (Admin only).
    Query params: date_from, date_to (optional: user).
    Returns: written, executed, passed, failed, defects.
    """
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        qs = _worklog_queryset(request)
        agg = qs.aggregate(
            written=Sum('test_cases_written'),
            executed=Sum('test_cases_executed'),
            passed=Sum('test_cases_passed'),
            failed=Sum('test_cases_failed'),
            defects=Sum('defects_raised'),
        )
        return Response({
            'written': agg['written'] or 0,
            'executed': agg['executed'] or 0,
            'passed': agg['passed'] or 0,
            'failed': agg['failed'] or 0,
            'defects': agg['defects'] or 0,
        })


class DashboardExportView(APIView):
    """GET /api/dashboard/export - Excel export of work logs (Admin only). Optional: date_from, date_to, feature, user."""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        try:
            from openpyxl import Workbook
        except ImportError:
            return Response(
                {'detail': 'Excel export requires openpyxl. Install with: pip install openpyxl'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        qs = _worklog_queryset(request).select_related('user', 'feature')
        qs = qs.order_by('-date', '-created_at')
        wb = Workbook()
        ws = wb.active
        ws.title = 'Work Logs'
        headers = [
            'Date', 'User', 'Feature', 'Project', 'Test Cases Written', 'Test Cases Executed',
            'Passed', 'Failed', 'Defects Raised', 'Observations', 'Comments',
        ]
        for col, h in enumerate(headers, 1):
            ws.cell(row=1, column=col, value=h)
        for row, wl in enumerate(qs, 2):
            ws.cell(row=row, column=1, value=str(wl.date))
            user_email = getattr(wl.user, 'email', '') or getattr(wl.user, 'username', '')
            ws.cell(row=row, column=2, value=user_email)
            ws.cell(row=row, column=3, value=getattr(wl.feature, 'name', ''))
            ws.cell(row=row, column=4, value=wl.project or '')
            ws.cell(row=row, column=5, value=wl.test_cases_written)
            ws.cell(row=row, column=6, value=wl.test_cases_executed)
            ws.cell(row=row, column=7, value=wl.test_cases_passed)
            ws.cell(row=row, column=8, value=wl.test_cases_failed)
            ws.cell(row=row, column=9, value=wl.defects_raised)
            ws.cell(row=row, column=10, value=wl.observations_found)
            ws.cell(row=row, column=11, value=(wl.comments or '')[:32000])
        response = HttpResponse(
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        )
        response['Content-Disposition'] = 'attachment; filename=worklogs_export.xlsx'
        wb.save(response)
        return response
