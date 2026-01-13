from pathlib import Path
from typing import List
from backend.logging.LoggingWrapper import Logger

from backend.Maia.hood.context_engineering.settings import SHORT_TERM_conversations, LONG_TERM_conversations
from backend.Maia.tools.memory.storage import load_json, save_json
from backend.Maia.tools.utility._time import time_now
from backend.Maia.tools.file_interaction.copy_file import copy_file



# ===== paths =====
CONVERSATIONS = "backend/Maia/memories/conversations"


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
        # ----- look for conversation in memory -----
        conversation_json = Path( CONVERSATIONS ) / f"{session_id}.json"
        
        if conversation_json.exists():
            return load_json( path=conversation_json, default=[] )

        else:
            raise Exception( f"Conversation DNE in short term nor long term memory." )

    except Exception as err:
        Logger.error(repr(err))
        return False
    


# ===== Function: save current conversation =====
def save_conversation(session_id: str, data: List[dict]) -> None:
    """
    Appends the latest turn in `data` to the session conversation file.

    - If the session file doesn't exist, it creates a new one.
    - Expects `data` to be a list of turns; only the last element is appended.
    """

    if not session_id:
        raise ValueError("session_id is required")

    # If caller passes empty data, there's nothing to append.
    # (don't treat this as an error.)
    if not data:
        return

    # Build path and ensure directory exists
    convo_dir = Path("backend/Maia/memories/conversations")
    convo_dir.mkdir(parents=True, exist_ok=True)
    convo_path = convo_dir / f"{session_id}.json"

    # Load existing conversation safely
    conversation: List[dict]
    try:
        conversation = load_conversation(session_id=session_id)
        if not isinstance(conversation, list):
            conversation = []
    except FileNotFoundError:
        conversation = []
    except Exception as err:
        # If file is corrupt/unreadable, reset to empty rather than crash
        conversation = []
        try:
            Logger.log(f"[save_conversation] load_conversation failed; resetting. err={err}")
        except Exception:
            pass

    # Append last message
    last_exchange = data[-1] if data else None

    if isinstance(last_exchange, dict):
        role = last_exchange.get("role")
        content = last_exchange.get("content")

        # Only append valid turns
        if isinstance(role, str) and role and isinstance(content, str) and content:
            new_message = {
                "role": role,
                "content": content,
                "timestamp": time_now(),
            }
            conversation.append(new_message)
        else:
            # Invalid / incomplete turn — skip silently
            Logger.info(
                f"[save_conversation] Skipping invalid turn: role={role}, content={content}"
            )
    else:
        Logger.info("[save_conversation] No valid last exchange to append")

    # Save updated conversation
    save_successful, error = save_json(
        path=convo_path,
        default=[],
        data=conversation
    )

    if not save_successful:
        # Don't silently swallow this — it will make debugging impossible
        Logger.log(f"Failed to save conversation: {error}")


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
    

def ensure_conversation_initialized(session_id: str) -> list:
    """
    Loads conversation if it exists; otherwise creates an empty conversation and returns it.
    """
    try:
        data = load_conversation(session_id=session_id)
        # normalize: if load returns None, treat as empty
        if not data:
            data = []
    except FileNotFoundError:
        data = []
        save_conversation(session_id=session_id, data=data)
    except Exception:
        # If the file exists but is corrupted/unreadable, fail soft by resetting
        data = []
        save_conversation(session_id=session_id, data=data)

    return data