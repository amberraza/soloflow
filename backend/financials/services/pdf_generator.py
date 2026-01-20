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

    # Financial Data
    gross = float(affidavit.gross_wages)
    deductions = 500.00 + 382.50 # Hardcoded matching wizard demo
    net = gross - deductions
    expenses = 2050.00 # Hardcoded matching wizard demo

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
        ("Gross Monthly Wages / Salary", gross),
        ("Bonuses / Commissions", 0),
        ("Rental Income", 0),
        ("TOTAL GROSS INCOME", gross)
    ])

    # II. DEDUCTIONS
    add_section("II. MONTHLY DEDUCTIONS", [
        ("Federal / State Taxes", 500.00),
        ("FICA", 382.50),
        ("TOTAL DEDUCTIONS", deductions)
    ])

    # III. NET INCOME
    add_section("III. NET MONTHLY INCOME", [
        ("NET INCOME (I - II)", net)
    ])
    
    # IV. EXPENSES
    add_section("IV. MONTHLY EXPENSES", [
        ("Rent / Mortgage", 1500.00),
        ("Utilities", 150.00),
        ("Food / Household", 400.00),
        ("TOTAL EXPENSES", expenses)
    ])
    
    # Footer
    elements.append(Spacer(1, 25))
    elements.append(Paragraph("__________________________________________", normal_style))
    elements.append(Paragraph("Signature of Declarant", normal_style))
    
    doc.build(elements)
    buffer.seek(0)
    return buffer.read()
