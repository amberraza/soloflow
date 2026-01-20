from django.urls import path
from .views import CalculateChildSupportView, GenerateSCCA430View

urlpatterns = [
    path('calculate-child-support/', CalculateChildSupportView.as_view(), name='calc-cs'),
    path('generate-scca-430-pdf/', GenerateSCCA430View.as_view(), name='gen-scca-430'),
]
