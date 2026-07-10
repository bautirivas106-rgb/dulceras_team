from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    PublicCouponValidateView, PublicDateAvailabilityView,
    PublicOrderCreateView, PublicOrderDetailView,
    AdminCouponViewSet, AdminOrderViewSet,
)

public_urlpatterns = [
    path('<slug:tenant_slug>/orders/', PublicOrderCreateView.as_view(), name='public-order-create'),
    path('<slug:tenant_slug>/orders/<int:pk>/', PublicOrderDetailView.as_view(), name='public-order-detail'),
    path('<slug:tenant_slug>/calendar/availability/', PublicDateAvailabilityView.as_view(), name='public-date-availability'),
    path('<slug:tenant_slug>/coupons/validate/', PublicCouponValidateView.as_view(), name='public-coupon-validate'),
]

order_router = DefaultRouter()
order_router.register('', AdminOrderViewSet, basename='admin-orders')
admin_urlpatterns = order_router.urls

coupon_router = DefaultRouter()
coupon_router.register('', AdminCouponViewSet, basename='admin-coupons')
coupon_urlpatterns = coupon_router.urls
