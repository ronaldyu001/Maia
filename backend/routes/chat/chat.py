import re

from fastapi import APIRouter
from pydantic import BaseModel
from backend.logging.LoggingWrapper import Logger

from backend.Maia.hood.models.ollama.wrapper_ollama import OllamaModel
from backend.Maia.hood.models.huggingface.wrapper_huggingface import HuggingFaceModel

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
from backend.Maia.tools.utility._json import try_parse_json
from backend.Maia.hood.context_engineering.context_window.sections.current_conversation import get_current_conversation
from backend.routes.chat.helpers.get_prev_session_id import get_prev_session_id
from backend.routes.chat.helpers.set_prev_session_id import set_prev_session_id
from backend.routes.chat.helpers.embed_remainder_prev_conversation import embed_remainder_prev_conversation
from backend.routes.chat.helpers.summarize_response import summarize_response


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


context_window_size = 2750


#Chat Route
@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):

    #get session id info and message
    current_session_id = req.session_id
    message = req.message

    #if current session id != prev session id, embed the remainder of the previous conversation
    embed_remainder_prev_conversation()

    #add and save new turn to conversational memory (used in context window)
    #create conversation json in memory if DNE
    ensure_conversation_initialized(session_id=current_session_id)

    #add current turn to conversation and update the json
    turns = add_turn( session_id=current_session_id, role="user", content=message )
    save_conversation( session_id=current_session_id, data=turns )

    #generate context window
    prompt = generate_conversation_window(session_id=current_session_id, window_size_tkns=context_window_size, current_conversation=turns)

    #get response
    Logger.info("Requesting model response")
    response = { "response": model.chat(prompt=prompt) }

    #check if Maia sent a message or tool request
    data, success = try_parse_json( response["response"] )

    #if Maia sends a message
    if not success:
        #if response token count > threshold, summarize
        token_threshold = 300
        response_token_count = generic_token_counter(text=response["response"])
        summary_response = response["response"]
        if response_token_count > token_threshold:
            Logger.info(f"Response exceeds token threshold (~{response_token_count} > {token_threshold}), summarizing")
            summary_response = summarize_response(response["response"])
        
        #if response contains any lists, summarize
        list_pattern = re.compile(r"(^|\n)\s*(?:[-*+•]\s+|\d+[.)]\s+)")
        if list_pattern.search(response["response"]):
            Logger.info("List detected in response, summarizing")
            summary_response = summarize_response(response["response"])

        #update full conversation with response
        turns = add_turn( session_id=current_session_id, role="assistant", content=summary_response )
        #save full conversation to conversational memory
        save_conversation( session_id=current_session_id, data=turns )
        #embed buffer if Maia's reply causes window to exceed token limit
        generate_conversation_window(session_id=current_session_id, window_size_tkns=context_window_size, current_conversation=turns)
        #update previous session id
        set_prev_session_id(current_session_id=current_session_id)

        # return message
        return response

    # ----- if Maia sends a tool request -----
    if isinstance( data, (dict, list) ):
        Logger.info("Received tool request, executing")
        # add work summary to conversational history
        record = receive_tool_request( request=data )
        turns = add_turn( session_id=current_session_id, role="assistant", content=record )
        save_conversation( session_id=current_session_id, data=turns )

        # return work summary
        return {"response": record}
