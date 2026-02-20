"""SQLModel database models for tournament management."""

from datetime import datetime
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from typing import List


class Player(SQLModel, table=True):
    """Model to store player information."""

    aga_id: str = Field(primary_key=True, max_length=20)
    name: str = Field(max_length=200, index=True)
    aga_rank: str = Field(max_length=10)
    age: int
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships for efficient querying
    games_as_player_black: "List[Game]" = Relationship(
        back_populates="player_black", sa_relationship_kwargs={"foreign_keys": "Game.player_black_id"}
    )
    games_as_player_white: "List[Game]" = Relationship(
        back_populates="player_white", sa_relationship_kwargs={"foreign_keys": "Game.player_white_id"}
    )

    def __str__(self) -> str:
        return f"{self.name} ({self.aga_id})"


class Game(SQLModel, table=True):
    """Model to store game results."""

    id: int | None = Field(default=None, primary_key=True)
    player_black_id: str = Field(foreign_key="player.aga_id", max_length=20)
    player_white_id: str = Field(foreign_key="player.aga_id", max_length=20)
    handicap: int = Field(default=0)
    rated: bool = Field(default=True)
    winner: str = Field(max_length=10)  # "black" or "white"
    valid_for_prizes: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    player_black: Player = Relationship(
        back_populates="games_as_player_black",
        sa_relationship_kwargs={"foreign_keys": "Game.player_black_id"}
    )
    player_white: Player = Relationship(
        back_populates="games_as_player_white",
        sa_relationship_kwargs={"foreign_keys": "Game.player_white_id"}
    )

    def __str__(self) -> str:
        return f"{self.player_black.name} vs {self.player_white.name} - {self.created_at.strftime('%Y-%m-%d')}"
