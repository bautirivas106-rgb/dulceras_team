from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    AdminCustomerViewSet,
    CustomerRegisterView, CustomerLoginView,
    CustomerProfileView, CustomerOrdersView,
    ReviewListView, CustomerReviewCreateView,
)

router = DefaultRouter()
router.register('', AdminCustomerViewSet, basename='admin-customers')

admin_urlpatterns = router.urls

public_urlpatterns = [
    path('<slug:tenant_slug>/customers/register/', CustomerRegisterView.as_view(), name='customer-register'),
    path('<slug:tenant_slug>/customers/login/', CustomerLoginView.as_view(), name='customer-login'),
    path('<slug:tenant_slug>/customers/me/', CustomerProfileView.as_view(), name='customer-me'),
    path('<slug:tenant_slug>/customers/me/orders/', CustomerOrdersView.as_view(), name='customer-orders'),
    path('<slug:tenant_slug>/customers/me/reviews/', CustomerReviewCreateView.as_view(), name='customer-review-create'),
    path('<slug:tenant_slug>/reviews/', ReviewListView.as_view(), name='public-reviews'),
]
