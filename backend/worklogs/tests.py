"""Work log model and API tests."""
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from features.models import Feature
from accounts.models import UserProfile
from .models import WorkLog

User = get_user_model()


class WorkLogAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='qa1', email='qa1@test.com', password='SecurePass1!')
        UserProfile.objects.create(user=self.user, role='QA_MEMBER')
        self.feature = Feature.objects.create(name='Feature A')

    def _login(self, email='qa1@test.com', password='SecurePass1!'):
        r = self.client.post('/api/auth/login', {'email': email, 'password': password}, format='json')
        if r.status_code == 200:
            self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {r.data["access_token"]}')
        return r

    def test_create_worklog_success(self):
        self._login()
        r = self.client.post('/api/worklogs/', {
            'feature': self.feature.id,
            'date': '2026-02-05',
            'test_cases_executed': 10,
            'test_cases_passed': 8,
            'test_cases_failed': 2,
        }, format='json')
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        self.assertEqual(r.data['user'], self.user.id)
        self.assertEqual(r.data['test_cases_executed'], 10)

    def test_create_worklog_validation_sum_constraint(self):
        self._login()
        r = self.client.post('/api/worklogs/', {
            'feature': self.feature.id,
            'date': '2026-02-06',
            'test_cases_executed': 5,
            'test_cases_passed': 10,
        }, format='json')
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)
