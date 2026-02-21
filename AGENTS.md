# AGENTS.md - Developer Guide for Coding Agents

This guide provides essential information for AI coding agents working on the baum-vibe Go tournament management system. The project is a full-stack application with a FastAPI backend and React frontend.

## Project Structure

```
baum-vibe/
├── backend/          # FastAPI backend with SQLModel
│   ├── app.py        # FastAPI app entry point
│   ├── models.py     # SQLModel database models
│   ├── schemas.py    # Pydantic request/response schemas
│   ├── database.py   # Database session management
│   ├── routers/      # API endpoint routers
│   │   ├── players.py
│   │   └── games.py
│   ├── tournament/   # Test modules
│   │   ├── player/   # Player tests
│   │   └── game/     # Game tests
│   └── pyproject.toml
└── frontend/         # React frontend with Material-UI
    ├── src/
    │   ├── components/  # Reusable components (layout/, tables/, ui/)
    │   ├── views/       # Page-level components
    │   └── services/    # API client (axios)
    └── package.json
```

## Build, Lint, and Test Commands

### Backend (FastAPI)

**Testing:**
```bash
cd backend
uv run python -m pytest                         # Run all tests
uv run python -m pytest tournament/player/      # Run player tests
uv run python -m pytest tournament/game/        # Run game tests
uv run python -m pytest -k "player"             # Run tests matching pattern
uv run python -m pytest -m "not slow"           # Exclude slow tests
uv run python -m pytest --cov                   # Run with coverage
```

**Linting and Formatting:**
```bash
cd backend
uv run python -m black .                        # Format code (line-length 88)
uv run python -m black --check .                # Check formatting
uv run python -m ruff check .                   # Lint code
uv run python -m ruff check --fix .             # Auto-fix linting issues
uv run mypy .                                   # Type checking
```

**Running:**
```bash
cd backend
uv run uvicorn app:app --reload                # Start dev server (port 8000)
uv run uvicorn app:app --reload --port 8001    # Start on different port
# No migrations needed - SQLModel auto-creates tables on startup
```

### Frontend (React)

**Testing:**
```bash
cd frontend
npm test                                        # Run tests in watch mode
npm test -- --watchAll=false                    # Run tests once
npm test -- --coverage                          # Run with coverage
npm test -- Titlebar                            # Run tests matching "Titlebar"
npm test -- --testPathPattern=Titlebar.test.js  # Run specific test file
```

**Linting and Formatting:**
```bash
cd frontend
npm run lint                                    # Lint code (ESLint, max 0 warnings)
npm run lint:fix                                # Auto-fix linting issues
npm run format                                  # Format code (Prettier)
npm run format:check                            # Check formatting
```

**Running:**
```bash
cd frontend
npm start                                       # Start dev server (port 3000)
npm run build                                   # Production build
```

### Docker

```bash
docker compose up --build                       # Start all services
docker compose exec backend uv run python -m pytest  # Run backend tests in container
docker compose exec frontend npm test -- --watchAll=false  # Run frontend tests
docker compose logs -f backend                  # View backend logs
```

## Code Style Guidelines

### Backend (Python/FastAPI)

**Formatting:**
- Use Black formatter (line length: 88)
- Follow PEP 8 conventions
- Ruff linter enforces style rules (pycodestyle, pyflakes, isort, flake8-bugbear)

**Imports:**
- Sort imports automatically with isort (via ruff)
- Group order: standard library → third-party → FastAPI/SQLModel → local
- Example:
```python
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from database import get_session
from models import Player
from schemas import PlayerResponse
```

**Type Hints:**
- Use type hints where appropriate (mypy enabled)
- Not strict mode, but encouraged for clarity
- Use modern Python 3.11+ syntax (e.g., `list[str]` not `List[str]`)

**Naming Conventions:**
- Models: PascalCase (e.g., `Player`, `Game`)
- Functions/variables: snake_case (e.g., `get_player`, `aga_id`)
- Constants: UPPER_SNAKE_CASE (e.g., `DATABASE_URL`)
- Private functions: prefix with `_` (e.g., `_compute_player_statistics`)

**Docstrings:**
- Use docstrings for public functions and classes
- Format: `"""Brief description."""` or multi-line with details

