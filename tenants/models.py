from django.db import models
from core.models import TimeStampedModel, TenantModel


class Plan(TimeStampedModel):
    BASICO = 'basico'
    PRO = 'pro'
    ENTERPRISE = 'enterprise'

    SLUG_CHOICES = [
        (BASICO, 'Básico'),
        (PRO, 'Pro'),
        (ENTERPRISE, 'Enterprise'),
    ]

    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    price_monthly = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    # 0 = sin límite
    max_products = models.PositiveIntegerField(default=0)
    max_users = models.PositiveIntegerField(default=0)
    max_orders_per_day = models.PositiveIntegerField(default=0)
    has_mp_integration = models.BooleanField(default=True)
    has_whatsapp = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ['price_monthly']

    def __str__(self):
        return self.name


class Tenant(TimeStampedModel):
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    is_active = models.BooleanField(default=True)
    plan = models.ForeignKey(
        Plan, null=True, blank=True, on_delete=models.SET_NULL, related_name='+'
    )

    def __str__(self):
        return self.name


class BusinessProfile(models.Model):
    tenant = models.OneToOneField(Tenant, on_delete=models.CASCADE, related_name='profile')
    address = models.CharField(max_length=500, blank=True)
    phone = models.CharField(max_length=50, blank=True)
    email = models.EmailField(blank=True)
    whatsapp = models.CharField(max_length=50, blank=True)
    instagram = models.CharField(max_length=100, blank=True)
    advance_hours_required = models.PositiveIntegerField(default=48)
    deposit_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=50)
    max_orders_per_day = models.PositiveIntegerField(
        default=0,
        help_text='Máximo de pedidos por día. 0 = sin límite.',
    )
    # Branding
    logo_url = models.URLField(blank=True)
    primary_color = models.CharField(max_length=7, default='#3D1A0E')
    accent_color = models.CharField(max_length=7, default='#E8889A')
    bg_color = models.CharField(max_length=7, default='#FDF6EC')

    def __str__(self):
        return f"Perfil de {self.tenant}"


class Subscription(TimeStampedModel):
    TRIAL = 'trial'
    ACTIVE = 'active'
    OVERDUE = 'overdue'
    CANCELLED = 'cancelled'
    STATUS_CHOICES = [
        (TRIAL, 'Trial'),
        (ACTIVE, 'Activo'),
        (OVERDUE, 'Vencido'),
        (CANCELLED, 'Cancelado'),
    ]

    tenant = models.OneToOneField(Tenant, on_delete=models.CASCADE, related_name='subscription')
    plan = models.ForeignKey(Plan, null=True, blank=True, on_delete=models.SET_NULL, related_name='+')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=TRIAL)
    trial_ends_at = models.DateTimeField(null=True, blank=True)
    current_period_end = models.DateTimeField(null=True, blank=True)
    last_payment_mp_id = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"{self.tenant} — {self.status}"


class DeliveryZone(TenantModel):
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=300, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.tenant.slug} — {self.name}"
