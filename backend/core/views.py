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

class PublicFirmView(APIView):
    """Public endpoint returning firm branding info for the embeddable widget."""
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def get(self, request, firm_id):
        try:
            firm = FirmModel.objects.get(id=firm_id)
            return Response({
                "id": firm.id,
                "name": firm.name,
                "domain": firm.domain,
            })
        except FirmModel.DoesNotExist:
            return Response({"error": "Firm not found"}, status=404)
from rest_framework import status, permissions
from .services import generate_retainer_pdf
from .models import Matter
from .models import Firm as FirmModel
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
        # Calculate Trust Funds from TimeEntry totals
        # Uses TimeEntry.rate * TimeEntry.hours as a proxy for billed/collected amounts.
        # In a real app, this would query a Transaction/Ledger table for the IOLTA account.
        from core.models import Matter
        from django.db.models import Sum, F

        # Only matters belonging to this firm
        matters = Matter.objects.filter(
            client__firm=request.user.firm,
            client_id=client_id
        )

        # Sum up time entries as a proxy for trust activity
        balance_aggregate = matters.aggregate(
            total_trust=Sum(F('timeentries__hours') * F('timeentries__rate'))
        )
        balance = balance_aggregate.get('total_trust') or 0

        return Response({
            "client_id": client_id,
            "trust_balance": str(balance),
            "currency": "USD"
        })

class FirmTrustBalanceView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from core.models import Matter
        from django.db.models import Sum, F

        # Guard: user might not have a firm assigned yet
        if not request.user.firm:
            return Response({
                "trust_balance": "0",
                "pending_intakes": 0,
                "currency": "USD"
            })

        matters = Matter.objects.filter(
            client__firm=request.user.firm
        )

        balance_aggregate = matters.aggregate(
            total_trust=Sum(F('timeentries__hours') * F('timeentries__rate'))
        )
        balance = balance_aggregate.get('total_trust') or 0

        # Count matters in intake/lead/pending statuses
        pending_count = matters.filter(status__in=['LEAD', 'PENDING']).count()

        return Response({
            "trust_balance": str(balance),
            "pending_intakes": pending_count,
            "currency": "USD"
        })

class StripeWebhookView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        payload = request.data
        event_type = payload.get('type')

        if event_type == 'invoice.paid':
            invoice = payload.get('data', {}).get('object', {})
            lines = invoice.get('lines', {}).get('data', [])

            for line in lines:
                entry_id = line.get('metadata', {}).get('entry_id')
                if entry_id and line.get('metadata', {}).get('type') == 'service':
                    try:
                        from core.models import TimeEntry
                        TimeEntry.objects.filter(id=entry_id).update(is_billed=True)
                    except Exception:
                        pass  # Non-critical — log if we had a system

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

class UserProfileView(APIView):
    """Get or update the current user's profile and firm info."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        firm = getattr(user, 'firm', None)
        return Response({
            "user_id": user.id,
            "email": user.email,
            "username": user.username,
            "firm_id": firm.id if firm else None,
            "firm_name": firm.name if firm else None,
            "firm_domain": firm.domain if firm else None,
        })

    def patch(self, request):
        user = request.user
        firm = getattr(user, 'firm', None)
        if not firm:
            return Response({"error": "No firm associated with this user"}, status=400)

        data = request.data
        if 'firm_name' in data:
            firm.name = data['firm_name']
        if 'firm_domain' in data:
            firm.domain = data['firm_domain']
        firm.save()

        return Response({
            "status": "updated",
            "firm_id": firm.id,
            "firm_name": firm.name,
            "firm_domain": firm.domain,
        })

class SubmitIntakeView(APIView):
    """
    Allows an authenticated user to save wizard data directly to their account.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        wizard_data = request.data.get('wizard_data')
        
        if not wizard_data:
            return Response({"error": "No wizard data provided"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Re-use the same service logic as registration
            process_wizard_data(request.user, wizard_data)
            
            return Response({
                "status": "success",
                "message": "Case data saved successfully"
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            import traceback
            print(f"CRITICAL SUBMIT ERROR: {traceback.format_exc()}")
            return Response({"error": f"Failed to save case: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class MatterListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if not request.user.firm:
            return Response([], status=status.HTTP_200_OK)
            
        matters = Matter.objects.filter(client__firm=request.user.firm).select_related('client').order_by('-created_at')
        
        data = []
        for m in matters:
            data.append({
                "id": str(m.id),
                "title": m.title,
                "status": m.status,
                "client_name": str(m.client),
                "case_number": m.court_case_number or "N/A",
                "practice_area": m.practice_area
            })
            
        return Response(data, status=status.HTTP_200_OK)

class MatterDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        if not request.user.firm:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
            
        try:
            matter = Matter.objects.get(id=pk, client__firm=request.user.firm)
            matter.delete()
            return Response({"status": "deleted"}, status=status.HTTP_204_NO_CONTENT)
        except Matter.DoesNotExist:
            return Response({"error": "Matter not found"}, status=status.HTTP_404_NOT_FOUND)

    def patch(self, request, pk):
        if not request.user.firm:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
            
        try:
            matter = Matter.objects.get(id=pk, client__firm=request.user.firm)
            data = request.data
            
            # Allow updating specific fields
            if 'title' in data:
                matter.title = data['title']
            if 'court_case_number' in data:
                matter.court_case_number = data['court_case_number']
            if 'status' in data:
                matter.status = data['status']
            if 'practice_area' in data:
                matter.practice_area = data['practice_area']
                
            matter.save()
            
            return Response({
                "id": str(matter.id),
                "title": matter.title,
                "case_number": matter.court_case_number,
                "status": matter.status,
                "practice_area": matter.practice_area
            }, status=status.HTTP_200_OK)
            
        except Matter.DoesNotExist:
            return Response({"error": "Matter not found"}, status=status.HTTP_404_NOT_FOUND)
