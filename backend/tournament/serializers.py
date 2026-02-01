"""
Re-export serializers from subdirectories for backwards compatibility.

This allows existing code to continue using:
    from tournament.serializers import PlayerSerializer, GameSerializer

Instead of:
    from tournament.player.serializers import PlayerSerializer
    from tournament.game.serializers import GameSerializer
"""

from tournament.game.serializers import GameSerializer
from tournament.player.serializers import PlayerSerializer

__all__ = ["PlayerSerializer", "GameSerializer"]
