"""
User profile: role (QA_MEMBER | ADMIN) and full_name.
Role QA_MEMBER is assigned on signup; ADMIN only via Django admin / createsuperuser.
"""
from django.db import models
from django.conf import settings


class UserProfile(models.Model):
    objects = models.Manager()

    ROLE_QA_MEMBER = 'QA_MEMBER'
    ROLE_ADMIN = 'ADMIN'
    ROLE_CHOICES = [
        (ROLE_QA_MEMBER, 'QA Member'),
        (ROLE_ADMIN, 'Admin'),
    ]
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='profile',
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=ROLE_QA_MEMBER)
    full_name = models.CharField(max_length=255, blank=True)

    class Meta:
        db_table = 'accounts_userprofile'

    def __str__(self) -> str:
        username = getattr(self.user, 'username', '')
        return f'{username} ({self.role})'
