from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PublicDeliveryZoneListView, SuperadminTenantViewSet, TenantSettingsView, AdminDeliveryZoneViewSet

public_urlpatterns = [
    path(
        '<slug:tenant_slug>/delivery-zones/',
        PublicDeliveryZoneListView.as_view(),
        name='public-delivery-zones',
    ),
]

admin_router = DefaultRouter()
admin_router.register('delivery-zones', AdminDeliveryZoneViewSet, basename='admin-delivery-zones')

admin_urlpatterns = [
    path('settings/', TenantSettingsView.as_view(), name='tenant-settings'),
    path('', include(admin_router.urls)),
]

router = DefaultRouter()
router.register('tenants', SuperadminTenantViewSet, basename='superadmin-tenants')
superadmin_urlpatterns = router.urls
