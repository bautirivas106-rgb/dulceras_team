from rest_framework.routers import DefaultRouter
from .views import NotificationViewSet, WhatsAppLogViewSet

router = DefaultRouter()
router.register('notifications', NotificationViewSet, basename='notifications')
router.register('whatsapp-logs', WhatsAppLogViewSet, basename='whatsapp-logs')

admin_urlpatterns = router.urls
