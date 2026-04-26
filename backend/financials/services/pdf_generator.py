from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from financials.models import FinancialAffidavit
from io import BytesIO

def generate_financial_declaration_pdf(affidavit: FinancialAffidavit):
    """
    Generates a PDF for the SCCA 430 Financial Declaration using ReportLab.
    Now pulls all values from the FinancialAffidavit model instead of hardcoded demo data.
    """
    buffer = BytesIO()
    # Reduce margins to 0.5 inch (default is 1 inch) to fit everything on one page
    doc = SimpleDocTemplate(
        buffer, 
        pagesize=letter,
        rightMargin=0.5*inch,
        leftMargin=0.5*inch,
        topMargin=0.5*inch,
        bottomMargin=0.5*inch
    )
    elements = []
    
    styles = getSampleStyleSheet()
    title_style = styles['Heading1']
    title_style.alignment = 1 # Center
    title_style.fontSize = 14 # Reduce title size slightly
    title_style.leading = 16 

    normal_style = styles['Normal']

    # Header
    elements.append(Paragraph("STATE OF SOUTH CAROLINA", title_style))
    elements.append(Paragraph(f"COUNTY OF {(affidavit.matter.jurisdiction or 'UNKNOWN').upper()}", title_style))
    elements.append(Paragraph("IN THE FAMILY COURT", title_style))
    elements.append(Spacer(1, 10))

    # Caption Table
    client = affidavit.matter.client
    data = [
        [f"{client.first_name} {client.last_name}", f"Case No. {affidavit.matter.court_case_number or 'Pending'}"],
        ["Plaintiff,", ""],
        ["vs.", "FINANCIAL DECLARATION"],
        ["Defendant Name (TBD)", "(SCCA 430)"],
        ["Defendant.", ""]
    ]
    t = Table(data, colWidths=[300, 200])
    t.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LINEAFTER', (0,0), (0,-1), 1, colors.black),
    ]))
    elements.append(t)
    elements.append(Spacer(1, 15))

    # --- Financial Data pulled from the affidavit model ---
    gross_wages = float(affidavit.gross_wages)
    overtime_bonus = float(affidavit.overtime_bonus)
    rental_income = float(affidavit.rental_income)
    business_income = float(affidavit.business_income)
    total_gross = gross_wages + overtime_bonus + rental_income + business_income

    tax_federal = float(affidavit.tax_federal)
    tax_state = float(affidavit.tax_state)
    tax_fica = float(affidavit.tax_fica)
    health_insurance = float(affidavit.health_insurance_total)
    total_deductions_val = tax_federal + tax_state + tax_fica + health_insurance

    net_income = total_gross - total_deductions_val

    rent_mortgage = float(affidavit.rent_mortgage)
    utilities = float(affidavit.utilities)
    food_household = float(affidavit.food_household)
    daycare = float(affidavit.daycare_work_related)
    total_expenses = rent_mortgage + utilities + food_household + daycare

    def add_section(title, rows):
        elements.append(Paragraph(title, styles['Heading2']))
        table_data = []
        for label, val in rows:
            table_data.append([label, f"${val:,.2f}"])
        
        t = Table(table_data, colWidths=[400, 100])
        t.setStyle(TableStyle([
            ('LINEBELOW', (0,0), (-1,-1), 0.5, colors.grey),
            ('ALIGN', (1,0), (1,-1), 'RIGHT'),
        ]))
        elements.append(t)
        elements.append(Spacer(1, 10))

    # I. GROSS INCOME
    add_section("I. GROSS MONTHLY INCOME", [
        ("Gross Monthly Wages / Salary", gross_wages),
        ("Bonuses / Commissions", overtime_bonus),
        ("Rental Income", rental_income),
        ("Business / Self-Employment", business_income),
        ("TOTAL GROSS INCOME", total_gross)
    ])

    # II. DEDUCTIONS
    add_section("II. MONTHLY DEDUCTIONS", [
        ("Federal Tax", tax_federal),
        ("State Tax", tax_state),
        ("FICA (Social Security / Medicare)", tax_fica),
        ("Health Insurance", health_insurance),
        ("TOTAL DEDUCTIONS", total_deductions_val)
    ])

    # III. NET INCOME
    add_section("III. NET MONTHLY INCOME", [
        ("NET INCOME (I - II)", net_income)
    ])
    
    # IV. EXPENSES
    add_section("IV. MONTHLY EXPENSES", [
        ("Rent / Mortgage", rent_mortgage),
        ("Utilities", utilities),
        ("Food / Household", food_household),
        ("Work-Related Daycare", daycare),
        ("TOTAL EXPENSES", total_expenses)
    ])
    
    # Footer
    elements.append(Spacer(1, 25))
    elements.append(Paragraph("__________________________________________", normal_style))
    elements.append(Paragraph("Signature of Declarant", normal_style))
    
    doc.build(elements)
    buffer.seek(0)
    return buffer.read()
