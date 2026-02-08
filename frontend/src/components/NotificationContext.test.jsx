import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { NotificationProvider, useNotification } from './NotificationContext';

describe('NotificationContext', () => {
  it('renders children correctly', () => {
    render(
      <NotificationProvider>
        <div>Test Child</div>
      </NotificationProvider>
    );

    expect(screen.getByText('Test Child')).toBeVisible();
  });

  it('throws error when useNotification is used outside provider', () => {
    // Suppress console.error for this test
    // eslint-disable-next-line no-console
    const originalError = console.error;
    // eslint-disable-next-line no-console
    console.error = () => {};

    const TestComponent = () => {
      useNotification();
      return null;
    };

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useNotification must be used within a NotificationProvider');

    // Restore console.error
    // eslint-disable-next-line no-console
    console.error = originalError;
  });

  it('shows success notification when showSuccess is called', async () => {
    const TestComponent = () => {
      const { showSuccess } = useNotification();
      return <button onClick={() => showSuccess('Success message')}>Show Success</button>;
    };

    const user = userEvent.setup();
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    const successButton = screen.getByRole('button', { name: /show success/i });
    await user.click(successButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeVisible();
      expect(screen.getByText('Success message')).toBeVisible();
    });
  });

  it('shows error notification when showError is called', async () => {
    const TestComponent = () => {
      const { showError } = useNotification();
      return <button onClick={() => showError('Error message')}>Show Error</button>;
    };

    const user = userEvent.setup();
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    const errorButton = screen.getByRole('button', { name: /show error/i });
    await user.click(errorButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeVisible();
      expect(screen.getByText('Error message')).toBeVisible();
    });
  });

  it('shows warning notification when showWarning is called', async () => {
    const TestComponent = () => {
      const { showWarning } = useNotification();
      return <button onClick={() => showWarning('Warning message')}>Show Warning</button>;
    };

    const user = userEvent.setup();
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    const warningButton = screen.getByRole('button', { name: /show warning/i });
    await user.click(warningButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeVisible();
      expect(screen.getByText('Warning message')).toBeVisible();
    });
  });

  it('shows info notification when showInfo is called', async () => {
    const TestComponent = () => {
      const { showInfo } = useNotification();
      return <button onClick={() => showInfo('Info message')}>Show Info</button>;
    };

    const user = userEvent.setup();
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    const infoButton = screen.getByRole('button', { name: /show info/i });
    await user.click(infoButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeVisible();
      expect(screen.getByText('Info message')).toBeVisible();
    });
  });

  it('closes notification when close button is clicked', async () => {
    const TestComponent = () => {
      const { showSuccess } = useNotification();
      return <button onClick={() => showSuccess('Success message')}>Show Success</button>;
    };

    const user = userEvent.setup();
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    const successButton = screen.getByRole('button', { name: /show success/i });
    await user.click(successButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeVisible();
      expect(screen.getByText('Success message')).toBeVisible();
    });

    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeVisible();
    });
  });
});
