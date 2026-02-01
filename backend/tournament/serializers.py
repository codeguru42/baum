from rest_framework import serializers
from .models import Player, Game


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
    """Serializer for Game model."""

    player1_details = PlayerSerializer(source="player1", read_only=True)
    player2_details = PlayerSerializer(source="player2", read_only=True)
    player1_name = serializers.CharField(source="player1.name", read_only=True)
    player1_rank = serializers.CharField(source="player1.aga_rank", read_only=True)
    player1_age = serializers.IntegerField(source="player1.age", read_only=True)
    player2_name = serializers.CharField(source="player2.name", read_only=True)
    player2_rank = serializers.CharField(source="player2.aga_rank", read_only=True)
    player2_age = serializers.IntegerField(source="player2.age", read_only=True)

    class Meta:
        model = Game
        fields = [
            "id",
            "player1",
            "player2",
            "player1_details",
            "player2_details",
            "player1_name",
            "player1_rank",
            "player1_age",
            "player2_name",
            "player2_rank",
            "player2_age",
            "player1_color",
            "player2_color",
            "handicap",
            "rated",
            "winner",
            "valid_for_prizes",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

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
