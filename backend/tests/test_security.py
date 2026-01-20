import pytest
from core.models import Firm, User, Client
from rest_framework.test import APIRequestFactory, force_authenticate
from rest_framework.viewsets import ModelViewSet
from core.mixins import FirmIsolationMixin
from rest_framework import serializers

# Mock ViewSet for testing
class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = '__all__'

class ClientViewSet(FirmIsolationMixin, ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer

@pytest.mark.django_db
def test_firm_isolation():
    # Setup Firm A and User A
    firm_a = Firm.objects.create(name="Firm A", domain="firma.com", iolta_account_id="acct_A_iolta", operating_account_id="acct_A_ops")
    user_a = User.objects.create_user(username="lawyer_a", password="password", firm=firm_a)

    # Setup Firm B and User B
    firm_b = Firm.objects.create(name="Firm B", domain="firmb.com", iolta_account_id="acct_B_iolta", operating_account_id="acct_B_ops")
    user_b = User.objects.create_user(username="lawyer_b", password="password", firm=firm_b)

    # Create Clients for Firm A
    client_a1 = Client.objects.create(firm=firm_a, first_name="ClientA1", last_name="Test", email="ca1@test.com", phone="111")
    
    # Create Clients for Firm B
    client_b1 = Client.objects.create(firm=firm_b, first_name="ClientB1", last_name="Test", email="cb1@test.com", phone="222")

    # Test Logic
    factory = APIRequestFactory()
    view = ClientViewSet.as_view({'get': 'list'})

    # 1. User A should only see Client A1
    request_a = factory.get('/clients/')
    force_authenticate(request_a, user=user_a)
    response_a = view(request_a)
    
    assert len(response_a.data) == 1
    assert response_a.data[0]['id'] == str(client_a1.id)

    # 2. User B should only see Client B1
    request_b = factory.get('/clients/')
    force_authenticate(request_b, user=user_b)
    response_b = view(request_b)

    assert len(response_b.data) == 1
    assert response_b.data[0]['id'] == str(client_b1.id)

    # 3. User B should NOT see Client A1
    ids_b = [item['id'] for item in response_b.data]
    assert str(client_a1.id) not in ids_b
