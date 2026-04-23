from django.urls import path
from .views import (
    FAQListView, SupportTicketListCreateView,
    SupportTicketDetailView, TicketMessageCreateView
)

urlpatterns = [
    path('helpdesk/faq/', FAQListView.as_view(), name='helpdesk-faq'),
    path('helpdesk/tickets/', SupportTicketListCreateView.as_view(), name='helpdesk-tickets'),
    path('helpdesk/tickets/<int:pk>/', SupportTicketDetailView.as_view(), name='helpdesk-ticket-detail'),
    path('helpdesk/tickets/<int:ticket_id>/messages/', TicketMessageCreateView.as_view(), name='helpdesk-ticket-messages'),
]
