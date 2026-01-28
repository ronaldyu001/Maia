import asyncio

from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from backend.routes.chat import chat
from backend.logging.LoggingWrapper import Logger
from backend.startup import run_startup, get_startup_status

# ----- create FastAPI app -----
Logger.info("Starting backend")
app = FastAPI()


# ----- Allow frontend origin(s) -----
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],   # <-- must allow OPTIONS
    allow_headers=["*"],   # <-- allow Content-Type: application/json, etc.
)


# ----- register routes -----
app.include_router(chat.router)


# ----- startup status endpoint -----
@app.get("/startup/status")
async def startup_status():
    return JSONResponse(content=get_startup_status())


# ----- startup events -----
@app.on_event("startup")
async def on_startup():
    asyncio.create_task(run_startup())