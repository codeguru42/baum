from rest_framework import serializers

from tournament.player.models import Player


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
        games_as_black = obj.games_as_player_black.count()
        games_as_white = obj.games_as_player_white.count()
        return games_as_black + games_as_white

    def get_games_won(self, obj):
        """Return number of games won by this player."""
        won_as_black = obj.games_as_player_black.filter(winner="black").count()
        won_as_white = obj.games_as_player_white.filter(winner="white").count()
        return won_as_black + won_as_white

    def get_games_lost(self, obj):
        """Return number of games lost by this player."""
        lost_as_black = obj.games_as_player_black.filter(winner="white").count()
        lost_as_white = obj.games_as_player_white.filter(winner="black").count()
        return lost_as_black + lost_as_white
