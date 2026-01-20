from django.db import models
from core.models import Matter
import uuid

class FinancialAffidavit(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    matter = models.ForeignKey(Matter, on_delete=models.CASCADE)
    is_plaintiff = models.BooleanField(default=True)
    # Status: DRAFT, FINAL, FILED
    status = models.CharField(max_length=20, default='DRAFT')
    
    # Section 1: Income (All Monthly)
    gross_wages = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    overtime_bonus = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    rental_income = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    business_income = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Section 2: Deductions
    tax_federal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax_state = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax_fica = models.DecimalField(max_digits=10, decimal_places=2, default=0) # Social Security + Medicare
    health_insurance_total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    health_insurance_children = models.DecimalField(max_digits=10, decimal_places=2, default=0, help_text="Portion for children only - critical for Child Support calc")
    
    # Section 3: Expenses
    rent_mortgage = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    utilities = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    food_household = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    daycare_work_related = models.DecimalField(max_digits=10, decimal_places=2, default=0, help_text="Used in CS Worksheet")

    @property
    def total_gross_income(self):
        return self.gross_wages + self.overtime_bonus + self.rental_income + self.business_income

    @property
    def total_deductions(self):
        return self.tax_federal + self.tax_state + self.tax_fica + self.health_insurance_total

    @property
    def net_monthly_income(self):
        return self.total_gross_income - self.total_deductions

class ChildSupportWorksheet(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    matter = models.ForeignKey(Matter, on_delete=models.CASCADE)
    
    # Inputs
    mother_gross_income = models.DecimalField(max_digits=10, decimal_places=2)
    father_gross_income = models.DecimalField(max_digits=10, decimal_places=2)
    
    mother_overnights = models.IntegerField(default=182)
    father_overnights = models.IntegerField(default=183)
    
    # Calculated Results
    basic_obligation = models.DecimalField(max_digits=10, decimal_places=2)
    total_obligation = models.DecimalField(max_digits=10, decimal_places=2)
class BasicObligationSchedule(models.Model):
    combined_gross_income = models.DecimalField(max_digits=10, decimal_places=2)
    one_child = models.DecimalField(max_digits=10, decimal_places=2)
    two_children = models.DecimalField(max_digits=10, decimal_places=2)
    three_children = models.DecimalField(max_digits=10, decimal_places=2)
    # Could go up to 6 children in real app
