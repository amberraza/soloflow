from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid

class Firm(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    domain = models.CharField(max_length=255, unique=True)
    iolta_account_id = models.CharField(max_length=255, help_text="Stripe Account ID for Trust")
    operating_account_id = models.CharField(max_length=255, help_text="Stripe Account ID for Ops")

    def __str__(self):
        return self.name

class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    firm = models.ForeignKey(Firm, on_delete=models.CASCADE, related_name="users", null=True, blank=True)
    is_attorney = models.BooleanField(default=False)

class Client(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    firm = models.ForeignKey(Firm, on_delete=models.CASCADE)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class Matter(models.Model):
    STATUS_CHOICES = [
        ('LEAD', 'Lead'),
        ('QUALIFIED', 'Qualified'),
        ('ACTIVE', 'Active'),
        ('CLOSED', 'Closed'),
        ('REJECTED', 'Rejected'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    title = models.CharField(max_length=255) # e.g., "Smith vs. Jones"
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='LEAD')
    practice_area = models.CharField(max_length=100) # e.g., "Family Law", "Criminal"
    
    # Critical for docket polling
    court_case_number = models.CharField(max_length=100, blank=True, null=True)
    jurisdiction = models.CharField(max_length=100, blank=True)
    defendant_name = models.CharField(max_length=255, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True, null=True) # Sortable timestamp

    def __str__(self):
        return self.title

class Document(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    matter = models.ForeignKey(Matter, on_delete=models.CASCADE)
    file = models.FileField(upload_to='secure_docs/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    is_retainer = models.BooleanField(default=False)
    external_id = models.CharField(max_length=255, blank=True, null=True, help_text="External system ID (e.g. Documenso document ID)")
    signed_at = models.DateTimeField(blank=True, null=True, help_text="When the client signed via Documenso")

class TimeEntry(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    matter = models.ForeignKey(Matter, on_delete=models.CASCADE)
    lawyer = models.ForeignKey(User, on_delete=models.CASCADE)
    description = models.TextField()
    hours = models.DecimalField(max_digits=5, decimal_places=2)
    rate = models.DecimalField(max_digits=10, decimal_places=2)
    date_worked = models.DateField()
    is_billed = models.BooleanField(default=False)

    def total_amount(self):
        return self.hours * self.rate
