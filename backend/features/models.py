"""
Feature model - unique name, created_by for audit.
"""
from django.db import models
from django.conf import settings


class Feature(models.Model):
    objects = models.Manager()

    name = models.CharField(max_length=255, unique=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_features',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'features_feature'
        ordering = ['name']

    def __str__(self) -> str:
        return str(self.name)
