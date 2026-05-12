from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView

from .api_views import (
    CategoryViewSet,
    ProductViewSet,
    CustomerViewSet,
    SaleViewSet,
    DashboardView,
    UserViewSet,
    ProfileView,
)

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='api-category')
router.register(r'products',   ProductViewSet,  basename='api-product')
router.register(r'customers',  CustomerViewSet, basename='api-customer')
router.register(r'sales',      SaleViewSet,     basename='api-sale')
router.register(r'users',      UserViewSet,     basename='api-user')

urlpatterns = [
    # ── Auth ──────────────────────────────────────────────────────────────────
    path('auth/login/',   TokenObtainPairView.as_view(), name='api-token-obtain'),
    path('auth/refresh/', TokenRefreshView.as_view(),    name='api-token-refresh'),
    path('auth/verify/',  TokenVerifyView.as_view(),     name='api-token-verify'),
    path('auth/me/',      ProfileView.as_view(),         name='api-profile'),

    # ── Dashboard ─────────────────────────────────────────────────────────────
    path('dashboard/', DashboardView.as_view(), name='api-dashboard'),

    # ── CRUD (router) ─────────────────────────────────────────────────────────
    path('', include(router.urls)),
]
