import pytest
import asyncio

from Maia.hood.context_engineering.RAG.vector_db.FaissWrapper.FaissWrapper import FaissHandler


test_data = [
    "The user was trying to run a pytest but couldn't find their custom Python modules. They were able to resolve this issue by adding the directory containing their modules to the PYTHONPATH environment variable.",
    "The user asked if they could pass a function to generate a parameter to their test functions using pytest fixtures. I explained how to define and use fixtures in pytest.",
    "The user is now working on creating nested API calls and wants to know if they can instantiate another LLaMA model inside their function and use its chat function. I advised them to consider the implications of instantiating multiple models, including memory usage and context switching, and design their code accordingly.",
    "The user planned to implement asynchronous behavior by using asyncio and choosing an asyncio framework. They also wanted to use queues or job queues to manage requests and processing in a more controlled manner."
]

def test_add_vector():
    print(f"\n----- Creating handler instance -----")
    handler = FaissHandler()
    print(f"\n----- Embedding -----")
    success = handler.add_vector(
        data=test_data,
        collection="conversations",
        session_id="12345"
    )

    
    assert success == True