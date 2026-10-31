from __future__ import annotations

from rest_framework import serializers
from api.models import PredictionRecord


class EmailPredictionInputSerializer(serializers.Serializer):
    """
    Validates input payload for single email prediction.
    """
    text = serializers.CharField(
        required=True,
        allow_blank=False,
        help_text="Email body content (plain text or raw HTML). Required."
    )
    sender = serializers.CharField(
        required=False,
        default="",
        allow_blank=True,
        help_text="Sender email address or domain (e.g. support@paypal-security.com)."
    )
    recipient = serializers.CharField(
        required=False,
        default="",
        allow_blank=True,
        help_text="Recipient email address."
    )
    reply_to = serializers.CharField(
        required=False,
        default="",
        allow_blank=True,
        help_text="Reply-To header email address."
    )
    subject = serializers.CharField(
        required=False,
        default="",
        allow_blank=True,
        help_text="Subject line of the email."
    )
    save_record = serializers.BooleanField(
        required=False,
        default=True,
        help_text="If True, saves this analysis to database prediction history."
    )

    def validate_text(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Email body text cannot be empty or only whitespace.")
        return value.strip()


class PredictionRecordSerializer(serializers.ModelSerializer):
    """
    Serializes stored PredictionRecord models for history and detail views.
    """
    class Meta:
        model = PredictionRecord
        fields = '__all__'


class PredictionRecordListSerializer(serializers.ModelSerializer):
    """
    Lightweight summary serializer for listing historical predictions.
    """
    class Meta:
        model = PredictionRecord
        fields = [
            'id',
            'created_at',
            'verdict',
            'is_phishing',
            'confidence_score',
            'subject',
            'sender',
            'sender_domain',
            'model_agreement',
            'urls_detected_count',
            'has_ip_url',
            'sender_reply_to_mismatch',
        ]
