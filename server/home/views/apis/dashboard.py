"""
dashboard_api.py
────────────────
All endpoints return JSON and require an authenticated user.
Every endpoint accepts an optional `?business=<id>` query param to scope
results to a specific business the user belongs to.

URL prefix suggestion:  path("api/dashboard/", include("inventory.dashboard_urls"))

Endpoints
─────────
GET /api/dashboard/overview/              → KPI summary cards
GET /api/dashboard/sales/trend/           → Revenue over time (daily/weekly/monthly)
GET /api/dashboard/sales/breakdown/       → Sales by status (approved/pending/rejected)
GET /api/dashboard/inventory/health/      → Stock levels, low-stock & out-of-stock counts
GET /api/dashboard/inventory/valuation/   → Stock value at cost vs retail
GET /api/dashboard/products/top/          → Top-selling products by revenue & quantity
GET /api/dashboard/customers/top/         → Top customers by spend
GET /api/dashboard/customers/balances/    → Customers with outstanding balances
GET /api/dashboard/activity/recent/       → Latest sales activity feed
"""

from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_GET
from django.db.models import (
    Sum, Count, Avg, F, Q,
    DecimalField, IntegerField, ExpressionWrapper,
)
from django.db.models.functions import (
    TruncDay, TruncWeek, TruncMonth, Coalesce,
)
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from ...models import Business, Product, Customer, Sale


# ─────────────────────────────────────────────
#  SHARED HELPERS
# ─────────────────────────────────────────────

def _error(msg, status=400):
    return JsonResponse({"success": False, "error": msg}, status=status)


def _ok(data):
    return JsonResponse({"success": True, "data": data})


def _get_business_scope(request):
    """
    Returns a (business_ids, error_response) tuple.
    business_ids → list of PKs the user may access.
    If ?business=<id> is provided, validates membership and returns that single id.
    error_response is non-None only when access is denied.
    """
    user = request.user
    accessible = Business.objects.filter(
        Q(owner=user) | Q(members=user)
    ).values_list("pk", flat=True)

    business_param = request.GET.get("business")
    if business_param:
        try:
            bid = int(business_param)
        except ValueError:
            return None, _error("Invalid business id.")
        if bid not in accessible:
            return None, _error("Business not found or access denied.", 403)
        return [bid], None

    return list(accessible), None

from datetime import datetime, timedelta
from django.utils import timezone

def _date_range(request):
    """
    Returns (start, end) datetime from ?start=YYYY-MM-DD&end=YYYY-MM-DD.
    Defaults to the last 30 days.
    """
    now = timezone.now()

    try:
        start_str = request.GET.get("start")
        end_str = request.GET.get("end")

        start = (
            timezone.make_aware(datetime.strptime(start_str, "%Y-%m-%d"))
            if start_str
            else now - timedelta(days=30)
        )

        end = (
            timezone.make_aware(datetime.strptime(end_str, "%Y-%m-%d"))
            if end_str
            else now
        )

    except ValueError:
        start = now - timedelta(days=30)
        end = now

    return start, end

# ─────────────────────────────────────────────
#  1. OVERVIEW  —  KPI Summary Cards
# ─────────────────────────────────────────────

