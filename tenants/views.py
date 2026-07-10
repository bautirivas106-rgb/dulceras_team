from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Count, Sum
from django.shortcuts import get_object_or_404
from rest_framework import serializers, status, viewsets
from rest_framework.decorators import action
from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination

from .models import BusinessProfile, Tenant, DeliveryZone

User = get_user_model()


# ── Permission ────────────────────────────────────────────────────────────────

class IsPlatformOwner(IsAuthenticated):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.is_platform_owner


# ── Public ────────────────────────────────────────────────────────────────────

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


# ── Superadmin serializers ────────────────────────────────────────────────────

class BusinessProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusinessProfile
        fields = (
            'address', 'phone', 'email', 'whatsapp', 'instagram',
            'advance_hours_required', 'deposit_percentage', 'max_orders_per_day',
        )


class TenantListSerializer(serializers.ModelSerializer):
    profile = BusinessProfileSerializer(read_only=True)
    order_count = serializers.IntegerField(read_only=True)
    user_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Tenant
        fields = ('id', 'name', 'slug', 'is_active', 'profile', 'order_count', 'user_count', 'created_at')
        read_only_fields = ('id', 'created_at')


class TenantCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=200)
    slug = serializers.SlugField(max_length=50)
    address = serializers.CharField(max_length=500, required=False, allow_blank=True, default='')
    phone = serializers.CharField(max_length=50, required=False, allow_blank=True, default='')
    email = serializers.EmailField(required=False, allow_blank=True, default='')
    whatsapp = serializers.CharField(max_length=50, required=False, allow_blank=True, default='')
    instagram = serializers.CharField(max_length=100, required=False, allow_blank=True, default='')
    admin_username = serializers.CharField(max_length=150)
    admin_password = serializers.CharField(min_length=8)
    admin_email = serializers.EmailField(required=False, allow_blank=True, default='')

    def validate_slug(self, value):
        if Tenant.objects.filter(slug=value).exists():
            raise serializers.ValidationError('Ya existe un negocio con ese slug.')
        return value

    def validate_admin_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('Ese nombre de usuario ya está en uso.')
        return value

    @transaction.atomic
    def create(self, validated_data):
        tenant = Tenant.objects.create(
            name=validated_data['name'],
            slug=validated_data['slug'],
        )
        BusinessProfile.objects.create(
            tenant=tenant,
            address=validated_data.get('address', ''),
            phone=validated_data.get('phone', ''),
            email=validated_data.get('email', ''),
            whatsapp=validated_data.get('whatsapp', ''),
            instagram=validated_data.get('instagram', ''),
        )
        user = User.objects.create_user(
            username=validated_data['admin_username'],
            password=validated_data['admin_password'],
            email=validated_data.get('admin_email', ''),
            tenant=tenant,
            role=User.TENANT_ADMIN,
        )
        return tenant, user


class TenantUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'is_active', 'date_joined')
        read_only_fields = ('id', 'date_joined')


class UserCreateSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(min_length=8)
    email = serializers.EmailField(required=False, allow_blank=True, default='')
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES, default=User.STAFF_VENTAS)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('Ese nombre de usuario ya está en uso.')
        return value


# ── Superadmin views ──────────────────────────────────────────────────────────

class SuperadminTenantViewSet(viewsets.ViewSet):
    permission_classes = [IsPlatformOwner]

    def _annotate_tenants(self, qs):
        from orders.models import Order
        from django.db.models import OuterRef, Subquery, IntegerField
        order_count_sq = (
            Order.objects.filter(tenant=OuterRef('pk'))
            .values('tenant')
            .annotate(c=Count('id'))
            .values('c')
        )
        user_count_sq = (
            User.objects.filter(tenant=OuterRef('pk'))
            .values('tenant')
            .annotate(c=Count('id'))
            .values('c')
        )
        return qs.annotate(
            order_count=Subquery(order_count_sq, output_field=IntegerField()),
            user_count=Subquery(user_count_sq, output_field=IntegerField()),
        )

    def list(self, request):
        tenants = self._annotate_tenants(Tenant.objects.all()).order_by('-created_at')
        return Response(TenantListSerializer(tenants, many=True).data)

    def retrieve(self, request, pk=None):
        tenant = get_object_or_404(self._annotate_tenants(Tenant.objects.all()), pk=pk)
        users = User.objects.filter(tenant=tenant).order_by('username')
        from orders.models import Order
        revenue = Order.objects.filter(tenant=tenant, status__in=[
            'deposit_paid', 'confirmed', 'in_production', 'ready', 'out_for_delivery', 'delivered'
        ]).aggregate(total=Sum('total'))['total'] or 0
        return Response({
            **TenantListSerializer(tenant).data,
            'users': TenantUserSerializer(users, many=True).data,
            'revenue': float(revenue),
        })

    def create(self, request):
        serializer = TenantCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        tenant, user = serializer.save()
        annotated = self._annotate_tenants(Tenant.objects.filter(pk=tenant.pk)).first()
        return Response(
            {'tenant': TenantListSerializer(annotated).data, 'admin_username': user.username},
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=['post'], url_path='toggle')
    def toggle(self, request, pk=None):
        tenant = get_object_or_404(Tenant, pk=pk)
        tenant.is_active = not tenant.is_active
        tenant.save(update_fields=['is_active'])
        return Response({'is_active': tenant.is_active})

    @action(detail=True, methods=['patch'], url_path='profile')
    def update_profile(self, request, pk=None):
        tenant = get_object_or_404(Tenant, pk=pk)
        profile, _ = BusinessProfile.objects.get_or_create(tenant=tenant)
        serializer = BusinessProfileSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='users')
    def add_user(self, request, pk=None):
        tenant = get_object_or_404(Tenant, pk=pk)
        serializer = UserCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        d = serializer.validated_data
        user = User.objects.create_user(
            username=d['username'],
            password=d['password'],
            email=d.get('email', ''),
            tenant=tenant,
            role=d['role'],
        )
        return Response(TenantUserSerializer(user).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], url_path='metrics')
    def metrics(self, request):
        from orders.models import Order
        total_tenants = Tenant.objects.count()
        active_tenants = Tenant.objects.filter(is_active=True).count()
        total_orders = Order.objects.count()
        total_revenue = Order.objects.filter(status__in=[
            'deposit_paid', 'confirmed', 'in_production', 'ready', 'out_for_delivery', 'delivered'
        ]).aggregate(t=Sum('total'))['t'] or 0
        total_users = User.objects.filter(role__in=[
            User.TENANT_ADMIN, User.STAFF_VENTAS, User.STAFF_PRODUCCION, User.STAFF_CAJA
        ]).count()
        from orders.models import Order as Ord
        from django.db.models import OuterRef, Subquery, IntegerField
        ocount_sq = (
            Ord.objects.filter(tenant=OuterRef('pk'))
            .values('tenant').annotate(c=Count('id')).values('c')
        )
        by_tenant = list(
            Tenant.objects
            .annotate(orders=Subquery(ocount_sq, output_field=IntegerField()))
            .values('id', 'name', 'slug', 'is_active', 'orders')
            .order_by('-orders')
        )
        return Response({
            'total_tenants': total_tenants,
            'active_tenants': active_tenants,
            'total_orders': total_orders,
            'total_revenue': float(total_revenue),
            'total_users': total_users,
            'by_tenant': by_tenant,
        })


