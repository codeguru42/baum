import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import PropTypes from 'prop-types';

/**
 * Reusable notification snackbar component for displaying success, error, warning, or info messages
 * @param {boolean} open - Whether the snackbar is visible
 * @param {string} message - The message to display
 * @param {string} severity - The severity level: 'success', 'error', 'warning', or 'info'
 * @param {function} onClose - Callback function when snackbar is closed
 * @param {number} autoHideDuration - Duration in milliseconds before auto-hiding (default: 6000)
 */
const NotificationSnackbar = ({
  open,
  message,
  severity = 'success',
  onClose,
  autoHideDuration = 6000,
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert onClose={onClose} severity={severity} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

NotificationSnackbar.propTypes = {
  open: PropTypes.bool.isRequired,
  message: PropTypes.string.isRequired,
  severity: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
  onClose: PropTypes.func.isRequired,
  autoHideDuration: PropTypes.number,
};

export default NotificationSnackbar;
