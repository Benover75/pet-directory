"""Structured logging configuration for the Weather MLOps Pipeline."""

import logging
import sys
from typing import Any, Dict, Optional
from pathlib import Path
from datetime import datetime
import json
from weather_mlops_pipeline.utils.config import get_settings

settings = get_settings()


class JSONFormatter(logging.Formatter):
    """Custom JSON formatter for structured logging."""
    
    def format(self, record):
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }
        
        # Add exception info if present
        if record.exc_info:
            log_entry["exception"] = self.formatException(record.exc_info)
        
        # Add extra fields
        for key, value in record.__dict__.items():
            if key not in ["name", "msg", "args", "levelname", "levelno", "pathname", 
                          "filename", "module", "lineno", "funcName", "created", 
                          "msecs", "relativeCreated", "thread", "threadName", 
                          "processName", "process", "getMessage", "exc_info", 
                          "exc_text", "stack_info"]:
                log_entry[key] = value
        
        return json.dumps(log_entry)


def setup_logging(
    log_level: Optional[str] = None,
    log_format: Optional[str] = None,
    log_file: Optional[Path] = None
) -> None:
    """Setup structured logging configuration."""
    
    # Use settings if not provided
    log_level = log_level or settings.monitoring.log_level
    log_format = log_format or settings.monitoring.log_format
    
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, log_level.upper()))
    
    # Clear existing handlers
    root_logger.handlers.clear()
    
    # Create console handler
    console_handler = logging.StreamHandler(sys.stdout)
    
    # Set formatter based on format preference
    if log_format == "json":
        console_handler.setFormatter(JSONFormatter())
    else:
        console_handler.setFormatter(
            logging.Formatter(
                "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
            )
        )
    
    root_logger.addHandler(console_handler)
    
    # Add file handler if specified
    if log_file:
        log_file.parent.mkdir(parents=True, exist_ok=True)
        file_handler = logging.FileHandler(log_file)
        file_handler.setFormatter(JSONFormatter())
        root_logger.addHandler(file_handler)


def get_logger(name: str) -> logging.Logger:
    """Get a logger instance."""
    return logging.getLogger(name)


class LoggerMixin:
    """Mixin to add logging capabilities to classes."""
    
    @property
    def logger(self) -> logging.Logger:
        """Get logger for this class."""
        return get_logger(self.__class__.__name__)


def log_function_call(func):
    """Decorator to log function calls with parameters and results."""
    def wrapper(*args, **kwargs):
        logger = get_logger(func.__module__)
        
        # Log function call
        logger.info(
            "function_call",
            extra={
                "function": func.__name__,
                "args": str(args),
                "kwargs": str(kwargs)
            }
        )
        
        try:
            result = func(*args, **kwargs)
            logger.info(
                "function_success",
                extra={
                    "function": func.__name__,
                    "result_type": type(result).__name__
                }
            )
            return result
        except Exception as e:
            logger.error(
                "function_error",
                extra={
                    "function": func.__name__,
                    "error": str(e),
                    "error_type": type(e).__name__
                }
            )
            raise
    
    return wrapper


def log_metrics(metrics: Dict[str, Any], logger_name: str = "metrics") -> None:
    """Log metrics in a structured format."""
    logger = get_logger(logger_name)
    logger.info("metrics", extra=metrics)


# Initialize logging on module import
setup_logging()
