from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PublicDeliveryZoneListView, PublicBrandingView, PublicPlanListView, RegisterView,
    SuperadminTenantViewSet, TenantSettingsView, AdminDeliveryZoneViewSet, PlanViewSet,
    BillingView,
)

public_urlpatterns = [
    path(
        '<slug:tenant_slug>/delivery-zones/',
        PublicDeliveryZoneListView.as_view(),
        name='public-delivery-zones',
    ),
    path(
        '<slug:tenant_slug>/branding/',
        PublicBrandingView.as_view(),
        name='public-branding',
    ),
]

register_urlpatterns = [
    path('plans/', PublicPlanListView.as_view(), name='public-plans'),
    path('register/', RegisterView.as_view(), name='register'),
]

admin_router = DefaultRouter()
admin_router.register('delivery-zones', AdminDeliveryZoneViewSet, basename='admin-delivery-zones')

admin_urlpatterns = [
    path('settings/', TenantSettingsView.as_view(), name='tenant-settings'),
    path('billing/', BillingView.as_view(), name='tenant-billing'),
    path('', include(admin_router.urls)),
]

router = DefaultRouter()
router.register('tenants', SuperadminTenantViewSet, basename='superadmin-tenants')
router.register('plans', PlanViewSet, basename='superadmin-plans')
superadmin_urlpatterns = router.urls
