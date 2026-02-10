"""
Security validators: password strength, email, input sanitization.
"""
import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _


# Password must: min 8 chars, uppercase, lowercase, number, special character
PASSWORD_REGEX = re.compile(
    r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=[\]{};:\'",.<>?/\\|`~])[A-Za-z\d!@#$%^&*()_\-+=[\]{};:\'",.<>?/\\|`~]{8,}$'
)


def validate_password_strength(password):
    """Enforce: min 8, uppercase, lowercase, number, special char."""
    if len(password) < 8:
        raise ValidationError(
            _('Password must be at least 8 characters long.'),
            code='password_too_short',
        )
    if not re.search(r'[A-Z]', password):
        raise ValidationError(
            _('Password must contain at least one uppercase letter.'),
            code='password_no_upper',
        )
    if not re.search(r'[a-z]', password):
        raise ValidationError(
            _('Password must contain at least one lowercase letter.'),
            code='password_no_lower',
        )
    if not re.search(r'\d', password):
        raise ValidationError(
            _('Password must contain at least one number.'),
            code='password_no_digit',
        )
    if not re.search(r'[!@#$%^&*()_\-+=[\]{};\':",.<>?/\\|`~]', password):
        raise ValidationError(
            _('Password must contain at least one special character (!@#$%^&* etc.).'),
            code='password_no_special',
        )
    return password


class PasswordStrengthValidator:
    """Django AUTH_PASSWORD_VALIDATORS compatible class."""
    def validate(self, password, user=None):
        validate_password_strength(password)

    def get_help_text(self):
        return _(
            'Password must be 8+ characters with uppercase, lowercase, number and special character.'
        )


def sanitize_string(value, max_length=500):
    """
    Sanitize for XSS: strip script tags and control chars.
    Use for comments, ticket numbers, feature names.
    """
    if value is None or not isinstance(value, str):
        return value
    # Remove null bytes and control characters
    value = ''.join(c for c in value if ord(c) >= 32 or c in '\n\r\t')
    # Strip potential script/content tags (simple)
    value = re.sub(r'<[^>]*>', '', value)
    return value[:max_length] if max_length else value
