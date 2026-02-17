"""
QA Report model - daily metrics per user per project per date.
"""
from django.db import models
from django.conf import settings


class QAReport(models.Model):
    objects = models.Manager()

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='qa_reports',
    )
    project = models.ForeignKey(
        'projects.Project',
        on_delete=models.CASCADE,
        related_name='qa_reports',
    )
    date = models.DateField()

    # Execution metrics
    total_test_cases_written = models.PositiveIntegerField(default=0)
    total_test_cases_reviewed = models.PositiveIntegerField(default=0)
    total_test_cases_executed = models.PositiveIntegerField(default=0)
    test_cases_passed = models.PositiveIntegerField(default=0)
    test_cases_failed = models.PositiveIntegerField(default=0)
    test_cases_blocked = models.PositiveIntegerField(default=0)
    test_cases_in_progress = models.PositiveIntegerField(default=0)
    test_cases_future_execution = models.PositiveIntegerField(default=0)
    test_cases_invalid = models.PositiveIntegerField(default=0)
    retested_qa_review_tickets = models.PositiveIntegerField(default=0)

    # Defect tracking
    total_defects_found = models.PositiveIntegerField(default=0)
    defects_raised = models.PositiveIntegerField(default=0)
    ticket_number_with_priority = models.CharField(max_length=500, blank=True)

    # Observations
    total_observations = models.PositiveIntegerField(default=0)
    observations_found = models.PositiveIntegerField(default=0)

    comments_remarks = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'reports_qareport'
        ordering = ['-date', '-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'project', 'date'],
                name='unique_user_project_date',
            )
        ]
        indexes = [
            models.Index(fields=['user', 'date']),
            models.Index(fields=['project', 'date']),
            models.Index(fields=['date']),
        ]

    def __str__(self) -> str:
        username = getattr(self.user, 'username', '')
        project_name = getattr(self.project, 'name', '')
        return f'Report {self.id} - {username} - {project_name} - {self.date}'
