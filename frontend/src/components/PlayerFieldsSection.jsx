import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Controller } from 'react-hook-form';

/**
 * Reusable player fields section component
 * Used for both Black and White player input sections
 *
 * @param {Object} props
 * @param {string} props.playerColor - 'black' or 'white'
 * @param {string} props.fieldNamePrefix - Form field name prefix (e.g., 'playerBlack')
 * @param {Object} props.control - React Hook Form control object
 * @param {Function} props.onAgaIdChange - Callback for AGA ID changes (for auto-lookup)
 * @param {boolean} props.isLoading - Whether auto-lookup is in progress
 * @param {React.Ref} props.agaIdInputRef - Ref for the AGA ID input field
 */
const PlayerFieldsSection = ({
  playerColor,
  fieldNamePrefix,
  control,
  onAgaIdChange,
  isLoading,
  agaIdInputRef,
}) => {
  const colorLabel = playerColor.charAt(0).toUpperCase() + playerColor.slice(1);

  return (
    <Grid size={{ xs: 12, md: 6 }}>
      <Typography variant="h6" gutterBottom color="primary">
        {colorLabel}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Controller
          name={`${fieldNamePrefix}.aga_id`}
          control={control}
          render={({ field: { onChange: _onChange, ...field }, fieldState: { error } }) => (
            <TextField
              {...field}
              fullWidth
              label="AGA ID Number"
              onChange={(e) => onAgaIdChange(playerColor, e.target.value)}
              disabled={isLoading}
              inputRef={agaIdInputRef}
              error={!!error}
              helperText={error?.message}
            />
          )}
        />
        <Controller
          name={`${fieldNamePrefix}.name`}
          control={control}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              fullWidth
              label="Name"
              error={!!error}
              helperText={error?.message}
            />
          )}
        />
        <Controller
          name={`${fieldNamePrefix}.aga_rank`}
          control={control}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              fullWidth
              label="AGA Rank"
              placeholder="e.g., 5d, 3k"
              error={!!error}
              helperText={error?.message}
            />
          )}
        />
        <Controller
          name={`${fieldNamePrefix}.age`}
          control={control}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              fullWidth
              type="number"
              label="Age"
              error={!!error}
              helperText={error?.message}
            />
          )}
        />
      </Box>
    </Grid>
  );
};

export default PlayerFieldsSection;
