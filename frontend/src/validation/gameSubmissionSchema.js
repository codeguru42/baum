import * as yup from 'yup';

/**
 * AGA Rank Validation
 * Kyu ranks: 30k, 29k, ..., 2k, 1k
 * Dan ranks: 1d, 2d, ..., 9d, 10d
 * Case insensitive
 */
const agaRankValidation = yup
  .string()
  .required('Rank is required')
  .matches(
    /^(([1-9]|[12][0-9]|30)k|([1-9]|10)d)$/i,
    'Rank must be 30k-1k or 1d-10d (e.g., 5k, 3d)'
  );

/**
 * Player Schema
 * Validates individual player data
 * AGA ID: numeric only, no leading zeros (except "0" alone)
 */
const playerSchema = yup.object({
  aga_id: yup
    .string()
    .required('AGA ID is required')
    .matches(/^(0|[1-9]\d*)$/, 'AGA ID must contain only digits (0-9)')
    .trim(),
  name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .trim(),
  aga_rank: agaRankValidation,
  age: yup
    .number()
    .required('Age is required')
    .typeError('Age must be a number')
    .positive('Age must be positive')
    .integer('Age must be a whole number'),
});

/**
 * Game Submission Schema
 * Validates entire game submission form
 * Includes cross-field validation for different players
 */
export const gameSubmissionSchema = yup
  .object({
    playerBlack: playerSchema,
    playerWhite: playerSchema,
    handicap: yup
      .mixed()
      .required('Handicap is required')
      .test('is-valid-handicap', 'Invalid handicap value', (value) => {
        if (value === '9+') return true;
        const num = Number(value);
        return Number.isInteger(num) && num >= 0 && num <= 9;
      }),
    rated: yup.boolean(),
    winner: yup
      .string()
      .required('Winner must be selected')
      .oneOf(['black', 'white'], 'Winner must be black or white'),
  })
  .test('different-players', null, function (value) {
    const { playerBlack, playerWhite } = value || {};

    // Validate that Black and White are different players
    if (playerBlack?.aga_id && playerWhite?.aga_id && playerBlack.aga_id === playerWhite.aga_id) {
      return this.createError({
        path: 'playerWhite.aga_id',
        message: 'Black and White must be different players',
      });
    }

    return true;
  });
