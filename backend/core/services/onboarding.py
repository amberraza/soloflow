from django.db import transaction
from django.apps import apps
from django.conf import settings
from decimal import Decimal

# Lazy load models to verify import safety or use apps.get_model
# Ideally import normally, but if 500ing, might be import error.
from financials.models import FinancialAffidavit

def get_core_models():
    Firm = apps.get_model('core', 'Firm')
    Client = apps.get_model('core', 'Client')
    Matter = apps.get_model('core', 'Matter')
    return Firm, Client, Matter

def process_wizard_data(user, wizard_data):
    """
    Takes a newly registered user and a dictionary of wizard data.
    Ensures the user has a Firm.
    Creates a Client (Plaintiff).
    Creates a Matter.
    Creates a FinancialAffidavit populated with the data.
    """
    with transaction.atomic():
        Firm, Client, Matter = get_core_models()

        # 1. Ensure Firm (If user signed up directly, might not have one yet)
        if hasattr(user, 'firm') and user.firm:
            firm = user.firm
        else:
            # Create a default "Solo Firm" for the user
            firm = Firm.objects.create(
                name=f"{user.username}'s Firm",
                domain=f"{user.username}.com", # Placeholder unique domain
                iolta_account_id="pending",
                operating_account_id="pending"
            )
            user.firm = firm
            user.save()

        # 2. Extract Data
        import json
        print(f"DEBUG WIZARD DATA: {json.dumps(wizard_data)}", flush=True)

        case_basics = wizard_data.get('caseBasics', {})
        income_data = wizard_data.get('income', {})
        expenses_data = wizard_data.get('expenses', {})
        
        plaintiff_name = case_basics.get('plaintiff', 'Unknown Client').split(' ')
        first_name = plaintiff_name[0]
        last_name = plaintiff_name[1] if len(plaintiff_name) > 1 else 'Unknown'

        # 3. Create Client
        client = Client.objects.create(
            firm=firm,
            first_name=first_name,
            last_name=last_name,
            email=f"{first_name.lower()}@example.com", # Placeholder
            phone="000-000-0000"
        )

        # 4. Create Matter
        # Fix: ensure title is never empty string
        case_num = case_basics.get('caseNumber')
        case_title = case_num if case_num and case_num.strip() else f"Case {case_basics.get('plaintiff', 'Unknown')}"

        matter = Matter.objects.create(
            client=client,
            title=case_title,
            status='ACTIVE',
            practice_area='Family Law',
            court_case_number=case_num,
            jurisdiction=case_basics.get('county')
        )

        # 5. Create Financial Affidavit
        FinancialAffidavit.objects.create(
            matter=matter,
            is_plaintiff=True, 
            status='DRAFT',
            gross_wages=Decimal(str(income_data.get('grossMonthly', 0))),
            # Map other fields from wizard_data...
            # For brevity, implementing Gross Wages mapping as proof of concept.
            # Real implementation would map every single field from the JSON.
        )
        
    return matter
