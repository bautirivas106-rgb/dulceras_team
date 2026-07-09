from django.contrib import admin
from .models import Tenant, BusinessProfile, DeliveryZone


class BusinessProfileInline(admin.StackedInline):
    model = BusinessProfile
    extra = 0


class DeliveryZoneInline(admin.TabularInline):
    model = DeliveryZone
    extra = 0


@admin.register(Tenant)
class TenantAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [BusinessProfileInline, DeliveryZoneInline]


@admin.register(DeliveryZone)
class DeliveryZoneAdmin(admin.ModelAdmin):
    list_display = ('name', 'tenant', 'price', 'is_active')
    list_filter = ('tenant', 'is_active')
    search_fields = ('name', 'tenant__name')
