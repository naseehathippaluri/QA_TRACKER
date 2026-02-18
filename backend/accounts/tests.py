"""
Security tests: no privilege escalation, duplicate signup, password strength, token, role, company email domain.
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from django.core.exceptions import ValidationError

from .models import UserProfile
from .validators import validate_password_strength, validate_company_email

User = get_user_model()

COMPANY_EMAIL = 'user@ideyalabs.com'
COMPANY_EMAIL_UPPER = 'USER@IDEYALABS.COM'
PASSWORD_STRONG = 'SecurePass1!'


class PasswordStrengthTests(TestCase):
    def test_weak_password_rejected(self):
        for pwd in ('short', 'nouppercase1!', 'NOLOWERCASE1!', 'NoDigit!', 'NoSpecial1'):
            with self.assertRaises(ValidationError):
                validate_password_strength(pwd)

    def test_strong_password_accepted(self):
        validate_password_strength('SecurePass1!')
        validate_password_strength('Abcd1234@')


class CompanyEmailValidatorTests(TestCase):
    """Only @ideyalabs.com emails allowed (case-insensitive)."""

    def test_allow_ideyalabs_com(self):
        validate_company_email('user@ideyalabs.com')
        self.assertEqual(validate_company_email('user@ideyalabs.com'), 'user@ideyalabs.com')

    def test_allow_ideyalabs_com_uppercase(self):
        validate_company_email('USER@IDEYALABS.COM')
        self.assertEqual(validate_company_email('USER@IDEYALABS.COM'), 'user@ideyalabs.com')

    def test_reject_other_domains(self):
        for email in ('user@gmail.com', 'user@yahoo.com', 'user@ideyalabs.co', 'user@fakeideyalabs.com'):
            with self.assertRaises(ValidationError) as ctx:
                validate_company_email(email)
            self.assertIn('ideyalabs.com', str(ctx.exception))


class RegisterSecurityTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_signup_assigns_qa_member_only(self):
        r = self.client.post('/api/auth/register', {
            'email': COMPANY_EMAIL,
            'full_name': 'QA User',
            'password': PASSWORD_STRONG,
        }, format='json')
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        self.assertIn('role', r.data)
        self.assertEqual(r.data['role'], 'QA_MEMBER')
        self.assertNotIn('username', r.data)

    def test_signup_ignores_role_in_body(self):
        r = self.client.post('/api/auth/register', {
            'email': 'hacker@ideyalabs.com',
            'full_name': 'Hacker',
            'password': PASSWORD_STRONG,
            'role': 'ADMIN',
        }, format='json')
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(email='hacker@ideyalabs.com')
        self.assertEqual(user.profile.role, 'QA_MEMBER')

    def test_duplicate_email_rejected(self):
        self.client.post('/api/auth/register', {
            'email': 'dup@ideyalabs.com',
            'full_name': 'First',
            'password': PASSWORD_STRONG,
        }, format='json')
        r = self.client.post('/api/auth/register', {
            'email': 'dup@ideyalabs.com',
            'full_name': 'Second',
            'password': 'OtherPass1!',
        }, format='json')
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_password_rejected(self):
        r = self.client.post('/api/auth/register', {
            'email': 'weak@ideyalabs.com',
            'full_name': 'User',
            'password': 'weak',
        }, format='json')
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_signup_rejects_non_company_email(self):
        r = self.client.post('/api/auth/register', {
            'email': 'user@gmail.com',
            'full_name': 'User',
            'password': PASSWORD_STRONG,
        }, format='json')
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', r.data)
        self.assertIn('ideyalabs.com', str(r.data['email']))


class LoginSecurityTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='logintest', email='login@ideyalabs.com', password=PASSWORD_STRONG
        )
        UserProfile.objects.create(user=self.user, role='QA_MEMBER')

    def test_login_requires_email_and_password(self):
        r = self.client.post('/api/auth/login', {'email': 'login@ideyalabs.com'}, format='json')
        self.assertIn(r.status_code, (status.HTTP_400_BAD_REQUEST, status.HTTP_401_UNAUTHORIZED))

    def test_login_returns_access_and_refresh_and_user(self):
        r = self.client.post('/api/auth/login', {
            'email': 'login@ideyalabs.com',
            'password': PASSWORD_STRONG,
        }, format='json')
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertIn('access_token', r.data)
        self.assertIn('refresh_token', r.data)
        self.assertIn('user', r.data)
        self.assertEqual(r.data['user']['email'], 'login@ideyalabs.com')
        self.assertEqual(r.data['user']['role'], 'QA_MEMBER')

    def test_login_rejects_non_company_email(self):
        r = self.client.post('/api/auth/login', {
            'email': 'user@gmail.com',
            'password': 'any',
        }, format='json')
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', r.data)
        self.assertIn('ideyalabs.com', str(r.data['email']))

    def test_invalid_login_same_message(self):
        r1 = self.client.post('/api/auth/login', {
            'email': 'nonexistent@ideyalabs.com', 'password': 'wrong',
        }, format='json')
        r2 = self.client.post('/api/auth/login', {
            'email': 'login@ideyalabs.com', 'password': 'wrong',
        }, format='json')
        self.assertEqual(r1.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(r2.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(r1.data.get('detail'), r2.data.get('detail'))
