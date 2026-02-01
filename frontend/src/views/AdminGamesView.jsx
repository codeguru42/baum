import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useNotification } from '../components/NotificationContext';
import GamesTable from '../components/tables/GamesTable';
import { useTournamentData } from '../components/TournamentDataContext';

/**
 * Admin view for managing games
 * Displays all games with sorting and validity toggling
 */
const AdminGamesView = () => {
  const { showError } = useNotification();
  const { games, loadingGames, gamesError, toggleGameValidity } = useTournamentData();
  const [sortBy, setSortBy] = useState('ageDiff');
  const [sortOrder, setSortOrder] = useState('desc');

  const handleToggleValidity = async (gameId, _currentValidity) => {
    try {
      await toggleGameValidity(gameId);
    } catch (_err) {
      showError('Failed to update game validity. Please try again.');
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
          const ageDiffA = Math.abs(a.player1.age - a.player2.age);
          const ageDiffB = Math.abs(b.player1.age - b.player2.age);
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

  if (loadingGames) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading games...</Typography>
      </Box>
    );
  }

  if (gamesError) {
    return <Alert severity="error">{gamesError}</Alert>;
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
        onToggleValid={handleToggleValidity}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
      />
    </>
  );
};

export default AdminGamesView;
