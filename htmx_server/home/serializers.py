from rest_framework import serializers
from decimal import Decimal
from django.contrib.auth import get_user_model

from .models import (
    Business, Category, Product, Customer,
    Sale, SaleOrder, SaleStatusHistory,
    Document, DocumentItem,
    PickingOrder, PickingOrderItem,
    GatePass, GatePassItem,
    StockRefill,
)
from notifications.models import Notification

User = get_user_model()


# ─────────────────────────────────────────────────────────────────────────────
#  CATEGORY
# ─────────────────────────────────────────────────────────────────────────────

class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.IntegerField(source='products.count', read_only=True)

    class Meta:
        model  = Category
        fields = ['id', 'name', 'product_count']


# ─────────────────────────────────────────────────────────────────────────────
#  PRODUCT
# ─────────────────────────────────────────────────────────────────────────────

class ProductListSerializer(serializers.ModelSerializer):
    categories          = CategorySerializer(many=True, read_only=True)
    available_stock     = serializers.ReadOnlyField()
    stock_value_at_cost = serializers.ReadOnlyField()
    average_price       = serializers.ReadOnlyField()
    product_photo       = serializers.SerializerMethodField()

    def get_product_photo(self, obj):
        return obj.product_photo.url if obj.product_photo else None

    class Meta:
        model  = Product
        fields = [
            'id', 'name', 'brand', 'part_number', 'upc_code', 'description',
            'material', 'is_lead_free', 'max_pressure_psi',
            'buying_price', 'wholesale_price', 'min_price', 'max_price',
            'average_price', 'tax_rate',
            'unit_of_measure', 'quantity_at_hand', 'quantity_tons', 'quantity_allocated',
            'available_stock', 'reorder_point', 'stock_value_at_cost',
            'bin_location', 'supplier', 'weight',
            'categories', 'is_active', 'created_at', 'updated_at',
            'product_photo',
        ]


class ProductWriteSerializer(serializers.ModelSerializer):
    category_ids = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), many=True,
        write_only=True, required=False, source='categories',
    )

    class Meta:
        model  = Product
        fields = [
            'name', 'brand', 'part_number', 'upc_code', 'description',
            'material', 'is_lead_free', 'max_pressure_psi',
            'buying_price', 'wholesale_price', 'min_price', 'max_price', 'tax_rate',
            'unit_of_measure', 'quantity_at_hand', 'quantity_tons', 'reorder_point',
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


# ─────────────────────────────────────────────────────────────────────────────
#  BUSINESS
# ─────────────────────────────────────────────────────────────────────────────

class BusinessSerializer(serializers.ModelSerializer):
    owner_username = serializers.SerializerMethodField()
    member_count   = serializers.IntegerField(source='members.count', read_only=True)
    product_count  = serializers.IntegerField(source='inventory.count', read_only=True)
    member_ids     = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), many=True,
        write_only=True, required=False, source='members',
    )

    class Meta:
        model  = Business
        fields = ['id', 'name', 'owner', 'owner_username', 'member_count', 'product_count', 'member_ids']
        read_only_fields = ['id', 'owner']

    def get_owner_username(self, obj):
        return obj.owner.username if obj.owner else None

    def create(self, validated_data):
        members = validated_data.pop('members', [])
        business = Business.objects.create(**validated_data)
        business.members.set(members)
        return business

    def update(self, instance, validated_data):
        members = validated_data.pop('members', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if members is not None:
            instance.members.set(members)
        return instance


# ─────────────────────────────────────────────────────────────────────────────
#  CUSTOMER
# ─────────────────────────────────────────────────────────────────────────────

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Customer
        fields = ['id', 'name', 'email', 'phone', 'remaining_balance', 'debt_due_date']


# ─────────────────────────────────────────────────────────────────────────────
#  SALE
# ─────────────────────────────────────────────────────────────────────────────

class SaleReadSerializer(serializers.ModelSerializer):
    product_name        = serializers.CharField(source='product.name', read_only=True)
    product_brand       = serializers.CharField(source='product.brand', read_only=True)
    customer_name       = serializers.SerializerMethodField()
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    sale_code           = serializers.ReadOnlyField()

    class Meta:
        model  = Sale
        fields = [
            'id', 'sale_code', 'order',
            'product', 'product_name', 'product_brand',
            'customer', 'customer_name',
            'quantity_sold', 'price_per_unit', 'total_amount',
            'date_sold', 'aproved', 'rejected', 'deleted',
            'created_by', 'created_by_username',
        ]

    def get_customer_name(self, obj):
        return obj.customer.name if obj.customer else None


class SaleWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Sale
        fields = ['product', 'customer', 'quantity_sold', 'price_per_unit']

    def validate(self, attrs):
        product = attrs['product']
        qty     = attrs['quantity_sold']
        if qty <= 0:
            raise serializers.ValidationError({'quantity_sold': 'Must be greater than zero.'})
        if product.available_stock < qty:
            raise serializers.ValidationError({
                'quantity_sold': (
                    f'Insufficient stock. '
                    f'Available: {product.available_stock}, requested: {qty}.'
                )
            })
        return attrs

    def create(self, validated_data):
        return Sale.objects.create(
            created_by=self.context['request'].user,
            **validated_data,
        )


# ─────────────────────────────────────────────────────────────────────────────
#  SALE ORDER
# ─────────────────────────────────────────────────────────────────────────────

class CheckoutItemSerializer(serializers.Serializer):
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())
    quantity_sold = serializers.IntegerField(min_value=1)
    price_per_unit = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal('0.01'))


