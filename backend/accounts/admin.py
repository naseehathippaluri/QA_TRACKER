from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth import get_user_model
from .models import UserProfile

User = get_user_model()


class AdminEmailLoginForm(AuthenticationForm):
    """Django admin login: show "Email" instead of "Username" (backend accepts email in username field)."""
    def __init__(self, request=None, *args, **kwargs):
        super().__init__(request=request, *args, **kwargs)
        self.fields['username'].label = 'Email'
        self.fields['username'].widget.attrs.setdefault('placeholder', 'Email address')


# Use email-based login form for admin portal
admin.site.login_form = AdminEmailLoginForm


class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False


# Unregister default User admin and re-register with profile inline
admin.site.unregister(User)


@admin.register(User)
class CustomUserAdmin(BaseUserAdmin):
    inlines = (UserProfileInline,)
