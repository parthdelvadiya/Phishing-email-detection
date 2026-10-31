/**
 * History records expose summary columns plus the original analysis payload in
 * `raw_signals`. This normalizes both shapes so the same result components can
 * render a live prediction and a saved audit record.
 */
export function buildAnalysisFromRecord(record) {
  const raw = record.raw_signals && typeof record.raw_signals === 'object' ? record.raw_signals : {}

  const fallbackSignals = {
    urls_detected: record.urls_detected_count ?? 0,
    urls: raw.preprocessing?.urls_extracted ?? [],
    has_ip_url: Boolean(record.has_ip_url),
    has_suspicious_tld: Boolean(record.has_suspicious_tld),
    has_url_shortener: Boolean(record.has_url_shortener),
    sender_reply_to_mismatch: Boolean(record.sender_reply_to_mismatch),
    urgency_score: record.urgency_score ?? 0,
    has_html: Boolean(record.has_html),
  }

  const securitySignals = {
    ...fallbackSignals,
    ...(raw.security_signals ?? {}),
  }

  const lightgbm = raw.lightgbm ?? {
    prediction: record.lightgbm_prediction,
    probability: record.lightgbm_probability,
    is_phishing_tuned: Boolean(record.is_phishing),
    optimal_threshold: undefined,
  }

  const randomForest = raw.random_forest ?? {
    prediction: record.random_forest_prediction,
    probability: record.random_forest_probability,
  }

  return {
    ...raw,
    verdict: record.verdict,
    is_phishing: Boolean(record.is_phishing),
    confidence_score: record.confidence_score,
    model_agreement: Boolean(record.model_agreement),
    recommended_action: record.recommended_action ?? '',
    lightgbm,
    random_forest: randomForest,
    security_signals: securitySignals,
    metadata: {
      sender: record.sender ?? '',
      sender_domain: record.sender_domain ?? '',
      recipient: record.recipient ?? '',
      reply_to: record.reply_to ?? '',
      reply_to_domain: record.reply_to_domain ?? '',
      subject: record.subject ?? '',
      ...(raw.metadata ?? {}),
    },
  }
}
