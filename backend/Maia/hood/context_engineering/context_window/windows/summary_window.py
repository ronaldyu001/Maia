from backend.Maia.hood.context_engineering.context_window.windows.generate_window import build_context_window
from backend.logging.LoggingWrapper import Logger


section_ratios = {
    "TASK": 0.3,
    "CONVERSATIONAL_TRANSCRIPT": 0.70,
}


TASK = """
Summarize the conversation into a compact memory note optimized for later retrieval.

You MUST return a JSON object with ALL fields listed below.
If a field has no content, return an empty list [].
Do NOT omit any fields.

Assume the reader has not seen the conversation.
Focus on concrete outcomes, intent, and technical details.
Avoid generic advice or textbook explanations.

Return your answer in a single <JSON>...</JSON> block with EXACTLY this structure:

{
  "title": string,
  "goal": string,
  "events": string[],
  "anchors": string[]
}

Field requirements:

- title:
  - Short, specific noun phrase (not a sentence).

- goal:
  - One concise sentence describing the problem, intent, or question addressed in this slice.

- events:
  - 1–5 objective events that occurred in this slice.
  - An event is something that happened or was discussed (e.g., an explanation given, a topic covered, a question asked).
  - Do NOT interpret events as decisions, commitments, or recommendations.
  - Do NOT convert suggestions or best practices into confirmed actions.

- anchors:
  - 5–12 retrieval anchors.
  - Use identifiers, numbers, protocols, ports, acronyms, function names, or concrete technical terms.
  - Prefer tokens someone would type into search.
  - Do NOT include abstract categories or generic words (e.g., "security", "discussion").

Rules:
- Do NOT invent details.
- Do NOT broaden beyond what is explicitly present in this slice.
- Keep language dense and technical.
- Do NOT include explanatory text outside the <JSON> block.
- Do NOT wrap the output in quotations.
"""


CONVERSATIONAL_TRANSCRIPT_INTRO = """
The section below is the text to summarize.
Use it as the sole source of truth for your summary.
"""


def generate_summarize_context_window(
    window_size_tkns: int,
    given_text: str,
) -> str:
    # generate sections for context window
    TASK_SECTION = TASK
    TRANSCRIPT_SECTION = CONVERSATIONAL_TRANSCRIPT_INTRO + given_text

    # create sections dict
    section_names = list(section_ratios.keys())
    section_content = [TASK_SECTION, TRANSCRIPT_SECTION]
    sections = [(str(k), str(v)) for k, v in zip(section_names, section_content)]

    # build context window
    context_window = build_context_window(
        sections=sections,
        ratios=section_ratios,
        max_tokens=window_size_tkns,
    )

    Logger.info(context_window)

    return context_window
