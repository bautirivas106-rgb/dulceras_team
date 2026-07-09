from rest_framework import serializers
from .models import PaymentIntent, WebhookEvent


class PaymentIntentSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = PaymentIntent
        fields = (
            'id', 'order', 'mp_preference_id', 'mp_payment_id',
            'amount', 'status', 'status_display', 'created_at', 'updated_at',
        )
        read_only_fields = fields


class WebhookEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = WebhookEvent
        fields = (
            'id', 'mp_id', 'topic', 'processed',
            'processed_at', 'error', 'created_at',
        )
        read_only_fields = fields
