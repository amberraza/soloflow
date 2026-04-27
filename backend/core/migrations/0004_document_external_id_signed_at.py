"""Add external_id and signed_at to Document model for Documenso integration."""
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('core', '0003_add_defendant_name'),
    ]
    operations = [
        migrations.AddField(
            model_name='document',
            name='external_id',
            field=models.CharField(blank=True, help_text='External system ID (e.g. Documenso document ID)', max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='document',
            name='signed_at',
            field=models.DateTimeField(blank=True, help_text='When the client signed via Documenso', null=True),
        ),
    ]
