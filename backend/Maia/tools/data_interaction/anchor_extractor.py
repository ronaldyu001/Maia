import re
from collections import Counter
from dataclasses import dataclass
from typing import List, Optional, Set


@dataclass(frozen=True)
class AnchorConfig:
    # Hard cap: keep anchors tight for small chunks
    max_anchors: int = 12

    # Drop common generic junk (extend over time)
    stopwords: Set[str] = None

    # Things you always want to capture if present (case-insensitive)
    allowlist: Set[str] = None

    # Things you never want to keep (case-insensitive)
    blacklist: Set[str] = None

    # Prefer these kinds of anchors (boost ranking)
    prefer_prefixes: tuple = ("http", "https", "ssh", "tls", "jwt", "rag", "ollama", "faiss", "llama", "docker")

    # Minimum token length for “word-like” anchors (except allowlist/acronyms/numbers)
    min_len: int = 3


DEFAULT_STOPWORDS = {
    "and", "for", "you", "your", "that", "the", "like", "can", "this", "python",
    "help", "with", "any",
    "a", "an", "are", "as", "at", "be", "by", "do", "from", "has", "have", "i", "if",
    "in", "is", "it", "me", "my", "of", "on", "or", "our", "so", "to", "us",
    "we", "were", "will", "would",
    "e.g.", "eg", "etc", "use", "using", "fibonacci",
    "security", "secure", "management", "configuration", "configurations", "best", "practice", "practices",
    "approach", "discussion", "conversation", "summary", "general", "information", "ensure", "focus",
    "implement", "using", "enable", "enabled", "settings", "setup", "system", "server", "data", "access",
    "authentication", "authorization", "encryption", "vulnerability", "vulnerabilities", "patch", "patches",
    "software", "updates", "updated", "restrict", "restriction", "rules"
}

DEFAULT_ALLOWLIST = {
    # protocols / crypto
    "ssh", "https", "http", "tls", "ssl", "smtp", "dns", "tcp", "udp",
    # llm/rag infra
    "rag", "faiss", "llamaindex", "ollama", "openai", "chroma", "bm25", "mmr",
    # common tokens
    "jwt", "oauth", "json", "yaml", "sql"
}

DEFAULT_BLACKLIST = {
    "e.g", "eg",
}


def _default_cfg(cfg: Optional[AnchorConfig]) -> AnchorConfig:
    if cfg is None:
        cfg = AnchorConfig()
    if cfg.stopwords is None:
        object.__setattr__(cfg, "stopwords", DEFAULT_STOPWORDS)
    if cfg.allowlist is None:
        object.__setattr__(cfg, "allowlist", DEFAULT_ALLOWLIST)
    if not hasattr(cfg, "blacklist") or cfg.blacklist is None:
        object.__setattr__(cfg, "blacklist", DEFAULT_BLACKLIST)
    return cfg


def normalize_anchor(s: str) -> str:
    s = s.strip().strip("`'\"")
    s = s.replace("—", "-").replace("–", "-")
    s = s.lower()

    # Normalize whitespace/punct to underscores for multiword-ish tokens
    s = re.sub(r"[\s]+", "_", s)
    s = re.sub(r"[^a-z0-9._:/+-]+", "", s)  # keep path-ish and port-ish chars
    s = re.sub(r"_+", "_", s).strip("_")
    return s


