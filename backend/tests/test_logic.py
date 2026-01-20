import pytest
from core.models import Firm, User, Client, Matter, Document
from core.services import generate_retainer_pdf
from django.core.files.uploadedfile import SimpleUploadedFile

@pytest.mark.django_db
def test_retainer_generation_success(mocker):
    # Mock WeasyPrint
    mock_html_class = mocker.patch('core.services.HTML')
    mock_html_instance = mock_html_class.return_value
    mock_html_instance.write_pdf.return_value = b"fake pdf content"

    firm = Firm.objects.create(name="TestFirm", domain="test.com")
    client = Client.objects.create(firm=firm, first_name="Client", last_name="One", email="c1@test.com", phone="123")
    matter = Matter.objects.create(client=client, title="Test Case", practice_area="PI", status="QUALIFIED")

    # Generate
    doc = generate_retainer_pdf(matter)
    
    assert doc.is_retainer is True
    assert doc.matter == matter
    assert doc.file.name.startswith("secure_docs/Retainer_")
    assert doc.file.name.endswith(".pdf")
    # Verify file content is not empty (mock or real if weasyprint installed)
    pass

@pytest.mark.django_db
def test_retainer_generation_failure_missing_data(mocker):
    # Mock WeasyPrint to bypass installation check
    mocker.patch('core.services.HTML')

    firm = Firm.objects.create(name="TestFirm", domain="test.com")
    # Missing Last Name
    client = Client.objects.create(firm=firm, first_name="Client", last_name="", email="c2@test.com", phone="123")
    matter = Matter.objects.create(client=client, title="Test Case", practice_area="PI")

    with pytest.raises(ValueError) as excinfo:
        generate_retainer_pdf(matter)
    
    assert "Client name incomplete" in str(excinfo.value)
