import pytest
from financials.services.calculations import IncomeNormalizer, TaxCalculator
from decimal import Decimal

def test_income_normalization():
    # Weekly 1000 -> 4330
    assert IncomeNormalizer.normalize(1000, 'WEEKLY') == Decimal('4330.00')
    # Bi-Weekly 2000 -> 4332
    assert IncomeNormalizer.normalize(2000, 'BI_WEEKLY') == Decimal('4332.00')
    # Semi-Monthly 2000 -> 4000
    assert IncomeNormalizer.normalize(2000, 'SEMI_MONTHLY') == Decimal('4000.00')

def test_fica_calculation():
    # 10,000 gross -> 765 tax
    assert TaxCalculator.calculate_fica(10000) == Decimal('765.00')
