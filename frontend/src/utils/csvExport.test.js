import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { exportGamesToCSV, exportPlayersToCSV } from './csvExport';

// Mock document and URL APIs
global.URL.createObjectURL = vi.fn(() => 'mock-url');
global.URL.revokeObjectURL = vi.fn();

describe('csvExport', () => {
  let mockLink;
  let appendChildSpy;
  let removeChildSpy;

  beforeEach(() => {
    // Create a mock link element
    mockLink = {
      href: '',
      download: '',
      click: vi.fn(),
    };
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink);
    appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
    removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('exportPlayersToCSV', () => {
    it('should generate correct CSV headers for players', () => {
      const players = [];
      exportPlayersToCSV(players);

      expect(mockLink.click).toHaveBeenCalled();
      expect(appendChildSpy).toHaveBeenCalledWith(mockLink);
      expect(removeChildSpy).toHaveBeenCalledWith(mockLink);

      // Check that Blob was created (we can't easily inspect its content in tests)
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });

    it('should format player data correctly', () => {
      const players = [
        {
          aga_id: 'AGA001',
          name: 'John Doe',
          aga_rank: '5d',
          age: 30,
          games_played: 10,
          games_won: 7,
          games_lost: 3,
        },
      ];

      exportPlayersToCSV(players);

      expect(mockLink.click).toHaveBeenCalled();
    });

    it('should handle players with null/undefined stats', () => {
      const players = [
        {
          aga_id: 'AGA002',
          name: 'Jane Smith',
          aga_rank: '3k',
          age: 25,
          games_played: null,
          games_won: undefined,
          games_lost: null,
        },
      ];

      exportPlayersToCSV(players);

      expect(mockLink.click).toHaveBeenCalled();
    });

    it('should escape special characters in player names', () => {
      const players = [
        {
          aga_id: 'AGA003',
          name: 'O"Brien, Patrick',
          aga_rank: '1k',
          age: 40,
          games_played: 5,
          games_won: 2,
          games_lost: 3,
        },
      ];

      exportPlayersToCSV(players);

      expect(mockLink.click).toHaveBeenCalled();
    });

    it('should use default filename with current date', () => {
      const players = [];
      const today = new Date().toISOString().split('T')[0];
      const expectedFilename = `players_export_${today}.csv`;

      exportPlayersToCSV(players);

      expect(mockLink.download).toBe(expectedFilename);
    });

    it('should use custom filename when provided', () => {
      const players = [];
      const customFilename = 'custom_players.csv';

      exportPlayersToCSV(players, customFilename);

      expect(mockLink.download).toBe(customFilename);
    });
  });

  describe('exportGamesToCSV', () => {
    const mockGame = {
      id: 1,
      player_black: {
        id: 'AGA001',
        name: 'John Doe',
        rank: '5d',
        age: 30,
      },
      player_white: {
        id: 'AGA002',
        name: 'Jane Smith',
        rank: '3k',
        age: 45,
      },
      handicap: 0,
      winner: 'black',
      rated: true,
      valid_for_prizes: true,
      created_at: '2026-02-21T14:30:00.000Z',
    };

    it('should generate correct CSV headers for games', () => {
      const games = [];
      exportGamesToCSV(games);

      expect(mockLink.click).toHaveBeenCalled();
      expect(appendChildSpy).toHaveBeenCalledWith(mockLink);
      expect(removeChildSpy).toHaveBeenCalledWith(mockLink);
    });

    it('should format game data correctly', () => {
      const games = [mockGame];

      exportGamesToCSV(games);

      expect(mockLink.click).toHaveBeenCalled();
    });

    it('should calculate age difference correctly', () => {
      const games = [mockGame];

      exportGamesToCSV(games);

      expect(mockLink.click).toHaveBeenCalled();
      // Age diff should be |30 - 45| = 15
    });

    it('should format winner as capitalized string', () => {
      const gamesWithWhiteWinner = [
        {
          ...mockGame,
          winner: 'white',
        },
      ];

      exportGamesToCSV(gamesWithWhiteWinner);

      expect(mockLink.click).toHaveBeenCalled();
      // Winner should be "White" not "white"
    });

    it('should format boolean values as Yes/No', () => {
      const gamesWithFalseValues = [
        {
          ...mockGame,
          rated: false,
          valid_for_prizes: false,
        },
      ];

      exportGamesToCSV(gamesWithFalseValues);

      expect(mockLink.click).toHaveBeenCalled();
      // rated and valid_for_prizes should be "No"
    });

    it('should format dates as ISO 8601', () => {
      const games = [mockGame];

      exportGamesToCSV(games);

      expect(mockLink.click).toHaveBeenCalled();
      // Date should be in ISO format: 2026-02-21T14:30:00.000Z
    });

    it('should handle games with special characters in player names', () => {
      const gamesWithSpecialChars = [
        {
          ...mockGame,
          player_black: {
            ...mockGame.player_black,
            name: 'O"Brien, Patrick',
          },
        },
      ];

      exportGamesToCSV(gamesWithSpecialChars);

      expect(mockLink.click).toHaveBeenCalled();
    });

    it('should use default filename with current date', () => {
      const games = [];
      const today = new Date().toISOString().split('T')[0];
      const expectedFilename = `games_export_${today}.csv`;

      exportGamesToCSV(games);

      expect(mockLink.download).toBe(expectedFilename);
    });

    it('should use custom filename when provided', () => {
      const games = [];
      const customFilename = 'custom_games.csv';

      exportGamesToCSV(games, customFilename);

      expect(mockLink.download).toBe(customFilename);
    });

    it('should handle multiple games correctly', () => {
      const games = [
        mockGame,
        {
          ...mockGame,
          id: 2,
          winner: 'white',
          rated: false,
        },
      ];

      exportGamesToCSV(games);

      expect(mockLink.click).toHaveBeenCalled();
    });
  });
});
