from __future__ import annotations

import logging
from typing import Any, Dict

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from api.models import PredictionRecord
from api.serializers import (
    EmailPredictionInputSerializer,
    PredictionRecordListSerializer,
    PredictionRecordSerializer,
)
from api import ml_service
from api.evaluation import create_test_split, evaluate_models, load_dataset

logger = logging.getLogger(__name__)


# ============================================================
# 1. API ROOT CATALOG VIEW (Function-Based)
# ============================================================

@api_view(['GET'])
def api_root_view(request):
    """
    Overview of all available Phishing Email Detection endpoints.
    """
    endpoints = {
        "core_prediction": {
            "predict_single": {
                "method": "POST",
                "url": request.build_absolute_uri("/api/predict/"),
                "description": "Classify an email (Phishing vs Legitimate) with end-to-end NLP preprocessing, structural feature engineering, and dual LightGBM + Random Forest models.",
                "source_module": "api.ml_service",
            },
        },
        "model_and_evaluation": {
            "model_telemetry": {
                "method": "GET",
                "url": request.build_absolute_uri("/api/model-info/"),
                "description": "Retrieve model dimensions (15,013 features), vocabulary size, and optimal cutoff (0.36).",
                "source_module": "api.ml_service",
            },
            "dataset_summary": {
                "method": "GET",
                "url": request.build_absolute_uri("/api/dataset/"),
                "description": "Retrieve training dataset telemetry, class balance, and 70/15/15 train/val/test splits.",
                "source_module": "api.evaluation",
            },
            "evaluation_report": {
                "method": "GET",
                "url": request.build_absolute_uri("/api/evaluation/"),
                "description": "Retrieve benchmark test-split metrics (accuracy, precision, recall 99.79%, confusion matrix).",
                "source_module": "api.evaluation",
            },
            "evaluation_run": {
                "method": "POST",
                "url": request.build_absolute_uri("/api/evaluation/run/"),
                "description": "Trigger live test-set model evaluation and update reports/evaluation_report.json.",
                "source_module": "api.evaluation",
            },
        },
        "history_and_audit": {
            "history_list": {
                "method": "GET",
                "url": request.build_absolute_uri("/api/history/"),
                "description": "Query historical email predictions stored in database (?verdict=phishing, ?limit=50).",
                "source_module": "api.models",
            },
            "history_detail": {
                "method": "GET / DELETE",
                "url": request.build_absolute_uri("/api/history/<id>/"),
                "description": "Retrieve complete signal telemetry or delete an existing analysis record.",
                "source_module": "api.models",
            },
        },
    }

    return Response(
        {
            "error": False,
            "data": endpoints,
            "message": "Phishing Email Detection REST API Catalog. Core classification and intelligence services.",
            "statuscode": status.HTTP_200_OK,
        },
        status=status.HTTP_200_OK,
    )


# ============================================================
# 2. SINGLE EMAIL PREDICTION VIEW (Function-Based -> api.ml_service)
# ============================================================

