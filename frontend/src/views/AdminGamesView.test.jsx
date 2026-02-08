import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationProvider } from '../components/NotificationContext';
import { useTournamentData } from '../components/TournamentDataContext';
import AdminGamesView from './AdminGamesView';

// Mock the TournamentDataContext
vi.mock('../components/TournamentDataContext', () => ({
  useTournamentData: vi.fn(),
  TournamentDataProvider: vi.fn(({ children }) => children),
}));

describe('AdminGamesView', () => {
  const mockGames = [
    {
      id: 1,
      player_black: {
        id: 'AGA001',
        name: 'Alice Brown',
        rank: '5d',
        age: 30,
        color: 'black',
      },
      player_white: {
        id: 'AGA002',
        name: 'Bob Wilson',
        rank: '3k',
        age: 25,
        color: 'white',
      },
      handicap: 0,
      winner: 'black',
      rated: true,
      valid_for_prizes: true,
      created_at: '2024-01-15T10:00:00Z',
    },
    {
      id: 2,
      player_black: {
        id: 'AGA003',
        name: 'Charlie Davis',
        rank: '2d',
        age: 20,
        color: 'black',
      },
      player_white: {
        id: 'AGA004',
        name: 'Diana Evans',
        rank: '1k',
        age: 65,
        color: 'white',
      },
      handicap: 2,
      winner: 'white',
      rated: false,
      valid_for_prizes: false,
      created_at: '2024-01-16T14:30:00Z',
    },
    {
      id: 3,
      player_black: {
        id: 'AGA005',
        name: 'Eve Foster',
        rank: '1d',
        age: 35,
        color: 'black',
      },
      player_white: {
        id: 'AGA006',
        name: 'Frank Green',
        rank: '2k',
        age: 40,
        color: 'white',
      },
      handicap: 1,
      winner: 'black',
      rated: true,
      valid_for_prizes: true,
      created_at: '2024-01-17T09:15:00Z',
    },
  ];

  const mockToggleGameValidity = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useTournamentData.mockReturnValue({
      games: mockGames,
      loadingGames: false,
      gamesError: null,
      toggleGameValidity: mockToggleGameValidity,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <NotificationProvider>
        <AdminGamesView />
      </NotificationProvider>
    );
  };

  describe('Rendering', () => {
    it('renders games table when games are available', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('Alice Brown')).toBeInTheDocument();
        expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
        expect(screen.getByText('Charlie Davis')).toBeInTheDocument();
      });
    });

    it('displays total games count', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('Total Games: 3')).toBeInTheDocument();
      });
    });

    it('displays loading state', () => {
      useTournamentData.mockReturnValue({
        games: [],
        loadingGames: true,
        gamesError: null,
        toggleGameValidity: mockToggleGameValidity,
      });

      renderComponent();
      expect(screen.getByText('Loading games...')).toBeInTheDocument();
    });

    it('displays error state', () => {
      useTournamentData.mockReturnValue({
        games: [],
        loadingGames: false,
        gamesError: 'Failed to load games',
        toggleGameValidity: mockToggleGameValidity,
      });

      renderComponent();
      expect(screen.getByText('Failed to load games')).toBeInTheDocument();
    });

    it('displays empty state when no games', () => {
      useTournamentData.mockReturnValue({
        games: [],
        loadingGames: false,
        gamesError: null,
        toggleGameValidity: mockToggleGameValidity,
      });

      renderComponent();
      expect(screen.getByText('No games recorded yet')).toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    it('sorts by black player name ascending', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('Alice Brown')).toBeInTheDocument();
      });

      // Click on Black Player header
      const blackPlayerHeader = screen.getByText('Black Player');
      fireEvent.click(blackPlayerHeader);

      await waitFor(() => {
        const rows = screen.getAllByRole('row');
        // First data row (index 1) should have Alice (alphabetically first)
        expect(rows[1]).toHaveTextContent('Alice Brown');
      });
    });

    it('sorts by black player name descending', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('Alice Brown')).toBeInTheDocument();
      });

      // Click on Black Player header twice (once for asc, once for desc)
      const blackPlayerHeader = screen.getByText('Black Player');
      fireEvent.click(blackPlayerHeader);
      fireEvent.click(blackPlayerHeader);

      await waitFor(() => {
        const rows = screen.getAllByRole('row');
        // First data row should have Eve (alphabetically last)
        expect(rows[1]).toHaveTextContent('Eve Foster');
      });
    });

    it('sorts by white player name', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
      });

      const whitePlayerHeader = screen.getByText('White Player');
      fireEvent.click(whitePlayerHeader);

      await waitFor(() => {
        const rows = screen.getAllByRole('row');
        // First data row should have Bob Wilson (alphabetically first white player)
        expect(rows[1]).toHaveTextContent('Bob Wilson');
      });
    });

    it('sorts by black age ascending', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('Alice Brown')).toBeInTheDocument();
      });

      // Find the first Age header (black player age)
      const ageHeaders = screen.getAllByText('Age');
      // Click twice: first click sets to desc (default), second click to asc
      fireEvent.click(ageHeaders[0]);
      fireEvent.click(ageHeaders[0]);

      await waitFor(() => {
        const rows = screen.getAllByRole('row');
        // First data row should have Charlie Davis (age 20) - but he's invalid
        // So first data row should be Alice (age 30) or Eve (age 35)
        // Actually, valid games are sorted first, so Alice (30) and Eve (35)
        // In ascending order: Alice (30), Eve (35), then Charlie (20) as invalid
        expect(rows[1]).toHaveTextContent('Alice Brown');
      });
    });

    it('sorts by black age descending', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('Alice Brown')).toBeInTheDocument();
      });

      const ageHeaders = screen.getAllByText('Age');
      fireEvent.click(ageHeaders[0]); // First click for desc (default for age)

      await waitFor(() => {
        const rows = screen.getAllByRole('row');
        // First data row should have Eve Foster (age 35)
        expect(rows[1]).toHaveTextContent('Eve Foster');
      });
    });

    it('sorts by age difference', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('Alice Brown')).toBeInTheDocument();
      });

      const ageDiffHeader = screen.getByText('Age Diff');
      // Click twice: first click is desc (default), second is asc
      fireEvent.click(ageDiffHeader);
      fireEvent.click(ageDiffHeader);

      await waitFor(() => {
        const rows = screen.getAllByRole('row');
        // In ascending order by age diff:
        // Eve/Frank (age diff 5), Alice/Bob (age diff 5)
        // First valid game should be Eve or Alice (both have age diff 5)
        expect(
          rows[1].textContent.includes('Eve Foster') || rows[1].textContent.includes('Alice Brown')
        ).toBe(true);
      });
    });

    it('sorts by handicap', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('Alice Brown')).toBeInTheDocument();
      });

      const handicapHeader = screen.getByText('Handicap');
      // Click twice: first click is desc (default for handicap), second is asc
      fireEvent.click(handicapHeader);
      fireEvent.click(handicapHeader);

      await waitFor(() => {
        const rows = screen.getAllByRole('row');
        // In ascending order by handicap among valid games:
        // Alice/Bob (handicap 0), Eve/Frank (handicap 1)
        expect(rows[1]).toHaveTextContent('Alice Brown');
      });
    });

    it('sorts by winner', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('Alice Brown')).toBeInTheDocument();
      });

      const winnerHeader = screen.getByText('Winner');
      fireEvent.click(winnerHeader);

      await waitFor(() => {
        const rows = screen.getAllByRole('row');
        // First data row should have Alice or Eve (black winners come first)
        const firstRow = rows[1];
        expect(
          firstRow.textContent.includes('Alice Brown') ||
            firstRow.textContent.includes('Eve Foster')
        ).toBe(true);
      });
    });

    it('sorts by rated status', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('Alice Brown')).toBeInTheDocument();
      });

      const ratedHeader = screen.getByText('Rated');
      fireEvent.click(ratedHeader);

      await waitFor(() => {
        const rows = screen.getAllByRole('row');
        // First data row should be rated game (Alice or Eve)
        const firstRow = rows[1];
        expect(
          firstRow.textContent.includes('Alice Brown') ||
            firstRow.textContent.includes('Eve Foster')
        ).toBe(true);
      });
    });

    it('sorts by date (newest first by default)', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('Eve Foster')).toBeInTheDocument();
      });

      // Default sort should be by date desc (newest first)
      const rows = screen.getAllByRole('row');
      // First data row should have Eve Foster (latest date)
      expect(rows[1]).toHaveTextContent('Eve Foster');
    });

    it('sorts by date ascending when clicked', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('Alice Brown')).toBeInTheDocument();
      });

      const dateHeader = screen.getByText('Date');
      fireEvent.click(dateHeader);

      await waitFor(() => {
        const rows = screen.getAllByRole('row');
        // First data row should have Alice Brown (oldest date)
        expect(rows[1]).toHaveTextContent('Alice Brown');
      });
    });

    it('maintains valid games before invalid games when sorting', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('Alice Brown')).toBeInTheDocument();
      });

      // Sort by black player name
      const blackPlayerHeader = screen.getByText('Black Player');
      fireEvent.click(blackPlayerHeader);

      await waitFor(() => {
        const rows = screen.getAllByRole('row');
        // First two data rows should be valid games (Alice, Eve)
        // Third row should be invalid game (Charlie)
        expect(rows[1]).toHaveTextContent('Alice Brown');
        expect(rows[2]).toHaveTextContent('Eve Foster');
        expect(rows[3]).toHaveTextContent('Charlie Davis');
      });
    });

    it('sorts by rank correctly', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('Alice Brown')).toBeInTheDocument();
      });

      // Click on first Rank header (black player rank)
      const rankHeaders = screen.getAllByText('Rank');
      fireEvent.click(rankHeaders[0]);

      await waitFor(() => {
        const rows = screen.getAllByRole('row');
        // Ranks should be sorted: 1d, 2d, 5d (alphabetically)
        // First valid game should have 1d (Eve Foster)
        expect(rows[1]).toHaveTextContent('Eve Foster');
      });
    });

    it('sorts by AGA ID correctly', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('Alice Brown')).toBeInTheDocument();
      });

      // Click on first AGA ID header (black player)
      const agaIdHeaders = screen.getAllByText('AGA ID');
      fireEvent.click(agaIdHeaders[0]);

      await waitFor(() => {
        const rows = screen.getAllByRole('row');
        // First valid game should have lowest AGA ID (AGA001 - Alice)
        expect(rows[1]).toHaveTextContent('Alice Brown');
      });
    });
  });

  describe('Toggle Validity', () => {
    it('calls toggleGameValidity when validity button is clicked', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('Alice Brown')).toBeInTheDocument();
      });

      const buttons = screen.getAllByRole('button');
      // Find validity toggle buttons (after 14 sortable headers)
      const validityButton = buttons[14];
      fireEvent.click(validityButton);

      expect(mockToggleGameValidity).toHaveBeenCalled();
    });

    it('shows error notification when toggle fails', async () => {
      mockToggleGameValidity.mockRejectedValueOnce(new Error('Update failed'));

      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('Alice Brown')).toBeInTheDocument();
      });

      const buttons = screen.getAllByRole('button');
      const validityButton = buttons[14];
      fireEvent.click(validityButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to update game validity. Please try again.')).toBeVisible();
      });
    });
  });
});
