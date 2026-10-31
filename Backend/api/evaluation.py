from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Tuple

import numpy as np
import pandas as pd
from scipy.sparse import csr_matrix, hstack as sparse_hstack
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split

logger = logging.getLogger(__name__)

from api.config import (
    CACHE_CLEANED_TEXTS_PATH,
    CACHE_STRUCT_MATRIX_PATH,
    DATASET_PATH,
    EVALUATION_REPORT_PATH,
    EXPECTED_STRUCTURAL_FEATURES,
    EXPECTED_TFIDF_FEATURES,
    EXPECTED_TOTAL_FEATURES,
    LEGACY_EVALUATION_REPORT_PATH,
    RANDOM_STATE,
)
from api.features import build_structural_feature_vector
from api.ml_service import load_models
from api.preprocessor import preprocess_email


def load_dataset() -> pd.DataFrame:
    """
    Loads and validates the processed emails CSV dataset.
    """
    if not DATASET_PATH.exists():
        raise FileNotFoundError(f"Dataset not found at:\n{DATASET_PATH}")

    df = pd.read_csv(DATASET_PATH)

    required_columns = {"text", "label"}
    missing = required_columns - set(df.columns)
    if missing:
        raise ValueError(f"Dataset is missing required columns: {missing}")

    df = df.dropna(subset=["text", "label"]).copy()
    df["text"] = df["text"].astype(str)
    df["label"] = df["label"].astype(int)

    # Defaults matching training scripts
    for col in ["subject", "sender_domain", "reply_to_domain"]:
        if col not in df.columns:
            df[col] = ""
        df[col] = df[col].fillna("").astype(str)

    return df


def build_dataset_features(df: pd.DataFrame) -> Tuple[List[str], np.ndarray]:
    """
    Extracts or loads cached preprocessing text and structural feature matrix
    for the entire dataset.
    """
    # 1. Attempt loading from pre-generated cache
    if CACHE_CLEANED_TEXTS_PATH.exists() and CACHE_STRUCT_MATRIX_PATH.exists():
        logger.info("Found training feature cache on disk.")
        try:
            with open(CACHE_CLEANED_TEXTS_PATH, "r", encoding="utf-8") as file:
                cleaned_texts = json.load(file)

            X_struct = np.load(CACHE_STRUCT_MATRIX_PATH)

            if (
                len(cleaned_texts) == len(df)
                and X_struct.shape[0] == len(df)
                and X_struct.shape[1] == EXPECTED_STRUCTURAL_FEATURES
            ):
                logger.info(
                    "Using cached preprocessed text (%d items) & structural matrix %s.",
                    len(cleaned_texts),
                    X_struct.shape,
                )
                return cleaned_texts, X_struct

            logger.warning("Cache length mismatch. Rebuilding features...")
        except Exception as exc:
            logger.warning("Could not load cache: %s. Rebuilding...", exc)

    # 2. Rebuild features row-by-row
    logger.info("Building preprocessing and structural features for %d emails...", len(df))

    cleaned_texts: List[str] = []
    structural_rows: List[np.ndarray] = []
    total = len(df)

    for index, row in df.iterrows():
        raw_text = str(row["text"])
        cleaned, urls = preprocess_email(raw_text)

        structural_vector = build_structural_feature_vector(
            urls=urls,
            raw_text=raw_text,
            cleaned_text=cleaned,
            sender_domain=row["sender_domain"] or None,
            reply_to_domain=row["reply_to_domain"] or None,
            subject=str(row["subject"]),
        )

        cleaned_texts.append(cleaned)
        structural_rows.append(structural_vector)

        if (index + 1) % 10000 == 0 or index + 1 == total:
            pct = (index + 1) / total * 100
            logger.info("Progress: %d / %d emails (%.1f%%)", index + 1, total, pct)

    X_struct = np.vstack(structural_rows).astype(np.float32)

    # 3. Save newly computed cache
    try:
        with open(CACHE_CLEANED_TEXTS_PATH, "w", encoding="utf-8") as file:
            json.dump(cleaned_texts, file)
        np.save(CACHE_STRUCT_MATRIX_PATH, X_struct)
        logger.info("Feature cache saved successfully.")
    except Exception as exc:
        logger.warning("Warning: could not save cache: %s", exc)

    return cleaned_texts, X_struct


