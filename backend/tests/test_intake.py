import pytest
from core.models import Firm, Matter
from rest_framework.test import APIClient
from datetime import date, timedelta

@pytest.mark.django_db
def test_intake_qualification_logic():
    firm = Firm.objects.create(name="TestFirm", domain="test.com")
    
    client = APIClient()
    url = '/api/v1/intake/public/'

    # Case 1: PI + < 2 years -> Qualified
    recent_date = date.today() - timedelta(days=365) # 1 year ago
    data_qualified = {
        'firm_id': str(firm.id),
        'first_name': 'John',
        'last_name': 'Doe',
        'email': 'john@example.com',
        'phone': '123',
        'case_type': 'Personal Injury',
        'incident_date': recent_date.isoformat(),
        'description': 'Car accident'
    }
    
    response = client.post(url, data_qualified, format='json')
    assert response.status_code == 201
    assert response.data['qualified'] is True
    assert response.data['message'] == "Qualified"
    
    matter_id = response.data['matter_id']
    matter = Matter.objects.get(id=matter_id)
    assert matter.status == 'QUALIFIED'

    # Case 2: PI + > 2 years -> Rejected
    old_date = date.today() - timedelta(days=800) # > 2 years
    data_rejected = {
        'firm_id': str(firm.id),
        'first_name': 'Jane',
        'last_name': 'Doe',
        'email': 'jane@example.com',
        'phone': '123',
        'case_type': 'Personal Injury',
        'incident_date': old_date.isoformat(),
        'description': 'Old accident'
    }
    
    response = client.post(url, data_rejected, format='json')
    assert response.status_code == 201
    assert response.data['qualified'] is False
    assert "Statute of limitations expired" in response.data['message']
    
    matter_rej = Matter.objects.get(id=response.data['matter_id'])
    assert matter_rej.status == 'REJECTED'

    # Case 3: Non-PI -> Rejected
    data_non_pi = {
        'firm_id': str(firm.id),
        'first_name': 'Bob',
        'last_name': 'Smith',
        'email': 'bob@example.com',
        'phone': '123',
        'case_type': 'Family Law',
        'incident_date': recent_date.isoformat(),
        'description': 'Divorce'
    }
    
    response = client.post(url, data_non_pi, format='json')
    assert response.status_code == 201
    assert response.data['qualified'] is False
    assert "Not a Personal Injury case" in response.data['message']
    
    matter_non_pi = Matter.objects.get(id=response.data['matter_id'])
    assert matter_non_pi.status == 'REJECTED'
