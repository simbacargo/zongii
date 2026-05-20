from datetime import timedelta

from django.db import transaction
from django.db.models import F, Q, Sum, ExpressionWrapper, DecimalField
from django.utils import timezone

from rest_framework import status, viewsets, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, BasePermission,AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Category, Product, Customer, Sale
from .serializers import (
    CategorySerializer,
    ProductListSerializer, ProductWriteSerializer,
    CustomerSerializer,
    SaleReadSerializer, SaleWriteSerializer,
    UserSerializer, UserCreateSerializer,
)
from authentication.models import User


# ── Permissions ───────────────────────────────────────────────────────────────

class IsManagerOrAdmin(BasePermission):
    """Approve/reject sales, manage customers."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and
                    (request.user.is_admin or request.user.is_superuser))


class IsAdminUser(BasePermission):
    """Full user management — superuser or admin flag."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and
                    (request.user.is_admin or request.user.is_superuser))


# ── Category ──────────────────────────────────────────────────────────────────

class CategoryViewSet(viewsets.ModelViewSet):
    """
    list:   GET  /api/categories/
    create: POST /api/categories/
    retrieve: GET  /api/categories/{id}/
    update: PUT  /api/categories/{id}/
    partial_update: PATCH /api/categories/{id}/
    destroy: DELETE /api/categories/{id}/
    """
    queryset = Category.objects.all().order_by('name')
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']


# ── Product ───────────────────────────────────────────────────────────────────

class ProductViewSet(viewsets.ModelViewSet):
    """
    list:   GET  /api/products/?q=&category=&low_stock=true
    create: POST /api/products/
    retrieve: GET  /api/products/{id}/
    update: PUT  /api/products/{id}/
    partial_update: PATCH /api/products/{id}/
    destroy: DELETE /api/products/{id}/

    Extra actions:
    POST /api/products/{id}/deactivate/
    GET  /api/products/low_stock/
    """
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = Product.objects.prefetch_related('categories').filter(is_active=True)

        q = self.request.query_params.get('q', '').strip()
        if q:
            qs = qs.filter(
                Q(name__icontains=q) | Q(brand__icontains=q)
                | Q(part_number__icontains=q) | Q(upc_code__icontains=q)
            )

        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(categories__id=category)

        if self.request.query_params.get('low_stock') == 'true':
            qs = qs.filter(quantity_at_hand__lte=F('reorder_point'))

        return qs.order_by('name')

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return ProductWriteSerializer
        return ProductListSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        product = self.get_object()
        product.is_active = False
        product.save(update_fields=['is_active'])
        return Response({'detail': f'Product "{product.name}" deactivated.'})

    @action(detail=False, methods=['get'], url_path='low_stock')
    def low_stock(self, request):
        qs = Product.objects.filter(
            is_active=True, quantity_at_hand__lte=F('reorder_point')
        ).order_by('quantity_at_hand')
        serializer = ProductListSerializer(qs, many=True)
        return Response(serializer.data)


# ── Customer ──────────────────────────────────────────────────────────────────

class CustomerViewSet(viewsets.ModelViewSet):
    """
    list:   GET  /api/customers/?q=
    create: POST /api/customers/
    retrieve: GET  /api/customers/{id}/
    update: PUT  /api/customers/{id}/
    partial_update: PATCH /api/customers/{id}/
    destroy: DELETE /api/customers/{id}/

    Extra actions:
    POST /api/customers/{id}/pay/   body: {"amount": 5000}
    GET  /api/customers/debtors/    — only customers with balance > 0
    """
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Customer.objects.all()
        q = self.request.query_params.get('q', '').strip()
        if q:
            qs = qs.filter(
                Q(name__icontains=q) | Q(email__icontains=q) | Q(phone__icontains=q)
            )
        return qs.order_by('name')

    @action(detail=True, methods=['post'])
    def pay(self, request, pk=None):
        customer = self.get_object()
        try:
            amount = int(request.data.get('amount', 0))
            if amount <= 0:
                raise ValueError()
        except (ValueError, TypeError):
            return Response({'detail': 'Provide a positive integer amount.'}, status=status.HTTP_400_BAD_REQUEST)

        customer.pay_balance(amount)
        return Response(CustomerSerializer(customer).data)

    @action(detail=False, methods=['get'])
    def debtors(self, request):
        qs = Customer.objects.filter(remaining_balance__gt=0).order_by('-remaining_balance')
        serializer = self.get_serializer(qs, many=True)
        total = qs.aggregate(total=Sum('remaining_balance'))['total'] or 0
        return Response({'total_debt': total, 'results': serializer.data})


