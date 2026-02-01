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
    created_game = Game.objects.first()
    assert created_game.player1_color == "black"
    assert created_game.player2_color == "white"

    # Verify nested player structure in response
    data = response.json()
    assert "player1" in data
    assert "player2" in data
    assert isinstance(data["player1"], dict)
    assert isinstance(data["player2"], dict)
    assert "id" in data["player1"]
    assert "name" in data["player1"]
    assert "rank" in data["player1"]
    assert "age" in data["player1"]
    assert "color" in data["player1"]
    assert data["player1"]["color"] == "black"
    assert data["player2"]["color"] == "white"


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
@pytest.mark.parametrize(
    "player1_color,player2_color",
    [("black", "black"), ("white", "white")],
    ids=["both-black", "both-white"],
)
def test_create_game_same_color_validation(
    api_client, two_players, player1_color, player2_color
):
    """Test that API rejects games where players have same color."""
    player1, player2 = two_players
    game_data = {
        "player1_id": player1.aga_id,
        "player2_id": player2.aga_id,
        "player1_color": player1_color,
        "player2_color": player2_color,
        "handicap": 0,
        "rated": True,
        "winner": "player1",
    }
    response = api_client.post("/api/games/", game_data, format="json")
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_create_game_same_player_validation(api_client, two_players):
    """Test that API rejects games where both players are the same."""
    player1, _ = two_players
    game_data = {
        "player1_id": player1.aga_id,
        "player2_id": player1.aga_id,  # Same player for both
        "player1_color": "black",
        "player2_color": "white",
        "handicap": 0,
        "rated": True,
        "winner": "player1",
    }
    response = api_client.post("/api/games/", game_data, format="json")
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
@pytest.mark.parametrize(
    "winner,handicap",
    [("player1", 0), ("player2", 2)],
    ids=["player1-wins-even", "player2-wins-with-handicap"],
)
def test_create_game_different_winners(api_client, two_players, winner, handicap):
    """Test creating games with different winner values and handicaps."""
    player1, player2 = two_players
    game_data = {
        "player1_id": player1.aga_id,
        "player2_id": player2.aga_id,
        "player1_color": "black",
        "player2_color": "white",
        "handicap": handicap,
        "rated": True,
        "winner": winner,
    }
    response = api_client.post("/api/games/", game_data, format="json")
    assert response.status_code == status.HTTP_201_CREATED
    created_game = Game.objects.first()
    assert created_game.winner == winner
    assert created_game.handicap == handicap
