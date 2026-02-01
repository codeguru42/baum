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
      <PlayersTable players={players} />
    </>
  );
};

export default AdminPlayersView;
