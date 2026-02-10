# Data migration: copy legacy QAReport data into WorkLog (one Feature per Project + Legacy fallback).

from django.db import migrations


def migrate_reports_to_worklogs(apps, schema_editor):
    Report = apps.get_model('reports', 'QAReport')
    WorkLog = apps.get_model('worklogs', 'WorkLog')
    Feature = apps.get_model('features', 'Feature')
    Project = apps.get_model('projects', 'Project')

    if not Report.objects.exists():
        return

    # Create one Feature per Project (name = project name) for migration
    project_to_feature = {}
    for proj in Project.objects.all():
        feat, _ = Feature.objects.get_or_create(
            name=f"Feature: {proj.name}",
            defaults={'created_by_id': None}
        )
        project_to_feature[proj.id] = feat

    # Fallback feature if no projects
    if not project_to_feature:
        legacy, _ = Feature.objects.get_or_create(
            name="Legacy",
            defaults={'created_by_id': None}
        )
        project_to_feature[None] = legacy

    for r in Report.objects.select_related('user', 'project'):
        feature = project_to_feature.get(r.project_id) or project_to_feature.get(None)
        if not feature:
            continue
        WorkLog.objects.get_or_create(
            user=r.user,
            feature=feature,
            date=r.date,
            defaults={
                'project_id': r.project_id,
                'test_cases_written': r.total_test_cases_written,
                'test_cases_reviewed': r.total_test_cases_reviewed,
                'test_cases_executed': r.total_test_cases_executed,
                'test_cases_passed': r.test_cases_passed,
                'test_cases_failed': r.test_cases_failed,
                'test_cases_blocked': r.test_cases_blocked,
                'test_cases_in_progress': r.test_cases_in_progress,
                'test_cases_future_execution': r.test_cases_future_execution,
                'test_cases_invalid': r.test_cases_invalid,
                'retested_qa_review_tickets': r.retested_qa_review_tickets,
                'defects_raised': r.defects_raised,
                'ticket_number_with_priority': r.ticket_number_with_priority or '',
                'observations_found': r.observations_found,
                'comments': r.comments_remarks or '',
            }
        )


def reverse_migrate(apps, schema_editor):
    pass  # No reverse: keep WorkLog data


class Migration(migrations.Migration):
    dependencies = [
        ('worklogs', '0001_initial'),
        ('reports', '0001_initial'),
        ('features', '0001_initial'),
        ('projects', '0002_add_default_project'),
    ]

    operations = [
        migrations.RunPython(migrate_reports_to_worklogs, reverse_migrate),
    ]
