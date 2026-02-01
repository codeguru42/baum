import { CheckCircle, Cancel } from '@mui/icons-material';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  TableSortLabel,
} from '@mui/material';
import PropTypes from 'prop-types';

/**
 * Reusable table component for displaying game results
 * @param {Array} games - Array of game objects to display
 * @param {Function} onToggleValid - Callback when validity toggle button is clicked
 * @param {string} sortBy - Current sort column ('ageDiff' or 'rated')
 * @param {string} sortOrder - Current sort order ('asc' or 'desc')
 * @param {Function} onSort - Callback when sort is changed
 */
const GamesTable = ({ games, onToggleValid, sortBy, sortOrder, onSort }) => {
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
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Game ID</TableCell>
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
        <TableBody>
          {games.map((game) => {
            // Determine which player is black and which is white
            const blackPlayer =
              game.player1_color === 'black'
                ? {
                    name: game.player1_name,
                    id: game.player1,
                    rank: game.player1_rank,
                    age: game.player1_age,
                  }
                : {
                    name: game.player2_name,
                    id: game.player2,
                    rank: game.player2_rank,
                    age: game.player2_age,
                  };

            const whitePlayer =
              game.player1_color === 'white'
                ? {
                    name: game.player1_name,
                    id: game.player1,
                    rank: game.player1_rank,
                    age: game.player1_age,
                  }
                : {
                    name: game.player2_name,
                    id: game.player2,
                    rank: game.player2_rank,
                    age: game.player2_age,
                  };

            const winnerColor = game.winner === 'player1' ? game.player1_color : game.player2_color;
            const ageDiff = Math.abs(game.player1_age - game.player2_age);

            return (
              <TableRow
                key={game.id}
                sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}
              >
                <TableCell>{game.id}</TableCell>
                <TableCell sx={{ fontWeight: 'medium' }}>{blackPlayer.name}</TableCell>
                <TableCell>{blackPlayer.id}</TableCell>
                <TableCell>{blackPlayer.rank}</TableCell>
                <TableCell>{blackPlayer.age}</TableCell>
                <TableCell sx={{ fontWeight: 'medium' }}>{whitePlayer.name}</TableCell>
                <TableCell>{whitePlayer.id}</TableCell>
                <TableCell>{whitePlayer.rank}</TableCell>
                <TableCell>{whitePlayer.age}</TableCell>
                <TableCell>
                  <Chip
                    label={ageDiff}
                    size="small"
                    color={ageDiff >= 40 ? 'success' : 'warning'}
                  />
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
                    title={
                      game.valid_for_prizes
                        ? 'Mark as invalid for prizes'
                        : 'Mark as valid for prizes'
                    }
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
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

GamesTable.propTypes = {
  games: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      player1: PropTypes.string.isRequired,
      player1_name: PropTypes.string.isRequired,
      player1_rank: PropTypes.string.isRequired,
      player1_age: PropTypes.number.isRequired,
      player1_color: PropTypes.string.isRequired,
      player2: PropTypes.string.isRequired,
      player2_name: PropTypes.string.isRequired,
      player2_rank: PropTypes.string.isRequired,
      player2_age: PropTypes.number.isRequired,
      player2_color: PropTypes.string.isRequired,
      handicap: PropTypes.number.isRequired,
      winner: PropTypes.string.isRequired,
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
