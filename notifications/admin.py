from django.contrib import admin
from .models import Notification, WhatsAppLog


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('title', 'tenant', 'recipient', 'type', 'is_read', 'created_at')
    list_filter = ('tenant', 'type', 'is_read')
    search_fields = ('title', 'message', 'recipient__username')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(WhatsAppLog)
class WhatsAppLogAdmin(admin.ModelAdmin):
    list_display = ('phone', 'tenant', 'sent', 'sent_at', 'created_at')
    list_filter = ('tenant', 'sent')
    search_fields = ('phone',)
    readonly_fields = ('created_at', 'updated_at')
