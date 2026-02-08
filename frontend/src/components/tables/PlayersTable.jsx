import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import PropTypes from 'prop-types';

/**
 * Table header component with sortable columns
 */
const PlayersTableHeader = ({ sortBy, sortOrder, onSort }) => {
  const createSortableHeader = (label, sortKey, defaultDirection = 'asc') => (
    <TableCell
      sx={{ color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
      onClick={() => onSort(sortKey)}
    >
      <TableSortLabel
        active={sortBy === sortKey}
        direction={sortBy === sortKey ? sortOrder : defaultDirection}
        sx={{
          color: 'white !important',
          '&:hover': { color: 'white !important' },
          '& .MuiTableSortLabel-icon': { color: 'white !important' },
        }}
      >
        {label}
      </TableSortLabel>
    </TableCell>
  );

  return (
    <TableHead>
      <TableRow sx={{ backgroundColor: 'primary.main' }}>
        {createSortableHeader('AGA ID', 'agaId')}
        {createSortableHeader('Name', 'name')}
        {createSortableHeader('Rank', 'agaRank')}
        {createSortableHeader('Age', 'age', 'desc')}
        {createSortableHeader('Games Played', 'gamesPlayed', 'desc')}
        {createSortableHeader('Won', 'gamesWon', 'desc')}
        {createSortableHeader('Lost', 'gamesLost', 'desc')}
        {createSortableHeader('Last Updated', 'updatedAt', 'desc')}
      </TableRow>
    </TableHead>
  );
};

PlayersTableHeader.propTypes = {
  sortBy: PropTypes.string.isRequired,
  sortOrder: PropTypes.oneOf(['asc', 'desc']).isRequired,
  onSort: PropTypes.func.isRequired,
};

/**
 * Reusable table component for displaying player information
 * @param {Array} players - Array of player objects to display
 * @param {string} sortBy - Current sort column
 * @param {string} sortOrder - Current sort order ('asc' or 'desc')
 * @param {Function} onSort - Callback when sort is changed
 */
const PlayersTable = ({ players, sortBy, sortOrder, onSort }) => {
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
        <PlayersTableHeader sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
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
  sortBy: PropTypes.string.isRequired,
  sortOrder: PropTypes.oneOf(['asc', 'desc']).isRequired,
  onSort: PropTypes.func.isRequired,
};

export default PlayersTable;
