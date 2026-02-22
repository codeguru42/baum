"""Application configuration using Pydantic Settings."""

import logging
from typing import Annotated

from pydantic import Field, computed_field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Configure logging
logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    """Application settings with environment variable support."""

    # API Configuration
    app_name: str = "Baum Tournament Management API"
    app_version: str = "1.0.0"
    debug: bool = False

    # CORS Configuration - comma-separated string that will be parsed
    cors_origins: Annotated[
        str,
        Field(
            default="http://localhost:3000,http://127.0.0.1:3000,http://localhost,http://localhost:80",
            description="Comma-separated list of allowed CORS origins",
        ),
    ]

    # Database Configuration
    postgres_url: Annotated[
        str | None,
        Field(
            default=None,
            description="PostgreSQL connection URL (Supabase connection pooling recommended for serverless)",
        ),
    ]

    # Seeding Configuration
    seed_database: Annotated[
        bool,
        Field(
            default=False,
            description="Whether to seed the database with test data on startup",
        ),
    ]

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: str | list[str]) -> str:
        """
        Parse CORS origins from various formats.

        Accepts:
        - Comma-separated string: "https://app.vercel.app,https://www.example.com"
        - List of strings: ["https://app.vercel.app", "https://www.example.com"]

        Returns comma-separated string for internal storage.
        """
        if isinstance(v, list):
            return ",".join(v)
        return v

    @field_validator("postgres_url", mode="after")
    @classmethod
    def normalize_postgres_url(cls, v: str | None) -> str | None:
        """
        Normalize PostgreSQL connection URL.

        - Converts postgres:// to postgresql:// for SQLAlchemy compatibility
        - Strips query parameters that might cause parsing issues
        - Logs connection info (with masked password)
        """
        if not v:
            return None

        # Convert postgres:// to postgresql://
        if v.startswith("postgres://"):
            v = v.replace("postgres://", "postgresql://", 1)

        # Strip query parameters (e.g., ?sslmode=require)
        if "?" in v:
            v = v.split("?")[0]

        # Log connection type (mask password for security)
        masked_url = cls._mask_db_password(v)
        logger.info(f"Using PostgreSQL connection: {masked_url}")

        return v

    @staticmethod
    def _mask_db_password(url: str) -> str:
        """
        Mask password in database URL for safe logging.

        Example: postgresql://user:password@host/db -> postgresql://user:***@host/db
        """
        try:
            # Find password section between :// and @
            if "://" in url and "@" in url:
                protocol_end = url.index("://") + 3
                host_start = url.index("@", protocol_end)

                # Find password (between : and @)
                credentials = url[protocol_end:host_start]
                if ":" in credentials:
                    user, _ = credentials.split(":", 1)
                    masked = url[:protocol_end] + user + ":***" + url[host_start:]
                    return masked

            # If no password or parsing fails, return first 30 chars
            return url[:30] + "..." if len(url) > 30 else url
        except Exception:
            # If masking fails, show generic message
            return "[database URL - masked for security]"

    @computed_field
    @property
    def cors_origins_list(self) -> list[str]:
        """
        Get CORS origins as a list.

        Parses the comma-separated cors_origins string into a list.
        Strips whitespace from each origin.
        """
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @computed_field
    @property
    def database_url(self) -> str:
        """
        Get database URL with fallback to SQLite.

        Priority order:
        1. POSTGRES_URL (PostgreSQL connection pooling - recommended for serverless)
        2. SQLite for local development (./db.sqlite3)

        Note: Use Supabase Connection Pooling URL for Vercel deployment.
        Format: postgresql://user:pass@aws-0-region.pooler.supabase.com:6543/postgres
        """
        if self.postgres_url:
            return self.postgres_url

        # Default for local development - use SQLite
        logger.info("Using SQLite for local development: ./db.sqlite3")
        return "sqlite:///./db.sqlite3"

    model_config = SettingsConfigDict(
        env_file=".env.local",  # Only for local development
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",  # Ignore extra environment variables
    )


# Global settings instance
settings = Settings()
