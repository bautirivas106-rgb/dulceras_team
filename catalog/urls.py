from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PublicCategoryListView, PublicProductListView, PublicProductDetailView,
    AdminCategoryViewSet, AdminProductViewSet, AdminProductVariantViewSet,
)

# ── Public ────────────────────────────────────────────────────────────────────
public_urlpatterns = [
    path('<slug:tenant_slug>/categories/', PublicCategoryListView.as_view(), name='public-categories'),
    path('<slug:tenant_slug>/products/', PublicProductListView.as_view(), name='public-products'),
    path('<slug:tenant_slug>/products/<int:pk>/', PublicProductDetailView.as_view(), name='public-product-detail'),
]

# ── Admin ─────────────────────────────────────────────────────────────────────
router = DefaultRouter()
router.register('categories', AdminCategoryViewSet, basename='admin-categories')
router.register('products', AdminProductViewSet, basename='admin-products')
router.register('variants', AdminProductVariantViewSet, basename='admin-variants')

admin_urlpatterns = router.urls
