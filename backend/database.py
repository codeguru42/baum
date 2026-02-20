"""Database configuration and session management."""

from collections.abc import Generator

from sqlmodel import Session, SQLModel, create_engine

# SQLite database URL
DATABASE_URL = "sqlite:///./db.sqlite3"

# Create engine with connection args for SQLite
engine = create_engine(
    DATABASE_URL,
    echo=False,  # Set to True for SQL query logging
    connect_args={"check_same_thread": False},  # Needed for SQLite
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