def extract_anchors(text: str, cfg: Optional[AnchorConfig] = None) -> List[str]:
    """
    Deterministic, grep-like anchor extraction.
    Works best on either:
      - raw chunk text, or
      - your rendered retrieval text (TITLE/GOAL/EVENTS/...).

    Returns a ranked list of normalized anchors.
    """
    cfg = _default_cfg(cfg)
    if not text or not text.strip():
        return []

    t = text
    lower = t.lower()
    normalized_text = normalize_anchor(t)

    candidates: Counter[str] = Counter()
    acronyms: Set[str] = set()

    # 1) Code blocks and inline code often contain gold
    code_spans = re.findall(r"`([^`]{1,200})`", t)
    fenced = re.findall(r"```[\s\S]*?```", t)
    code_text = " ".join(code_spans + fenced)

    # 2) Extract "structured" tokens (paths, urls, flags, env vars, ports, dotted versions)
    structured_patterns = [
        r"\b[a-zA-Z]:\\[^ \n\r\t]+",                 # windows paths
        r"(?<![a-zA-Z0-9])/(?:[^ \n\r\t]+/[^ \n\r\t]+)",  # real unix paths (must contain another '/')
        r"\bhttps?://[^ \n\r\t]+",                   # urls
        r"\blocalhost:\d{2,5}\b",                    # localhost:port
        r"\b\d{1,3}(\.\d{1,3}){2,3}\b",              # ip-ish / version-ish
        r"\b\d{2,5}\b",                              # numbers (ports, counts)
        r"\b\d+\s*-\s*\d+\b",                        # ranges
        r"\b[A-Z_]{2,}[A-Z0-9_]*\b",                 # ENV_VARS / CONSTANTS
        r"\b[a-zA-Z_][a-zA-Z0-9_]{2,}\b",            # identifiers
        r"\b[a-zA-Z0-9_-]+\.[a-zA-Z0-9_.-]+\b",      # dotted tokens (files/domains)
        r"\B--[a-zA-Z][a-zA-Z0-9_-]*\b",             # CLI flags
    ]

    for pat in structured_patterns:
        for m in re.findall(pat, t):
            candidates[normalize_anchor(m)] += 2

    # Boost what appears in code
    for pat in structured_patterns:
        for m in re.findall(pat, code_text):
            candidates[normalize_anchor(m)] += 3

    # 3) Acronyms: keep as anchors (normalized to lowercase)
    for m in re.findall(r"\b[A-Z]{2,}\b", t):
        normalized = normalize_anchor(m)
        acronyms.add(normalized)
        candidates[normalized] += 2

    # 4) Allowlist hits: always keep if present
    for term in cfg.allowlist:
        if term in lower:
            candidates[normalize_anchor(term)] += 4

    # 5) Lightweight “keyphrase-ish” extraction (bigrams) from the text
    #    This helps when there are no strong identifiers.
    words = re.findall(r"[a-zA-Z0-9]+", lower)
    # Filter out stopwords for phrase building
    filtered = [w for w in words if w not in cfg.stopwords and len(w) >= cfg.min_len]
    bigrams = ["_".join(pair) for pair in zip(filtered, filtered[1:])]
    for bg in bigrams:
        # Don't overweight; phrases can get noisy
        candidates[normalize_anchor(bg)] += 1

    # 6) Clean + score adjustments
    def has_letters_or_digits(a: str) -> bool:
        return bool(re.search(r"[a-z0-9]", a))

    def is_structured(a: str) -> bool:
        if any(ch.isdigit() for ch in a):
            return True
        return any(ch in a for ch in ("/", ":", ".", "--", "_", "+", "-"))

    def occurrence_count(a: str) -> int:
        if not a:
            return 0
        pattern = r"(?<![a-z0-9])" + re.escape(a) + r"(?![a-z0-9])"
        return len(re.findall(pattern, lower))

    def appears_verbatim(a: str) -> bool:
        if not a:
            return False
        pattern = r"(?<![a-z0-9])" + re.escape(a) + r"(?![a-z0-9])"
        return bool(re.search(pattern, lower))

    def anchor_prefix(a: str) -> str:
        parts = re.split(r"[_:/\.-]+", a)
        return parts[0] if parts else a

    def is_generic(a: str) -> bool:
        if not a:
            return True
        if a in cfg.blacklist:
            return True
        if a in cfg.stopwords:
            return True
        if not has_letters_or_digits(a):
            return True
        # too short (unless allowlisted, acronym-ish, port-ish)
        if len(a) < cfg.min_len and a not in cfg.allowlist:
            return True
        # pure stopword fragments
        if all(part in cfg.stopwords for part in a.split("_")):
            return True
        if not is_structured(a) and a not in cfg.allowlist and a not in acronyms:
            return True
        return False

    cleaned: Counter[str] = Counter()
    for a, score in candidates.items():
        if is_generic(a):
            continue
        if a not in normalized_text:
            continue
        # Prefer "structured" anchors
        if any(ch in a for ch in ("/", ":", ".", "--", "_", "+", "-")):
            score += 2
        if a in acronyms:
            score += 2
        # Prefer configured prefixes
        if any(a.startswith(p) for p in cfg.prefer_prefixes):
            score += 2
        cleaned[a] = score

    anchors = list(cleaned.keys())

    # 7) Drop redundant composites and weak decorated versions
    anchor_set = set(anchors)
    filtered: list[str] = []
    for a in anchors:
        parts = [p for p in a.split("_") if p]
        if len(parts) > 1 and all(part in anchor_set for part in parts):
            if not appears_verbatim(a):
                continue
        if "_" in a and not appears_verbatim(a):
            continue
        filtered.append(a)

    # 8) Coherence filter: cluster-aware gate
    prefix_counts: Counter[str] = Counter(anchor_prefix(a) for a in filtered if a)
    allowlisted = [a for a in filtered if a in cfg.allowlist]
    allowlisted_count = len(allowlisted)
    coherent: list[str] = []
    for a in filtered:
        if a in cfg.allowlist:
            coherent.append(a)
            continue
        if allowlisted_count >= 3:
            if is_structured(a) and appears_verbatim(a) and occurrence_count(a) >= 2:
                coherent.append(a)
            continue
        if prefix_counts.get(anchor_prefix(a), 0) >= 2:
            coherent.append(a)
            continue
        if occurrence_count(a) >= 2:
            coherent.append(a)
            continue

    # 9) Final ranking: score desc, then shorter first (grep-friendly), then alpha
    ranked = sorted(((a, cleaned[a]) for a in coherent), key=lambda x: (-x[1], len(x[0]), x[0]))
    anchors = [a for a, _ in ranked]

    # 10) Cap and return
    return anchors[: cfg.max_anchors]
