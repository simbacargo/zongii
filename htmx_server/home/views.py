import json
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse, HttpResponseForbidden, HttpResponse
from django.views.decorators.http import require_http_methods, require_POST, require_GET
from django.core.paginator import Paginator
from django.db import transaction
from django.db.models import Q
from django.core.exceptions import PermissionDenied
from django.template.loader import render_to_string

from decimal import Decimal
from datetime import date

from django.db.models import Avg as _Avg

from .models import (
    Category, Business, Product, Customer, Sale, Document, DocumentItem,
    SaleOrder, PickingOrder, PickingOrderItem, GatePass, GatePassItem, SaleStatusHistory,
    StockRefill,
)
from notifications.models import Notification
from notifications.utils import notify, notify_admins, notify_pickers
from authentication.models import User


def admin_required(view_func):
    """Restrict a view to admin or superuser only."""
    @login_required
    def wrapper(request, *args, **kwargs):
        if not (request.user.is_superuser or request.user.is_admin):
            raise PermissionDenied
        return view_func(request, *args, **kwargs)
    wrapper.__name__ = view_func.__name__
    return wrapper


def picker_required(view_func):
    """Allow pickers, admins, and superusers."""
    @login_required
    def wrapper(request, *args, **kwargs):
        if not (request.user.is_picker or request.user.is_admin or request.user.is_superuser):
            raise PermissionDenied
        return view_func(request, *args, **kwargs)
    wrapper.__name__ = view_func.__name__
    return wrapper


# ─────────────────────────────────────────────
#  HELPERS
# ─────────────────────────────────────────────

def _json_error(message, status=400):
    return JsonResponse({"success": False, "error": message}, status=status)

def _json_ok(data=None, status=200):
    payload = {"success": True}
    if data is not None:
        payload.update(data)
    return JsonResponse(payload, status=status)


# ═════════════════════════════════════════════
#  CATEGORY
# ═════════════════════════════════════════════

@login_required
@require_GET
def category_list(request):
    """GET /categories/ — list all categories."""
    categories = Category.objects.all().order_by("name")
    return render(request, "category_list.html", {"categories": categories})


@login_required
@require_http_methods(["GET", "POST"])
def category_create(request):
    if request.method == "POST":
        name = request.POST.get("name", "").strip()
        if not name:
            messages.error(request, "Category name is required.")
            return render(request, "category_list.html", {"categories": Category.objects.all().order_by("name")})

        Category.objects.create(name=name)
        categories = Category.objects.all().order_by("name")
        if request.headers.get("HX-Request"):
            return render(request, "category_rows.html", {"categories": categories})
        return redirect("category_list")

    if request.headers.get("HX-Request"):
        return render(request, "category_form.html")
    return redirect("category_list")


@login_required
@require_http_methods(["GET", "POST"])
def category_update(request, pk):
    category = get_object_or_404(Category, pk=pk)

    if request.method == "POST":
        name = request.POST.get("name", "").strip()
        if name:
            category.name = name
            category.save()
        categories = Category.objects.all().order_by("name")
        if request.headers.get("HX-Request"):
            return render(request, "category_rows.html", {"categories": categories})
        return redirect("category_list")

    return redirect("category_list")


@login_required
@require_POST
def category_delete(request, pk):
    category = get_object_or_404(Category, pk=pk)
    category.delete()
    categories = Category.objects.all().order_by("name")
    if request.headers.get("HX-Request"):
        return render(request, "category_rows.html", {"categories": categories})
    return redirect("category_list")


# ═════════════════════════════════════════════
#  BUSINESS
# ═════════════════════════════════════════════

@login_required
@require_GET
def business_list(request):
    """GET /businesses/ — list businesses the user owns or is a member of."""
    businesses = Business.objects.filter(
        Q(owner=request.user) | Q(members=request.user)
    ).distinct()
    return render(request, "business_list.html", {"businesses": businesses})


@login_required
@require_GET
def business_detail(request, pk):
    """GET /businesses/<pk>/ — detail view."""
    business = get_object_or_404(Business, pk=pk)
    if not (business.owner == request.user or business.members.filter(pk=request.user.pk).exists()):
        return HttpResponseForbidden("You do not have access to this business.")
    return render(request, "business_detail.html", {"business": business})


@login_required
@require_http_methods(["GET", "POST"])
def business_create(request):
    """GET — form  |  POST — create a new business (owner = current user)."""
    if request.method == "POST":
        name = request.POST.get("name", "").strip()
        if not name:
            messages.error(request, "Business name is required.")
            return render(request, "business_form.html")

        business = Business.objects.create(name=name, owner=request.user)
        business.members.add(request.user)
        messages.success(request, f'Business "{business.name}" created.')
        return redirect("business_detail", pk=business.pk)

    return render(request, "business_form.html")


@login_required
@require_http_methods(["GET", "POST"])
def business_update(request, pk):
    """GET — prefilled form  |  POST — update (owner only)."""
    business = get_object_or_404(Business, pk=pk)
    if business.owner != request.user:
        return HttpResponseForbidden("Only the owner can edit this business.")

    if request.method == "POST":
        name = request.POST.get("name", "").strip()
        if not name:
            messages.error(request, "Business name is required.")
            return render(request, "business_form.html", {"business": business})

        business.name = name
        business.save()
        messages.success(request, "Business updated.")
        return redirect("business_detail", pk=business.pk)

    return render(request, "business_form.html", {"business": business})


@login_required
@require_POST
def business_delete(request, pk):
    """POST /businesses/<pk>/delete/ — delete (owner only)."""
    business = get_object_or_404(Business, pk=pk)
    if business.owner != request.user:
        return HttpResponseForbidden("Only the owner can delete this business.")
    business.delete()
    messages.success(request, "Business deleted.")
    return redirect("business_list")


# ═════════════════════════════════════════════
#  PRODUCT
# ═════════════════════════════════════════════

@login_required
@require_GET
def product_list(request):
    """
    GET /products/?business=<id>&q=<search>&page=<n>
    Supports search by name, brand, part_number, and UPC.
    """
    business_id = request.GET.get("business")
    query = request.GET.get("q", "").strip()

    # products = Product.objects.select_related("supplier", "business").filter(is_active=True)
    products = Product.objects.filter(is_active=True).annotate(
        avg_selling_price=_Avg('sales__price_per_unit', filter=Q(sales__aproved=True))
    )
    if business_id:
        products = products.filter(business_id=business_id)

    if query:
        products = products.filter(
            Q(name__icontains=query)
            | Q(brand__icontains=query)
            | Q(part_number__icontains=query)
            | Q(upc_code__icontains=query)
        )

    paginator = Paginator(products, 2500)
    page = paginator.get_page(request.GET.get("page"))

    return render(request, "product_list.html", {
        "page_obj": page,
        "query": query,
        "business_id": business_id,
        "product": products,
    })


@login_required
@require_GET
def product_detail(request, pk):
    """GET /products/<pk>/ — full product detail."""
    product = get_object_or_404(
        Product.objects.select_related("business", "created_by")
                       .prefetch_related("categories", "refills"),
        pk=pk,
    )
    last_refill = product.refills.first()
    if last_refill and last_refill.quantity_after > 0:
        stock_threshold = int(last_refill.quantity_after * 0.30)
        if product.quantity_at_hand == 0:
            stock_status = 'empty'
        elif product.quantity_at_hand <= stock_threshold:
            stock_status = 'low'
        else:
            stock_status = 'ok'
    else:
        stock_threshold = None
        stock_status = 'unknown'

    return render(request, "product_details.html", {
        "product": product,
        "last_refill": last_refill,
        "stock_threshold": stock_threshold,
        "stock_status": stock_status,
        "recent_refills": product.refills.all()[:5],
    })


