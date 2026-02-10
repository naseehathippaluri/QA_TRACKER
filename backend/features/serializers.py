from rest_framework import serializers
from .models import Feature
from accounts.validators import sanitize_string


class FeatureSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = Feature
        fields = ('id', 'name', 'created_by', 'created_by_username', 'created_at')
        read_only_fields = ('id', 'created_by', 'created_by_username', 'created_at')

    def validate_name(self, value):
        return sanitize_string(value, max_length=255) or value
