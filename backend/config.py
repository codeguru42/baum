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
        1. POSTGRES_HOST + components (builds connection string from parts)
        2. SQLite for local development
        
        Environment variables for PostgreSQL (Supabase):
        - POSTGRES_HOST: Database hostname (e.g., db.xxx.supabase.co)
        - POSTGRES_USER: Database user (default: postgres)
        - POSTGRES_PASSWORD: Database password (required)
        - POSTGRES_PORT: Database port (default: 5432)
        - POSTGRES_DB: Database name (default: postgres)
        """
        # Check for component-based PostgreSQL configuration
        postgres_host = os.getenv("POSTGRES_HOST")
        
        if postgres_host:
            # Get other components (with defaults)
            postgres_user = os.getenv("POSTGRES_USER", "postgres")
            postgres_password = os.getenv("POSTGRES_PASSWORD")
            postgres_port = os.getenv("POSTGRES_PORT", "5432")
            postgres_db = os.getenv("POSTGRES_DB", "postgres")
            
            # Validate password is present
            if not postgres_password:
                logger.error("POSTGRES_HOST set but POSTGRES_PASSWORD is missing!")
                raise ValueError("POSTGRES_PASSWORD environment variable is required when using POSTGRES_HOST")
            
            # Build PostgreSQL connection URL from components
            db_url = f"postgresql://{postgres_user}:{postgres_password}@{postgres_host}:{postgres_port}/{postgres_db}"
            
            # Log connection info (with masked password)
            masked_url = f"postgresql://{postgres_user}:***@{postgres_host}:{postgres_port}/{postgres_db}"
            logger.info(f"Using PostgreSQL (component-based): {masked_url}")
            
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
