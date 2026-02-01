import PropTypes from 'prop-types';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';

/**
 * Reusable table component for displaying player information
 * @param {Array} players - Array of player objects to display
 */
const PlayersTable = ({ players }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <TableContainer sx={{ mt: 3 }}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: 'primary.main' }}>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>AGA ID</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Rank</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Age</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '120px' }}>
              Games Played
            </TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '120px' }}>Won</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '120px' }}>
              Lost
            </TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Last Updated</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {players.map((player) => (
            <TableRow
              key={player.aga_id}
              sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}
            >
              <TableCell sx={{ fontWeight: 'medium' }}>{player.aga_id}</TableCell>
              <TableCell>{player.name}</TableCell>
              <TableCell>{player.aga_rank}</TableCell>
              <TableCell>{player.age}</TableCell>
              <TableCell sx={{ width: '120px' }}>{player.games_played ?? 0}</TableCell>
              <TableCell sx={{ width: '120px' }}>{player.games_won ?? 0}</TableCell>
              <TableCell sx={{ width: '120px' }}>{player.games_lost ?? 0}</TableCell>
              <TableCell>{formatDate(player.updated_at)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

PlayersTable.propTypes = {
  players: PropTypes.arrayOf(
    PropTypes.shape({
      aga_id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      aga_rank: PropTypes.string.isRequired,
      age: PropTypes.number.isRequired,
      games_played: PropTypes.number,
      games_won: PropTypes.number,
      games_lost: PropTypes.number,
      updated_at: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default PlayersTable;
