from django.contrib import admin

from tournament.game.models import Game


@admin.register(Game)
class GameAdmin(admin.ModelAdmin):
    """Admin configuration for Game model."""

    list_display = [
        "id",
        "player1",
        "player2",
        "winner",
        "handicap",
        "rated",
        "created_at",
    ]
    list_filter = ["rated", "winner", "created_at"]
    search_fields = ["player1__name", "player2__name"]
    date_hierarchy = "created_at"
