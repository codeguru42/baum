import React, { useState, useRef } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Alert,
  Snackbar,
  Box,
  Divider,
} from '@mui/material';
import { playerService, gameService } from '../services/api';

const GameResultForm = () => {
  const player1AgaIdRef = useRef(null);
  const player2AgaIdRef = useRef(null);

  const [player1, setPlayer1] = useState({
    aga_id: '',
    name: '',
    aga_rank: '',
    age: '',
  });

  const [player2, setPlayer2] = useState({
    aga_id: '',
    name: '',
    aga_rank: '',
    age: '',
  });

  const [gameInfo, setGameInfo] = useState({
    handicap: 0,
    player1_color: 'black',
    player2_color: 'white',
    rated: true,
    winner: 'player1',
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const [loading, setLoading] = useState({
    player1: false,
    player2: false,
    submit: false,
  });

  const handleAgaIdChange = async (playerNumber, agaId) => {
    if (playerNumber === 1) {
      setPlayer1({ ...player1, aga_id: agaId });
      if (agaId.length >= 3) {
        setLoading({ ...loading, player1: true });
        try {
          const response = await playerService.getByAgaId(agaId);
          setPlayer1({
            aga_id: response.data.aga_id,
            name: response.data.name,
            aga_rank: response.data.aga_rank,
            age: response.data.age,
          });
        } catch (error) {
          console.log('Player not found, will create new');
        }
        setLoading({ ...loading, player1: false });
        // Restore focus after auto-fill
        setTimeout(() => player1AgaIdRef.current?.focus(), 0);
      }
    } else {
      setPlayer2({ ...player2, aga_id: agaId });
      if (agaId.length >= 3) {
        setLoading({ ...loading, player2: true });
        try {
          const response = await playerService.getByAgaId(agaId);
          setPlayer2({
            aga_id: response.data.aga_id,
            name: response.data.name,
            aga_rank: response.data.aga_rank,
            age: response.data.age,
          });
        } catch (error) {
          console.log('Player not found, will create new');
        }
        setLoading({ ...loading, player2: false });
        // Restore focus after auto-fill
        setTimeout(() => player2AgaIdRef.current?.focus(), 0);
      }
    }
  };

  const handleColorChange = (playerNumber, color) => {
    if (playerNumber === 1) {
      setGameInfo({
        ...gameInfo,
        player1_color: color,
        player2_color: color === 'black' ? 'white' : 'black',
      });
    } else {
      setGameInfo({
        ...gameInfo,
        player2_color: color,
        player1_color: color === 'black' ? 'white' : 'black',
      });
    }
  };

  const validateForm = () => {
    const blackPlayer = gameInfo.player1_color === 'black' ? 'Black' : 'White';
    const whitePlayer = gameInfo.player2_color === 'white' ? 'White' : 'Black';
    
    if (!player1.aga_id || !player1.name || !player1.aga_rank || !player1.age) {
      setSnackbar({
        open: true,
        message: `Please fill in all ${blackPlayer} player information`,
        severity: 'error',
      });
      return false;
    }
    if (!player2.aga_id || !player2.name || !player2.aga_rank || !player2.age) {
      setSnackbar({
        open: true,
        message: `Please fill in all ${whitePlayer} player information`,
        severity: 'error',
      });
      return false;
    }
    if (player1.aga_id === player2.aga_id) {
      setSnackbar({
        open: true,
        message: 'Black and White must be different players',
        severity: 'error',
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading({ ...loading, submit: true });

    try {
      // Create or update players
      await Promise.all([
        playerService.create(player1).catch(() => playerService.update(player1.aga_id, player1)),
        playerService.create(player2).catch(() => playerService.update(player2.aga_id, player2)),
      ]);

      // Create game result
      const gameData = {
        player1: player1.aga_id,
        player2: player2.aga_id,
        player1_color: gameInfo.player1_color,
        player2_color: gameInfo.player2_color,
        handicap: parseInt(gameInfo.handicap),
        rated: gameInfo.rated,
        winner: gameInfo.winner,
      };

      await gameService.create(gameData);

      setSnackbar({
        open: true,
        message: 'Game result submitted successfully!',
        severity: 'success',
      });

      // Reset form
      setPlayer1({ aga_id: '', name: '', aga_rank: '', age: '' });
      setPlayer2({ aga_id: '', name: '', aga_rank: '', age: '' });
      setGameInfo({
        handicap: 0,
        player1_color: 'black',
        player2_color: 'white',
        rated: true,
        winner: 'player1',
      });

      // Restore focus to Player 1 AGA ID field
      setTimeout(() => player1AgaIdRef.current?.focus(), 0);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.detail || 'Error submitting game result',
        severity: 'error',
      });
    }

    setLoading({ ...loading, submit: false });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Go Tournament - Report Game Result
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={4}>
            {/* Player 1 Section */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom color="primary">
                {gameInfo.player1_color === 'black' ? 'Black' : 'White'}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  required
                  fullWidth
                  label="AGA ID Number"
                  value={player1.aga_id}
                  onChange={(e) => handleAgaIdChange(1, e.target.value)}
                  disabled={loading.player1}
                  inputRef={player1AgaIdRef}
                  autoFocus
                />
                <TextField
                  required
                  fullWidth
                  label="Name"
                  value={player1.name}
                  onChange={(e) => setPlayer1({ ...player1, name: e.target.value })}
                />
                <TextField
                  required
                  fullWidth
                  label="AGA Rank"
                  value={player1.aga_rank}
                  onChange={(e) => setPlayer1({ ...player1, aga_rank: e.target.value })}
                  placeholder="e.g., 5d, 3k"
                />
                <TextField
                  required
                  fullWidth
                  type="number"
                  label="Age"
                  value={player1.age}
                  onChange={(e) => setPlayer1({ ...player1, age: e.target.value })}
                />
                <FormControl fullWidth>
                  <InputLabel>Color</InputLabel>
                  <Select
                    value={gameInfo.player1_color}
                    label="Color"
                    onChange={(e) => handleColorChange(1, e.target.value)}
                  >
                    <MenuItem value="black">Black</MenuItem>
                    <MenuItem value="white">White</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Grid>

            {/* Player 2 Section */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom color="primary">
                {gameInfo.player2_color === 'white' ? 'White' : 'Black'}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  required
                  fullWidth
                  label="AGA ID Number"
                  value={player2.aga_id}
                  onChange={(e) => handleAgaIdChange(2, e.target.value)}
                  disabled={loading.player2}
                  inputRef={player2AgaIdRef}
                />
                <TextField
                  required
                  fullWidth
                  label="Name"
                  value={player2.name}
                  onChange={(e) => setPlayer2({ ...player2, name: e.target.value })}
                />
                <TextField
                  required
                  fullWidth
                  label="AGA Rank"
                  value={player2.aga_rank}
                  onChange={(e) => setPlayer2({ ...player2, aga_rank: e.target.value })}
                  placeholder="e.g., 5d, 3k"
                />
                <TextField
                  required
                  fullWidth
                  type="number"
                  label="Age"
                  value={player2.age}
                  onChange={(e) => setPlayer2({ ...player2, age: e.target.value })}
                />
                <FormControl fullWidth>
                  <InputLabel>Color</InputLabel>
                  <Select
                    value={gameInfo.player2_color}
                    label="Color"
                    onChange={(e) => handleColorChange(2, e.target.value)}
                  >
                    <MenuItem value="black">Black</MenuItem>
                    <MenuItem value="white">White</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Grid>

            {/* Game Information Section */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom color="primary">
                Game Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                required
                fullWidth
                type="number"
                label="Handicap"
                value={gameInfo.handicap}
                onChange={(e) => setGameInfo({ ...gameInfo, handicap: e.target.value })}
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth required>
                <InputLabel>Winner</InputLabel>
                <Select
                  value={gameInfo.winner}
                  label="Winner"
                  onChange={(e) => setGameInfo({ ...gameInfo, winner: e.target.value })}
                >
                  <MenuItem value="player1">
                    {gameInfo.player1_color === 'black' ? 'Black' : 'White'}
                  </MenuItem>
                  <MenuItem value="player2">
                    {gameInfo.player2_color === 'white' ? 'White' : 'Black'}
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={gameInfo.rated}
                    onChange={(e) => setGameInfo({ ...gameInfo, rated: e.target.checked })}
                  />
                }
                label="Rated Game"
              />
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading.submit}
              >
                {loading.submit ? 'Submitting...' : 'Submit Game Result'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default GameResultForm;
