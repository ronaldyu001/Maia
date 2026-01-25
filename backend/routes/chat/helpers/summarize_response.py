from backend.Maia.hood.engine_wrappers.ollama.summarizer import Summarizer


CUSTOM_PROMPT = """
You are compressing an ASSISTANT response for storage in a conversation transcript.

Write a neutral recap of what Maia explained.
Do NOT add new advice, steps, or recommendations.
Do NOT use imperative verbs (e.g., "do", "configure", "use", "implement").
Prefer phrasing like "Maia explained..." or "Maia discussed...".

Return 1–2 sentences, max 80 tokens.
Only include concrete technical terms, identifiers, protocols, numbers, or file/function names that appeared in the original.
"""


def summarize_response(text: str) -> str:
    summarizer = Summarizer()
    given_text = f"{CUSTOM_PROMPT}\n\n{text}"
    summary = summarizer.summarize_response(
        given_text=given_text,
    )

    return f"[Compressed] {summary}"
