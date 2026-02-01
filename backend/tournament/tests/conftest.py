"""Shared fixtures for tournament tests."""

import pytest

from tournament.models import Game, Player


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


@pytest.fixture
def two_players(db) -> tuple[Player, Player]:
    """Create and return two player instances."""
    player1 = Player.objects.create(
        aga_id="AGA001", name="Alice", aga_rank="3d", age=30
    )
    player2 = Player.objects.create(aga_id="AGA002", name="Bob", aga_rank="2d", age=28)
    return player1, player2


@pytest.fixture
def game(db, two_players) -> Game:
    """Create and return a game instance."""
    player1, player2 = two_players
    return Game.objects.create(
        player1=player1,
        player2=player2,
        player1_color="black",
        player2_color="white",
        handicap=2,
        rated=True,
        winner="player1",
    )


@pytest.fixture
def valid_game_data(two_players) -> dict:
    """Return valid game data for API requests."""
    player1, player2 = two_players
    return {
        "player1": player1.aga_id,
        "player2": player2.aga_id,
        "player1_color": "black",
        "player2_color": "white",
        "handicap": 0,
        "rated": True,
        "winner": "player1",
    }
