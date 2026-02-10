from rest_framework import serializers
from .models import WorkLog
from .validators import validate_execution_breakdown
from accounts.validators import sanitize_string


class WorkLogSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    feature_name = serializers.CharField(source='feature.name', read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True, allow_null=True)
    assigned_to_username = serializers.CharField(source='assigned_to.username', read_only=True, allow_null=True)

    class Meta:
        model = WorkLog
        fields = (
            'id', 'user', 'user_username', 'feature', 'feature_name', 'project', 'project_name',
            'date', 'assigned_to', 'assigned_to_username',
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
            'id', 'user', 'user_username', 'feature_name', 'project_name', 'assigned_to_username',
            'created_at', 'updated_at',
        )

    def validate(self, data):
        request = self.context.get('request')
        if request and getattr(request.user, 'profile', None) and request.user.profile.role != 'ADMIN':
            data.pop('assigned_to', None)
        if data.get('comments') is not None:
            data['comments'] = sanitize_string(data['comments'], max_length=10000)
        if data.get('ticket_number_with_priority') is not None:
            data['ticket_number_with_priority'] = sanitize_string(data['ticket_number_with_priority'], max_length=500)
        validate_execution_breakdown(data)
        user = request.user
        feature = data.get('feature') or (self.instance and self.instance.feature)
        date = data.get('date') or (self.instance and self.instance.date)
        if not feature or not date:
            return data
        qs = WorkLog.objects.filter(user=user, feature=feature, date=date)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError(
                {'non_field_errors': ['A work log for this user and feature on this date already exists.']}
            )
        return data
