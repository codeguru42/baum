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
  const [sortBy, setSortBy] = useState('date');
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
      // Set default sort order based on column type
      const descByDefault = ['ageDiff', 'date', 'blackAge', 'whiteAge', 'handicap'];
      setSortOrder(descByDefault.includes(column) ? 'desc' : 'asc');
    }
  };

  const getSortedGames = () => {
    const gamesCopy = [...games];
    const validGames = gamesCopy.filter((game) => game.valid_for_prizes);
    const invalidGames = gamesCopy.filter((game) => !game.valid_for_prizes);

    const sortGames = (gamesToSort) => {
      return gamesToSort.sort((a, b) => {
        let comparison = 0;

        switch (sortBy) {
          case 'blackPlayer':
            comparison = a.player_black.name.localeCompare(b.player_black.name);
            break;
          case 'blackAgaId':
            comparison = a.player_black.id.localeCompare(b.player_black.id);
            break;
          case 'blackRank':
            comparison = a.player_black.rank.localeCompare(b.player_black.rank);
            break;
          case 'blackAge':
            comparison = a.player_black.age - b.player_black.age;
            break;
          case 'whitePlayer':
            comparison = a.player_white.name.localeCompare(b.player_white.name);
            break;
          case 'whiteAgaId':
            comparison = a.player_white.id.localeCompare(b.player_white.id);
            break;
          case 'whiteRank':
            comparison = a.player_white.rank.localeCompare(b.player_white.rank);
            break;
          case 'whiteAge':
            comparison = a.player_white.age - b.player_white.age;
            break;
          case 'ageDiff': {
            const ageDiffA = Math.abs(a.player_black.age - a.player_white.age);
            const ageDiffB = Math.abs(b.player_black.age - b.player_white.age);
            comparison = ageDiffA - ageDiffB;
            break;
          }
          case 'handicap':
            comparison = a.handicap - b.handicap;
            break;
          case 'winner':
            comparison = a.winner.localeCompare(b.winner);
            break;
          case 'rated':
            comparison = a.rated === b.rated ? 0 : a.rated ? -1 : 1;
            break;
          case 'validForPrizes':
            comparison =
              a.valid_for_prizes === b.valid_for_prizes ? 0 : a.valid_for_prizes ? -1 : 1;
            break;
          case 'date':
            comparison = new Date(a.created_at) - new Date(b.created_at);
            break;
          default:
            comparison = 0;
        }

        return sortOrder === 'asc' ? comparison : -comparison;
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
