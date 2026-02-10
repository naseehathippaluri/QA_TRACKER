"""
Custom auth backend: authenticate by email (case-insensitive) and password.
"""
from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend

User = get_user_model()


class EmailAuthBackend(ModelBackend):
    """Authenticate using email and password."""

    def authenticate(self, request, username=None, password=None, **kwargs):
        # Simple JWT sends 'username' and 'password'; we accept email as username
        email = kwargs.get('email') or username
        if not email or not password:
            return None
        user = User.objects.filter(email__iexact=email.strip()).first()
        if user and user.check_password(password):
            return user
        # Do not reveal whether email exists (prevent user enumeration)
        return None
