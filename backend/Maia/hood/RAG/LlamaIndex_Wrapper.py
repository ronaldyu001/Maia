from llama_index.core import VectorStoreIndex, Document

class LlamaIndex:
    """
    A wrapper class for LlamaIndex.

    PURPOSE:
    This class initialize a vectore store object from Maia's vector store, and abstracts necessary functions
    to dynamically maintain it.
    """
    def __init__(self):
        #
        self.index = VectorStoreIndex()


    def embed(self, text: str, metadata: dict):
        #create document from text and metadata
        document = Document(text=text, extra_info=metadata)

        #insert document into vector store
        self.index.insert(document=document)


