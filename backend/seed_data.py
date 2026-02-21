"""Seed database with initial test data."""

from datetime import datetime, timedelta

from sqlmodel import Session, select

from database import engine
from models import Game, Player


def seed_players(session: Session) -> dict[str, Player]:
    """
    Seed the database with test players.

    Returns dict of player_id -> Player for easy reference.
    """
    players_data = [
        {
            "aga_id": "TEST001",
            "name": "Alice Chen",
            "aga_rank": "5d",
            "age": 28,
        },
        {
            "aga_id": "TEST002",
            "name": "Bob Martinez",
            "aga_rank": "3k",
            "age": 45,
        },
        {
            "aga_id": "TEST003",
            "name": "Charlie Davis",
            "aga_rank": "2d",
            "age": 35,
        },
        {
            "aga_id": "TEST004",
            "name": "Diana Evans",
            "aga_rank": "1k",
            "age": 52,
        },
    ]

    players = {}
    for data in players_data:
        # Check if player already exists
        existing = session.get(Player, data["aga_id"])
        if existing:
            players[data["aga_id"]] = existing
            print(f"Player {data['name']} already exists, skipping...")
        else:
            player = Player(**data)
            session.add(player)
            players[data["aga_id"]] = player
            print(f"Created player: {data['name']} ({data['aga_id']})")

    session.commit()
    return players


def seed_games(session: Session, players: dict[str, Player]) -> None:
    """
    Seed the database with test games.

    Args:
        session: Database session
        players: Dict of player_id -> Player from seed_players()
    """
    # Check if games already exist
    existing_games = session.exec(select(Game)).first()
    if existing_games:
        print("Games already exist, skipping game seeding...")
        return

    games_data = [
        {
            "player_black_id": "TEST001",
            "player_white_id": "TEST002",
            "handicap": 0,
            "winner": "black",
            "rated": True,
            "valid_for_prizes": True,
            "created_at": datetime.utcnow() - timedelta(days=5),
        },
        {
            "player_black_id": "TEST003",
            "player_white_id": "TEST004",
            "handicap": 2,
            "winner": "white",
            "rated": True,
            "valid_for_prizes": True,
            "created_at": datetime.utcnow() - timedelta(days=3),
        },
        {
            "player_black_id": "TEST001",
            "player_white_id": "TEST003",
            "handicap": 0,
            "winner": "black",
            "rated": True,
            "valid_for_prizes": True,
            "created_at": datetime.utcnow() - timedelta(days=1),
        },
    ]

    for data in games_data:
        game = Game(**data)
        session.add(game)
        black_name = players[data["player_black_id"]].name
        white_name = players[data["player_white_id"]].name
        print(f"Created game: {black_name} vs {white_name}")

    session.commit()


def seed_database(force: bool = False) -> None:
    """
    Main function to seed the database with test data.

    Args:
        force: If True, will seed even if data already exists
    """
    # Ensure tables are created
    from database import create_db_and_tables

    create_db_and_tables()

    with Session(engine) as session:
        print("Starting database seeding...")

        # Check if database already has data
        existing_players = session.exec(select(Player)).first()
        if existing_players and not force:
            print("Database already has data. Use force=True to re-seed.")
            return

        # Seed players first (games depend on players)
        players = seed_players(session)

        # Seed games
        seed_games(session, players)

        print("Database seeding completed!")


if __name__ == "__main__":
    # When run directly, seed the database
    seed_database()
