from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Category, Product, Customer, Sale

User = get_user_model()


# ── Category ──────────────────────────────────────────────────────────────────

class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.IntegerField(source='products.count', read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'product_count']


# ── Product ───────────────────────────────────────────────────────────────────

class ProductListSerializer(serializers.ModelSerializer):
    categories = CategorySerializer(many=True, read_only=True)
    available_stock = serializers.ReadOnlyField()
    stock_value_at_cost = serializers.ReadOnlyField()
    product_photo = serializers.SerializerMethodField()

    def get_product_photo(self, obj):
        if obj.product_photo:
            return obj.product_photo.url  # relative path, e.g. /inventory/products/...
        return None

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'brand', 'part_number', 'upc_code',
            'material', 'is_lead_free', 'max_pressure_psi',
            'buying_price', 'wholesale_price', 'min_price', 'max_price', 'tax_rate',
            'unit_of_measure', 'quantity_at_hand', 'quantity_allocated',
            'reorder_point', 'available_stock', 'stock_value_at_cost',
            'bin_location', 'supplier', 'weight',
            'categories', 'is_active', 'created_at', 'updated_at',
            'product_photo', 'description',
        ]


class ProductWriteSerializer(serializers.ModelSerializer):
    category_ids = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), many=True, write_only=True, required=False, source='categories'
    )

    class Meta:
        model = Product
        fields = [
            'name', 'brand', 'part_number', 'upc_code', 'description',
            'material', 'is_lead_free', 'max_pressure_psi',
            'buying_price', 'wholesale_price', 'min_price', 'max_price', 'tax_rate',
            'unit_of_measure', 'quantity_at_hand', 'reorder_point',
            'bin_location', 'supplier', 'weight', 'is_active',
            'category_ids', 'product_photo',
        ]

    def create(self, validated_data):
        categories = validated_data.pop('categories', [])
        product = Product.objects.create(**validated_data)
        product.categories.set(categories)
        return product

    def update(self, instance, validated_data):
        categories = validated_data.pop('categories', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if categories is not None:
            instance.categories.set(categories)
        return instance


# ── Customer ──────────────────────────────────────────────────────────────────

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ['id', 'name', 'email', 'phone', 'remaining_balance']


# ── Sale ──────────────────────────────────────────────────────────────────────

class SaleReadSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_brand = serializers.CharField(source='product.brand', read_only=True)
    customer_name = serializers.SerializerMethodField()
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = Sale
        fields = [
            'id', 'product', 'product_name', 'product_brand',
            'customer', 'customer_name',
            'quantity_sold', 'price_per_unit', 'total_amount',
            'date_sold', 'aproved', 'rejected', 'deleted',
            'created_by', 'created_by_username',
        ]

    def get_customer_name(self, obj):
        return obj.customer.name if obj.customer else None


class SaleWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sale
        fields = ['product', 'customer', 'quantity_sold', 'price_per_unit']

    def validate(self, attrs):
        product = attrs['product']
        qty = attrs['quantity_sold']
        if qty <= 0:
            raise serializers.ValidationError({'quantity_sold': 'Must be greater than zero.'})
        if product.available_stock < qty:
            raise serializers.ValidationError({
                'quantity_sold': f'Insufficient stock. Available: {product.available_stock}, requested: {qty}.'
            })
        return attrs

    def create(self, validated_data):
        request = self.context.get('request')
        return Sale.objects.create(created_by=request.user, **validated_data)


# ── User ──────────────────────────────────────────────────────────────────────

class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'firstname', 'lastname', 'full_name',
            'email', 'mobile', 'gender',
            'is_active', 'is_staff', 'is_admin', 'is_superuser', 'role',
            'date_joined', 'last_seen',
        ]
        read_only_fields = ['id', 'date_joined', 'last_seen']

    def get_role(self, obj):
        if obj.is_superuser:
            return 'admin'
        if obj.is_admin:
            return 'manager'
        return 'staff'

    def get_full_name(self, obj):
        return f"{obj.firstname or ''} {obj.lastname or ''}".strip() or obj.username


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    role = serializers.ChoiceField(choices=['staff', 'manager', 'admin'], default='staff', write_only=True)

    class Meta:
        model = User
        fields = [
            'username', 'firstname', 'lastname', 'email', 'mobile',
            'gender', 'is_active', 'password', 'role',
        ]

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError('Username already taken.')
        return value

    def create(self, validated_data):
        role = validated_data.pop('role', 'staff')
        password = validated_data.pop('password')
        role_map = {
            'staff':   (True, False, False),
            'manager': (True, True,  False),
            'admin':   (True, True,  True),
        }
        is_staff, is_admin, is_superuser = role_map[role]
        user = User(
            is_staff=is_staff, is_admin=is_admin, is_superuser=is_superuser,
            **validated_data
        )
        user.set_password(password)
        user.save()
        return user


# ── Dashboard summary ─────────────────────────────────────────────────────────

class DashboardSerializer(serializers.Serializer):
    period = serializers.CharField()
    revenue = serializers.DecimalField(max_digits=15, decimal_places=2)
    profit = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_sales_count = serializers.IntegerField()
    total_customers = serializers.IntegerField()
    pending_count = serializers.IntegerField()
    total_debt = serializers.DecimalField(max_digits=15, decimal_places=2)
    low_stock_count = serializers.IntegerField()
    top_products = serializers.ListField()
    chart_labels = serializers.ListField()
    chart_revenue = serializers.ListField()
