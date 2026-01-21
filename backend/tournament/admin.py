from django.contrib import admin
from .models import Player, Game


@admin.register(Player)
class PlayerAdmin(admin.ModelAdmin):
    """Admin configuration for Player model."""
    list_display = ['aga_id', 'name', 'aga_rank', 'age', 'created_at']
    search_fields = ['aga_id', 'name']
    list_filter = ['aga_rank']


@admin.register(Game)
class GameAdmin(admin.ModelAdmin):
    """Admin configuration for Game model."""
    list_display = ['id', 'player1', 'player2', 'winner', 'handicap', 'rated', 'created_at']
    list_filter = ['rated', 'winner', 'created_at']
    search_fields = ['player1__name', 'player2__name']
    date_hierarchy = 'created_at'
