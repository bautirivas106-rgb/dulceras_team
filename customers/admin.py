from django.contrib import admin
from .models import Customer, CustomerAddress


class CustomerAddressInline(admin.TabularInline):
    model = CustomerAddress
    extra = 0
    fields = ('street', 'neighborhood', 'city', 'notes', 'is_default')


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('name', 'tenant', 'phone', 'email', 'created_at')
    list_filter = ('tenant',)
    search_fields = ('name', 'phone', 'email')
    inlines = [CustomerAddressInline]
