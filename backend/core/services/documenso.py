"""
Documenso API integration for SoloFlow.
Handles: sending retainer PDFs for signature, creating webhook handlers for signed status.
"""
import os
import json
import logging
import requests
from django.conf import settings
from django.core.files.base import ContentFile

logger = logging.getLogger(__name__)

DOCUMENSO_API_KEY = os.environ.get('DOCUMENSO_API_KEY', 'api_ympu5hst2d9p74ix')

DOCUMENSO_BASE_URL = 'https://sign.getsoloflow.com/api/v1'

HEADERS = {
    'Authorization': f'Bearer {DOCUMENSO_API_KEY}',
    'Content-Type': 'application/json',
}


def send_retainer_for_signing(document_obj, client_email, client_name):
    """
    Upload a retainer PDF to Documenso and send it for e-signature.

    Documenso API flow (S3 transport):
    1. POST /api/v1/documents (JSON) → returns { uploadUrl, documentId }
    2. PUT {uploadUrl} with raw PDF binary
    3. POST /api/v1/documents/{id}/send (JSON) → triggers signing emails

    Args:
        document_obj: The Document model instance (has .file path)
        client_email: str - the signer's email
        client_name: str - the signer's display name

    Returns:
        dict with signing_url, document_id, or None on failure
    """
    try:
        doc_path = document_obj.file.path

        # Step 1: Create document via JSON — get upload URL and document ID
        create_payload = {
            'title': f'Retainer Agreement - {document_obj.matter.title}',
            'recipients': [
                {
                    'email': client_email,
                    'name': client_name,
                    'role': 'SIGNER',
                }
            ],
            'meta': {
                'matter_id': str(document_obj.matter.id),
                'source': 'soloflow',
            },
        }

        create_resp = requests.post(
            f'{DOCUMENSO_BASE_URL}/documents',
            headers=HEADERS,
            json=create_payload,
            timeout=30,
        )

        if not create_resp.ok:
            logger.error(f'Documenso create document failed: {create_resp.status_code} {create_resp.text}')
            return None

        create_result = create_resp.json()
        upload_url = create_result.get('uploadUrl')
        document_id = create_result.get('documentId')

        if not upload_url or not document_id:
            logger.error(f'Documenso create response missing uploadUrl or documentId: {create_result}')
            return None

        # Step 2: Upload the PDF to the presigned S3 URL
        with open(doc_path, 'rb') as f:
            pdf_bytes = f.read()

        upload_resp = requests.put(
            upload_url,
            data=pdf_bytes,
            headers={'Content-Type': 'application/octet-stream'},
            timeout=60,
        )

        if not upload_resp.ok:
            logger.error(f'Documenso PDF upload failed: {upload_resp.status_code} {upload_resp.text}')
            return {'document_id': document_id, 'signing_url': None}

        # Step 3: Send the document for signing
        send_resp = requests.post(
            f'{DOCUMENSO_BASE_URL}/documents/{document_id}/send',
            headers=HEADERS,
            json={'sendEmail': True},
            timeout=15,
        )

        if not send_resp.ok:
            logger.error(f'Documenso send document failed: {send_resp.status_code} {send_resp.text}')
            return {'document_id': document_id, 'signing_url': None}

        send_result = send_resp.json()
        signing_url = send_result.get('signingUrl')

        # Store the Documenso document ID on the Document model
        document_obj.external_id = str(document_id)
        document_obj.save(update_fields=['external_id'])

        logger.info(f'Documenso: retainer sent for signing. Doc ID: {document_id}, Signing URL: {signing_url}')

        return {
            'document_id': document_id,
            'signing_url': signing_url,
        }

    except requests.RequestException as e:
        logger.error(f'Documenso request failed: {e}')
        return None
    except Exception as e:
        logger.error(f'Documenso integration error: {e}')
        return None


def get_document_status(document_id):
    """Check the status of a Documenso document."""
    try:
        resp = requests.get(
            f'{DOCUMENSO_BASE_URL}/documents/{document_id}',
            headers=HEADERS,
            timeout=15,
        )
        if resp.ok:
            return resp.json()
        return None
    except requests.RequestException:
        return None
