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

def safe_decimal(value, default=Decimal('0.00')):
    """Safely convert a value to Decimal, returning default on None/empty."""
    if value is None or (isinstance(value, str) and value.strip() == ''):
        return default
    try:
        return Decimal(str(value))
    except Exception:
        return default

def process_wizard_data(user, wizard_data):
    """
    Takes a newly registered user and a dictionary of wizard data.
    Ensures the user has a Firm.
    Creates a Client (Plaintiff).
    Creates a Matter.
    Creates a FinancialAffidavit populated with ALL data from the wizard.
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

        # 2. Extract Data from wizard JSON
        case_basics = wizard_data.get('caseBasics', {})
        case_details = wizard_data.get('caseDetails', {})
        income_data = wizard_data.get('income', {})
        deductions_data = wizard_data.get('deductions', {})
        expenses_data = wizard_data.get('expenses', {})

        # --- Case Basics ---
        plaintiff_name = case_basics.get('plaintiff', 'Unknown Client').split(' ')
        first_name = plaintiff_name[0]
        last_name = ' '.join(plaintiff_name[1:]) if len(plaintiff_name) > 1 else 'Unknown'

        defendant_name = case_basics.get('defendant', '')
        county = case_basics.get('county', '')
        case_number = case_basics.get('caseNumber', '')
        case_title = case_number if case_number and case_number.strip() else f"Case {case_basics.get('plaintiff', 'Unknown')}"

        # --- Case Details (from extended wizard steps) ---
        children_count = case_details.get('numChildren')
        if children_count is not None:
            try:
                children_count = int(children_count)
            except (ValueError, TypeError):
                children_count = 0

        # --- Income Data ---
        gross_monthly = safe_decimal(income_data.get('grossMonthly', 0))
        overtime = safe_decimal(income_data.get('overtime', 0))
        rental_income = safe_decimal(income_data.get('rentalIncome', 0))
        business_income = safe_decimal(income_data.get('businessIncome', 0))

        # --- Deductions Data ---
        tax_federal = safe_decimal(deductions_data.get('federalTax', 0))
        tax_state = safe_decimal(deductions_data.get('stateTax', 0))
        tax_fica = safe_decimal(deductions_data.get('fica', 0))
        health_insurance_total = safe_decimal(deductions_data.get('healthInsurance', 0))
        health_insurance_children = safe_decimal(deductions_data.get('healthInsuranceChildren', 0))

        # --- Expenses Data ---
        rent_mortgage = safe_decimal(expenses_data.get('housing', 0))
        utilities = safe_decimal(expenses_data.get('utilities', 0))
        food_household = safe_decimal(expenses_data.get('food', 0))
        daycare = safe_decimal(expenses_data.get('daycare', 0))

        # 3. Create Client
        client = Client.objects.create(
            firm=firm,
            first_name=first_name,
            last_name=last_name,
            email=f"{first_name.lower()}@example.com", # Placeholder
            phone="000-000-0000"
        )

        # 4. Create Matter
        matter = Matter.objects.create(
            client=client,
            title=case_title,
            status='ACTIVE',
            practice_area='Family Law',
            court_case_number=case_number,
            jurisdiction=county,
            defendant_name=defendant_name,
        )

        # 5. Create Financial Affidavit — fully populated
        FinancialAffidavit.objects.create(
            matter=matter,
            is_plaintiff=True,
            status='DRAFT',
            # Income
            gross_wages=gross_monthly,
            overtime_bonus=overtime,
            rental_income=rental_income,
            business_income=business_income,
            # Deductions
            tax_federal=tax_federal,
            tax_state=tax_state,
            tax_fica=tax_fica,
            health_insurance_total=health_insurance_total,
            health_insurance_children=health_insurance_children,
            # Expenses
            rent_mortgage=rent_mortgage,
            utilities=utilities,
            food_household=food_household,
            daycare_work_related=daycare,
        )

    return matter
