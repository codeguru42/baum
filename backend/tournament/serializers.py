from rest_framework import serializers
from .models import Player, Game


class PlayerSerializer(serializers.ModelSerializer):
    """Serializer for Player model."""
    class Meta:
        model = Player
        fields = ['aga_id', 'name', 'aga_rank', 'age', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class GameSerializer(serializers.ModelSerializer):
    """Serializer for Game model."""
    player1_details = PlayerSerializer(source='player1', read_only=True)
    player2_details = PlayerSerializer(source='player2', read_only=True)

    class Meta:
        model = Game
        fields = [
            'id',
            'player1',
            'player2',
            'player1_details',
            'player2_details',
            'player1_color',
            'player2_color',
            'handicap',
            'rated',
            'winner',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def validate(self, data):
        """Validate game data."""
        if data['player1_color'] == data['player2_color']:
            raise serializers.ValidationError("Players must have different colors.")
        if data['player1'] == data['player2']:
            raise serializers.ValidationError("Player 1 and Player 2 must be different.")
        return data
