import pytest
from core.models import User, Firm, Client, Matter
from financials.models import FinancialAffidavit
from core.services.onboarding import process_wizard_data

@pytest.mark.django_db
def test_process_wizard_data():
    # Setup User without Firm
    user = User.objects.create_user(username="newlawyer", password="password")
    
    wizard_data = {
        "caseBasics": {
            "plaintiff": "Jane Doe",
            "defendant": "John Doe",
            "county": "Charleston",
            "caseNumber": "2024-DR-10-1234"
        },
        "income": {
            "grossMonthly": "5000.00"
        }
    }
    
    matter = process_wizard_data(user, wizard_data)
    
    # Assertions
    user.refresh_from_db()
    assert user.firm is not None
    assert user.firm.name == "newlawyer's Firm"
    
    assert Client.objects.count() == 1
    client = Client.objects.first()
    assert client.first_name == "Jane"
    assert client.firm == user.firm
    
    assert Matter.objects.count() == 1
    assert matter.jurisdiction == "Charleston"
    assert matter.court_case_number == "2024-DR-10-1234"
    
    assert FinancialAffidavit.objects.count() == 1
    affidavit = FinancialAffidavit.objects.first()
    assert affidavit.matter == matter
    assert affidavit.gross_wages == 5000.00
