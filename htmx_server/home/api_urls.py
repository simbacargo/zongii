from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView

from . import api_views as views

urlpatterns = [
    # Auth
    path('auth/signup/',  views.signup, name='api-signup'),
    path('auth/activate/', views.activate_account, name='api-activate'),
    path('auth/login/',   TokenObtainPairView.as_view(), name='api-token-obtain'),
    path('auth/refresh/', TokenRefreshView.as_view(),    name='api-token-refresh'),
    path('auth/verify/',  TokenVerifyView.as_view(),     name='api-token-verify'),
    path('auth/me/',         views.profile,              name='api-profile'),
    path('auth/push-token/', views.register_push_token, name='api-push-token'),

    # Dashboard
    path('dashboard/', views.dashboard, name='api-dashboard'),

    # Categories
    path('categories/',          views.category_list,   name='api-category-list'),
    path('categories/<int:pk>/', views.category_detail, name='api-category-detail'),

    # Products
    path('products/',                     views.product_list,      name='api-product-list'),
    path('products/low-stock/',           views.product_low_stock, name='api-product-low-stock'),
    path('products/<int:pk>/',            views.product_detail,    name='api-product-detail'),
    path('products/<int:pk>/deactivate/', views.product_deactivate, name='api-product-deactivate'),
    path('products/<int:pk>/refill/',     views.stock_refill,      name='api-stock-refill'),
    path('products/<int:pk>/refills/',    views.product_refills,   name='api-product-refills'),

    # Customers
    path('customers/',              views.customer_list,    name='api-customer-list'),
    path('customers/debtors/',      views.customer_debtors, name='api-customer-debtors'),
    path('customers/<int:pk>/',     views.customer_detail,  name='api-customer-detail'),
    path('customers/<int:pk>/pay/', views.customer_pay,     name='api-customer-pay'),

    # Sales
    path('sales/',                  views.sale_list,    name='api-sale-list'),
    path('sales/<int:pk>/',         views.sale_detail,  name='api-sale-detail'),
    path('sales/<int:pk>/approve/', views.sale_approve, name='api-sale-approve'),
    path('sales/<int:pk>/reject/',  views.sale_reject,  name='api-sale-reject'),

    # Businesses
    path('businesses/',          views.business_list,   name='api-business-list'),
    path('businesses/<int:pk>/', views.business_detail, name='api-business-detail'),

    # Sale Orders
    path('orders/',                    views.sale_order_list,     name='api-order-list'),
    path('orders/stats/',              views.sale_order_stats,    name='api-order-stats'),
    path('orders/<int:pk>/',           views.sale_order_detail,   name='api-order-detail'),
    path('orders/<int:pk>/accountant-review/', views.sale_order_accountant_review, name='api-order-accountant-review'),
    path('orders/<int:pk>/verify/',    views.sale_order_verify,   name='api-order-verify'),
    path('orders/<int:pk>/dispatch/',  views.sale_order_dispatch, name='api-order-dispatch'),

    # Documents
    path('documents/',                 views.document_list,   name='api-document-list'),
    path('documents/<int:pk>/',        views.document_detail, name='api-document-detail'),
    path('documents/<int:pk>/status/', views.document_status, name='api-document-status'),
    path('documents/<int:pk>/pdf/', views.document_pdf, name='api-document-pdf'),

    # Picking Orders
    path('picking/',                  views.picking_list,   name='api-picking-list'),
    path('picking/<int:pk>/',         views.picking_detail, name='api-picking-detail'),
    path('picking/<int:pk>/accept/',  views.picking_accept, name='api-picking-accept'),
    path('picking/<int:pk>/submit/',  views.picking_submit, name='api-picking-submit'),

    # Gate Passes
    path('gate-passes/',          views.gate_pass_list,   name='api-gatepass-list'),
    path('gate-passes/<int:pk>/', views.gate_pass_detail, name='api-gatepass-detail'),
    path('gate-passes/<int:pk>/print/', views.gate_pass_print, name='api-gatepass-print'),

    # Notifications
    path('notifications/',                views.notification_list,          name='api-notification-list'),
    path('notifications/mark-all-read/',  views.notification_mark_all_read, name='api-notification-mark-all'),
    path('notifications/<int:pk>/read/',  views.notification_mark_read,     name='api-notification-read'),

    # Users (UUID primary key)
    path('users/',                        views.user_list,          name='api-user-list'),
    path('users/<str:pk>/',               views.user_detail,        name='api-user-detail'),
    path('users/<str:pk>/toggle-active/', views.user_toggle_active, name='api-user-toggle'),
    path('users/<str:pk>/set-role/',      views.user_set_role,      name='api-user-set-role'),
    path('users/<str:pk>/set-password/',  views.user_set_password,  name='api-user-set-password'),
]
