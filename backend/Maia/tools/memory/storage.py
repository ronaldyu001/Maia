import json
from pathlib import Path
from typing import Any, Tuple


"""
This file:
- Contains low level helper functions.
- Interacts directly with jsons.
"""


# ===== load json =====
def load_json( path: Path, default: Any ) -> list[dict] | dict:

    """
    Loads data from the given path.\n
    Only works on an existing path.\n
    Data must match given default type.\n

    Arguments
    - path: path to file
    - default: expected data type returned (should be {} or [])\n

    Returns
    - Data or Default
    """

    try:
        # --- if file path DNE, create parent dirs, return default ---
        if not path.exists():
            path.parent.mkdir(parents=True, exist_ok=True)
            return default

        if path.is_dir():
            return default
        
        # --- get text from json ---
        text = path.read_text(encoding="utf-8").strip()

        # --- if text is empty, return with error msg ---
        if not text:
            raise Exception(f"Path '{path}' is empty.")
        
        # --- load data from text ---
        data = json.loads(text)

        # --- if the data has a type mismatch, return default ---
        if not isinstance( data, type(default) ):
            return default
            
        return data
    
    except Exception as err:
        return default
    

# ===== save to json function =====
def save_json( path: Path, default: Any, data: Any ) -> Tuple[ bool, str|None ]:

    """
    Adds given data to given file path.\n
    Creates the path if DNE.\n

    Arguments
    - path: path to file
    - data: data to save

    Returns
    Tuple: (bool, error)
    - bool: True if save is successful, False otherwise
    - error: None if no error
    """
    
    try:
        # --- if the data has a type mismatch, return with error msg ---
        if type( data ) is not type( default ):
            raise Exception(
                f"Type mismatch for '{path}': expected {type(default).__name__}, "
                f"got {type(data).__name__}"
            )

        # --- create parent dirs if DNE ---
        path.parent.mkdir(parents=True, exist_ok=True)
        if path.exists() and path.is_dir():
            raise Exception(f"Path '{path}' is a directory, expected a file")
        path.touch(exist_ok=True)
        temp = path.with_suffix(path.suffix + ".tmp") # create temp file to write data

        # --- write to json ---
        temp.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
        temp.replace(path)  # overwrite actual path with temp data

        return True, None
    
    except Exception as e:
        print(e)
        return False, f"{type(e).__name__}: {e}"
