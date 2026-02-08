import { describe, expect, it } from 'vitest';
import { gameSubmissionSchema } from './gameSubmissionSchema';

describe('gameSubmissionSchema', () => {
  // Helper to create valid baseline data
  const createValidData = () => ({
    playerBlack: {
      aga_id: '12345',
      name: 'John Doe',
      aga_rank: '5k',
      age: 25,
    },
    playerWhite: {
      aga_id: '67890',
      name: 'Jane Smith',
      aga_rank: '3d',
      age: 30,
    },
    handicap: 0,
    rated: true,
    winner: 'black',
  });

  describe('Valid Data', () => {
    it('validates correct game submission data', async () => {
      const data = createValidData();
      await expect(gameSubmissionSchema.validate(data)).resolves.toEqual(data);
    });

    it('validates with handicap in valid range', async () => {
      const data = createValidData();
      data.handicap = 5;
      await expect(gameSubmissionSchema.validate(data)).resolves.toEqual(data);
    });

    it('validates with white as winner', async () => {
      const data = createValidData();
      data.winner = 'white';
      await expect(gameSubmissionSchema.validate(data)).resolves.toEqual(data);
    });

    it('validates with rated false', async () => {
      const data = createValidData();
      data.rated = false;
      await expect(gameSubmissionSchema.validate(data)).resolves.toEqual(data);
    });
  });

  describe('AGA ID Validation', () => {
    it('rejects empty AGA ID', async () => {
      const data = createValidData();
      data.playerBlack.aga_id = '';
      await expect(gameSubmissionSchema.validate(data)).rejects.toThrow('AGA ID is required');
    });

    it('rejects AGA ID with letters', async () => {
      const data = createValidData();
      data.playerBlack.aga_id = '123ABC';
      await expect(gameSubmissionSchema.validate(data)).rejects.toThrow(
        'AGA ID must contain only digits (0-9)'
      );
    });

    it('rejects AGA ID with leading zeros', async () => {
      const data = createValidData();
      data.playerBlack.aga_id = '0123';
      await expect(gameSubmissionSchema.validate(data)).rejects.toThrow(
        'AGA ID must contain only digits (0-9)'
      );
    });

    it('rejects AGA ID with special characters', async () => {
      const data = createValidData();
      data.playerBlack.aga_id = '123-456';
      await expect(gameSubmissionSchema.validate(data)).rejects.toThrow(
        'AGA ID must contain only digits (0-9)'
      );
    });

    it('rejects AGA ID with spaces', async () => {
      const data = createValidData();
      data.playerBlack.aga_id = '123 456';
      await expect(gameSubmissionSchema.validate(data)).rejects.toThrow(
        'AGA ID must contain only digits (0-9)'
      );
    });

    it('accepts single zero as AGA ID', async () => {
      const data = createValidData();
      data.playerBlack.aga_id = '0';
      await expect(gameSubmissionSchema.validate(data)).resolves.toBeTruthy();
    });

    it('accepts large numeric AGA ID', async () => {
      const data = createValidData();
      data.playerBlack.aga_id = '999999999';
      await expect(gameSubmissionSchema.validate(data)).resolves.toBeTruthy();
    });

    it('trims whitespace from AGA ID', async () => {
      const data = createValidData();
      data.playerBlack.aga_id = '  12345  ';
      const result = await gameSubmissionSchema.validate(data);
      expect(result.playerBlack.aga_id).toBe('12345');
    });
  });

  describe('Name Validation', () => {
    it('rejects empty name', async () => {
      const data = createValidData();
      data.playerBlack.name = '';
      await expect(gameSubmissionSchema.validate(data)).rejects.toThrow('Name is required');
    });

    it('rejects name shorter than 2 characters', async () => {
      const data = createValidData();
      data.playerBlack.name = 'A';
      await expect(gameSubmissionSchema.validate(data)).rejects.toThrow(
        'Name must be at least 2 characters'
      );
    });

    it('accepts name with exactly 2 characters', async () => {
      const data = createValidData();
      data.playerBlack.name = 'AB';
      await expect(gameSubmissionSchema.validate(data)).resolves.toBeTruthy();
    });

    it('accepts long names', async () => {
      const data = createValidData();
      data.playerBlack.name = 'Alexander Hamilton-Montgomery';
      await expect(gameSubmissionSchema.validate(data)).resolves.toBeTruthy();
    });

    it('trims whitespace from name', async () => {
      const data = createValidData();
      data.playerBlack.name = '  John Doe  ';
      const result = await gameSubmissionSchema.validate(data);
      expect(result.playerBlack.name).toBe('John Doe');
    });
  });

  describe('AGA Rank Validation', () => {
    it('rejects empty rank', async () => {
      const data = createValidData();
      data.playerBlack.aga_rank = '';
      await expect(gameSubmissionSchema.validate(data)).rejects.toThrow('Rank is required');
    });

    // Valid Kyu ranks
    it('accepts valid kyu ranks (30k to 1k)', async () => {
      const data = createValidData();
      const validKyuRanks = ['30k', '25k', '15k', '10k', '5k', '1k'];

      for (const rank of validKyuRanks) {
        data.playerBlack.aga_rank = rank;
        await expect(gameSubmissionSchema.validate(data)).resolves.toBeTruthy();
      }
    });

    // Valid Dan ranks
    it('accepts valid dan ranks (1d to 10d)', async () => {
      const data = createValidData();
      const validDanRanks = ['1d', '5d', '9d', '10d'];

      for (const rank of validDanRanks) {
        data.playerBlack.aga_rank = rank;
        await expect(gameSubmissionSchema.validate(data)).resolves.toBeTruthy();
      }
    });

    // Case insensitivity
    it('accepts ranks in uppercase', async () => {
      const data = createValidData();
      data.playerBlack.aga_rank = '5K';
      await expect(gameSubmissionSchema.validate(data)).resolves.toBeTruthy();
    });

    it('accepts ranks in mixed case', async () => {
      const data = createValidData();
      data.playerBlack.aga_rank = '3D';
      await expect(gameSubmissionSchema.validate(data)).resolves.toBeTruthy();
    });

    // Invalid ranks
    it('rejects 0k rank', async () => {
      const data = createValidData();
      data.playerBlack.aga_rank = '0k';
      await expect(gameSubmissionSchema.validate(data)).rejects.toThrow(
        'Rank must be 30k-1k or 1d-10d'
      );
    });

    it('rejects 31k rank (above maximum kyu)', async () => {
      const data = createValidData();
      data.playerBlack.aga_rank = '31k';
      await expect(gameSubmissionSchema.validate(data)).rejects.toThrow(
        'Rank must be 30k-1k or 1d-10d'
      );
    });

    it('rejects 0d rank', async () => {
      const data = createValidData();
      data.playerBlack.aga_rank = '0d';
      await expect(gameSubmissionSchema.validate(data)).rejects.toThrow(
        'Rank must be 30k-1k or 1d-10d'
      );
    });

    it('rejects 11d rank (above maximum dan)', async () => {
      const data = createValidData();
      data.playerBlack.aga_rank = '11d';
      await expect(gameSubmissionSchema.validate(data)).rejects.toThrow(
        'Rank must be 30k-1k or 1d-10d'
      );
    });

    it('rejects rank without k or d suffix', async () => {
      const data = createValidData();
      data.playerBlack.aga_rank = '5';
      await expect(gameSubmissionSchema.validate(data)).rejects.toThrow(
        'Rank must be 30k-1k or 1d-10d'
      );
    });

    it('rejects rank with invalid format', async () => {
      const data = createValidData();
      data.playerBlack.aga_rank = 'kyuu5';
      await expect(gameSubmissionSchema.validate(data)).rejects.toThrow(
        'Rank must be 30k-1k or 1d-10d'
      );
    });
  });

  describe('Age Validation', () => {
    it('rejects empty age', async () => {
      const data = createValidData();
      data.playerBlack.age = undefined;
      await expect(gameSubmissionSchema.validate(data)).rejects.toThrow('Age is required');
    });

    it('rejects non-numeric age', async () => {
      const data = createValidData();
      data.playerBlack.age = 'twenty';
      await expect(gameSubmissionSchema.validate(data)).rejects.toThrow('Age must be a number');
    });

    it('rejects zero age', async () => {
      const data = createValidData();
      data.playerBlack.age = 0;
      await expect(gameSubmissionSchema.validate(data)).rejects.toThrow('Age must be positive');
    });

    it('rejects negative age', async () => {
      const data = createValidData();
      data.playerBlack.age = -5;
      await expect(gameSubmissionSchema.validate(data)).rejects.toThrow('Age must be positive');
    });

    it('rejects decimal age', async () => {
      const data = createValidData();
      data.playerBlack.age = 25.5;
      await expect(gameSubmissionSchema.validate(data)).rejects.toThrow(
        'Age must be a whole number'
      );
    });

    it('accepts valid age', async () => {
      const data = createValidData();
      data.playerBlack.age = 42;
      await expect(gameSubmissionSchema.validate(data)).resolves.toBeTruthy();
    });

    it('accepts very young age', async () => {
      const data = createValidData();
      data.playerBlack.age = 5;
      await expect(gameSubmissionSchema.validate(data)).resolves.toBeTruthy();
    });

    it('accepts very old age', async () => {
      const data = createValidData();
      data.playerBlack.age = 120;
      await expect(gameSubmissionSchema.validate(data)).resolves.toBeTruthy();
    });
  });

  describe('Handicap Validation', () => {
    it('rejects non-numeric handicap', async () => {
      const data = createValidData();
      data.handicap = 'three';
      await expect(gameSubmissionSchema.validate(data)).rejects.toThrow(
        'Handicap must be a number'
      );
    });

    it('rejects negative handicap', async () => {
      const data = createValidData();
      data.handicap = -1;
      await expect(gameSubmissionSchema.validate(data)).rejects.toThrow(
        'Handicap must be at least 0'
      );
    });

    it('rejects handicap greater than 9', async () => {
      const data = createValidData();
      data.handicap = 10;
      await expect(gameSubmissionSchema.validate(data)).rejects.toThrow(
        'Handicap must be 9 or less'
      );
    });

    it('rejects decimal handicap', async () => {
      const data = createValidData();
      data.handicap = 3.5;
      await expect(gameSubmissionSchema.validate(data)).rejects.toThrow(
        'Handicap must be a whole number'
      );
    });

    it('accepts handicap from 0 to 9', async () => {
      const data = createValidData();
      for (let h = 0; h <= 9; h++) {
        data.handicap = h;
        await expect(gameSubmissionSchema.validate(data)).resolves.toBeTruthy();
      }
    });
  });

  describe('Winner Validation', () => {
    it('rejects empty winner', async () => {
      const data = createValidData();
      data.winner = '';
      await expect(gameSubmissionSchema.validate(data)).rejects.toThrow(
        'Winner must be black or white'
      );
    });

    it('rejects invalid winner value', async () => {
      const data = createValidData();
      data.winner = 'draw';
      await expect(gameSubmissionSchema.validate(data)).rejects.toThrow(
        'Winner must be black or white'
      );
    });

    it('accepts black as winner', async () => {
      const data = createValidData();
      data.winner = 'black';
      await expect(gameSubmissionSchema.validate(data)).resolves.toBeTruthy();
    });

    it('accepts white as winner', async () => {
      const data = createValidData();
      data.winner = 'white';
      await expect(gameSubmissionSchema.validate(data)).resolves.toBeTruthy();
    });
  });

  describe('Cross-Field Validation', () => {
    it('rejects same AGA ID for both players', async () => {
      const data = createValidData();
      data.playerBlack.aga_id = '12345';
      data.playerWhite.aga_id = '12345';
      await expect(gameSubmissionSchema.validate(data)).rejects.toThrow(
        'Black and White must be different players'
      );
    });

    it('accepts different AGA IDs for both players', async () => {
      const data = createValidData();
      data.playerBlack.aga_id = '12345';
      data.playerWhite.aga_id = '67890';
      await expect(gameSubmissionSchema.validate(data)).resolves.toBeTruthy();
    });

    it('allows same name if AGA IDs are different', async () => {
      const data = createValidData();
      data.playerBlack.name = 'John Doe';
      data.playerWhite.name = 'John Doe';
      data.playerBlack.aga_id = '12345';
      data.playerWhite.aga_id = '67890';
      await expect(gameSubmissionSchema.validate(data)).resolves.toBeTruthy();
    });
  });

  describe('Both Players Validation', () => {
    it('validates both black and white player fields', async () => {
      const data = createValidData();
      data.playerBlack.name = 'A'; // Too short
      data.playerWhite.aga_rank = '99k'; // Invalid rank
      
      await expect(gameSubmissionSchema.validate(data)).rejects.toThrow();
    });

    it('requires all fields for both players', async () => {
      const data = createValidData();
      data.playerWhite.age = undefined;
      
      await expect(gameSubmissionSchema.validate(data)).rejects.toThrow('Age is required');
    });
  });
});
