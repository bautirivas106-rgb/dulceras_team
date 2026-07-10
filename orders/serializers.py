from datetime import date, timedelta

from django.db import transaction
from rest_framework import serializers

from catalog.models import ProductVariant
from customers.models import Customer, CustomerAddress
from tenants.models import DeliveryZone
from .models import Order, OrderItem, OrderStatusHistory


# ── Lectura ───────────────────────────────────────────────────────────────────

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ('id', 'product_name', 'variant_name', 'unit_price', 'quantity', 'subtotal')


class OrderStatusHistorySerializer(serializers.ModelSerializer):
    changed_by = serializers.StringRelatedField()

    class Meta:
        model = OrderStatusHistory
        fields = ('from_status', 'to_status', 'changed_by', 'changed_at', 'notes')


class OrderCustomerSerializer(serializers.Serializer):
    name = serializers.CharField()
    phone = serializers.CharField()
    email = serializers.EmailField(allow_blank=True)


class OrderListSerializer(serializers.ModelSerializer):
    customer = OrderCustomerSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    delivery_method_display = serializers.CharField(source='get_delivery_method_display', read_only=True)

    class Meta:
        model = Order
        fields = (
            'id', 'status', 'status_display',
            'customer', 'delivery_method', 'delivery_method_display',
            'required_date', 'total', 'deposit_amount', 'balance_amount',
            'created_at',
        )


class OrderDetailSerializer(serializers.ModelSerializer):
    customer = OrderCustomerSerializer(read_only=True)
    items = OrderItemSerializer(many=True, read_only=True)
    status_history = OrderStatusHistorySerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    delivery_method_display = serializers.CharField(source='get_delivery_method_display', read_only=True)
    delivery_zone_name = serializers.CharField(source='delivery_zone.name', read_only=True, default=None)

    class Meta:
        model = Order
        fields = (
            'id', 'status', 'status_display',
            'customer', 'delivery_method', 'delivery_method_display',
            'delivery_zone', 'delivery_zone_name', 'required_date',
            'subtotal', 'delivery_cost', 'total',
            'deposit_percentage', 'deposit_amount', 'balance_amount',
            'notes', 'items', 'status_history', 'created_at', 'updated_at',
        )


# ── Checkout público ──────────────────────────────────────────────────────────

class OrderItemInputSerializer(serializers.Serializer):
    variant_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)


