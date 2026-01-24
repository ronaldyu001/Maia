from fastapi import FastAPI
from backend.Maia.hood.engine_wrappers.ollama.wrapper_ollama import OllamaModel
from backend.routes.chat import chat
from fastapi.middleware.cors import CORSMiddleware
from backend.logging.LoggingWrapper import Logger

# ----- create FastAPI app -----
Logger.log(level=20, msg='Starting backend.')
app = FastAPI()
# model = OllamaModel( model_name=OLLAMA_MODEL_NAME )


# ----- Allow frontend origin(s) -----
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],   # <-- must allow OPTIONS
    allow_headers=["*"],   # <-- allow Content-Type: application/json, etc.
)


# ----- register routes -----
app.include_router( chat.router )


# ----- startup events -----
@app.on_event( event_type="startup" )
async def startup_events():
    """ startup events. """
    print( f"Performing startup events..." )
    OllamaModel()
