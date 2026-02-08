import { useRef, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
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
import { Controller, useForm } from 'react-hook-form';
import { useNotification } from '../components/NotificationContext';
import PlayerFieldsSection from '../components/PlayerFieldsSection';
import { gameService, playerService } from '../services/api';
import { gameSubmissionSchema } from '../validation/gameSubmissionSchema';

/**
 * Game submission view for reporting game results
 * Includes player lookup and game details entry
 */
const GameSubmissionView = () => {
  const { showSuccess, showError } = useNotification();
  const playerBlackAgaIdRef = useRef(null);
  const playerWhiteAgaIdRef = useRef(null);

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    setValue,
    trigger,
    reset,
    setFocus,
    formState: { isSubmitting },
  } = useForm({
    resolver: yupResolver(gameSubmissionSchema),
    defaultValues: {
      playerBlack: { aga_id: '', name: '', aga_rank: '', age: '' },
      playerWhite: { aga_id: '', name: '', aga_rank: '', age: '' },
      handicap: 0,
      rated: true,
      winner: 'black',
    },
    mode: 'onBlur', // Validate on blur for better UX
  });

  // Keep separate loading state for auto-lookup (not form submission)
  const [loading, setLoading] = useState({
    playerBlack: false,
    playerWhite: false,
  });

  const handleAgaIdChange = async (playerColor, agaId) => {
    const playerKey = playerColor === 'black' ? 'playerBlack' : 'playerWhite';
    const loadingKey = playerColor;

    // Update AGA ID field immediately
    setValue(`${playerKey}.aga_id`, agaId, { shouldValidate: true });

    // Auto-lookup if 3+ characters entered
    if (agaId.length >= 3) {
      setLoading((prev) => ({ ...prev, [loadingKey]: true }));

      try {
        const response = await playerService.getByAgaId(agaId);

        // Auto-fill all fields from API response
        setValue(`${playerKey}.aga_id`, response.data.aga_id);
        setValue(`${playerKey}.name`, response.data.name);
        setValue(`${playerKey}.aga_rank`, response.data.aga_rank);
        setValue(`${playerKey}.age`, response.data.age);

        // Trigger validation on all auto-filled fields
        await trigger([
          `${playerKey}.aga_id`,
          `${playerKey}.name`,
          `${playerKey}.aga_rank`,
          `${playerKey}.age`,
        ]);
      } catch (_error) {
        // Player not found - will be created on form submission
        // No action needed, user can fill fields manually
      }

      setLoading((prev) => ({ ...prev, [loadingKey]: false }));

      // Restore focus to AGA ID field after auto-fill
      const ref = playerColor === 'black' ? playerBlackAgaIdRef : playerWhiteAgaIdRef;
      setTimeout(() => ref.current?.focus(), 0);
    }
  };

  // Focus on first error field when validation fails
  const onInvalid = (errors) => {
    const firstErrorField = Object.keys(errors)[0];
    if (firstErrorField) {
      setFocus(firstErrorField);
    }
  };

  const onSubmit = async (data) => {
    try {
      // Create or update players
      await Promise.all([
        playerService
          .create(data.playerBlack)
          .catch(() => playerService.update(data.playerBlack.aga_id, data.playerBlack)),
        playerService
          .create(data.playerWhite)
          .catch(() => playerService.update(data.playerWhite.aga_id, data.playerWhite)),
      ]);

      // Create game result
      const gameData = {
        player_black_id: data.playerBlack.aga_id,
        player_white_id: data.playerWhite.aga_id,
        handicap: parseInt(data.handicap),
        rated: data.rated,
        winner: data.winner,
      };

      await gameService.create(gameData);

      showSuccess('Game result submitted successfully!');

      // Reset form to default values
      reset();

      // Restore focus to Black player AGA ID field
      setTimeout(() => playerBlackAgaIdRef.current?.focus(), 0);
    } catch (error) {
      showError(error.response?.data?.detail || 'Error submitting game result');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Go Tournament - Report Game Result
        </Typography>

        <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate>
          <Grid container spacing={4}>
            {/* Black Player Section */}
            <PlayerFieldsSection
              playerColor="black"
              fieldNamePrefix="playerBlack"
              control={control}
              onAgaIdChange={handleAgaIdChange}
              isLoading={loading.playerBlack}
              agaIdInputRef={playerBlackAgaIdRef}
            />

            {/* White Player Section */}
            <PlayerFieldsSection
              playerColor="white"
              fieldNamePrefix="playerWhite"
              control={control}
              onAgaIdChange={handleAgaIdChange}
              isLoading={loading.playerWhite}
              agaIdInputRef={playerWhiteAgaIdRef}
            />

            {/* Game Information Section */}
            <Grid size={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom color="primary">
                Game Information
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Controller
                name="handicap"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    label="Handicap"
                    inputProps={{ min: 0 }}
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Controller
                name="winner"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth error={!!error}>
                    <InputLabel>Winner</InputLabel>
                    <Select {...field} label="Winner">
                      <MenuItem value="black">Black</MenuItem>
                      <MenuItem value="white">White</MenuItem>
                    </Select>
                    {error && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                        {error.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Controller
                name="rated"
                control={control}
                render={({ field: { value, onChange, ...field } }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        {...field}
                        checked={value}
                        onChange={(e) => onChange(e.target.checked)}
                      />
                    }
                    label="Rated Game"
                  />
                )}
              />
            </Grid>

            {/* Submit Button */}
            <Grid size={12}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Game Result'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default GameSubmissionView;