@admin_required
@require_http_methods(["GET", "POST"])
def product_create(request):
    """GET — blank form  |  POST — create product."""
    if request.method == "POST":
        data = request.POST
        if True:
            product = Product(
                name=data["name"],
                # slug=data["slug"],
                description=data.get("description", ""),
                brand=data["brand"],
                part_number=data["part_number"],
                upc_code=data.get("upc_code", ""),
                material=data.get("material", ""),
                is_lead_free=data.get("is_lead_free") == "on",
                max_pressure_psi=data.get("max_pressure_psi") or None,
                buying_price=data.get("buying_price") or None,
                min_price=data.get("min_price") or None,
                max_price=data.get("max_price") or None,
                tax_rate=data.get("tax_rate", 0),
                unit_of_measure=data.get("unit_of_measure", "UNIT"),
                quantity_at_hand=data.get("quantity_at_hand", 0),
                quantity_allocated=data.get("quantity_allocated", 0),
                reorder_point=data.get("reorder_point", 10),
                weight=data.get("weight") or None,
                bin_location=data.get("bin_location", ""),
                # supplier_id=data.get("supplier") or None,
                # business_id=data["business"],
                created_by=request.user,
                # wholesale_price=data["wholesale_price"],
            )
            print(product)
            if request.FILES.get("product_photo"):
                product.product_photo = request.FILES["product_photo"]
            product.save()

            # M2M categories
            category_ids = request.POST.getlist("categories")
            if category_ids:
                product.categories.set(category_ids)

            messages.success(request, f'Product "{product.name}" created.')
            return redirect("product_list")


    context = {
        "categories": Category.objects.all(),
        "businesses": Business.objects.filter(
            Q(owner=request.user) | Q(members=request.user)
        ).distinct(),
        "material_choices": Product.MATERIAL_CHOICES,
        "uom_choices": Product.UOM_CHOICES,
    }
    return render(request, "product_form.html", context)


@admin_required
@require_http_methods(["GET", "POST"])
def product_update(request, pk):
    """GET — prefilled form  |  POST — update product."""
    product = get_object_or_404(Product, pk=pk)

    if request.method == "POST":
        data = request.POST
        try:
            product.name = data.get("name", product.name)
            product.description = data.get("description", product.description)
            product.brand = data.get("brand", product.brand)
            product.part_number = data.get("part_number", product.part_number)
            product.upc_code = data.get("upc_code", product.upc_code)
            product.material = data.get("material", product.material)
            product.is_lead_free = data.get("is_lead_free") == "on"
            product.max_pressure_psi = data.get("max_pressure_psi") or None
            product.buying_price = data.get("buying_price") or None
            product.wholesale_price = data.get("wholesale_price") or None
            product.min_price = data.get("min_price") or None
            product.max_price = data.get("max_price") or None
            product.tax_rate = data.get("tax_rate", product.tax_rate)
            product.unit_of_measure = data.get("unit_of_measure", product.unit_of_measure)
            product.quantity_at_hand = data.get("quantity_at_hand", product.quantity_at_hand)
            product.quantity_allocated = data.get("quantity_allocated", product.quantity_allocated)
            product.reorder_point = data.get("reorder_point", product.reorder_point)
            product.weight = data.get("weight") or None
            product.bin_location = data.get("bin_location", product.bin_location)
            product.is_active = data.get("is_active") == "on"

            if request.FILES.get("product_photo"):
                product.product_photo = request.FILES["product_photo"]

            product.save()

            category_ids = request.POST.getlist("categories")
            product.categories.set(category_ids)

            messages.success(request, "Product updated.")
            return redirect("product_detail", pk=product.pk)

        except Exception as exc:
            messages.error(request, f"Error updating product: {exc}")

    context = {
        "product": product,
        "categories": Category.objects.all(),
        "selected_categories": list(product.categories.values_list("pk", flat=True)),
        "businesses": Business.objects.filter(
            Q(owner=request.user) | Q(members=request.user)
        ).distinct(),
        "material_choices": Product.MATERIAL_CHOICES,
        "uom_choices": Product.UOM_CHOICES,
    }
    return render(request, "product_form.html", context)


@admin_required
@require_POST
def product_delete(request, pk):
    """POST /products/<pk>/delete/ — soft-delete (sets is_active=False)."""
    product = get_object_or_404(Product, pk=pk)
    product.is_active = False
    product.save(update_fields=["is_active"])
    messages.success(request, f'Product "{product.name}" deactivated.')
    if request.headers.get("HX-Request"):
        return HttpResponse("")
    return redirect("product_list")


# ═════════════════════════════════════════════
#  CUSTOMER
# ═════════════════════════════════════════════

@login_required
@require_GET
def customer_list(request):
    """GET /customers/?q=<search>&page=<n>"""
    query = request.GET.get("q", "").strip()
    customers = Customer.objects.all()

    if query:
        customers = customers.filter(
            Q(name__icontains=query) | Q(email__icontains=query) | Q(phone__icontains=query)
        )

    paginator = Paginator(customers.order_by("name"), 25)
    page = paginator.get_page(request.GET.get("page"))
    from django.db.models import Sum as _Sum
    total_debt = Customer.objects.aggregate(total=_Sum('remaining_balance'))['total'] or 0
    return render(request, "customer_list.html", {
        "page_obj": page,
        "query": query,
        "customers": customers,
        "total_debt": total_debt,
    })


@login_required
@require_GET
def customer_detail(request, pk):
    """GET /customers/<pk>/"""
    customer = get_object_or_404(Customer, pk=pk)
    recent_sales = customer.sales.select_related("product").order_by("-date_sold")[:10]
    return render(request, "customer_detail.html", {
        "customer": customer,
        "recent_sales": recent_sales,
    })


@login_required
@require_http_methods(["GET", "POST"])
def customer_create(request):
    if request.method == "POST":
        data = request.POST
        name = data.get("name", "").strip()
        if not name:
            messages.error(request, "Customer name is required.")
            return render(request, "customer_form.html")

        customer = Customer.objects.create(
            name=name,
            email=data.get("email", ""),
            phone=data.get("phone", ""),
            remaining_balance=data.get("remaining_balance", 0),
            debt_due_date=data.get("debt_due_date") or None,
        )
        messages.success(request, f'Customer "{customer.name}" created.')
        return redirect("customer_detail", pk=customer.pk)

    return render(request, "customer_form.html", {"customer": Customer()})


@login_required
@require_http_methods(["GET", "POST"])
def customer_update(request, pk):
    customer = get_object_or_404(Customer, pk=pk)

    if request.method == "POST":
        data = request.POST
        name = data.get("name", "").strip()
        if not name:
            messages.error(request, "Customer name is required.")
            return render(request, "customer_form.html", {"customer": customer})

        customer.name = name
        customer.email = data.get("email", customer.email)
        customer.phone = data.get("phone", customer.phone)
        customer.remaining_balance = data.get("remaining_balance", customer.remaining_balance)
        customer.debt_due_date = data.get("debt_due_date") or None
        customer.save()
        messages.success(request, "Customer updated.")
        return redirect("customer_detail", pk=customer.pk)

    return render(request, "customer_form.html", {"customer": customer})


@login_required
@require_POST
def customer_delete(request, pk):
    customer = get_object_or_404(Customer, pk=pk)
    customer.delete()
    messages.success(request, "Customer deleted.")
    return redirect("customer_list")


@login_required
@require_POST
def customer_pay_balance(request, pk):
    """POST /customers/<pk>/pay/ — apply a payment to outstanding balance."""
    customer = get_object_or_404(Customer, pk=pk)
    try:
        amount = int(request.POST.get("amount", 0))
        if amount <= 0:
            raise ValueError("Amount must be positive.")
        customer.pay_balance(amount)
        messages.success(request, f"Payment of {amount} applied. Remaining: {customer.remaining_balance}.")
    except (ValueError, TypeError) as exc:
        messages.error(request, f"Invalid payment amount: {exc}")
    return redirect("customer_detail", pk=pk)


# ═════════════════════════════════════════════
#  SALE
# ═════════════════════════════════════════════

@login_required
@require_GET
def sale_list(request):
    """GET /sales/?status=pending|approved|rejected&q=<search>&page=<n>"""
    status_filter = request.GET.get("status", "")
    q = request.GET.get("q", "").strip()

    sales = Sale.objects.select_related("product", "customer", "created_by").filter(deleted=False)

    if status_filter == "approved":
        sales = sales.filter(aproved=True, rejected=False)
    elif status_filter == "rejected":
        sales = sales.filter(rejected=True)
    elif status_filter == "pending":
        sales = sales.filter(aproved=False, rejected=False)

    if q:
        upper_q = q.upper()
        if upper_q.startswith("ZC"):
            try:
                sale_num = int(upper_q[2:])
                sales = sales.filter(pk=sale_num)
            except ValueError:
                sales = sales.none()
        else:
            search_q = Q(product__name__icontains=q) | Q(customer__name__icontains=q)
            try:
                search_q |= Q(pk=int(q))
            except ValueError:
                pass
            sales = sales.filter(search_q)

    paginator = Paginator(sales.order_by("-date_sold"), 25)
    page = paginator.get_page(request.GET.get("page"))
    return render(request, "sale_list.html", {
        "page_obj": page,
        "status_filter": status_filter,
        "q": q,
    })


