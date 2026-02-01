"""Shared fixtures for player tests."""

import pytest

from tournament.player.models import Player


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
def player(db, player_data) -> Player:
    """Create and return a player instance."""
    return Player.objects.create(**player_data)


@pytest.fixture
def api_player(db) -> Player:
    """Create and return a player for API tests."""
    return Player.objects.create(
        aga_id="AGA123",
        name="Test Player",
        aga_rank="1k",
        age=22,
    )
