import json


def try_parse_json( text ):
    """
    - Checks if input is a valid json.
    - Returns: data, success
    """
    try:
        return json.loads(text), True
    except json.JSONDecodeError:
        return None, False
    