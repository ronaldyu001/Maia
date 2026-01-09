from pydantic import BaseModel, Field
from typing import Optional, List, Literal

from Maia.helpers._time import time_now


class FactsMeta(BaseModel):
    created_at:     str
    updated_at:     str = Field(default_factory=time_now)
    source:         str = Field(default="conversations")

    session_id:     Optional[str]
    topics:         List[str] = Field(default_factory=List)
    projects:       Optional[list[str]]

