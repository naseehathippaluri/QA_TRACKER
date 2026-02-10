"""Admin can create/update/delete; all authenticated can view."""
from rest_framework import permissions
from common.permissions import IsAdminUser


class IsFeatureAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return IsAdminUser().has_permission(request, view)
