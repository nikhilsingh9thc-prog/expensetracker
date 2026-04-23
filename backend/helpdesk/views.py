from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import FAQ, SupportTicket, TicketMessage
from .serializers import (
    FAQSerializer, SupportTicketListSerializer,
    SupportTicketDetailSerializer, CreateTicketSerializer,
    TicketMessageSerializer
)


class FAQListView(generics.ListAPIView):
    """Public FAQ listing."""
    permission_classes = (permissions.AllowAny,)
    serializer_class = FAQSerializer

    def get_queryset(self):
        qs = FAQ.objects.filter(is_active=True)
        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(category=category)
        return qs


class SupportTicketListCreateView(generics.ListCreateAPIView):
    """List user's tickets or create a new one."""
    permission_classes = (permissions.IsAuthenticated,)

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateTicketSerializer
        return SupportTicketListSerializer

    def get_queryset(self):
        return SupportTicket.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        ticket = serializer.save(user=self.request.user)
        # Auto-create first message from description
        TicketMessage.objects.create(
            ticket=ticket,
            sender_type='user',
            message=ticket.description
        )
        # Auto-reply from support
        TicketMessage.objects.create(
            ticket=ticket,
            sender_type='support',
            message=(
                f"Thank you for reaching out! We've received your "
                f"{ticket.get_category_display().lower()} report. "
                f"Our team will review it and get back to you shortly. "
                f"Your ticket ID is #{ticket.id}."
            )
        )


class SupportTicketDetailView(generics.RetrieveAPIView):
    """Get ticket detail with all messages."""
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = SupportTicketDetailSerializer

    def get_queryset(self):
        return SupportTicket.objects.filter(user=self.request.user)


class TicketMessageCreateView(APIView):
    """Add a message to a ticket."""
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, ticket_id):
        try:
            ticket = SupportTicket.objects.get(id=ticket_id, user=request.user)
        except SupportTicket.DoesNotExist:
            return Response(
                {"detail": "Ticket not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        message_text = request.data.get('message', '').strip()
        if not message_text:
            return Response(
                {"detail": "Message cannot be empty."},
                status=status.HTTP_400_BAD_REQUEST
            )

        msg = TicketMessage.objects.create(
            ticket=ticket,
            sender_type='user',
            message=message_text
        )

        # Auto-reply from support
        auto_reply = TicketMessage.objects.create(
            ticket=ticket,
            sender_type='support',
            message=(
                "Thanks for the update! Our support team has been notified "
                "and will respond as soon as possible."
            )
        )

        return Response({
            "user_message": TicketMessageSerializer(msg).data,
            "support_reply": TicketMessageSerializer(auto_reply).data,
        }, status=status.HTTP_201_CREATED)
