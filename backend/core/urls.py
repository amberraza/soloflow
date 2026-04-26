from django.urls import path
from .views import PublicIntakeView, GenerateRetainerView, TrustBalanceView, FirmTrustBalanceView, StripeWebhookView, RegisterView, HealthCheckView, SubmitIntakeView, MatterListView, MatterDetailView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('intake/public/', PublicIntakeView.as_view(), name='public-intake'),
    path('matters/<uuid:matter_id>/generate-retainer/', GenerateRetainerView.as_view(), name='generate-retainer'),
    path('billing/trust-balance/', FirmTrustBalanceView.as_view(), name='firm-trust-balance'),
    path('billing/trust-balance/<uuid:client_id>/', TrustBalanceView.as_view(), name='trust-balance'),
    path('webhooks/stripe/', StripeWebhookView.as_view(), name='stripe-webhook'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('health/', HealthCheckView.as_view(), name='health-check'),
    path('health/', HealthCheckView.as_view(), name='health-check'),
    path('intake/submit/', SubmitIntakeView.as_view(), name='submit-intake'),
    path('matters/', MatterListView.as_view(), name='matter-list'),
    path('matters/<uuid:pk>/', MatterDetailView.as_view(), name='matter-detail'),
]
