import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import GameResultForm from './GameResultForm';
import * as api from '../services/api';

// Mock the API module
jest.mock('../services/api');

// Mock axios module
jest.mock('axios');

describe('GameResultForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders form with title', () => {
    render(<GameResultForm />);
    
    expect(screen.getByText(/Go Tournament/i)).toBeInTheDocument();
  });

  test('renders submit button', () => {
    render(<GameResultForm />);
    
    expect(screen.getByRole('button', { name: /Submit Game Result/i })).toBeInTheDocument();
  });

  test('allows entering player AGA ID', () => {
    render(<GameResultForm />);
    
    const agaIdInputs = screen.getAllByLabelText(/AGA ID Number/i);
    fireEvent.change(agaIdInputs[0], { target: { value: 'AGA123' } });

    expect(agaIdInputs[0].value).toBe('AGA123');
  });

  test('shows validation error when submitting empty form', async () => {
    render(<GameResultForm />);
    
    const submitButton = screen.getByRole('button', { name: /Submit Game Result/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Please fill in all Black player information/i)).toBeInTheDocument();
    });
  });
});
