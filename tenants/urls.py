from django.urls import path
from .views import PublicDeliveryZoneListView

public_urlpatterns = [
    path(
        '<slug:tenant_slug>/delivery-zones/',
        PublicDeliveryZoneListView.as_view(),
        name='public-delivery-zones',
    ),
]
