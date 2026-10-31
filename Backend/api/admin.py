from django.contrib import admin
from api.models import PredictionRecord


@admin.register(PredictionRecord)
class PredictionRecordAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'created_at',
        'verdict',
        'is_phishing',
        'confidence_score',
        'subject',
        'sender_domain',
        'model_agreement',
    )
    list_filter = ('verdict', 'is_phishing', 'model_agreement', 'created_at')
    search_fields = ('subject', 'sender', 'recipient', 'reply_to', 'email_text')
    readonly_fields = ('created_at',)
    ordering = ('-created_at',)
