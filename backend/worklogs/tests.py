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
        self.client.force_authenticate(user=self.user)

    def _login(self, email='qa1@test.com', password='SecurePass1!'):
        r = self.client.post('/api/auth/login', {'email': email, 'password': password}, format='json')
        if r.status_code == 200:
            self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {r.data["access_token"]}')
        return r

    def test_create_worklog_success(self):
        self._login()
        r = self.client.post('/api/worklogs/', {
            'feature': self.feature.id,
            'project': 'TOO',
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
            'project': 'TOO',
            'date': '2026-02-06',
            'test_cases_executed': 5,
            'test_cases_passed': 10,
        }, format='json')
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_allows_same_feature_date_different_project(self):
        self._login()
        base = {'feature': self.feature.id, 'date': '2026-02-10', 'test_cases_executed': 0}
        r1 = self.client.post('/api/worklogs/', dict(base, project='TOO'), format='json')
        r2 = self.client.post('/api/worklogs/', dict(base, project='TFA'), format='json')
        self.assertEqual(r1.status_code, status.HTTP_201_CREATED)
        self.assertEqual(r2.status_code, status.HTTP_201_CREATED)
        self.assertNotEqual(r1.data['id'], r2.data['id'])

    def test_blocks_duplicate_when_user_project_feature_date_match(self):
        self._login()
        payload = {'feature': self.feature.id, 'project': 'TOO', 'date': '2026-02-11', 'test_cases_executed': 0}
        self.client.post('/api/worklogs/', payload, format='json')
        r2 = self.client.post('/api/worklogs/', payload, format='json')
        self.assertEqual(r2.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('non_field_errors', r2.data)

    def test_update_unchanged_unique_allowed(self):
        self._login()
        r = self.client.post('/api/worklogs/', {
            'feature': self.feature.id, 'project': 'TOO', 'date': '2026-02-12',
            'test_cases_executed': 5, 'test_cases_passed': 3,
        }, format='json')
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        pk = r.data['id']
        payload = {
            'feature': self.feature.id, 'project': 'TOO', 'date': '2026-02-12',
            'test_cases_executed': 5, 'test_cases_passed': 4, 'test_cases_failed': 1,
            'test_cases_reviewed': 0, 'test_cases_written': 0, 'test_cases_blocked': 0,
            'test_cases_in_progress': 0, 'test_cases_future_execution': 0, 'test_cases_invalid': 0,
            'retested_qa_review_tickets': 0, 'defects_raised': 0, 'ticket_number_with_priority': '',
            'observations_found': 0, 'comments': '',
        }
        r2 = self.client.put(f'/api/worklogs/{pk}/', payload, format='json')
        self.assertEqual(r2.status_code, status.HTTP_200_OK)

    def test_update_to_duplicate_project_feature_date_blocked(self):
        self._login()
        WorkLog.objects.create(
            user=self.user, feature=self.feature, project='TOO', date='2026-02-13', test_cases_executed=0
        )
        r = self.client.post('/api/worklogs/', {
            'feature': self.feature.id, 'project': 'TFA', 'date': '2026-02-13', 'test_cases_executed': 0,
        }, format='json')
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        pk = r.data['id']
        payload = {
            'feature': self.feature.id, 'project': 'TOO', 'date': '2026-02-13', 'test_cases_executed': 0,
            'test_cases_passed': 0, 'test_cases_reviewed': 0, 'test_cases_written': 0,
            'test_cases_failed': 0, 'test_cases_blocked': 0, 'test_cases_in_progress': 0,
            'test_cases_future_execution': 0, 'test_cases_invalid': 0, 'retested_qa_review_tickets': 0,
            'defects_raised': 0, 'ticket_number_with_priority': '', 'observations_found': 0, 'comments': '',
        }
        r2 = self.client.put(f'/api/worklogs/{pk}/', payload, format='json')
        self.assertEqual(r2.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('non_field_errors', r2.data)
