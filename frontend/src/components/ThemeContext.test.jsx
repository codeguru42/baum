import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ThemeProvider, useTheme } from './ThemeContext';

describe('ThemeContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders children correctly', () => {
    render(
      <ThemeProvider>
        <div>Test Child</div>
      </ThemeProvider>
    );

    expect(screen.getByText('Test Child')).toBeVisible();
  });

  it('throws error when useTheme is used outside provider', () => {
    // Suppress console.error for this test
    // eslint-disable-next-line no-console
    const originalError = console.error;
    // eslint-disable-next-line no-console
    console.error = () => {};

    const TestComponent = () => {
      useTheme();
      return null;
    };

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useTheme must be used within a ThemeProvider');

    // eslint-disable-next-line no-console
    console.error = originalError;
  });

  it('defaults to light mode when no saved preference', () => {
    const TestComponent = () => {
      const { mode, isDark } = useTheme();
      return (
        <div>
          <div>Mode: {mode}</div>
          <div>Is Dark: {isDark ? 'yes' : 'no'}</div>
        </div>
      );
    };

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByText('Mode: light')).toBeVisible();
    expect(screen.getByText('Is Dark: no')).toBeVisible();
  });

  it('loads saved theme preference from localStorage', () => {
    localStorage.setItem('themeMode', 'dark');

    const TestComponent = () => {
      const { mode, isDark } = useTheme();
      return (
        <div>
          <div>Mode: {mode}</div>
          <div>Is Dark: {isDark ? 'yes' : 'no'}</div>
        </div>
      );
    };

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByText('Mode: dark')).toBeVisible();
    expect(screen.getByText('Is Dark: yes')).toBeVisible();
  });

  it('toggles theme from light to dark', async () => {
    const TestComponent = () => {
      const { mode, toggleTheme } = useTheme();
      return (
        <div>
          <div>Mode: {mode}</div>
          <button onClick={toggleTheme}>Toggle Theme</button>
        </div>
      );
    };

    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByText('Mode: light')).toBeVisible();

    const toggleButton = screen.getByRole('button', { name: /toggle theme/i });
    await user.click(toggleButton);

    expect(screen.getByText('Mode: dark')).toBeVisible();
    expect(localStorage.getItem('themeMode')).toBe('dark');
  });

  it('toggles theme from dark to light', async () => {
    localStorage.setItem('themeMode', 'dark');

    const TestComponent = () => {
      const { mode, toggleTheme } = useTheme();
      return (
        <div>
          <div>Mode: {mode}</div>
          <button onClick={toggleTheme}>Toggle Theme</button>
        </div>
      );
    };

    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByText('Mode: dark')).toBeVisible();

    const toggleButton = screen.getByRole('button', { name: /toggle theme/i });
    await user.click(toggleButton);

    expect(screen.getByText('Mode: light')).toBeVisible();
    expect(localStorage.getItem('themeMode')).toBe('light');
  });

  it('persists theme preference across re-renders', async () => {
    const TestComponent = () => {
      const { mode, toggleTheme } = useTheme();
      return (
        <div>
          <div>Mode: {mode}</div>
          <button onClick={toggleTheme}>Toggle Theme</button>
        </div>
      );
    };

    const user = userEvent.setup();
    const { unmount } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const toggleButton = screen.getByRole('button', { name: /toggle theme/i });
    await user.click(toggleButton);

    expect(screen.getByText('Mode: dark')).toBeVisible();

    // Unmount and remount
    unmount();
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Should still be dark mode
    expect(screen.getByText('Mode: dark')).toBeVisible();
  });
});
