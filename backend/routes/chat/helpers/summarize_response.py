from backend.Maia.hood.models.ollama.summarizer import Summarizer



def summarize_response(text: str) -> str:
    summarizer = Summarizer()
    given_text = text
    summary = summarizer.summarize_response(
        response=given_text,
    )

    return f"[Compressed] {summary}"
