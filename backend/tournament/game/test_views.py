"""Test cases for Game API endpoints."""

import pytest


def test_create_game(client, valid_game_data):
    """Test creating a game via API."""
    response = client.post("/api/games/", json=valid_game_data)
    assert response.status_code == 201, f"Response: {response.json()}"
    
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


def test_list_games(client, game):
    """Test listing all games."""
    response = client.get("/api/games/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["id"] == game.id


def test_list_games_empty(client):
    """Test listing games when there are none."""
    response = client.get("/api/games/")
    assert response.status_code == 200
    assert len(response.json()) == 0


def test_create_game_same_player_validation(client, two_players):
    """Test that API rejects games where both players are the same."""
    player_black, _ = two_players
    game_data = {
        "player_black_id": player_black.aga_id,
        "player_white_id": player_black.aga_id,  # Same player for both
        "handicap": 0,
        "rated": True,
        "winner": "black",
    }
    response = client.post("/api/games/", json=game_data)
    assert response.status_code == 422  # Validation error
    assert "different" in response.text.lower()


@pytest.mark.parametrize(
    "winner,handicap",
    [("black", 0), ("white", 2)],
    ids=["black-wins-even", "white-wins-with-handicap"],
)
def test_create_game_different_winners(client, two_players, winner, handicap):
    """Test creating games with different winner values and handicaps."""
    player_black, player_white = two_players
    game_data = {
        "player_black_id": player_black.aga_id,
        "player_white_id": player_white.aga_id,
        "handicap": handicap,
        "rated": True,
        "winner": winner,
    }
    response = client.post("/api/games/", json=game_data)
    assert response.status_code == 201
    data = response.json()
    assert data["winner"] == winner
    assert data["handicap"] == handicap
