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
    if estimate_tokens(text) <= max_tokens:
        return text

    Logger.warning(msg=f'')
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

    Logger.info(sections)
    Logger.info(ratios)
    Logger.info(max_tokens)
    

    # --- validate ratios ---
    total_ratio = sum(ratios.get(name, 0.0) for name, _ in sections)
    if total_ratio > 1.0 + 1e-6:
        raise ValueError(f"Ratios sum to {total_ratio:.2f}, must be ≤ 1.0")

    remaining_tokens = max_tokens
    rendered_sections = []

    for name, text in sections:
        ratio = ratios.get(name, 0.0)
        if ratio <= 0.0 or not text.strip():
            continue

        section_budget = int(max_tokens * ratio)
        section_budget = min(section_budget, remaining_tokens)

        if section_budget <= 0:
            continue
        
        truncated_text = truncate_to_tokens(text.strip(), section_budget)
        used_tokens = estimate_tokens(truncated_text)
        remaining_tokens -= used_tokens

        rendered_sections.append(
            f"### {name}\n{truncated_text}"
        )

    return "\n\n".join(rendered_sections)