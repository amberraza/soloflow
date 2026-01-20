import os
from django.template.loader import render_to_string
from django.conf import settings
from django.utils import timezone
from core.models import Document
from django.core.files.base import ContentFile
# WeasyPrint importation moved to function to avoid hard dependency on system libs during tests
HTML = None

def generate_retainer_pdf(matter):
    """
    Generates a PDF retainer agreement for the given Matter.
    Saves it as a Document object linked to the Matter.
    """
    global HTML
    if not HTML:
        try:
            from weasyprint import HTML
        except (ImportError, OSError):
            # If weasyprint is installed but system libs missing, it raises OSError
            HTML = None
            
    if not HTML:
        raise ImportError("WeasyPrint is not installed or configured.")

    client = matter.client
    firm = client.firm

    # Validate Data
    if not client.first_name or not client.last_name:
        raise ValueError("Client name incomplete.")
    if not firm.name:
        raise ValueError("Firm name missing.")

    context = {
        'matter': matter,
        'client': client,
        'firm': firm,
        'date': timezone.now().strftime('%Y-%m-%d')
    }

    html_string = render_to_string('core/retainer_agreement.html', context)
    
    pdf_file = HTML(string=html_string).write_pdf()
    
    filename = f"Retainer_{matter.id}_{timezone.now().strftime('%Y%m%d')}.pdf"
    
    doc = Document.objects.create(
        matter=matter,
        is_retainer=True
    )
    doc.file.save(filename, ContentFile(pdf_file))
    doc.save()
    
    return doc
