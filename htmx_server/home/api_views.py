from datetime import timedelta
from decimal import Decimal

from django.db import transaction
from django.db.models import F, Q, Sum, ExpressionWrapper, DecimalField, Value
from django.db.models.functions import Coalesce
from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, BasePermission, AllowAny
from rest_framework.response import Response

from .models import (
    Business, Category, Product, Customer,
    Sale, SaleOrder,
    Document, DocumentItem,
    PickingOrder, PickingOrderItem,
    GatePass, GatePassItem,
    StockRefill, SaleStatusHistory,
)
from notifications.models import Notification
from authentication.models import User

from .serializers import (
    BusinessSerializer,
    CategorySerializer,
    ProductListSerializer, ProductWriteSerializer,
    CustomerSerializer,
    SaleReadSerializer, SaleWriteSerializer,
    SaleOrderSerializer, SaleOrderListSerializer,
    DocumentSerializer, DocumentWriteSerializer, DocumentItemSerializer,
    PickingOrderSerializer, PickingOrderItemSerializer,
    GatePassSerializer,
    StockRefillSerializer, StockRefillCreateSerializer,
    NotificationSerializer,
    UserSerializer, UserCreateSerializer,
    VALID_ROLES, _ROLE_FLAGS, _ROLE_SECTIONS,
)


# ─────────────────────────────────────────────────────────────────────────────
#  PERMISSION HELPERS
# ─────────────────────────────────────────────────────────────────────────────

class IsAdminOrManager(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated
            and (request.user.is_admin or request.user.is_superuser)
        )


class IsAdminOnly(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated
            and (request.user.is_admin or request.user.is_superuser)
        )


def _is_admin(user):
    return user.is_admin or user.is_superuser

def _is_picker(user):
    return user.is_picker or user.is_admin or user.is_superuser


# ─────────────────────────────────────────────────────────────────────────────
#  AUTH / PROFILE
# ─────────────────────────────────────────────────────────────────────────────

