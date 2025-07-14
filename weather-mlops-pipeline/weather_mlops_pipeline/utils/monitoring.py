"""Monitoring and metrics for the Weather MLOps Pipeline."""

from typing import Dict, Any, Optional
from prometheus_client import Counter, Histogram, Gauge, Summary, generate_latest, CONTENT_TYPE_LATEST
from fastapi import Request, Response
import time
from weather_mlops_pipeline.utils.logger import get_logger, log_metrics
from weather_mlops_pipeline.utils.config import get_settings

settings = get_settings()
logger = get_logger(__name__)

# Prometheus metrics
REQUEST_COUNT = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status']
)

REQUEST_LATENCY = Histogram(
    'http_request_duration_seconds',
    'HTTP request latency',
    ['method', 'endpoint']
)

MODEL_PREDICTIONS = Counter(
    'model_predictions_total',
    'Total model predictions',
    ['model_name', 'status']
)

PREDICTION_LATENCY = Histogram(
    'model_prediction_duration_seconds',
    'Model prediction latency',
    ['model_name']
)

DATA_COLLECTION_COUNT = Counter(
    'weather_data_collection_total',
    'Total weather data collections',
    ['status']
)

DATA_COLLECTION_LATENCY = Histogram(
    'weather_data_collection_duration_seconds',
    'Weather data collection latency',
    ['source']
)

ACTIVE_CONNECTIONS = Gauge(
    'active_connections',
    'Number of active connections'
)

DATABASE_SIZE = Gauge(
    'database_size_bytes',
    'Database size in bytes'
)

MODEL_ACCURACY = Gauge(
    'model_accuracy',
    'Model accuracy score',
    ['model_name']
)

WEATHER_TEMPERATURE = Gauge(
    'weather_temperature_celsius',
    'Current weather temperature',
    ['location']
)

WEATHER_HUMIDITY = Gauge(
    'weather_humidity_percent',
    'Current weather humidity',
    ['location']
)


class MetricsMiddleware:
    """FastAPI middleware for collecting HTTP metrics."""
    
    def __init__(self, app):
        self.app = app
    
    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return
        
        start_time = time.time()
        
        # Create a custom send function to capture response
        async def send_wrapper(message):
            if message["type"] == "http.response.start":
                # Record metrics
                duration = time.time() - start_time
                method = scope["method"]
                path = scope["path"]
                status = message["status"]
                
                REQUEST_COUNT.labels(method=method, endpoint=path, status=status).inc()
                REQUEST_LATENCY.labels(method=method, endpoint=path).observe(duration)
                
                logger.info(
                    "http_request",
                    extra={
                        "method": method,
                        "path": path,
                        "status": status,
                        "duration": duration
                    }
                )
            
            await send(message)
        
        await self.app(scope, receive, send_wrapper)


def record_model_prediction(model_name: str, duration: float, success: bool = True):
    """Record model prediction metrics."""
    status = "success" if success else "error"
    MODEL_PREDICTIONS.labels(model_name=model_name, status=status).inc()
    PREDICTION_LATENCY.labels(model_name=model_name).observe(duration)
    
    logger.info(
        "model_prediction",
        extra={
            "model_name": model_name,
            "duration": duration,
            "success": success
        }
    )


def record_data_collection(source: str, duration: float, success: bool = True):
    """Record data collection metrics."""
    status = "success" if success else "error"
    DATA_COLLECTION_COUNT.labels(status=status).inc()
    DATA_COLLECTION_LATENCY.labels(source=source).observe(duration)
    
    logger.info(
        "data_collection",
        extra={
            "source": source,
            "duration": duration,
            "success": success
        }
    )


def update_weather_metrics(location: str, temperature: float, humidity: float):
    """Update weather-related metrics."""
    WEATHER_TEMPERATURE.labels(location=location).set(temperature)
    WEATHER_HUMIDITY.labels(location=location).set(humidity)
    
    logger.info(
        "weather_metrics_updated",
        extra={
            "location": location,
            "temperature": temperature,
            "humidity": humidity
        }
    )


def update_model_accuracy(model_name: str, accuracy: float):
    """Update model accuracy metrics."""
    MODEL_ACCURACY.labels(model_name=model_name).set(accuracy)
    
    logger.info(
        "model_accuracy_updated",
        extra={
            "model_name": model_name,
            "accuracy": accuracy
        }
    )


def update_database_metrics(size_bytes: int):
    """Update database metrics."""
    DATABASE_SIZE.set(size_bytes)
    
    logger.info(
        "database_metrics_updated",
        extra={
            "size_bytes": size_bytes,
            "size_mb": size_bytes / (1024 * 1024)
        }
    )


def get_metrics_response() -> Response:
    """Get Prometheus metrics response."""
    return Response(
        content=generate_latest(),
        media_type=CONTENT_TYPE_LATEST
    )


class HealthChecker:
    """Health check system for the application."""
    
    def __init__(self):
        self.checks = {}
        self.logger = get_logger(__name__)
    
    def register_check(self, name: str, check_func):
        """Register a health check function."""
        self.checks[name] = check_func
    
    async def run_checks(self) -> Dict[str, Any]:
        """Run all health checks."""
        results = {}
        overall_status = "healthy"
        
        for name, check_func in self.checks.items():
            try:
                start_time = time.time()
                result = await check_func()
                duration = time.time() - start_time
                
                results[name] = {
                    "status": "healthy",
                    "duration": duration,
                    "details": result
                }
                
                self.logger.info(
                    "health_check_passed",
                    extra={
                        "check_name": name,
                        "duration": duration
                    }
                )
                
            except Exception as e:
                results[name] = {
                    "status": "unhealthy",
                    "error": str(e),
                    "details": None
                }
                overall_status = "unhealthy"
                
                self.logger.error(
                    "health_check_failed",
                    extra={
                        "check_name": name,
                        "error": str(e)
                    }
                )
        
        return {
            "status": overall_status,
            "timestamp": time.time(),
            "checks": results
        }


# Global health checker instance
health_checker = HealthChecker()


async def check_database_health():
    """Check database connectivity."""
    try:
        from weather_mlops_pipeline.utils.database import get_database_info
        info = get_database_info()
        return {
            "connected": True,
            "records": info['total_records'],
            "size_mb": info['database_size_mb']
        }
    except Exception as e:
        raise Exception(f"Database check failed: {str(e)}")


async def check_model_health():
    """Check model availability."""
    try:
        import os
        from weather_mlops_pipeline.utils.config import get_settings
        settings = get_settings()
        
        if os.path.exists(settings.model.path):
            return {
                "available": True,
                "path": settings.model.path,
                "size_bytes": os.path.getsize(settings.model.path)
            }
        else:
            return {
                "available": False,
                "path": settings.model.path
            }
    except Exception as e:
        raise Exception(f"Model check failed: {str(e)}")


async def check_api_health():
    """Check external API connectivity."""
    try:
        import requests
        from weather_mlops_pipeline.utils.config import get_settings
        settings = get_settings()
        
        # Test API connectivity
        test_url = f"{settings.api.base_url}?zip={settings.api.zipcode},{settings.api.country_code}&appid={settings.api.key}&units=metric"
        response = requests.get(test_url, timeout=10)
        
        if response.status_code == 200:
            return {
                "connected": True,
                "response_time_ms": response.elapsed.total_seconds() * 1000
            }
        else:
            return {
                "connected": False,
                "status_code": response.status_code
            }
    except Exception as e:
        raise Exception(f"API check failed: {str(e)}")


# Register default health checks
health_checker.register_check("database", check_database_health)
health_checker.register_check("model", check_model_health)
health_checker.register_check("api", check_api_health) 