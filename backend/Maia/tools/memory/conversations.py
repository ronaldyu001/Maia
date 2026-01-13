from pathlib import Path
from typing import List
from backend.logs.LoggingWrapper import Logger

from backend.Maia.hood.context_engineering.settings import SHORT_TERM_conversations, LONG_TERM_conversations
from backend.Maia.tools.memory.storage import load_json, save_json
from backend.Maia.helpers._time import time_now
from backend.Maia.tools.file_interaction.copy_file import copy_file



# ===== paths =====
ROOT = Path("backend/memory")
SHORT_TERM = ROOT / "short_term"
CONVERSATIONAL = SHORT_TERM / "conversations"


# ===== Function: load conversational memory =====
def load_conversation( session_id: str ) -> list[dict]:
    """
    Returns
    - list[dict] containing conversation history and metadata.
    - False if unsuccessful

    Arguments
    - 
    """
    Logger.info(f"Loading conversation: list[dict] from {session_id}.json")
    try:
        # ----- look for conversation in longterm and shortterm memory -----
        SHORT_TERM = Path( SHORT_TERM_conversations ) / f"{session_id}.json"
        LONG_TERM = Path( LONG_TERM_conversations ) / f"{session_id}.json"
        
        if SHORT_TERM.exists():
            return load_json( path=SHORT_TERM, default=[] )
        
        elif LONG_TERM.exists():
            return load_json( path=LONG_TERM, default=[] )

        else:
            raise Exception( f"Conversation DNE in short term nor long term memory." )

    except Exception as err:
        Logger.error(repr(err))
        return False
    


# ===== Function: save current conversation =====
def save_conversation( session_id: str, data: List[dict]) -> None:
    """
    saves list of jsons containing conversation history and metadata.
    """
    try:
        if not data:
            return None

        # Load existing conversation
        conversation = load_conversation(session_id=session_id)
        
        # Get last exchange and format it
        last_exchange = data[-1]
        new_message = {
            "role": last_exchange["role"],
            "content": last_exchange["content"],
            "timestamp": time_now()
        }

        # Append new message to conversation list
        if isinstance(conversation, list):
            conversation.append(new_message)
        else:
            conversation = [new_message]

        # Create conversation file path
        _CONVERSATION = Path("backend/memory/raw/short_term/conversations") / f"{session_id}.json"

        # Save updated conversation
        save_successful, error = save_json(
            path=_CONVERSATION,
            default=[],  # Specify expected type as list
            data=conversation
        )
    
    except Exception as err:
        return None


# ===== Function: keep track of last conversation id =====
def set_last_conversation_id( session_id: str ) -> None:
    """
    - Sets last_conversation.text with current conversation's session id.
    """
    # ----- get paths -----
    CONVERSATIONAL = Path( "backend/memory/raw/short_term/conversations" )
    LAST_CONVERSATION_TEXT = CONVERSATIONAL / "last_conversation.text"

    # ----- create current conversation json path -----
    CURRENT_CONVERSATION = f"{session_id}"
    
    save_json( path=LAST_CONVERSATION_TEXT, default="", data=CURRENT_CONVERSATION )


# ===== Function: save current conversation =====
def get_last_conversation_id() -> str:
    """
    - Returns string of last conversation's session id.
    """
    # ---- path for last_conversation.text -----
    LAST_CONVERSATION = Path( "backend/memory/raw/short_term/conversations/last_conversation.text" )

    # ----- load path of last conversation json from last_conversation.text -----
    session_id = load_json( path=LAST_CONVERSATION, default="" )

    return session_id


def format_conversation( conversation: list[dict] ) -> list[dict]:
    """
    Removes the timestamp field from the conversation.
    """
    formatted_conversation = [ {"role":entry["role"], "content":entry["content"] } for entry in conversation ]
    return formatted_conversation


def conversational_to_longterm( session_id: str ) -> bool:
    """
    Saves short term transcript to long term memory.\n
    Returns true if successful.\n
    Does not delete the short term memory.
    """
    CONVERSATION = Path( SHORT_TERM_conversations )
    LONG_TERM = Path( LONG_TERM_conversations )
    
    try:
        # ----- if conversational memory DNE, do nothing -----
        if not CONVERSATION.exists():
            raise Exception( f"{session_id}.json does not exist in short term memory" )

        # ----- move conversation to long term -----
        else:
            if not copy_file( from_path=CONVERSATION, to_path=LONG_TERM ):
                raise Exception( f"failed to move {session_id}.json" )
            
        return True

    except Exception as err:
        return False