@api_view(["GET"])
@require_GET
def dashboard_overview(request):
    """
    GET /api/dashboard/overview/

    Returns high-level KPIs for the dashboard summary cards.

    Response:
    {
      "total_revenue":        float,   // sum of approved sale totals
      "total_cost":           float,   // sum of (buying_price × qty_sold) for approved sales
      "gross_profit":         float,
      "gross_margin_pct":     float,
      "pending_sales_count":  int,
      "pending_sales_value":  float,
      "total_customers":      int,
      "outstanding_balances": float,   // sum of customer remaining_balance
      "active_products":      int,
      "low_stock_count":      int,     // products below reorder_point
      "out_of_stock_count":   int,
      "total_inventory_value":float    // stock_at_cost across all active products
    }
    """
    business_ids, err = _get_business_scope(request)
    if err:
        return err

    # ── Revenue & profit ──────────────────────
    approved_sales = Sale.objects.filter(
        product__business_id__in=business_ids,
        aproved=True,
        deleted=False,
    )

    revenue_agg = approved_sales.aggregate(
        total_revenue=Coalesce(Sum("total_amount"), Decimal("0")),
        total_cost=Coalesce(
            Sum(
                ExpressionWrapper(
                    F("quantity_sold") * F("product__buying_price"),
                    output_field=DecimalField(max_digits=20, decimal_places=2),
                )
            ),
            Decimal("0"),
        ),
    )
    total_revenue = revenue_agg["total_revenue"]
    total_cost    = revenue_agg["total_cost"]
    gross_profit  = total_revenue - total_cost
    gross_margin  = round(float(gross_profit / total_revenue * 100), 2) if total_revenue else 0.0

    # ── Pending sales ─────────────────────────
    pending = Sale.objects.filter(
        product__business_id__in=business_ids,
        aproved=False, rejected=False, deleted=False,
    ).aggregate(
        count=Count("id"),
        value=Coalesce(Sum("total_amount"), Decimal("0")),
    )

    # ── Customers ─────────────────────────────
    customer_agg = Customer.objects.aggregate(
        total=Count("id"),
        outstanding=Coalesce(Sum("remaining_balance"), 0),
    )

    # ── Inventory ─────────────────────────────
    products = Product.objects.filter(business_id__in=business_ids, is_active=True)

    inventory_agg = products.aggregate(
        active_count=Count("id"),
        low_stock=Count(
            "id",
            filter=Q(quantity_at_hand__gt=0, quantity_at_hand__lte=F("reorder_point")),
        ),
        out_of_stock=Count("id", filter=Q(quantity_at_hand__lte=0)),
        inventory_value=Coalesce(
            Sum(
                ExpressionWrapper(
                    F("quantity_at_hand") * F("buying_price"),
                    output_field=DecimalField(max_digits=20, decimal_places=2),
                )
            ),
            Decimal("0"),
        ),
    )

    return _ok({
        "total_revenue":        float(total_revenue),
        "total_cost":           float(total_cost),
        "gross_profit":         float(gross_profit),
        "gross_margin_pct":     gross_margin,
        "pending_sales_count":  pending["count"],
        "pending_sales_value":  float(pending["value"]),
        "total_customers":      customer_agg["total"],
        "outstanding_balances": float(customer_agg["outstanding"]),
        "active_products":      inventory_agg["active_count"],
        "low_stock_count":      inventory_agg["low_stock"],
        "out_of_stock_count":   inventory_agg["out_of_stock"],
        "total_inventory_value":float(inventory_agg["inventory_value"]),
    })


# ─────────────────────────────────────────────
#  2. SALES TREND  —  Revenue Over Time
# ─────────────────────────────────────────────

@api_view(["GET"])
@require_GET
def sales_trend(request):
    """
    GET /api/dashboard/sales/trend/?period=daily|weekly|monthly&start=YYYY-MM-DD&end=YYYY-MM-DD

    Returns time-series data for charting revenue and units sold.

    Response: { "period": "daily", "series": [ {"date": "2024-01-01", "revenue": 1234.56, "units": 10}, ... ] }
    """
    business_ids, err = _get_business_scope(request)
    if err:
        return err

    period = request.GET.get("period", "daily")
    start, end = _date_range(request)

    trunc_map = {"daily": TruncDay, "weekly": TruncWeek, "monthly": TruncMonth}
    trunc_fn = trunc_map.get(period, TruncDay)

    qs = (
        Sale.objects
        .filter(
            product__business_id__in=business_ids,
            aproved=True,
            deleted=False,
            date_sold__gte=start,
            date_sold__lte=end,
        )
        .annotate(period=trunc_fn("date_sold"))
        .values("period")
        .annotate(
            revenue=Sum("total_amount"),
            units=Sum("quantity_sold"),
            transactions=Count("id"),
        )
        .order_by("period")
    )

    series = [
        {
            "date":         row["period"].strftime("%Y-%m-%d"),
            "revenue":      float(row["revenue"]),
            "units":        row["units"],
            "transactions": row["transactions"],
        }
        for row in qs
    ]

    return _ok({"period": period, "series": series})


# ─────────────────────────────────────────────
#  3. SALES BREAKDOWN  —  Status Distribution
# ─────────────────────────────────────────────

@api_view(["GET"])
@require_GET
def sales_breakdown(request):
    """
    GET /api/dashboard/sales/breakdown/

    Counts and totals for each sale status — useful for a donut/pie chart.

    Response:
    {
      "approved":  {"count": int, "value": float},
      "pending":   {"count": int, "value": float},
      "rejected":  {"count": int, "value": float},
      "deleted":   {"count": int, "value": float}
    }
    """
    business_ids, err = _get_business_scope(request)
    if err:
        return err

    base = Sale.objects.filter(product__business_id__in=business_ids)

    def _agg(qs):
        r = qs.aggregate(count=Count("id"), value=Coalesce(Sum("total_amount"), Decimal("0")))
        return {"count": r["count"], "value": float(r["value"])}

    return _ok({
        "approved": _agg(base.filter(aproved=True,  rejected=False, deleted=False)),
        "pending":  _agg(base.filter(aproved=False, rejected=False, deleted=False)),
        "rejected": _agg(base.filter(rejected=True,                deleted=False)),
        "deleted":  _agg(base.filter(deleted=True)),
    })


