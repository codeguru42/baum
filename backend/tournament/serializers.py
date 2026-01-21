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
    player1_name = serializers.CharField(source='player1.name', read_only=True)
    player1_rank = serializers.CharField(source='player1.aga_rank', read_only=True)
    player1_age = serializers.IntegerField(source='player1.age', read_only=True)
    player2_name = serializers.CharField(source='player2.name', read_only=True)
    player2_rank = serializers.CharField(source='player2.aga_rank', read_only=True)
    player2_age = serializers.IntegerField(source='player2.age', read_only=True)

    class Meta:
        model = Game
        fields = [
            'id',
            'player1',
            'player2',
            'player1_details',
            'player2_details',
            'player1_name',
            'player1_rank',
            'player1_age',
            'player2_name',
            'player2_rank',
            'player2_age',
            'player1_color',
            'player2_color',
            'handicap',
            'rated',
            'winner',
            'valid_for_prizes',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def validate(self, attrs):
        """Validate game data."""
        # Only validate colors if they're being updated
        if 'player1_color' in attrs and 'player2_color' in attrs:
            if attrs['player1_color'] == attrs['player2_color']:
                raise serializers.ValidationError("Players must have different colors.")
        
        # Only validate players if they're being updated
        if 'player1' in attrs and 'player2' in attrs:
            if attrs['player1'] == attrs['player2']:
                raise serializers.ValidationError("Player 1 and Player 2 must be different.")
        
        return attrs
