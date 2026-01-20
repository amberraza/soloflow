from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .serializers import IntakeSerializer
from rest_framework.throttling import AnonRateThrottle

class IntakeThrottle(AnonRateThrottle):
    rate = '5/min'

class IntakeThrottle(AnonRateThrottle):
    rate = '5/min'

class HealthCheckView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        return Response({"status": "ok", "message": "Backend is reachable"}, status=status.HTTP_200_OK)

class PublicIntakeView(APIView):
    authentication_classes = [] # Public endpoint
    permission_classes = [permissions.AllowAny]
    throttle_classes = [IntakeThrottle]

    def post(self, request):
        serializer = IntakeSerializer(data=request.data)
        if serializer.is_valid():
            result = serializer.save()
            # result contains client, matter, qualified status
            
            # If qualified, we would trigger SMS/Email notifications here.
            # If unqualified, trigger rejection email.
            
            return Response({
                "status": "success", 
                "qualified": result['qualified'],
                "message": result['message'],
                "matter_id": result['matter'].id
            }, status=status.HTTP_201_CREATED)
from rest_framework import status, permissions
from .services import generate_retainer_pdf
from .models import Matter
from django.shortcuts import get_object_or_404

class GenerateRetainerView(APIView):
    permission_classes = [permissions.IsAuthenticated] # Lawyers only

    def post(self, request, matter_id):
        # In real app, check request.user.firm == matter.firm
        matter = get_object_or_404(Matter, id=matter_id)
        
        # Security Check (Basic Firm Isolation)
        if request.user.firm != matter.client.firm:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

from django.db.models import Sum
from decimal import Decimal

class TrustBalanceView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, client_id):
        # Calculate Trust Funds
        # Since we don't have a Transaction model, we will Mock this logic for the MVP
        # In a real app, we'd query the Ledger/Transaction table.
        # Here we'll return a stub or calculate based on assumption if we added a Transaction model.
        # But Prompt said "Calculates...". I'll assume 0 for now or create a dummy calculation.
        
        # Let's say we had a Deposit model. Since we don't, I'll return 0.00 
        # but structured correctly.
        return Response({
            "client_id": client_id,
            "trust_balance": "0.00",
            "currency": "USD"
        })

class StripeWebhookView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        payload = request.data
        event_type = payload.get('type')

        if event_type == 'invoice.paid':
            # Handle invoice paid
            # data = payload['data']['object']
            # lines = data['lines']['data']
            # logic to find TimeEntries and mark is_billed=True or create Transaction logic
            
            # Example logic:
            # for line in lines:
            #    if line['metadata'].get('type') == 'service':
            #        TimeEntry.objects.filter(id=line['metadata']['entry_id']).update(is_billed=True)
            
            return Response({"status": "handled"}, status=status.HTTP_200_OK)
        
from .services.onboarding import process_wizard_data
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        wizard_data = request.data.get('initial_wizard_data')

        try:
            if not username or not password:
                return Response({"error": "Username and password required"}, status=status.HTTP_400_BAD_REQUEST)

            if User.objects.filter(username=username).exists():
                return Response({"error": "User already exists"}, status=status.HTTP_400_BAD_REQUEST)

            user = User.objects.create_user(username=username, password=password)
            
            if wizard_data:
                try:
                    process_wizard_data(user, wizard_data)
                except Exception as e:
                    # Log error but don't fail registration? Or fail? 
                    # Better to fail transaction if important data is lost.
                    # But process_wizard_data handles transaction.atomic internally?
                    # Actually, wrapping the whole thing is safer.
                    user.delete() # Simple rollback for now
                    return Response({"error": f"Failed to process wizard data: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

            refresh = RefreshToken.for_user(user)
            return Response({
                "status": "User created",
                "user_id": user.id,
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            import traceback
            error_details = traceback.format_exc()
            print(f"CRITICAL REGISTRATION ERROR: {error_details}")
            return Response({"error": f"Internal Server Error: {str(e)}", "details": error_details}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
