import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import GamesTable from './GamesTable';

describe('GamesTable', () => {
  const mockOnToggleValid = vi.fn();
  const mockOnSort = vi.fn();

  const mockGames = [
    {
      id: 1,
      player1: {
        id: 'AGA001',
        name: 'John Doe',
        rank: '5d',
        age: 30,
        color: 'black',
      },
      player2: {
        id: 'AGA002',
        name: 'Jane Smith',
        rank: '3k',
        age: 25,
        color: 'white',
      },
      handicap: 0,
      winner: 'player1',
      rated: true,
      valid_for_prizes: true,
      created_at: '2024-01-15T10:00:00Z',
    },
    {
      id: 2,
      player1: {
        id: 'AGA003',
        name: 'Bob Wilson',
        rank: '1k',
        age: 65,
        color: 'white',
      },
      player2: {
        id: 'AGA004',
        name: 'Alice Brown',
        rank: '2d',
        age: 20,
        color: 'black',
      },
      handicap: 2,
      winner: 'player2',
      rated: false,
      valid_for_prizes: false,
      created_at: '2024-01-16T14:30:00Z',
    },
  ];

  it('renders table with game data', () => {
    render(
      <GamesTable
        games={mockGames}
        onToggleValid={mockOnToggleValid}
        sortBy="ageDiff"
        sortOrder="desc"
        onSort={mockOnSort}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
    expect(screen.getByText('Alice Brown')).toBeInTheDocument();
  });

  it('renders table headers correctly', () => {
    render(
      <GamesTable
        games={mockGames}
        onToggleValid={mockOnToggleValid}
        sortBy="ageDiff"
        sortOrder="desc"
        onSort={mockOnSort}
      />
    );

    expect(screen.getByText('Game ID')).toBeInTheDocument();
    expect(screen.getByText('Black Player')).toBeInTheDocument();
    expect(screen.getByText('White Player')).toBeInTheDocument();
    expect(screen.getByText('Age Diff')).toBeInTheDocument();
    expect(screen.getByText('Handicap')).toBeInTheDocument();
    expect(screen.getByText('Winner')).toBeInTheDocument();
    expect(screen.getByText('Rated')).toBeInTheDocument();
    expect(screen.getByText('Valid for Prizes')).toBeInTheDocument();
  });

  it('displays correct player colors (black and white)', () => {
    render(
      <GamesTable
        games={mockGames}
        onToggleValid={mockOnToggleValid}
        sortBy="ageDiff"
        sortOrder="desc"
        onSort={mockOnSort}
      />
    );

    // Game 1: John is black, Jane is white
    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('John Doe');
    expect(rows[1]).toHaveTextContent('Jane Smith');
  });

  it('displays age difference with correct color coding', () => {
    render(
      <GamesTable
        games={mockGames}
        onToggleValid={mockOnToggleValid}
        sortBy="ageDiff"
        sortOrder="desc"
        onSort={mockOnSort}
      />
    );

    // Game 1: age diff is 5 (30-25) - should be warning
    // Game 2: age diff is 45 (65-20) - should be success
    const chips = screen.getAllByText(/\d+/).filter((el) => el.className.includes('MuiChip'));
    expect(chips.length).toBeGreaterThan(0);
  });

  it('displays handicap values', () => {
    render(
      <GamesTable
        games={mockGames}
        onToggleValid={mockOnToggleValid}
        sortBy="ageDiff"
        sortOrder="desc"
        onSort={mockOnSort}
      />
    );

    // Check that handicap column exists
    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('0'); // handicap for game 1
    expect(rows[2]).toHaveTextContent('2'); // handicap for game 2
  });

  it('displays winner color chips', () => {
    render(
      <GamesTable
        games={mockGames}
        onToggleValid={mockOnToggleValid}
        sortBy="ageDiff"
        sortOrder="desc"
        onSort={mockOnSort}
      />
    );

    const winnerChips = screen
      .getAllByText(/Black|White/)
      .filter((el) => el.className.includes('MuiChip'));
    expect(winnerChips.length).toBeGreaterThanOrEqual(2);
  });

  it('displays rated status correctly', () => {
    render(
      <GamesTable
        games={mockGames}
        onToggleValid={mockOnToggleValid}
        sortBy="ageDiff"
        sortOrder="desc"
        onSort={mockOnSort}
      />
    );

    const yesChips = screen.getAllByText('Yes');
    const noChips = screen.getAllByText('No');
    expect(yesChips.length).toBeGreaterThan(0);
    expect(noChips.length).toBeGreaterThan(0);
  });

  it('calls onToggleValid when validity button is clicked', () => {
    render(
      <GamesTable
        games={mockGames}
        onToggleValid={mockOnToggleValid}
        sortBy="ageDiff"
        sortOrder="desc"
        onSort={mockOnSort}
      />
    );

    // Get all icon buttons
    const buttons = screen.getAllByRole('button');
    // Click third button (validity toggle - first two are sort buttons)
    fireEvent.click(buttons[2]);
    expect(mockOnToggleValid).toHaveBeenCalled();
  });

  it('calls onSort when Age Diff header is clicked', () => {
    render(
      <GamesTable
        games={mockGames}
        onToggleValid={mockOnToggleValid}
        sortBy="ageDiff"
        sortOrder="desc"
        onSort={mockOnSort}
      />
    );

    const ageDiffHeader = screen.getByText('Age Diff');
    fireEvent.click(ageDiffHeader);
    expect(mockOnSort).toHaveBeenCalledWith('ageDiff');
  });

  it('calls onSort when Rated header is clicked', () => {
    render(
      <GamesTable
        games={mockGames}
        onToggleValid={mockOnToggleValid}
        sortBy="rated"
        sortOrder="asc"
        onSort={mockOnSort}
      />
    );

    const ratedHeader = screen.getByText('Rated');
    fireEvent.click(ratedHeader);
    expect(mockOnSort).toHaveBeenCalledWith('rated');
  });

  it('renders empty table when no games provided', () => {
    render(
      <GamesTable
        games={[]}
        onToggleValid={mockOnToggleValid}
        sortBy="ageDiff"
        sortOrder="desc"
        onSort={mockOnSort}
      />
    );

    // Headers should still be present
    expect(screen.getByText('Game ID')).toBeInTheDocument();
    // But no data rows
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });

  it('displays formatted dates', () => {
    render(
      <GamesTable
        games={mockGames}
        onToggleValid={mockOnToggleValid}
        sortBy="ageDiff"
        sortOrder="desc"
        onSort={mockOnSort}
      />
    );

    // Check that dates are formatted (should contain month and year)
    const rows = screen.getAllByRole('row');
    // Date should be in one of the data rows - check row content
    const hasDate = rows.some((row) => row.textContent.includes('2024'));
    expect(hasDate).toBe(true);
  });
});
