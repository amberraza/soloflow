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

from django.http import HttpResponse
from .services.pdf_generator import generate_financial_declaration_pdf
from .models import FinancialAffidavit

class GenerateSCCA430View(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # 1. Find the Client associated with this User
        # Logic: User -> Firm -> Client. Wait, no. The user IS the client in the self-serve model?
        # In onboarding.py:
        # client = Client.objects.create(firm=firm, email=user email...)
        # But User doesn't link directly to Client. User links to Firm.
        # However, for this MVP, we likely made the User the "Admin" of the Firm.
        # And the "Client" created in onboarding is the Plaintiff.
        # So: Firm -> Client (first one).
        
        try:
            if not hasattr(request.user, 'firm'):
                 return Response({"error": "User has no firm"}, status=status.HTTP_400_BAD_REQUEST)

            firm = request.user.firm
            # For MVP, assume the first client is the one we want (Wizard creates 1 client)
            client = firm.client_set.first() 
            
            if not client:
                 return Response({"error": "No client found for this firm"}, status=status.HTTP_404_NOT_FOUND)

            matter = client.matter_set.first()
            if not matter:
                 return Response({"error": "No matter found"}, status=status.HTTP_404_NOT_FOUND)
            
            affidavit = FinancialAffidavit.objects.filter(matter=matter).last()
            if not affidavit:
                 return Response({"error": "No financial affidavit found"}, status=status.HTTP_404_NOT_FOUND)

            # Generate PDF
            pdf_content = generate_financial_declaration_pdf(affidavit)

            # Return as File
            response = HttpResponse(pdf_content, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="Full_Financial_Affidavit_{client.last_name}.pdf"'
            return response

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
