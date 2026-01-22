from backend.Maia.hood.context_engineering.context_window.windows.generate_conversation_window import generate_conversation_window


def test_conversation_context_engineering(session_id: str, window_size_tkns: int = 8000):
    """
    Integration test for conversation context window engineering.

    :param session_id: The session id of the conversation.
    :type session_id: str
    :param window_size_tkns: The size of the context window in tokens.
    :type window_size_tkns: int
    """
    print(f"Generating conversation context window for session: {session_id}")
    print(f"Window size: {window_size_tkns} tokens\n")

    context_window = generate_conversation_window(
        session_id=session_id,
        window_size_tkns=window_size_tkns
    )

    print("=" * 80)
    print("CONTEXT WINDOW OUTPUT")
    print("=" * 80)
    print(context_window)
    print("=" * 80)


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python -m backend.tests.integration.context_engineering.test_conversation_context_engineering <session_id> [window_size_tkns]")
        sys.exit(1)

    session_id = sys.argv[1]
    window_size = int(sys.argv[2]) if len(sys.argv) > 2 else 8000
    test_conversation_context_engineering(session_id=session_id, window_size_tkns=window_size)
