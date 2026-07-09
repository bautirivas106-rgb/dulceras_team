from django.contrib import admin
from .models import PaymentIntent, WebhookEvent


@admin.register(PaymentIntent)
class PaymentIntentAdmin(admin.ModelAdmin):
    list_display = ('id', 'tenant', 'order', 'amount', 'status', 'mp_payment_id', 'created_at')
    list_filter = ('tenant', 'status')
    search_fields = ('mp_preference_id', 'mp_payment_id', 'order__id')
    readonly_fields = ('mp_response', 'created_at', 'updated_at')


@admin.register(WebhookEvent)
class WebhookEventAdmin(admin.ModelAdmin):
    list_display = ('mp_id', 'topic', 'tenant', 'processed', 'processed_at', 'created_at')
    list_filter = ('tenant', 'processed', 'topic')
    search_fields = ('mp_id',)
    readonly_fields = ('payload', 'created_at', 'updated_at')
