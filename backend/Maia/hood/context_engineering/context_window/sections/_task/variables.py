DEFAULT_CHAT = """
Current task: Be helpful and concise. Ask at most one clarifying question.
"""

SUMMARIZE_CONVERSATION = """
Context:
- 'User' is me, Ronald, 'Assistant' is you, Maia.

Task:
- Summarize the conversation in 1–6 items.
- Each item must capture Ronald’s problem/question and/or Maia’s reply/solution.
- Merge related points into one item; only split if topics are clearly distinct.
- Skip filler, repetition, or speculation.
- Use neutral past-tense "notes" style.

Output Format:
- Return ONLY valid JSON inside <JSON> ... </JSON> delimiters.
- JSON must be a list of strings.
- No text, labels, or explanations outside the delimiters.

Example:
<JSON>
[
  "Ronald tried running pytest but modules were not found. Maia suggested setting PYTHONPATH or using the -p option.",
  "Ronald asked about generating parameters in pytest. Maia explained fixtures can be used for setup/teardown and parameter generation."
]
</JSON>

The following text is the conversation to summarize:
"""