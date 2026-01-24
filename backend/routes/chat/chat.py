from fastapi import APIRouter
from pydantic import BaseModel
from backend.logging.LoggingWrapper import Logger

from backend.Maia.hood.engine_wrappers.ollama.wrapper_ollama import OllamaModel
from backend.Maia.hood.engine_wrappers.huggingface.wrapper_huggingface import HuggingFaceModel

from backend.Maia.hood.context_engineering.helpers.conversations import (
    save_conversation,
    ensure_conversation_initialized
)

from backend.Maia.tools.tool_handling import (
    receive_tool_request,
)

from backend.Maia.hood.context_engineering.context_window.windows.generate_conversation_window import generate_conversation_window
from backend.Maia.hood.context_engineering.helpers.token_counters import generic_token_counter
from backend.Maia.hood.context_engineering.helpers.add_turn import add_turn
from backend.Maia.tools.utility._time import time_now
from backend.Maia.tools.utility._json import try_parse_json
from backend.Maia.hood.context_engineering.helpers.transcript import create_transcript, trim_transcript


# ===== router and model =====
router = APIRouter()
model = OllamaModel()  # uses config/model defaults
# model = HuggingFaceModel()


# ===== Schemas =====
class ChatRequest(BaseModel):
    message: str
    session_id: str

class ChatResponse(BaseModel):
    response: str


#Chat Route
@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):

    #get session id info and message
    current_session_id = req.session_id
    message = req.message

    #add and save new turn to conversational memory (used in context window)
    #create conversation json in memory if DNE
    Logger.info(f"Initializing conversation with id: {current_session_id}")
    ensure_conversation_initialized(session_id=current_session_id)

    #add current turn to conversation and update the json
    Logger.info("Adding turn to conversation.")
    turns = add_turn( session_id=current_session_id, role="user", content=message )
    Logger.info(f"Saving conversation id: {current_session_id}")
    save_conversation( session_id=current_session_id, data=turns )

    #generate context window
    Logger.info("Generating context window.")
    prompt = generate_conversation_window(session_id=current_session_id, window_size_tkns=8192, current_conversation=turns)
    print( f"Context Window size: {generic_token_counter( text=prompt )} tokens" )

    #get response
    Logger.info("Getting response...")
    response = { "response": model.chat(prompt=prompt) }

    #check if Maia sent a message or tool request
    Logger.info("Checking Maia's reponse.")
    data, success = try_parse_json( response["response"] )

    #if Maia sends a message
    if not success:
        Logger.info("Sending Maia's reply...")
        # update full conversation with response
        turns = add_turn( session_id=current_session_id, role="assistant", content=response["response"] )
        # save full conversation to conversational memory
        save_conversation( session_id=current_session_id, data=turns )

        # return message
        return response

    # ----- if Maia sends a tool request -----
    if isinstance( data, (dict, list) ):
        Logger.info("Processing tool request...")
        # add work summary to conversational history
        record = receive_tool_request( request=data )
        turns = add_turn( session_id=current_session_id, role="assistant", content=record )
        save_conversation( session_id=current_session_id, data=turns )

        # return work summary
        return {"response": record}