@api_view(['POST'])
def predict_email_view(request):
    """
    Analyzes a single email to detect phishing threats using LightGBM and Random Forest.
    Internally handles all text preprocessing, URL extraction, and structural feature engineering.
    """
    serializer = EmailPredictionInputSerializer(data=request.data)
    if not serializer.is_valid():
        error_messages = [f"{field}: {err[0]}" for field, err in serializer.errors.items()]
        return Response(
            {
                "error": True,
                "message": f"Invalid email data: {'; '.join(error_messages)}",
                "statuscode": status.HTTP_400_BAD_REQUEST,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    validated_data = serializer.validated_data
    email_text = validated_data["text"]
    sender = validated_data.get("sender", "")
    recipient = validated_data.get("recipient", "")
    reply_to = validated_data.get("reply_to", "")
    subject = validated_data.get("subject", "")
    save_record = validated_data.get("save_record", True)

    try:
        analysis_result = ml_service.analyze_email(
            email_text=email_text,
            sender=sender,
            recipient=recipient,
            reply_to=reply_to,
            subject=subject,
        )

        record_id = None
        if save_record:
            signals = analysis_result["security_signals"]
            record = PredictionRecord.objects.create(
                sender=sender,
                sender_domain=analysis_result["metadata"]["sender_domain"],
                recipient=recipient,
                reply_to=reply_to,
                reply_to_domain=analysis_result["metadata"]["reply_to_domain"],
                subject=subject,
                email_text=email_text,
                verdict=analysis_result["verdict"],
                is_phishing=analysis_result["is_phishing"],
                confidence_score=analysis_result["confidence_score"],
                model_agreement=analysis_result["model_agreement"],
                recommended_action=analysis_result["recommended_action"],
                lightgbm_probability=analysis_result["lightgbm"]["probability"],
                lightgbm_prediction=analysis_result["lightgbm"]["prediction"],
                random_forest_probability=analysis_result["random_forest"]["probability"],
                random_forest_prediction=analysis_result["random_forest"]["prediction"],
                urls_detected_count=signals["urls_detected"],
                has_ip_url=signals["has_ip_url"],
                has_suspicious_tld=signals["has_suspicious_tld"],
                has_url_shortener=signals["has_url_shortener"],
                sender_reply_to_mismatch=signals["sender_reply_to_mismatch"],
                urgency_score=signals["urgency_score"],
                has_html=signals["has_html"],
                raw_signals=analysis_result,
            )
            record_id = record.id

        response_payload = {
            "record_id": record_id,
            **analysis_result,
        }

        verdict_upper = analysis_result["verdict"].upper()
        return Response(
            {
                "error": False,
                "data": response_payload,
                "message": f"Email analyzed successfully. Security Verdict: {verdict_upper}.",
                "statuscode": status.HTTP_200_OK,
            },
            status=status.HTTP_200_OK,
        )

    except Exception as exc:
        logger.exception("Error during email inference: %s", exc)
        return Response(
            {
                "error": True,
                "message": f"Model inference failed: {str(exc)}",
                "statuscode": status.HTTP_500_INTERNAL_SERVER_ERROR,
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


# ============================================================
# 3. DATASET SUMMARY VIEW (Function-Based -> api.evaluation)
# ============================================================

@api_view(['GET'])
def dataset_summary_view(request):
    """
    Directly connects to api.evaluation.load_dataset() and create_test_split().
    Returns dataset statistics, class balance, and 70/15/15 train/val/test splits.
    """
    try:
        df = load_dataset()
        train_idx, val_idx, test_idx = create_test_split(df)

        legit_count = int((df["label"] == 0).sum())
        phish_count = int((df["label"] == 1).sum())

        data = {
            "total_emails": len(df),
            "class_distribution": {
                "legitimate": legit_count,
                "phishing": phish_count,
                "phishing_percentage": round((phish_count / len(df)) * 100, 2),
            },
            "split_configuration": {
                "train_count": len(train_idx),
                "train_percent": "70%",
                "validation_count": len(val_idx),
                "validation_percent": "15%",
                "test_count": len(test_idx),
                "test_percent": "15%",
            },
            "columns": list(df.columns),
        }

        return Response(
            {
                "error": False,
                "data": data,
                "message": "Dataset summary and splits retrieved via api.evaluation.",
                "statuscode": status.HTTP_200_OK,
            },
            status=status.HTTP_200_OK,
        )
    except Exception as exc:
        logger.exception("Dataset summary error: %s", exc)
        return Response(
            {
                "error": True,
                "message": f"Failed to load dataset summary: {str(exc)}",
                "statuscode": status.HTTP_500_INTERNAL_SERVER_ERROR,
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


# ============================================================
# 4. LIVE EVALUATION RUN VIEW (Function-Based -> api.evaluation)
# ============================================================

@api_view(['POST'])
def evaluation_run_view(request):
    """
    Directly connects to api.evaluation.evaluate_models().
    Triggers live model test-set evaluation across 12,969 samples and updates evaluation_report.json.
    """
    try:
        report = evaluate_models()
        return Response(
            {
                "error": False,
                "data": report,
                "message": "Live test-set model evaluation completed successfully via api.evaluation.",
                "statuscode": status.HTTP_200_OK,
            },
            status=status.HTTP_200_OK,
        )
    except Exception as exc:
        logger.exception("Evaluation execution error: %s", exc)
        return Response(
            {
                "error": True,
                "message": f"Evaluation run failed: {str(exc)}",
                "statuscode": status.HTTP_500_INTERNAL_SERVER_ERROR,
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


# ============================================================
# 5. MODEL TELEMETRY VIEW (Function-Based -> api.ml_service)
# ============================================================

@api_view(['GET'])
def model_info_view(request):
    """
    Returns active model parameters, feature dimensions, and health status.
    """
    try:
        telemetry = ml_service.get_model_telemetry()
        return Response(
            {
                "error": False,
                "data": telemetry,
                "message": "Model telemetry and configuration retrieved successfully.",
                "statuscode": status.HTTP_200_OK,
            },
            status=status.HTTP_200_OK,
        )
    except Exception as exc:
        return Response(
            {
                "error": True,
                "message": f"Failed to retrieve model telemetry: {str(exc)}",
                "statuscode": status.HTTP_500_INTERNAL_SERVER_ERROR,
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


# ============================================================
# 6. EVALUATION REPORT VIEW (Function-Based -> reports/evaluation_report.json)
# ============================================================

@api_view(['GET'])
def evaluation_report_view(request):
    """
    Returns benchmark test-set evaluation metrics from reports/evaluation_report.json.
    """
    try:
        report = ml_service.get_stored_evaluation_report()
        return Response(
            {
                "error": False,
                "data": report,
                "message": "Model benchmark evaluation report retrieved successfully.",
                "statuscode": status.HTTP_200_OK,
            },
            status=status.HTTP_200_OK,
        )
    except FileNotFoundError as fnf_err:
        return Response(
            {
                "error": True,
                "message": f"Evaluation report file not found: {str(fnf_err)}",
                "statuscode": status.HTTP_404_NOT_FOUND,
            },
            status=status.HTTP_404_NOT_FOUND,
        )
    except Exception as exc:
        return Response(
            {
                "error": True,
                "message": f"Failed to load evaluation report: {str(exc)}",
                "statuscode": status.HTTP_500_INTERNAL_SERVER_ERROR,
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


# ============================================================
# 7. PREDICTION HISTORY LIST VIEW (Function-Based)
# ============================================================

@api_view(['GET'])
def prediction_history_list_view(request):
    """
    Retrieves stored historical email prediction records with filtering.
    """
    queryset = PredictionRecord.objects.all()

    verdict = request.query_params.get('verdict')
    if verdict:
        queryset = queryset.filter(verdict=verdict.lower())

    is_phishing = request.query_params.get('is_phishing')
    if is_phishing is not None:
        queryset = queryset.filter(is_phishing=is_phishing.lower() in ['true', '1'])

    search = request.query_params.get('search')
    if search:
        queryset = queryset.filter(subject__icontains=search) | queryset.filter(sender__icontains=search)

    limit = request.query_params.get('limit', 50)
    try:
        limit = min(int(limit), 200)
    except ValueError:
        limit = 50

    queryset = queryset[:limit]
    serializer = PredictionRecordListSerializer(queryset, many=True)

    return Response(
        {
            "error": False,
            "data": {
                "count": len(serializer.data),
                "records": serializer.data,
            },
            "message": "Prediction history retrieved successfully.",
            "statuscode": status.HTTP_200_OK,
        },
        status=status.HTTP_200_OK,
    )


# ============================================================
# 8. PREDICTION DETAIL VIEW (Function-Based)
# ============================================================

@api_view(['GET', 'DELETE'])
def prediction_detail_view(request, pk: int):
    """
    Retrieves or deletes a single PredictionRecord by primary key.
    """
    try:
        record = PredictionRecord.objects.get(pk=pk)
    except PredictionRecord.DoesNotExist:
        return Response(
            {
                "error": True,
                "message": f"Prediction record with ID {pk} not found.",
                "statuscode": status.HTTP_404_NOT_FOUND,
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    if request.method == 'GET':
        serializer = PredictionRecordSerializer(record)
        return Response(
            {
                "error": False,
                "data": serializer.data,
                "message": "Prediction record details retrieved successfully.",
                "statuscode": status.HTTP_200_OK,
            },
            status=status.HTTP_200_OK,
        )

    elif request.method == 'DELETE':
        record.delete()
        return Response(
            {
                "error": False,
                "data": {"id": pk},
                "message": f"Prediction record with ID {pk} deleted successfully.",
                "statuscode": status.HTTP_200_OK,
            },
            status=status.HTTP_200_OK,
        )