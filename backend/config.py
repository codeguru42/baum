"""Application configuration using Pydantic Settings."""

import os

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings with environment variable support."""

    # API Configuration
    app_name: str = "Baum Tournament Management API"
    app_version: str = "1.0.0"
    debug: bool = False

    # CORS Configuration - support comma-separated env var
    @property
    def cors_origins(self) -> list[str]:
        """
        Get CORS origins from environment variable or use defaults.

        Environment variable CORS_ORIGINS should be comma-separated.
        Example: "https://app.vercel.app,https://www.example.com"
        """
        cors_env = os.getenv("CORS_ORIGINS")
        if cors_env:
            # Split by comma and strip whitespace
            return [origin.strip() for origin in cors_env.split(",") if origin.strip()]

        # Default to localhost for local development
        return [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost",
            "http://localhost:80",
        ]

    # Database Configuration
    database_url: str = "sqlite:///./db.sqlite3"

    model_config = SettingsConfigDict(
        env_file=".env.local",  # Only for local development
        env_file_encoding="utf-8",
        case_sensitive=False,
    )


# Global settings instance
settings = Settings()
