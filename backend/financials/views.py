from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .services.child_support import ChildSupportEngine
from .models import BasicObligationSchedule

class CalculateChildSupportView(APIView):
    permission_classes = [permissions.AllowAny] # Public "Lead Magnet"

    def post(self, request):
        try:
            data = request.data
            engine = ChildSupportEngine(
                mother_gross=data.get('mother_gross_income', 0),
                father_gross=data.get('father_gross_income', 0),
                mother_overnights=data.get('mother_overnights', 182),
                father_overnights=data.get('father_overnights', 183),
                num_children=data.get('num_children', 1),
                health_insurance_cost=data.get('health_insurance', 0)
            )
            result = engine.calculate()
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class GenerateSCCA430View(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # Stub for PDF generation using WeasyPrint (similar to Retainer)
        # Input: Full JSON of Financial Affidavit
        return Response({"status": "PDF Generation Stub implemented"}, status=status.HTTP_200_OK)
