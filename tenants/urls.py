from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import PublicDeliveryZoneListView, SuperadminTenantViewSet, TenantSettingsView

public_urlpatterns = [
    path(
        '<slug:tenant_slug>/delivery-zones/',
        PublicDeliveryZoneListView.as_view(),
        name='public-delivery-zones',
    ),
]

admin_urlpatterns = [
    path('settings/', TenantSettingsView.as_view(), name='tenant-settings'),
]

router = DefaultRouter()
router.register('tenants', SuperadminTenantViewSet, basename='superadmin-tenants')
superadmin_urlpatterns = router.urls
