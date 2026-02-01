from django.contrib import admin

from tournament.player.models import Player


@admin.register(Player)
class PlayerAdmin(admin.ModelAdmin):
    """Admin configuration for Player model."""

    list_display = ["aga_id", "name", "aga_rank", "age", "created_at"]
    search_fields = ["aga_id", "name"]
    list_filter = ["aga_rank"]
