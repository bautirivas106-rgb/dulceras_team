from rest_framework import serializers
from .models import Notification, WhatsAppLog
from .services import wa_link


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
    wa_link = serializers.SerializerMethodField()

    def get_wa_link(self, obj):
        if not obj.phone:
            return None
        return wa_link(obj.phone, obj.message)

    class Meta:
        model = WhatsAppLog
        fields = ('id', 'phone', 'message', 'order', 'sent', 'sent_at', 'error', 'wa_link', 'created_at')
        read_only_fields = fields
