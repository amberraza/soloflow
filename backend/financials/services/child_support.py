from decimal import Decimal
from ..models import BasicObligationSchedule

class ChildSupportEngine:
    def __init__(self, mother_gross, father_gross, mother_overnights, father_overnights, num_children, health_insurance_cost=0, other_child_credit=0):
        self.mother_gross = Decimal(str(mother_gross))
        self.father_gross = Decimal(str(father_gross))
        self.mother_overnights = int(mother_overnights)
        self.father_overnights = int(father_overnights)
        self.num_children = int(num_children)
        self.health_insurance_cost = Decimal(str(health_insurance_cost))
        self.other_child_credit = Decimal(str(other_child_credit))
        
        self.combined_gross = self.mother_gross + self.father_gross
        self.mother_share = self.mother_gross / self.combined_gross if self.combined_gross > 0 else Decimal(0)
        self.father_share = self.father_gross / self.combined_gross if self.combined_gross > 0 else Decimal(0)

    def calculate(self):
        # Step 3: Basic Obligation Lookup
        # Simplistic lookup: find nearest lower bracket
        # In production this should be exact or interpolated
        schedule = BasicObligationSchedule.objects.filter(combined_gross_income__lte=self.combined_gross).order_by('-combined_gross_income').first()
        
        if not schedule:
             # Fallback or error if below minimum
             base_obligation = Decimal('100.00') 
        else:
             if self.num_children == 1:
                 base_obligation = schedule.one_child
             elif self.num_children == 2:
                  base_obligation = schedule.two_children
             else:
                  base_obligation = schedule.three_children # Stub max 3

        # Add Expenses (Health Insurance)
        total_obligation = base_obligation + self.health_insurance_cost

        # Worksheets Logic
        # Worksheet C (Shared Parenting) if both > 109 overnights
        is_shared = (self.mother_overnights > 109) and (self.father_overnights > 109)
        
        if is_shared:
             # Shared Parenting 1.5x Multiplier
             total_obligation = total_obligation * Decimal('1.5')
        
        # Determine each parent's share of obligation
        mother_obligation = total_obligation * self.mother_share
        father_obligation = total_obligation * self.father_share
        
        # Calculate payment transfer
        # In Sole custody (say Mother has custody), Father pays his share.
        # In Shared, we net it out based on percentage of time?
        # Provide simplified output for now.
        
        # SC Shared Logic actually involves cross-multiplication of time-share, but for prompt MVP:
        # "Multiply Basic Obligation by 1.5".
        
        return {
            "basic_obligation": base_obligation,
            "total_obligation": total_obligation,
            "worksheet": "C" if is_shared else "A",
            "mother_share_pct": self.mother_share,
            "father_share_pct": self.father_share,
            "mother_obligation": mother_obligation,
            "father_obligation": father_obligation
        }
