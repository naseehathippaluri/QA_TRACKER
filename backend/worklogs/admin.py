from django.contrib import admin
from .models import WorkLog


@admin.register(WorkLog)
class WorkLogAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'feature', 'project', 'date', 'test_cases_executed', 'defects_raised', 'updated_at')
    list_filter = ('date', 'feature', 'project', 'user')
    search_fields = ('user__username', 'feature__name', 'comments')
    date_hierarchy = 'date'
    raw_id_fields = ('user', 'feature', 'assigned_to')
