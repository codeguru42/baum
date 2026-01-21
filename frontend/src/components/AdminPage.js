import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { gameService } from '../services/api';

const AdminPage = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      console.error('Error fetching games:', err);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading games...</Typography>
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

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Tournament Games Administration
        </Typography>
        <Typography variant="subtitle1" gutterBottom align="center" color="text.secondary">
          Total Games: {games.length}
        </Typography>

        {games.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No games recorded yet
            </Typography>
          </Box>
        ) : (
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
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Handicap</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Winner</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Rated</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {games.map((game) => {
                  // Determine which player is black and which is white
                  const blackPlayer = game.player1_color === 'black' 
                    ? { name: game.player1_name, id: game.player1, rank: game.player1_rank, age: game.player1_age }
                    : { name: game.player2_name, id: game.player2, rank: game.player2_rank, age: game.player2_age };
                  
                  const whitePlayer = game.player1_color === 'white'
                    ? { name: game.player1_name, id: game.player1, rank: game.player1_rank, age: game.player1_age }
                    : { name: game.player2_name, id: game.player2, rank: game.player2_rank, age: game.player2_age };
                  
                  const winnerColor = game.winner === 'player1' ? game.player1_color : game.player2_color;
                  
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
                      <TableCell>{formatDate(game.created_at)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
};

export default AdminPage;
