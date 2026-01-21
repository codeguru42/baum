import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Box,
  Chip,
  Button,
  IconButton,
  Tooltip,
  TableSortLabel,
} from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';
import { gameService, playerService } from '../services/api';

const AdminPage = ({ view = 'games' }) => {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('ageDiff'); // 'ageDiff', 'rated'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'

  useEffect(() => {
    if (view === 'games') {
      fetchGames();
    } else {
      fetchPlayers();
    }
  }, [view]);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const response = await gameService.getAll();
      setGames(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load games. Please try again later.');
      console.error('Error fetching games:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const response = await playerService.getAll();
      setPlayers(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load players. Please try again later.');
      console.error('Error fetching players:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleGameValidity = async (gameId, currentValidity) => {
    try {
      await gameService.update(gameId, { valid_for_prizes: !currentValidity });
      // Update local state
      setGames(games.map(game => 
        game.id === gameId 
          ? { ...game, valid_for_prizes: !currentValidity }
          : game
      ));
    } catch (err) {
      setError('Failed to update game validity. Please try again.');
      console.error('Error updating game:', err);
    }
  };

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

  const handleSort = (column) => {
    if (sortBy === column) {
      // Toggle sort order if clicking the same column
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column and default to descending for ageDiff, ascending for rated
      setSortBy(column);
      setSortOrder(column === 'ageDiff' ? 'desc' : 'asc');
    }
  };

  const getSortedGames = () => {
    const gamesCopy = [...games];
    
    // First, separate valid and invalid games
    const validGames = gamesCopy.filter(game => game.valid_for_prizes);
    const invalidGames = gamesCopy.filter(game => !game.valid_for_prizes);
    
    // Sort valid games based on selected column
    const sortedValidGames = validGames.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'ageDiff') {
        const ageDiffA = Math.abs(a.player1_age - a.player2_age);
        const ageDiffB = Math.abs(b.player1_age - b.player2_age);
        comparison = ageDiffB - ageDiffA; // Default descending (largest first)
      } else if (sortBy === 'rated') {
        // Rated games first when ascending
        if (a.rated === b.rated) {
          comparison = 0;
        } else {
          comparison = a.rated ? -1 : 1;
        }
      }
      
      // Apply sort order
      return sortOrder === 'asc' ? -comparison : comparison;
    });
    
    // Sort invalid games the same way
    const sortedInvalidGames = invalidGames.sort((a, b) => {
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
    
    // Return valid games first, then invalid games
    return [...sortedValidGames, ...sortedInvalidGames];
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading {view}...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  const renderGamesTable = () => {
    const sortedGames = getSortedGames();
    
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
              <TableCell sx={{ color: 'white', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => handleSort('ageDiff')}>
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
              <TableCell sx={{ color: 'white', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => handleSort('rated')}>
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
            {sortedGames.map((game) => {
              // Determine which player is black and which is white
              const blackPlayer = game.player1_color === 'black' 
                ? { name: game.player1_name, id: game.player1, rank: game.player1_rank, age: game.player1_age }
                : { name: game.player2_name, id: game.player2, rank: game.player2_rank, age: game.player2_age };
              
              const whitePlayer = game.player1_color === 'white'
                ? { name: game.player1_name, id: game.player1, rank: game.player1_rank, age: game.player1_age }
                : { name: game.player2_name, id: game.player2, rank: game.player2_rank, age: game.player2_age };
              
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
                  <TableCell>{ageDiff}</TableCell>
                  <TableCell>{game.handicap}</TableCell>
                  <TableCell>
                    <Chip
                      label={winnerColor === 'black' ? 'Black' : 'White'}
                      size="small"
                      color="success"
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
                    <Tooltip title={game.valid_for_prizes ? 'Mark as invalid for prizes' : 'Mark as valid for prizes'}>
                      <IconButton
                        onClick={() => toggleGameValidity(game.id, game.valid_for_prizes)}
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

  const renderPlayersTable = () => (
    <TableContainer sx={{ mt: 3 }}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: 'primary.main' }}>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>AGA ID</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Rank</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Age</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '120px' }}>Games Played</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '120px' }}>Won</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '120px' }}>Lost</TableCell>
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

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Tournament Administration
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3, gap: 2 }}>
          <Button
            variant={view === 'games' ? 'contained' : 'outlined'}
            onClick={() => navigate('/admin/games')}
            size="large"
          >
            Games
          </Button>
          <Button
            variant={view === 'players' ? 'contained' : 'outlined'}
            onClick={() => navigate('/admin/players')}
            size="large"
          >
            Players
          </Button>
        </Box>

        <Typography variant="subtitle1" gutterBottom align="center" color="text.secondary">
          {view === 'games' ? `Total Games: ${games.length}` : `Total Players: ${players.length}`}
        </Typography>

        {view === 'games' && games.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No games recorded yet
            </Typography>
          </Box>
        ) : view === 'players' && players.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No players registered yet
            </Typography>
          </Box>
        ) : (
          view === 'games' ? renderGamesTable() : renderPlayersTable()
        )}
      </Paper>
    </Container>
  );
};

export default AdminPage;
