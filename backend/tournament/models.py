from django.db import models


class Player(models.Model):
    """Model to store player information."""
    aga_id = models.CharField(max_length=20, unique=True, primary_key=True)
    name = models.CharField(max_length=200)
    aga_rank = models.CharField(max_length=10)
    age = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.aga_id})"


class Game(models.Model):
    """Model to store game results."""
    COLOR_CHOICES = [
        ('black', 'Black'),
        ('white', 'White'),
    ]

    WINNER_CHOICES = [
        ('player1', 'Player 1'),
        ('player2', 'Player 2'),
    ]

    player1 = models.ForeignKey(
        Player,
        on_delete=models.CASCADE,
        related_name='games_as_player1'
    )
    player2 = models.ForeignKey(
        Player,
        on_delete=models.CASCADE,
        related_name='games_as_player2'
    )
    player1_color = models.CharField(max_length=5, choices=COLOR_CHOICES)
    player2_color = models.CharField(max_length=5, choices=COLOR_CHOICES)
    handicap = models.IntegerField(default=0)
    rated = models.BooleanField(default=True)
    winner = models.CharField(max_length=10, choices=WINNER_CHOICES)
    valid_for_prizes = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.player1.name} vs {self.player2.name} - {self.created_at.strftime('%Y-%m-%d')}"

    def clean(self):
        """Validate that players have different colors."""
        from django.core.exceptions import ValidationError
        if self.player1_color == self.player2_color:
            raise ValidationError("Players must have different colors.")
        if self.player1 == self.player2:
            raise ValidationError("Player 1 and Player 2 must be different.")
