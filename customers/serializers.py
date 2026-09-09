from rest_framework import serializers
from .models import Customer, CustomerAddress, Review


class CustomerPublicRegisterSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=200)
    phone = serializers.CharField(max_length=50)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, write_only=True)


class CustomerPublicProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ('id', 'name', 'phone', 'email', 'created_at')
        read_only_fields = ('id', 'created_at')


class CustomerPublicProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ('name', 'phone')


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


class ReviewPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ('id', 'author_name', 'rating', 'text', 'created_at')


class ReviewCreateSerializer(serializers.Serializer):
    rating = serializers.IntegerField(min_value=1, max_value=5)
    text = serializers.CharField(min_length=5, max_length=1000)
