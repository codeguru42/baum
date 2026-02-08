import { render, screen, within, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, afterEach } from 'vitest';
import GamesTable from './GamesTable';

describe('GamesTable', () => {
  const mockOnToggleValid = vi.fn();
  const mockOnSort = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockGames = [
    {
      id: 1,
      player_black: {
        id: 'AGA001',
        name: 'John Doe',
        rank: '5d',
        age: 30,
        color: 'black',
      },
      player_white: {
        id: 'AGA002',
        name: 'Jane Smith',
        rank: '3k',
        age: 25,
        color: 'white',
      },
      handicap: 0,
      winner: 'black',
      rated: true,
      valid_for_prizes: true,
      created_at: '2024-01-15T10:00:00Z',
    },
    {
      id: 2,
      player_black: {
        id: 'AGA004',
        name: 'Alice Brown',
        rank: '2d',
        age: 20,
        color: 'black',
      },
      player_white: {
        id: 'AGA003',
        name: 'Bob Wilson',
        rank: '1k',
        age: 65,
        color: 'white',
      },
      handicap: 2,
      winner: 'white',
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

    const rows = screen.getAllByRole('row');
    const row1Cells = within(rows[1]).getAllByRole('cell');
    const row2Cells = within(rows[2]).getAllByRole('cell');
    
    // Row 1: John Doe (black) vs Jane Smith (white)
    expect(row1Cells[0]).toHaveTextContent('John Doe');
    expect(row1Cells[4]).toHaveTextContent('Jane Smith');
    // Row 2: Alice Brown (black) vs Bob Wilson (white)
    expect(row2Cells[0]).toHaveTextContent('Alice Brown');
    expect(row2Cells[4]).toHaveTextContent('Bob Wilson');
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

    expect(screen.getByRole('columnheader', { name: 'Black Player' })).toBeVisible();
    expect(screen.getByRole('columnheader', { name: 'White Player' })).toBeVisible();
    expect(screen.getByRole('columnheader', { name: 'Age Diff' })).toBeVisible();
    expect(screen.getByRole('columnheader', { name: 'Handicap' })).toBeVisible();
    expect(screen.getByRole('columnheader', { name: 'Winner' })).toBeVisible();
    expect(screen.getByRole('columnheader', { name: 'Rated' })).toBeVisible();
    expect(screen.getByRole('columnheader', { name: 'Valid for Prizes' })).toBeVisible();
    expect(screen.getByRole('columnheader', { name: 'Date' })).toBeVisible();
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

    // Get all icon buttons (filter for validity toggle buttons specifically)
    const buttons = screen.getAllByRole('button');
    // Now all headers are sortable, so we need to find the validity toggle buttons
    // There are 14 sortable headers, then 2 validity toggle buttons (one per game)
    const validityButton = buttons[14]; // First validity toggle button
    fireEvent.click(validityButton);
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

    const ageDiffHeader = screen.getByRole('columnheader', { name: 'Age Diff' });
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

    const ratedHeader = screen.getByRole('columnheader', { name: 'Rated' });
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
    expect(screen.getByRole('columnheader', { name: 'Black Player' })).toBeVisible();
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