# ── Sale ──────────────────────────────────────────────────────────────────────

class SaleViewSet(viewsets.ModelViewSet):
    """
    list:   GET  /api/sales/?status=pending|approved|rejected
    create: POST /api/sales/
    retrieve: GET  /api/sales/{id}/
    update: PUT  /api/sales/{id}/
    partial_update: PATCH /api/sales/{id}/
    destroy: DELETE /api/sales/{id}/   (soft delete)

    Extra actions:
    POST /api/sales/{id}/approve/
    POST /api/sales/{id}/reject/
    """
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Sale.objects.select_related('product', 'customer', 'created_by').filter(deleted=False)

        status_filter = self.request.query_params.get('status', '')
        if status_filter == 'approved':
            qs = qs.filter(aproved=True, rejected=False)
        elif status_filter == 'rejected':
            qs = qs.filter(rejected=True)
        elif status_filter == 'pending':
            qs = qs.filter(aproved=False, rejected=False)

        return qs.order_by('-date_sold')

    def get_serializer_class(self):
        if self.action == 'create':
            return SaleWriteSerializer
        return SaleReadSerializer

    def destroy(self, request, *args, **kwargs):
        sale = self.get_object()
        sale.deleted = True
        sale.save(update_fields=['deleted'])
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'], permission_classes=[IsManagerOrAdmin])
    def approve(self, request, pk=None):
        sale = self.get_object()
        if sale.aproved:
            return Response({'detail': 'Already approved.'}, status=status.HTTP_400_BAD_REQUEST)
        if sale.rejected:
            return Response({'detail': 'Cannot approve a rejected sale.'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            sale.aproved = True
            sale.save(update_fields=['aproved'])
            sale.product.update_stock_on_sale(sale.quantity_sold, sale.total_amount)

        return Response(SaleReadSerializer(sale).data)

    @action(detail=True, methods=['post'], permission_classes=[IsManagerOrAdmin])
    def reject(self, request, pk=None):
        sale = self.get_object()
        if sale.rejected:
            return Response({'detail': 'Already rejected.'}, status=status.HTTP_400_BAD_REQUEST)
        sale.rejected = True
        sale.aproved = False
        sale.save(update_fields=['rejected', 'aproved'])
        return Response(SaleReadSerializer(sale).data)


# ── Dashboard ─────────────────────────────────────────────────────────────────

class DashboardView(APIView):
    """
    GET /api/dashboard/?period=week|month

    Returns KPIs and chart data for the requested period.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        period = request.query_params.get('period', 'week')
        today = timezone.now().date()
        start_date = today.replace(day=1) if period == 'month' else today - timedelta(days=7)

        sales_qs = Sale.objects.filter(date_sold__date__gte=start_date, aproved=True)

        revenue = sales_qs.aggregate(total=Sum('total_amount'))['total'] or 0
        total_sales_count = sales_qs.count()

        profit = sales_qs.annotate(
            margin=ExpressionWrapper(
                (F('price_per_unit') - F('product__buying_price')) * F('quantity_sold'),
                output_field=DecimalField()
            )
        ).aggregate(total=Sum('margin'))['total'] or 0

        pending_count = Sale.objects.filter(aproved=False, rejected=False, deleted=False).count()
        total_customers = Customer.objects.count()
        total_debt = Customer.objects.aggregate(total=Sum('remaining_balance'))['total'] or 0
        low_stock_count = Product.objects.filter(
            is_active=True, quantity_at_hand__lte=F('reorder_point')
        ).count()

        top_products = list(
            Product.objects
            .filter(sales__aproved=True, sales__date_sold__date__gte=start_date)
            .annotate(
                total_sold=Sum('sales__quantity_sold'),
                total_revenue=Sum('sales__total_amount'),
            )
            .order_by('-total_sold')
            .values('id', 'name', 'brand', 'total_sold', 'total_revenue')[:5]
        )

        days_to_track = 30 if period == 'month' else 7
        chart_labels = []
        chart_revenue = []
        for i in range(days_to_track - 1, -1, -1):
            day = today - timedelta(days=i)
            chart_labels.append(day.strftime('%d %b'))
            day_total = (
                Sale.objects
                .filter(date_sold__date=day, aproved=True)
                .aggregate(Sum('total_amount'))['total_amount__sum'] or 0
            )
            chart_revenue.append(float(day_total))

        return Response({
            'period': period,
            'revenue': revenue,
            'profit': profit,
            'total_sales_count': total_sales_count,
            'total_customers': total_customers,
            'pending_count': pending_count,
            'total_debt': total_debt,
            'low_stock_count': low_stock_count,
            'top_products': top_products,
            'chart_labels': chart_labels,
            'chart_revenue': chart_revenue,
        })


# ── User Management ───────────────────────────────────────────────────────────

class UserViewSet(viewsets.ModelViewSet):
    """
    list:   GET  /api/users/          (admin only)
    create: POST /api/users/          (admin only)
    retrieve: GET  /api/users/{id}/   (admin only)
    update: PUT  /api/users/{id}/     (admin only)
    partial_update: PATCH /api/users/{id}/
    destroy: DELETE /api/users/{id}/  (superuser only)

    Extra actions:
    POST /api/users/{id}/toggle_active/
    PATCH /api/users/{id}/set_role/   body: {"role": "staff|manager|admin"}
    """
    permission_classes = [IsAdminUser]
    filter_backends = [filters.SearchFilter]
    search_fields = ['username', 'firstname', 'lastname', 'email']

    def get_queryset(self):
        return User.objects.all().order_by('username')

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer

    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        if user.pk == request.user.pk:
            return Response({'detail': 'Cannot delete your own account.'}, status=status.HTTP_400_BAD_REQUEST)
        if user.is_superuser and not request.user.is_superuser:
            return Response({'detail': 'Only a superuser can delete another superuser.'}, status=status.HTTP_403_FORBIDDEN)
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'], url_path='toggle_active')
    def toggle_active(self, request, pk=None):
        user = self.get_object()
        if user.pk == request.user.pk:
            return Response({'detail': 'Cannot deactivate your own account.'}, status=status.HTTP_400_BAD_REQUEST)
        user.is_active = not user.is_active
        user.save(update_fields=['is_active'])
        return Response(UserSerializer(user).data)

    @action(detail=True, methods=['patch'], url_path='set_role')
    def set_role(self, request, pk=None):
        user = self.get_object()
        role = request.data.get('role')
        role_map = {
            'staff':   (True, False, False),
            'manager': (True, True,  False),
            'admin':   (True, True,  True),
        }
        if role not in role_map:
            return Response({'detail': 'role must be staff, manager, or admin.'}, status=status.HTTP_400_BAD_REQUEST)
        user.is_staff, user.is_admin, user.is_superuser = role_map[role]
        user.save(update_fields=['is_staff', 'is_admin', 'is_superuser'])
        return Response(UserSerializer(user).data)


# ── Profile (current user) ────────────────────────────────────────────────────

class ProfileView(APIView):
    """
    GET   /api/auth/me/   — current user's profile
    PATCH /api/auth/me/   — update own name, email, mobile
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        allowed = ['firstname', 'lastname', 'email', 'mobile', 'gender']
        for field in allowed:
            if field in request.data:
                setattr(request.user, field, request.data[field])
        request.user.save()
        return Response(UserSerializer(request.user).data)
