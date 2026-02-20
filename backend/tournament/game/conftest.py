"""Shared fixtures for game tests."""

import pytest

from models import Game, Player


@pytest.fixture
def two_players(session) -> tuple[Player, Player]:
    """Create and return two player instances."""
    player_black = Player(
        aga_id="AGA001", name="Alice", aga_rank="3d", age=30
    )
    player_white = Player(aga_id="AGA002", name="Bob", aga_rank="2d", age=28)
    session.add(player_black)
    session.add(player_white)
    session.commit()
    session.refresh(player_black)
    session.refresh(player_white)
    return player_black, player_white


@pytest.fixture
def game(session, two_players) -> Game:
    """Create and return a game instance."""
    player_black, player_white = two_players
    game = Game(
        player_black_id=player_black.aga_id,
        player_white_id=player_white.aga_id,
        handicap=2,
        rated=True,
        winner="black",
    )
    session.add(game)
    session.commit()
    session.refresh(game)
    return game


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
