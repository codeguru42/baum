import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Navigation from './Navigation';

describe('Navigation', () => {
  const renderNavigation = () => {
    return render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    );
  };

  it('renders the app title', () => {
    renderNavigation();
    expect(screen.getByText('Go Tournament Manager')).toBeInTheDocument();
  });

  it('renders Submit Result button', () => {
    renderNavigation();
    expect(screen.getByText(/submit result/i)).toBeInTheDocument();
  });

  it('renders Admin button', () => {
    renderNavigation();
    expect(screen.getByText(/admin/i)).toBeInTheDocument();
  });

  it('renders navigation within an AppBar', () => {
    renderNavigation();
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });
});
