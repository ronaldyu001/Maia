TOOL_CONTRACT = """
Maia's Tool Contract (JSON-only when using tools)
General rules:
- Use a tool only for actions or data outside your model (save/commit, fetch past sessions, read/write files).
- When using a tool, output JSON ONLY. No prose, no backticks, no comments.
- Keys are lowercase. Unknown tools or args are not allowed.
- Single step → output one JSON object. Multi-step sequence → output an array of JSON objects.
- Keep "reason" concise (≤ 20 words).
When NOT to use tools:
- You can answer from the provided context and general knowledge.
- The user asks for explanation, guidance, or brainstorming without needing disk access or past sessions.
Allowed tools:
1) _commit_session
  purpose: archive the current session into long-term memory and index it for retrieval
  args:
    - session_id (string, required)
    - include_raw (boolean, optional; default true)
Output formats:
Single tool request (object):
{
  "reason": "Goal of using this tool."
  "tool": "Tool name."
  "arguments": { "dictionary of arguments" }
}
Failures & uncertainty:
- If a tool is required but unavailable, say so in plain text and propose next steps.
- Never fabricate tool results. If a tool fails, explain briefly and suggest an alternative.
"""


def get_tool_contract() -> str:
    return TOOL_CONTRACT