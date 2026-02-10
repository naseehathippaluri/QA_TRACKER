"""
QA Report serializers with validation.
"""
from rest_framework import serializers
from .models import QAReport
from .validators import validate_execution_breakdown


class QAReportSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)

    class Meta:
        model = QAReport
        fields = (
            'id', 'user', 'user_username', 'project', 'project_name', 'date',
            'total_test_cases_written', 'total_test_cases_reviewed', 'total_test_cases_executed',
            'test_cases_passed', 'test_cases_failed', 'test_cases_blocked',
            'test_cases_in_progress', 'test_cases_future_execution', 'test_cases_invalid',
            'retested_qa_review_tickets',
            'total_defects_found', 'defects_raised', 'ticket_number_with_priority',
            'total_observations', 'observations_found',
            'comments_remarks',
            'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'user', 'user_username', 'project_name', 'created_at', 'updated_at')

    def validate(self, data):
        validate_execution_breakdown(data)
        user = self.context.get('request').user
        project = data.get('project') or (self.instance and self.instance.project)
        date = data.get('date') or (self.instance and self.instance.date)
        if not project or not date:
            return data
        qs = QAReport.objects.filter(user=user, project=project, date=date)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError(
                {'non_field_errors': ['A report for this user and project on this date already exists.']}
            )
        return data
