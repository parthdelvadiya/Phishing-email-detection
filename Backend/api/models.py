from django.db import models


class PredictionRecord(models.Model):
    """
    Stores historical analysis records of emails processed by the phishing detection engine.
    """
    VERDICT_CHOICES = [
        ('phishing', 'Phishing'),
        ('legitimate', 'Legitimate'),
        ('model_disagreement', 'Model Disagreement'),
    ]

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    sender = models.CharField(max_length=255, blank=True, default='')
    sender_domain = models.CharField(max_length=255, blank=True, default='')
    recipient = models.CharField(max_length=255, blank=True, default='')
    reply_to = models.CharField(max_length=255, blank=True, default='')
    reply_to_domain = models.CharField(max_length=255, blank=True, default='')
    subject = models.CharField(max_length=500, blank=True, default='')
    email_text = models.TextField(help_text="Full text body of the email analyzed")

    # Primary Decision
    verdict = models.CharField(max_length=50, choices=VERDICT_CHOICES, db_index=True)
    is_phishing = models.BooleanField(default=False, db_index=True)
    confidence_score = models.FloatField(help_text="Primary probability score (LightGBM)")
    model_agreement = models.BooleanField(default=True)
    recommended_action = models.CharField(max_length=255, blank=True, default='')

    # Model breakdown
    lightgbm_probability = models.FloatField()
    lightgbm_prediction = models.CharField(max_length=20)
    random_forest_probability = models.FloatField()
    random_forest_prediction = models.CharField(max_length=20)

    # Key security signals
    urls_detected_count = models.IntegerField(default=0)
    has_ip_url = models.BooleanField(default=False)
    has_suspicious_tld = models.BooleanField(default=False)
    has_url_shortener = models.BooleanField(default=False)
    sender_reply_to_mismatch = models.BooleanField(default=False)
    urgency_score = models.IntegerField(default=0)
    has_html = models.BooleanField(default=False)

    # Full structured result payload for detailed inspection
    raw_signals = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Prediction Record'
        verbose_name_plural = 'Prediction Records'

    def __str__(self):
        return f"[{self.verdict.upper()}] {self.subject or 'No Subject'} ({self.created_at.strftime('%Y-%m-%d %H:%M')})"
