from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from tournament.player.models import Player
from tournament.player.serializers import PlayerSerializer


class PlayerViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Player model.

    Provides complete CRUD operations for tournament players with automatic
    statistics calculation (games played, won, lost).
    """

    queryset = Player.objects.all()
    serializer_class = PlayerSerializer
    lookup_field = "aga_id"

    @extend_schema(
        summary="Lookup player by AGA ID",
        description="Alternative endpoint to retrieve a player by their AGA ID",
        responses={
            200: PlayerSerializer,
            404: OpenApiResponse(description="Player not found"),
        },
    )
    @action(detail=True, methods=["get"], url_path="lookup")
    def lookup_player(self, request, aga_id=None):
        """
        Lookup a player by AGA ID.
        Returns player information if found, 404 otherwise.
        """
        try:
            player = Player.objects.get(aga_id=aga_id)
            serializer = self.get_serializer(player)
            return Response(serializer.data)
        except Player.DoesNotExist:
            return Response(
                {"detail": "Player not found"}, status=status.HTTP_404_NOT_FOUND
            )
