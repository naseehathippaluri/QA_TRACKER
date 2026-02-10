"""
Security tests: no privilege escalation, duplicate signup, password strength, token, role.
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

from .models import UserProfile
from .validators import validate_password_strength
from django.core.exceptions import ValidationError

User = get_user_model()


class PasswordStrengthTests(TestCase):
    def test_weak_password_rejected(self):
        for pwd in ('short', 'nouppercase1!', 'NOLOWERCASE1!', 'NoDigit!', 'NoSpecial1'):
            with self.assertRaises(ValidationError):
                validate_password_strength(pwd)

    def test_strong_password_accepted(self):
        validate_password_strength('SecurePass1!')
        validate_password_strength('Abcd1234@')


class RegisterSecurityTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_signup_assigns_qa_member_only(self):
        r = self.client.post('/api/auth/register', {
            'email': 'qa@test.com',
            'full_name': 'QA User',
            'password': 'SecurePass1!',
        }, format='json')
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        self.assertIn('role', r.data)
        self.assertEqual(r.data['role'], 'QA_MEMBER')
        self.assertNotIn('username', r.data)

    def test_signup_ignores_role_in_body(self):
        r = self.client.post('/api/auth/register', {
            'email': 'hacker@test.com',
            'full_name': 'Hacker',
            'password': 'SecurePass1!',
            'role': 'ADMIN',
        }, format='json')
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(email='hacker@test.com')
        self.assertEqual(user.profile.role, 'QA_MEMBER')

    def test_duplicate_email_rejected(self):
        self.client.post('/api/auth/register', {
            'email': 'dup@test.com',
            'full_name': 'First',
            'password': 'SecurePass1!',
        }, format='json')
        r = self.client.post('/api/auth/register', {
            'email': 'dup@test.com',
            'full_name': 'Second',
            'password': 'OtherPass1!',
        }, format='json')
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_password_rejected(self):
        r = self.client.post('/api/auth/register', {
            'email': 'weak@test.com',
            'full_name': 'User',
            'password': 'weak',
        }, format='json')
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)


class LoginSecurityTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='logintest', email='login@test.com', password='SecurePass1!')
        UserProfile.objects.create(user=self.user, role='QA_MEMBER')

    def test_login_requires_email_and_password(self):
        r = self.client.post('/api/auth/login', {'email': 'login@test.com'}, format='json')
        self.assertIn(r.status_code, (status.HTTP_400_BAD_REQUEST, status.HTTP_401_UNAUTHORIZED))

    def test_login_returns_access_and_refresh_and_user(self):
        r = self.client.post('/api/auth/login', {
            'email': 'login@test.com',
            'password': 'SecurePass1!',
        }, format='json')
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertIn('access_token', r.data)
        self.assertIn('refresh_token', r.data)
        self.assertIn('user', r.data)
        self.assertEqual(r.data['user']['email'], 'login@test.com')
        self.assertEqual(r.data['user']['role'], 'QA_MEMBER')

    def test_invalid_login_same_message(self):
        r1 = self.client.post('/api/auth/login', {'email': 'nonexistent@test.com', 'password': 'wrong'}, format='json')
        r2 = self.client.post('/api/auth/login', {'email': 'login@test.com', 'password': 'wrong'}, format='json')
        self.assertEqual(r1.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(r2.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(r1.data.get('detail'), r2.data.get('detail'))
