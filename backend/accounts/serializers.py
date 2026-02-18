"""
Secure auth serializers: signup (email, full_name, password only), user representation.
Role is never accepted from client; QA_MEMBER assigned on signup only.
"""
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from .models import UserProfile
from .validators import validate_password_strength, validate_company_email, sanitize_string
from .services import create_qa_member_user

User = get_user_model()


class UserProfileSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source='profile.role', read_only=True)
    full_name = serializers.CharField(source='profile.full_name', read_only=True)

    class Meta:
        model = User
        fields = ('id', 'email', 'full_name', 'role')
        read_only_fields = ('id', 'email', 'full_name', 'role')


class RegisterSerializer(serializers.Serializer):
    """Signup: email, full_name, password only. Role is always QA_MEMBER."""
    email = serializers.EmailField(write_only=True, max_length=254)
    full_name = serializers.CharField(write_only=True, max_length=255, required=False, default='')
    password = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})

    def validate_email(self, value):
        email = (value or '').strip().lower()
        try:
            validate_company_email(email)
        except DjangoValidationError as e:
            msgs = getattr(e, 'messages', None) or [str(e)]
            if not isinstance(msgs, list):
                msgs = [msgs]
            raise serializers.ValidationError({'email': msgs})
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError({'email': ['A user with this email already exists.']})
        return email

    def validate_password(self, value):
        validate_password_strength(value)
        return value

    def validate_full_name(self, value):
        return sanitize_string(value or '', max_length=255)

    def create(self, validated_data):
        try:
            return create_qa_member_user(
                email=validated_data['email'],
                full_name=validated_data.get('full_name', ''),
                password=validated_data['password'],
            )
        except ValueError as e:
            raise serializers.ValidationError(str(e))


class UserBriefSerializer(serializers.ModelSerializer):
    """API user representation: id, email, role, full_name. No username or internal fields."""
    role = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'email', 'role', 'full_name')
        read_only_fields = ('id', 'email', 'role', 'full_name')

    def get_role(self, obj):
        try:
            return obj.profile.role
        except Exception:
            return None

    def get_full_name(self, obj):
        try:
            return obj.profile.full_name or ''
        except Exception:
            return ''
