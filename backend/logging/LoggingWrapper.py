import logging
from datetime import datetime
from pathlib import Path

# Build log directory and filename
log_dir = Path("backend/logging/logs")
log_dir.mkdir(parents=True, exist_ok=True)

log_filename = datetime.now().strftime("%Y_%m_%d.log")
log_path = log_dir / log_filename

# Basic configuration
logging.basicConfig(
    level=logging.INFO,  # Default log level
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler(),              # Print to console
        logging.FileHandler(log_path)          # Write to dated log file
    ]
)

# Create a logger object for this module
Logger = logging.getLogger(__name__)