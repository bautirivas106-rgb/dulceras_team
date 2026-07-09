from rest_framework.routers import DefaultRouter
from .views import AdminCustomerViewSet

router = DefaultRouter()
router.register('', AdminCustomerViewSet, basename='admin-customers')

admin_urlpatterns = router.urls
