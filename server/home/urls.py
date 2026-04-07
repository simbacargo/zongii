from django.urls import path
from .views.apis import dashboard as dashboard_api

urlpatterns = [
    # KPI summary cards
    path("api/dashboard/overview/",               dashboard_api.dashboard_overview,   name="dashboard_overview"),

    # Sales
    path("api/dashboard/sales/trend/",            dashboard_api.sales_trend,          name="dashboard_sales_trend"),
    path("api/dashboard/sales/breakdown/",        dashboard_api.sales_breakdown,      name="dashboard_sales_breakdown"),

    # Inventory
    path("api/dashboard/inventory/health/",       dashboard_api.inventory_health,     name="dashboard_inventory_health"),
    path("api/dashboard/inventory/valuation/",    dashboard_api.inventory_valuation,  name="dashboard_inventory_valuation"),

    # Products
    path("api/dashboard/products/top/",           dashboard_api.top_products,         name="dashboard_top_products"),

    # Customers
    path("api/dashboard/customers/top/",          dashboard_api.top_customers,        name="dashboard_top_customers"),
    path("api/dashboard/customers/balances/",     dashboard_api.customer_balances,    name="dashboard_customer_balances"),

    # Activity feed
    path("api/dashboard/activity/recent/",        dashboard_api.recent_activity,      name="dashboard_recent_activity"),
]


from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet, 
    BusinessViewSet, 
    ProductViewSet, 
    CustomerViewSet, 
    SaleViewSet
)

# 1. Initialize the DefaultRouter
router = DefaultRouter()

# 2. Register each ViewSet
# The 'basename' is used for URL reversing (e.g., 'product-list')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'businesses', BusinessViewSet, basename='business')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'customers', CustomerViewSet, basename='customer')
router.register(r'sales', SaleViewSet, basename='sale')

# 3. Include the router-generated URLs
urlpatterns += [
    path('', include(router.urls)),
]