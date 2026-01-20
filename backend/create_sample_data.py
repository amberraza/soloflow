import os
import django
import uuid

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from core.models import Firm, User

def create_data():
    if Firm.objects.exists():
        print(f"Firm ID: {Firm.objects.first().id}")
        return

    firm = Firm.objects.create(
        name="Solo Law Pivot",
        domain="sololaw.com",
        iolta_account_id="acct_test_iolta",
        operating_account_id="acct_test_ops"
    )
    
    User.objects.create_user(
        username="attorney",
        email="attorney@sololaw.com",
        password="password123",
        firm=firm,
        is_attorney=True
    )
    
    print(f"Created Firm: {firm.name}")
    print(f"Firm ID: {firm.id}")
    print(f"User: attorney / password123")

if __name__ == "__main__":
    create_data()
