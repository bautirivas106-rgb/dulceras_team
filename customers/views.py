from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from catalog.views import TenantFilterMixin
from .models import Customer, CustomerAddress
from .serializers import (
    CustomerListSerializer, CustomerDetailSerializer, CustomerWriteSerializer,
    CustomerAddressSerializer, CustomerAddressWriteSerializer,
)


class AdminCustomerViewSet(TenantFilterMixin, viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'patch', 'delete', 'head', 'options']

    queryset = (
        Customer.objects
        .annotate(order_count=Count('orders'))
        .order_by('-created_at')
    )

    def get_queryset(self):
        qs = super().get_queryset()
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(name__icontains=search) |
                Q(phone__icontains=search) |
                Q(email__icontains=search)
            )
        return qs

    def destroy(self, request, *args, **kwargs):
        return Response(
            {'detail': 'Los clientes no se pueden eliminar directamente.'},
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )

    def get_serializer_class(self):
        if self.action == 'list':
            return CustomerListSerializer
        if self.action in ('create', 'partial_update', 'update'):
            return CustomerWriteSerializer
        return CustomerDetailSerializer

    # ── Addresses ─────────────────────────────────────────────────────────────

    @action(detail=True, methods=['get', 'post'], url_path='addresses')
    def addresses(self, request, pk=None):
        customer = self.get_object()
        if request.method == 'GET':
            return Response(
                CustomerAddressSerializer(customer.addresses.all(), many=True).data
            )
        serializer = CustomerAddressWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if serializer.validated_data.get('is_default'):
            customer.addresses.update(is_default=False)
        address = serializer.save(customer=customer)
        return Response(CustomerAddressSerializer(address).data, status=status.HTTP_201_CREATED)

    @action(
        detail=True,
        methods=['patch', 'delete'],
        url_path=r'addresses/(?P<address_pk>\d+)',
    )
    def address_detail(self, request, pk=None, address_pk=None):
        customer = self.get_object()
        address = get_object_or_404(CustomerAddress, pk=address_pk, customer=customer)
        if request.method == 'DELETE':
            address.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        serializer = CustomerAddressWriteSerializer(address, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        if serializer.validated_data.get('is_default'):
            customer.addresses.exclude(pk=address_pk).update(is_default=False)
        address = serializer.save()
        return Response(CustomerAddressSerializer(address).data)
