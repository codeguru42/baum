import { createContext, useCallback, useContext, useState } from 'react';
import NotificationSnackbar from './ui/NotificationSnackbar';

const NotificationContext = createContext(null);

/**
 * Provider component for centralized notification management
 * Manages a queue of notifications and displays them one at a time
 */
export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const showNotification = useCallback((message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity,
    });
  }, []);

  const showSuccess = useCallback(
    (message) => {
      showNotification(message, 'success');
    },
    [showNotification]
  );

  const showError = useCallback(
    (message) => {
      showNotification(message, 'error');
    },
    [showNotification]
  );

  const showWarning = useCallback(
    (message) => {
      showNotification(message, 'warning');
    },
    [showNotification]
  );

  const showInfo = useCallback(
    (message) => {
      showNotification(message, 'info');
    },
    [showNotification]
  );

  const handleClose = useCallback(() => {
    setNotification((prev) => ({ ...prev, open: false }));
  }, []);

  const value = {
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationSnackbar
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleClose}
      />
    </NotificationContext.Provider>
  );
};

/**
 * Hook to access notification functions
 * Must be used within NotificationProvider
 * @returns {Object} Notification functions: showSuccess, showError, showWarning, showInfo
 * @throws {Error} If used outside NotificationProvider
 */
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