@login_required
@require_GET
def sale_detail(request, pk):
    sale = get_object_or_404(
        Sale.objects.select_related("product", "customer", "created_by"), pk=pk
    )
    return render(request, "sale_detail.html", {"sale": sale})


@login_required
@require_http_methods(["GET", "POST"])
def sale_create(request):
    """
    POST creates the sale record. Stock deduction happens via
    product.update_stock_on_sale() inside an atomic transaction.
    """
    if request.method == "POST":
        data = request.POST
        try:
            product = get_object_or_404(Product, pk=data["product"])
            quantity = int(data["quantity_sold"])
            price_per_unit = Decimal(data["price_per_unit"])
            customer_id = data.get("customer") or None

            # Inline customer creation
            new_customer_name = data.get("new_customer_name", "").strip()
            if new_customer_name:
                total_amount = quantity * price_per_unit
                due_date = data.get("customer_due_date") or None
                new_customer = Customer.objects.create(
                    name=new_customer_name,
                    email=data.get("new_customer_email", ""),
                    phone=data.get("new_customer_phone", ""),
                    remaining_balance=int(total_amount),
                    debt_due_date=due_date,
                )
                customer_id = new_customer.pk

            if quantity <= 0:
                raise ValueError("Quantity must be greater than zero.")
            if product.available_stock < quantity:
                raise ValueError(
                    f"Insufficient stock. Available: {product.available_stock}, requested: {quantity}."
                )

            with transaction.atomic():
                sale = Sale.objects.create(
                    product=product,
                    quantity_sold=quantity,
                    price_per_unit=price_per_unit,
                    created_by=request.user,
                    customer_id=customer_id,
                )

            messages.success(request, f"Sale #{sale.pk} recorded.")
            return redirect("sale_detail", pk=sale.pk)

        except (ValueError, KeyError) as exc:
            messages.error(request, str(exc))

    context = {
        "products": Product.objects.filter(is_active=True).order_by("name"),
        "customers": Customer.objects.all().order_by("name"),
    }
    return render(request, "sale_form.html", context)


@login_required
@require_http_methods(["GET", "POST"])
def sale_update(request, pk):
    """
    Only allows editing quantity and price on unapproved, non-deleted sales.
    Approved sales should be reversed via rejection, not edited directly.
    """
    sale = get_object_or_404(Sale, pk=pk, deleted=False)

    if sale.aproved:
        messages.error(request, "Approved sales cannot be edited. Reject first.")
        return redirect("sale_detail", pk=pk)

    if request.method == "POST":
        data = request.POST
        try:
            quantity = int(data.get("quantity_sold", sale.quantity_sold))
            price_per_unit = float(data.get("price_per_unit", sale.price_per_unit))
            customer_id = data.get("customer") or None

            if quantity <= 0:
                raise ValueError("Quantity must be greater than zero.")

            sale.quantity_sold = quantity
            sale.price_per_unit = price_per_unit
            sale.customer_id = customer_id
            sale.save()

            messages.success(request, "Sale updated.")
            return redirect("sale_detail", pk=sale.pk)

        except (ValueError, TypeError) as exc:
            messages.error(request, str(exc))

    context = {
        "sale": sale,
        "customers": Customer.objects.all().order_by("name"),
    }
    return render(request, "sale_form.html", context)


@login_required
@require_POST
def sale_delete(request, pk):
    """POST — soft-delete."""
    sale = get_object_or_404(Sale, pk=pk)
    sale.deleted = True
    sale.save(update_fields=["deleted"])
    messages.success(request, f"Sale #{pk} removed.")
    return redirect("sale_list")


@login_required
@require_POST
def sale_approve(request, pk):
    """POST /sales/<pk>/approve/"""
    sale = get_object_or_404(Sale, pk=pk, deleted=False, rejected=False)
    if sale.aproved:
        messages.info(request, "Sale is already approved.")
        return redirect("sale_detail", pk=pk)

    with transaction.atomic():
        sale.aproved = True
        sale.save(update_fields=["aproved"])
        sale.product.update_stock_on_sale(sale.quantity_sold, sale.total_amount)

    messages.success(request, f"Sale #{pk} approved and stock updated.")
    return redirect("sale_detail", pk=pk)


@login_required
@require_POST
def sale_reject(request, pk):
    """POST /sales/<pk>/reject/"""
    sale = get_object_or_404(Sale, pk=pk, deleted=False)
    sale.rejected = True
    sale.aproved = False
    sale.save(update_fields=["rejected", "aproved"])
    messages.success(request, f"Sale #{pk} rejected.")
    return redirect("sale_detail", pk=pk)



    
    
    
from django.shortcuts import get_object_or_404, render
from django.http import HttpResponseBadRequest
from django.contrib.auth.decorators import login_required
from .models import Product, Sale
from decimal import Decimal


# @login_required
# def product_sell(request, product_id):
#     print(product_id)
#     if request.method != "POST":
#         return HttpResponseBadRequest("Invalid request")

#     product = get_object_or_404(Product, id=product_id)

#     # --- DEFAULT SALE VALUES ---
#     quantity = 1  # simple quick-sale (like your button implies)
#     price = product.retail_price or product.buying_price

#     # --- STOCK CHECK ---
#     if product.quantity_at_hand < quantity:
#         return render(request, "partials/product_row.html", {
#             "product": product,
#             "error": "Out of stock"
#         })

#     # --- CREATE SALE ---
#     sale = Sale.objects.create(
#         product=product,
#         quantity_sold=quantity,
#         price_per_unit=price,
#         created_by=request.user
#     )

#     # Product stock updates automatically via model.save()

#     # --- REFRESH PRODUCT FROM DB ---
#     product.refresh_from_db()

#     # --- RETURN UPDATED ROW ---
#     return render(request, "partials/product_row.html", {
#         "product": product,
#         "success": f"Sold {quantity} item"
#     })
    
    
from django.shortcuts import render, get_object_or_404
from django.views.decorators.http import require_POST
from django.http import HttpResponse
from .models import Product  # Adjust based on your app structure

@login_required
@require_POST
def product_sell(request, product_id):
    print(product_id)
    """
    Decrements product stock and returns the updated table row fragment.
    """
    product = get_object_or_404(Product, id=product_id)
    
    print(product)
    
    # 1. Logic: Check if stock exists
    if product.quantity_at_hand > 0:
        product.quantity_at_hand -= 1
        product.save()
        Sale.objects.create(
            product=product,
            quantity_sold=1,
            price_per_unit=product.min_price or product.buying_price or 0,
            created_by=request.user
        )
        
        # 2. Return the updated row fragment
        # This uses the same template logic as your table row
        response = render(request, 'partials/product_row.html', {'product': product})
        
        # 3. Optional: Trigger a client-side toast notification via HTMX header
        response['HX-Trigger'] = 'show-sale-toast'
        return response
    
    else:
        # If out of stock, you might want to return an error status 
        # or just the same row with a specific message/state
        return HttpResponse("Out of stock", status=400)
    
    
   
@login_required
def sale_create_htmx(request):
    products = Product.objects.filter(is_active=True, quantity_at_hand__gt=0)
    customers = Customer.objects.all()
    
    if request.headers.get('HX-Request') and 'q' in request.GET:
        query = request.GET.get('q')
        products = Product.objects.filter(
            Q(name__icontains=query) | Q(part_number__icontains=query),
            is_active=True
        )[:10]  # Limit to 10 for performance
        return render(request, "partials/product_search_results.html", {"products": products})

    # Handle HTMX dynamic price/total calculation
    if request.headers.get('HX-Request') and 'product' in request.GET:
        product_id = request.GET.get('product')
        qty = int(request.GET.get('quantity_sold', 1))
        product = get_object_or_404(Product, id=product_id)
        
        total = (product.min_price or 0) * qty
        return render(request, "partials/sale_calculation.html", {
            "product": product,
            "quantity": qty,
            "total": total
        })

    return render(request, "sale_form_htmx.html", {
        "products": products,
        "customers": customers,
    })
        
from django.shortcuts import render, get_object_or_404
from django.db.models import Q
from django.http import HttpResponse
from .models import Product, Customer, Sale
import json

