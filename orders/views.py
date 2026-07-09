from django.db.models import Sum
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from tenants.models import Tenant
from .models import Order, OrderStatusHistory
from .serializers import (
    OrderCreateSerializer, OrderDetailSerializer, OrderListSerializer,
    OrderStatusUpdateSerializer,
)


# ── Público ───────────────────────────────────────────────────────────────────

class PublicOrderCreateView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, tenant_slug):
        tenant = get_object_or_404(Tenant, slug=tenant_slug, is_active=True)
        serializer = OrderCreateSerializer(
            data=request.data, context={'tenant': tenant, 'request': request}
        )
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response(
            OrderDetailSerializer(order).data,
            status=status.HTTP_201_CREATED,
        )


class PublicOrderDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, tenant_slug, pk):
        tenant = get_object_or_404(Tenant, slug=tenant_slug, is_active=True)
        order = get_object_or_404(
            Order.objects.prefetch_related('items', 'status_history')
                         .select_related('customer', 'delivery_zone'),
            pk=pk, tenant=tenant,
        )
        return Response(OrderDetailSerializer(order).data)


# ── Admin ─────────────────────────────────────────────────────────────────────

class AdminOrderViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'patch', 'head', 'options']

    def get_queryset(self):
        user = self.request.user
        qs = (
            Order.objects
            .select_related('customer', 'delivery_zone', 'tenant')
            .prefetch_related('items', 'status_history')
            .order_by('-created_at')
        )
        if not user.is_platform_owner:
            qs = qs.filter(tenant=user.tenant)
        else:
            slug = self.request.query_params.get('tenant')
            if slug:
                qs = qs.filter(tenant__slug=slug)

        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)

        date_filter = self.request.query_params.get('date')
        if date_filter:
            qs = qs.filter(required_date=date_filter)

        customer_filter = self.request.query_params.get('customer')
        if customer_filter:
            qs = qs.filter(customer__phone__icontains=customer_filter)

        return qs

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return OrderDetailSerializer
        return OrderListSerializer

    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        today = timezone.localdate()
        qs = self.get_queryset()
        active = ['confirmed', 'in_production', 'ready', 'out_for_delivery']
        revenue_qs = self.get_queryset().filter(
            status__in=[*active, 'delivered'],
            created_at__year=today.year,
            created_at__month=today.month,
        )
        return Response({
            'pending_deposit': qs.filter(status='pending_deposit').count(),
            'deposit_paid': qs.filter(status='deposit_paid').count(),
            'active': qs.filter(status__in=active).count(),
            'today_orders': qs.filter(required_date=today).count(),
            'monthly_revenue': float(revenue_qs.aggregate(t=Sum('total'))['t'] or 0),
        })

    @action(detail=True, methods=['patch'], url_path='status')
    def update_status(self, request, pk=None):
        order = self.get_object()
        serializer = OrderStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_status = serializer.validated_data['status']
        notes = serializer.validated_data.get('notes', '')
        prev_status = order.status

        OrderStatusHistory.objects.create(
            order=order,
            from_status=prev_status,
            to_status=new_status,
            changed_by=request.user,
            notes=notes,
        )
        order.status = new_status
        order.save(update_fields=['status', 'updated_at'])

        try:
            from notifications.services import notify_order_status
            notify_order_status(order.tenant, order, prev_status, new_status, request.user)
        except Exception:
            pass

        return Response(OrderDetailSerializer(order).data)
