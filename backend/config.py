"""Application configuration using Pydantic Settings."""

import logging
import os

from pydantic_settings import BaseSettings, SettingsConfigDict

# Configure logging
logger = logging.getLogger(__name__)


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
    @property
    def database_url(self) -> str:
        """
        Get database URL from environment or use defaults.
        
        Priority order:
        1. POSTGRES_URL (Supabase connection pooling - recommended for serverless)
        2. DATABASE_URL (fallback for other PostgreSQL providers)
        3. SQLite for local development
        
        Note: PostgreSQL URLs using 'postgres://' scheme are automatically
        converted to 'postgresql://' for SQLAlchemy compatibility.
        """
        # Try Supabase connection pooling URL first (best for serverless)
        postgres_url = os.getenv("POSTGRES_URL")
        
        if postgres_url:
            # Convert postgres:// to postgresql:// for SQLAlchemy compatibility
            if postgres_url.startswith("postgres://"):
                postgres_url = postgres_url.replace("postgres://", "postgresql://", 1)
            
            # Log connection type (mask password for security)
            masked_url = self._mask_db_password(postgres_url)
            logger.info(f"Using Supabase connection pooling: {masked_url}")
            return postgres_url
        
        # Fallback to generic DATABASE_URL for other providers
        db_url = os.getenv("DATABASE_URL")
        if db_url:
            # Convert postgres:// to postgresql:// for SQLAlchemy compatibility
            if db_url.startswith("postgres://"):
                db_url = db_url.replace("postgres://", "postgresql://", 1)
            
            # Log connection type (mask password for security)
            masked_url = self._mask_db_password(db_url)
            logger.info(f"Using DATABASE_URL: {masked_url}")
            return db_url
        
        # Default for local development - use SQLite
        logger.info("Using SQLite for local development: ./db.sqlite3")
        return "sqlite:///./db.sqlite3"

    def _mask_db_password(self, url: str) -> str:
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
                    user, password = credentials.split(":", 1)
                    masked = url[:protocol_end] + user + ":***" + url[host_start:]
                    return masked
            
            # If no password or parsing fails, return first 30 chars
            return url[:30] + "..." if len(url) > 30 else url
        except Exception:
            # If masking fails, show generic message
            return "[database URL - masked for security]"

    model_config = SettingsConfigDict(
        env_file=".env.local",  # Only for local development
        env_file_encoding="utf-8",
        case_sensitive=False,
    )


# Global settings instance
settings = Settings()
