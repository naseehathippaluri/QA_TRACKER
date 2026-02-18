from django.utils import timezone
from rest_framework import serializers
from .models import WorkLog, PROJECT_CHOICES
from .validators import validate_execution_breakdown
from accounts.validators import sanitize_string

VALID_PROJECTS = {c[0] for c in PROJECT_CHOICES}


class WorkLogSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    feature_name = serializers.CharField(source='feature.name', read_only=True)
    project_name = serializers.CharField(source='project', read_only=True, allow_null=True)

    class Meta:
        model = WorkLog
        fields = (
            'id', 'user', 'user_username', 'feature', 'feature_name', 'project', 'project_name',
            'date',
            'test_cases_written', 'test_cases_reviewed', 'test_cases_executed',
            'test_cases_passed', 'test_cases_failed', 'test_cases_blocked',
            'test_cases_in_progress', 'test_cases_future_execution', 'test_cases_invalid',
            'retested_qa_review_tickets',
            'defects_raised', 'ticket_number_with_priority',
            'observations_found',
            'comments',
            'created_at', 'updated_at',
        )
        read_only_fields = (
            'id', 'user', 'user_username', 'feature_name', 'project_name',
            'created_at', 'updated_at',
        )

    def validate(self, data):
        request = self.context.get('request')
        if not request:
            return data
        today = timezone.now().date()
        date = data.get('date') or (self.instance and getattr(self.instance, 'date', None))
        if date and date > today:
            raise serializers.ValidationError({'date': ['Future dates are not allowed.']})
        project = data.get('project') if 'project' in data else (getattr(self.instance, 'project', None) if self.instance else None)
        if not project or project not in VALID_PROJECTS:
            raise serializers.ValidationError({'project': ['Please select a project (TOO or TFA).']})
        data['project'] = project
        if data.get('comments') is not None:
            data['comments'] = sanitize_string(data['comments'], max_length=10000)
        if data.get('ticket_number_with_priority') is not None:
            data['ticket_number_with_priority'] = sanitize_string(data['ticket_number_with_priority'], max_length=500)
        validate_execution_breakdown(data)
        user = request.user
        project = data.get('project')
        feature = data.get('feature') or (self.instance and self.instance.feature)
        date = data.get('date') or (self.instance and self.instance.date)
        if not all([project, feature, date]):
            return data
        qs = WorkLog.objects.filter(user=user, project=project, feature=feature, date=date)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError(
                {'non_field_errors': ['A work log for this user, project, and feature on this date already exists.']}
            )
        return data
