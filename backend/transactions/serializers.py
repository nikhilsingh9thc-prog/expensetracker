from rest_framework import serializers
from .models import Category, Transaction


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name', 'type', 'icon', 'is_default', 'created_at')
        read_only_fields = ('id', 'is_default', 'created_at')

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class TransactionSerializer(serializers.ModelSerializer):
    category_name = serializers.SerializerMethodField()
    category_icon = serializers.SerializerMethodField()

    class Meta:
        model = Transaction
        fields = (
            'id', 'category', 'category_name', 'category_icon',
            'amount', 'type', 'date', 'description',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def get_category_name(self, obj):
        return obj.category.name if obj.category else 'Uncategorized'

    def get_category_icon(self, obj):
        return obj.category.icon if obj.category else '📁'

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
