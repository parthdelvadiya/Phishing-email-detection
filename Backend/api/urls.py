from django.urls import path
from api.views import (
    api_root_view,
    dataset_summary_view,
    evaluation_report_view,
    evaluation_run_view,
    model_info_view,
    predict_email_view,
    prediction_detail_view,
    prediction_history_list_view,
)

urlpatterns = [
    # 1. API Directory & Overview
    path('', api_root_view, name='api-root'),
    
    # 2. Single Email Prediction (Integrated Preprocessing, Features, & Dual-Model Inference)
    path('predict/', predict_email_view, name='predict-email'),
    
    # 3. Model Telemetry & Dimensions
    path('model-info/', model_info_view, name='model-info'),
    
    # 4. Dataset Telemetry & Splits
    path('dataset/', dataset_summary_view, name='dataset-summary'),
    
    # 5. Benchmark Evaluation Reports & Live Run
    path('evaluation/', evaluation_report_view, name='evaluation-report'),
    path('evaluation/run/', evaluation_run_view, name='evaluation-run'),
    
    # 6. Audit History & Detail Records
    path('history/', prediction_history_list_view, name='prediction-history'),
    path('history/<int:pk>/', prediction_detail_view, name='prediction-detail'),
]