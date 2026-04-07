from django.urls import path
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
    path("sales/<int:pk>/",            views.sale_detail,      name="sale_detail"),
    path("sales/create/",              views.sale_create,      name="sale_create"),
    path("sales/<int:pk>/edit/",       views.sale_update,      name="sale_update"),
    path("sales/<int:pk>/delete/",     views.sale_delete,      name="sale_delete"),
    path("sales/<int:pk>/approve/",    views.sale_approve,     name="sale_approve"),
    path("sales/<int:pk>/reject/",     views.sale_reject,      name="sale_reject"),

    
    
    
    
    path("", views.dashboard, name="dashboard"),
    path("dashboard/", views.dashboard, name="dashboard"),
    path("products/<int:product_id>/sell/", views.product_sell, name="product_sell"),
    
]