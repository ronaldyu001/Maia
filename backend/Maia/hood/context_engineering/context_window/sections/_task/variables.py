DEFAULT_CHAT = """
Current task: Be helpful and concise. Ask at most one clarifying question.
"""


SUMMARIZE_CONVERSATION = """
Context:
- 'User' refers to Ronald.
- 'Assistant' refers to Maia.

Task:
- Produce a concise summary of the conversation as a list of notes.
- Each note should capture a distinct problem, decision, question, or resolution.
- Combine closely related points into a single note.
- Split notes only when the topic or intent clearly changes.
- Exclude filler, repetition, and casual chatter.
- Write in neutral, past-tense, factual style.

Output Requirements:
- Output ONLY valid JSON wrapped in <JSON> ... </JSON>.
- The JSON must be a list of strings.
- The number of items should naturally reflect the conversation content.
- Do not include explanations, labels, or text outside the JSON block.

The following text is the conversation to summarize:
"""