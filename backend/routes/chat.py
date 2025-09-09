from fastapi import APIRouter
from pydantic import BaseModel

from Maia.hood.engine_wrappers.ollama.wrapper_ollama import OllamaModel
from Maia.hood.engine_wrappers.huggingface.wrapper_huggingface import HuggingFaceModel

from Maia.tools.memory.conversations import (
    save_conversation, 
    load_conversation, 
    set_last_conversation_id, 
    get_last_conversation_id
)
from Maia.tools.tool_handling import (
    receive_tool_request,
)
from Maia.hood.context_engineering.context_window.generate_generic_window import generate_context_window
from Maia.hood.context_engineering.helpers.token_counter import token_counter
from Maia.hood.context_engineering.helpers.add_turn import add_turn
from Maia.helpers._time import time_now
from Maia.helpers._json import try_parse_json


# ===== router and model =====
router = APIRouter()
model = OllamaModel()  # uses your config/model defaults
# model = HuggingFaceModel()


# ===== Schemas =====
class ChatRequest(BaseModel):
    message: str
    session_id: str

class ChatResponse(BaseModel):
    response: str


# ===== Route =====
@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):

    """
    - Conversational memory is stored as session_id.json in maia/backend/memory/short_term/conversations.
    """

    # ----- get session id info and message -----
    last_session_id = get_last_conversation_id()
    current_session_id = req.session_id
    message = req.message
    llm = "maia-llama3:v1"

    # ----- update last_conversation.text with this session id -----
    if current_session_id is not last_session_id:
        set_last_conversation_id( current_session_id )

    # ----- add and save new turn to conversational memory (used in context window) -----
    turns = add_turn( session_id=current_session_id, role="user", content=message )
    # update the json
    save_conversation( session_id=current_session_id, data=turns )

    # ----- generate context window -----
    prompt = generate_context_window( llm=llm, size=8192, session_id=current_session_id )
    print( f"Context Window size: {token_counter( llm=llm, text=prompt )} tokens" )

    # ----- get response -----
    print(prompt)
    print("Getting response...")
    response = { "response": model.chat(prompt=prompt) }

    # ----- check if Maia sent a message or tool request -----
    data, success = try_parse_json( response["response"] )
    print( prompt )

    # ----- if Maia sends a message -----
    if not success:
        print("Sending Maia's reply...")
        # update full conversation with response
        turns = add_turn( session_id=current_session_id, role="assistant", content=response["response"] )
        # save full conversation to conversational memory
        save_conversation( session_id=current_session_id, data=turns )
        # return message
        return response

    # ----- if Maia sends a tool request -----
    if isinstance( data, (dict, list) ):
        print("Processing tool request...")
        # add work summary to conversational history
        record = receive_tool_request( request=data )
        turns = add_turn( session_id=current_session_id, role="assistant", content=record )
        save_conversation( session_id=current_session_id, data=turns )
        # return work summary
        return {"response": record}
