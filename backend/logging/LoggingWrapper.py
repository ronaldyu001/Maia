import logging
from datetime import datetime
from pathlib import Path

# Build log directories and filename
log_root = Path("backend/logging/logs")
general_log_dir = log_root / "general"
embedding_log_dir = log_root / "embedding_history"
context_window_log_dir = log_root / "context_window_history"
rag_log_dir = log_root / "RAG_history"
general_log_dir.mkdir(parents=True, exist_ok=True)
embedding_log_dir.mkdir(parents=True, exist_ok=True)
context_window_log_dir.mkdir(parents=True, exist_ok=True)
rag_log_dir.mkdir(parents=True, exist_ok=True)

log_filename = datetime.now().strftime("%Y_%m_%d.log")
general_log_path = general_log_dir / log_filename
embedding_log_path = embedding_log_dir / log_filename
context_window_log_path = context_window_log_dir / log_filename
rag_log_path = rag_log_dir / log_filename

class MaiaLogFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        if record.levelno >= logging.ERROR:
            caller = f"[{record.module}.{record.funcName}:{record.lineno}]"
        else:
            caller = f"[{record.module}.{record.funcName}]"
        return f"{self.formatTime(record)} [{record.levelname}] {caller}: {record.getMessage()}"


def _configure_logger(name: str, file_path: Path) -> logging.Logger:
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)
    logger.propagate = False

    if not logger.handlers:
        formatter = MaiaLogFormatter()
        for handler in [
            logging.StreamHandler(),
            logging.FileHandler(file_path, mode="a", encoding="utf-8"),
        ]:
            handler.setFormatter(formatter)
            logger.addHandler(handler)
    return logger


Logger = _configure_logger("maia", general_log_path)
Logger_EmbeddingHistory = _configure_logger("maia.embedding_history", embedding_log_path)
Logger_ContextWindowHistory = _configure_logger("maia.context_window_history", context_window_log_path)
Logger_RagHistory = _configure_logger("maia.rag_history", rag_log_path)
