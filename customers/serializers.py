from rest_framework import serializers
from .models import Customer, CustomerAddress


class CustomerAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerAddress
        fields = ('id', 'street', 'neighborhood', 'city', 'notes', 'is_default')


class CustomerAddressWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerAddress
        fields = ('street', 'neighborhood', 'city', 'notes', 'is_default')


class CustomerListSerializer(serializers.ModelSerializer):
    order_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Customer
        fields = ('id', 'name', 'phone', 'email', 'order_count', 'created_at')
        read_only_fields = ('created_at',)


class CustomerDetailSerializer(serializers.ModelSerializer):
    addresses = CustomerAddressSerializer(many=True, read_only=True)
    order_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Customer
        fields = (
            'id', 'name', 'phone', 'email', 'notes',
            'addresses', 'order_count', 'created_at', 'updated_at',
        )
        read_only_fields = ('created_at', 'updated_at')


class CustomerWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ('name', 'phone', 'email', 'notes')
