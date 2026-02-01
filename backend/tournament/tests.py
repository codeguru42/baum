import pytest
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Game, Player


@pytest.mark.django_db
class PlayerModelTests(TestCase):
    """Test cases for Player model."""

    def setUp(self):
        """Set up test data."""
        self.player_data = {
            "aga_id": "AGA12345",
            "name": "John Doe",
            "aga_rank": "5d",
            "age": 25,
        }

    def test_create_player(self):
        """Test creating a player."""
        player = Player.objects.create(**self.player_data)
        self.assertEqual(player.aga_id, "AGA12345")
        self.assertEqual(player.name, "John Doe")
        self.assertEqual(player.aga_rank, "5d")
        self.assertEqual(player.age, 25)

    def test_player_string_representation(self):
        """Test player string representation."""
        player = Player.objects.create(**self.player_data)
        self.assertEqual(str(player), "John Doe (AGA12345)")

    def test_unique_aga_id(self):
        """Test that AGA ID must be unique."""
        Player.objects.create(**self.player_data)
        with self.assertRaises(IntegrityError):
            Player.objects.create(**self.player_data)


@pytest.mark.django_db
class GameModelTests(TestCase):
    """Test cases for Game model."""

    def setUp(self):
        """Set up test data."""
        self.player1 = Player.objects.create(
            aga_id="AGA001", name="Alice", aga_rank="3d", age=30
        )
        self.player2 = Player.objects.create(
            aga_id="AGA002", name="Bob", aga_rank="2d", age=28
        )

    def test_create_game(self):
        """Test creating a game."""
        game = Game.objects.create(
            player1=self.player1,
            player2=self.player2,
            player1_color="black",
            player2_color="white",
            handicap=2,
            rated=True,
            winner="player1",
        )
        self.assertEqual(game.player1, self.player1)
        self.assertEqual(game.player2, self.player2)
        self.assertEqual(game.handicap, 2)
        self.assertTrue(game.rated)

    def test_game_validation_same_color(self):
        """Test that players cannot have the same color."""
        game = Game(
            player1=self.player1,
            player2=self.player2,
            player1_color="black",
            player2_color="black",
            handicap=0,
            rated=True,
            winner="player1",
        )
        with self.assertRaises(ValidationError):
            game.clean()

    def test_game_validation_same_player(self):
        """Test that player1 and player2 must be different."""
        game = Game(
            player1=self.player1,
            player2=self.player1,
            player1_color="black",
            player2_color="white",
            handicap=0,
            rated=True,
            winner="player1",
        )
        with self.assertRaises(ValidationError):
            game.clean()


@pytest.mark.django_db
class PlayerAPITests(APITestCase):
    """Test cases for Player API endpoints."""

    def setUp(self):
        """Set up test data."""
        self.player_data = {
            "aga_id": "AGA123",
            "name": "Test Player",
            "aga_rank": "1k",
            "age": 22,
        }
        self.player = Player.objects.create(**self.player_data)

    def test_list_players(self):
        """Test listing all players."""
        response = self.client.get("/api/players/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_create_player(self):
        """Test creating a player via API."""
        new_player = {
            "aga_id": "AGA456",
            "name": "New Player",
            "aga_rank": "2k",
            "age": 24,
        }
        response = self.client.post("/api/players/", new_player, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Player.objects.count(), 2)

    def test_get_player_by_aga_id(self):
        """Test retrieving a player by AGA ID."""
        response = self.client.get(f"/api/players/{self.player.aga_id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Test Player")

    def test_update_player(self):
        """Test updating a player."""
        updated_data = {
            "aga_id": self.player.aga_id,
            "name": "Updated Name",
            "aga_rank": "1d",
            "age": 23,
        }
        response = self.client.put(
            f"/api/players/{self.player.aga_id}/", updated_data, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.player.refresh_from_db()
        self.assertEqual(self.player.name, "Updated Name")

    def test_delete_player(self):
        """Test deleting a player."""
        response = self.client.delete(f"/api/players/{self.player.aga_id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Player.objects.count(), 0)


@pytest.mark.django_db
class GameAPITests(APITestCase):
    """Test cases for Game API endpoints."""

    def setUp(self):
        """Set up test data."""
        self.player1 = Player.objects.create(
            aga_id="AGA100", name="Player One", aga_rank="5d", age=30
        )
        self.player2 = Player.objects.create(
            aga_id="AGA200", name="Player Two", aga_rank="4d", age=28
        )

    def test_create_game(self):
        """Test creating a game via API."""
        game_data = {
            "player1": self.player1.aga_id,
            "player2": self.player2.aga_id,
            "player1_color": "black",
            "player2_color": "white",
            "handicap": 0,
            "rated": True,
            "winner": "player1",
        }
        response = self.client.post("/api/games/", game_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Game.objects.count(), 1)

    def test_list_games(self):
        """Test listing all games."""
        Game.objects.create(
            player1=self.player1,
            player2=self.player2,
            player1_color="black",
            player2_color="white",
            handicap=2,
            rated=True,
            winner="player2",
        )
        response = self.client.get("/api/games/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_create_game_with_same_color(self):
        """Test that API rejects games where players have same color."""
        game_data = {
            "player1": self.player1.aga_id,
            "player2": self.player2.aga_id,
            "player1_color": "black",
            "player2_color": "black",
            "handicap": 0,
            "rated": True,
            "winner": "player1",
        }
        response = self.client.post("/api/games/", game_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_game_with_same_player(self):
        """Test that API rejects games where both players are the same."""
        game_data = {
            "player1": self.player1.aga_id,
            "player2": self.player1.aga_id,
            "player1_color": "black",
            "player2_color": "white",
            "handicap": 0,
            "rated": True,
            "winner": "player1",
        }
        response = self.client.post("/api/games/", game_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
