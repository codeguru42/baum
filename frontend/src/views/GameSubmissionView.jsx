import { useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useNotification } from '../components/NotificationContext';
import { gameService, playerService } from '../services/api';

/**
 * Game submission view for reporting game results
 * Includes player lookup and game details entry
 */
const GameSubmissionView = () => {
  const { showSuccess, showError } = useNotification();
  const playerBlackAgaIdRef = useRef(null);
  const playerWhiteAgaIdRef = useRef(null);

  const [playerBlack, setPlayerBlack] = useState({
    aga_id: '',
    name: '',
    aga_rank: '',
    age: '',
  });

  const [playerWhite, setPlayerWhite] = useState({
    aga_id: '',
    name: '',
    aga_rank: '',
    age: '',
  });

  const [gameInfo, setGameInfo] = useState({
    handicap: 0,
    rated: true,
    winner: 'black',
  });

  const [loading, setLoading] = useState({
    playerBlack: false,
    playerWhite: false,
    submit: false,
  });

  const handleAgaIdChange = async (playerColor, agaId) => {
    if (playerColor === 'black') {
      setPlayerBlack({ ...playerBlack, aga_id: agaId });
      if (agaId.length >= 3) {
        setLoading((prev) => ({ ...prev, playerBlack: true }));
        try {
          const response = await playerService.getByAgaId(agaId);
          setPlayerBlack({
            aga_id: response.data.aga_id,
            name: response.data.name,
            aga_rank: response.data.aga_rank,
            age: response.data.age,
          });
        } catch (_error) {
          // Player not found - will be created on form submission
        }
        setLoading((prev) => ({ ...prev, playerBlack: false }));
        // Restore focus after auto-fill
        setTimeout(() => playerBlackAgaIdRef.current?.focus(), 0);
      }
    } else {
      setPlayerWhite({ ...playerWhite, aga_id: agaId });
      if (agaId.length >= 3) {
        setLoading((prev) => ({ ...prev, playerWhite: true }));
        try {
          const response = await playerService.getByAgaId(agaId);
          setPlayerWhite({
            aga_id: response.data.aga_id,
            name: response.data.name,
            aga_rank: response.data.aga_rank,
            age: response.data.age,
          });
        } catch (_error) {
          // Player not found - will be created on form submission
        }
        setLoading((prev) => ({ ...prev, playerWhite: false }));
        // Restore focus after auto-fill
        setTimeout(() => playerWhiteAgaIdRef.current?.focus(), 0);
      }
    }
  };

  const validateForm = () => {
    if (!playerBlack.aga_id || !playerBlack.name || !playerBlack.aga_rank || !playerBlack.age) {
      showError('Please fill in all Black player information');
      return false;
    }
    if (!playerWhite.aga_id || !playerWhite.name || !playerWhite.aga_rank || !playerWhite.age) {
      showError('Please fill in all White player information');
      return false;
    }
    if (playerBlack.aga_id === playerWhite.aga_id) {
      showError('Black and White must be different players');
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
        playerService
          .create(playerBlack)
          .catch(() => playerService.update(playerBlack.aga_id, playerBlack)),
        playerService
          .create(playerWhite)
          .catch(() => playerService.update(playerWhite.aga_id, playerWhite)),
      ]);

      // Create game result
      const gameData = {
        player_black_id: playerBlack.aga_id,
        player_white_id: playerWhite.aga_id,
        handicap: parseInt(gameInfo.handicap),
        rated: gameInfo.rated,
        winner: gameInfo.winner,
      };

      await gameService.create(gameData);

      showSuccess('Game result submitted successfully!');

      // Reset form
      setPlayerBlack({ aga_id: '', name: '', aga_rank: '', age: '' });
      setPlayerWhite({ aga_id: '', name: '', aga_rank: '', age: '' });
      setGameInfo({
        handicap: 0,
        rated: true,
        winner: 'black',
      });

      // Restore focus to Black player AGA ID field
      setTimeout(() => playerBlackAgaIdRef.current?.focus(), 0);
    } catch (error) {
      showError(error.response?.data?.detail || 'Error submitting game result');
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
            {/* Black Player Section */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h6" gutterBottom color="primary">
                Black
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  required
                  fullWidth
                  label="AGA ID Number"
                  value={playerBlack.aga_id}
                  onChange={(e) => handleAgaIdChange('black', e.target.value)}
                  disabled={loading.playerBlack}
                  inputRef={playerBlackAgaIdRef}
                />
                <TextField
                  required
                  fullWidth
                  label="Name"
                  value={playerBlack.name}
                  onChange={(e) => setPlayerBlack({ ...playerBlack, name: e.target.value })}
                />
                <TextField
                  required
                  fullWidth
                  label="AGA Rank"
                  value={playerBlack.aga_rank}
                  onChange={(e) => setPlayerBlack({ ...playerBlack, aga_rank: e.target.value })}
                  placeholder="e.g., 5d, 3k"
                />
                <TextField
                  required
                  fullWidth
                  type="number"
                  label="Age"
                  value={playerBlack.age}
                  onChange={(e) => setPlayerBlack({ ...playerBlack, age: e.target.value })}
                />
              </Box>
            </Grid>

            {/* White Player Section */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h6" gutterBottom color="primary">
                White
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  required
                  fullWidth
                  label="AGA ID Number"
                  value={playerWhite.aga_id}
                  onChange={(e) => handleAgaIdChange('white', e.target.value)}
                  disabled={loading.playerWhite}
                  inputRef={playerWhiteAgaIdRef}
                />
                <TextField
                  required
                  fullWidth
                  label="Name"
                  value={playerWhite.name}
                  onChange={(e) => setPlayerWhite({ ...playerWhite, name: e.target.value })}
                />
                <TextField
                  required
                  fullWidth
                  label="AGA Rank"
                  value={playerWhite.aga_rank}
                  onChange={(e) => setPlayerWhite({ ...playerWhite, aga_rank: e.target.value })}
                  placeholder="e.g., 5d, 3k"
                />
                <TextField
                  required
                  fullWidth
                  type="number"
                  label="Age"
                  value={playerWhite.age}
                  onChange={(e) => setPlayerWhite({ ...playerWhite, age: e.target.value })}
                />
              </Box>
            </Grid>

            {/* Game Information Section */}
            <Grid size={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom color="primary">
                Game Information
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
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

            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth required>
                <InputLabel>Winner</InputLabel>
                <Select
                  value={gameInfo.winner}
                  label="Winner"
                  onChange={(e) => setGameInfo({ ...gameInfo, winner: e.target.value })}
                >
                  <MenuItem value="black">Black</MenuItem>
                  <MenuItem value="white">White</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
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
            <Grid size={12}>
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
    </Container>
  );
};

export default GameSubmissionView;