**Models (SQLModel):**
- Use descriptive field names
- Add `Field()` for constraints and metadata
- Implement `Relationship()` for foreign keys with back_populates
- Implement `__str__` method for string representation
- Example:
```python
class Player(SQLModel, table=True):
    """Model to store player information."""
    
    aga_id: str = Field(primary_key=True, max_length=20)
    name: str = Field(max_length=200, index=True)
    age: int
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    games_as_player_black: list["Game"] = Relationship(back_populates="player_black")
    
    def __str__(self) -> str:
        return f"{self.name} ({self.aga_id})"
```

**Routers (FastAPI):**
- Use APIRouter for organizing endpoints
- Add docstrings to router functions for OpenAPI documentation
- Use proper HTTP status codes from `fastapi.status`
- Use dependency injection for database sessions
- Example:
```python
router = APIRouter(prefix="/api/players", tags=["players"])

@router.get("/", response_model=list[PlayerResponse])
def list_players(session: Session = Depends(get_session)):
    """List all players with computed statistics."""
    statement = select(Player).order_by(Player.name)
    players = session.exec(statement).all()
    return [_player_to_response(player) for player in players]
```

**Schemas (Pydantic):**
- Separate Base, Create, Update, and Response schemas
- Use field validators for custom validation
- Use `ConfigDict(from_attributes=True)` for ORM compatibility
- Example:
```python
class PlayerBase(BaseModel):
    """Base schema for player with common fields."""
    name: str
    aga_rank: str
    age: int

class PlayerCreate(PlayerBase):
    """Schema for creating a new player."""
    aga_id: str

class PlayerResponse(PlayerBase):
    """Schema for player response with computed statistics."""
    aga_id: str
    games_played: int
    games_won: int
    games_lost: int
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
```

**Error Handling:**
- Use HTTPException for API errors
- Provide descriptive error messages
- Use appropriate HTTP status codes
- Example:
```python
from fastapi import HTTPException, status

if not player:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Player with aga_id '{aga_id}' not found",
    )
```

### Frontend (JavaScript/React)

**Formatting:**
- Use Prettier (semi: true, singleQuote: true, printWidth: 100, tabWidth: 2)
- No tabs (useTabs: false)
- Trailing commas: es5

**Imports:**
- Sort imports alphabetically (enforced by ESLint)
- Group order: react → external → internal → relative
- No duplicate imports
- Never mix default and named imports on same line
- Use specific MUI subpath imports (NOT barrel imports):
  - ✅ `import Button from '@mui/material/Button';`
  - ❌ `import { Button } from '@mui/material';`
- Example:
```javascript
import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { playerService } from '../services/api';
```

**Naming Conventions:**
- Components: PascalCase (e.g., `Titlebar`, `PlayersTable`)
- Functions/variables: camelCase (e.g., `handleSubmit`, `isLoading`)
- Constants: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- Test files: Component.test.js
- Props: camelCase, use destructuring

**Components:**
- Functional components only (no class components)
- Use hooks (useState, useEffect, etc.)
- Export default for main component
- PropTypes are disabled (prop-types: off)
- No need to import React in JSX files

**Hooks:**
- Follow Rules of Hooks (enforced by ESLint)
- `react-hooks/rules-of-hooks`: error
- `react-hooks/exhaustive-deps`: warn

**Error Handling:**
- Use try/catch for async operations
- Handle API errors with user-friendly messages
- Use Material-UI Snackbar for notifications

**Testing:**
- Use React Testing Library (@testing-library/react)
- Test files: `Component.test.js`
- Wrap components needing Router with `<BrowserRouter>`
- Use `@testing-library/jest-dom` matchers
- Focus on user behavior, not implementation details
- Prefer `byRole()` queries whenever possible (most accessible and resilient)
- Prefer `toBeVisible()` over `toBeInTheDocument()` (validates user can see element)

**JSX/Accessibility:**
- Always provide `alt` text for images (jsx-a11y/alt-text: error)
- Use semantic HTML elements
- Ensure proper ARIA attributes

**Code Quality:**
- No console.log (use console.warn/error if needed) - `no-console: warn`
- No `var`, use `const` or `let` - `no-var: error`, `prefer-const: error`
- Always use strict equality (`===`) - `eqeqeq: always`
- No unused variables (except prefixed with `_`)