class OrderCreateSerializer(serializers.Serializer):
    customer_name = serializers.CharField(max_length=200)
    customer_phone = serializers.CharField(max_length=50)
    customer_email = serializers.EmailField(required=False, allow_blank=True, default='')

    items = OrderItemInputSerializer(many=True)

    delivery_method = serializers.ChoiceField(choices=Order.DELIVERY_CHOICES)
    delivery_zone_id = serializers.IntegerField(required=False, allow_null=True, default=None)
    required_date = serializers.DateField()

    address_street = serializers.CharField(max_length=300, required=False, allow_blank=True, default='')
    address_neighborhood = serializers.CharField(max_length=100, required=False, allow_blank=True, default='')

    notes = serializers.CharField(required=False, allow_blank=True, default='')

    def validate(self, attrs):
        tenant = self.context['tenant']
        errors = {}

        # Validar que items no esté vacío
        items = attrs.get('items', [])
        if not items:
            raise serializers.ValidationError({'items': 'El pedido debe tener al menos un producto.'})

        # Validar variantes, anticipación y stock
        max_advance_hours = 0
        for i, item in enumerate(items):
            try:
                variant = ProductVariant.objects.select_related('product').get(
                    pk=item['variant_id'], tenant=tenant, is_active=True
                )
                max_advance_hours = max(max_advance_hours, variant.product.requires_advance_hours)
                if not variant.product.made_to_order:
                    if variant.stock_quantity < item['quantity']:
                        available = variant.stock_quantity
                        errors[f'items_{i}_quantity'] = (
                            f'Stock insuficiente para "{variant.product.name} — {variant.name}". '
                            f'Disponible: {available}.'
                        )
            except ProductVariant.DoesNotExist:
                errors[f'items_{i}_variant_id'] = f'Variante {item["variant_id"]} no disponible.'

        if errors:
            raise serializers.ValidationError(errors)

        # Validar fecha mínima (comparación de date con date)
        required_date = attrs['required_date']
        min_date = date.today() + timedelta(days=max_advance_hours // 24 + (1 if max_advance_hours % 24 else 0))
        if required_date < min_date:
            raise serializers.ValidationError({
                'required_date': (
                    f'Se requieren al menos {max_advance_hours} horas de anticipacion. '
                    f'Fecha minima disponible: {min_date}.'
                )
            })

        # Validar límite diario de pedidos
        try:
            max_per_day = tenant.profile.max_orders_per_day
        except Exception:
            max_per_day = 0
        if max_per_day > 0:
            orders_that_day = Order.objects.filter(
                tenant=tenant,
                required_date=required_date,
            ).exclude(status__in=['cancelled', 'refunded']).count()
            if orders_that_day >= max_per_day:
                raise serializers.ValidationError({
                    'required_date': (
                        f'Ya se alcanzó el límite de {max_per_day} pedido(s) para el '
                        f'{required_date.strftime("%d/%m/%Y")}. Elegí otra fecha.'
                    )
                })

        # Validar entrega
        if attrs['delivery_method'] == Order.DELIVERY:
            if not attrs.get('delivery_zone_id'):
                errors['delivery_zone_id'] = 'La zona de entrega es obligatoria para delivery.'
            if not attrs.get('address_street', '').strip():
                errors['address_street'] = 'La direccion de entrega es obligatoria para delivery.'
            if errors:
                raise serializers.ValidationError(errors)

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        tenant = self.context['tenant']

        # Cliente: get_or_create por teléfono
        customer, _ = Customer.objects.get_or_create(
            tenant=tenant,
            phone=validated_data['customer_phone'],
            defaults={
                'name': validated_data['customer_name'],
                'email': validated_data.get('customer_email', ''),
            },
        )

        # Zona y dirección si es delivery
        delivery_address = None
        delivery_zone = None
        delivery_cost = 0

        if validated_data['delivery_method'] == Order.DELIVERY:
            delivery_address = CustomerAddress.objects.create(
                customer=customer,
                street=validated_data['address_street'],
                neighborhood=validated_data.get('address_neighborhood', ''),
            )
            zone_id = validated_data.get('delivery_zone_id')
            if zone_id:
                try:
                    delivery_zone = DeliveryZone.objects.get(pk=zone_id, tenant=tenant, is_active=True)
                    delivery_cost = delivery_zone.price
                except DeliveryZone.DoesNotExist:
                    pass

        # Recalcular precios desde DB (no confiar en el frontend)
        # select_for_update bloquea las filas de variante para evitar race conditions de stock
        subtotal = 0
        item_rows = []
        for item in validated_data['items']:
            variant = (
                ProductVariant.objects
                .select_related('product')
                .select_for_update()
                .get(pk=item['variant_id'], tenant=tenant)
            )
            if not variant.product.made_to_order:
                if variant.stock_quantity < item['quantity']:
                    raise serializers.ValidationError({
                        f'items_stock': (
                            f'Stock insuficiente para "{variant.product.name} — {variant.name}". '
                            f'Disponible: {variant.stock_quantity}.'
                        )
                    })
                ProductVariant.objects.filter(pk=variant.pk).update(
                    stock_quantity=variant.stock_quantity - item['quantity']
                )
            line_total = variant.price * item['quantity']
            subtotal += line_total
            item_rows.append({
                'variant': variant,
                'product_name': variant.product.name,
                'variant_name': variant.name,
                'unit_price': variant.price,
                'quantity': item['quantity'],
                'subtotal': line_total,
            })

        try:
            deposit_pct = tenant.profile.deposit_percentage
        except Exception:
            deposit_pct = 50

        total = subtotal + delivery_cost
        deposit_amount = round(total * deposit_pct / 100, 2)
        balance_amount = total - deposit_amount

        order = Order.objects.create(
            tenant=tenant,
            customer=customer,
            status=Order.PENDING_DEPOSIT,
            delivery_method=validated_data['delivery_method'],
            delivery_zone=delivery_zone,
            delivery_address=delivery_address,
            required_date=validated_data['required_date'],
            subtotal=subtotal,
            delivery_cost=delivery_cost,
            total=total,
            deposit_percentage=deposit_pct,
            deposit_amount=deposit_amount,
            balance_amount=balance_amount,
            notes=validated_data.get('notes', ''),
        )

        OrderItem.objects.bulk_create([
            OrderItem(
                order=order,
                product_variant=row['variant'],
                product_name=row['product_name'],
                variant_name=row['variant_name'],
                unit_price=row['unit_price'],
                quantity=row['quantity'],
                subtotal=row['subtotal'],
            )
            for row in item_rows
        ])

        OrderStatusHistory.objects.create(
            order=order,
            from_status='',
            to_status=Order.PENDING_DEPOSIT,
            changed_by=None,
            notes='Pedido creado via checkout',
        )

        try:
            from notifications.services import notify_new_order
            notify_new_order(tenant, order)
        except Exception:
            pass

        return order


# ── Admin: cambio de estado ───────────────────────────────────────────────────

class OrderStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Order.STATUS_CHOICES)
    notes = serializers.CharField(required=False, allow_blank=True, default='')
