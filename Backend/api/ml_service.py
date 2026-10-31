from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
import warnings

from django.conf import settings
import joblib
import numpy as np
from scipy.sparse import csr_matrix, hstack as sparse_hstack

logger = logging.getLogger(__name__)

from api.config import (
    DEFAULT_LIGHTGBM_THRESHOLD,
    EXPECTED_TOTAL_FEATURES,
    LIGHTGBM_PATH,
    RANDOM_FOREST_PATH,
    STRUCTURAL_FEATURE_NAMES,
    TFIDF_PATH,
    THRESHOLD_PATH,
)
from api.features import (
    build_structural_feature_vector,
    extract_domain,
    extract_header_features,
    extract_structural_features,
    extract_url_features,
)
from api.preprocessor import preprocess_email, strip_html

# Module-level model cache so models are loaded only once in memory
_MODELS_CACHE: Optional[Tuple[Any, Any, Any, float]] = None


def load_models(verbose: bool = False) -> Tuple[Any, Any, Any, float]:
    """
    Loads the trained machine learning models, vectorizer, and decision threshold from disk.
    Returns:
        (lightgbm_model, random_forest_model, tfidf_vectorizer, threshold)
    """
    for file_path in [LIGHTGBM_PATH, RANDOM_FOREST_PATH, TFIDF_PATH]:
        if not file_path.exists():
            raise FileNotFoundError(f"Missing required model file: {file_path}")

    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        lightgbm_model = joblib.load(LIGHTGBM_PATH)
        random_forest_model = joblib.load(RANDOM_FOREST_PATH)
        vectorizer = joblib.load(TFIDF_PATH)

    threshold = DEFAULT_LIGHTGBM_THRESHOLD
    if THRESHOLD_PATH.exists():
        try:
            with open(THRESHOLD_PATH, "r", encoding="utf-8") as f:
                threshold_data = json.load(f)
                threshold = float(threshold_data.get("threshold", DEFAULT_LIGHTGBM_THRESHOLD))
        except Exception:
            threshold = DEFAULT_LIGHTGBM_THRESHOLD

    return lightgbm_model, random_forest_model, vectorizer, threshold


def get_models() -> Tuple[Any, Any, Any, float]:
    """
    Returns the cached ML models from memory. Loads them once if not already loaded.
    """
    global _MODELS_CACHE
    if _MODELS_CACHE is None:
        _MODELS_CACHE = load_models()
    return _MODELS_CACHE


def analyze_email(
    email_text: str,
    sender: str = "",
    recipient: str = "",
    reply_to: str = "",
    subject: str = "",
) -> Dict[str, Any]:
    """
    Main function to analyze an email for phishing threats.
    Executes in a simple, linear flow without confusing nested function hops:
      1. Retrieve cached AI models
      2. Clean email text and extract URLs
      3. Extract the 13 security/structural features (once!)
      4. Transform text with TF-IDF vectorizer and combine with structural features
      5. Run predictions on LightGBM and Random Forest
      6. Determine consensus verdict and format the result
    """
    # Step 1: Get trained models
    lightgbm_model, random_forest_model, vectorizer, threshold = get_models()

    # Step 2: Clean text and extract URLs
    cleaned_text, urls = preprocess_email(email_text)
    plain_text = strip_html(email_text)

    sender_domain = extract_domain(sender) if sender else ""
    reply_to_domain = extract_domain(reply_to) if reply_to else ""

    # Step 3: Compute security & structural signals (done once)
    url_sigs = extract_url_features(urls)
    hdr_sigs = extract_header_features(
        sender_domain=sender_domain or None,
        reply_to_domain=reply_to_domain or None,
        subject=subject,
    )
    struct_sigs = extract_structural_features(
        raw_text=email_text,
        cleaned_text=cleaned_text,
    )

    # Build the 13-dimensional structural vector matching model training order
    all_signals = {**url_sigs, **hdr_sigs, **struct_sigs}
    structural_vector = np.array(
        [all_signals[name] for name in STRUCTURAL_FEATURE_NAMES],
        dtype=np.float32,
    )

    # Step 4: Build feature matrix (15,000 TF-IDF features + 13 structural features = 15,013)
    X_tfidf = vectorizer.transform([cleaned_text])
    X_struct = csr_matrix(structural_vector.reshape(1, -1))
    X = sparse_hstack([X_tfidf, X_struct], format="csr")

    # Step 5: Run AI inference
    lgb_probability = float(lightgbm_model.predict_proba(X)[0][1])
    lgb_prediction_num = int(lightgbm_model.predict(X)[0])
    lgb_tuned_prediction = int(lgb_probability >= threshold)

    rf_probability = float(random_forest_model.predict_proba(X)[0][1])
    rf_prediction_num = int(random_forest_model.predict(X)[0])

    # Step 6: Determine verdict & safety recommendations
    if lgb_tuned_prediction == 1 and rf_prediction_num == 1:
        verdict = "phishing"
        recommended_action = "CRITICAL: Quarantine email immediately. Do not click links or input credentials."
    elif lgb_tuned_prediction == 0 and rf_prediction_num == 0:
        verdict = "legitimate"
        recommended_action = "SAFE: Email exhibits normal legitimate structural and linguistic characteristics."
    else:
        verdict = "model_disagreement"
        recommended_action = "WARNING: Model divergence detected. Escalate to security operations for manual inspection."

    is_phishing = (verdict == "phishing" or bool(lgb_tuned_prediction))
    model_agreement = (lgb_prediction_num == rf_prediction_num)

    # Step 7: Return the complete, structured result
    return {
        "verdict": verdict,
        "is_phishing": is_phishing,
        "confidence_score": round(lgb_probability, 4),
        "model_agreement": model_agreement,
        "recommended_action": recommended_action,
        "lightgbm": {
            "prediction": "phishing" if lgb_prediction_num == 1 else "legitimate",
            "probability": round(lgb_probability, 4),
            "probability_percent": f"{lgb_probability * 100:.2f}%",
            "optimal_threshold": threshold,
            "is_phishing_tuned": bool(lgb_tuned_prediction),
        },
        "random_forest": {
            "prediction": "phishing" if rf_prediction_num == 1 else "legitimate",
            "probability": round(rf_probability, 4),
            "probability_percent": f"{rf_probability * 100:.2f}%",
        },
        "preprocessing": {
            "raw_character_length": len(email_text),
            "plain_text": plain_text,
            "cleaned_stemmed_text": cleaned_text,
            "tokens": cleaned_text.split() if cleaned_text else [],
            "token_count": len(cleaned_text.split()) if cleaned_text else 0,
            "urls_extracted": urls,
            "urls_count": len(urls),
        },
        "feature_engineering": {
            "structural_feature_count": len(STRUCTURAL_FEATURE_NAMES),
            "structural_feature_names": STRUCTURAL_FEATURE_NAMES,
            "structural_feature_vector": [round(float(v), 4) for v in structural_vector],
            "url_analysis": url_sigs,
            "header_analysis": hdr_sigs,
            "content_analysis": struct_sigs,
        },
        "security_signals": {
            "urls_detected": int(url_sigs.get("url_count", len(urls))),
            "urls": urls,
            "has_ip_url": bool(url_sigs.get("has_ip_url", 0.0) > 0),
            "has_suspicious_tld": bool(url_sigs.get("has_suspicious_tld", 0.0) > 0),
            "has_url_shortener": bool(url_sigs.get("has_url_shortener", 0.0) > 0),
            "sender_reply_to_mismatch": bool(hdr_sigs.get("sender_reply_to_mismatch", 0.0) > 0),
            "urgency_score": int(hdr_sigs.get("urgency_score", 0)),
            "has_html": bool(struct_sigs.get("has_html", 0.0) > 0),
            "word_count": int(struct_sigs.get("word_count", 0)),
            "body_length": int(struct_sigs.get("body_length", len(email_text))),
            "caps_ratio": round(float(struct_sigs.get("caps_ratio", 0.0)), 4),
            "exclamation_density": round(float(struct_sigs.get("exclamation_density", 0.0)), 2),
        },
        "metadata": {
            "sender": sender,
            "sender_domain": sender_domain,
            "recipient": recipient,
            "reply_to": reply_to,
            "reply_to_domain": reply_to_domain,
            "subject": subject,
        },
        "feature_information": {
            "tfidf_features": X_tfidf.shape[1],
            "structural_features": len(structural_vector),
            "total_features": X.shape[1],
            "urls_detected": len(urls),
        },
    }


