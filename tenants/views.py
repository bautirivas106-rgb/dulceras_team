from django.shortcuts import get_object_or_404
from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny
from rest_framework import serializers

from .models import Tenant, DeliveryZone


class DeliveryZoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryZone
        fields = ('id', 'name', 'description', 'price')


class PublicDeliveryZoneListView(ListAPIView):
    serializer_class = DeliveryZoneSerializer
    permission_classes = [AllowAny]
    pagination_class = None

    def get_queryset(self):
        tenant = get_object_or_404(Tenant, slug=self.kwargs['tenant_slug'], is_active=True)
        return DeliveryZone.objects.filter(tenant=tenant, is_active=True).order_by('price')
