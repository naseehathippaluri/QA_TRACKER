# Data migration: create a default project so the report form has at least one option.

from django.db import migrations


def create_default_project(apps, schema_editor):
    Project = apps.get_model('projects', 'Project')
    if not Project.objects.exists():
        Project.objects.create(
            name='Default Project',
            description='Default project for QA daily reports.',
            status='active',
        )


def remove_default_project(apps, schema_editor):
    Project = apps.get_model('projects', 'Project')
    Project.objects.filter(name='Default Project').delete()


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_default_project, remove_default_project),
    ]
