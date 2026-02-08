import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import PlayersTable from '../components/tables/PlayersTable';
import { useTournamentData } from '../components/TournamentDataContext';

/**
 * Admin view for managing players
 * Displays all players with their statistics
 */
const AdminPlayersView = () => {
  const { players, loadingPlayers, playersError } = useTournamentData();
  const [sortBy, setSortBy] = useState('agaId');
  const [sortOrder, setSortOrder] = useState('asc');

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      // Set default sort order based on column type
      const descByDefault = ['age', 'gamesPlayed', 'gamesWon', 'gamesLost'];
      setSortOrder(descByDefault.includes(column) ? 'desc' : 'asc');
    }
  };

  const getSortedPlayers = () => {
    const playersCopy = [...players];

    return playersCopy.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'agaId':
          comparison = a.aga_id.localeCompare(b.aga_id);
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'agaRank':
          comparison = a.aga_rank.localeCompare(b.aga_rank);
          break;
        case 'age':
          comparison = a.age - b.age;
          break;
        case 'gamesPlayed':
          comparison = (a.games_played ?? 0) - (b.games_played ?? 0);
          break;
        case 'gamesWon':
          comparison = (a.games_won ?? 0) - (b.games_won ?? 0);
          break;
        case 'gamesLost':
          comparison = (a.games_lost ?? 0) - (b.games_lost ?? 0);
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  };

  if (loadingPlayers) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading players...</Typography>
      </Box>
    );
  }

  if (playersError) {
    return <Alert severity="error">{playersError}</Alert>;
  }

  if (players.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6" color="text.secondary">
          No players registered yet
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Typography variant="subtitle1" gutterBottom align="center" color="text.secondary">
        Total Players: {players.length}
      </Typography>
      <PlayersTable
        players={getSortedPlayers()}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
      />
    </>
  );
};

export default AdminPlayersView;
