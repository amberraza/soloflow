import pytest
from financials.services.child_support import ChildSupportEngine
from financials.models import BasicObligationSchedule
from decimal import Decimal

@pytest.fixture
def setup_guidelines(db):
    BasicObligationSchedule.objects.create(combined_gross_income=5000, one_child=800, two_children=1200, three_children=1500)
    BasicObligationSchedule.objects.create(combined_gross_income=8000, one_child=1200, two_children=1800, three_children=2200)

@pytest.mark.django_db
def test_child_support_sole_custody(setup_guidelines):
    # Scenario A: Father 5k, Mother 3k. Combined 8k.
    # 1 child.
    # Overnights: Father 183, Mother 182 (Sole/Shared split point is 109, this is roughly 50/50 but let's test straight lookup first)
    # Wait, 183/182 IS Shared.
    # To test Sole, one needs < 109.
    # Father 300, Mother 65.
    
    engine = ChildSupportEngine(mother_gross=3000, father_gross=5000, mother_overnights=65, father_overnights=300, num_children=1)
    result = engine.calculate()
    
    # Combined 8000. Look up 8000 row -> One Child = 1200.
    # Worksheet A.
    assert result['basic_obligation'] == Decimal('1200.00')
    assert result['total_obligation'] == Decimal('1200.00') # No extra expenses
    assert result['worksheet'] == 'A'
    
    # Father share: 5000/8000 = 62.5%
    # Father obligation: 1200 * 0.625 = 750
    assert result['father_obligation'] == Decimal('750.00')

@pytest.mark.django_db
def test_child_support_shared_custody(setup_guidelines):
    # Scenario B: 50/50 Custody. Multiplier 1.5x.
    # Father 5k, Mother 3k. Combined 8k.
    
    engine = ChildSupportEngine(mother_gross=3000, father_gross=5000, mother_overnights=182, father_overnights=183, num_children=1)
    result = engine.calculate()
    
    # Base 1200 * 1.5 = 1800.
    assert result['worksheet'] == 'C'
    assert result['total_obligation'] == Decimal('1800.00')
    
    # Father share: 62.5% of 1800 = 1125
    assert result['father_obligation'] == Decimal('1125.00')

@pytest.mark.django_db
def test_cliff_logic(setup_guidelines):
    # Test 109 overnights (Sole) vs 110 (Shared) for one parent.
    # Father 5k, Mother 3k.
    
    # Case 1: Mother has 109. Not Shared.
    engine_sole = ChildSupportEngine(mother_gross=3000, father_gross=5000, mother_overnights=109, father_overnights=256, num_children=1)
    res_sole = engine_sole.calculate()
    assert res_sole['worksheet'] == 'A'
    assert res_sole['total_obligation'] == Decimal('1200.00')
    
    # Case 2: Mother has 110. Shared.
    engine_shared = ChildSupportEngine(mother_gross=3000, father_gross=5000, mother_overnights=110, father_overnights=255, num_children=1)
    res_shared = engine_shared.calculate()
    assert res_shared['worksheet'] == 'C'
    assert res_shared['total_obligation'] == Decimal('1800.00')
