from django.urls import path
from authentication import views as auth_views
from authentication.urls import urlpatterns as auth_urls
from . import views

urlpatterns = [
    # ── Categories ──────────────────────────────
    path("categories/",                views.category_list,    name="category_list"),
    path("categories/create/",         views.category_create,  name="category_create"),
    path("categories/<int:pk>/edit/",  views.category_update,  name="category_update"),
    path("categories/<int:pk>/delete/",views.category_delete,  name="category_delete"),

    # ── Businesses ──────────────────────────────
    path("businesses/",                views.business_list,    name="business_list"),
    path("businesses/<int:pk>/",       views.business_detail,  name="business_detail"),
    path("businesses/create/",         views.business_create,  name="business_create"),
    path("businesses/<int:pk>/edit/",  views.business_update,  name="business_update"),
    path("businesses/<int:pk>/delete/",views.business_delete,  name="business_delete"),

    # ── Products ────────────────────────────────
    path("products/",                  views.product_list,     name="product_list"),
    path("products/<int:pk>/",         views.product_detail,   name="product_detail"),
    path("products/create/",           views.product_create,   name="product_create"),
    path("products/<int:pk>/edit/",    views.product_update,   name="product_update"),
    path("products/<int:pk>/delete/",  views.product_delete,   name="product_delete"),

    # ── Customers ───────────────────────────────
    path("customers/",                 views.customer_list,    name="customer_list"),
    path("customers/<int:pk>/",        views.customer_detail,  name="customer_detail"),
    path("customers/create/",          views.customer_create,  name="customer_create"),
    path("customers/<int:pk>/edit/",   views.customer_update,  name="customer_update"),
    path("customers/<int:pk>/delete/", views.customer_delete,  name="customer_delete"),
    path("customers/<int:pk>/pay/",    views.customer_pay_balance, name="customer_pay_balance"),

    # ── Sales ───────────────────────────────────
    path("sales/",                     views.sale_list,        name="sale_list"),
    path("sales/",                     views.sale_list,        name="sales_list"),
    path("sales/<int:pk>/",            views.sale_detail,      name="sale_detail"),
    path("sales/create/",              views.sale_create_htmx,      name="sale_create"),
    path("sales/create/",              views.sale_create_htmx,      name="sale_create_htmx"),
    path("sales/<int:pk>/edit/",       views.sale_update,      name="sale_update"),
    path("sales/<int:pk>/delete/",     views.sale_delete,      name="sale_delete"),
    path("sales/<int:pk>/approve/",    views.sale_approve,     name="sale_approve"),
    path("sales/<int:pk>/reject/",     views.sale_reject,      name="sale_reject"),

path('sales/new/', views.sale_create_view, name='sale_create'),    
path('cart/manage/', views.manage_cart, name='manage_cart'),
    
    
    
    # ── Documents (Invoices & Quotations) ───────
    path("invoices/",                   views.document_list,           name="document_list"),
    path("invoices/create/",            views.document_create,         name="document_create"),
    path("invoices/<int:pk>/",          views.document_detail,         name="document_detail"),
    path("invoices/<int:pk>/status/",   views.document_status,         name="document_status"),
    path("invoices/<int:pk>/delete/",   views.document_delete,         name="document_delete"),
    path("invoices/<int:pk>/pdf/",      views.document_pdf,            name="document_pdf"),
    path("invoices/item-row/",          views.document_item_row,       name="document_item_row"),
    path("invoices/product-search/",    views.document_product_search, name="document_product_search"),

    path("", views.dashboard, name="dashboard"),
    path("dashboard/", views.dashboard, name="dashboard"),
    path("products/<int:product_id>/sell/", views.product_sell, name="product_sell"),

    # ── User Management ─────────────────────────
    path("users/",                     views.user_list,          name="user_list"),
    path("users/create/",              views.user_create,        name="user_create"),
    path("users/<str:pk>/",            views.user_detail,        name="user_detail"),
    path("users/<str:pk>/edit/",       views.user_update,        name="user_update"),
    path("users/<str:pk>/toggle/",     views.user_toggle_active, name="user_toggle_active"),
    path("users/<str:pk>/delete/",     views.user_delete,        name="user_delete"),

]+ auth_urls