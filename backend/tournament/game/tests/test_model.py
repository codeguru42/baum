"""Tests for Game model."""

import pytest
from django.core.exceptions import ValidationError

from tournament.game.models import Game


@pytest.mark.django_db
def test_create_game(two_players):
    """Test creating a game with valid data."""
    player1, player2 = two_players
    game = Game.objects.create(
        player1=player1,
        player2=player2,
        player1_color="black",
        player2_color="white",
        handicap=2,
        rated=True,
        winner="player1",
    )
    assert game.player1 == player1
    assert game.player2 == player2
    assert game.handicap == 2
    assert game.rated is True
    assert game.winner == "player1"


@pytest.mark.django_db
def test_game_validation_same_color(two_players):
    """Test that validation rejects players with same color."""
    player1, player2 = two_players
    game = Game(
        player1=player1,
        player2=player2,
        player1_color="black",
        player2_color="black",  # Invalid: same color
        handicap=0,
        rated=True,
        winner="player1",
    )
    with pytest.raises(ValidationError):
        game.clean()


@pytest.mark.django_db
def test_game_validation_same_player(two_players):
    """Test that validation rejects when both players are the same."""
    player1, _ = two_players
    game = Game(
        player1=player1,
        player2=player1,  # Invalid: same player
        player1_color="black",
        player2_color="white",
        handicap=0,
        rated=True,
        winner="player1",
    )
    with pytest.raises(ValidationError):
        game.clean()


@pytest.mark.django_db
def test_game_string_representation(game):
    """Test game string representation."""
    result = str(game)
    assert "Alice vs Bob" in result
    assert game.created_at.strftime("%Y-%m-%d") in result


@pytest.mark.django_db
@pytest.mark.parametrize(
    "handicap,expected",
    [
        (0, 0),
        (2, 2),
        (9, 9),
    ],
    ids=["no-handicap", "small-handicap", "large-handicap"],
)
def test_game_handicap_values(two_players, handicap, expected):
    """Test games can be created with various handicap values."""
    player1, player2 = two_players
    game = Game.objects.create(
        player1=player1,
        player2=player2,
        player1_color="black",
        player2_color="white",
        handicap=handicap,
        rated=True,
        winner="player1",
    )
    assert game.handicap == expected
