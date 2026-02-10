"""
Shared permission classes for role-based access.
"""
from rest_framework import permissions


def _get_user_role(user):
    """Safe role lookup; avoids 500 when user has no UserProfile."""
    if not user or not user.is_authenticated:
        return None
    try:
        return user.profile.role
    except Exception:
        return None


class IsAdminUser(permissions.BasePermission):
    """Only users with role ADMIN can access."""

    def has_permission(self, request, view):
        return _get_user_role(request.user) == 'ADMIN'


class IsOwnerOrAdmin(permissions.BasePermission):
    """Allow access if user is the object owner or Admin."""

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if _get_user_role(request.user) == 'ADMIN':
            return True
        owner = getattr(obj, 'user', None)
        return owner == request.user