@login_required 
def sale_create_view(request):
    # --- 1. HANDLE LIVE SEARCH (HTMX) ---
    if request.headers.get('HX-Request') and 'q' in request.GET:
        query = request.GET.get('q', '').strip()
        products = Product.objects.filter(
            Q(name__icontains=query) | Q(brand__icontains=query) | Q(part_number__icontains=query),
            is_active=True,
        ).annotate(
            avg_selling_price=_Avg('sales__price_per_unit', filter=Q(sales__aproved=True))
        )[:10]
        return render(request, "partials/sale_search_results.html", {"products": products})

    # --- 2. HANDLE PRICE CALCULATION (HTMX) ---
    if request.headers.get('HX-Request') and 'product_id' in request.GET:
        p_id = request.GET.get('product_id')
        qty = int(request.GET.get('quantity_sold', 1) or 1)
        product = get_object_or_404(Product, id=p_id)

        price = product.average_price or 0
        total = price * qty
        return render(request, "partials/sale_calc_snippet.html", {
            "product": product,
            "quantity": qty,
            "total": total
        })

    # --- 3. INITIAL PAGE LOAD ---
    customers = Customer.objects.all().order_by('name')
    return render(request, "sale_page.html", {"customers": customers})


@login_required
@require_GET
def checkout_product_search(request):
    """Dedicated HTMX endpoint for product search on the checkout page."""
    query = request.GET.get('q', '').strip()
    if not query:
        return HttpResponse('')
    products = Product.objects.filter(
        Q(name__icontains=query) | Q(brand__icontains=query) | Q(part_number__icontains=query),
        is_active=True,
    ).annotate(
        avg_selling_price=_Avg('sales__price_per_unit', filter=Q(sales__aproved=True))
    )[:12]
    return render(request, "partials/sale_search_results.html", {"products": products})

def _cart_item_price(item_data, product):
    raw = item_data.get('price') if isinstance(item_data, dict) else None
    if raw is not None:
        try:
            return Decimal(str(raw))
        except Exception:
            pass
    return Decimal(str(product.max_price or product.average_price or product.min_price or 0))


def _cart_item_qty(item_data):
    if isinstance(item_data, int):
        return item_data
    try:
        return int(item_data.get('quantity', 1) or 1)
    except (ValueError, TypeError):
        return 1


def _build_cart_items(cart):
    items, total = [], Decimal('0')
    for p_id, item_data in list(cart.items()):
        try:
            product = Product.objects.get(id=int(p_id))
            qty   = _cart_item_qty(item_data)
            price = _cart_item_price(item_data, product)
            line  = price * qty
            total += line
            items.append({'product': product, 'quantity': qty, 'price': price, 'total': line})
        except Product.DoesNotExist:
            pass
    return items, total


def _stock_error_response(product, requested, available, cart_items=None, grand_total=None):
    """HTMX response that opens the stock-error modal, optionally resetting the cart via OOB."""
    modal_html = render_to_string('partials/stock_error_modal.html', {
        'product': product,
        'requested': requested,
        'available': available,
    })
    body = modal_html
    if cart_items is not None:
        cart_html = render_to_string('partials/cart_table.html', {
            'cart_items': cart_items,
            'grand_total': grand_total or Decimal('0'),
        })
        # Inject OOB attribute so HTMX swaps the cart back to its corrected state
        cart_oob = cart_html.replace(
            '<div id="cart-container"',
            '<div id="cart-container" hx-swap-oob="outerHTML"',
            1,
        )
        body = cart_oob + modal_html
    response = HttpResponse(body)
    response['HX-Retarget'] = '#modal-content'
    response['HX-Reswap']   = 'innerHTML'
    return response


def _price_error_response(product, entered_price, clamped_price, cart_items, grand_total):
    """HTMX response that opens the price-range-error modal and resets the cart via OOB."""
    modal_html = render_to_string('partials/price_error_modal.html', {
        'product': product,
        'entered_price': entered_price,
        'clamped_price': clamped_price,
    })
    cart_html = render_to_string('partials/cart_table.html', {
        'cart_items': cart_items,
        'grand_total': grand_total or Decimal('0'),
    })
    cart_oob = cart_html.replace(
        '<div id="cart-container"',
        '<div id="cart-container" hx-swap-oob="outerHTML"',
        1,
    )
    response = HttpResponse(cart_oob + modal_html)
    response['HX-Retarget'] = '#modal-content'
    response['HX-Reswap']   = 'innerHTML'
    return response


@login_required
def manage_cart(request):
    cart = request.session.get('cart', {})

    if request.method == "POST":

        if "add_id" in request.POST:
            p_id = str(request.POST.get('add_id'))
            try:
                product = Product.objects.get(id=int(p_id))
            except Product.DoesNotExist:
                product = None

            if product:
                existing    = cart.get(p_id, {})
                current_qty = _cart_item_qty(existing) if existing else 0
                new_qty     = current_qty + 1

                if new_qty > product.available_stock:
                    return _stock_error_response(product, new_qty, product.available_stock)

                default_price = str(product.max_price or product.average_price or product.min_price or '0')
                if isinstance(existing, int):
                    existing = {"quantity": existing, "price": default_price}
                cart[p_id] = {
                    "quantity": new_qty,
                    "price": existing.get("price", default_price),
                }

        elif "remove_id" in request.POST:
            cart.pop(str(request.POST.get('remove_id')), None)

        elif "update_id" in request.POST:
            p_id     = str(request.POST.get('update_id'))
            existing = cart.get(p_id, {})
            if isinstance(existing, int):
                existing = {"quantity": existing, "price": '0'}
            qty       = int(request.POST.get('quantity', existing.get('quantity', 1)) or 1)
            price_raw = request.POST.get('price', existing.get('price', '0'))

            try:
                product = Product.objects.get(id=int(p_id))

                if qty > product.available_stock:
                    capped = max(0, product.available_stock)
                    if capped > 0:
                        cart[p_id] = {"quantity": capped, "price": str(price_raw)}
                    else:
                        cart.pop(p_id, None)
                    request.session['cart'] = cart
                    request.session.modified = True
                    items, total = _build_cart_items(cart)
                    return _stock_error_response(
                        product, qty, product.available_stock,
                        cart_items=items, grand_total=total,
                    )

                # Price range validation — only enforce when both bounds are set
                if product.min_price is not None and product.max_price is not None:
                    try:
                        entered = Decimal(str(price_raw))
                    except Exception:
                        entered = Decimal('0')
                    min_p = Decimal(str(product.min_price))
                    max_p = Decimal(str(product.max_price))
                    if entered < min_p or entered > max_p:
                        clamped = max(min_p, min(max_p, entered))
                        cart[p_id] = {"quantity": qty, "price": str(clamped)}
                        request.session['cart'] = cart
                        request.session.modified = True
                        items, total = _build_cart_items(cart)
                        return _price_error_response(product, entered, clamped, items, total)

            except Product.DoesNotExist:
                pass

            if qty > 0:
                cart[p_id] = {"quantity": qty, "price": str(price_raw)}
            else:
                cart.pop(p_id, None)

        elif "clear" in request.POST:
            cart.clear()

        request.session['cart'] = cart
        request.session.modified = True

    cart_items, grand_total = _build_cart_items(cart)
    return render(request, "partials/cart_table.html", {
        "cart_items": cart_items,
        "grand_total": grand_total,
    })


