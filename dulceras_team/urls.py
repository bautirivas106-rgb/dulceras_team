from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from tenants.urls import public_urlpatterns as tenants_public
from catalog.urls import public_urlpatterns as catalog_public, admin_urlpatterns as catalog_admin
from orders.urls import public_urlpatterns as orders_public, admin_urlpatterns as orders_admin
from customers.urls import admin_urlpatterns as customers_admin
from payments.urls import public_urlpatterns as payments_public, admin_urlpatterns as payments_admin
from notifications.urls import admin_urlpatterns as notifications_admin

public_patterns = [*tenants_public, *catalog_public, *orders_public, *payments_public]

urlpatterns = [
    # Django admin
    path('admin/', admin.site.urls),

    # JWT auth
    path('api/token/', TokenObtainPairView.as_view(), name='token-obtain'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),

    # Public API (no auth)
    path('api/public/', include(public_patterns)),

    # Admin API (JWT required)
    path('api/admin/catalog/', include(catalog_admin)),
    path('api/admin/orders/', include(orders_admin)),
    path('api/admin/customers/', include(customers_admin)),
    path('api/admin/', include(payments_admin)),
    path('api/admin/', include(notifications_admin)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
