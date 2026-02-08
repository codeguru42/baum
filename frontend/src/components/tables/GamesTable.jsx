import { Cancel, CheckCircle } from '@mui/icons-material';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Tooltip from '@mui/material/Tooltip';
import PropTypes from 'prop-types';

/**
 * Table header component with sortable columns
 */
const GamesTableHeader = ({ sortBy, sortOrder, onSort }) => {
  return (
    <TableHead>
      <TableRow sx={{ backgroundColor: 'primary.main' }}>
        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Black Player</TableCell>
        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>AGA ID</TableCell>
        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Rank</TableCell>
        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Age</TableCell>
        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>White Player</TableCell>
        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>AGA ID</TableCell>
        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Rank</TableCell>
        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Age</TableCell>
        <TableCell
          sx={{ color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
          onClick={() => onSort('ageDiff')}
        >
          <TableSortLabel
            active={sortBy === 'ageDiff'}
            direction={sortBy === 'ageDiff' ? sortOrder : 'desc'}
            sx={{
              color: 'white !important',
              '&:hover': { color: 'white !important' },
              '& .MuiTableSortLabel-icon': { color: 'white !important' },
            }}
          >
            Age Diff
          </TableSortLabel>
        </TableCell>
        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Handicap</TableCell>
        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Winner</TableCell>
        <TableCell
          sx={{ color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
          onClick={() => onSort('rated')}
        >
          <TableSortLabel
            active={sortBy === 'rated'}
            direction={sortBy === 'rated' ? sortOrder : 'asc'}
            sx={{
              color: 'white !important',
              '&:hover': { color: 'white !important' },
              '& .MuiTableSortLabel-icon': { color: 'white !important' },
            }}
          >
            Rated
          </TableSortLabel>
        </TableCell>
        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Valid for Prizes</TableCell>
        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
      </TableRow>
    </TableHead>
  );
};

GamesTableHeader.propTypes = {
  sortBy: PropTypes.oneOf(['ageDiff', 'rated']).isRequired,
  sortOrder: PropTypes.oneOf(['asc', 'desc']).isRequired,
  onSort: PropTypes.func.isRequired,
};

/**
 * Table row component for a single game
 */
const GamesTableRow = ({ game, onToggleValid }) => {
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

  // Players are now directly accessible as player_black and player_white
  const blackPlayer = game.player_black;
  const whitePlayer = game.player_white;

  // Winner is now 'black' or 'white'
  const winnerColor = game.winner;

  // Calculate age difference
  const ageDiff = Math.abs(game.player_black.age - game.player_white.age);

  return (
    <TableRow key={game.id} sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}>
      <TableCell sx={{ fontWeight: 'medium' }}>{blackPlayer.name}</TableCell>
      <TableCell>{blackPlayer.id}</TableCell>
      <TableCell>{blackPlayer.rank}</TableCell>
      <TableCell>{blackPlayer.age}</TableCell>
      <TableCell sx={{ fontWeight: 'medium' }}>{whitePlayer.name}</TableCell>
      <TableCell>{whitePlayer.id}</TableCell>
      <TableCell>{whitePlayer.rank}</TableCell>
      <TableCell>{whitePlayer.age}</TableCell>
      <TableCell>
        <Chip label={ageDiff} size="small" color={ageDiff >= 40 ? 'success' : 'warning'} />
      </TableCell>
      <TableCell>{game.handicap}</TableCell>
      <TableCell>
        <Chip
          label={winnerColor === 'black' ? 'Black' : 'White'}
          size="small"
          sx={
            winnerColor === 'black'
              ? { backgroundColor: '#000', color: '#fff' }
              : { backgroundColor: '#fff', color: '#000', border: '1px solid #000' }
          }
        />
      </TableCell>
      <TableCell>
        <Chip
          label={game.rated ? 'Yes' : 'No'}
          size="small"
          color={game.rated ? 'primary' : 'default'}
        />
      </TableCell>
      <TableCell>
        <Tooltip
          title={game.valid_for_prizes ? 'Mark as invalid for prizes' : 'Mark as valid for prizes'}
        >
          <IconButton
            onClick={() => onToggleValid(game.id, game.valid_for_prizes)}
            color={game.valid_for_prizes ? 'success' : 'error'}
            size="small"
          >
            {game.valid_for_prizes ? <CheckCircle /> : <Cancel />}
          </IconButton>
        </Tooltip>
      </TableCell>
      <TableCell>{formatDate(game.created_at)}</TableCell>
    </TableRow>
  );
};

GamesTableRow.propTypes = {
  game: PropTypes.shape({
    id: PropTypes.number.isRequired,
    player_black: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      rank: PropTypes.string.isRequired,
      age: PropTypes.number.isRequired,
      color: PropTypes.oneOf(['black']).isRequired,
    }).isRequired,
    player_white: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      rank: PropTypes.string.isRequired,
      age: PropTypes.number.isRequired,
      color: PropTypes.oneOf(['white']).isRequired,
    }).isRequired,
    handicap: PropTypes.number.isRequired,
    winner: PropTypes.oneOf(['black', 'white']).isRequired,
    rated: PropTypes.bool.isRequired,
    valid_for_prizes: PropTypes.bool.isRequired,
    created_at: PropTypes.string.isRequired,
  }).isRequired,
  onToggleValid: PropTypes.func.isRequired,
};

/**
 * Reusable table component for displaying game results
 * @param {Array} games - Array of game objects to display
 * @param {Function} onToggleValid - Callback when validity toggle button is clicked
 * @param {string} sortBy - Current sort column ('ageDiff' or 'rated')
 * @param {string} sortOrder - Current sort order ('asc' or 'desc')
 * @param {Function} onSort - Callback when sort is changed
 */
const GamesTable = ({ games, onToggleValid, sortBy, sortOrder, onSort }) => {
  return (
    <TableContainer sx={{ mt: 3 }}>
      <Table>
        <GamesTableHeader sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
        <TableBody>
          {games.map((game) => (
            <GamesTableRow key={game.id} game={game} onToggleValid={onToggleValid} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

GamesTable.propTypes = {
  games: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      player_black: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        rank: PropTypes.string.isRequired,
        age: PropTypes.number.isRequired,
        color: PropTypes.oneOf(['black']).isRequired,
      }).isRequired,
      player_white: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        rank: PropTypes.string.isRequired,
        age: PropTypes.number.isRequired,
        color: PropTypes.oneOf(['white']).isRequired,
      }).isRequired,
      handicap: PropTypes.number.isRequired,
      winner: PropTypes.oneOf(['black', 'white']).isRequired,
      rated: PropTypes.bool.isRequired,
      valid_for_prizes: PropTypes.bool.isRequired,
      created_at: PropTypes.string.isRequired,
    })
  ).isRequired,
  onToggleValid: PropTypes.func.isRequired,
  sortBy: PropTypes.oneOf(['ageDiff', 'rated']).isRequired,
  sortOrder: PropTypes.oneOf(['asc', 'desc']).isRequired,
  onSort: PropTypes.func.isRequired,
};

export default GamesTable;
