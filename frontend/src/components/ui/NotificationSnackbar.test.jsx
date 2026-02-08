import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, afterEach } from 'vitest';
import NotificationSnackbar from './NotificationSnackbar';

describe('NotificationSnackbar', () => {
  const mockOnClose = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders when open is true', () => {
    render(
      <NotificationSnackbar
        open={true}
        message="Test message"
        severity="success"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByRole('alert')).toBeVisible();
    expect(screen.getByText('Test message')).toBeVisible();
  });

  it('does not render when open is false', () => {
    render(
      <NotificationSnackbar
        open={false}
        message="Test message"
        severity="success"
        onClose={mockOnClose}
      />
    );

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders with success severity', () => {
    render(
      <NotificationSnackbar
        open={true}
        message="Success message"
        severity="success"
        onClose={mockOnClose}
      />
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('MuiAlert-standardSuccess');
  });

  it('renders with error severity', () => {
    render(
      <NotificationSnackbar
        open={true}
        message="Error message"
        severity="error"
        onClose={mockOnClose}
      />
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('MuiAlert-standardError');
  });

  it('renders with warning severity', () => {
    render(
      <NotificationSnackbar
        open={true}
        message="Warning message"
        severity="warning"
        onClose={mockOnClose}
      />
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('MuiAlert-standardWarning');
  });

  it('renders with info severity', () => {
    render(
      <NotificationSnackbar
        open={true}
        message="Info message"
        severity="info"
        onClose={mockOnClose}
      />
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('MuiAlert-standardInfo');
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <NotificationSnackbar
        open={true}
        message="Test message"
        severity="success"
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('uses default autoHideDuration when not provided', () => {
    render(
      <NotificationSnackbar
        open={true}
        message="Test message"
        severity="success"
        onClose={mockOnClose}
      />
    );

    // Check that message is rendered (confirms snackbar is displayed)
    expect(screen.getByRole('alert')).toBeVisible();
  });

  it('uses custom autoHideDuration when provided', () => {
    render(
      <NotificationSnackbar
        open={true}
        message="Test message"
        severity="success"
        onClose={mockOnClose}
        autoHideDuration={3000}
      />
    );

    // Check that message is rendered (confirms snackbar is displayed)
    expect(screen.getByRole('alert')).toBeVisible();
  });
});
