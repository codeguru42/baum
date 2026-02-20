"""Player API router with CRUD operations."""

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from sqlalchemy.orm import selectinload

from database import get_session
from models import Player
from schemas import PlayerCreate, PlayerResponse, PlayerUpdate

router = APIRouter(prefix="/api/players", tags=["players"])


def _compute_player_statistics(player: Player) -> dict:
    """Compute player statistics from game relationships."""
    games_as_black = player.games_as_player_black
    games_as_white = player.games_as_player_white

    games_played = len(games_as_black) + len(games_as_white)

    games_won = sum(1 for g in games_as_black if g.winner == "black") + sum(
        1 for g in games_as_white if g.winner == "white"
    )

    games_lost = sum(1 for g in games_as_black if g.winner == "white") + sum(
        1 for g in games_as_white if g.winner == "black"
    )

    return {
        "games_played": games_played,
        "games_won": games_won,
        "games_lost": games_lost,
    }


def _player_to_response(player: Player) -> PlayerResponse:
    """Convert Player model to PlayerResponse with computed statistics."""
    stats = _compute_player_statistics(player)
    return PlayerResponse(
        aga_id=player.aga_id,
        name=player.name,
        aga_rank=player.aga_rank,
        age=player.age,
        games_played=stats["games_played"],
        games_won=stats["games_won"],
        games_lost=stats["games_lost"],
        created_at=player.created_at,
        updated_at=player.updated_at,
    )


@router.get("/", response_model=list[PlayerResponse])
def list_players(session: Session = Depends(get_session)):
    """
    List all players with computed statistics.

    Uses eager loading of game relationships for efficient statistics computation.
    """
    statement = (
        select(Player)
        .options(
            selectinload(Player.games_as_player_black),
            selectinload(Player.games_as_player_white),
        )
        .order_by(Player.name)
    )
    players = session.exec(statement).all()
    return [_player_to_response(player) for player in players]


@router.post("/", response_model=PlayerResponse, status_code=status.HTTP_201_CREATED)
def create_player(player_data: PlayerCreate, session: Session = Depends(get_session)):
    """
    Create a new player.

    Returns the created player with initial statistics (all zeros).
    """
    # Check if player already exists
    existing = session.get(Player, player_data.aga_id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Player with aga_id '{player_data.aga_id}' already exists",
        )

    player = Player(
        aga_id=player_data.aga_id,
        name=player_data.name,
        aga_rank=player_data.aga_rank,
        age=player_data.age,
    )
    session.add(player)
    session.commit()
    session.refresh(player)

    return _player_to_response(player)


@router.get("/{aga_id}/", response_model=PlayerResponse)
def get_player(aga_id: str, session: Session = Depends(get_session)):
    """
    Retrieve a player by AGA ID with computed statistics.

    Uses eager loading for efficient statistics computation.
    """
    statement = (
        select(Player)
        .where(Player.aga_id == aga_id)
        .options(
            selectinload(Player.games_as_player_black),
            selectinload(Player.games_as_player_white),
        )
    )
    player = session.exec(statement).first()

    if not player:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Player with aga_id '{aga_id}' not found",
        )

    return _player_to_response(player)


@router.put("/{aga_id}/", response_model=PlayerResponse)
def update_player(
    aga_id: str, player_data: PlayerUpdate, session: Session = Depends(get_session)
):
    """
    Update a player's information (full update).

    All fields must be provided.
    """
    player = session.get(Player, aga_id)
    if not player:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Player with aga_id '{aga_id}' not found",
        )

    player.name = player_data.name
    player.aga_rank = player_data.aga_rank
    player.age = player_data.age
    player.updated_at = datetime.utcnow()

    session.add(player)
    session.commit()
    session.refresh(player)

    # Reload with relationships for statistics
    statement = (
        select(Player)
        .where(Player.aga_id == aga_id)
        .options(
            selectinload(Player.games_as_player_black),
            selectinload(Player.games_as_player_white),
        )
    )
    player = session.exec(statement).first()

    return _player_to_response(player)


@router.delete("/{aga_id}/", status_code=status.HTTP_204_NO_CONTENT)
def delete_player(aga_id: str, session: Session = Depends(get_session)):
    """
    Delete a player.

    Returns 204 No Content on success.
    """
    player = session.get(Player, aga_id)
    if not player:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Player with aga_id '{aga_id}' not found",
        )

    session.delete(player)
    session.commit()
    return None


@router.get("/{aga_id}/lookup/", response_model=PlayerResponse)
def lookup_player(aga_id: str, session: Session = Depends(get_session)):
    """
    Lookup a player by AGA ID (alternative endpoint).

    This endpoint provides the same functionality as GET /{aga_id}/
    but at a different path for backward compatibility.
    """
    return get_player(aga_id, session)
