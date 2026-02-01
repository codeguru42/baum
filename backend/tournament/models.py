"""
Re-export models from subdirectories for backwards compatibility.

This allows existing code to continue using:
    from tournament.models import Player, Game

Instead of:
    from tournament.player.models import Player
    from tournament.game.models import Game
"""

from tournament.game.models import Game
from tournament.player.models import Player

__all__ = ["Player", "Game"]
