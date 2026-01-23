import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import GameResultForm from './GameResultForm';
import { playerService, gameService } from '../services/api';

// Mock the API services
jest.mock('../services/api');

describe('GameResultForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders form with all required fields', () => {
    render(<GameResultForm />);
    
    expect(screen.getByText(/Go Tournament - Report Game Result/i)).toBeInTheDocument();
    expect(screen.getByText(/Player 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Player 2/i)).toBeInTheDocument();
    expect(screen.getByText(/Game Information/i)).toBeInTheDocument();
    expect(screen.getByText(/Submit Game Result/i)).toBeInTheDocument();
  });

  test('allows entering player information', () => {
    render(<GameResultForm />);
    
    const agaIdInputs = screen.getAllByLabelText(/AGA ID Number/i);
    const nameInputs = screen.getAllByLabelText(/Name/i);
    const rankInputs = screen.getAllByLabelText(/AGA Rank/i);
    const ageInputs = screen.getAllByLabelText(/Age/i);

    fireEvent.change(agaIdInputs[0], { target: { value: 'AGA123' } });
    fireEvent.change(nameInputs[0], { target: { value: 'John Doe' } });
    fireEvent.change(rankInputs[0], { target: { value: '5d' } });
    fireEvent.change(ageInputs[0], { target: { value: '30' } });

    expect(agaIdInputs[0].value).toBe('AGA123');
    expect(nameInputs[0].value).toBe('John Doe');
    expect(rankInputs[0].value).toBe('5d');
    expect(ageInputs[0].value).toBe('30');
  });

  test('automatically fills player data when AGA ID is found', async () => {
    const mockPlayerData = {
      data: {
        aga_id: 'AGA999',
        name: 'Jane Smith',
        aga_rank: '3k',
        age: 25,
      },
    };

    playerService.getByAgaId.mockResolvedValueOnce(mockPlayerData);

    render(<GameResultForm />);
    
    const agaIdInputs = screen.getAllByLabelText(/AGA ID Number/i);
    fireEvent.change(agaIdInputs[0], { target: { value: 'AGA999' } });

    await waitFor(() => {
      const nameInputs = screen.getAllByLabelText(/Name/i);
      expect(nameInputs[0].value).toBe('Jane Smith');
    });
  });

  test('updates color selection correctly', () => {
    render(<GameResultForm />);
    
    // Colors should be opposite by default
    const colorSelects = screen.getAllByLabelText(/Color/i);
    
    // Player 1 is black by default
    expect(colorSelects[0]).toHaveTextContent('Black');
    // Player 2 is white by default
    expect(colorSelects[1]).toHaveTextContent('White');
  });

  test('validates form before submission', async () => {
    render(<GameResultForm />);
    
    const submitButton = screen.getByText(/Submit Game Result/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Please fill in all Player 1 information/i)).toBeInTheDocument();
    });
  });

  test('submits form successfully with valid data', async () => {
    playerService.create.mockResolvedValue({});
    gameService.create.mockResolvedValue({});

    render(<GameResultForm />);
    
    // Fill in Player 1
    const agaIdInputs = screen.getAllByLabelText(/AGA ID Number/i);
    const nameInputs = screen.getAllByLabelText(/Name/i);
    const rankInputs = screen.getAllByLabelText(/AGA Rank/i);
    const ageInputs = screen.getAllByLabelText(/Age/i);

    fireEvent.change(agaIdInputs[0], { target: { value: 'AGA001' } });
    fireEvent.change(nameInputs[0], { target: { value: 'Alice' } });
    fireEvent.change(rankInputs[0], { target: { value: '5d' } });
    fireEvent.change(ageInputs[0], { target: { value: '30' } });

    // Fill in Player 2
    fireEvent.change(agaIdInputs[1], { target: { value: 'AGA002' } });
    fireEvent.change(nameInputs[1], { target: { value: 'Bob' } });
    fireEvent.change(rankInputs[1], { target: { value: '4d' } });
    fireEvent.change(ageInputs[1], { target: { value: '28' } });

    const submitButton = screen.getByText(/Submit Game Result/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(gameService.create).toHaveBeenCalled();
      expect(screen.getByText(/Game result submitted successfully!/i)).toBeInTheDocument();
    });
  });

  test('shows error when players have same AGA ID', async () => {
    render(<GameResultForm />);
    
    const agaIdInputs = screen.getAllByLabelText(/AGA ID Number/i);
    const nameInputs = screen.getAllByLabelText(/Name/i);
    const rankInputs = screen.getAllByLabelText(/AGA Rank/i);
    const ageInputs = screen.getAllByLabelText(/Age/i);

    // Use same AGA ID for both players
    fireEvent.change(agaIdInputs[0], { target: { value: 'AGA001' } });
    fireEvent.change(nameInputs[0], { target: { value: 'Alice' } });
    fireEvent.change(rankInputs[0], { target: { value: '5d' } });
    fireEvent.change(ageInputs[0], { target: { value: '30' } });

    fireEvent.change(agaIdInputs[1], { target: { value: 'AGA001' } });
    fireEvent.change(nameInputs[1], { target: { value: 'Bob' } });
    fireEvent.change(rankInputs[1], { target: { value: '4d' } });
    fireEvent.change(ageInputs[1], { target: { value: '28' } });

    const submitButton = screen.getByText(/Submit Game Result/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Player 1 and Player 2 must be different/i)).toBeInTheDocument();
    });
  });
});
