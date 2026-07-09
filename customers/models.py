from django.db import models
from core.models import TenantModel


class Customer(TenantModel):
    name = models.CharField(max_length=200)
    phone = models.CharField(max_length=50, blank=True)
    email = models.EmailField(blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        verbose_name = 'Cliente'
        verbose_name_plural = 'Clientes'

    def __str__(self):
        return self.name


class CustomerAddress(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='addresses')
    street = models.CharField(max_length=300)
    city = models.CharField(max_length=100, default='Buenos Aires')
    neighborhood = models.CharField(max_length=100, blank=True)
    notes = models.CharField(max_length=300, blank=True)
    is_default = models.BooleanField(default=False)

    class Meta:
        verbose_name = 'Dirección'
        verbose_name_plural = 'Direcciones'

    def __str__(self):
        return f"{self.customer.name} — {self.street}"
