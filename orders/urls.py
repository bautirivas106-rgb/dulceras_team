from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import PublicOrderCreateView, PublicOrderDetailView, AdminOrderViewSet

public_urlpatterns = [
    path('<slug:tenant_slug>/orders/', PublicOrderCreateView.as_view(), name='public-order-create'),
    path('<slug:tenant_slug>/orders/<int:pk>/', PublicOrderDetailView.as_view(), name='public-order-detail'),
]

router = DefaultRouter()
router.register('', AdminOrderViewSet, basename='admin-orders')
admin_urlpatterns = router.urls
