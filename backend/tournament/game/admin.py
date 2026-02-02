from django.contrib import admin

from tournament.game.models import Game


@admin.register(Game)
class GameAdmin(admin.ModelAdmin):
    """Admin configuration for Game model."""

    list_display = [
        "id",
        "player_black",
        "player_white",
        "winner",
        "handicap",
        "rated",
        "created_at",
    ]
    list_filter = ["rated", "winner", "created_at"]
    search_fields = ["player_black__name", "player_white__name"]
    date_hierarchy = "created_at"
