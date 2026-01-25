import logging
from datetime import datetime
from pathlib import Path

# Build log directory and filename
log_dir = Path("backend/logging/logs")
log_dir.mkdir(parents=True, exist_ok=True)

log_filename = datetime.now().strftime("%Y_%m_%d.log")
log_path = log_dir / log_filename

class MaiaLogFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        base = f"{self.formatTime(record)} [{record.levelname}]: {record.getMessage()}"
        if record.levelno >= logging.ERROR:
            return f"{base} [{record.filename}:{record.lineno}]"
        return base


# Basic configuration
logger_handlers = [
    logging.StreamHandler(),  # Print to console
    logging.FileHandler(log_path),  # Write to dated log file
]
formatter = MaiaLogFormatter()
for handler in logger_handlers:
    handler.setFormatter(formatter)

logging.basicConfig(level=logging.INFO, handlers=logger_handlers)

# Create a logger object for this module
Logger = logging.getLogger(__name__)
