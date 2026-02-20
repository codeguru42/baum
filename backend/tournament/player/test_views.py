"""Test cases for Player API endpoints."""

import pytest


@pytest.mark.parametrize(
    "missing_field",
    ["aga_id", "name", "aga_rank"],
    ids=["missing-aga-id", "missing-name", "missing-rank"],
)
def test_create_player_missing_required_fields(client, missing_field):
    """Test that creating a player with missing required fields fails."""
    complete_data = {
        "aga_id": "AGA999",
        "name": "Test Player",
        "aga_rank": "5k",
        "age": 25,
    }
    # Remove one required field
    incomplete_data = {k: v for k, v in complete_data.items() if k != missing_field}
    response = client.post("/api/players/", json=incomplete_data)
    assert response.status_code == 422  # Unprocessable Entity
    assert missing_field in response.text.lower()


def test_list_players(client, api_player):
    """Test listing all players."""
    response = client.get("/api/players/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["aga_id"] == api_player.aga_id


def test_list_players_empty(client):
    """Test listing players when there are none."""
    response = client.get("/api/players/")
    assert response.status_code == 200
    assert len(response.json()) == 0


def test_create_player(client):
    """Test creating a player via API."""
    new_player = {
        "aga_id": "AGA456",
        "name": "New Player",
        "aga_rank": "2k",
        "age": 24,
    }
    response = client.post("/api/players/", json=new_player)
    assert response.status_code == 201
    data = response.json()
    assert data["aga_id"] == "AGA456"
    assert data["name"] == "New Player"
    assert data["games_played"] == 0
    assert data["games_won"] == 0
    assert data["games_lost"] == 0


def test_get_player_by_aga_id(client, api_player):
    """Test retrieving a player by AGA ID."""
    response = client.get(f"/api/players/{api_player.aga_id}/")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test Player"
    assert data["aga_id"] == api_player.aga_id


def test_update_player(client, api_player):
    """Test updating a player."""
    updated_data = {
        "name": "Updated Name",
        "aga_rank": "1d",
        "age": 23,
    }
    response = client.put(
        f"/api/players/{api_player.aga_id}/", json=updated_data
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Name"
    assert data["aga_rank"] == "1d"
    assert data["age"] == 23


def test_delete_player(client, api_player):
    """Test deleting a player."""
    response = client.delete(f"/api/players/{api_player.aga_id}/")
    assert response.status_code == 204
    
    # Verify player is deleted
    response = client.get(f"/api/players/{api_player.aga_id}/")
    assert response.status_code == 404
