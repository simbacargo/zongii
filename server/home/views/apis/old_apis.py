from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from ...models import Category, Business, Product, Customer, Sale
from ...serializers import (
    CategorySerializer, BusinessSerializer, ProductSerializer, 
    CustomerSerializer, SaleSerializer
)

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class BusinessViewSet(viewsets.ModelViewSet):
    serializer_class = BusinessSerializer

    def get_queryset(self):
        # Users only see businesses they own or belong to
        user = self.request.user
        return Business.objects.filter(Q(owner=user) | Q(members=user)).distinct()

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'brand', 'part_number', 'upc_code']

    def get_queryset(self):
        return Product.objects.all()

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer

    @action(detail=True, methods=['post'])
    def pay_balance(self, request, pk=None):
        customer = self.get_object()
        amount = request.data.get('amount', 0)
        try:
            customer.pay_balance(int(amount))
            return Response({'status': 'Balance updated', 'remaining_balance': customer.remaining_balance})
        except ValueError:
            return Response({'error': 'Invalid amount'}, status=status.HTTP_400_BAD_REQUEST)

class SaleViewSet(viewsets.ModelViewSet):
    serializer_class = SaleSerializer

    def get_queryset(self):
        # Exclude deleted sales by default
        return Sale.objects.filter(deleted=False)

    def create(self, request, *args, **kwargs):
        # Custom validation for stock before creating sale
        product_id = request.data.get('product')
        qty_sold = int(request.data.get('quantity_sold', 0))
        
        try:
            product = Product.objects.get(id=product_id)
            if product.available_stock < qty_sold:
                return Response(
                    {'error': f'Insufficient stock. Only {product.available_stock} available.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        # Set the seller
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        sale = self.get_object()
        sale.rejected = True
        sale.aproved = False
        sale.save()
        return Response({'status': 'Sale rejected'})

    @action(detail=True, methods=['post'])
    def soft_delete(self, request, pk=None):
        sale = self.get_object()
        sale.deleted = True
        sale.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    
    