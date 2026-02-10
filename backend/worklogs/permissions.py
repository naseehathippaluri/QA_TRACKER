"""QA: own work logs. Admin: full access + assign."""
from rest_framework import permissions
from common.permissions import IsAdminUser, IsOwnerOrAdmin


def can_assign_worklog(request, obj=None):
    """Only admin can set assigned_to."""
    return IsAdminUser().has_permission(request, None)
