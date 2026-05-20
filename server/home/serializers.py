from rest_framework import serializers
from .models import Category, Business, Product, Customer, Sale

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class BusinessSerializer(serializers.ModelSerializer):
    owner_name = serializers.ReadOnlyField(source='owner.username')
    
    class Meta:
        model = Business
        fields = ['id', 'name', 'owner', 'owner_name', 'members']
        read_only_fields = ['owner']

class ProductSerializer(serializers.ModelSerializer):
    available_stock = serializers.ReadOnlyField()
    stock_value_at_cost = serializers.ReadOnlyField()
    product_photo = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Product
        fields = '__all__'
        read_only_fields = ['created_by', 'amount_collected']

    def create(self, validated_data):
        print(self.context)
        return super().create(validated_data)

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'

class SaleSerializer(serializers.ModelSerializer):
    total_amount = serializers.ReadOnlyField()
    product_name = serializers.ReadOnlyField(source='product.name')
    customer_name = serializers.ReadOnlyField(source='customer.name')

    class Meta:
        model = Sale
        fields = '__all__'
        read_only_fields = ['created_by', 'total_amount', 'aproved', 'rejected', 'deleted']