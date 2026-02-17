# Remove assigned_to field from WorkLog.

from django.conf import settings
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('worklogs', '0004_assigned_to_required'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='worklog',
            name='assigned_to',
        ),
    ]
