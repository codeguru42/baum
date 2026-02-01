from rest_framework import serializers

from tournament.game.models import Game
from tournament.player.models import Player


class GameSerializer(serializers.ModelSerializer):
    """Serializer for Game model with nested player objects."""

    # For write operations, accept player IDs and colors
    player1_id = serializers.PrimaryKeyRelatedField(
        queryset=Player.objects.all(), write_only=True, source="player1"
    )
    player2_id = serializers.PrimaryKeyRelatedField(
        queryset=Player.objects.all(), write_only=True, source="player2"
    )

    # For read operations, return nested player objects
    player1 = serializers.SerializerMethodField(read_only=True)
    player2 = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Game
        fields = [
            "id",
            "player1",
            "player2",
            "player1_id",
            "player2_id",
            "player1_color",
            "player2_color",
            "handicap",
            "rated",
            "winner",
            "valid_for_prizes",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]
        extra_kwargs = {
            "player1_color": {"write_only": True},
            "player2_color": {"write_only": True},
        }

    def get_player1(self, obj):
        """Return player1 data with color."""
        return {
            "id": obj.player1.aga_id,
            "name": obj.player1.name,
            "rank": obj.player1.aga_rank,
            "age": obj.player1.age,
            "color": obj.player1_color,
        }

    def get_player2(self, obj):
        """Return player2 data with color."""
        return {
            "id": obj.player2.aga_id,
            "name": obj.player2.name,
            "rank": obj.player2.aga_rank,
            "age": obj.player2.age,
            "color": obj.player2_color,
        }

    def validate(self, attrs):
        """Validate game data."""
        # Only validate colors if they're being updated
        if "player1_color" in attrs and "player2_color" in attrs:
            if attrs["player1_color"] == attrs["player2_color"]:
                raise serializers.ValidationError("Players must have different colors.")

        # Only validate players if they're being updated
        if "player1" in attrs and "player2" in attrs:
            if attrs["player1"] == attrs["player2"]:
                raise serializers.ValidationError(
                    "Player 1 and Player 2 must be different."
                )

        return attrs
