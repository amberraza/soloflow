import os
import logging
from django.template.loader import render_to_string
from django.conf import settings
from django.utils import timezone
from core.models import Document
from django.core.files.base import ContentFile
# WeasyPrint importation moved to function to avoid hard dependency on system libs during tests
HTML = None

logger = logging.getLogger(__name__)

def generate_retainer_pdf(matter, send_for_signature=True):
    """
    Generates a PDF retainer agreement for the given Matter.
    Saves it as a Document object linked to the Matter.
    If send_for_signature is True, also sends it via Documenso for e-signature.
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

    # Automatically send for e-signature via Documenso
    if send_for_signature:
        try:
            from .documenso import send_retainer_for_signing
            result = send_retainer_for_signing(
                document_obj=doc,
                client_email=client.email,
                client_name=f"{client.first_name} {client.last_name}",
            )
            if result:
                logger.info(
                    f"Retainer sent for signature via Documenso. "
                    f"Doc ID: {result.get('document_id')}, "
                    f"Signing URL: {result.get('signing_url')}"
                )
            else:
                logger.warning("Documenso returned no result for retainer signing")
        except Exception as e:
            logger.error(f"Failed to send retainer for signature: {e}")
            # Don't fail the overall operation — retainer PDF is still saved
    
    return doc
