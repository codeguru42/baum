"""Shared fixtures for game tests."""

import pytest

# Import player fixtures that game tests depend on
from tournament.player.conftest import player_data, player  # noqa: F401

from tournament.game.models import Game
from tournament.player.models import Player


@pytest.fixture
def two_players(db) -> tuple[Player, Player]:
    """Create and return two player instances."""
    player_black = Player.objects.create(
        aga_id="AGA001", name="Alice", aga_rank="3d", age=30
    )
    player_white = Player.objects.create(aga_id="AGA002", name="Bob", aga_rank="2d", age=28)
    return player_black, player_white


@pytest.fixture
def game(db, two_players) -> Game:
    """Create and return a game instance."""
    player_black, player_white = two_players
    return Game.objects.create(
        player_black=player_black,
        player_white=player_white,
        handicap=2,
        rated=True,
        winner="black",
    )


@pytest.fixture
def valid_game_data(two_players) -> dict:
    """Return valid game data for API requests."""
    player_black, player_white = two_players
    return {
        "player_black_id": player_black.aga_id,
        "player_white_id": player_white.aga_id,
        "handicap": 0,
        "rated": True,
        "winner": "black",
    }
