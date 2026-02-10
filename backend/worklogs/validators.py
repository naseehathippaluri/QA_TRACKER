"""Work log validation: outcome sum <= executed."""
from rest_framework import serializers


def validate_execution_breakdown(data):
    executed = data.get('test_cases_executed', 0) or 0
    passed = data.get('test_cases_passed', 0) or 0
    failed = data.get('test_cases_failed', 0) or 0
    blocked = data.get('test_cases_blocked', 0) or 0
    in_progress = data.get('test_cases_in_progress', 0) or 0
    future_execution = data.get('test_cases_future_execution', 0) or 0
    invalid = data.get('test_cases_invalid', 0) or 0
    total = passed + failed + blocked + in_progress + future_execution + invalid
    if total > executed:
        raise serializers.ValidationError(
            'Sum of passed, failed, blocked, in_progress, future_execution and invalid '
            'must not exceed test_cases_executed.'
        )
    return data
