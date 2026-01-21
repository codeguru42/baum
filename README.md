# Go Tournament Result Reporting System

A web application for participants in a Go tournament to report their game results. Built with Django REST Framework backend and React with Material-UI frontend.

## Features

- Report game results with complete player and game information
- Automatic player lookup by AGA ID
- Auto-fill player information if already in the system
- Record game details including:
  - Player information (AGA ID, name, rank, age)
  - Game settings (handicap, colors)
  - Game outcome (winner, rated/unrated)
- Form validation and error handling
- Responsive Material-UI design

## Technology Stack

### Backend
- Django 4.2.9
- Django REST Framework 3.14.0
- SQLite database
- CORS headers for frontend integration

### Frontend
- React 18
- Material-UI (MUI) 5
- Axios for API calls
- React Testing Library

## Project Structure

```
baum-vibe/
├── backend/
│   ├── tournament/           # Django app
│   │   ├── models.py        # Player and Game models
│   │   ├── serializers.py   # REST API serializers
│   │   ├── views.py         # API viewsets
│   │   ├── urls.py          # URL routing
│   │   ├── admin.py         # Admin interface
│   │   └── tests.py         # Backend tests (15 tests)
│   ├── tournament_app/       # Django project settings
│   ├── manage.py
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── GameResultForm.js      # Main form component
    │   │   └── GameResultForm.test.js # Component tests
    │   ├── services/
    │   │   └── api.js                 # API client
    │   └── App.js
    └── package.json
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create and activate a virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run migrations:
```bash
python manage.py migrate
```

5. (Optional) Create a superuser for admin access:
```bash
python manage.py createsuperuser
```

6. Start the Django development server:
```bash
python manage.py runserver
```

The backend API will be available at `http://localhost:8000/api/`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```

The frontend will be available at `http://localhost:3000/`

## Running Tests

### Backend Tests

```bash
cd backend
source venv/bin/activate
python manage.py test
```

The backend includes 15 comprehensive tests covering:
- Model creation and validation
- API endpoints (CRUD operations)
- Player lookup functionality
- Game result submission
- Data validation rules

### Frontend Tests

```bash
cd frontend
npm test
```

The frontend includes tests for:
- Component rendering
- Form validation
- User interactions
- API integration
- Error handling

## API Endpoints

### Players

- `GET /api/players/` - List all players
- `POST /api/players/` - Create a new player
- `GET /api/players/{aga_id}/` - Get player by AGA ID
- `PUT /api/players/{aga_id}/` - Update player
- `DELETE /api/players/{aga_id}/` - Delete player

### Games

- `GET /api/games/` - List all games
- `POST /api/games/` - Submit a new game result
- `GET /api/games/{id}/` - Get game details

## Usage

1. Start both the backend and frontend servers (see Setup Instructions)

2. Open your browser to `http://localhost:3000/`

3. Fill in the form:
   - Enter Player 1's AGA ID (if the player exists, their info will auto-fill)
   - Complete Player 1's information (name, rank, age)
   - Select Player 1's color
   - Repeat for Player 2
   - Enter game details (handicap, winner, rated/unrated)
   - Click "Submit Game Result"

4. The system will:
   - Create/update player records
   - Save the game result
   - Display a success message
   - Reset the form for the next entry

## Admin Interface

Access the Django admin interface at `http://localhost:8000/admin/` to:
- View all players and games
- Search and filter records
- Manually add or edit data

## Data Models

### Player Model
- `aga_id` (Primary Key): Unique AGA ID number
- `name`: Player's full name
- `aga_rank`: AGA rank (e.g., "5d", "3k")
- `age`: Player's age

### Game Model
- `player1` / `player2`: Foreign keys to Player model
- `player1_color` / `player2_color`: Stone color (black/white)
- `handicap`: Number of handicap stones
- `rated`: Boolean for rated/unrated game
- `winner`: Which player won (player1/player2)
- `created_at`: Timestamp of result submission

## Development Notes

- The backend uses SQLite for simplicity. For production, consider PostgreSQL
- CORS is configured to allow requests from `http://localhost:3000`
- All dates are stored in UTC
- Form validation ensures players can't play themselves and must have different colors

## License

This project is for tournament use.