@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def profile(request):
    """
    GET  /api/auth/me/   — current user profile
    PATCH /api/auth/me/  — update own name, email, mobile, gender
    """
    if request.method == 'GET':
        return Response(UserSerializer(request.user).data)

    allowed = ['firstname', 'lastname', 'email', 'mobile', 'gender']
    for field in allowed:
        if field in request.data:
            setattr(request.user, field, request.data[field])
    request.user.save()
    return Response(UserSerializer(request.user).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def register_push_token(request):
    """POST /api/auth/push-token/ — store the caller's Expo push token."""
    token = request.data.get('token', '').strip()
    if not token:
        return Response({'token': 'This field is required.'}, status=status.HTTP_400_BAD_REQUEST)
    request.user.expo_push_token = token
    request.user.save(update_fields=['expo_push_token'])
    return Response({'detail': 'Token registered.'})


# ─────────────────────────────────────────────────────────────────────────────
#  DASHBOARD
# ─────────────────────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard(request):
    """
    GET /api/dashboard/?period=week|month
    """
    period     = request.GET.get('period', 'week')
    today      = timezone.now().date()
    start_date = today.replace(day=1) if period == 'month' else today - timedelta(days=7)

    sales_qs = Sale.objects.filter(date_sold__date__gte=start_date, aproved=True)

    revenue           = sales_qs.aggregate(t=Sum('total_amount'))['t'] or 0
    total_sales_count = sales_qs.count()

    profit = sales_qs.annotate(
        margin=ExpressionWrapper(
            (F('price_per_unit') - Coalesce(
                F('product__buying_price'), Value(0, output_field=DecimalField())
            )) * F('quantity_sold'),
            output_field=DecimalField(),
        )
    ).aggregate(t=Sum('margin'))['t'] or 0

    pending_count  = Sale.objects.filter(aproved=False, rejected=False, deleted=False).count()
    total_customers = Customer.objects.count()
    total_debt     = Customer.objects.aggregate(t=Sum('remaining_balance'))['t'] or 0
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
    chart_labels, chart_revenue = [], []
    for i in range(days_to_track - 1, -1, -1):
        day = today - timedelta(days=i)
        chart_labels.append(day.strftime('%d %b'))
        day_total = (
            Sale.objects
            .filter(date_sold__date=day, aproved=True)
            .aggregate(t=Sum('total_amount'))['t'] or 0
        )
        chart_revenue.append(float(day_total))

    return Response({
        'period':            period,
        'revenue':           revenue,
        'profit':            profit,
        'total_sales_count': total_sales_count,
        'total_customers':   total_customers,
        'pending_count':     pending_count,
        'total_debt':        total_debt,
        'low_stock_count':   low_stock_count,
        'top_products':      top_products,
        'chart_labels':      chart_labels,
        'chart_revenue':     chart_revenue,
    })


# ─────────────────────────────────────────────────────────────────────────────
#  CATEGORIES
# ─────────────────────────────────────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def category_list(request):
    """
    GET  /api/categories/?q=
    POST /api/categories/          (admin)
    """
    if request.method == 'GET':
        qs = Category.objects.all().order_by('name')
        q  = request.GET.get('q', '').strip()
        if q:
            qs = qs.filter(name__icontains=q)
        return Response(CategorySerializer(qs, many=True).data)

    if not _is_admin(request.user):
        return Response({'error': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)

    serializer = CategorySerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def category_detail(request, pk):
    """
    GET    /api/categories/{pk}/
    PUT    /api/categories/{pk}/   (admin)
    PATCH  /api/categories/{pk}/  (admin)
    DELETE /api/categories/{pk}/  (admin)
    """
    category = get_object_or_404(Category, pk=pk)

    if request.method == 'GET':
        return Response(CategorySerializer(category).data)

    if not _is_admin(request.user):
        return Response({'error': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)

    if request.method in ('PUT', 'PATCH'):
        serializer = CategorySerializer(
            category, data=request.data, partial=(request.method == 'PATCH')
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    category.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# ─────────────────────────────────────────────────────────────────────────────
#  PRODUCTS
# ─────────────────────────────────────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def product_list(request):
    """
    GET  /api/products/?q=&category=&low_stock=true&include_inactive=true
    POST /api/products/   (admin)
    """
    if request.method == 'GET':
        qs = Product.objects.prefetch_related('categories')
        if request.GET.get('include_inactive') != 'true':
            qs = qs.filter(is_active=True)

        q = request.GET.get('q', '').strip()
        if q:
            qs = qs.filter(
                Q(name__icontains=q) | Q(brand__icontains=q)
                | Q(part_number__icontains=q) | Q(upc_code__icontains=q)
            )

        category = request.GET.get('category')
        if category:
            qs = qs.filter(categories__id=category)

        if request.GET.get('low_stock') == 'true':
            qs = qs.filter(quantity_at_hand__lte=F('reorder_point'))

        return Response(ProductListSerializer(qs.order_by('name'), many=True).data)

    if not _is_admin(request.user):
        return Response({'error': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)

    serializer = ProductWriteSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(created_by=request.user)
        return Response(
            ProductListSerializer(serializer.instance).data,
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def product_detail(request, pk):
    """
    GET    /api/products/{pk}/
    PUT    /api/products/{pk}/   (admin)
    PATCH  /api/products/{pk}/  (admin)
    DELETE /api/products/{pk}/  (admin — soft delete)
    """
    product = get_object_or_404(Product, pk=pk)

    if request.method == 'GET':
        return Response(ProductListSerializer(product).data)

    if not _is_admin(request.user):
        return Response({'error': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)

    if request.method in ('PUT', 'PATCH'):
        serializer = ProductWriteSerializer(
            product, data=request.data, partial=(request.method == 'PATCH')
        )
        if serializer.is_valid():
            serializer.save()
            return Response(ProductListSerializer(serializer.instance).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    product.is_active = False
    product.save(update_fields=['is_active'])
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def product_deactivate(request, pk):
    """POST /api/products/{pk}/deactivate/"""
    if not _is_admin(request.user):
        return Response({'error': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)
    product = get_object_or_404(Product, pk=pk)
    product.is_active = False
    product.save(update_fields=['is_active'])
    return Response({'detail': f'Product "{product.name}" deactivated.'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def product_low_stock(request):
    """GET /api/products/low-stock/"""
    qs = Product.objects.filter(
        is_active=True, quantity_at_hand__lte=F('reorder_point')
    ).order_by('quantity_at_hand')
    return Response(ProductListSerializer(qs, many=True).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def stock_refill(request, pk):
    """
    POST /api/products/{pk}/refill/
    Body: { "quantity_added": 100, "notes": "..." }
    """
    if not _is_admin(request.user):
        return Response({'error': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)

    product = get_object_or_404(Product, pk=pk)
    serializer = StockRefillCreateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    qty           = serializer.validated_data['quantity_added']
    notes         = serializer.validated_data['notes']
    quantity_after = product.quantity_at_hand + qty

    with transaction.atomic():
        refill = StockRefill.objects.create(
            product=product,
            quantity_added=qty,
            quantity_after=quantity_after,
            refilled_by=request.user,
            notes=notes,
        )
        product.quantity_at_hand = F('quantity_at_hand') + qty
        product.save(update_fields=['quantity_at_hand'])
        Notification.objects.filter(
            notification_type=Notification.LOW_STOCK,
            entity_id=product.pk,
            is_read=False,
        ).update(is_read=True)

    return Response(StockRefillSerializer(refill).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def product_refills(request, pk):
    """GET /api/products/{pk}/refills/  — refill history for a product"""
    product = get_object_or_404(Product, pk=pk)
    refills = product.refills.all()
    return Response(StockRefillSerializer(refills, many=True).data)


# ─────────────────────────────────────────────────────────────────────────────
#  CUSTOMERS
# ─────────────────────────────────────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def customer_list(request):
    """
    GET  /api/customers/?q=
    POST /api/customers/
    """
    if request.method == 'GET':
        qs = Customer.objects.all()
        q  = request.GET.get('q', '').strip()
        if q:
            qs = qs.filter(
                Q(name__icontains=q) | Q(email__icontains=q) | Q(phone__icontains=q)
            )
        return Response(CustomerSerializer(qs.order_by('name'), many=True).data)

    serializer = CustomerSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def customer_detail(request, pk):
    """
    GET    /api/customers/{pk}/
    PUT    /api/customers/{pk}/
    PATCH  /api/customers/{pk}/
    DELETE /api/customers/{pk}/  (admin)
    """
    customer = get_object_or_404(Customer, pk=pk)

    if request.method == 'GET':
        return Response(CustomerSerializer(customer).data)

    if request.method in ('PUT', 'PATCH'):
        serializer = CustomerSerializer(
            customer, data=request.data, partial=(request.method == 'PATCH')
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if not _is_admin(request.user):
        return Response({'error': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)
    customer.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def customer_pay(request, pk):
    """
    POST /api/customers/{pk}/pay/
    Body: { "amount": 5000 }
    """
    customer = get_object_or_404(Customer, pk=pk)
    try:
        amount = int(request.data.get('amount', 0))
        if amount <= 0:
            raise ValueError()
    except (ValueError, TypeError):
        return Response(
            {'error': 'Provide a positive integer amount.'},
            status=status.HTTP_400_BAD_REQUEST,
        )
    customer.pay_balance(amount)
    return Response(CustomerSerializer(customer).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def customer_debtors(request):
    """GET /api/customers/debtors/  — customers with outstanding balance"""
    qs    = Customer.objects.filter(remaining_balance__gt=0).order_by('-remaining_balance')
    total = qs.aggregate(t=Sum('remaining_balance'))['t'] or 0
    return Response({
        'total_debt': total,
        'results':    CustomerSerializer(qs, many=True).data,
    })


# ─────────────────────────────────────────────────────────────────────────────
#  SALES
# ─────────────────────────────────────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def sale_list(request):
    """
    GET  /api/sales/?status=pending|approved|rejected&q=
    POST /api/sales/
    """
    if request.method == 'GET':
        qs = Sale.objects.select_related('product', 'customer', 'created_by').filter(deleted=False)

        if request.GET.get('customer'):
            qs = qs.filter(customer_id=request.GET['customer'])
        if request.GET.get('product'):
            qs = qs.filter(product_id=request.GET['product'])

        sf = request.GET.get('status', '')
        if sf == 'approved':
            qs = qs.filter(aproved=True,  rejected=False)
        elif sf == 'rejected':
            qs = qs.filter(rejected=True)
        elif sf == 'pending':
            qs = qs.filter(aproved=False, rejected=False)

        q = request.GET.get('q', '').strip()
        if q:
            qs = qs.filter(
                Q(product__name__icontains=q) | Q(customer__name__icontains=q)
            )

        return Response(SaleReadSerializer(qs.order_by('-date_sold'), many=True).data)

    serializer = SaleWriteSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response(
            SaleReadSerializer(serializer.instance).data,
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def sale_detail(request, pk):
    """
    GET    /api/sales/{pk}/
    PUT    /api/sales/{pk}/
    PATCH  /api/sales/{pk}/
    DELETE /api/sales/{pk}/   (soft delete)
    """
    sale = get_object_or_404(Sale, pk=pk, deleted=False)

    if request.method == 'GET':
        return Response(SaleReadSerializer(sale).data)

    if request.method in ('PUT', 'PATCH'):
        if sale.aproved:
            return Response(
                {'error': 'Approved sales cannot be edited.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        allowed_fields = {'quantity_sold', 'price_per_unit', 'customer'}
        data = {k: v for k, v in request.data.items() if k in allowed_fields}
        serializer = SaleWriteSerializer(
            sale, data=data, partial=True, context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(SaleReadSerializer(serializer.instance).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    sale.deleted = True
    sale.save(update_fields=['deleted'])
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def sale_approve(request, pk):
    """POST /api/sales/{pk}/approve/  (manager / admin)"""
    if not _is_admin(request.user):
        return Response({'error': 'Manager access required.'}, status=status.HTTP_403_FORBIDDEN)

    sale = get_object_or_404(Sale, pk=pk, deleted=False, rejected=False)
    if sale.aproved:
        return Response({'error': 'Already approved.'}, status=status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        sale.aproved = True
        sale.save(update_fields=['aproved'])
        sale.product.update_stock_on_sale(sale.quantity_sold, sale.total_amount)

    return Response(SaleReadSerializer(sale).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def sale_reject(request, pk):
    """POST /api/sales/{pk}/reject/  (manager / admin)"""
    if not _is_admin(request.user):
        return Response({'error': 'Manager access required.'}, status=status.HTTP_403_FORBIDDEN)

    sale = get_object_or_404(Sale, pk=pk, deleted=False)
    if sale.rejected:
        return Response({'error': 'Already rejected.'}, status=status.HTTP_400_BAD_REQUEST)

    sale.rejected = True
    sale.aproved  = False
    sale.save(update_fields=['rejected', 'aproved'])
    return Response(SaleReadSerializer(sale).data)


# ─────────────────────────────────────────────────────────────────────────────
#  SALE ORDERS
# ─────────────────────────────────────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def sale_order_list(request):
    """
    GET  /api/orders/?status=&q=
    POST /api/orders/   — create a new order with one or more line items
         Body: { customer?: id, notes?: str, items: [{product, quantity_sold, price_per_unit}] }
    """
    if request.method == 'POST':
        items_data = request.data.get('items', [])
        if not items_data:
            return Response({'items': 'At least one item is required.'}, status=status.HTTP_400_BAD_REQUEST)

        customer_id = request.data.get('customer') or None
        errors = []
        for i, item in enumerate(items_data):
            if not item.get('product'):
                errors.append({f'items[{i}].product': 'Required.'})
            if not item.get('quantity_sold') or int(item['quantity_sold']) <= 0:
                errors.append({f'items[{i}].quantity_sold': 'Must be > 0.'})
            if not item.get('price_per_unit') or float(item['price_per_unit']) <= 0:
                errors.append({f'items[{i}].price_per_unit': 'Must be > 0.'})
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            order = SaleOrder.objects.create(
                customer_id=customer_id,
                created_by=request.user,
                notes=request.data.get('notes', ''),
            )
            for item in items_data:
                Sale.objects.create(
                    order=order,
                    product_id=item['product'],
                    quantity_sold=int(item['quantity_sold']),
                    price_per_unit=Decimal(str(item['price_per_unit'])),
                    customer_id=customer_id,
                    created_by=request.user,
                )

        order.refresh_from_db()
        return Response(SaleOrderSerializer(order).data, status=status.HTTP_201_CREATED)

    # GET
    qs = SaleOrder.objects.select_related('customer', 'created_by').all()

    sf = request.GET.get('status', '')
    if sf:
        qs = qs.filter(workflow_status=sf)

    q = request.GET.get('q', '').strip()
    if q:
        upper_q = q.upper()
        if upper_q.startswith('ZO'):
            try:
                qs = qs.filter(pk=int(upper_q[2:]))
            except ValueError:
                qs = qs.none()
        else:
            qs = qs.filter(
                Q(customer__name__icontains=q)
                | Q(created_by__username__icontains=q)
            )

    return Response(SaleOrderListSerializer(qs.order_by('-created_at'), many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sale_order_detail(request, pk):
    """GET /api/orders/{pk}/"""
    order = get_object_or_404(
        SaleOrder.objects
        .select_related('customer', 'created_by', 'verified_by')
        .prefetch_related(
            'sales__product', 'history__changed_by',
            'picking_orders__items__product',
        ),
        pk=pk,
    )
    return Response(SaleOrderSerializer(order).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def sale_order_accountant_review(request, pk):
    """
    POST /api/orders/{pk}/accountant-review/
    Body: { "action": "approve|reject", "note": "..." }
    """
    order = get_object_or_404(SaleOrder, pk=pk)

    if not (request.user.is_accountant or request.user.is_admin or request.user.is_superuser):
        return Response({'error': 'Accountant access required.'}, status=status.HTTP_403_FORBIDDEN)

    if order.workflow_status != SaleOrder.PENDING_APPROVAL:
        return Response({'error': 'Order is not awaiting approval.'}, status=status.HTTP_400_BAD_REQUEST)

    action = request.data.get('action')
    note   = request.data.get('note', '')

    if action not in ('approve', 'reject'):
        return Response({'error': 'action must be approve or reject.'}, status=status.HTTP_400_BAD_REQUEST)

    from notifications.utils import notify, notify_pickers
    from notifications.models import Notification

    with transaction.atomic():
        if action == 'approve':
            picking_order = PickingOrder.objects.create(sale_order=order)
            for sale in order.sales.select_related('product'):
                PickingOrderItem.objects.create(
                    picking_order=picking_order,
                    sale=sale,
                    product=sale.product,
                    requested_qty=sale.quantity_sold,
                )
            order.transition(SaleOrder.PENDING_PICKING, request.user, note or f'Approved by {request.user.username}')
            notify_pickers(
                Notification.ORDER_CREATED,
                title=f'New order {order.order_code} awaiting picking',
                message=f'Approved by {request.user.username}.',
                link=f'/orders/{order.pk}/',
                entity_id=order.pk,
            )
            if order.created_by:
                notify(order.created_by, Notification.ORDER_VERIFIED,
                       title=f'Order {order.order_code} approved',
                       message=note or f'Approved by {request.user.username}.',
                       link=f'/orders/{order.pk}/', entity_id=order.pk)
        else:
            order.transition(SaleOrder.REJECTED, request.user, note or f'Rejected by {request.user.username}')
            if order.created_by:
                notify(order.created_by, Notification.ORDER_REJECTED,
                       title=f'Order {order.order_code} rejected',
                       message=note or f'Rejected by {request.user.username}.',
                       link=f'/orders/{order.pk}/', entity_id=order.pk)

    order.refresh_from_db()
    return Response(SaleOrderSerializer(order).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def sale_order_verify(request, pk):
    """
    POST /api/orders/{pk}/verify/
    Body: { "action": "approve|reject|re_pick", "note": "..." }
    """
    order  = get_object_or_404(SaleOrder, pk=pk)
    action = request.data.get('action')
    note   = request.data.get('note', '')

    if order.workflow_status not in (
        SaleOrder.PICKED, SaleOrder.PARTIALLY_PICKED, SaleOrder.RE_PICK_REQUIRED
    ):
        return Response(
            {'error': 'Order is not ready for verification.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    last_picking = order.picking_orders.filter(
        status__in=[PickingOrder.COMPLETED, PickingOrder.PARTIALLY_PICKED]
    ).last()

    if (last_picking and last_picking.picker == request.user
            and not _is_admin(request.user)):
        return Response(
            {'error': 'You cannot verify picking you performed yourself.'},
            status=status.HTTP_403_FORBIDDEN,
        )

    if action not in ('approve', 'reject', 're_pick'):
        return Response(
            {'error': 'action must be approve, reject, or re_pick.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    with transaction.atomic():
        if action == 'approve':
            order.verified_by = request.user
            order.verified_at = timezone.now()
            order.save(update_fields=['verified_by', 'verified_at', 'updated_at'])
            order.transition(SaleOrder.VERIFIED, request.user, note or 'Verified')
            gp = GatePass.objects.create(
                sale_order=order,
                picking_order=last_picking,
                verified_by=request.user,
            )
            for poi in (last_picking.items.select_related('product') if last_picking else []):
                GatePassItem.objects.create(
                    gate_pass=gp,
                    product=poi.product,
                    requested_qty=poi.requested_qty,
                    picked_qty=poi.picked_qty,
                )

        elif action == 'reject':
            order.transition(SaleOrder.REJECTED, request.user, note or 'Rejected')

        elif action == 're_pick':
            order.transition(SaleOrder.RE_PICK_REQUIRED, request.user, note or 'Re-pick requested')
            new_po = PickingOrder.objects.create(sale_order=order)
            for sale in order.sales.select_related('product'):
                PickingOrderItem.objects.create(
                    picking_order=new_po,
                    sale=sale,
                    product=sale.product,
                    requested_qty=sale.quantity_sold,
                )

    return Response(SaleOrderSerializer(order).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def sale_order_dispatch(request, pk):
    """POST /api/orders/{pk}/dispatch/  (admin)"""
    if not _is_admin(request.user):
        return Response({'error': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)

    order = get_object_or_404(SaleOrder, pk=pk)
    if order.workflow_status != SaleOrder.VERIFIED:
        return Response(
            {'error': 'Only verified orders can be dispatched.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        gate_pass = order.gate_pass
    except GatePass.DoesNotExist:
        return Response(
            {'error': 'Cannot dispatch: gate pass not found.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    with transaction.atomic():
        for sale in order.sales.select_related('product').all():
            sale.product.update_stock_on_sale(sale.quantity_sold, sale.total_amount)
        order.dispatched_at = timezone.now()
        order.save(update_fields=['dispatched_at', 'updated_at'])
        order.transition(SaleOrder.DISPATCHED, request.user, 'Goods dispatched')
        gate_pass.is_used = True
        gate_pass.save(update_fields=['is_used'])

    return Response(SaleOrderSerializer(order).data)


# ─────────────────────────────────────────────────────────────────────────────
#  DOCUMENTS (Invoices & Quotations)
# ─────────────────────────────────────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def document_list(request):
    """
    GET  /api/documents/?type=invoice|quotation&status=
    POST /api/documents/
    """
    if request.method == 'GET':
        qs = Document.objects.select_related('customer', 'created_by').all()
        if request.GET.get('type'):
            qs = qs.filter(doc_type=request.GET['type'])
        if request.GET.get('status'):
            qs = qs.filter(status=request.GET['status'])
        return Response(DocumentSerializer(qs.order_by('-created_at'), many=True).data)

    serializer = DocumentWriteSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(created_by=request.user)
        return Response(
            DocumentSerializer(serializer.instance).data,
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def document_detail(request, pk):
    """
    GET    /api/documents/{pk}/
    PUT    /api/documents/{pk}/
    PATCH  /api/documents/{pk}/
    DELETE /api/documents/{pk}/  (admin)
    """
    doc = get_object_or_404(
        Document.objects.select_related('customer', 'created_by')
                        .prefetch_related('items__product'),
        pk=pk,
    )

    if request.method == 'GET':
        return Response(DocumentSerializer(doc).data)

    if request.method in ('PUT', 'PATCH'):
        serializer = DocumentWriteSerializer(
            doc, data=request.data, partial=(request.method == 'PATCH')
        )
        if serializer.is_valid():
            serializer.save()
            return Response(DocumentSerializer(serializer.instance).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if not _is_admin(request.user):
        return Response({'error': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)
    doc.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def document_status(request, pk):
    """
    POST /api/documents/{pk}/status/
    Body: { "status": "draft|sent|paid|accepted|rejected|cancelled" }
    """
    doc        = get_object_or_404(Document, pk=pk)
    new_status = request.data.get('status')
    valid      = [s[0] for s in Document.STATUSES]

    if new_status not in valid:
        return Response(
            {'error': f'status must be one of: {", ".join(valid)}'},
            status=status.HTTP_400_BAD_REQUEST,
        )
    doc.status = new_status
    doc.save(update_fields=['status'])
    return Response(DocumentSerializer(doc).data)


# ─────────────────────────────────────────────────────────────────────────────
#  PICKING ORDERS
# ─────────────────────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def picking_list(request):
    """
    GET /api/picking/?status=&mine=true
    """
    qs = PickingOrder.objects.select_related('sale_order__customer', 'picker').all()

    sf = request.GET.get('status', '')
    if sf:
        qs = qs.filter(status=sf)

    if request.GET.get('mine') == 'true':
        qs = qs.filter(picker=request.user)

    return Response(PickingOrderSerializer(qs.order_by('-created_at'), many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def picking_detail(request, pk):
    """GET /api/picking/{pk}/"""
    picking = get_object_or_404(
        PickingOrder.objects
        .select_related('sale_order__customer', 'picker')
        .prefetch_related('items__product'),
        pk=pk,
    )
    return Response(PickingOrderSerializer(picking).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def picking_accept(request, pk):
    """POST /api/picking/{pk}/accept/"""
    if not _is_picker(request.user):
        return Response({'error': 'Picker access required.'}, status=status.HTTP_403_FORBIDDEN)

    picking = get_object_or_404(PickingOrder, pk=pk, status=PickingOrder.PENDING)
    picking.picker      = request.user
    picking.status      = PickingOrder.ACCEPTED
    picking.accepted_at = timezone.now()
    picking.save(update_fields=['picker', 'status', 'accepted_at'])
    picking.sale_order.transition(
        SaleOrder.PICKING, request.user,
        f'Picking accepted by {request.user.username}',
    )
    return Response(PickingOrderSerializer(picking).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def picking_submit(request, pk):
    """
    POST /api/picking/{pk}/submit/
    Body: { "items": [{"id": 1, "picked_qty": 5, "notes": ""}], "notes": "..." }
    """
    if not _is_picker(request.user):
        return Response({'error': 'Picker access required.'}, status=status.HTTP_403_FORBIDDEN)

    picking = get_object_or_404(
        PickingOrder.objects.select_related('sale_order'),
        pk=pk,
        status__in=[PickingOrder.ACCEPTED, PickingOrder.PARTIALLY_PICKED],
    )

    if not (request.user == picking.picker or _is_admin(request.user)):
        return Response(
            {'error': 'Only the assigned picker can submit picks.'},
            status=status.HTTP_403_FORBIDDEN,
        )

    items_data   = request.data.get('items', [])
    picker_notes = request.data.get('notes', '')

    with transaction.atomic():
        for entry in items_data:
            item = get_object_or_404(PickingOrderItem, pk=entry.get('id'), picking_order=picking)
            try:
                qty = max(0, int(entry.get('picked_qty', 0)))
            except (ValueError, TypeError):
                qty = 0
            item.picked_qty = min(qty, item.requested_qty)
            item.notes      = entry.get('notes', '')
            item.save(update_fields=['picked_qty', 'notes'])

        picking.notes = picker_notes

        if picking.is_fully_picked:
            picking.status       = PickingOrder.COMPLETED
            picking.completed_at = timezone.now()
            new_order_status     = SaleOrder.PICKED
        elif any(i.picked_qty > 0 for i in picking.items.all()):
            picking.status   = PickingOrder.PARTIALLY_PICKED
            new_order_status = SaleOrder.PARTIALLY_PICKED
        else:
            new_order_status = None

        picking.save(update_fields=['status', 'completed_at', 'notes'])

        if new_order_status:
            picking.sale_order.transition(
                new_order_status, request.user,
                f'Picking {"completed" if new_order_status == SaleOrder.PICKED else "partial"} '
                f'by {request.user.username}',
            )

    return Response(PickingOrderSerializer(picking).data)


# ─────────────────────────────────────────────────────────────────────────────
#  GATE PASSES
# ─────────────────────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def gate_pass_list(request):
    """GET /api/gate-passes/?used=true|false"""
    qs = GatePass.objects.select_related(
        'sale_order__customer', 'picking_order__picker', 'verified_by'
    ).prefetch_related('items__product').all()

    used = request.GET.get('used')
    if used == 'true':
        qs = qs.filter(is_used=True)
    elif used == 'false':
        qs = qs.filter(is_used=False)

    return Response(GatePassSerializer(qs.order_by('-issued_at'), many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def gate_pass_detail(request, pk):
    """GET /api/gate-passes/{pk}/"""
    gp = get_object_or_404(
        GatePass.objects
        .select_related('sale_order__customer', 'picking_order__picker', 'verified_by')
        .prefetch_related('items__product'),
        pk=pk,
    )
    return Response(GatePassSerializer(gp).data)


# ─────────────────────────────────────────────────────────────────────────────
#  NOTIFICATIONS
# ─────────────────────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notification_list(request):
    """
    GET /api/notifications/?unread=true
    """
    qs = Notification.objects.filter(recipient=request.user)
    if request.GET.get('unread') == 'true':
        qs = qs.filter(is_read=False)
    return Response({
        'unread_count': qs.filter(is_read=False).count(),
        'results':      NotificationSerializer(qs, many=True).data,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def notification_mark_read(request, pk):
    """POST /api/notifications/{pk}/read/"""
    notif = get_object_or_404(Notification, pk=pk, recipient=request.user)
    notif.is_read = True
    notif.save(update_fields=['is_read'])
    return Response(NotificationSerializer(notif).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def notification_mark_all_read(request):
    """POST /api/notifications/mark-all-read/"""
    Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
    return Response({'detail': 'All notifications marked as read.'})


# ─────────────────────────────────────────────────────────────────────────────
#  USERS
# ─────────────────────────────────────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def user_list(request):
    """
    GET  /api/users/?q=   (admin)
    POST /api/users/      (admin)
    """
    if not _is_admin(request.user):
        return Response({'error': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        qs = User.objects.all()
        q  = request.GET.get('q', '').strip()
        if q:
            qs = qs.filter(
                Q(username__icontains=q) | Q(firstname__icontains=q)
                | Q(lastname__icontains=q) | Q(email__icontains=q)
            )
        return Response(UserSerializer(qs.order_by('username'), many=True).data)

    serializer = UserCreateSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def user_detail(request, pk):
    """
    GET    /api/users/{pk}/   (admin)
    PATCH  /api/users/{pk}/  (admin)
    DELETE /api/users/{pk}/  (admin)
    """
    if not _is_admin(request.user):
        return Response({'error': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)

    user = get_object_or_404(User, pk=pk)

    if request.method == 'GET':
        return Response(UserSerializer(user).data)

    if request.method == 'PATCH':
        allowed = ['firstname', 'lastname', 'email', 'mobile', 'gender', 'is_active']
        for field in allowed:
            if field in request.data:
                setattr(user, field, request.data[field])
        user.save()
        return Response(UserSerializer(user).data)

    if user.pk == request.user.pk:
        return Response({'error': 'Cannot delete your own account.'}, status=status.HTTP_400_BAD_REQUEST)
    if user.is_superuser and not request.user.is_superuser:
        return Response({'error': 'Only a superuser can delete another superuser.'}, status=status.HTTP_403_FORBIDDEN)
    user.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def user_toggle_active(request, pk):
    """POST /api/users/{pk}/toggle-active/  (admin)"""
    if not _is_admin(request.user):
        return Response({'error': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)

    user = get_object_or_404(User, pk=pk)
    if user.pk == request.user.pk:
        return Response(
            {'error': 'Cannot deactivate your own account.'},
            status=status.HTTP_400_BAD_REQUEST,
        )
    user.is_active = not user.is_active
    user.save(update_fields=['is_active'])
    return Response(UserSerializer(user).data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def user_set_role(request, pk):
    """
    PATCH /api/users/{pk}/set-role/
    Body: { "role": "staff|sales|accountant|picker|manager|admin", "sections": [...] }
    """
    if not _is_admin(request.user):
        return Response({'error': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)

    user = get_object_or_404(User, pk=pk)
    role = request.data.get('role')

    if role not in VALID_ROLES:
        return Response(
            {'error': f'role must be one of: {", ".join(VALID_ROLES)}'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    flags = _ROLE_FLAGS[role]
    user.is_staff, user.is_admin, user.is_superuser = flags[0], flags[1], flags[2]
    user.is_picker, user.is_sales, user.is_accountant = flags[3], flags[4], flags[5]

    sections = request.data.get('sections')
    user.allowed_sections = sections if sections is not None else _ROLE_SECTIONS.get(role, [])

    user.save(update_fields=[
        'is_staff', 'is_admin', 'is_superuser',
        'is_picker', 'is_sales', 'is_accountant',
        'allowed_sections',
    ])
    return Response(UserSerializer(user).data)


# ─────────────────────────────────────────────────────────────────────────────
#  BUSINESSES
# ─────────────────────────────────────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def business_list(request):
    """
    GET  /api/businesses/          — businesses you own or belong to (admins see all)
    POST /api/businesses/          — create; the requester becomes owner
    """
    if request.method == 'GET':
        qs = Business.objects.select_related('owner').prefetch_related('members')
        if not _is_admin(request.user):
            qs = qs.filter(Q(owner=request.user) | Q(members=request.user)).distinct()
        return Response(BusinessSerializer(qs.order_by('name'), many=True).data)

    serializer = BusinessSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(owner=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def business_detail(request, pk):
    """
    GET    /api/businesses/{pk}/
    PATCH  /api/businesses/{pk}/   (owner or admin)
    DELETE /api/businesses/{pk}/   (owner or admin)
    """
    business = get_object_or_404(
        Business.objects.select_related('owner').prefetch_related('members'), pk=pk
    )

    if request.method == 'GET':
        return Response(BusinessSerializer(business).data)

    if business.owner_id != request.user.pk and not _is_admin(request.user):
        return Response({'error': 'Owner or admin access required.'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'DELETE':
        business.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    serializer = BusinessSerializer(
        business, data=request.data, partial=(request.method == 'PATCH')
    )
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─────────────────────────────────────────────────────────────────────────────
#  ORDER WORKFLOW STATS (for SPA stage tabs)
# ─────────────────────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sale_order_stats(request):
    """
    GET /api/orders/stats/ — order counts per workflow stage.
    Returns: { "total": n, "stages": [{status, label, count}, ...] }
    """
    from django.db.models import Count
    counts = dict(
        SaleOrder.objects.values_list('workflow_status')
                         .annotate(c=Count('id'))
                         .values_list('workflow_status', 'c')
    )
    stages = [
        {'status': value, 'label': label, 'count': counts.get(value, 0)}
        for value, label in SaleOrder.STATUS_CHOICES
    ]
    return Response({'total': sum(counts.values()), 'stages': stages})


# ─────────────────────────────────────────────────────────────────────────────
#  USER PASSWORD (admin reset)
# ─────────────────────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def user_set_password(request, pk):
    """
    POST /api/users/{pk}/set-password/   (admin)
    Body: { "password": "min 6 chars" }
    """
    if not _is_admin(request.user):
        return Response({'error': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)

    user = get_object_or_404(User, pk=pk)
    if user.is_superuser and not request.user.is_superuser:
        return Response(
            {'error': 'Only a superuser can change another superuser\'s password.'},
            status=status.HTTP_403_FORBIDDEN,
        )

    password = request.data.get('password') or ''
    if len(password) < 6:
        return Response({'password': 'Must be at least 6 characters.'}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(password)
    user.save(update_fields=['password'])
    return Response({'detail': f'Password updated for {user.username}.'})
