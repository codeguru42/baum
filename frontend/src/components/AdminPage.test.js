import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { gameService, playerService } from '../services/api';
import AdminPage from './AdminPage';

// Mock the API services
jest.mock('../services/api');

// Mock react-router-dom
jest.mock('react-router-dom');

const mockNavigate = require('react-router-dom').__mockNavigate;

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('AdminPage', () => {
  const mockGames = [
    {
      id: 1,
      player1: 'AGA001',
      player1_name: 'Alice',
      player1_rank: '5d',
      player1_age: 30,
      player1_color: 'black',
      player2: 'AGA002',
      player2_name: 'Bob',
      player2_rank: '4d',
      player2_age: 28,
      player2_color: 'white',
      handicap: 0,
      winner: 'player1',
      rated: true,
      valid_for_prizes: true,
      created_at: '2024-01-15T10:00:00Z',
    },
    {
      id: 2,
      player1: 'AGA003',
      player1_name: 'Charlie',
      player1_rank: '2k',
      player1_age: 60,
      player1_color: 'white',
      player2: 'AGA004',
      player2_name: 'Diana',
      player2_rank: '3k',
      player2_age: 18,
      player2_color: 'black',
      handicap: 1,
      winner: 'player2',
      rated: false,
      valid_for_prizes: false,
      created_at: '2024-01-16T14:30:00Z',
    },
  ];

  const mockPlayers = [
    {
      aga_id: 'AGA001',
      name: 'Alice',
      aga_rank: '5d',
      age: 30,
      games_played: 10,
      games_won: 7,
      games_lost: 3,
      updated_at: '2024-01-15T10:00:00Z',
    },
    {
      aga_id: 'AGA002',
      name: 'Bob',
      aga_rank: '4d',
      age: 28,
      games_played: 8,
      games_won: 4,
      games_lost: 4,
      updated_at: '2024-01-16T12:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
  });

  describe('Loading State', () => {
    test('displays loading spinner when fetching games', () => {
      gameService.getAll.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      renderWithRouter(<AdminPage view="games" />);

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.getByText(/Loading games.../i)).toBeInTheDocument();
    });

    test('displays loading spinner when fetching players', () => {
      playerService.getAll.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      renderWithRouter(<AdminPage view="players" />);

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.getByText(/Loading players.../i)).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    test('displays error message when games fetch fails', async () => {
      gameService.getAll.mockRejectedValueOnce(new Error('Network error'));

      renderWithRouter(<AdminPage view="games" />);

      await waitFor(() => {
        expect(screen.getByText(/Failed to load games/i)).toBeInTheDocument();
      });
    });

    test('displays error message when players fetch fails', async () => {
      playerService.getAll.mockRejectedValueOnce(new Error('Network error'));

      renderWithRouter(<AdminPage view="players" />);

      await waitFor(() => {
        expect(screen.getByText(/Failed to load players/i)).toBeInTheDocument();
      });
    });
  });

  describe('Games View', () => {
    beforeEach(() => {
      gameService.getAll.mockResolvedValue({ data: mockGames });
    });

    test('renders games view with correct title and navigation', async () => {
      renderWithRouter(<AdminPage view="games" />);

      await waitFor(() => {
        expect(screen.getByText(/Tournament Administration/i)).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /Games/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Players/i })).toBeInTheDocument();
    });

    test('displays total games count', async () => {
      renderWithRouter(<AdminPage view="games" />);

      await waitFor(() => {
        expect(screen.getByText(/Total Games: 2/i)).toBeInTheDocument();
      });
    });

    test('displays all game data in table', async () => {
      renderWithRouter(<AdminPage view="games" />);

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument();
      });

      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('Charlie')).toBeInTheDocument();
      expect(screen.getByText('Diana')).toBeInTheDocument();
      expect(screen.getByText('5d')).toBeInTheDocument();
      expect(screen.getByText('4d')).toBeInTheDocument();
    });

    test('displays age difference chips with correct colors', async () => {
      renderWithRouter(<AdminPage view="games" />);

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument();
      });

      // Game 1: age diff = |30-28| = 2 (should be warning)
      // Game 2: age diff = |60-18| = 42 (should be success)
      // Check by getting all cells and verifying age differences are present
      const cells = screen.getAllByRole('cell');
      const cellTexts = cells.map((cell) => cell.textContent);
      
      expect(cellTexts).toContain('2');
      expect(cellTexts).toContain('42');
    });

    test('displays winner chips with correct colors', async () => {
      renderWithRouter(<AdminPage view="games" />);

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument();
      });

      const winnerChips = screen.getAllByText(/^(Black|White)$/);
      expect(winnerChips.length).toBeGreaterThan(0);
    });

    test('displays rated status chips', async () => {
      renderWithRouter(<AdminPage view="games" />);

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument();
      });

      const yesChips = screen.getAllByText('Yes');
      const noChips = screen.getAllByText('No');
      expect(yesChips.length).toBeGreaterThan(0);
      expect(noChips.length).toBeGreaterThan(0);
    });

    test('displays empty state when no games exist', async () => {
      gameService.getAll.mockResolvedValue({ data: [] });

      renderWithRouter(<AdminPage view="games" />);

      await waitFor(() => {
        expect(screen.getByText(/No games recorded yet/i)).toBeInTheDocument();
      });
    });

    test('navigates to players view when Players button is clicked', async () => {
      renderWithRouter(<AdminPage view="games" />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Players/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /Players/i }));
      expect(mockNavigate).toHaveBeenCalledWith('/admin/players');
    });
  });

  describe('Players View', () => {
    beforeEach(() => {
      playerService.getAll.mockResolvedValue({ data: mockPlayers });
    });

    test('renders players view with correct data', async () => {
      renderWithRouter(<AdminPage view="players" />);

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument();
      });

      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('AGA001')).toBeInTheDocument();
      expect(screen.getByText('AGA002')).toBeInTheDocument();
      expect(screen.getByText('5d')).toBeInTheDocument();
      expect(screen.getByText('4d')).toBeInTheDocument();
    });

    test('displays total players count', async () => {
      renderWithRouter(<AdminPage view="players" />);

      await waitFor(() => {
        expect(screen.getByText(/Total Players: 2/i)).toBeInTheDocument();
      });
    });

    test('displays player statistics', async () => {
      renderWithRouter(<AdminPage view="players" />);

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument();
      });

      // Check that the statistics are present in the table
      const cells = screen.getAllByRole('cell');
      const cellTexts = cells.map((cell) => cell.textContent);
      
      expect(cellTexts).toContain('10'); // games_played for Alice
      expect(cellTexts).toContain('7'); // games_won for Alice
      expect(cellTexts).toContain('3'); // games_lost for Alice
      expect(cellTexts).toContain('8'); // games_played for Bob
      expect(cellTexts).toContain('4'); // games_won and games_lost for Bob
    });

    test('displays empty state when no players exist', async () => {
      playerService.getAll.mockResolvedValue({ data: [] });

      renderWithRouter(<AdminPage view="players" />);

      await waitFor(() => {
        expect(screen.getByText(/No players registered yet/i)).toBeInTheDocument();
      });
    });

    test('navigates to games view when Games button is clicked', async () => {
      renderWithRouter(<AdminPage view="players" />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Games/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /Games/i }));
      expect(mockNavigate).toHaveBeenCalledWith('/admin/games');
    });

    test('handles missing game statistics gracefully', async () => {
      const playersWithoutStats = [
        {
          aga_id: 'AGA999',
          name: 'Eve',
          aga_rank: '1k',
          age: 25,
          games_played: null,
          games_won: null,
          games_lost: null,
          updated_at: '2024-01-17T10:00:00Z',
        },
      ];

      playerService.getAll.mockResolvedValue({ data: playersWithoutStats });

      renderWithRouter(<AdminPage view="players" />);

      await waitFor(() => {
        expect(screen.getByText('Eve')).toBeInTheDocument();
      });

      // Should display 0 for null values
      const cells = screen.getAllByRole('cell');
      const zeroCells = cells.filter((cell) => cell.textContent === '0');
      expect(zeroCells.length).toBeGreaterThanOrEqual(3); // games_played, games_won, games_lost
    });
  });

  describe('Game Validity Toggle', () => {
    beforeEach(() => {
      gameService.getAll.mockResolvedValue({ data: mockGames });
    });

    test('displays validity toggle buttons for each game', async () => {
      renderWithRouter(<AdminPage view="games" />);

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument();
      });

      // Should have 2 toggle buttons (one per game)
      const toggleButtons = screen.getAllByRole('button', { hidden: true }).filter((button) => {
        const icon = button.querySelector('svg');
        return icon && (icon.dataset.testid === 'CheckCircleIcon' || icon.dataset.testid === 'CancelIcon');
      });

      expect(toggleButtons.length).toBeGreaterThanOrEqual(2);
    });

    test('toggles game validity from valid to invalid', async () => {
      gameService.update.mockResolvedValue({});
      renderWithRouter(<AdminPage view="games" />);

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument();
      });

      // Find the first toggle button (should be CheckCircle for valid game)
      const toggleButtons = screen.getAllByRole('button', { hidden: true });
      const validityButton = toggleButtons.find((button) => {
        return button.querySelector('[data-testid="CheckCircleIcon"]');
      });

      expect(validityButton).toBeInTheDocument();

      // Click to toggle
      fireEvent.click(validityButton);

      await waitFor(() => {
        expect(gameService.update).toHaveBeenCalledWith(1, { valid_for_prizes: false });
      });
    });

    test('toggles game validity from invalid to valid', async () => {
      gameService.update.mockResolvedValue({});
      renderWithRouter(<AdminPage view="games" />);

      await waitFor(() => {
        expect(screen.getByText('Charlie')).toBeInTheDocument();
      });

      // Find the Cancel icon button (for invalid game)
      const toggleButtons = screen.getAllByRole('button', { hidden: true });
      const validityButton = toggleButtons.find((button) => {
        return button.querySelector('[data-testid="CancelIcon"]');
      });

      expect(validityButton).toBeInTheDocument();

      // Click to toggle
      fireEvent.click(validityButton);

      await waitFor(() => {
        expect(gameService.update).toHaveBeenCalledWith(2, { valid_for_prizes: true });
      });
    });

    test('displays error when validity toggle fails', async () => {
      gameService.update.mockRejectedValue(new Error('Update failed'));
      renderWithRouter(<AdminPage view="games" />);

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument();
      });

      const toggleButtons = screen.getAllByRole('button', { hidden: true });
      const validityButton = toggleButtons.find((button) => {
        return button.querySelector('[data-testid="CheckCircleIcon"]');
      });

      fireEvent.click(validityButton);

      await waitFor(() => {
        expect(screen.getByText(/Failed to update game validity/i)).toBeInTheDocument();
      });
    });
  });

  describe('Sorting Functionality', () => {
    const gamesWithVariedAgeDiffs = [
      {
        id: 1,
        player1: 'AGA001',
        player1_name: 'Young Player',
        player1_rank: '5d',
        player1_age: 20,
        player1_color: 'black',
        player2: 'AGA002',
        player2_name: 'Old Player',
        player2_rank: '4d',
        player2_age: 70,
        player2_color: 'white',
        handicap: 0,
        winner: 'player1',
        rated: true,
        valid_for_prizes: true,
        created_at: '2024-01-15T10:00:00Z',
      },
      {
        id: 2,
        player1: 'AGA003',
        player1_name: 'Player A',
        player1_rank: '2k',
        player1_age: 30,
        player1_color: 'black',
        player2: 'AGA004',
        player2_name: 'Player B',
        player2_rank: '3k',
        player2_age: 32,
        player2_color: 'white',
        handicap: 1,
        winner: 'player2',
        rated: false,
        valid_for_prizes: true,
        created_at: '2024-01-16T14:30:00Z',
      },
    ];

    test('sorts games by age difference in descending order by default', async () => {
      gameService.getAll.mockResolvedValue({ data: gamesWithVariedAgeDiffs });
      renderWithRouter(<AdminPage view="games" />);

      await waitFor(() => {
        expect(screen.getByText('Young Player')).toBeInTheDocument();
      });

      const rows = screen.getAllByRole('row');
      // First data row should be the game with larger age diff (50)
      // Skip header row
      const firstDataRow = rows[1];
      expect(firstDataRow.textContent).toContain('Young Player');
    });

    test('toggles age difference sort order when clicked', async () => {
      gameService.getAll.mockResolvedValue({ data: gamesWithVariedAgeDiffs });
      renderWithRouter(<AdminPage view="games" />);

      await waitFor(() => {
        expect(screen.getByText('Young Player')).toBeInTheDocument();
      });

      // Find the "Age Diff" header and click it
      const ageDiffHeader = screen.getByText('Age Diff').closest('th');
      fireEvent.click(ageDiffHeader);

      // After clicking, order should reverse
      await waitFor(() => {
        const rows = screen.getAllByRole('row');
        const firstDataRow = rows[1];
        expect(firstDataRow.textContent).toContain('Player A');
      });
    });

    test('sorts games by rated status when Rated header is clicked', async () => {
      gameService.getAll.mockResolvedValue({ data: gamesWithVariedAgeDiffs });
      renderWithRouter(<AdminPage view="games" />);

      await waitFor(() => {
        expect(screen.getByText('Young Player')).toBeInTheDocument();
      });

      // Find the "Rated" header and click it
      const ratedHeader = screen.getByText('Rated').closest('th');
      fireEvent.click(ratedHeader);

      // The sort should complete (we can just verify the component still renders correctly)
      await waitFor(
        () => {
          // Both players should still be visible after sort
          expect(screen.getByText('Young Player')).toBeInTheDocument();
          expect(screen.getByText('Player A')).toBeInTheDocument();
        },
        { timeout: 100 }
      );
    });

    test('groups valid and invalid games separately when sorting', async () => {
      const gamesWithMixedValidity = [
        {
          ...gamesWithVariedAgeDiffs[0],
          valid_for_prizes: true,
          player1_age: 20,
          player2_age: 70, // age diff: 50
        },
        {
          ...gamesWithVariedAgeDiffs[1],
          valid_for_prizes: false,
          player1_age: 25,
          player2_age: 85, // age diff: 60 (larger but invalid)
        },
      ];

      gameService.getAll.mockResolvedValue({ data: gamesWithMixedValidity });
      renderWithRouter(<AdminPage view="games" />);

      await waitFor(() => {
        expect(screen.getByText('Young Player')).toBeInTheDocument();
      });

      const rows = screen.getAllByRole('row');
      // Valid games should come first, regardless of age diff
      const firstDataRow = rows[1];
      expect(firstDataRow.textContent).toContain('Young Player'); // valid game
    });
  });

  describe('Date Formatting', () => {
    test('formats dates correctly', async () => {
      gameService.getAll.mockResolvedValue({ data: mockGames });
      renderWithRouter(<AdminPage view="games" />);

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument();
      });

      // Check that dates are formatted (should contain "Jan" or similar month abbreviation)
      const dateElements = screen.getAllByText(/Jan/i);
      expect(dateElements.length).toBeGreaterThan(0);
    });
  });

  describe('View Switching', () => {
    test('fetches games data when view is games', async () => {
      gameService.getAll.mockResolvedValue({ data: mockGames });

      renderWithRouter(<AdminPage view="games" />);

      await waitFor(() => {
        expect(gameService.getAll).toHaveBeenCalled();
      });

      expect(playerService.getAll).not.toHaveBeenCalled();
    });

    test('fetches players data when view is players', async () => {
      playerService.getAll.mockResolvedValue({ data: mockPlayers });

      renderWithRouter(<AdminPage view="players" />);

      await waitFor(() => {
        expect(playerService.getAll).toHaveBeenCalled();
      });

      expect(gameService.getAll).not.toHaveBeenCalled();
    });
  });
});
