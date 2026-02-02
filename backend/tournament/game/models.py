from django.db import models

from tournament.player.models import Player


class Game(models.Model):
    """Model to store game results."""

    WINNER_CHOICES = [
        ("black", "Black"),
        ("white", "White"),
    ]

    player_black = models.ForeignKey(
        Player, on_delete=models.CASCADE, related_name="games_as_player_black"
    )
    player_white = models.ForeignKey(
        Player, on_delete=models.CASCADE, related_name="games_as_player_white"
    )
    handicap = models.IntegerField(default=0)
    rated = models.BooleanField(default=True)
    winner = models.CharField(max_length=10, choices=WINNER_CHOICES)
    valid_for_prizes = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.player_black.name} vs {self.player_white.name} - {self.created_at.strftime('%Y-%m-%d')}"

    def clean(self):
        """Validate that players are different."""
        from django.core.exceptions import ValidationError

        if self.player_black == self.player_white:
            raise ValidationError("Black and White players must be different.")