def create_test_split(df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
    """
    Creates stratified split matching the original training configuration:
    - 70% Train
    - 15% Validation
    - 15% Test
    """
    indices = np.arange(len(df))

    train_idx, temp_idx = train_test_split(
        indices,
        test_size=0.30,
        stratify=df["label"].values,
        random_state=RANDOM_STATE,
    )

    val_idx, test_idx = train_test_split(
        temp_idx,
        test_size=0.50,
        stratify=df["label"].values[temp_idx],
        random_state=RANDOM_STATE,
    )

    return train_idx, val_idx, test_idx


def calculate_metrics(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    y_probability: np.ndarray,
) -> Dict[str, Any]:
    """
    Calculates accuracy, precision, recall, f1, auc-roc, and confusion matrix.
    """
    return {
        "accuracy": float(accuracy_score(y_true, y_pred)),
        "precision": float(precision_score(y_true, y_pred, zero_division=0)),
        "recall": float(recall_score(y_true, y_pred, zero_division=0)),
        "f1": float(f1_score(y_true, y_pred, zero_division=0)),
        "auc_roc": float(roc_auc_score(y_true, y_probability)),
        "confusion_matrix": confusion_matrix(y_true, y_pred).tolist(),
    }


def evaluate_models() -> Dict[str, Any]:
    """
    Performs full test-set evaluation of LightGBM and Random Forest models,
    generates classification reports, and outputs results to reports/evaluation_report.json.
    """
    logger.info("Initializing model test evaluation suite...")

    lightgbm_model, random_forest_model, vectorizer, threshold = load_models(verbose=False)
    df = load_dataset()

    logger.info("Dataset size: %d emails", len(df))

    cleaned_texts, X_struct = build_dataset_features(df)
    train_idx, val_idx, test_idx = create_test_split(df)

    logger.info(
        "Data Split - Train: %d, Validation: %d, Test: %d",
        len(train_idx),
        len(val_idx),
        len(test_idx),
    )

    logger.info("Vectorizing test split with 15,000 TF-IDF features...")
    X_test_tfidf = vectorizer.transform([cleaned_texts[i] for i in test_idx])
    X_test_combined = sparse_hstack(
        [X_test_tfidf, csr_matrix(X_struct[test_idx])],
        format="csr",
    )
    y_test = df["label"].values[test_idx]

    if X_test_combined.shape[1] != EXPECTED_TOTAL_FEATURES:
        raise ValueError(
            f"Feature construction mismatch.\n"
            f"Expected: {EXPECTED_TOTAL_FEATURES}\n"
            f"Actual:   {X_test_combined.shape[1]}"
        )

    # 1. LightGBM Evaluation
    logger.info("Computing LightGBM inference on %d test samples...", len(test_idx))
    lgb_probability = lightgbm_model.predict_proba(X_test_combined)[:, 1]
    lgb_default_pred = (lgb_probability >= 0.50).astype(int)
    lgb_tuned_pred = (lgb_probability >= threshold).astype(int)

    lgb_default_metrics = calculate_metrics(y_test, lgb_default_pred, lgb_probability)
    lgb_tuned_metrics = calculate_metrics(y_test, lgb_tuned_pred, lgb_probability)

    # 2. Random Forest Evaluation
    logger.info("Computing Random Forest inference on %d test samples...", len(test_idx))
    rf_probability = random_forest_model.predict_proba(X_test_combined)[:, 1]
    rf_pred = random_forest_model.predict(X_test_combined)
    rf_metrics = calculate_metrics(y_test, rf_pred, rf_probability)

    # 3. Save JSON Report
    report: Dict[str, Any] = {
        "dataset": str(DATASET_PATH),
        "dataset_size": int(len(df)),
        "split": {
            "train": int(len(train_idx)),
            "validation": int(len(val_idx)),
            "test": int(len(test_idx)),
        },
        "features": {
            "tfidf": EXPECTED_TFIDF_FEATURES,
            "structural": EXPECTED_STRUCTURAL_FEATURES,
            "total": EXPECTED_TOTAL_FEATURES,
        },
        "lightgbm": {
            "default_threshold_0.50": lgb_default_metrics,
            "cost_tuned": {
                "threshold": float(threshold),
                "metrics": lgb_tuned_metrics,
            },
        },
        "random_forest": rf_metrics,
    }

    # Save to primary reports/ directory
    with open(EVALUATION_REPORT_PATH, "w", encoding="utf-8") as file:
        json.dump(report, file, indent=4)

    # Also keep legacy PWD/ file in sync
    try:
        with open(LEGACY_EVALUATION_REPORT_PATH, "w", encoding="utf-8") as file:
            json.dump(report, file, indent=4)
    except Exception:
        pass

    logger.info("Evaluation report saved successfully to %s", EVALUATION_REPORT_PATH)
    return report

