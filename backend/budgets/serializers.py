from rest_framework import serializers
from .models import Budget


class BudgetSerializer(serializers.ModelSerializer):
    category_name = serializers.SerializerMethodField()
    category_icon = serializers.SerializerMethodField()

    def get_category_name(self, obj):
        return obj.category.name if obj.category else 'Unknown'

    def get_category_icon(self, obj):
        return obj.category.icon if obj.category else '❓'

    class Meta:
        model = Budget
        fields = (
            'id', 'category', 'category_name', 'category_icon',
            'month', 'year', 'limit_amount',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
