from rest_framework import serializers

from .models import Game, Player


class PlayerSerializer(serializers.ModelSerializer):
    """Serializer for Player model."""

    games_played = serializers.SerializerMethodField()
    games_won = serializers.SerializerMethodField()
    games_lost = serializers.SerializerMethodField()

    class Meta:
        model = Player
        fields = [
            "aga_id",
            "name",
            "aga_rank",
            "age",
            "games_played",
            "games_won",
            "games_lost",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def get_games_played(self, obj):
        """Return total number of games played by this player."""
        games_as_player1 = obj.games_as_player1.count()
        games_as_player2 = obj.games_as_player2.count()
        return games_as_player1 + games_as_player2

    def get_games_won(self, obj):
        """Return number of games won by this player."""
        won_as_player1 = obj.games_as_player1.filter(winner="player1").count()
        won_as_player2 = obj.games_as_player2.filter(winner="player2").count()
        return won_as_player1 + won_as_player2

    def get_games_lost(self, obj):
        """Return number of games lost by this player."""
        lost_as_player1 = obj.games_as_player1.filter(winner="player2").count()
        lost_as_player2 = obj.games_as_player2.filter(winner="player1").count()
        return lost_as_player1 + lost_as_player2


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
