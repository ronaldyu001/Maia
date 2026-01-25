from backend.Maia.hood.context_engineering.context_window.windows.summary_window import (
    generate_summarize_context_window,
)


def test_generate_summarize_context_window():
    session_id = "test-session-001"
    window_size_tkns = 512

    dummy_transcript_short = (
        "User: I met with the vendor yesterday.\n"
        "Assistant: What did you decide?\n"
        "User: We approved the budget and agreed to start next Monday.\n"
        "Assistant: Any open items?\n"
        "User: Need a final contract draft by Friday."
    )

    dummy_transcript_long = (
        "User: Status update on the Q3 launch.\n"
        "Assistant: Engineering completed feature A and B.\n"
        "User: Marketing still needs the final copy.\n"
        "Assistant: We moved the launch date to Aug 15.\n"
        "User: Risks are the delayed vendor assets and QA capacity.\n"
        "Assistant: Action items: get assets by Aug 1, add one QA contractor."
    )

    window_short = generate_summarize_context_window(
        session_id=session_id,
        window_size_tkns=window_size_tkns,
        given_text=dummy_transcript_short,
    )

    window_long = generate_summarize_context_window(
        session_id=session_id,
        window_size_tkns=window_size_tkns,
        given_text=dummy_transcript_long,
    )

    assert "### TASK" in window_short
    assert "### RULES" in window_short
    assert "### CONVERSATIONAL_TRANSCRIPT" in window_short
    assert "approved the budget" in window_short
    assert "### TASK" in window_long
    assert "### RULES" in window_long
    assert "### CONVERSATIONAL_TRANSCRIPT" in window_long
    assert "Q3 launch" in window_long
