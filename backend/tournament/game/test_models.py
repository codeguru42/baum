"""Tests for Game model."""

import pytest
from django.core.exceptions import ValidationError

from tournament.game.models import Game


@pytest.mark.django_db
def test_create_game(two_players):
    """Test creating a game with valid data."""
    player_black, player_white = two_players
    game = Game.objects.create(
        player_black=player_black,
        player_white=player_white,
        handicap=2,
        rated=True,
        winner="black",
    )
    assert game.player_black == player_black
    assert game.player_white == player_white
    assert game.handicap == 2
    assert game.rated is True
    assert game.winner == "black"


@pytest.mark.django_db
def test_game_validation_same_player(two_players):
    """Test that validation rejects when both players are the same."""
    player_black, _ = two_players
    game = Game(
        player_black=player_black,
        player_white=player_black,  # Invalid: same player
        handicap=0,
        rated=True,
        winner="black",
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
    player_black, player_white = two_players
    game = Game.objects.create(
        player_black=player_black,
        player_white=player_white,
        handicap=handicap,
        rated=True,
        winner="black",
    )
    assert game.handicap == expected
