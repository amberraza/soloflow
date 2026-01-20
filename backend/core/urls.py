from django.urls import path
from .views import PublicIntakeView, GenerateRetainerView, TrustBalanceView, StripeWebhookView, RegisterView

urlpatterns = [
    path('intake/public/', PublicIntakeView.as_view(), name='public-intake'),
    path('matters/<uuid:matter_id>/generate-retainer/', GenerateRetainerView.as_view(), name='generate-retainer'),
    path('billing/trust-balance/<uuid:client_id>/', TrustBalanceView.as_view(), name='trust-balance'),
    path('webhooks/stripe/', StripeWebhookView.as_view(), name='stripe-webhook'),
    path('auth/register/', RegisterView.as_view(), name='register'),
]