# ─────────────────────────────────────────────
#  4. INVENTORY HEALTH
# ─────────────────────────────────────────────

@api_view(["GET"])
@require_GET
def inventory_health(request):
    """
    GET /api/dashboard/inventory/health/

    Full picture of stock levels — for a status breakdown widget and low-stock table.

    Response:
    {
      "summary": { "healthy": int, "low_stock": int, "out_of_stock": int },
      "low_stock_items": [ { "id", "name", "brand", "part_number", "quantity_at_hand",
                              "reorder_point", "available_stock", "bin_location" }, ... ]
    }
    """
    business_ids, err = _get_business_scope(request)
    if err:
        return err

    products = Product.objects.filter(business_id__in=business_ids, is_active=True)

    summary = products.aggregate(
        healthy=Count(
            "id",
            filter=Q(quantity_at_hand__gt=F("reorder_point")),
        ),
        low_stock=Count(
            "id",
            filter=Q(quantity_at_hand__gt=0, quantity_at_hand__lte=F("reorder_point")),
        ),
        out_of_stock=Count("id", filter=Q(quantity_at_hand__lte=0)),
    )

    low_stock_items = list(
        products.filter(quantity_at_hand__lte=F("reorder_point"))
        .order_by("quantity_at_hand")
        .values(
            "id", "name", "brand", "part_number",
            "quantity_at_hand", "quantity_allocated",
            "reorder_point", "bin_location",
        )[:50]
    )

    # annotate available_stock inline (can't use @property in values())
    for item in low_stock_items:
        item["available_stock"] = item["quantity_at_hand"] - item["quantity_allocated"]

    return _ok({"summary": summary, "low_stock_items": low_stock_items})


# ─────────────────────────────────────────────
#  5. INVENTORY VALUATION
# ─────────────────────────────────────────────

@api_view(["GET"])
@require_GET
def inventory_valuation(request):
    """
    GET /api/dashboard/inventory/valuation/

    Stock value at cost vs. retail, broken down by category.

    Response:
    {
      "totals": {
          "cost_value":   float,   // qty_at_hand × buying_price
          "retail_value": float,   // qty_at_hand × retail_price
          "potential_profit": float
      },
      "by_category": [ {"category": str, "cost_value": float, "retail_value": float}, ... ]
    }
    """
    business_ids, err = _get_business_scope(request)
    if err:
        return err

    products = Product.objects.filter(business_id__in=business_ids, is_active=True)

    cost_expr = ExpressionWrapper(
        F("quantity_at_hand") * F("buying_price"),
        output_field=DecimalField(max_digits=20, decimal_places=2),
    )
    retail_expr = ExpressionWrapper(
        F("quantity_at_hand") * F("retail_price"),
        output_field=DecimalField(max_digits=20, decimal_places=2),
    )

    totals = products.aggregate(
        cost_value=Coalesce(Sum(cost_expr), Decimal("0")),
        retail_value=Coalesce(Sum(retail_expr), Decimal("0")),
    )
    cost_value   = float(totals["cost_value"])
    retail_value = float(totals["retail_value"])

    by_category = list(
        products.values(category_name=F("categories__name"))
        .annotate(
            cost_value=Coalesce(Sum(cost_expr), Decimal("0")),
            retail_value=Coalesce(Sum(retail_expr), Decimal("0")),
        )
        .order_by("-cost_value")
    )

    return _ok({
        "totals": {
            "cost_value":      cost_value,
            "retail_value":    retail_value,
            "potential_profit": round(retail_value - cost_value, 2),
        },
        "by_category": [
            {
                "category":    row["category_name"] or "Uncategorized",
                "cost_value":  float(row["cost_value"]),
                "retail_value":float(row["retail_value"]),
            }
            for row in by_category
        ],
    })


# ─────────────────────────────────────────────
#  6. TOP PRODUCTS
# ─────────────────────────────────────────────

@api_view(["GET"])
@require_GET
def top_products(request):
    """
    GET /api/dashboard/products/top/?limit=10&start=YYYY-MM-DD&end=YYYY-MM-DD

    Top products ranked by revenue from approved sales.

    Response:
    { "products": [ { "id", "name", "brand", "part_number", "units_sold",
                       "revenue", "avg_price", "available_stock" }, ... ] }
    """
    business_ids, err = _get_business_scope(request)
    if err:
        return err

    start, end = _date_range(request)
    limit = min(int(request.GET.get("limit", 10)), 50)

    qs = (
        Sale.objects
        .filter(
            product__business_id__in=business_ids,
            aproved=True,
            deleted=False,
            date_sold__gte=start,
            date_sold__lte=end,
        )
        .values("product__id", "product__name", "product__brand", "product__part_number",
                "product__quantity_at_hand", "product__quantity_allocated")
        .annotate(
            units_sold=Sum("quantity_sold"),
            revenue=Sum("total_amount"),
            avg_price=Avg("price_per_unit"),
        )
        .order_by("-revenue")[:limit]
    )

    products = [
        {
            "id":              row["product__id"],
            "name":            row["product__name"],
            "brand":           row["product__brand"],
            "part_number":     row["product__part_number"],
            "units_sold":      row["units_sold"],
            "revenue":         float(row["revenue"]),
            "avg_price":       float(row["avg_price"]),
            "available_stock": row["product__quantity_at_hand"] - row["product__quantity_allocated"],
        }
        for row in qs
    ]

    return _ok({"products": products})


