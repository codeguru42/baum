"""Shared fixtures for player tests."""

import pytest

from models import Player


@pytest.fixture
def player_data() -> dict:
    """Standard player data dictionary."""
    return {
        "aga_id": "AGA12345",
        "name": "John Doe",
        "aga_rank": "5d",
        "age": 25,
    }


@pytest.fixture
def player(session, player_data) -> Player:
    """Create and return a player instance."""
    player = Player(**player_data)
    session.add(player)
    session.commit()
    session.refresh(player)
    return player


@pytest.fixture
def api_player(session) -> Player:
    """Create and return a player for API tests."""
    player = Player(
        aga_id="AGA123",
        name="Test Player",
        aga_rank="1k",
        age=22,
    )
    session.add(player)
    session.commit()
    session.refresh(player)
    return player
