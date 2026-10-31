from __future__ import annotations

import re
import string
from typing import List, Tuple

import nltk
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer
from nltk.tokenize import word_tokenize

from api.config import URL_RE


def ensure_nltk() -> None:
    """
    Download the required NLTK resources used by the preprocessing pipeline
    if they are not already installed locally.
    """
    resources = [
        ("tokenizers/punkt_tab", "punkt_tab"),
        ("tokenizers/punkt", "punkt"),
        ("corpora/stopwords", "stopwords"),
    ]

    for data_path, download_id in resources:
        try:
            nltk.data.find(data_path)
        except LookupError:
            print(f"Downloading NLTK resource: {download_id}")
            nltk.download(download_id, quiet=True)


# Ensure NLTK packages are present upon module initialization
ensure_nltk()

STEMMER = PorterStemmer()
STOP_WORDS = set(stopwords.words("english"))


def extract_urls(raw_text: str) -> List[str]:
    """
    Extract URLs from raw email text before HTML stripping.
    Matches the original preprocessing pipeline.
    """
    if not raw_text or not isinstance(raw_text, str):
        return []
    return URL_RE.findall(raw_text)


def strip_html(text: str) -> str:
    """
    Remove HTML markup from email body and return visible plain text.
    Uses lxml if available, falling back to html.parser.
    """
    if not text or not isinstance(text, str):
        return ""

    try:
        from bs4 import BeautifulSoup
        soup = BeautifulSoup(text, "lxml")
    except Exception:
        from bs4 import BeautifulSoup
        soup = BeautifulSoup(text, "html.parser")

    return soup.get_text(separator=" ")


def clean_text(text: str) -> str:
    """
    Standardizes and normalizes plain text:
    1. Lowercase conversion
    2. Punctuation removal
    3. Tokenization via NLTK
    4. Stopword filtering
    5. Non-alphabetic token removal
    6. Single-character token pruning
    7. Porter stemming
    """
    if not text or not isinstance(text, str):
        return ""

    text = text.lower()
    text = text.translate(str.maketrans("", "", string.punctuation))
    tokens = word_tokenize(text)

    stemmed_tokens = [
        STEMMER.stem(token)
        for token in tokens
        if token.isalpha() and token not in STOP_WORDS and len(token) > 1
    ]

    return " ".join(stemmed_tokens)


def preprocess_email(raw_text: str) -> Tuple[str, List[str]]:
    """
    Preprocess raw email text.

    Returns:
        Tuple of (cleaned_stemmed_text, list_of_extracted_urls)
    """
    if not raw_text or not isinstance(raw_text, str):
        return "", []

    urls = extract_urls(raw_text)
    plain_text = strip_html(raw_text)
    cleaned_text = clean_text(plain_text)

    return cleaned_text, urls

