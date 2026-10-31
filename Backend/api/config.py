from __future__ import annotations

import re
from pathlib import Path
from typing import List

from django.conf import settings

# ============================================================
# PROJECT DIRECTORY & PATH RESOLUTION
# ============================================================

BASE_DIR: Path = settings.BASE_DIR

# Data Paths
DATA_DIR: Path = BASE_DIR / "data"
PROCESSED_DATA_DIR: Path = DATA_DIR / "processed"
RAW_DATA_DIR: Path = DATA_DIR / "raw"

DATASET_PATH: Path = PROCESSED_DATA_DIR / "emails.csv"
CACHE_CLEANED_TEXTS_PATH: Path = PROCESSED_DATA_DIR / "cache_cleaned_texts.json"
CACHE_STRUCT_MATRIX_PATH: Path = PROCESSED_DATA_DIR / "cache_struct_matrix.npy"

# Model Paths
MODELS_DIR: Path = BASE_DIR / "models"
LIGHTGBM_PATH: Path = MODELS_DIR / "lightgbm_model.pkl"
RANDOM_FOREST_PATH: Path = MODELS_DIR / "random_forest.pkl"
TFIDF_PATH: Path = MODELS_DIR / "tfidf_vectoriser.pkl"
THRESHOLD_PATH: Path = MODELS_DIR / "threshold.json"

# Report Paths
REPORTS_DIR: Path = BASE_DIR / "reports"
REPORTS_DIR.mkdir(parents=True, exist_ok=True)
EVALUATION_REPORT_PATH: Path = REPORTS_DIR / "evaluation_report.json"
LEGACY_EVALUATION_REPORT_PATH: Path = BASE_DIR / "evaluation_report.json"

# ============================================================
# TRAINING & FEATURE CONSTANTS
# ============================================================

TFIDF_MAX_FEATURES: int = 15_000
RANDOM_STATE: int = 42

EXPECTED_TFIDF_FEATURES: int = 15_000
EXPECTED_STRUCTURAL_FEATURES: int = 13
EXPECTED_TOTAL_FEATURES: int = 15_013

DEFAULT_LIGHTGBM_THRESHOLD: float = 0.36

# ============================================================
# REGEX & STRUCTURAL LOOKUPS
# ============================================================

URL_RE = re.compile(
    r"(?:https?://|www\.)[^\s<>\"'\)\(]+",
    re.IGNORECASE,
)

IP_IN_HOST_RE = re.compile(
    r"^(\d{1,3}\.){3}\d{1,3}(:\d+)?$"
)

HTML_TAG_RE = re.compile(
    r"<[a-zA-Z][^>]*>"
)

SUSPICIOUS_TLDS = frozenset(
    {
        ".tk",
        ".ml",
        ".ga",
        ".cf",
        ".gq",
        ".xyz",
        ".top",
        ".click",
        ".link",
        ".work",
        ".online",
        ".site",
        ".tech",
        ".club",
        ".buzz",
        ".icu",
        ".live",
        ".vip",
        ".bid",
        ".loan",
        ".win",
    }
)

URL_SHORTENERS = frozenset(
    {
        "bit.ly",
        "tinyurl.com",
        "t.co",
        "ow.ly",
        "goo.gl",
        "is.gd",
        "cli.gs",
        "dlvr.it",
        "ift.tt",
        "tiny.cc",
        "lnkd.in",
        "db.tt",
        "short.to",
        "rb.gy",
        "cutt.ly",
        "shorturl.at",
        "tr.im",
        "v.gd",
    }
)

URGENCY_WORDS = frozenset(
    {
        "urgent",
        "immediately",
        "verify",
        "expire",
        "expires",
        "expired",
        "suspended",
        "limited",
        "winner",
        "congratulations",
        "free",
        "prize",
        "confirm",
        "click",
        "login",
        "update",
        "account",
        "password",
        "security",
        "unauthorized",
        "unusual",
        "suspicious",
        "blocked",
        "locked",
        "restricted",
        "action",
        "required",
        "attention",
        "alert",
        "warning",
        "critical",
        "important",
        "overdue",
        "validate",
    }
)

STRUCTURAL_FEATURE_NAMES: List[str] = [
    "url_count",
    "has_ip_url",
    "has_suspicious_tld",
    "has_url_shortener",
    "max_url_length",
    "mean_url_entropy",
    "sender_reply_to_mismatch",
    "urgency_score",
    "has_html",
    "body_length",
    "word_count",
    "exclamation_density",
    "caps_ratio",
]