@login_required
@require_POST
def checkout_submit(request):
    from django.utils import timezone as tz
    cart = request.session.get('cart', {})
    if not cart:
        messages.error(request, "Cart is empty.")
        return redirect('sale_create')

    data = request.POST
    customer_id = data.get('customer') or None
    new_customer_name = data.get('new_customer_name', '').strip()
    sale_order_pk = None

    try:
        with transaction.atomic():
            # Resolve / create customer
            if new_customer_name:
                total_debt = Decimal('0')
                for p_id, item_data in cart.items():
                    try:
                        product = Product.objects.get(pk=int(p_id))
                        total_debt += _cart_item_price(item_data, product) * _cart_item_qty(item_data)
                    except Product.DoesNotExist:
                        pass
                new_customer = Customer.objects.create(
                    name=new_customer_name,
                    email=data.get('new_customer_email', ''),
                    phone=data.get('new_customer_phone', ''),
                    remaining_balance=int(total_debt),
                    debt_due_date=data.get('customer_due_date') or None,
                )
                customer_id = new_customer.pk

            # Create SaleOrder (umbrella for the whole cart)
            sale_order = SaleOrder.objects.create(
                customer_id=customer_id,
                created_by=request.user,
                notes=data.get('notes', ''),
            )

            # Create PickingOrder
            picking_order = PickingOrder.objects.create(sale_order=sale_order)

            # Create Sale line items + PickingOrderItems
            for p_id, item_data in list(cart.items()):
                product = get_object_or_404(Product, pk=int(p_id))
                qty   = _cart_item_qty(item_data)
                price = _cart_item_price(item_data, product)

                if product.available_stock < qty:
                    raise ValueError(
                        f"Insufficient stock for '{product.name}'. "
                        f"Available: {product.available_stock}, requested: {qty}."
                    )
                if (product.min_price is not None and product.max_price is not None
                        and (price < Decimal(str(product.min_price))
                             or price > Decimal(str(product.max_price)))):
                    raise ValueError(
                        f"Price for '{product.name}' must be between "
                        f"{product.min_price} and {product.max_price} (got {price})."
                    )

                sale = Sale.objects.create(
                    order=sale_order,
                    product=product,
                    quantity_sold=qty,
                    price_per_unit=price,
                    created_by=request.user,
                    customer_id=customer_id,
                )
                PickingOrderItem.objects.create(
                    picking_order=picking_order,
                    sale=sale,
                    product=product,
                    requested_qty=qty,
                )

            SaleStatusHistory.objects.create(
                sale_order=sale_order,
                from_status='',
                to_status=SaleOrder.PENDING_PICKING,
                changed_by=request.user,
                note='Order created via checkout',
            )
            sale_order_pk = sale_order.pk

        # Notify every active picker that a new order is waiting
        notify_pickers(
            Notification.ORDER_CREATED,
            title=f"New order {sale_order.order_code} awaiting picking",
            message=f"Created by {request.user.username}. {picking_order.items.count()} item(s).",
            link=f"/orders/{sale_order.pk}/",
            entity_id=sale_order.pk,
        )

        request.session['cart'] = {}
        request.session.modified = True
        messages.success(request, f"Order {sale_order.order_code} created and sent to warehouse.")

    except (ValueError, KeyError) as exc:
        messages.error(request, str(exc))
        return redirect('sale_create')

    return redirect('sale_order_detail', pk=sale_order_pk)
    
    
from django.db.models import Sum, F, Count, ExpressionWrapper, DecimalField, Value
from django.db.models.functions import Coalesce
from datetime import timedelta
from django.utils import timezone

@login_required
def dashboard(request):
    period = request.GET.get('period', 'week')
    today = timezone.now().date()

    if period == 'month':
        start_date = today.replace(day=1)
    else:
        start_date = today - timedelta(days=7)

    sales_qs = Sale.objects.filter(date_sold__date__gte=start_date, aproved=True)

    total_revenue = sales_qs.aggregate(total=Sum('total_amount'))['total'] or 0
    total_sales_count = sales_qs.count()

    total_profit = sales_qs.annotate(
        margin=ExpressionWrapper(
            (F('price_per_unit') - Coalesce(F('product__buying_price'), Value(0, output_field=DecimalField()))) * F('quantity_sold'),
            output_field=DecimalField()
        )
    ).aggregate(total=Sum('margin'))['total'] or 0

    low_stock = Product.objects.filter(quantity_at_hand__lte=F('reorder_point'), is_active=True)
    pending_count = Sale.objects.filter(aproved=False, rejected=False, deleted=False).count()
    total_customers = Customer.objects.count()
    total_debt = Customer.objects.aggregate(total=Sum('remaining_balance'))['total'] or 0

    top_products = (
        Product.objects
        .filter(sales__aproved=True, sales__date_sold__date__gte=start_date)
        .annotate(total_sold=Sum('sales__quantity_sold'), total_revenue=Sum('sales__total_amount'))
        .order_by('-total_sold')[:5]
    )

    recent_sales = (
        Sale.objects
        .select_related('product', 'customer', 'created_by')
        .filter(deleted=False)
        .order_by('-date_sold')[:10]
    )

    chart_labels = []
    chart_revenue = []
    days_to_track = 30 if period == 'month' else 7

    for i in range(days_to_track - 1, -1, -1):
        day = today - timedelta(days=i)
        chart_labels.append(day.strftime('%d %b'))
        day_total = Sale.objects.filter(date_sold__date=day, aproved=True).aggregate(Sum('total_amount'))['total_amount__sum'] or 0
        chart_revenue.append(float(day_total))

    context = {
        "revenue": total_revenue,
        "profit": total_profit,
        "total_sales_count": total_sales_count,
        "total_customers": total_customers,
        "pending_count": pending_count,
        "total_debt": total_debt,
        "low_stock_count": low_stock.count(),
        "low_stock_items": low_stock[:5],
        "top_products": top_products,
        "recent_sales": recent_sales,
        "chart_labels": json.dumps(chart_labels),
        "chart_revenue": json.dumps(chart_revenue),
        "period": period,
    }

    if request.headers.get('HX-Request'):
        return render(request, "partials/dashboard_content.html", context)

    return render(request, "dashboard.html", context)



from django.shortcuts import render, get_object_or_404
from django.db.models import Sum, F
from .models import Customer, Sale # Assuming your models

@login_required
def customer_debt_list(request):
    customers = Customer.objects.filter(remaining_balance__gt=0).order_by('-remaining_balance')

    if request.method == "POST" and request.headers.get('HX-Request'):
        customer_id = request.POST.get('customer_id')
        amount_paid = float(request.POST.get('amount', 0))
        customer = get_object_or_404(Customer, id=customer_id)

        if amount_paid > 0:
            customer.remaining_balance = F('remaining_balance') - amount_paid
            customer.save()
            customer.refresh_from_db()

        if customer.remaining_balance <= 0:
            from django.http import HttpResponse as _HR
            return _HR("")

        return render(request, "customer_rows.html", {"c": customer})

    from django.db.models import Sum as _Sum
    total_debt = customers.aggregate(total=_Sum('remaining_balance'))['total'] or 0
    return render(request, "customer_list.html", {"customers": customers, "total_debt": total_debt})


# ═════════════════════════════════════════════
#  USER MANAGEMENT  (admin/superuser only)
# ═════════════════════════════════════════════

# role_key: (is_staff, is_admin, is_superuser, is_picker, is_sales, is_accountant)
ROLE_MAP = {
    "staff":      (True,  False, False, False, False, False),
    "sales":      (True,  False, False, False, True,  False),
    "accountant": (True,  False, False, False, False, True),
    "picker":     (True,  False, False, True,  False, False),
    "manager":    (True,  True,  False, False, False, False),
    "admin":      (True,  True,  True,  False, False, False),
}

# Default section access granted when a role is assigned
ROLE_SECTIONS = {
    "staff":      ["dashboard", "sales", "orders", "customers"],
    "sales":      ["dashboard", "inventory", "sales", "orders", "customers"],
    "accountant": ["dashboard", "sales", "billing"],
    "picker":     ["dashboard", "orders"],
    "manager":    ["dashboard", "inventory", "sales", "orders", "customers", "billing"],
    "admin":      ["dashboard", "inventory", "sales", "orders", "customers", "billing", "users"],
}

ALL_SECTIONS = [
    ("dashboard",  "Dashboard",              "bi-grid-1x2"),
    ("inventory",  "Inventory & Products",   "bi-boxes"),
    ("sales",      "Sales",                  "bi-receipt"),
    ("orders",     "Warehouse Orders",       "bi-box-seam"),
    ("customers",  "Customers",              "bi-people"),
    ("billing",    "Invoices & Billing",     "bi-file-earmark-text"),
    ("users",      "User Management",        "bi-shield-lock"),
]

def _user_vals(profile=None, data=None):
    """Flatten user field values into a plain dict safe for template use."""
    vals = {
        "firstname": "", "lastname": "", "username": "",
        "email": "", "mobile": "", "gender": "M",
    }
    if profile and profile.pk:
        vals.update({
            "firstname": profile.firstname or "",
            "lastname":  profile.lastname  or "",
            "username":  profile.username  or "",
            "email":     profile.email     or "",
            "mobile":    profile.mobile    or "",
            "gender":    profile.gender    or "M",
        })
    if data:
        for key in vals:
            if data.get(key):
                vals[key] = data[key]
    return vals

def _role_from_user(user):
    if user.is_superuser:
        return "admin"
    if user.is_admin:
        return "manager"
    if user.is_picker:
        return "picker"
    if user.is_accountant:
        return "accountant"
    if user.is_sales:
        return "sales"
    return "staff"

