from rest_framework import serializers
from .models import Notification, WhatsAppLog


class NotificationSerializer(serializers.ModelSerializer):
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    order_id = serializers.IntegerField(source='order.id', read_only=True, default=None)

    class Meta:
        model = Notification
        fields = (
            'id', 'type', 'type_display', 'title', 'message',
            'is_read', 'order_id', 'created_at',
        )
        read_only_fields = ('type', 'type_display', 'title', 'message', 'order_id', 'created_at')


class WhatsAppLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = WhatsAppLog
        fields = ('id', 'phone', 'message', 'order', 'sent', 'sent_at', 'error', 'created_at')
        read_only_fields = fields
