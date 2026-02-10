"""
Role-based access control for accounts and auth.
QA_MEMBER: create/edit/view own work logs.
ADMIN: view all work logs, assign, manage features, analytics, export.
Admin users are only created via Django admin / createsuperuser; never via signup API.
"""
from rest_framework import permissions

from common.permissions import IsAdminUser, IsOwnerOrAdmin

__all__ = ['IsAdminUser', 'IsOwnerOrAdmin', 'IsQAMemberOrAdmin']


def is_admin(user):
    return getattr(user, 'profile', None) and getattr(user.profile, 'role', None) == 'ADMIN'


def is_qa_member(user):
    return getattr(user, 'profile', None) and getattr(user.profile, 'role', None) == 'QA_MEMBER'


class IsQAMemberOrAdmin(permissions.BasePermission):
    """Allow QA_MEMBER and ADMIN (any authenticated user with profile)."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return getattr(request.user, 'profile', None) is not None
