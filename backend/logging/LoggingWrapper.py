import logging
import logging.config

# Basic configuration (simple way)
logging.basicConfig(
    level=logging.INFO,                        # Default log level
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler(),               # Print to console
        logging.FileHandler("app.log")         # Also write to file
    ]
)

# Optional: create a logger object for this module
Logger = logging.getLogger(__name__)