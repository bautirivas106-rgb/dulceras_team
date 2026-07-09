from django.contrib import admin
from .models import Category, Product, ProductVariant


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1
    fields = ('name', 'price', 'stock_quantity', 'is_active', 'sort_order')


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'tenant', 'slug', 'is_active')
    list_filter = ('tenant', 'is_active')
    search_fields = ('name',)
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'tenant', 'category', 'is_active', 'requires_advance_hours', 'sort_order')
    list_filter = ('tenant', 'category', 'is_active')
    search_fields = ('name', 'description')
    inlines = [ProductVariantInline]


@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = ('product', 'name', 'price', 'stock_quantity', 'is_active')
    list_filter = ('tenant', 'is_active', 'product')
    search_fields = ('name', 'product__name')
