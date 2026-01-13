import json
from pathlib import Path
from typing import List, Dict, Any
from pydantic import BaseModel

from backend.Maia.tools.maia.commit_session import commit_session


# ===== Available Tools for Maia =====
TOOLS = {
    "_commit_session": commit_session
}


# ===== Schemas =====
class SingleRequest( BaseModel ):
    Reason: str
    Tool: str
    Arguments: Dict


# ===== Functions =====
def single_request( request: dict, tools=TOOLS ) -> bool:
    """
    Handles a single tool request.\n
    Returns True if successful.
    """
    try:
        # ----- if a valid tool is requested -----
        if request["tool"] in tools:
            print(f"Found requested tool.")
            result = tools[request["tool"]]( **request["arguments"] )
            return True
            
        # ----- raise error if request not valid -----
        else:
            raise Exception( f"{request['tool']} not a valid tool." )
        
    except Exception as err:
        return False
    

def batch_request( request: List ):
    """
    Handles a batch tool request.
    """
    for task in request:
        pass
    
    return


def summarize_single_request( request: dict ) -> str:
    return f'Tool Summary:\n- Reason: {request["reason"]}\n- Tool: {request["tool"]}\n- Arguments: {request["arguments"]}'


def receive_tool_request( request: Dict|List ) -> str:
    """
    Handles single/batch tool requests from backend.Maia.\n
    Returns
    - Request summary if success.
    - Error if fail.
    """
    try:
        # ----- single request -----
        if isinstance( request, dict ):
            # summarize task
            print("summarizing task...")
            task_summary = f"{summarize_single_request( request=request )}"
            print(f"performing task...")
            if single_request( request=request ):
                return task_summary
            
            else:
                raise Exception(f"Task failed.")
        
        # ----- batch request -----
        if isinstance( request, list ):
            return f"No batch request setup yet, coming soon!"
        

        # ----- raise error if not a list or dict -----
        raise Exception(f"Invalid request type. Expected dict or list, got: {type(request)}")
    
    except Exception as err:
        return f"{type(err).__name__}: {err}"
