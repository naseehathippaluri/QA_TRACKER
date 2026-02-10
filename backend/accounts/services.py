"""
Authentication service layer: user creation, login resolution.
Keeps auth logic out of views and avoids exposing internal fields.
"""
from django.contrib.auth import get_user_model
from django.db import transaction

from .models import UserProfile

User = get_user_model()

# Role constants - only QA_MEMBER assignable via signup; ADMIN only via superuser/admin
ROLE_QA_MEMBER = 'QA_MEMBER'
ROLE_ADMIN = 'ADMIN'


def create_qa_member_user(*, email: str, full_name: str, password: str):
    """
    Create a new user with role QA_MEMBER. Used only by signup.
    Email is used as username for Django compatibility (unique).
    """
    if User.objects.filter(email__iexact=email).exists():
        raise ValueError('A user with this email already exists.')
    # Use email as username to satisfy unique username; normalize for uniqueness
    username = email.strip().lower()[:150]
    if User.objects.filter(username=username).exists():
        # Collision (e.g. different case): append id or use email hash
        base = username
        for i in range(1000):
            candidate = f"{base}_{i}" if i else base
            if not User.objects.filter(username=candidate).exists():
                username = candidate
                break
    with transaction.atomic():
        user = User.objects.create_user(
            username=username,
            email=email.strip().lower(),
            password=password,
        )
        user.is_active = True
        user.is_staff = False
        user.is_superuser = False
        user.save()
        UserProfile.objects.create(
            user=user,
            role=ROLE_QA_MEMBER,
            full_name=(full_name or '').strip()[:255],
        )
    return user


def get_user_by_email(email: str):
    """Get user by email (case-insensitive). Returns None if not found."""
    if not email or not isinstance(email, str):
        return None
    return User.objects.filter(email__iexact=email.strip()).first()
