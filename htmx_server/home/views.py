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

from .models import Category, Business, Product, Customer, Sale
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
    products = Product.objects.filter(is_active=True)
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
                       .prefetch_related("categories"),
        pk=pk,
    )
    return render(request, "product_detail.html", {"product": product})


@login_required
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
                buying_price=data["buying_price"],
                retail_price=data["retail_price"],
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


@login_required
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
            product.buying_price = data.get("buying_price", product.buying_price)
            product.wholesale_price = data.get("wholesale_price", product.wholesale_price)
            product.retail_price = data.get("retail_price", product.retail_price)
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


@login_required
@require_POST
def product_delete(request, pk):
    """POST /products/<pk>/delete/ — soft-delete (sets is_active=False)."""
    product = get_object_or_404(Product, pk=pk)
    product.is_active = False
    product.save(update_fields=["is_active"])
    messages.success(request, f'Product "{product.name}" deactivated.')
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
        )
        messages.success(request, f'Customer "{customer.name}" created.')
        return redirect("customer_detail", pk=customer.pk)

    return render(request, "customer_form.html")


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
    """GET /sales/?status=pending|approved|rejected&page=<n>"""
    status_filter = request.GET.get("status", "")
    sales = Sale.objects.select_related("product", "customer", "created_by").filter(deleted=False)
    sales = Sale.objects.all().filter(deleted=False)

    if status_filter == "approved":
        sales = sales.filter(aproved=True, rejected=False)
    elif status_filter == "rejected":
        sales = sales.filter(rejected=True)
    elif status_filter == "pending":
        sales = sales.filter(aproved=False, rejected=False)
        print(sales)

    paginator = Paginator(sales.order_by("-date_sold"), 25)
    page = paginator.get_page(request.GET.get("page"))
    return render(request, "sale_list.html", {
        "page_obj": page,
        "status_filter": status_filter,
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
            price_per_unit = float(data["price_per_unit"])
            customer_id = data.get("customer") or None

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
                # Note: Sale.save() calls product.update_stock — see model.
                # If your Sale.save() calls update_stock_on_sale, that's handled.

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
            price_per_unit=product.retail_price or product.buying_price,
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
        
        total = product.retail_price * qty
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
        query = request.GET.get('q')
        # Search by name or part number, limit to 10 for speed
        products = Product.objects.filter(
            Q(name__icontains=query) | Q(part_number__icontains=query),
            is_active=True,
            quantity_at_hand__gt=0
        )[:10]
        return render(request, "partials/sale_search_results.html", {"products": products})

    # --- 2. HANDLE PRICE CALCULATION (HTMX) ---
    if request.headers.get('HX-Request') and 'product_id' in request.GET:
        p_id = request.GET.get('product_id')
        qty = int(request.GET.get('quantity_sold', 1) or 1)
        product = get_object_or_404(Product, id=p_id)
        
        total = product.retail_price * qty
        return render(request, "partials/sale_calc_snippet.html", {
            "product": product,
            "quantity": qty,
            "total": total
        })

    # --- 3. INITIAL PAGE LOAD ---
    customers = Customer.objects.all().order_by('name')
    return render(request, "sale_page.html", {"customers": customers})

@login_required
def manage_cart(request):
    cart = request.session.get('cart', {})

    # Action: Add Product
    if request.method == "POST" and "add_id" in request.POST:
        p_id = request.POST.get('add_id')
        product = get_object_or_404(Product, id=p_id)
        
        # Add or increment
        cart[p_id] = cart.get(p_id, 0) + 1
        request.session['cart'] = cart
        request.session.modified = True

    # Action: Remove Product
    elif request.method == "POST" and "remove_id" in request.POST:
        p_id = request.POST.get('remove_id')
        if p_id in cart:
            del cart[p_id]
            request.session['cart'] = cart
            request.session.modified = True

    # Prepare data for the template
    cart_items = []
    grand_total = 0
    for p_id, qty in cart.items():
        product = Product.objects.get(id=p_id)
        item_total = product.retail_price * qty
        grand_total += item_total
        cart_items.append({'product': product, 'quantity': qty, 'total': item_total})

    return render(request, "partials/cart_table.html", {
        "cart_items": cart_items,
        "grand_total": grand_total
    })
    
    
from django.db.models import Sum, F, Count, ExpressionWrapper, DecimalField
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
            (F('price_per_unit') - F('product__buying_price')) * F('quantity_sold'),
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

ROLE_MAP = {
    # role_key: (is_staff, is_admin, is_superuser)
    "staff":     (True,  False, False),
    "manager":   (True,  True,  False),
    "admin":     (True,  True,  True),
}

def _role_from_user(user):
    if user.is_superuser:
        return "admin"
    if user.is_admin:
        return "manager"
    return "staff"

def _apply_role(user, role_key):
    is_staff, is_admin, is_superuser = ROLE_MAP.get(role_key, (True, False, False))
    user.is_staff = is_staff
    user.is_admin = is_admin
    user.is_superuser = is_superuser


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
            return render(request, "user_form.html", {"errors": errors, "data": data})

        user = User(
            username=username,
            firstname=data.get("firstname", "").strip(),
            lastname=data.get("lastname", "").strip(),
            email=data.get("email", "").strip() or None,
            mobile=data.get("mobile", "").strip(),
            gender=data.get("gender", "M"),
            is_active=data.get("is_active") == "on",
        )
        _apply_role(user, data.get("role", "staff"))
        user.set_password(password)
        user.save()
        messages.success(request, f'User "{user.username}" created.')
        return redirect("user_list")

    return render(request, "user_form.html", {})


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
                "profile": profile, "errors": errors, "data": data
            })

        profile.username = username
        profile.firstname = data.get("firstname", "").strip()
        profile.lastname = data.get("lastname", "").strip()
        profile.email = data.get("email", "").strip() or None
        profile.mobile = data.get("mobile", "").strip()
        profile.gender = data.get("gender", profile.gender)
        profile.is_active = data.get("is_active") == "on"
        _apply_role(profile, data.get("role", _role_from_user(profile)))

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