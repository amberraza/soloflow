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
         # Very basic stub. Real tax calculation is extremely complex.
         # This is likely just a placeholder for the "Wizard" if user leaves blank.
         # We will assume a flat rate for MVP or return 0 if not implementing full bracket logic.
         # Prompt says "Auto-calculate FICA... based on Gross Income if the user leaves them blank."
         # It doesn't explicitly ask for Federal/State brackets, but usually "Tax Logic" implies it.
         # For now, implementing FICA is the explicit requirement.
         pass
