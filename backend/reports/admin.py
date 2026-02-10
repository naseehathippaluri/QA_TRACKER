from django.contrib import admin
from .models import QAReport


@admin.register(QAReport)
class QAReportAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'project', 'date', 'total_test_cases_executed', 'test_cases_passed', 'defects_raised', 'updated_at')
    list_filter = ('date', 'project', 'user')
    search_fields = ('user__username', 'project__name', 'comments_remarks')
    date_hierarchy = 'date'
    raw_id_fields = ('user', 'project')
