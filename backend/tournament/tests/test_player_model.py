"""Tests for Player model."""

import pytest
from django.db import IntegrityError

from tournament.models import Player


@pytest.mark.django_db
def test_create_player(player_data):
    """Test creating a player with valid data."""
    player = Player.objects.create(**player_data)
    assert player.aga_id == "AGA12345"
    assert player.name == "John Doe"
    assert player.aga_rank == "5d"
    assert player.age == 25


@pytest.mark.django_db
def test_player_string_representation(player):
    """Test player string representation."""
    assert str(player) == "John Doe (AGA12345)"


@pytest.mark.django_db
def test_unique_aga_id_constraint(player_data):
    """Test that AGA ID must be unique."""
    Player.objects.create(**player_data)
    with pytest.raises(IntegrityError):
        Player.objects.create(**player_data)


@pytest.mark.django_db
@pytest.mark.parametrize(
    "aga_id,name,aga_rank,age,expected_str",
    [
        ("AGA001", "Alice", "5d", 30, "Alice (AGA001)"),
        ("AGA002", "Bob", "1k", 25, "Bob (AGA002)"),
        ("AGA003", "Charlie", "10k", 20, "Charlie (AGA003)"),
    ],
    ids=["alice-5d", "bob-1k", "charlie-10k"],
)
def test_player_string_representations(aga_id, name, aga_rank, age, expected_str):
    """Test player string representation with various data."""
    player = Player.objects.create(aga_id=aga_id, name=name, aga_rank=aga_rank, age=age)
    assert str(player) == expected_str