## API Design

**Endpoints:**
- Use RESTful conventions
- Use trailing slashes: `/api/players/`
- Path parameters for lookups: `/api/players/{aga_id}/`
- Return proper status codes: 200 (OK), 201 (Created), 404 (Not Found), 400 (Bad Request), 500 (Server Error)

**Request/Response:**
- Content-Type: application/json
- Use Pydantic schemas for validation and serialization
- Return error messages in format: `{"detail": "Error message"}`
- FastAPI auto-generates OpenAPI docs at `/docs` and `/redoc`

## Database

**Database System:**
- **Production (Vercel)**: PostgreSQL (via Vercel Postgres or other hosted provider)
- **Local Development**: SQLite (default, no setup required)
- SQLModel/SQLAlchemy provides database-agnostic ORM

**Configuration:**
- Database URL is set via `DATABASE_URL` environment variable
- If not set, defaults to `sqlite:///./db.sqlite3` for local development
- PostgreSQL URLs are automatically normalized (`postgres://` → `postgresql://`)

**Models:**
- SQLModel auto-creates tables on startup (no migrations needed)
- Schema changes: update models.py, delete database, restart server
- Foreign keys cascade on delete where appropriate
- Use `Relationship()` with `back_populates` for bidirectional relationships

**Seeding Data:**
- Use `seed_data.py` to populate database with test data
- Run directly: `uv run python seed_data.py`
- Auto-seed on startup: Set `SEED_DATABASE=true` environment variable
- Useful for initial deployment to Vercel with test data

**Setup Instructions:**

*Local Development (SQLite):*
```bash
cd backend
# Database auto-created on first run, no setup needed
uv run uvicorn app:app --reload

# Optional: Seed with test data
uv run python seed_data.py
```

*Production (Vercel Postgres):*
1. Create Vercel Postgres database in Vercel dashboard
2. Set `DATABASE_URL` environment variable in Vercel project settings
3. Set `SEED_DATABASE=true` for initial deployment (optional)
4. Deploy - tables auto-create, data auto-seeds if enabled
5. Remove `SEED_DATABASE` after initial setup (optional)

## Git Commit Style

Based on recent commits, use conventional commit format:
- `refactor:` - code restructuring without behavior change
- `feat:` - new features
- `fix:` - bug fixes
- `style:` - formatting changes
- `test:` - adding/updating tests
- `docs:` - documentation changes

**Commit Workflow:**
- Make granular commits when developing a plan
- Each commit should represent a single logical change
- Commit frequently as you complete discrete steps
- Commit after making a change to ensure progress is saved

Examples:
- `refactor: rename Navigation to Titlebar and remove navigation buttons`
- `feat: create view components with Outlet pattern`
- `fix: resolve API connection timeout issue`

## Common Patterns

**Component Structure:**
```javascript
import { useState } from 'react';
import Box from '@mui/material/Box';

const ComponentName = () => {
  const [state, setState] = useState(null);
  
  const handleAction = () => {
    // logic here
  };
  
  return (
    <Box>
      {/* JSX here */}
    </Box>
  );
};

export default ComponentName;
```

**FastAPI Router Pattern:**
```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from database import get_session
from models import ModelName
from schemas import ModelCreate, ModelUpdate, ModelResponse

router = APIRouter(prefix="/api/models", tags=["models"])

@router.get("/", response_model=list[ModelResponse])
def list_models(session: Session = Depends(get_session)):
    """List all models."""
    statement = select(ModelName)
    models = session.exec(statement).all()
    return models

@router.post("/", response_model=ModelResponse, status_code=status.HTTP_201_CREATED)
def create_model(model_data: ModelCreate, session: Session = Depends(get_session)):
    """Create a new model."""
    model = ModelName.model_validate(model_data)
    session.add(model)
    session.commit()
    session.refresh(model)
    return model
```

## Notes for Agents

- Always run tests after making changes
- Use specific imports, avoid barrel imports (especially MUI)
- Follow the established file organization (components/layout, components/tables, etc.)
- Keep components focused and single-purpose
- Validate data on both frontend and backend
- Use Material-UI components consistently
- Write tests for new components and features
- Update this file if you discover new patterns or conventions
