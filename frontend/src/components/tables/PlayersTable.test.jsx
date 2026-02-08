import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import PlayersTable from './PlayersTable';

describe('PlayersTable', () => {
  const mockPlayers = [
    {
      aga_id: 'AGA001',
      name: 'John Doe',
      aga_rank: '5d',
      age: 30,
      games_played: 10,
      games_won: 7,
      games_lost: 3,
      updated_at: '2024-01-15T10:00:00Z',
    },
    {
      aga_id: 'AGA002',
      name: 'Jane Smith',
      aga_rank: '3k',
      age: 25,
      games_played: 5,
      games_won: 2,
      games_lost: 3,
      updated_at: '2024-01-16T14:30:00Z',
    },
  ];

  const mockSortProps = {
    sortBy: 'name',
    sortOrder: 'asc',
    onSort: vi.fn(),
  };

  it('renders table with player data', () => {
    render(<PlayersTable players={mockPlayers} {...mockSortProps} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('AGA001')).toBeInTheDocument();
    expect(screen.getByText('AGA002')).toBeInTheDocument();
  });

  it('renders table headers correctly', () => {
    render(<PlayersTable players={mockPlayers} {...mockSortProps} />);

    expect(screen.getByText('AGA ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Rank')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
    expect(screen.getByText('Games Played')).toBeInTheDocument();
    expect(screen.getByText('Won')).toBeInTheDocument();
    expect(screen.getByText('Lost')).toBeInTheDocument();
    expect(screen.getByText('Last Updated')).toBeInTheDocument();
  });

  it('displays player ranks', () => {
    render(<PlayersTable players={mockPlayers} {...mockSortProps} />);

    expect(screen.getByText('5d')).toBeInTheDocument();
    expect(screen.getByText('3k')).toBeInTheDocument();
  });

  it('displays player ages', () => {
    render(<PlayersTable players={mockPlayers} {...mockSortProps} />);

    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('30');
    expect(rows[2]).toHaveTextContent('25');
  });

  it('displays game statistics', () => {
    render(<PlayersTable players={mockPlayers} {...mockSortProps} />);

    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('10'); // games played
    expect(rows[1]).toHaveTextContent('7'); // games won
    expect(rows[1]).toHaveTextContent('3'); // games lost
  });

  it('handles missing game statistics with defaults', () => {
    const playersWithoutStats = [
      {
        aga_id: 'AGA003',
        name: 'Bob Wilson',
        aga_rank: '1k',
        age: 35,
        updated_at: '2024-01-17T09:00:00Z',
      },
    ];

    render(<PlayersTable players={playersWithoutStats} {...mockSortProps} />);

    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('0'); // defaults for missing stats
  });

  it('renders empty table when no players provided', () => {
    render(<PlayersTable players={[]} {...mockSortProps} />);

    // Headers should still be present
    expect(screen.getByText('AGA ID')).toBeInTheDocument();
    // But no data rows
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });

  it('displays formatted dates', () => {
    render(<PlayersTable players={mockPlayers} {...mockSortProps} />);

    const rows = screen.getAllByRole('row');
    const hasDate = rows.some((row) => row.textContent.includes('2024'));
    expect(hasDate).toBe(true);
  });

  it('renders sortable column headers', () => {
    render(<PlayersTable players={mockPlayers} {...mockSortProps} />);

    // Check that all column headers are rendered and clickable
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(8);
  });

  it('calls onSort when column header is clicked', async () => {
    const user = userEvent.setup();
    const onSort = vi.fn();

    render(<PlayersTable players={mockPlayers} sortBy="name" sortOrder="asc" onSort={onSort} />);

    // Click on the "AGA ID" header
    const agaIdHeader = screen.getByText('AGA ID').closest('th');
    await user.click(agaIdHeader);

    expect(onSort).toHaveBeenCalledWith('agaId');
  });

  it('calls onSort with correct column key for each header', async () => {
    const user = userEvent.setup();
    const onSort = vi.fn();

    render(<PlayersTable players={mockPlayers} sortBy="name" sortOrder="asc" onSort={onSort} />);

    // Test Name column
    const nameHeader = screen.getByText('Name').closest('th');
    await user.click(nameHeader);
    expect(onSort).toHaveBeenCalledWith('name');

    // Test Age column
    const ageHeader = screen.getByText('Age').closest('th');
    await user.click(ageHeader);
    expect(onSort).toHaveBeenCalledWith('age');

    // Test Games Played column
    const gamesPlayedHeader = screen.getByText('Games Played').closest('th');
    await user.click(gamesPlayedHeader);
    expect(onSort).toHaveBeenCalledWith('gamesPlayed');
  });

  it('displays active sort indicator on sorted column', () => {
    render(<PlayersTable players={mockPlayers} sortBy="age" sortOrder="desc" onSort={vi.fn()} />);

    // The Age column should have the active sort indicator
    const ageHeader = screen.getByText('Age').closest('th');
    const sortLabel = ageHeader.querySelector('.MuiTableSortLabel-root');
    expect(sortLabel).toHaveClass('Mui-active');
  });

  it('displays correct sort direction indicator', () => {
    const { rerender } = render(
      <PlayersTable players={mockPlayers} sortBy="name" sortOrder="asc" onSort={vi.fn()} />
    );

    // Check ascending sort - verify the icon direction class
    const nameHeader = screen.getByText('Name').closest('th');
    let sortLabel = nameHeader.querySelector('.MuiTableSortLabel-root');
    expect(sortLabel).toHaveClass('Mui-active');
    // Check direction using the icon - ascending should not have the descending class
    let icon = sortLabel.querySelector('.MuiTableSortLabel-icon');
    expect(icon).not.toHaveClass('MuiTableSortLabel-iconDirectionDesc');

    // Rerender with descending sort
    rerender(
      <PlayersTable players={mockPlayers} sortBy="name" sortOrder="desc" onSort={vi.fn()} />
    );

    sortLabel = nameHeader.querySelector('.MuiTableSortLabel-root');
    expect(sortLabel).toHaveClass('Mui-active');
    // Check direction using the icon - descending should have the descending class
    icon = sortLabel.querySelector('.MuiTableSortLabel-icon');
    expect(icon).toHaveClass('MuiTableSortLabel-iconDirectionDesc');
  });

  it('marks all columns as sortable', () => {
    render(<PlayersTable players={mockPlayers} {...mockSortProps} />);

    // Check that all column headers have sort labels
    const sortLabels = screen.getAllByRole('button', { hidden: true });
    // Each column header should have a sort button
    expect(sortLabels.length).toBeGreaterThanOrEqual(8);
  });
});
