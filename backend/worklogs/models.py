"""
Work Log model - daily metrics per user per feature per date.
Feature required; Project optional. assigned_to for admin assignment.
"""
from django.db import models
from django.conf import settings


class WorkLog(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='worklogs',
    )
    feature = models.ForeignKey(
        'features.Feature',
        on_delete=models.CASCADE,
        related_name='worklogs',
    )
    project = models.ForeignKey(
        'projects.Project',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='worklogs',
    )
    date = models.DateField()
    # Admin-only: assign work log to a user (e.g. for reassignment)
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_worklogs',
    )

    # Test execution metrics (no "total_" prefix)
    test_cases_written = models.PositiveIntegerField(default=0)
    test_cases_reviewed = models.PositiveIntegerField(default=0)
    test_cases_executed = models.PositiveIntegerField(default=0)
    test_cases_passed = models.PositiveIntegerField(default=0)
    test_cases_failed = models.PositiveIntegerField(default=0)
    test_cases_blocked = models.PositiveIntegerField(default=0)
    test_cases_in_progress = models.PositiveIntegerField(default=0)
    test_cases_future_execution = models.PositiveIntegerField(default=0)
    test_cases_invalid = models.PositiveIntegerField(default=0)
    retested_qa_review_tickets = models.PositiveIntegerField(default=0)

    # Defects
    defects_raised = models.PositiveIntegerField(default=0)
    ticket_number_with_priority = models.CharField(max_length=500, blank=True)

    # Observations
    observations_found = models.PositiveIntegerField(default=0)

    # Additional
    comments = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'worklogs_worklog'
        ordering = ['-date', '-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'feature', 'date'],
                name='unique_user_feature_date',
            )
        ]
        indexes = [
            models.Index(fields=['user', 'date']),
            models.Index(fields=['feature', 'date']),
            models.Index(fields=['date']),
        ]

    def __str__(self):
        return f'WorkLog {self.id} - {self.user.username} - {self.feature.name} - {self.date}'
