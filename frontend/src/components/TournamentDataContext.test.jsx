import { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { gameService, playerService } from '../services/api';
import { TournamentDataProvider, useTournamentData } from './TournamentDataContext';

// Mock the API services
vi.mock('../services/api', () => ({
  playerService: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  gameService: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));

describe('TournamentDataContext', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();

    // Setup default mock responses
    playerService.getAll.mockResolvedValue({ data: [] });
    gameService.getAll.mockResolvedValue({ data: [] });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders children correctly', async () => {
    render(
      <TournamentDataProvider>
        <div>Test Child</div>
      </TournamentDataProvider>
    );

    expect(screen.getByText('Test Child')).toBeVisible();
  });

  it('throws error when useTournamentData is used outside provider', () => {
    // Suppress console.error for this test
    // eslint-disable-next-line no-console
    const originalError = console.error;
    // eslint-disable-next-line no-console
    console.error = () => {};

    const TestComponent = () => {
      useTournamentData();
      return null;
    };

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useTournamentData must be used within a TournamentDataProvider');

    // eslint-disable-next-line no-console
    console.error = originalError;
  });

  it('fetches players and games on mount', async () => {
    const mockPlayers = [
      { aga_id: '123', name: 'Player 1', aga_rank: '5d', age: 25 },
      { aga_id: '456', name: 'Player 2', aga_rank: '3k', age: 30 },
    ];
    const mockGames = [
      { id: 1, player_black: mockPlayers[0], player_white: mockPlayers[1], winner: 'black' },
    ];

    playerService.getAll.mockResolvedValue({ data: mockPlayers });
    gameService.getAll.mockResolvedValue({ data: mockGames });

    const TestComponent = () => {
      const { players, games, loadingPlayers, loadingGames } = useTournamentData();
      return (
        <div>
          <div>Players Loading: {loadingPlayers ? 'yes' : 'no'}</div>
          <div>Games Loading: {loadingGames ? 'yes' : 'no'}</div>
          <div>Players Count: {players.length}</div>
          <div>Games Count: {games.length}</div>
        </div>
      );
    };

    render(
      <TournamentDataProvider>
        <TestComponent />
      </TournamentDataProvider>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Players Loading: no')).toBeVisible();
      expect(screen.getByText('Games Loading: no')).toBeVisible();
    });

    expect(screen.getByText('Players Count: 2')).toBeVisible();
    expect(screen.getByText('Games Count: 1')).toBeVisible();
    expect(playerService.getAll).toHaveBeenCalledTimes(1);
    expect(gameService.getAll).toHaveBeenCalledTimes(1);
  });

  it('handles errors when fetching players', async () => {
    playerService.getAll.mockRejectedValue(new Error('Failed to fetch'));
    gameService.getAll.mockResolvedValue({ data: [] });

    const TestComponent = () => {
      const { playersError } = useTournamentData();
      return <div>{playersError || 'No error'}</div>;
    };

    render(
      <TournamentDataProvider>
        <TestComponent />
      </TournamentDataProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to load players. Please try again later.')).toBeVisible();
    });
  });

  it('handles errors when fetching games', async () => {
    playerService.getAll.mockResolvedValue({ data: [] });
    gameService.getAll.mockRejectedValue(new Error('Failed to fetch'));

    const TestComponent = () => {
      const { gamesError } = useTournamentData();
      return <div>{gamesError || 'No error'}</div>;
    };

    render(
      <TournamentDataProvider>
        <TestComponent />
      </TournamentDataProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to load games. Please try again later.')).toBeVisible();
    });
  });

  it('toggles game validity with optimistic update', async () => {
    const mockGames = [
      {
        id: 1,
        player_black: { aga_id: '123', name: 'Player 1' },
        player_white: { aga_id: '456', name: 'Player 2' },
        valid_for_prizes: true,
      },
    ];

    playerService.getAll.mockResolvedValue({ data: [] });
    gameService.getAll.mockResolvedValue({ data: mockGames });
    gameService.update.mockResolvedValue({
      data: { ...mockGames[0], valid_for_prizes: false },
    });

    const TestComponent = () => {
      const { games, toggleGameValidity } = useTournamentData();
      return (
        <div>
          <div>Game Valid: {games[0]?.valid_for_prizes ? 'yes' : 'no'}</div>
          <button onClick={() => toggleGameValidity(1)}>Toggle Validity</button>
        </div>
      );
    };

    const user = userEvent.setup();
    render(
      <TournamentDataProvider>
        <TestComponent />
      </TournamentDataProvider>
    );

    // Wait for initial data load
    await waitFor(() => {
      expect(screen.getByText('Game Valid: yes')).toBeVisible();
    });

    // Click toggle button
    const toggleButton = screen.getByRole('button', { name: /toggle validity/i });
    await user.click(toggleButton);

    // Optimistic update should happen immediately
    await waitFor(() => {
      expect(screen.getByText('Game Valid: no')).toBeVisible();
    });

    // API should be called
    expect(gameService.update).toHaveBeenCalledWith(1, { valid_for_prizes: false });
  });

  it('rolls back optimistic update on error', async () => {
    const mockGames = [
      {
        id: 1,
        player_black: { aga_id: '123', name: 'Player 1' },
        player_white: { aga_id: '456', name: 'Player 2' },
        valid_for_prizes: true,
      },
    ];

    playerService.getAll.mockResolvedValue({ data: [] });
    gameService.getAll.mockResolvedValue({ data: mockGames });
    gameService.update.mockRejectedValue(new Error('Update failed'));

    const TestComponent = () => {
      const { games, toggleGameValidity } = useTournamentData();
      const [error, setError] = useState(null);

      const handleToggle = async () => {
        try {
          await toggleGameValidity(1);
        } catch (_err) {
          setError('Failed');
        }
      };

      return (
        <div>
          <div>Game Valid: {games[0]?.valid_for_prizes ? 'yes' : 'no'}</div>
          <div>Error: {error || 'none'}</div>
          <button onClick={handleToggle}>Toggle Validity</button>
        </div>
      );
    };

    const user = userEvent.setup();
    render(
      <TournamentDataProvider>
        <TestComponent />
      </TournamentDataProvider>
    );

    // Wait for initial data load
    await waitFor(() => {
      expect(screen.getByText('Game Valid: yes')).toBeVisible();
    });

    // Click toggle button
    const toggleButton = screen.getByRole('button', { name: /toggle validity/i });
    await user.click(toggleButton);

    // Should roll back to original state
    await waitFor(() => {
      expect(screen.getByText('Game Valid: yes')).toBeVisible();
      expect(screen.getByText('Error: Failed')).toBeVisible();
    });
  });
});
