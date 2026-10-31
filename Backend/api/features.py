from __future__ import annotations

import math
import re
from typing import Dict, List, Optional
from urllib.parse import urlparse

import numpy as np

from api.config import (
    HTML_TAG_RE,
    IP_IN_HOST_RE,
    STRUCTURAL_FEATURE_NAMES,
    SUSPICIOUS_TLDS,
    URL_SHORTENERS,
    URGENCY_WORDS,
)


def url_entropy(url: str) -> float:
    """
    Computes Shannon entropy of characters in a given URL string.
    High entropy often indicates obfuscated, randomized, or malicious URLs.
    """
    if not url:
        return 0.0

    frequency: Dict[str, int] = {}
    for char in url:
        frequency[char] = frequency.get(char, 0) + 1

    length = len(url)
    return -sum(
        (count / length) * math.log2(count / length)
        for count in frequency.values()
    )


def extract_url_features(urls: List[str]) -> Dict[str, float]:
    """
    Extracts numerical features from detected URLs in the email body:
    - total url count
    - IP address used as hostname
    - suspicious / high-risk TLD present
    - URL shortening service used
    - maximum URL length
    - mean URL Shannon entropy
    """
    if not urls:
        return {
            "url_count": 0.0,
            "has_ip_url": 0.0,
            "has_suspicious_tld": 0.0,
            "has_url_shortener": 0.0,
            "max_url_length": 0.0,
            "mean_url_entropy": 0.0,
        }

    has_ip = 0.0
    has_suspicious_tld = 0.0
    has_shortener = 0.0
    lengths: List[int] = []
    entropies: List[float] = []

    for url in urls:
        normalized = url if "://" in url else "http://" + url
        try:
            parsed = urlparse(normalized)
            host = parsed.netloc.lower().split(":")[0]
        except Exception:
            host = ""

        # Check for raw IP address in host
        if IP_IN_HOST_RE.match(host):
            has_ip = 1.0

        # Check for suspicious top-level domains
        for tld in SUSPICIOUS_TLDS:
            if host.endswith(tld):
                has_suspicious_tld = 1.0
                break

        # Check for popular URL shortening services
        parts = host.split(".")
        etld_plus1 = ".".join(parts[-2:]) if len(parts) >= 2 else host
        if etld_plus1 in URL_SHORTENERS:
            has_shortener = 1.0

        lengths.append(len(url))
        entropies.append(url_entropy(url))

    return {
        "url_count": float(len(urls)),
        "has_ip_url": has_ip,
        "has_suspicious_tld": has_suspicious_tld,
        "has_url_shortener": has_shortener,
        "max_url_length": float(max(lengths)),
        "mean_url_entropy": float(np.mean(entropies)),
    }

def root_domain(domain: str) -> str:
    """
    Extracts the root domain (eTLD+1) from a hostname or domain string.
    e.g., 'mail.google.com' -> 'google.com'
    """
    if not domain:
        return ""

    parts = domain.strip().lower().split(".")
    if len(parts) >= 2:
        return ".".join(parts[-2:])
    return domain.strip().lower()


def extract_header_features(
    sender_domain: Optional[str] = None,
    reply_to_domain: Optional[str] = None,
    subject: str = "",
) -> Dict[str, float]:
    """
    Extracts features from email header metadata:
    - Sender vs Reply-To domain mismatch (spoofing indicator)
    - Subject urgency keyword frequency score
    """
    mismatch = 0.0
    if sender_domain and reply_to_domain:
        if root_domain(sender_domain) != root_domain(reply_to_domain):
            mismatch = 1.0

    subject_tokens = set(re.sub(r"[^a-z\s]", "", subject.lower()).split())
    urgency_score = float(len(subject_tokens & URGENCY_WORDS))

    return {
        "sender_reply_to_mismatch": mismatch,
        "urgency_score": urgency_score,
    }


def extract_structural_features(
    raw_text: str,
    cleaned_text: str,
) -> Dict[str, float]:
    """
    Extracts statistical and structural characteristics from email content:
    - Presence of HTML markup
    - Total character length of body
    - Word count
    - Exclamation mark density (% per word)
    - Uppercase character ratio
    """
    has_html = 1.0 if HTML_TAG_RE.search(raw_text) else 0.0
    body_length = float(len(raw_text))

    words = cleaned_text.split() if cleaned_text else []
    word_count = float(len(words))

    exclamation_count = raw_text.count("!")
    exclamation_density = (
        exclamation_count / word_count * 100.0 if word_count > 0 else 0.0
    )

    alpha_chars = [char for char in raw_text if char.isalpha()]
    caps_ratio = (
        sum(1 for char in alpha_chars if char.isupper()) / len(alpha_chars)
        if alpha_chars
        else 0.0
    )

    return {
        "has_html": has_html,
        "body_length": body_length,
        "word_count": word_count,
        "exclamation_density": exclamation_density,
        "caps_ratio": caps_ratio,
    }


def build_structural_feature_vector(
    urls: List[str],
    raw_text: str,
    cleaned_text: str,
    sender_domain: Optional[str] = None,
    reply_to_domain: Optional[str] = None,
    subject: str = "",
) -> np.ndarray:
    """
    Combines URL, header, and content structural features into a 13-dimensional
    float32 numpy array matching the training pipeline feature order.
    """
    url_features = extract_url_features(urls)
    header_features = extract_header_features(
        sender_domain, reply_to_domain, subject
    )
    structural_features = extract_structural_features(raw_text, cleaned_text)

    combined = {
        **url_features,
        **header_features,
        **structural_features,
    }

    return np.array(
        [combined[name] for name in STRUCTURAL_FEATURE_NAMES],
        dtype=np.float32,
    )


def extract_domain(email_or_domain: str) -> str:
    """
    Extracts domain component from email address or domain string:
    e.g., 'John Doe <support@paypal-security.com>' -> 'paypal-security.com'
    """
    if not email_or_domain:
        return ""

    value = email_or_domain.strip()

    # Handle angled format: "Name <user@domain.com>"
    angle_match = re.search(r"<([^>]+)>", value)
    if angle_match:
        value = angle_match.group(1).strip()

    if "@" in value:
        return value.split("@")[-1].lower().strip()

    return value.lower().strip()