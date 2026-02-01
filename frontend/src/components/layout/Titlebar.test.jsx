import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import Titlebar from './Titlebar';
import { ThemeProvider } from '../ThemeContext';

describe('Titlebar', () => {
  const renderTitlebar = () => {
    return render(
      <ThemeProvider>
        <BrowserRouter>
          <Titlebar />
        </BrowserRouter>
      </ThemeProvider>
    );
  };

  it('renders the app title', () => {
    renderTitlebar();
    expect(screen.getByText('Go Tournament Manager')).toBeInTheDocument();
  });

  it('renders titlebar within an AppBar', () => {
    renderTitlebar();
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });
});
