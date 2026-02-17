"""
Secure auth views: register (email, full_name, password only), login by email, refresh, logout (blacklist).
"""
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.throttling import AnonRateThrottle
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import serializers

from .serializers import RegisterSerializer, UserBriefSerializer
from .services import get_user_by_email
from common.permissions import IsAdminUser


# Rate limiting for auth (prevent brute force). Use scope so DRF looks up DEFAULT_THROTTLE_RATES.
class AuthThrottle(AnonRateThrottle):
    scope = 'auth'  # 5/minute from settings


class RegisterThrottle(AnonRateThrottle):
    scope = 'register'  # 3/hour from settings


class LoginSerializer(serializers.Serializer):
    """Accept email + password; return tokens + user (no user enumeration)."""
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})

    def validate(self, attrs):
        email = (attrs.get('email') or '').strip().lower()
        password = attrs.get('password')
        if not email or not password:
            raise serializers.ValidationError('Email and password are required.')
        user = get_user_by_email(email)
        if not user or not user.check_password(password):
            raise serializers.ValidationError('Invalid email or password.')
        if not user.is_active:
            raise serializers.ValidationError('Account is disabled.')
        refresh = RefreshToken.for_user(user)
        attrs['user'] = user
        attrs['access'] = str(refresh.access_token)
        attrs['refresh'] = str(refresh)
        return attrs


class LoginView(generics.GenericAPIView):
    """POST /api/auth/login - Body: { email, password }. Returns access_token, refresh_token, user."""
    permission_classes = [AllowAny]
    throttle_classes = [AuthThrottle]
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except serializers.ValidationError as e:
            msg = e.detail[0] if isinstance(e.detail, list) else str(e.detail)
            if 'Invalid' in msg or 'disabled' in msg.lower():
                return Response({'detail': 'Invalid email or password.'}, status=status.HTTP_401_UNAUTHORIZED)
            return Response({'detail': msg}, status=status.HTTP_400_BAD_REQUEST)
        data = serializer.validated_data
        return Response({
            'access_token': data['access'],
            'refresh_token': data['refresh'],
            'user': UserBriefSerializer(data['user']).data,
        })


class RegisterView(generics.CreateAPIView):
    """POST /api/auth/register - Body: { email, full_name, password }. Role is always QA_MEMBER."""
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
    throttle_classes = [RegisterThrottle]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            UserBriefSerializer(user).data,
            status=status.HTTP_201_CREATED,
        )


class LogoutView(generics.GenericAPIView):
    """POST /api/auth/logout - Body: { refresh }. Blacklists the refresh token when token_blacklist is installed."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh = request.data.get('refresh')
        if not refresh:
            return Response({'detail': 'Refresh token required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            token = RefreshToken(refresh)
            if hasattr(token, 'blacklist'):
                token.blacklist()
        except Exception:
            pass
        return Response(status=status.HTTP_200_OK)


class UserListView(generics.ListAPIView):
    """GET /api/auth/users/ - List users (Admin only, for filter dropdowns)."""
    from django.contrib.auth import get_user_model
    queryset = get_user_model().objects.all().order_by('email')
    serializer_class = UserBriefSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

