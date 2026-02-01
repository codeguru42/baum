import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { gameService, playerService } from '../services/api';

const TournamentDataContext = createContext(null);

/**
 * Provider component for tournament data management
 * Manages players and games with optimistic updates
 */
export const TournamentDataProvider = ({ children }) => {
  // Players state
  const [players, setPlayers] = useState([]);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [playersError, setPlayersError] = useState(null);

  // Games state
  const [games, setGames] = useState([]);
  const [loadingGames, setLoadingGames] = useState(false);
  const [gamesError, setGamesError] = useState(null);

  // Fetch players from API
  const fetchPlayers = useCallback(async () => {
    try {
      setLoadingPlayers(true);
      const response = await playerService.getAll();
      setPlayers(response.data);
      setPlayersError(null);
    } catch (error) {
      setPlayersError('Failed to load players. Please try again later.');
      // eslint-disable-next-line no-console
      console.error('Error fetching players:', error);
    } finally {
      setLoadingPlayers(false);
    }
  }, []);

  // Fetch games from API
  const fetchGames = useCallback(async () => {
    try {
      setLoadingGames(true);
      const response = await gameService.getAll();
      setGames(response.data);
      setGamesError(null);
    } catch (error) {
      setGamesError('Failed to load games. Please try again later.');
      // eslint-disable-next-line no-console
      console.error('Error fetching games:', error);
    } finally {
      setLoadingGames(false);
    }
  }, []);

  // Create a new player
  const createPlayer = useCallback(async (playerData) => {
    try {
      const response = await playerService.create(playerData);
      setPlayers((prev) => [...prev, response.data]);
      return response.data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error creating player:', error);
      throw error;
    }
  }, []);

  // Update a player
  const updatePlayer = useCallback(async (agaId, playerData) => {
    try {
      const response = await playerService.update(agaId, playerData);
      setPlayers((prev) =>
        prev.map((player) => (player.aga_id === agaId ? response.data : player))
      );
      return response.data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error updating player:', error);
      throw error;
    }
  }, []);

  // Create a new game
  const createGame = useCallback(async (gameData) => {
    try {
      const response = await gameService.create(gameData);
      setGames((prev) => [...prev, response.data]);
      return response.data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error creating game:', error);
      throw error;
    }
  }, []);

  // Update a game
  const updateGame = useCallback(async (gameId, updates) => {
    try {
      const response = await gameService.update(gameId, updates);
      setGames((prev) => prev.map((game) => (game.id === gameId ? response.data : game)));
      return response.data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error updating game:', error);
      throw error;
    }
  }, []);

  // Toggle game validity with optimistic update
  const toggleGameValidity = useCallback(
    async (gameId) => {
      const game = games.find((g) => g.id === gameId);
      if (!game) {
        throw new Error('Game not found');
      }

      const optimisticUpdate = !game.valid_for_prizes;

      // Optimistic update - update UI immediately
      setGames((prev) =>
        prev.map((g) => (g.id === gameId ? { ...g, valid_for_prizes: optimisticUpdate } : g))
      );

      try {
        // Sync with server
        await gameService.update(gameId, { valid_for_prizes: optimisticUpdate });
      } catch (error) {
        // Rollback on failure
        setGames((prev) =>
          prev.map((g) => (g.id === gameId ? { ...g, valid_for_prizes: !optimisticUpdate } : g))
        );
        // eslint-disable-next-line no-console
        console.error('Error toggling game validity:', error);
        throw error;
      }
    },
    [games]
  );

  // Auto-fetch data on mount
  useEffect(() => {
    fetchPlayers();
    fetchGames();
  }, [fetchPlayers, fetchGames]);

  const value = {
    // Players
    players,
    loadingPlayers,
    playersError,
    fetchPlayers,
    createPlayer,
    updatePlayer,

    // Games
    games,
    loadingGames,
    gamesError,
    fetchGames,
    createGame,
    updateGame,
    toggleGameValidity,
  };

  return <TournamentDataContext.Provider value={value}>{children}</TournamentDataContext.Provider>;
};

/**
 * Hook to access tournament data
 * Must be used within TournamentDataProvider
 * @returns {Object} Tournament data and functions
 * @throws {Error} If used outside TournamentDataProvider
 */
export const useTournamentData = () => {
  const context = useContext(TournamentDataContext);
  if (!context) {
    throw new Error('useTournamentData must be used within a TournamentDataProvider');
  }
  return context;
};
