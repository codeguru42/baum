from rest_framework import serializers

from tournament.game.models import Game
from tournament.player.models import Player


class GameSerializer(serializers.ModelSerializer):
    """Serializer for Game model with nested player objects."""

    # For write operations, accept player IDs
    player_black_id = serializers.PrimaryKeyRelatedField(
        queryset=Player.objects.all(), write_only=True, source="player_black"
    )
    player_white_id = serializers.PrimaryKeyRelatedField(
        queryset=Player.objects.all(), write_only=True, source="player_white"
    )

    # For read operations, return nested player objects
    player_black = serializers.SerializerMethodField(read_only=True)
    player_white = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Game
        fields = [
            "id",
            "player_black",
            "player_white",
            "player_black_id",
            "player_white_id",
            "handicap",
            "rated",
            "winner",
            "valid_for_prizes",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def get_player_black(self, obj):
        """Return player_black data with color."""
        return {
            "id": obj.player_black.aga_id,
            "name": obj.player_black.name,
            "rank": obj.player_black.aga_rank,
            "age": obj.player_black.age,
            "color": "black",
        }

    def get_player_white(self, obj):
        """Return player_white data with color."""
        return {
            "id": obj.player_white.aga_id,
            "name": obj.player_white.name,
            "rank": obj.player_white.aga_rank,
            "age": obj.player_white.age,
            "color": "white",
        }

    def validate(self, attrs):
        """Validate game data."""
        # Only validate players if they're being updated
        if "player_black" in attrs and "player_white" in attrs:
            if attrs["player_black"] == attrs["player_white"]:
                raise serializers.ValidationError(
                    "Black and White players must be different."
                )

        return attrs
