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
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.aga_id})"
