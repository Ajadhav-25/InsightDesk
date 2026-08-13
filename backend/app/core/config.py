"""
InsightDesk — Application Configuration
Reads settings from environment variables / .env file.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    database_url: str = "postgresql://insightdesk:insightdesk_dev@localhost:5432/insightdesk"
    allowed_origins: list[str] = ["http://localhost:5173"]


settings = Settings()
