from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from catalog.views import TenantFilterMixin
from .models import Notification, WhatsAppLog
from .serializers import NotificationSerializer, WhatsAppLogSerializer


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Notificaciones personales del usuario autenticado (la campanita).
    Cada usuario solo ve las suyas — no usa TenantFilterMixin.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer
    http_method_names = ['get', 'post', 'head', 'options']

    def get_queryset(self):
        qs = Notification.objects.filter(recipient=self.request.user)
        if is_read := self.request.query_params.get('is_read'):
            qs = qs.filter(is_read=is_read.lower() == 'true')
        return qs

    @action(detail=False, methods=['get'], url_path='unread-count')
    def unread_count(self, request):
        count = Notification.objects.filter(recipient=request.user, is_read=False).count()
        return Response({'unread_count': count})

    @action(detail=True, methods=['post'], url_path='mark-read')
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save(update_fields=['is_read'])
        return Response(NotificationSerializer(notification).data)

    @action(detail=False, methods=['post'], url_path='mark-all-read')
    def mark_all_read(self, request):
        updated = (
            Notification.objects
            .filter(recipient=request.user, is_read=False)
            .update(is_read=True)
        )
        return Response({'marked_read': updated})


class WhatsAppLogViewSet(TenantFilterMixin, viewsets.ReadOnlyModelViewSet):
    """Log de mensajes WhatsApp enviados — solo lectura para admins."""
    permission_classes = [IsAuthenticated]
    serializer_class = WhatsAppLogSerializer
    queryset = WhatsAppLog.objects.select_related('order').order_by('-created_at')

    def get_queryset(self):
        qs = super().get_queryset()
        if s := self.request.query_params.get('sent'):
            qs = qs.filter(sent=s.lower() == 'true')
        if o := self.request.query_params.get('order'):
            qs = qs.filter(order_id=o)
        return qs
