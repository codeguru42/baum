import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
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

  it('renders table with player data', () => {
    render(<PlayersTable players={mockPlayers} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('AGA001')).toBeInTheDocument();
    expect(screen.getByText('AGA002')).toBeInTheDocument();
  });

  it('renders table headers correctly', () => {
    render(<PlayersTable players={mockPlayers} />);

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
    render(<PlayersTable players={mockPlayers} />);

    expect(screen.getByText('5d')).toBeInTheDocument();
    expect(screen.getByText('3k')).toBeInTheDocument();
  });

  it('displays player ages', () => {
    render(<PlayersTable players={mockPlayers} />);

    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('30');
    expect(rows[2]).toHaveTextContent('25');
  });

  it('displays game statistics', () => {
    render(<PlayersTable players={mockPlayers} />);

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

    render(<PlayersTable players={playersWithoutStats} />);

    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('0'); // defaults for missing stats
  });

  it('renders empty table when no players provided', () => {
    render(<PlayersTable players={[]} />);

    // Headers should still be present
    expect(screen.getByText('AGA ID')).toBeInTheDocument();
    // But no data rows
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });

  it('displays formatted dates', () => {
    render(<PlayersTable players={mockPlayers} />);

    const rows = screen.getAllByRole('row');
    const hasDate = rows.some((row) => row.textContent.includes('2024'));
    expect(hasDate).toBe(true);
  });
});
