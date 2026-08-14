"""OpsPulse AI Configuration Settings."""
from pathlib import Path
from typing import Literal
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "OpsPulse AI"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: Literal["development", "staging", "production", "test"] = "development"
    DEBUG: bool = True
    
    # Paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    DATA_DIR: Path = BASE_DIR / "data"
    DB_PATH: Path = DATA_DIR / "opspulse.duckdb"
    PARQUET_DIR: Path = DATA_DIR / "raw"
    MODELS_DIR: Path = DATA_DIR / "models"
    
    # Data Volume Settings
    DATA_VOLUME: Literal["small", "medium", "large"] = "small"
    RANDOM_SEED: int = 42
    
    # Database
    DATABASE_URL: str = "duckdb:///" + str(DB_PATH)
    POSTGRES_URL: str = "postgresql://postgres:postgres@localhost:5432/opspulse"
    
    # Kafka Settings
    KAFKA_BOOTSTRAP_SERVERS: str = "localhost:9092"
    KAFKA_TOPIC_ORDERS: str = "opspulse.orders"
    KAFKA_TOPIC_EVENTS: str = "opspulse.delivery_events"
    KAFKA_TOPIC_ANOMALIES: str = "opspulse.anomalies"
    USE_IN_MEMORY_STREAM: bool = True
    
    # LLM Settings
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    LLM_MODEL: str = "gemini-2.5-flash"
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "*"
    ]
    
    # Security & Guardrails
    MAX_SQL_ROWS_RETURNED: int = 200
    QUERY_TIMEOUT_SECONDS: int = 5
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()

# Ensure directories exist
settings.DATA_DIR.mkdir(parents=True, exist_ok=True)
settings.PARQUET_DIR.mkdir(parents=True, exist_ok=True)
settings.MODELS_DIR.mkdir(parents=True, exist_ok=True)