def _apply_role(user, role_key, sections=None):
    flags = ROLE_MAP.get(role_key, (True, False, False, False, False, False))
    user.is_staff, user.is_admin, user.is_superuser, user.is_picker, user.is_sales, user.is_accountant = flags
    user.allowed_sections = sections if sections is not None else ROLE_SECTIONS.get(role_key, [])


@admin_required
@require_GET
def user_list(request):
    query = request.GET.get("q", "").strip()
    users = User.objects.all()
    if query:
        users = users.filter(
            Q(username__icontains=query)
            | Q(firstname__icontains=query)
            | Q(lastname__icontains=query)
            | Q(email__icontains=query)
        )
    users = users.order_by("username")
    return render(request, "user_list.html", {"users": users, "query": query})


@admin_required
@require_http_methods(["GET", "POST"])
def user_create(request):
    if request.method == "POST":
        data = request.POST
        username = data.get("username", "").strip()
        password = data.get("password", "").strip()
        errors = {}

        if not username:
            errors["username"] = "Username is required."
        elif User.objects.filter(username__iexact=username).exists():
            errors["username"] = "Username already taken."
        if not password or len(password) < 6:
            errors["password"] = "Password must be at least 6 characters."

        if errors:
            return render(request, "user_form.html", {
                "profile": None, "errors": errors, "vals": _user_vals(data=data),
            })

        role = data.get("role", "staff")
        sections = data.getlist("sections") or ROLE_SECTIONS.get(role, [])
        user = User(
            username=username,
            firstname=data.get("firstname", "").strip(),
            lastname=data.get("lastname", "").strip(),
            email=data.get("email", "").strip() or None,
            mobile=data.get("mobile", "").strip(),
            gender=data.get("gender", "M"),
            is_active=data.get("is_active") == "on",
        )
        _apply_role(user, role, sections)
        user.set_password(password)
        user.save()
        messages.success(request, f'User "{user.username}" created.')
        return redirect("user_list")

    return render(request, "user_form.html", {
        "profile": None,
        "vals": _user_vals(),
        "all_sections": ALL_SECTIONS,
        "role_sections_json": json.dumps(ROLE_SECTIONS),
    })


@admin_required
@require_GET
def user_detail(request, pk):
    profile = get_object_or_404(User, pk=pk)
    recent_sales = Sale.objects.filter(
        created_by=profile, deleted=False
    ).order_by("-date_sold")[:10]
    return render(request, "user_detail.html", {
        "profile": profile,
        "role": _role_from_user(profile),
        "recent_sales": recent_sales,
    })


@admin_required
@require_http_methods(["GET", "POST"])
def user_update(request, pk):
    profile = get_object_or_404(User, pk=pk)

    if profile.pk == request.user.pk and not request.user.is_superuser:
        messages.error(request, "Use your profile settings to edit your own account.")
        return redirect("user_detail", pk=pk)

    if request.method == "POST":
        data = request.POST
        username = data.get("username", "").strip()
        errors = {}

        if not username:
            errors["username"] = "Username is required."
        elif User.objects.filter(username__iexact=username).exclude(pk=pk).exists():
            errors["username"] = "Username already taken."

        if errors:
            return render(request, "user_form.html", {
                "profile": profile, "errors": errors,
                "vals": _user_vals(profile, data), "role": data.get("role", _role_from_user(profile)),
            })

        role = data.get("role", _role_from_user(profile))
        sections = data.getlist("sections") or ROLE_SECTIONS.get(role, [])
        profile.username = username
        profile.firstname = data.get("firstname", "").strip()
        profile.lastname = data.get("lastname", "").strip()
        profile.email = data.get("email", "").strip() or None
        profile.mobile = data.get("mobile", "").strip()
        profile.gender = data.get("gender", profile.gender)
        profile.is_active = data.get("is_active") == "on"
        _apply_role(profile, role, sections)

        new_password = data.get("password", "").strip()
        if new_password:
            if len(new_password) < 6:
                errors["password"] = "Password must be at least 6 characters."
                return render(request, "user_form.html", {
                    "profile": profile, "errors": errors, "data": data
                })
            profile.set_password(new_password)

        profile.save()
        messages.success(request, f'User "{profile.username}" updated.')
        return redirect("user_detail", pk=pk)

    return render(request, "user_form.html", {
        "profile": profile,
        "role": _role_from_user(profile),
        "vals": _user_vals(profile),
        "all_sections": ALL_SECTIONS,
        "role_sections_json": json.dumps(ROLE_SECTIONS),
        "user_sections": list(profile.allowed_sections or ROLE_SECTIONS.get(_role_from_user(profile), [])),
    })


@admin_required
@require_POST
def user_toggle_active(request, pk):
    profile = get_object_or_404(User, pk=pk)
    if profile.pk == request.user.pk:
        messages.error(request, "You cannot deactivate your own account.")
        return redirect("user_detail", pk=pk)
    profile.is_active = not profile.is_active
    profile.save(update_fields=["is_active"])
    status = "activated" if profile.is_active else "deactivated"
    messages.success(request, f'User "{profile.username}" {status}.')
    if request.headers.get("HX-Request"):
        return render(request, "partials/user_status_badge.html", {"profile": profile})
    return redirect("user_detail", pk=pk)


@admin_required
@require_POST
def user_delete(request, pk):
    profile = get_object_or_404(User, pk=pk)
    if profile.pk == request.user.pk:
        messages.error(request, "You cannot delete your own account.")
        return redirect("user_detail", pk=pk)
    if profile.is_superuser and not request.user.is_superuser:
        raise PermissionDenied
    username = profile.username
    profile.delete()
    messages.success(request, f'User "{username}" deleted.')
    return redirect("user_list")


# ═════════════════════════════════════════════
#  DOCUMENTS  (Invoices & Quotations)
# ═════════════════════════════════════════════

@login_required
@require_GET
def document_list(request):
    doc_type = request.GET.get('type', '')
    status   = request.GET.get('status', '')
    docs = Document.objects.select_related('customer', 'created_by')
    if doc_type:
        docs = docs.filter(doc_type=doc_type)
    if status:
        docs = docs.filter(status=status)
    paginator = Paginator(docs, 25)
    page = paginator.get_page(request.GET.get('page'))
    return render(request, 'invoice_list.html', {
        'page_obj': page,
        'doc_type': doc_type,
        'status_filter': status,
        'invoice_count':   Document.objects.filter(doc_type='invoice').count(),
        'quotation_count': Document.objects.filter(doc_type='quotation').count(),
        'statuses': ['draft', 'sent', 'paid', 'accepted', 'rejected', 'cancelled'],
    })


@login_required
@require_http_methods(['GET', 'POST'])
def document_create(request):
    if request.method == 'POST':
        data        = request.POST
        doc_type    = data.get('doc_type', 'invoice')
        customer_id = data.get('customer')

        if not customer_id:
            messages.error(request, 'Please select a customer.')
            return render(request, 'invoice_form.html', {
                'customers': Customer.objects.order_by('name'),
                'today': date.today(),
                'data': data,
            })

        doc = Document.objects.create(
            doc_type         = doc_type,
            customer_id      = customer_id,
            created_by       = request.user,
            status           = 'draft',
            issue_date       = data.get('issue_date') or date.today(),
            due_date         = data.get('due_date') or None,
            notes            = data.get('notes', ''),
            terms            = data.get('terms', ''),
            discount_percent = Decimal(data.get('discount_percent') or '0'),
        )

        descriptions = data.getlist('description[]')
        quantities   = data.getlist('quantity[]')
        prices       = data.getlist('unit_price[]')
        product_ids  = data.getlist('product_id[]')
        units        = data.getlist('unit[]')

        for i, desc in enumerate(descriptions):
            if not desc.strip():
                continue
            try:
                qty   = Decimal(quantities[i] or '1')
                price = Decimal(prices[i]     or '0')
            except Exception:
                continue
            pid  = product_ids[i] if i < len(product_ids) else ''
            unit = units[i].strip() if i < len(units) and units[i].strip() else 'PCS'
            DocumentItem.objects.create(
                document    = doc,
                product_id  = pid or None,
                description = desc.strip(),
                unit        = unit,
                quantity    = qty,
                unit_price  = price,
            )

        doc.recompute_totals()
        messages.success(request, f'{doc.get_doc_type_display()} {doc.number} created.')
        return redirect('document_detail', pk=doc.pk)

    return render(request, 'invoice_form.html', {
        'customers': Customer.objects.order_by('name'),
        'today': date.today(),
    })