# ─────────────────────────────────────────────
#  7. TOP CUSTOMERS
# ─────────────────────────────────────────────

@api_view(["GET"])
@require_GET
def top_customers(request):
    """
    GET /api/dashboard/customers/top/?limit=10&start=YYYY-MM-DD&end=YYYY-MM-DD

    Top customers by total spend on approved sales.

    Response:
    { "customers": [ { "id", "name", "email", "phone",
                        "orders", "total_spent", "avg_order_value" }, ... ] }
    """
    business_ids, err = _get_business_scope(request)
    if err:
        return err

    start, end = _date_range(request)
    limit = min(int(request.GET.get("limit", 10)), 50)

    qs = (
        Sale.objects
        .filter(
            product__business_id__in=business_ids,
            aproved=True,
            deleted=False,
            date_sold__gte=start,
            date_sold__lte=end,
            customer__isnull=False,
        )
        .values("customer__id", "customer__name", "customer__email", "customer__phone",
                "customer__remaining_balance")
        .annotate(
            orders=Count("id"),
            total_spent=Sum("total_amount"),
            avg_order_value=Avg("total_amount"),
        )
        .order_by("-total_spent")[:limit]
    )

    customers = [
        {
            "id":                row["customer__id"],
            "name":              row["customer__name"],
            "email":             row["customer__email"],
            "phone":             row["customer__phone"],
            "orders":            row["orders"],
            "total_spent":       float(row["total_spent"]),
            "avg_order_value":   float(row["avg_order_value"]),
            "remaining_balance": row["customer__remaining_balance"],
        }
        for row in qs
    ]

    return _ok({"customers": customers})


# ─────────────────────────────────────────────
#  8. OUTSTANDING CUSTOMER BALANCES
# ─────────────────────────────────────────────

@api_view(["GET"])
@require_GET
def customer_balances(request):
    """
    GET /api/dashboard/customers/balances/?limit=20

    Customers with the highest outstanding balances — for an AR (accounts receivable) widget.

    Response:
    {
      "total_outstanding": float,
      "customers": [ { "id", "name", "email", "phone", "remaining_balance" }, ... ]
    }
    """
    limit = min(int(request.GET.get("limit", 20)), 100)

    agg = Customer.objects.aggregate(
        total=Coalesce(Sum("remaining_balance"), 0)
    )

    customers = list(
        Customer.objects
        .filter(remaining_balance__gt=0)
        .order_by("-remaining_balance")
        .values("id", "name", "email", "phone", "remaining_balance")
        [:limit]
    )

    return _ok({
        "total_outstanding": float(agg["total"]),
        "customers": customers,
    })


# ─────────────────────────────────────────────
#  9. RECENT ACTIVITY FEED
# ─────────────────────────────────────────────

@api_view(["GET"])
@require_GET
def recent_activity(request):
    """
    GET /api/dashboard/activity/recent/?limit=20

    Latest sales events for a live activity / notification feed.

    Response:
    { "activity": [ { "id", "type", "product_name", "customer_name",
                       "quantity", "total_amount", "date_sold", "created_by" }, ... ] }
    """
    business_ids, err = _get_business_scope(request)
    if err:
        return err

    limit = min(int(request.GET.get("limit", 20)), 100)

    sales = (
        Sale.objects
        .filter(product__business_id__in=business_ids, deleted=False)
        .select_related("product", "customer", "created_by")
        .order_by("-date_sold")
        [:limit]
    )

    def _status(s):
        if s.deleted:   return "deleted"
        if s.rejected:  return "rejected"
        if s.aproved:   return "approved"
        return "pending"

    activity = [
        {
            "id":            s.pk,
            "status":        _status(s),
            "product_name":  s.product.name,
            "product_id":    s.product_id,
            "customer_name": s.customer.name if s.customer else None,
            "customer_id":   s.customer_id,
            "quantity":      s.quantity_sold,
            "total_amount":  float(s.total_amount),
            "date_sold":     s.date_sold.isoformat(),
            "created_by":    s.created_by.get_full_name() if s.created_by else None,
        }
        for s in sales
    ]

    return _ok({"activity": activity})