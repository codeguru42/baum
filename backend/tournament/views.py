"""
Re-export viewsets from subdirectories for backwards compatibility.

This allows existing code to continue using:
    from tournament.views import PlayerViewSet, GameViewSet

Instead of:
    from tournament.player.views import PlayerViewSet
    from tournament.game.views import GameViewSet
"""

from tournament.game.views import GameViewSet
from tournament.player.views import PlayerViewSet

__all__ = ["PlayerViewSet", "GameViewSet"]
