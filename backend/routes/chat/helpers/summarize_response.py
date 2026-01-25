from backend.Maia.hood.engine_wrappers.ollama.summarizer import Summarizer


CUSTOM_PROMPT = "Summarize the following response clearly and concisely."


def summarize_response(text: str) -> str:
    summarizer = Summarizer()
    session_id = "summarize-response"
    window_size_tkns = 512
    given_text = f"{CUSTOM_PROMPT}\n\n{text}"

    return summarizer.summarize(
        session_id=session_id,
        window_size_tkns=window_size_tkns,
        given_text=given_text,
    )
