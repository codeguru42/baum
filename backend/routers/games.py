"""Game API router with CRUD operations."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from sqlalchemy.orm import joinedload

from database import get_session
from models import Game, Player
from schemas import GameCreate, GameResponse, GameUpdate, PlayerInGame

router = APIRouter(prefix="/api/games", tags=["games"])


def _game_to_response(game: Game) -> GameResponse:
    """Convert Game model to GameResponse with nested player data."""
    player_black_data = PlayerInGame(
        id=game.player_black.aga_id,
        name=game.player_black.name,
        rank=game.player_black.aga_rank,
        age=game.player_black.age,
        color="black",
    )

    player_white_data = PlayerInGame(
        id=game.player_white.aga_id,
        name=game.player_white.name,
        rank=game.player_white.aga_rank,
        age=game.player_white.age,
        color="white",
    )

    return GameResponse(
        id=game.id,
        player_black=player_black_data,
        player_white=player_white_data,
        handicap=game.handicap,
        rated=game.rated,
        winner=game.winner,
        valid_for_prizes=game.valid_for_prizes,
        created_at=game.created_at,
    )


@router.get("/", response_model=list[GameResponse])
def list_games(session: Session = Depends(get_session)):
    """
    List all games with nested player data.

    Uses join loading for efficient retrieval of player information.
    """
    statement = (
        select(Game)
        .options(
            joinedload(Game.player_black),
            joinedload(Game.player_white),
        )
        .order_by(Game.created_at.desc())
    )
    games = session.exec(statement).all()
    return [_game_to_response(game) for game in games]


@router.post("/", response_model=GameResponse, status_code=status.HTTP_201_CREATED)
def create_game(game_data: GameCreate, session: Session = Depends(get_session)):
    """
    Create a new game result.

    Validates that both players exist and are different.
    Returns the created game with nested player data.
    """
    # Validate players exist
    player_black = session.get(Player, game_data.player_black_id)
    if not player_black:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Player with aga_id '{game_data.player_black_id}' not found",
        )

    player_white = session.get(Player, game_data.player_white_id)
    if not player_white:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Player with aga_id '{game_data.player_white_id}' not found",
        )

    # Create game
    game = Game(
        player_black_id=game_data.player_black_id,
        player_white_id=game_data.player_white_id,
        handicap=game_data.handicap,
        rated=game_data.rated,
        winner=game_data.winner,
        valid_for_prizes=game_data.valid_for_prizes,
    )
    session.add(game)
    session.commit()
    session.refresh(game)

    # Reload with joined player data
    statement = (
        select(Game)
        .where(Game.id == game.id)
        .options(
            joinedload(Game.player_black),
            joinedload(Game.player_white),
        )
    )
    game = session.exec(statement).first()

    return _game_to_response(game)


@router.get("/{game_id}/", response_model=GameResponse)
def get_game(game_id: int, session: Session = Depends(get_session)):
    """
    Retrieve a game by ID with nested player data.

    Uses join loading for efficient player data retrieval.
    """
    statement = (
        select(Game)
        .where(Game.id == game_id)
        .options(
            joinedload(Game.player_black),
            joinedload(Game.player_white),
        )
    )
    game = session.exec(statement).first()

    if not game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Game with id '{game_id}' not found",
        )

    return _game_to_response(game)


@router.patch("/{game_id}/", response_model=GameResponse)
def update_game(
    game_id: int, game_data: GameUpdate, session: Session = Depends(get_session)
):
    """
    Update a game's information.

    Only provided fields will be updated (partial update).
    """
    game = session.get(Game, game_id)
    if not game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Game with id '{game_id}' not found",
        )

    # Update only provided fields
    update_data = game_data.model_dump(exclude_unset=True)

    # Validate players if they're being updated
    if "player_black_id" in update_data:
        player = session.get(Player, update_data["player_black_id"])
        if not player:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Player with aga_id '{update_data['player_black_id']}' not found",
            )
        game.player_black_id = update_data["player_black_id"]

    if "player_white_id" in update_data:
        player = session.get(Player, update_data["player_white_id"])
        if not player:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Player with aga_id '{update_data['player_white_id']}' not found",
            )
        game.player_white_id = update_data["player_white_id"]

    # Validate different players if both are present
    if game.player_black_id == game.player_white_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Black and White players must be different.",
        )

    # Update other fields
    for field in ["handicap", "rated", "winner", "valid_for_prizes"]:
        if field in update_data:
            setattr(game, field, update_data[field])

    session.add(game)
    session.commit()
    session.refresh(game)

    # Reload with joined player data
    statement = (
        select(Game)
        .where(Game.id == game_id)
        .options(
            joinedload(Game.player_black),
            joinedload(Game.player_white),
        )
    )
    game = session.exec(statement).first()

    return _game_to_response(game)


@router.delete("/{game_id}/", status_code=status.HTTP_204_NO_CONTENT)
def delete_game(game_id: int, session: Session = Depends(get_session)):
    """
    Delete a game.

    Returns 204 No Content on success.
    """
    game = session.get(Game, game_id)
    if not game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Game with id '{game_id}' not found",
        )

    session.delete(game)
    session.commit()
    return None
