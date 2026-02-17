"""
Project model for QA reporting.
"""
from django.db import models


class Project(models.Model):
    objects = models.Manager()

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('archived', 'Archived'),
    ]
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'projects_project'
        ordering = ['name']
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['status']),
        ]

    def __str__(self) -> str:
        return str(self.name)
