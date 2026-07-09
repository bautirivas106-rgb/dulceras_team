from django.conf import settings
from django.db import models
from core.models import TenantModel


class Order(TenantModel):
    DRAFT = 'draft'
    PENDING_DEPOSIT = 'pending_deposit'
    DEPOSIT_PAID = 'deposit_paid'
    CONFIRMED = 'confirmed'
    IN_PRODUCTION = 'in_production'
    READY = 'ready'
    OUT_FOR_DELIVERY = 'out_for_delivery'
    DELIVERED = 'delivered'
    CANCELLED = 'cancelled'
    REFUNDED = 'refunded'

    STATUS_CHOICES = [
        (DRAFT, 'Borrador'),
        (PENDING_DEPOSIT, 'Esperando seña'),
        (DEPOSIT_PAID, 'Seña pagada'),
        (CONFIRMED, 'Confirmado'),
        (IN_PRODUCTION, 'En producción'),
        (READY, 'Listo'),
        (OUT_FOR_DELIVERY, 'En camino'),
        (DELIVERED, 'Entregado'),
        (CANCELLED, 'Cancelado'),
        (REFUNDED, 'Reintegrado'),
    ]

    DELIVERY = 'delivery'
    PICKUP = 'pickup'
    DELIVERY_CHOICES = [
        (DELIVERY, 'Delivery'),
        (PICKUP, 'Retiro en local'),
    ]

    customer = models.ForeignKey('customers.Customer', on_delete=models.PROTECT, related_name='orders')
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default=DRAFT)
    delivery_method = models.CharField(max_length=20, choices=DELIVERY_CHOICES, default=PICKUP)
    delivery_zone = models.ForeignKey(
        'tenants.DeliveryZone', null=True, blank=True, on_delete=models.SET_NULL
    )
    delivery_address = models.ForeignKey(
        'customers.CustomerAddress', null=True, blank=True, on_delete=models.SET_NULL
    )
    required_date = models.DateField()
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    delivery_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    deposit_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=50)
    deposit_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    balance_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    internal_notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Pedido'
        verbose_name_plural = 'Pedidos'

    def __str__(self):
        return f"Pedido #{self.pk} — {self.customer} ({self.get_status_display()})"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product_variant = models.ForeignKey('catalog.ProductVariant', on_delete=models.PROTECT)
    product_name = models.CharField(max_length=200)
    variant_name = models.CharField(max_length=100)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.quantity}x {self.product_name} — {self.variant_name}"


class OrderStatusHistory(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='status_history')
    from_status = models.CharField(max_length=30, blank=True)
    to_status = models.CharField(max_length=30)
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL
    )
    changed_at = models.DateTimeField(auto_now_add=True)
    notes = models.CharField(max_length=500, blank=True)

    class Meta:
        ordering = ['changed_at']
