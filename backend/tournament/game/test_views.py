"""Test cases for Game API endpoints."""

import pytest
from rest_framework import status
from rest_framework.test import APIClient

from tournament.game.models import Game


@pytest.fixture
def api_client():
    """Provide an API client for making HTTP requests."""
    return APIClient()


@pytest.mark.django_db
def test_create_game(api_client, valid_game_data):
    """Test creating a game via API."""
    response = api_client.post("/api/games/", valid_game_data, format="json")
    if response.status_code != status.HTTP_201_CREATED:
        print(f"Response data: {response.json()}")
    assert response.status_code == status.HTTP_201_CREATED
    assert Game.objects.count() == 1

    # Verify nested player structure in response
    data = response.json()
    assert "player_black" in data
    assert "player_white" in data
    assert isinstance(data["player_black"], dict)
    assert isinstance(data["player_white"], dict)
    assert "id" in data["player_black"]
    assert "name" in data["player_black"]
    assert "rank" in data["player_black"]
    assert "age" in data["player_black"]
    assert "color" in data["player_black"]
    assert data["player_black"]["color"] == "black"
    assert data["player_white"]["color"] == "white"


@pytest.mark.django_db
def test_list_games(api_client, game):
    """Test listing all games."""
    response = api_client.get("/api/games/")
    assert response.status_code == status.HTTP_200_OK
    assert len(response.json()) == 1


@pytest.mark.django_db
def test_list_games_empty(api_client):
    """Test listing games when there are none."""
    response = api_client.get("/api/games/")
    assert response.status_code == status.HTTP_200_OK
    assert len(response.json()) == 0


@pytest.mark.django_db
def test_create_game_same_player_validation(api_client, two_players):
    """Test that API rejects games where both players are the same."""
    player_black, _ = two_players
    game_data = {
        "player_black_id": player_black.aga_id,
        "player_white_id": player_black.aga_id,  # Same player for both
        "handicap": 0,
        "rated": True,
        "winner": "black",
    }
    response = api_client.post("/api/games/", game_data, format="json")
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
@pytest.mark.parametrize(
    "winner,handicap",
    [("black", 0), ("white", 2)],
    ids=["black-wins-even", "white-wins-with-handicap"],
)
def test_create_game_different_winners(api_client, two_players, winner, handicap):
    """Test creating games with different winner values and handicaps."""
    player_black, player_white = two_players
    game_data = {
        "player_black_id": player_black.aga_id,
        "player_white_id": player_white.aga_id,
        "handicap": handicap,
        "rated": True,
        "winner": winner,
    }
    response = api_client.post("/api/games/", game_data, format="json")
    assert response.status_code == status.HTTP_201_CREATED
    created_game = Game.objects.first()
    assert created_game.winner == winner
    assert created_game.handicap == handicap
