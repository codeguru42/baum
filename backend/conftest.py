"""Root conftest.py with FastAPI test fixtures and configuration."""

from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from database import get_session
from app import app


@pytest.fixture(name="engine")
def engine_fixture():
    """
    Create an in-memory SQLite engine for testing.

    Uses StaticPool to maintain a single connection for the entire test.
    """
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    return engine


@pytest.fixture(name="session")
def session_fixture(engine) -> Generator[Session, None, None]:
    """
    Create a database session for testing.

    Automatically rolls back after each test to ensure isolation.
    """
    with Session(engine) as session:
        yield session


@pytest.fixture(name="client")
def client_fixture(session: Session) -> Generator[TestClient, None, None]:
    """
    Create a TestClient with dependency overrides.

    Overrides the get_session dependency to use the test session.
    """

    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()
