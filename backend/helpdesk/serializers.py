from rest_framework import serializers
from .models import FAQ, SupportTicket, TicketMessage


class FAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQ
        fields = ('id', 'question', 'answer', 'category', 'order')


class TicketMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketMessage
        fields = ('id', 'ticket', 'sender_type', 'message', 'created_at')
        read_only_fields = ('id', 'ticket', 'sender_type', 'created_at')


class SupportTicketListSerializer(serializers.ModelSerializer):
    message_count = serializers.SerializerMethodField()

    class Meta:
        model = SupportTicket
        fields = ('id', 'subject', 'category', 'priority', 'status',
                  'created_at', 'updated_at', 'message_count')
        read_only_fields = ('id', 'status', 'created_at', 'updated_at')

    def get_message_count(self, obj):
        return obj.messages.count()


class SupportTicketDetailSerializer(serializers.ModelSerializer):
    messages = TicketMessageSerializer(many=True, read_only=True)

    class Meta:
        model = SupportTicket
        fields = ('id', 'subject', 'description', 'category', 'priority',
                  'status', 'created_at', 'updated_at', 'messages')
        read_only_fields = ('id', 'status', 'created_at', 'updated_at')


class CreateTicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportTicket
        fields = ('subject', 'description', 'category', 'priority')
