import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import Titlebar from './Titlebar';

describe('Titlebar', () => {
  const renderTitlebar = () => {
    return render(
      <BrowserRouter>
        <Titlebar />
      </BrowserRouter>
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
