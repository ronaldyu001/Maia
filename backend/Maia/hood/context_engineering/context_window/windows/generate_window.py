from typing import List, Tuple, Dict
from backend.logging.LoggingWrapper import Logger



def estimate_tokens(text: str) -> int:
    """
    Rough token estimator.
    Adjust divisor if your model tokenizes differently.
    """
    return max(1, len(text) // 4)


def truncate_to_tokens(text: str, max_tokens: int) -> str:
    """
    Hard truncate text to fit token budget.
    """
    original_tokens = estimate_tokens(text)
    if original_tokens <= max_tokens:
        return text

    Logger.warning(f"[truncate_to_tokens] Content exceeds budget ({original_tokens} > {max_tokens} tokens), truncating")
    # Approximate character cutoff
    max_chars = max_tokens * 4
    truncated = text[:max_chars]

    # Avoid cutting mid-word if possible
    last_space = truncated.rfind(" ")
    if last_space > 0:
        truncated = truncated[:last_space]

    return truncated.rstrip() + "\n\n[TRUNCATED]"



def build_context_window(
    sections: List[Tuple[str, str]],
    ratios: Dict[str, float],
    max_tokens: int,
) -> str:
    """
    Build a context window from ordered sections.

    Args:
        sections: Ordered list of (section_name, section_text).
                  Order = priority (earlier = more important).
        ratios: Dict mapping section_name -> fraction of context window (0.0–1.0).
        max_tokens: Total token budget for the context window.

    Returns:
        A single formatted context string.
    """
    section_names = [name for name, _ in sections]
    Logger.info(f"[build_context_window] Building context window with {len(sections)} sections: {section_names}")
    Logger.info(f"[build_context_window] Token budget: {max_tokens}")

    # --- validate ratios ---
    total_ratio = sum(ratios.get(name, 0.0) for name, _ in sections)
    if total_ratio > 1.0 + 1e-6:
        raise ValueError(f"Ratios sum to {total_ratio:.2f}, must be ≤ 1.0")

    remaining_tokens = max_tokens
    rendered_sections = []

    for name, text in sections:
        ratio = ratios.get(name, 0.0)
        if ratio <= 0.0 or not text.strip():
            Logger.info(f"[build_context_window] Skipping section '{name}' (ratio={ratio:.2f}, empty={not text.strip()})")
            continue

        section_budget = int(max_tokens * ratio)
        section_budget = min(section_budget, remaining_tokens)

        if section_budget <= 0:
            Logger.warning(f"[build_context_window] No budget remaining for section '{name}'")
            continue

        truncated_text = truncate_to_tokens(text.strip(), section_budget)
        used_tokens = estimate_tokens(truncated_text)
        remaining_tokens -= used_tokens

        Logger.info(f"[build_context_window] Section '{name}': allocated {section_budget} tokens, used ~{used_tokens} tokens")
        rendered_sections.append(
            f"### {name}\n{truncated_text}"
        )

    total_used = max_tokens - remaining_tokens
    Logger.info(f"[build_context_window] Context window complete: {len(rendered_sections)} sections, ~{total_used}/{max_tokens} tokens used")

    return "\n\n".join(rendered_sections)