def build_feature_matrix(
    vectorizer: Any,
    email_text: str,
    sender_domain: str = "",
    reply_to_domain: str = "",
    subject: str = "",
) -> Tuple[csr_matrix, str, list, int, int, int]:
    """
    Clean utility function to construct the [TF-IDF | Structural] feature matrix.
    """
    cleaned_text, urls = preprocess_email(email_text)
    X_tfidf = vectorizer.transform([cleaned_text])
    X_struct = build_structural_feature_vector(
        urls=urls,
        raw_text=email_text,
        cleaned_text=cleaned_text,
        sender_domain=sender_domain or None,
        reply_to_domain=reply_to_domain or None,
        subject=subject,
    ).reshape(1, -1)
    X_combined = sparse_hstack([X_tfidf, csr_matrix(X_struct)], format="csr")
    return (
        X_combined,
        cleaned_text,
        urls,
        X_tfidf.shape[1],
        X_struct.shape[1],
        X_combined.shape[1],
    )


def predict_email(
    lightgbm_model: Any,
    random_forest_model: Any,
    vectorizer: Any,
    threshold: float,
    email_text: str,
    sender_domain: str = "",
    reply_to_domain: str = "",
    subject: str = "",
) -> Dict[str, Any]:
    """
    Backwards-compatible convenience wrapper that calls analyze_email.
    """
    return analyze_email(
        email_text=email_text,
        sender=sender_domain,
        reply_to=reply_to_domain,
        subject=subject,
    )


def get_model_telemetry() -> Dict[str, Any]:
    """
    Returns runtime configuration, model specs, and health metadata.
    """
    lightgbm_model, random_forest_model, vectorizer, threshold = get_models()
    return {
        "status": "healthy",
        "models_loaded": {
            "lightgbm": True,
            "random_forest": True,
            "tfidf_vectorizer": True,
        },
        "features": {
            "tfidf_features": len(vectorizer.get_feature_names_out()),
            "structural_features": 13,
            "total_features": 15013,
        },
        "thresholds": {
            "lightgbm_optimal_threshold": threshold,
            "random_forest_default_threshold": 0.50,
        },
        "models_directory": str(settings.MODELS_DIR),
    }


def get_stored_evaluation_report() -> Dict[str, Any]:
    """
    Loads and returns the test evaluation benchmark report from reports/evaluation_report.json.
    """
    report_file = settings.REPORTS_DIR / "evaluation_report.json"
    if not report_file.exists():
        report_file = settings.BASE_DIR / "evaluation_report.json"

    if not report_file.exists():
        raise FileNotFoundError(
            f"Evaluation report not found at {report_file}."
        )

    with open(report_file, "r", encoding="utf-8") as f:
        return json.load(f)
