"""Configuration management for the Weather MLOps Pipeline."""

from typing import Optional
from pydantic import BaseModel, Field, validator
from pathlib import Path
import os


class DatabaseSettings(BaseModel):
    """Database configuration settings."""
    
    url: str = Field(default="sqlite:///data/weather.db")
    echo: bool = Field(default=False)
    pool_size: int = Field(default=10)
    max_overflow: int = Field(default=20)
    
    class Config:
        env_prefix = "DB_"


class APISettings(BaseModel):
    """API configuration settings."""
    
    key: str = Field(default="your-api-key-here")
    base_url: str = Field(default="http://api.openweathermap.org/data/2.5/weather")
    zipcode: str = Field(default="02920")
    city: str = Field(default="Cranston")
    state: str = Field(default="RI")
    country: str = Field(default="United States")
    country_code: str = Field(default="US")
    units: str = Field(default="metric")
    max_samples: int = Field(default=100)
    sample_interval: int = Field(default=30)
    
    class Config:
        env_prefix = "API_"


class ModelSettings(BaseModel):
    """Model configuration settings."""
    
    path: str = Field(default="data/models/weather_model.pkl")
    version: str = Field(default="1.0.0")
    algorithm: str = Field(default="linear_regression")
    retrain_interval_hours: int = Field(default=24)
    
    class Config:
        env_prefix = "MODEL_"


class MLflowSettings(BaseModel):
    """MLflow configuration settings."""
    
    tracking_uri: str = Field(default="http://localhost:5000")
    experiment_name: str = Field(default="weather_forecast")
    registry_uri: Optional[str] = Field(default=None)
    
    class Config:
        env_prefix = "MLFLOW_"


class SecuritySettings(BaseModel):
    """Security configuration settings."""
    
    secret_key: str = Field(default="your-secret-key-here")
    algorithm: str = Field(default="HS256")
    access_token_expire_minutes: int = Field(default=30)
    api_key_header: str = Field(default="X-API-Key")
    
    class Config:
        env_prefix = "SECURITY_"


class MonitoringSettings(BaseModel):
    """Monitoring configuration settings."""
    
    prometheus_port: int = Field(default=9090)
    metrics_enabled: bool = Field(default=True)
    log_level: str = Field(default="INFO")
    log_format: str = Field(default="json")
    
    class Config:
        env_prefix = "MONITORING_"


class Settings(BaseModel):
    """Main application settings."""
    
    # Environment
    environment: str = Field(default="development")
    debug: bool = Field(default=False)
    
    # Paths
    base_dir: Path = Field(default=Path(__file__).parent.parent.parent)
    data_dir: Path = Field(default=Path("data"))
    logs_dir: Path = Field(default=Path("logs"))
    
    # Sub-settings
    database: DatabaseSettings = DatabaseSettings()
    api: APISettings = APISettings()
    model: ModelSettings = ModelSettings()
    mlflow: MLflowSettings = MLflowSettings()
    security: SecuritySettings = SecuritySettings()
    monitoring: MonitoringSettings = MonitoringSettings()
    
    @validator("data_dir", "logs_dir", pre=True)
    def create_directories(cls, v):
        """Create directories if they don't exist."""
        if isinstance(v, str):
            v = Path(v)
        v.mkdir(parents=True, exist_ok=True)
        return v
    
    @validator("environment")
    def validate_environment(cls, v):
        """Validate environment setting."""
        allowed = ["development", "staging", "production", "testing"]
        if v not in allowed:
            raise ValueError(f"Environment must be one of {allowed}")
        return v
    
    @property
    def is_production(self) -> bool:
        """Check if running in production."""
        return self.environment == "production"
    
    @property
    def is_development(self) -> bool:
        """Check if running in development."""
        return self.environment == "development"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


# Global settings instance
settings = Settings()


def get_settings() -> Settings:
    """Get the global settings instance."""
    return settings 