class CheckoutSerializer(serializers.Serializer):
    customer = serializers.PrimaryKeyRelatedField(
        queryset=Customer.objects.all(), required=False, allow_null=True,
    )
    notes = serializers.CharField(required=False, allow_blank=True, default='')
    items = CheckoutItemSerializer(many=True, allow_empty=False)

    def validate_items(self, items):
        # Lock and aggregate repeated products so splitting one product across
        # multiple lines cannot bypass the available-stock check.
        products = {
            p.pk: p for p in Product.objects.select_for_update().filter(
                pk__in=[item['product'].pk for item in items]
            )
        }
        requested = {}
        for item in items:
            product = products[item['product'].pk]
            item['product'] = product
            requested[product.pk] = requested.get(product.pk, 0) + item['quantity_sold']
            if requested[product.pk] > product.available_stock:
                raise serializers.ValidationError(f'Insufficient stock for {product.name}. Available: {product.available_stock}.')
            price = item['price_per_unit']
            if (product.min_price is not None and product.max_price is not None
                    and not product.min_price <= price <= product.max_price):
                raise serializers.ValidationError(
                    f'Price for {product.name} must be between {product.min_price} and {product.max_price}.'
                )
        return items


class SaleStatusHistorySerializer(serializers.ModelSerializer):
    changed_by_username = serializers.CharField(source='changed_by.username', read_only=True)

    class Meta:
        model  = SaleStatusHistory
        fields = ['id', 'from_status', 'to_status', 'changed_by_username', 'note', 'changed_at']


class SaleOrderSerializer(serializers.ModelSerializer):
    order_code          = serializers.ReadOnlyField()
    total_amount        = serializers.ReadOnlyField()
    customer_name       = serializers.SerializerMethodField()
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    verified_by_username = serializers.SerializerMethodField()
    sales               = SaleReadSerializer(many=True, read_only=True)
    history             = SaleStatusHistorySerializer(many=True, read_only=True)

    class Meta:
        model  = SaleOrder
        fields = [
            'id', 'order_code',
            'customer', 'customer_name',
            'created_by', 'created_by_username',
            'workflow_status', 'notes',
            'created_at', 'updated_at',
            'verified_by', 'verified_by_username', 'verified_at',
            'dispatched_at', 'total_amount',
            'sales', 'history',
        ]
        read_only_fields = [
            'id', 'order_code', 'created_at', 'updated_at',
            'verified_at', 'dispatched_at',
        ]

    def get_customer_name(self, obj):
        return obj.customer.name if obj.customer else None

    def get_verified_by_username(self, obj):
        return obj.verified_by.username if obj.verified_by else None


class SaleOrderListSerializer(serializers.ModelSerializer):
    """Lightweight version for list endpoints."""
    order_code    = serializers.ReadOnlyField()
    total_amount  = serializers.ReadOnlyField()
    customer_name = serializers.SerializerMethodField()
    item_count    = serializers.SerializerMethodField()

    class Meta:
        model  = SaleOrder
        fields = [
            'id', 'order_code', 'customer', 'customer_name',
            'workflow_status', 'item_count', 'total_amount',
            'created_at', 'dispatched_at',
        ]

    def get_customer_name(self, obj):
        return obj.customer.name if obj.customer else None

    def get_item_count(self, obj):
        return obj.sales.count()


# ─────────────────────────────────────────────────────────────────────────────
#  DOCUMENT (Invoice / Quotation)
# ─────────────────────────────────────────────────────────────────────────────

class DocumentItemSerializer(serializers.ModelSerializer):
    class Meta:
        model  = DocumentItem
        fields = ['id', 'product', 'description', 'unit', 'quantity', 'unit_price', 'total']
        read_only_fields = ['total']


