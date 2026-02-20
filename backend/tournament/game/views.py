from drf_spectacular.utils import extend_schema
from rest_framework import status, viewsets
from rest_framework.response import Response

from tournament.game.models import Game
from tournament.game.serializers import GameSerializer


class GameViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Game model.

    Provides CRUD operations for recording and managing game results between
    two players. Validates that players are different.
    """

    queryset = Game.objects.all()
    serializer_class = GameSerializer

    @extend_schema(
        summary="Create a new game result",
        description="Record the result of a completed game between two players",
    )
    def create(self, request, *args, **kwargs):
        """Create a new game result."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )
