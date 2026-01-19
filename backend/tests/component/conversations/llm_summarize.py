from backend.Maia.tools.llm_based.summarize import summarize_conversation
from backend.Maia.config import llms


def test_llm_summarize_conversation():

    #session id of conversation to summarize
    session_id = "76c02fc4-5533-4d2d-af03-944ad03d92fb"

    #
    try:
        summary = summarize_conversation(
            session_id=session_id
        )

    except Exception as err:
        raise repr(err)

    print(summary)


test_llm_summarize_conversation()