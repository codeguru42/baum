"""Test cases for Player API endpoints."""

import pytest
from rest_framework import status
from rest_framework.test import APIClient

from tournament.player.models import Player


@pytest.fixture
def api_client():
    """Provide an API client for making HTTP requests."""
    return APIClient()


@pytest.mark.django_db
def test_list_players(api_client, api_player):
    """Test listing all players."""
    response = api_client.get("/api/players/")
    assert response.status_code == status.HTTP_200_OK
    assert len(response.json()) == 1


@pytest.mark.django_db
def test_list_players_empty(api_client):
    """Test listing players when there are none."""
    response = api_client.get("/api/players/")
    assert response.status_code == status.HTTP_200_OK
    assert len(response.json()) == 0


@pytest.mark.django_db
def test_create_player(api_client):
    """Test creating a player via API."""
    new_player = {
        "aga_id": "AGA456",
        "name": "New Player",
        "aga_rank": "2k",
        "age": 24,
    }
    response = api_client.post("/api/players/", new_player, format="json")
    assert response.status_code == status.HTTP_201_CREATED
    assert Player.objects.count() == 1
    assert Player.objects.get(aga_id="AGA456").name == "New Player"


@pytest.mark.django_db
def test_get_player_by_aga_id(api_client, api_player):
    """Test retrieving a player by AGA ID."""
    response = api_client.get(f"/api/players/{api_player.aga_id}/")
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["name"] == "Test Player"


@pytest.mark.django_db
def test_update_player(api_client, api_player):
    """Test updating a player."""
    updated_data = {
        "aga_id": api_player.aga_id,
        "name": "Updated Name",
        "aga_rank": "1d",
        "age": 23,
    }
    response = api_client.put(
        f"/api/players/{api_player.aga_id}/", updated_data, format="json"
    )
    assert response.status_code == status.HTTP_200_OK
    api_player.refresh_from_db()
    assert api_player.name == "Updated Name"
    assert api_player.aga_rank == "1d"


@pytest.mark.django_db
def test_delete_player(api_client, api_player):
    """Test deleting a player."""
    response = api_client.delete(f"/api/players/{api_player.aga_id}/")
    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert Player.objects.count() == 0


@pytest.mark.django_db
@pytest.mark.parametrize(
    "missing_field",
    ["aga_id", "name", "aga_rank"],
    ids=["missing-aga-id", "missing-name", "missing-rank"],
)
def test_create_player_missing_required_fields(api_client, missing_field):
    """Test that creating a player with missing required fields fails."""
    complete_data = {
        "aga_id": "AGA999",
        "name": "Test Player",
        "aga_rank": "5k",
        "age": 25,
    }
    # Remove one required field
    incomplete_data = {k: v for k, v in complete_data.items() if k != missing_field}
    response = api_client.post("/api/players/", incomplete_data, format="json")
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert missing_field in response.json()
