from django.conf import settings
from django.db import models
from core.models import TenantModel


class Notification(TenantModel):
    NEW_ORDER = 'new_order'
    PAYMENT_RECEIVED = 'payment_received'
    ORDER_STATUS = 'order_status'

    TYPE_CHOICES = [
        (NEW_ORDER, 'Nuevo pedido'),
        (PAYMENT_RECEIVED, 'Pago recibido'),
        (ORDER_STATUS, 'Cambio de estado'),
    ]

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications'
    )
    type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    order = models.ForeignKey(
        'orders.Order', null=True, blank=True, on_delete=models.SET_NULL
    )

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Notificación'
        verbose_name_plural = 'Notificaciones'

    def __str__(self):
        return f"{self.get_type_display()} — {self.recipient}"


class WhatsAppLog(TenantModel):
    phone = models.CharField(max_length=50)
    message = models.TextField()
    order = models.ForeignKey(
        'orders.Order', null=True, blank=True, on_delete=models.SET_NULL
    )
    sent = models.BooleanField(default=False)
    sent_at = models.DateTimeField(null=True, blank=True)
    error = models.TextField(blank=True)

    class Meta:
        verbose_name = 'Log WhatsApp'
        verbose_name_plural = 'Logs WhatsApp'

    def __str__(self):
        return f"WA {self.phone} — {'OK' if self.sent else 'FALLIDO'}"