# ── Admin delivery zones ──────────────────────────────────────────────────────

class AdminDeliveryZoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryZone
        fields = ('id', 'name', 'description', 'price', 'is_active')


class AdminDeliveryZoneViewSet(viewsets.ModelViewSet):
    serializer_class = AdminDeliveryZoneSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        user = self.request.user
        if user.is_platform_owner:
            slug = self.request.query_params.get('tenant')
            if slug:
                tenant = get_object_or_404(Tenant, slug=slug)
                return DeliveryZone.objects.filter(tenant=tenant).order_by('price')
            if user.tenant:
                return DeliveryZone.objects.filter(tenant=user.tenant).order_by('price')
            return DeliveryZone.objects.none()
        return DeliveryZone.objects.filter(tenant=user.tenant).order_by('price')

    def perform_create(self, serializer):
        user = self.request.user
        if user.is_platform_owner:
            slug = self.request.query_params.get('tenant')
            tenant = get_object_or_404(Tenant, slug=slug) if slug else user.tenant
        else:
            tenant = user.tenant
        serializer.save(tenant=tenant)


# ── Admin settings (tenant propio) ───────────────────────────────────────────

class TenantSettingsSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=200, required=False)
    address = serializers.CharField(max_length=500, required=False, allow_blank=True)
    phone = serializers.CharField(max_length=50, required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    whatsapp = serializers.CharField(max_length=50, required=False, allow_blank=True)
    instagram = serializers.CharField(max_length=100, required=False, allow_blank=True)
    advance_hours_required = serializers.IntegerField(min_value=0, required=False)
    deposit_percentage = serializers.DecimalField(max_digits=5, decimal_places=2, required=False)
    max_orders_per_day = serializers.IntegerField(min_value=0, required=False)


class TenantSettingsView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_tenant(self):
        user = self.request.user
        if user.is_platform_owner:
            slug = self.request.query_params.get('tenant')
            if slug:
                return get_object_or_404(Tenant, slug=slug)
            return user.tenant
        return user.tenant

    def get(self, request):
        tenant = self._get_tenant()
        if not tenant:
            return Response({'error': 'tenant requerido.'}, status=400)
        profile, _ = BusinessProfile.objects.get_or_create(tenant=tenant)
        return Response({
            'name': tenant.name,
            'slug': tenant.slug,
            'address': profile.address,
            'phone': profile.phone,
            'email': profile.email,
            'whatsapp': profile.whatsapp,
            'instagram': profile.instagram,
            'advance_hours_required': profile.advance_hours_required,
            'deposit_percentage': str(profile.deposit_percentage),
            'max_orders_per_day': profile.max_orders_per_day,
        })

    def patch(self, request):
        tenant = self._get_tenant()
        if not tenant:
            return Response({'error': 'tenant requerido.'}, status=400)
        serializer = TenantSettingsSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        d = serializer.validated_data

        if 'name' in d:
            tenant.name = d['name']
            tenant.save(update_fields=['name'])

        profile, _ = BusinessProfile.objects.get_or_create(tenant=tenant)
        profile_fields = ['address', 'phone', 'email', 'whatsapp', 'instagram',
                          'advance_hours_required', 'deposit_percentage', 'max_orders_per_day']
        updated = [f for f in profile_fields if f in d]
        for f in updated:
            setattr(profile, f, d[f])
        if updated:
            profile.save(update_fields=updated)

        return self.get(request)
