# Migration: make assigned_to required (PROTECT); backfill nulls with owner.

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


def set_assigned_to_to_user(apps, schema_editor):
    WorkLog = apps.get_model('worklogs', 'WorkLog')
    WorkLog.objects.filter(assigned_to__isnull=True).update(assigned_to=models.F('user'))


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('worklogs', '0003_project_to_choice'),
    ]

    operations = [
        migrations.RunPython(set_assigned_to_to_user, noop),
        migrations.AlterField(
            model_name='worklog',
            name='assigned_to',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.PROTECT,
                related_name='assigned_worklogs',
                to=settings.AUTH_USER_MODEL,
                null=False,
            ),
        ),
    ]
