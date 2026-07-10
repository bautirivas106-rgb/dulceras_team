from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import PublicDeliveryZoneListView, SuperadminTenantViewSet

public_urlpatterns = [
    path(
        '<slug:tenant_slug>/delivery-zones/',
        PublicDeliveryZoneListView.as_view(),
        name='public-delivery-zones',
    ),
]

router = DefaultRouter()
router.register('tenants', SuperadminTenantViewSet, basename='superadmin-tenants')
superadmin_urlpatterns = router.urls
