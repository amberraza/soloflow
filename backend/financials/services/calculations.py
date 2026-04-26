from decimal import Decimal

class IncomeNormalizer:
    @staticmethod
    def normalize(amount, frequency):
        amount = Decimal(str(amount))
        if frequency == 'WEEKLY':
            return (amount * Decimal('4.33')).quantize(Decimal('0.01'))
        elif frequency == 'BI_WEEKLY':
            return (amount * Decimal('2.166')).quantize(Decimal('0.01'))
        elif frequency == 'SEMI_MONTHLY':
            return (amount * Decimal('2.00')).quantize(Decimal('0.01'))
        elif frequency == 'ANNUALLY':
            return (amount / Decimal('12.00')).quantize(Decimal('0.01'))
        elif frequency == 'MONTHLY':
            return amount
        return amount

class TaxCalculator:
    @staticmethod
    def calculate_fica(gross_monthly):
        gross = Decimal(str(gross_monthly))
        # FICA 6.2%, Medicare 1.45% = 7.65%
        # Simple estimation as requested
        fica = gross * Decimal('0.0765')
        return fica.quantize(Decimal('0.01'))

    @staticmethod
    def calculate_estimated_taxes(gross_monthly, filing_status='SINGLE'):
        """
        Estimates federal, state, and FICA taxes from gross monthly income.
        
        FICA: 7.65% (6.2% SS + 1.45% Medicare)
        Federal: Uses simplified 2024 bracket approximation for SINGLE filers.
        State: Uses a flat estimate (5% — approximate for SC, configurable).
        
        Returns a dict of estimated monthly deductions.
        """
        gross = Decimal(str(gross_monthly))
        
        # FICA is always 7.65% (no SALT cap games at < ~$168k/yr)
        fica = TaxCalculator.calculate_fica(gross)
        
        # Annualize for bracket approximation
        annual = gross * Decimal('12')
        
        # Simplified 2024 single-filer brackets:
        # 10%: $0–$11,600  | 12%: $11,600–$47,150  | 22%: $47,150–$100,525
        federal_annual = Decimal('0')
        if annual > 100525:
            federal_annual = Decimal('0.22') * annual
        elif annual > 47150:
            federal_annual = Decimal('1160') + Decimal('0.12') * (annual - 11600)
        elif annual > 11600:
            federal_annual = Decimal('0.10') * (annual - 11600)
        # Under threshold = 0
            
        federal = (federal_annual / Decimal('12')).quantize(Decimal('0.01'))
        
        # State: flat 5% approximation (varies by state — can be made configurable)
        state_annual = annual * Decimal('0.05')
        state = (state_annual / Decimal('12')).quantize(Decimal('0.01'))
        
        return {
            'federal': federal,
            'state': state,
            'fica': fica,
            'total': (federal + state + fica).quantize(Decimal('0.01'))
        }
