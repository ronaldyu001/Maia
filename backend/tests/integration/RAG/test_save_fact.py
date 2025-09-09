from Maia.hood.context_engineering.RAG.frameworks.LlamaIndexWrapper.LlamaIndex import LlamaIndexWrapper


def test_save_fact():
    Maia_Index = LlamaIndexWrapper(category="facts")
    Maia_Index.save_fact(text="I started lifting at 16 years old.", persist=True)
    return