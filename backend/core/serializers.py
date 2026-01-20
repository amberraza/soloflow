from rest_framework import serializers
from .models import Client, Matter, Firm
from django.db import transaction

class IntakeSerializer(serializers.Serializer):
    # Field definitions based on prompt requirements
    firm_id = serializers.UUIDField() # In a real widget, this might be inferred from the domain or token
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=20)
    case_type = serializers.CharField(max_length=100)
    incident_date = serializers.DateField()
    description = serializers.CharField(required=False, allow_blank=True)

    def validate(self, data):
        # Additional validation can go here
        return data

    def create(self, validated_data):
        firm_id = validated_data.get('firm_id')
        case_type = validated_data.get('case_type')
        incident_date = validated_data.get('incident_date')
        
        # Qualification Logic
        # Case Type == 'Personal Injury' AND Statute of Limitations < 2 years -> Auto-Qualify
        is_qualified = False
        rejection_reason = None
        
        from datetime import date
        today = date.today()
        # Simple statute calculation: verify incident is within last 2 years
        # (Assuming statute of limitations is 2 years from incident)
        # Note: "Statute of Limitations < 2 years" usually means "Time since incident < 2 years"
        
        delta = today - incident_date
        years_passed = delta.days / 365.25

        if case_type == 'Personal Injury':
            if years_passed < 2:
                is_qualified = True
            else:
                rejection_reason = "Statute of limitations expired."
        else:
             # Default behavior for other types? Prompt implies logic specific to PI
             # If Unqualified: Auto-reject.
             rejection_reason = "Not a Personal Injury case (Auto-Reject logic)."
        
        if not is_qualified:
             # Just return info, don't create Matter? Or create REJECTED matter?
             # Prompt: "If Unqualified: Auto-reject with a polite... email"
             # We should probably create the generic Client/Matter but mark as Rejected to track the lead?
             # Or just return failure validation?
             # "We cannot take your case".
             # I'll create the records but status=REJECTED.
             status = 'REJECTED'
        else:
             status = 'QUALIFIED' # or 'LEAD', but prompt says "If Qualified... notify Attorney... allow book"

        with transaction.atomic():
            firm = Firm.objects.get(id=firm_id)
            client = Client.objects.create(
                firm=firm,
                first_name=validated_data['first_name'],
                last_name=validated_data['last_name'],
                email=validated_data['email'],
                phone=validated_data['phone']
            )
            matter = Matter.objects.create(
                client=client,
                title=f"{validated_data['last_name']} - {case_type}",
                practice_area=case_type,
                status=status
            )
        
        return {
            "client": client,
            "matter": matter,
            "qualified": is_qualified,
            "message": "Qualified" if is_qualified else rejection_reason
        }
