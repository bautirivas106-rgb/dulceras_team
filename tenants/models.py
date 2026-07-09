from django.db import models
from core.models import TimeStampedModel, TenantModel


class Tenant(TimeStampedModel):
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    is_active = models.BooleanField(default=True)

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

    def __str__(self):
        return f"Perfil de {self.tenant}"


class DeliveryZone(TenantModel):
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=300, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.tenant.slug} — {self.name}"
