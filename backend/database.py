"""Database configuration and session management."""

from collections.abc import Generator

from sqlmodel import Session, SQLModel, create_engine

from config import settings

# Get database URL from settings (handles PostgreSQL and SQLite)
DATABASE_URL = settings.database_url

# Determine if we're using SQLite
is_sqlite = DATABASE_URL.startswith("sqlite")

# Create engine with appropriate connection args
connect_args = {"check_same_thread": False} if is_sqlite else {}

engine = create_engine(
    DATABASE_URL,
    echo=False,  # Set to True for SQL query logging
    connect_args=connect_args,
    # PostgreSQL connection pool settings (ignored for SQLite)
    pool_pre_ping=True,  # Verify connections before using them
    pool_size=5,  # Number of connections to maintain
    max_overflow=10,  # Additional connections when pool is exhausted
)


def create_db_and_tables():
    """Create all database tables."""
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    """
    Dependency function to get database session.

    Yields a database session and ensures it's closed after use.
    Used with FastAPI's Depends() for dependency injection.
    """
    with Session(engine) as session:
        yield session
