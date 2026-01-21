from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Player, Game
from .serializers import PlayerSerializer, GameSerializer


class PlayerViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Player model.
    Provides CRUD operations and lookup by AGA ID.
    """
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer
    lookup_field = 'aga_id'

    @action(detail=True, methods=['get'], url_path='lookup')
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
                {'detail': 'Player not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class GameViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Game model.
    Provides CRUD operations for game results.
    """
    queryset = Game.objects.all()
    serializer_class = GameSerializer

    def create(self, request, *args, **kwargs):
        """Create a new game result."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
            headers=headers
        )
