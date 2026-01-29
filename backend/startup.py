from __future__ import annotations

from pathlib import Path
import subprocess
from typing import Optional
import threading

from backend.logging.LoggingWrapper import Logger
from backend.Maia.hood.models.ollama.wrapper_ollama import OllamaModel


RADICALE_CONFIG_PATH = (
    Path(__file__).resolve().parent / "Calendar" / "Radicale" / "Radicale.conf"
)
RADICALE_PYTHON = Path(__file__).resolve().parents[1] / ".venv" / "bin" / "python"
RADICALE_WORKDIR = RADICALE_CONFIG_PATH.parent
_calendar_process: Optional[subprocess.Popen] = None

# --------------- startup progress tracking ---------------
_EVENTS = [
    {"name": "models",   "label": "Loading LLM models"},
    {"name": "calendar", "label": "Starting calendar service"},
]

_progress: dict = {
    "total": len(_EVENTS),
    "completed": 0,
    "events": {e["name"]: {"label": e["label"], "done": False} for e in _EVENTS},
    "finished": False,
}


def get_startup_status() -> dict:
    return _progress


def _mark_done(name: str) -> None:
    _progress["events"][name]["done"] = True
    _progress["completed"] += 1


# --------------- individual startup tasks ---------------
async def start_models() -> None:
    OllamaModel()
    Logger.info("LLM models started.")
    _mark_done("models")


async def start_calendar() -> None:
    global _calendar_process

    if _calendar_process and _calendar_process.poll() is None:
        Logger.info("Radicale already running, skipping start")
        _mark_done("calendar")
        return

    if not RADICALE_CONFIG_PATH.exists():
        Logger.error(f"Radicale config not found at {RADICALE_CONFIG_PATH}")
        _mark_done("calendar")
        return

    try:
        Logger.info(f"Launching Radicale with config: {RADICALE_CONFIG_PATH}")
        command = ["radicale", "--config", str(RADICALE_CONFIG_PATH)]
        if RADICALE_PYTHON.exists():
            command = [str(RADICALE_PYTHON), "-m", "radicale", "--config", str(RADICALE_CONFIG_PATH)]

        _calendar_process = subprocess.Popen(
            command,
            cwd=str(RADICALE_WORKDIR),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )
        Logger.info(f"Radicale process PID: {_calendar_process.pid}")

        def _stream_logs(stream, label: str) -> None:
            if not stream:
                return
            for line in stream:
                line = line.strip()
                if line:
                    Logger.info(f"Radicale {label}: {line}")

        threading.Thread(
            target=_stream_logs, args=(_calendar_process.stdout, "stdout"), daemon=True
        ).start()
        threading.Thread(
            target=_stream_logs, args=(_calendar_process.stderr, "stderr"), daemon=True
        ).start()

        def _check_exit() -> None:
            if _calendar_process and _calendar_process.poll() is not None:
                Logger.error(
                    f"Radicale exited (code {_calendar_process.returncode})"
                )

        threading.Timer(1.0, _check_exit).start()
        Logger.info("Radicale service started")
    except Exception as err:
        Logger.error(f"Failed to start Radicale service: {repr(err)}")

    _mark_done("calendar")


# --------------- orchestrator ---------------
async def run_startup() -> None:
    """Run all startup events sequentially."""
    await start_models()
    await start_calendar()
    _progress["finished"] = True
    Logger.info("All startup events completed.")
