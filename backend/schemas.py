"""Pydantic schemas for request/response validation and serialization."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, field_validator


# Player Schemas
class PlayerBase(BaseModel):
    """Base schema for player with common fields."""

    name: str
    aga_rank: str
    age: int


class PlayerCreate(PlayerBase):
    """Schema for creating a new player."""

    aga_id: str


class PlayerUpdate(PlayerBase):
    """Schema for updating an existing player."""

    pass


class PlayerResponse(PlayerBase):
    """Schema for player response with computed statistics."""

    aga_id: str
    games_played: int
    games_won: int
    games_lost: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Game Schemas
class PlayerInGame(BaseModel):
    """Nested player schema for game responses."""

    id: str
    name: str
    rank: str
    age: int
    color: str  # "black" or "white"

    model_config = ConfigDict(from_attributes=True)


class GameBase(BaseModel):
    """Base schema for game with common fields."""

    handicap: int = 0
    rated: bool = True
    winner: str
    valid_for_prizes: bool = True

    @field_validator("winner")
    @classmethod
    def validate_winner(cls, v: str) -> str:
        """Validate winner is either 'black' or 'white'."""
        if v not in ["black", "white"]:
            raise ValueError("Winner must be 'black' or 'white'")
        return v


class GameCreate(GameBase):
    """Schema for creating a new game."""

    player_black_id: str
    player_white_id: str

    @field_validator("player_white_id")
    @classmethod
    def validate_different_players(cls, v: str, info) -> str:
        """Validate that black and white players are different."""
        if "player_black_id" in info.data and v == info.data["player_black_id"]:
            raise ValueError("Black and White players must be different.")
        return v


class GameUpdate(GameBase):
    """Schema for updating an existing game."""

    player_black_id: str | None = None
    player_white_id: str | None = None
    handicap: int | None = None
    rated: bool | None = None
    winner: str | None = None
    valid_for_prizes: bool | None = None


class GameResponse(BaseModel):
    """Schema for game response with nested player data."""

    id: int
    player_black: PlayerInGame
    player_white: PlayerInGame
    handicap: int
    rated: bool
    winner: str
    valid_for_prizes: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
