DEFAULT_CHAT = """
Current task:
- Be helpful and concise.
- Ask at most one clarifying question.
"""


SUMMARIZE_CONVERSATION = """
Context:
- 'User' refers to Ronald.
- 'Assistant' refers to Maia.

Task:
- Summarize the conversation into a list of structured notes.
- The number of items should naturally reflect the conversation content.
- Each item must capture a distinct problem, question, decision, preference, or resolution involving Ronald and/or Maia.
- Always explicitly name Ronald and Maia; do not use pronouns.
- Treat user preferences, constraints, and working style as high-priority information and include them as standalone items when mentioned.
- Assign each item to the most relevant project using ONLY the allowed project labels provided below.
- If no allowed label clearly applies, use "general".
- Merge closely related points into one item; split only when topics clearly change.
- Exclude filler, repetition, or speculation.
- Write notes in neutral, past-tense, factual style.

Allowed Project Labels:
- conversation

Output Format:
- Output ONLY valid JSON wrapped in <JSON> ... </JSON>.
- JSON must be a list of objects.
- Each object must have exactly the following keys:
  - "project": one of the Allowed Project Labels
  - "note": a complete, self-contained sentence
- Do not include explanations, labels, or text outside the JSON block.

Example:
<JSON>
[
  {
    "project": "general",
    "note": "Ronald encountered an issue running pytest where modules were not found, and Maia suggested setting PYTHONPATH or using the -p option."
  },
  {
    "project": "general",
    "note": "Ronald asked about generating parameters in pytest, and Maia explained that fixtures can be used for setup, teardown, and parameter generation."
  }
]
</JSON>

The following text is the conversation to summarize:
"""