class DocumentSerializer(serializers.ModelSerializer):
    items               = DocumentItemSerializer(many=True, read_only=True)
    customer_name       = serializers.CharField(source='customer.name', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model  = Document
        fields = [
            'id', 'number', 'doc_type',
            'customer', 'customer_name',
            'created_by', 'created_by_username',
            'status', 'issue_date', 'due_date',
            'notes', 'terms', 'discount_percent', 'vat_percent', 'customer_tin',
            'subtotal', 'discount_amount', 'vat_amount', 'total',
            'created_at', 'updated_at',
            'items',
        ]
        read_only_fields = [
            'id', 'number', 'subtotal', 'discount_amount', 'vat_amount', 'total',
            'created_at', 'updated_at',
        ]


class DocumentWriteSerializer(serializers.ModelSerializer):
    items = DocumentItemSerializer(many=True, required=False)

    class Meta:
        model  = Document
        fields = [
            'doc_type', 'customer', 'status',
            'issue_date', 'due_date', 'notes', 'terms',
            'discount_percent', 'vat_percent', 'customer_tin', 'items',
        ]

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        doc = Document.objects.create(**validated_data)
        for item in items_data:
            DocumentItem.objects.create(document=doc, **item)
        doc.recompute_totals()
        return doc

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if items_data is not None:
            instance.items.all().delete()
            for item in items_data:
                DocumentItem.objects.create(document=instance, **item)
        instance.recompute_totals()
        return instance


# ─────────────────────────────────────────────────────────────────────────────
#  PICKING ORDER
# ─────────────────────────────────────────────────────────────────────────────

class PickingOrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    is_complete  = serializers.ReadOnlyField()
    shortfall    = serializers.ReadOnlyField()

    class Meta:
        model  = PickingOrderItem
        fields = [
            'id', 'product', 'product_name',
            'requested_qty', 'picked_qty',
            'is_complete', 'shortfall', 'notes',
        ]


class PickingOrderSerializer(serializers.ModelSerializer):
    picking_code        = serializers.ReadOnlyField()
    is_fully_picked     = serializers.ReadOnlyField()
    picker_username     = serializers.SerializerMethodField()
    items               = PickingOrderItemSerializer(many=True, read_only=True)
    order_code          = serializers.CharField(source='sale_order.order_code', read_only=True)

    class Meta:
        model  = PickingOrder
        fields = [
            'id', 'picking_code', 'sale_order', 'order_code',
            'picker', 'picker_username',
            'status', 'notes', 'is_fully_picked',
            'created_at', 'accepted_at', 'completed_at',
            'items',
        ]
        read_only_fields = ['id', 'picking_code', 'created_at', 'accepted_at', 'completed_at']

    def get_picker_username(self, obj):
        return obj.picker.username if obj.picker else None


# ─────────────────────────────────────────────────────────────────────────────
#  GATE PASS
# ─────────────────────────────────────────────────────────────────────────────

class GatePassItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model  = GatePassItem
        fields = ['id', 'product', 'product_name', 'requested_qty', 'picked_qty']


class GatePassSerializer(serializers.ModelSerializer):
    gp_code              = serializers.ReadOnlyField()
    order_code           = serializers.CharField(source='sale_order.order_code', read_only=True)
    verified_by_username = serializers.SerializerMethodField()
    items                = GatePassItemSerializer(many=True, read_only=True)

    class Meta:
        model  = GatePass
        fields = [
            'id', 'gp_code', 'gate_pass_number',
            'sale_order', 'order_code',
            'picking_order', 'verified_by', 'verified_by_username',
            'issued_at', 'is_used', 'items',
        ]
        read_only_fields = ['id', 'gp_code', 'gate_pass_number', 'issued_at']

    def get_verified_by_username(self, obj):
        return obj.verified_by.username if obj.verified_by else None


# ─────────────────────────────────────────────────────────────────────────────
#  STOCK REFILL
# ─────────────────────────────────────────────────────────────────────────────

class StockRefillSerializer(serializers.ModelSerializer):
    product_name       = serializers.CharField(source='product.name', read_only=True)
    refilled_by_username = serializers.SerializerMethodField()

    class Meta:
        model  = StockRefill
        fields = [
            'id', 'product', 'product_name',
            'quantity_added', 'quantity_after',
            'refilled_by', 'refilled_by_username',
            'notes', 'created_at',
        ]
        read_only_fields = ['id', 'quantity_after', 'created_at']

    def get_refilled_by_username(self, obj):
        return obj.refilled_by.username if obj.refilled_by else None


class StockRefillCreateSerializer(serializers.Serializer):
    quantity_added = serializers.IntegerField(min_value=1)
    notes          = serializers.CharField(required=False, allow_blank=True, default='')


# ─────────────────────────────────────────────────────────────────────────────
#  NOTIFICATION
# ─────────────────────────────────────────────────────────────────────────────

class NotificationSerializer(serializers.ModelSerializer):
    icon  = serializers.ReadOnlyField()
    color = serializers.ReadOnlyField()

    class Meta:
        model  = Notification
        fields = [
            'id', 'notification_type', 'title', 'message',
            'link', 'entity_id', 'is_read', 'created_at',
            'icon', 'color',
        ]
        read_only_fields = ['id', 'created_at']


# ─────────────────────────────────────────────────────────────────────────────
#  USER
# ─────────────────────────────────────────────────────────────────────────────

class UserSerializer(serializers.ModelSerializer):
    role             = serializers.SerializerMethodField()
    full_name        = serializers.SerializerMethodField()
    allowed_sections = serializers.ListField(child=serializers.CharField(), read_only=True)

    class Meta:
        model  = User
        fields = [
            'id', 'username', 'firstname', 'lastname', 'full_name',
            'email', 'mobile', 'gender',
            'is_active', 'is_staff', 'is_admin', 'is_superuser',
            'is_picker', 'is_sales', 'is_accountant',
            'role', 'allowed_sections',
            'date_joined', 'last_seen',
        ]
        read_only_fields = ['id', 'date_joined', 'last_seen']

    def get_role(self, obj):
        if obj.is_superuser: return 'admin'
        if obj.is_admin:     return 'manager'
        if obj.is_picker:    return 'picker'
        if obj.is_accountant: return 'accountant'
        if obj.is_sales:     return 'sales'
        return 'staff'

    def get_full_name(self, obj):
        return f"{obj.firstname or ''} {obj.lastname or ''}".strip() or obj.username


VALID_ROLES = ['staff', 'sales', 'accountant', 'picker', 'manager', 'admin']

_ROLE_FLAGS = {
    # role: (is_staff, is_admin, is_superuser, is_picker, is_sales, is_accountant)
    'staff':      (True,  False, False, False, False, False),
    'sales':      (True,  False, False, False, True,  False),
    'accountant': (True,  False, False, False, False, True),
    'picker':     (True,  False, False, True,  False, False),
    'manager':    (True,  True,  False, False, False, False),
    'admin':      (True,  True,  True,  False, False, False),
}

_ROLE_SECTIONS = {
    'staff':      ['dashboard', 'sales', 'orders', 'customers'],
    'sales':      ['dashboard', 'inventory', 'sales', 'orders', 'customers'],
    'accountant': ['dashboard', 'sales', 'billing'],
    'picker':     ['dashboard', 'orders'],
    'manager':    ['dashboard', 'inventory', 'sales', 'orders', 'customers', 'billing'],
    'admin':      ['dashboard', 'inventory', 'sales', 'orders', 'customers', 'billing', 'users'],
}


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    role     = serializers.ChoiceField(choices=VALID_ROLES, default='staff', write_only=True)
    sections = serializers.ListField(
        child=serializers.CharField(), write_only=True, required=False,
    )

    class Meta:
        model  = User
        fields = [
            'username', 'firstname', 'lastname', 'email', 'mobile',
            'gender', 'is_active', 'password', 'role', 'sections',
        ]

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError('Username already taken.')
        return value

    def create(self, validated_data):
        role     = validated_data.pop('role', 'staff')
        password = validated_data.pop('password')
        sections = validated_data.pop('sections', _ROLE_SECTIONS.get(role, []))
        flags    = _ROLE_FLAGS[role]
        user = User(
            is_staff=flags[0], is_admin=flags[1], is_superuser=flags[2],
            is_picker=flags[3], is_sales=flags[4], is_accountant=flags[5],
            allowed_sections=sections,
            **validated_data,
        )
        user.set_password(password)
        user.save()
        return user


# ─────────────────────────────────────────────────────────────────────────────
#  DASHBOARD
# ─────────────────────────────────────────────────────────────────────────────

class DashboardSerializer(serializers.Serializer):
    period            = serializers.CharField()
    revenue           = serializers.DecimalField(max_digits=15, decimal_places=2)
    profit            = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_sales_count = serializers.IntegerField()
    total_customers   = serializers.IntegerField()
    pending_count     = serializers.IntegerField()
    total_debt        = serializers.DecimalField(max_digits=15, decimal_places=2)
    low_stock_count   = serializers.IntegerField()
    top_products      = serializers.ListField()
    chart_labels      = serializers.ListField()
    chart_revenue     = serializers.ListField()
