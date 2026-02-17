# Migration: replace project FK with CharField (TOO / TFA)

from django.db import migrations, models


def copy_project_to_code(apps, schema_editor):
    WorkLog = apps.get_model('worklogs', 'WorkLog')
    for wl in WorkLog.objects.select_related('project').all():
        if wl.project_id and wl.project and wl.project.name in ('TOO', 'TFA'):
            wl.project_code = wl.project.name
            wl.save(update_fields=['project_code'])


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('worklogs', '0002_migrate_from_reports'),
    ]

    operations = [
        migrations.AddField(
            model_name='worklog',
            name='project_code',
            field=models.CharField(blank=True, choices=[('TOO', 'TOO'), ('TFA', 'TFA')], db_index=True, max_length=10, null=True),
        ),
        migrations.RunPython(copy_project_to_code, noop),
        migrations.RemoveField(
            model_name='worklog',
            name='project',
        ),
        migrations.RenameField(
            model_name='worklog',
            old_name='project_code',
            new_name='project',
        ),
    ]