@login_required
@require_GET
def document_detail(request, pk):
    doc = get_object_or_404(
        Document.objects.select_related('customer', 'created_by')
                        .prefetch_related('items__product'),
        pk=pk,
    )
    next_statuses = {
        'draft':    ['sent', 'cancelled'],
        'sent':     ['paid', 'accepted', 'rejected', 'cancelled'],
        'paid':     [],
        'accepted': ['paid', 'cancelled'],
        'rejected': [],
        'cancelled': [],
    }
    return render(request, 'invoice_detail.html', {
        'doc': doc,
        'next_statuses': next_statuses.get(doc.status, []),
    })


@login_required
@require_POST
def document_status(request, pk):
    doc        = get_object_or_404(Document, pk=pk)
    new_status = request.POST.get('status')
    valid      = [s[0] for s in Document.STATUSES]
    if new_status in valid:
        doc.status = new_status
        doc.save(update_fields=['status'])
        messages.success(request, f'Status updated to {new_status}.')
    return redirect('document_detail', pk=pk)


@login_required
@require_POST
def document_delete(request, pk):
    doc = get_object_or_404(Document, pk=pk)
    doc.delete()
    messages.success(request, 'Document deleted.')
    return redirect('document_list')


@login_required
def document_pdf(request, pk):
    import weasyprint
    doc = get_object_or_404(
        Document.objects.select_related('customer', 'created_by')
                        .prefetch_related('items__product'),
        pk=pk,
    )
    html_string = render_to_string('invoice_pdf.html', {'doc': doc}, request=request)
    pdf_bytes = weasyprint.HTML(
        string=html_string,
        base_url=request.build_absolute_uri('/'),
    ).write_pdf()
    response = HttpResponse(pdf_bytes, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="{doc.number}.pdf"'
    return response


@login_required
@require_GET
def document_pdf(request, pk):
    from weasyprint import HTML
    doc = get_object_or_404(
        Document.objects.select_related('customer', 'created_by')
                        .prefetch_related('items__product'),
        pk=pk,
    )
    html = render_to_string('invoice_pdf.html', {'doc': doc}, request=request)
    pdf  = HTML(string=html, base_url=request.build_absolute_uri('/')).write_pdf()
    filename = f"{doc.number}.pdf"
    response = HttpResponse(pdf, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    return response


@login_required
@require_GET
def document_item_row(request):
    index = int(request.GET.get('index', 0))
    return render(request, 'partials/invoice_item_row.html', {'index': index})


@login_required
@require_GET
def document_product_search(request):
    q     = request.GET.get('q', '').strip()
    index = request.GET.get('index', 0)
    products = []
    if len(q) >= 2:
        products = Product.objects.filter(
            Q(name__icontains=q) | Q(part_number__icontains=q) | Q(brand__icontains=q),
            is_active=True,
        ).select_related()[:8]
    return render(request, 'partials/invoice_product_results.html', {
        'products': products,
        'index': index,
    })

# ═════════════════════════════════════════════════════════════════════════════
#  WAREHOUSE WORKFLOW
# ═════════════════════════════════════════════════════════════════════════════

from django.utils import timezone as _tz


# ── Sale Orders ───────────────────────────────────────────────────────────────

@login_required
def sale_order_list(request):
    from django.db.models import Count as _Count
    status_filter = request.GET.get('status', '')
    q = request.GET.get('q', '').strip()

    all_orders = SaleOrder.objects.all()

    # Per-stage counts (always over the full unfiltered set)
    raw_counts = dict(
        all_orders.values_list('workflow_status').annotate(c=_Count('id'))
    )
    total_count = all_orders.count()

    # Build a structured stage list the template can iterate over
    STAGE_META = [
        ('PENDING_PICKING',  'Pending Picking',  'bi-hourglass-split',      'amber'),
        ('PICKING',          'Picking',           'bi-box-arrow-in-down',    'blue'),
        ('PARTIALLY_PICKED', 'Partially Picked',  'bi-pie-chart-fill',       'orange'),
        ('PICKED',           'Picked',            'bi-check2-square',        'cyan'),
        ('VERIFIED',         'Verified',          'bi-patch-check-fill',     'green'),
        ('RE_PICK_REQUIRED', 'Re-pick Required',  'bi-arrow-repeat',         'purple'),
        ('REJECTED',         'Rejected',          'bi-x-circle-fill',        'red'),
        ('DISPATCHED',       'Dispatched',        'bi-truck',                'emerald'),
        ('CANCELLED',        'Cancelled',         'bi-slash-circle',         'gray'),
    ]
    stages = [
        {
            'value': val,
            'label': label,
            'icon':  icon,
            'color': color,
            'count': raw_counts.get(val, 0),
            'active': status_filter == val,
        }
        for val, label, icon, color in STAGE_META
    ]

    orders = all_orders.select_related('customer', 'created_by')

    if status_filter:
        orders = orders.filter(workflow_status=status_filter)

    if q:
        upper_q = q.upper()
        if upper_q.startswith('ZO'):
            try:
                orders = orders.filter(pk=int(upper_q[2:]))
            except ValueError:
                orders = orders.none()
        else:
            orders = orders.filter(
                Q(customer__name__icontains=q) |
                Q(created_by__username__icontains=q) |
                Q(created_by__firstname__icontains=q)
            )

    paginator = Paginator(orders.order_by('-created_at'), 25)
    page = paginator.get_page(request.GET.get('page'))
    return render(request, 'sale_order_list.html', {
        'page_obj': page,
        'status_filter': status_filter,
        'q': q,
        'stages': stages,
        'total_count': total_count,
    })


@login_required
def sale_order_detail(request, pk):
    order = get_object_or_404(
        SaleOrder.objects.select_related('customer', 'created_by', 'verified_by')
                         .prefetch_related('sales__product', 'history__changed_by',
                                           'picking_orders__picker', 'picking_orders__items__product'),
        pk=pk,
    )
    active_picking = order.picking_orders.filter(
        status__in=[PickingOrder.PENDING, PickingOrder.ACCEPTED, PickingOrder.PARTIALLY_PICKED]
    ).first()
    last_completed_picking = order.picking_orders.filter(
        status=PickingOrder.COMPLETED
    ).prefetch_related('items__product').last()
    try:
        gate_pass = order.gate_pass
    except GatePass.DoesNotExist:
        gate_pass = None

    return render(request, 'sale_order_detail.html', {
        'order': order,
        'active_picking': active_picking,
        'last_completed_picking': last_completed_picking,
        'gate_pass': gate_pass,
    })


@login_required
@require_POST
def sale_order_verify(request, pk):
    """Sales Person verifies (or rejects / requests re-pick) a picked order."""
    order = get_object_or_404(SaleOrder, pk=pk)
    action = request.POST.get('action')

    if order.workflow_status not in (SaleOrder.PICKED, SaleOrder.PARTIALLY_PICKED, SaleOrder.RE_PICK_REQUIRED):
        messages.error(request, "This order is not ready for verification.")
        return redirect('sale_order_detail', pk=pk)

    # Find the most recent picking order (completed or partially picked)
    last_picking = order.picking_orders.filter(
        status__in=[PickingOrder.COMPLETED, PickingOrder.PARTIALLY_PICKED]
    ).last()

    # Self-verification guard — admins/superusers may override
    if (last_picking and last_picking.picker == request.user
            and not (request.user.is_admin or request.user.is_superuser)):
        messages.error(request, "You cannot verify picking you performed yourself.")
        return redirect('sale_order_detail', pk=pk)

    note = request.POST.get('note', '')

    try:
        with transaction.atomic():
            if action == 'approve':
                order.verified_by = request.user
                order.verified_at = _tz.now()
                order.save(update_fields=['verified_by', 'verified_at', 'updated_at'])
                order.transition(SaleOrder.VERIFIED, request.user, note or 'Verified by sales person')

                gp = GatePass.objects.create(
                    sale_order=order,
                    picking_order=last_picking,
                    verified_by=request.user,
                )
                items_source = last_picking.items.select_related('product') if last_picking else []
                for poi in items_source:
                    GatePassItem.objects.create(
                        gate_pass=gp,
                        product=poi.product,
                        requested_qty=poi.requested_qty,
                        picked_qty=poi.picked_qty,
                    )
                messages.success(request, f"Order {order.order_code} verified. Gate Pass {gp.gp_code} generated.")

            elif action == 'reject':
                order.transition(SaleOrder.REJECTED, request.user, note or 'Rejected by sales person')
                messages.warning(request, f"Order {order.order_code} has been rejected.")

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
                notify_pickers(
                    Notification.RE_PICK_REQUESTED,
                    title=f"Re-pick requested for {order.order_code}",
                    message=note or f"Requested by {request.user.username}.",
                    link=f"/orders/{order.pk}/",
                    entity_id=order.pk,
                )
                messages.info(request, f"Re-pick requested for {order.order_code}.")

            else:
                messages.error(request, "Unknown action.")

    except Exception as exc:
        messages.error(request, f"Action failed: {exc}")

    return redirect('sale_order_detail', pk=pk)


@login_required
@require_POST
def dispatch_order(request, pk):
    """Mark a verified order as dispatched and reduce stock."""
    order = get_object_or_404(SaleOrder, pk=pk)

    if order.workflow_status != SaleOrder.VERIFIED:
        messages.error(request, "Only verified orders can be dispatched.")
        return redirect('sale_order_detail', pk=pk)

    try:
        gate_pass = order.gate_pass
    except GatePass.DoesNotExist:
        messages.error(request, "Cannot dispatch: gate pass not found.")
        return redirect('sale_order_detail', pk=pk)

    with transaction.atomic():
        # Reduce stock for each sale line item
        for sale in order.sales.select_related('product').all():
            sale.product.update_stock_on_sale(sale.quantity_sold, sale.total_amount)

        order.dispatched_at = _tz.now()
        order.save(update_fields=['dispatched_at', 'updated_at'])
        order.transition(SaleOrder.DISPATCHED, request.user, 'Goods dispatched')
        gate_pass.is_used = True
        gate_pass.save(update_fields=['is_used'])

    # Notify the sales person who created the order
    if order.created_by:
        notify(
            order.created_by,
            Notification.ORDER_DISPATCHED,
            title=f"Order {order.order_code} has been dispatched",
            message="Goods have left the warehouse. Stock has been updated.",
            link=f"/orders/{order.pk}/",
            entity_id=order.pk,
        )

    messages.success(request, f"Order {order.order_code} dispatched. Stock updated.")
    return redirect('sale_order_detail', pk=pk)


# ── Picker Dashboard & Picking ────────────────────────────────────────────────

@picker_required
def picker_dashboard(request):
    pending_orders = SaleOrder.objects.filter(
        workflow_status__in=[
            SaleOrder.PENDING_PICKING,
            SaleOrder.RE_PICK_REQUIRED,
        ]
    ).select_related('customer', 'created_by').prefetch_related('sales')

    my_active = PickingOrder.objects.filter(
        picker=request.user,
        status__in=[PickingOrder.ACCEPTED, PickingOrder.PARTIALLY_PICKED],
    ).select_related('sale_order__customer')

    return render(request, 'picker_dashboard.html', {
        'pending_orders': pending_orders,
        'my_active': my_active,
    })


@picker_required
@require_POST
def picking_accept(request, pk):
    """Picker accepts a picking order."""
    picking = get_object_or_404(PickingOrder, pk=pk, status=PickingOrder.PENDING)
    picking.picker = request.user
    picking.status = PickingOrder.ACCEPTED
    picking.accepted_at = _tz.now()
    picking.save(update_fields=['picker', 'status', 'accepted_at'])
    picking.sale_order.transition(
        SaleOrder.PICKING, request.user,
        f'Picking accepted by {request.user.username}'
    )
    messages.success(request, f"You accepted picking order {picking.picking_code}.")
    return redirect('picking_detail', pk=pk)


@picker_required
def picking_detail(request, pk):
    picking = get_object_or_404(
        PickingOrder.objects.select_related('sale_order__customer', 'picker')
                            .prefetch_related('items__product'),
        pk=pk,
    )
    return render(request, 'picking_detail.html', {'picking': picking})


@picker_required
@require_POST
def picking_save(request, pk):
    """Save picked quantities for each item in a picking order."""
    picking = get_object_or_404(
        PickingOrder.objects.select_related('sale_order'),
        pk=pk,
        status__in=[PickingOrder.ACCEPTED, PickingOrder.PARTIALLY_PICKED],
    )

    # Enforce: only the assigned picker (or admin) can submit picks
    if not (request.user == picking.picker or request.user.is_admin or request.user.is_superuser):
        messages.error(request, "Only the assigned picker can submit picks.")
        return redirect('picking_detail', pk=pk)

    with transaction.atomic():
        for item in picking.items.select_related('product').all():
            raw = request.POST.get(f'picked_{item.pk}', '0')
            try:
                qty = max(0, int(raw))
            except ValueError:
                qty = 0
            item.picked_qty = min(qty, item.requested_qty)
            item.notes = request.POST.get(f'notes_{item.pk}', '')
            item.save(update_fields=['picked_qty', 'notes'])

        picking.notes = request.POST.get('picker_notes', '')

        if picking.is_fully_picked:
            picking.status = PickingOrder.COMPLETED
            picking.completed_at = _tz.now()
            new_order_status = SaleOrder.PICKED
        elif any(i.picked_qty > 0 for i in picking.items.all()):
            picking.status = PickingOrder.PARTIALLY_PICKED
            new_order_status = SaleOrder.PARTIALLY_PICKED
        else:
            new_order_status = None

        picking.save(update_fields=['status', 'completed_at', 'notes'])

        if new_order_status:
            picking.sale_order.transition(
                new_order_status, request.user,
                f'Picking {"completed" if new_order_status == SaleOrder.PICKED else "partial"} by {request.user.username}'
            )
            # Notify the sales person who created the order
            order_creator = picking.sale_order.created_by
            if order_creator:
                notif_type = Notification.ORDER_PICKED
                label = "fully picked" if new_order_status == SaleOrder.PICKED else "partially picked"
                notify(
                    order_creator,
                    notif_type,
                    title=f"Order {picking.sale_order.order_code} is ready for verification",
                    message=f"Items were {label} by {request.user.username}. Please verify.",
                    link=f"/orders/{picking.sale_order.pk}/",
                    entity_id=picking.sale_order.pk,
                )

    messages.success(request, "Picking saved.")
    return redirect('picking_detail', pk=pk)


# ── Gate Pass ─────────────────────────────────────────────────────────────────

@login_required
def gate_pass_detail(request, pk):
    gp = get_object_or_404(
        GatePass.objects.select_related(
            'sale_order__customer', 'sale_order__created_by',
            'picking_order__picker', 'verified_by',
        ).prefetch_related('items__product'),
        pk=pk,
    )
    return render(request, 'gate_pass.html', {'gp': gp})


@login_required
def gate_pass_print(request, pk):
    gp = get_object_or_404(
        GatePass.objects.select_related(
            'sale_order__customer', 'sale_order__created_by',
            'picking_order__picker', 'verified_by',
        ).prefetch_related('items__product'),
        pk=pk,
    )
    return render(request, 'gate_pass_print.html', {'gp': gp})


# ── Stock Refill ──────────────────────────────────────────────────────────────

@login_required
@require_POST
def stock_refill_view(request, pk):
    if not (request.user.is_admin or request.user.is_superuser):
        raise PermissionDenied
    product = get_object_or_404(Product, pk=pk)
    try:
        qty = int(request.POST.get('quantity_added', 0))
    except (ValueError, TypeError):
        qty = 0
    if qty <= 0:
        messages.error(request, "Quantity must be a positive number.")
        return redirect('product_detail', pk=pk)

    notes = request.POST.get('notes', '')
    quantity_after = product.quantity_at_hand + qty

    with transaction.atomic():
        StockRefill.objects.create(
            product=product,
            quantity_added=qty,
            quantity_after=quantity_after,
            refilled_by=request.user,
            notes=notes,
        )
        product.quantity_at_hand = F('quantity_at_hand') + qty
        product.save(update_fields=['quantity_at_hand'])
        # Refilling clears existing low-stock alerts for this product (matched by entity_id)
        Notification.objects.filter(
            notification_type=Notification.LOW_STOCK,
            entity_id=product.pk,
            is_read=False,
        ).update(is_read=True)

    messages.success(request, f"Added {qty} units to {product.name}. New stock: {quantity_after}.")
    return redirect('product_detail', pk=pk)


