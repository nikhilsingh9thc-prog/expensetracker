from django.contrib import admin
from .models import FAQ, SupportTicket, TicketMessage


@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = ('question', 'category', 'order', 'is_active')
    list_filter = ('category', 'is_active')
    list_editable = ('order', 'is_active')


@admin.register(SupportTicket)
class SupportTicketAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'subject', 'category', 'priority', 'status', 'created_at')
    list_filter = ('status', 'priority', 'category')
    list_editable = ('status',)


@admin.register(TicketMessage)
class TicketMessageAdmin(admin.ModelAdmin):
    list_display = ('ticket', 'sender_type', 'message', 'created_at')
    list_filter = ('sender_type',)
