from collections import defaultdict
from datetime import timedelta

from django.db.models import Count, Sum
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

ACTIVE_STATUSES = [
    Order.PENDING_DEPOSIT, Order.DEPOSIT_PAID, Order.CONFIRMED,
    Order.IN_PRODUCTION, Order.READY, Order.OUT_FOR_DELIVERY, Order.DELIVERED,
]


# ── Público ───────────────────────────────────────────────────────────────────

class PublicDateAvailabilityView(APIView):
    """
    Devuelve fechas no disponibles para los próximos 90 días.
    Usado por el checkout para deshabilitar días llenos.
    """
    permission_classes = [AllowAny]

    def get(self, request, tenant_slug):
        tenant = get_object_or_404(Tenant, slug=tenant_slug, is_active=True)
        max_per_day = 0
        advance_hours = 48
        try:
            profile = tenant.profile
            max_per_day = profile.max_orders_per_day
            advance_hours = profile.advance_hours_required
        except Exception:
            pass

        today = timezone.localdate()
        min_date = today + timedelta(hours=advance_hours / 24)
        end_date = today + timedelta(days=90)

        unavailable = []
        if max_per_day:
            counts = (
                Order.objects
                .filter(
                    tenant=tenant,
                    required_date__gte=today,
                    required_date__lte=end_date,
                    status__in=ACTIVE_STATUSES,
                )
                .values('required_date')
                .annotate(count=Count('id'))
                .filter(count__gte=max_per_day)
            )
            unavailable = [str(row['required_date']) for row in counts]

        return Response({
            'min_date': str(min_date),
            'max_per_day': max_per_day,
            'unavailable': unavailable,
        })


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

    def _get_tenant(self):
        user = self.request.user
        if user.is_platform_owner:
            slug = self.request.query_params.get('tenant')
            return get_object_or_404(Tenant, slug=slug, is_active=True) if slug else None
        return user.tenant

    @action(detail=False, methods=['get'], url_path='calendar')
    def calendar(self, request):
        """Pedidos agrupados por día para un mes (para la vista calendario del admin)."""
        month_str = request.query_params.get('month', timezone.localdate().strftime('%Y-%m'))
        try:
            year, month = map(int, month_str.split('-'))
        except (ValueError, AttributeError):
            return Response({'error': 'Formato inválido. Usar YYYY-MM.'}, status=400)

        tenant = self._get_tenant()
        if not tenant:
            return Response({'error': 'tenant requerido.'}, status=400)

        max_per_day = 0
        try:
            max_per_day = tenant.profile.max_orders_per_day
        except Exception:
            pass

        orders = (
            Order.objects
            .filter(
                tenant=tenant,
                required_date__year=year,
                required_date__month=month,
                status__in=ACTIVE_STATUSES,
            )
            .select_related('customer')
            .order_by('required_date', 'created_at')
        )

        by_date = defaultdict(list)
        for order in orders:
            by_date[str(order.required_date)].append({
                'id': order.id,
                'customer': order.customer.name,
                'status': order.status,
                'status_display': order.get_status_display(),
                'total': str(order.total),
            })

        return Response({
            'month': month_str,
            'max_per_day': max_per_day,
            'days': {
                date: {'count': len(items), 'orders': items}
                for date, items in by_date.items()
            },
        })

    @action(detail=False, methods=['get'], url_path='production')
    def production(self, request):
        """Lista de producción detallada para una fecha: pedidos + resumen de items."""
        date_str = request.query_params.get('date')
        if not date_str:
            return Response({'error': 'Parámetro date requerido (YYYY-MM-DD).'}, status=400)

        tenant = self._get_tenant()
        if not tenant:
            return Response({'error': 'tenant requerido.'}, status=400)

        orders = (
            Order.objects
            .filter(
                tenant=tenant,
                required_date=date_str,
                status__in=ACTIVE_STATUSES,
            )
            .select_related('customer', 'delivery_zone')
            .prefetch_related('items')
            .order_by('created_at')
        )

        product_totals = defaultdict(lambda: defaultdict(int))
        for order in orders:
            for item in order.items.all():
                product_totals[item.product_name][item.variant_name] += item.quantity

        summary = sorted([
            {
                'product': product,
                'variants': [
                    {'name': v, 'quantity': q}
                    for v, q in sorted(variants.items())
                ],
                'total_units': sum(variants.values()),
            }
            for product, variants in product_totals.items()
        ], key=lambda x: x['product'])

        return Response({
            'date': date_str,
            'orders': OrderDetailSerializer(orders, many=True).data,
            'production_summary': summary,
        })
