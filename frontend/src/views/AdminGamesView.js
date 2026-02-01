import { useState, useEffect } from 'react';
import { Typography, CircularProgress, Alert, Box } from '@mui/material';
import GamesTable from '../components/tables/GamesTable';
import { gameService } from '../services/api';

/**
 * Admin view for managing games
 * Displays all games with sorting and validity toggling
 */
const AdminGamesView = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('ageDiff');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const response = await gameService.getAll();
      setGames(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load games. Please try again later.');
      // eslint-disable-next-line no-console
      console.error('Error fetching games:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleGameValidity = async (gameId, currentValidity) => {
    try {
      await gameService.update(gameId, { valid_for_prizes: !currentValidity });
      setGames(
        games.map((game) =>
          game.id === gameId ? { ...game, valid_for_prizes: !currentValidity } : game
        )
      );
    } catch (err) {
      setError('Failed to update game validity. Please try again.');
      // eslint-disable-next-line no-console
      console.error('Error updating game:', err);
    }
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder(column === 'ageDiff' ? 'desc' : 'asc');
    }
  };

  const getSortedGames = () => {
    const gamesCopy = [...games];
    const validGames = gamesCopy.filter((game) => game.valid_for_prizes);
    const invalidGames = gamesCopy.filter((game) => !game.valid_for_prizes);

    const sortGames = (gamesToSort) => {
      return gamesToSort.sort((a, b) => {
        let comparison = 0;

        if (sortBy === 'ageDiff') {
          const ageDiffA = Math.abs(a.player1_age - a.player2_age);
          const ageDiffB = Math.abs(b.player1_age - b.player2_age);
          comparison = ageDiffB - ageDiffA;
        } else if (sortBy === 'rated') {
          if (a.rated === b.rated) {
            comparison = 0;
          } else {
            comparison = a.rated ? -1 : 1;
          }
        }

        return sortOrder === 'asc' ? -comparison : comparison;
      });
    };

    return [...sortGames(validGames), ...sortGames(invalidGames)];
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading games...</Typography>
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (games.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6" color="text.secondary">
          No games recorded yet
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Typography variant="subtitle1" gutterBottom align="center" color="text.secondary">
        Total Games: {games.length}
      </Typography>
      <GamesTable
        games={getSortedGames()}
        onToggleValid={toggleGameValidity}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
      />
    </>
  );
};

export default AdminGamesView;
