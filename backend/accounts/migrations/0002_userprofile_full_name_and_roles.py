# Security refactor: full_name and QA_MEMBER/ADMIN roles

from django.db import migrations, models


def migrate_roles(apps, schema_editor):
    UserProfile = apps.get_model('accounts', 'UserProfile')
    UserProfile.objects.filter(role='QA').update(role='QA_MEMBER')
    # ADMIN stays ADMIN


def reverse_roles(apps, schema_editor):
    UserProfile = apps.get_model('accounts', 'UserProfile')
    UserProfile.objects.filter(role='QA_MEMBER').update(role='QA')


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='full_name',
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.RunPython(migrate_roles, reverse_roles),
        migrations.AlterField(
            model_name='userprofile',
            name='role',
            field=models.CharField(
                choices=[('QA_MEMBER', 'QA Member'), ('ADMIN', 'Admin')],
                default='QA_MEMBER',
                max_length=20,
            ),
        ),
    ]
