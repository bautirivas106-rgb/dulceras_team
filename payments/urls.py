from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    AdminPaymentViewSet, AdminWebhookViewSet,
    InitiatePaymentView, MercadoPagoWebhookView, PaymentStatusView,
    payment_success, payment_failure, payment_pending,
)

# URL patterns para las páginas HTML (template views)
template_urlpatterns = [
    path('payment/success/', payment_success, name='payment-success'),
    path('payment/failure/', payment_failure, name='payment-failure'),
    path('payment/pending/', payment_pending, name='payment-pending'),
]

public_urlpatterns = [
    path(
        '<slug:tenant_slug>/payments/orders/<int:order_id>/initiate/',
        InitiatePaymentView.as_view(),
        name='payment-initiate',
    ),
    path(
        '<slug:tenant_slug>/payments/orders/<int:order_id>/status/',
        PaymentStatusView.as_view(),
        name='payment-status',
    ),
    path(
        '<slug:tenant_slug>/webhooks/mp/',
        MercadoPagoWebhookView.as_view(),
        name='webhook-mp',
    ),
]

router = DefaultRouter()
router.register('payments', AdminPaymentViewSet, basename='admin-payments')
router.register('webhooks', AdminWebhookViewSet, basename='admin-webhooks')

admin_urlpatterns = router.urls
