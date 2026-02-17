# Migration: uniqueness (user, project, feature, date); project required.
# - Backfill null project with 'TOO'
# - Make project non-nullable
# - Replace unique_user_feature_date with unique_user_project_feature_date

from django.db import migrations, models


def backfill_null_project(apps, schema_editor):
    WorkLog = apps.get_model('worklogs', 'WorkLog')
    WorkLog.objects.filter(project__isnull=True).update(project='TOO')


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('worklogs', '0005_remove_worklog_assigned_to'),
    ]

    operations = [
        migrations.RunPython(backfill_null_project, noop),
        migrations.RemoveConstraint(
            model_name='worklog',
            name='unique_user_feature_date',
        ),
        migrations.AlterField(
            model_name='worklog',
            name='project',
            field=models.CharField(
                choices=[('TOO', 'TOO'), ('TFA', 'TFA')],
                db_index=True,
                max_length=10,
                null=False,
                blank=False,
            ),
        ),
        migrations.AddConstraint(
            model_name='worklog',
            constraint=models.UniqueConstraint(
                fields=('user', 'project', 'feature', 'date'),
                name='unique_user_project_feature_date',
            ),
        ),
    ]
