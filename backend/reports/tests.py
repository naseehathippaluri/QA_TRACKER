"""
Unit and API tests for reports app.
"""
from django.test import TestCase, override_settings
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from .models import QAReport
from projects.models import Project
from accounts.models import UserProfile

User = get_user_model()


@override_settings(
    REST_FRAMEWORK={
        'DEFAULT_AUTHENTICATION_CLASSES': ('rest_framework_simplejwt.authentication.JWTAuthentication',),
        'DEFAULT_PERMISSION_CLASSES': ('rest_framework.permissions.IsAuthenticated',),
    }
)
class QAReportModelTest(TestCase):
    """Model validation and uniqueness."""

    def setUp(self):
        self.user = User.objects.create_user(username='qa1', password='testpass123')
        UserProfile.objects.create(user=self.user, role='QA_MEMBER')
        self.project = Project.objects.create(name='Proj A', status='active')

    def test_create_report(self):
        report = QAReport.objects.create(
            user=self.user,
            project=self.project,
            date='2025-02-04',
            total_test_cases_executed=10,
            test_cases_passed=8,
            test_cases_failed=2,
        )
        self.assertEqual(report.user, self.user)
        self.assertEqual(report.project, self.project)
        self.assertEqual(report.total_test_cases_executed, 10)

    def test_unique_user_project_date(self):
        QAReport.objects.create(
            user=self.user,
            project=self.project,
            date='2025-02-04',
            total_test_cases_executed=5,
        )
        with self.assertRaises(Exception):
            QAReport.objects.create(
                user=self.user,
                project=self.project,
                date='2025-02-04',
                total_test_cases_executed=3,
            )


class QAReportAPITest(TestCase):
    """API endpoint tests (auth, create, list, validation)."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='qa2', email='qa2@test.com', password='testpass123')
        UserProfile.objects.create(user=self.user, role='QA_MEMBER')
        self.project = Project.objects.create(name='Proj B', status='active')
        self.admin_user = User.objects.create_user(username='admin1', email='admin1@test.com', password='adminpass123')
        UserProfile.objects.create(user=self.admin_user, role='ADMIN')

    def _login(self, email='qa2@test.com', password='testpass123'):
        resp = self.client.post('/api/auth/login', {'email': email, 'password': password}, format='json')
        if resp.status_code == 200:
            self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {resp.data["access_token"]}')
        return resp

    def test_register_and_login(self):
        resp = self.client.post('/api/auth/register', {
            'email': 'new@test.com',
            'full_name': 'New User',
            'password': 'SecurePass123!',
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data['email'], 'new@test.com')
        self.assertEqual(resp.data['role'], 'QA_MEMBER')

        resp2 = self.client.post('/api/auth/login', {'email': 'new@test.com', 'password': 'SecurePass123!'}, format='json')
        self.assertEqual(resp2.status_code, status.HTTP_200_OK)
        self.assertIn('access_token', resp2.data)
        self.assertIn('user', resp2.data)

    def test_create_report_requires_auth(self):
        resp = self.client.post('/api/reports/', {
            'project': self.project.id,
            'date': '2025-02-04',
            'total_test_cases_executed': 5,
            'test_cases_passed': 5,
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_report_success(self):
        self._login()
        resp = self.client.post('/api/reports/', {
            'project': self.project.id,
            'date': '2025-02-04',
            'total_test_cases_executed': 10,
            'test_cases_passed': 8,
            'test_cases_failed': 2,
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data['user'], self.user.id)
        self.assertEqual(resp.data['total_test_cases_executed'], 10)

    def test_create_report_validation_sum_constraint(self):
        self._login()
        resp = self.client.post('/api/reports/', {
            'project': self.project.id,
            'date': '2025-02-05',
            'total_test_cases_executed': 5,
            'test_cases_passed': 10,
            'test_cases_failed': 0,
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_my_reports_list(self):
        self._login()
        resp = self.client.get('/api/reports/my/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn('results', resp.data)
