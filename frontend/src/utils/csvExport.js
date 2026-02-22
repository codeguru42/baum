/**
 * Utility functions for exporting data to CSV format
 */

/**
 * Escapes special characters in CSV values
 * @param {*} value - Value to format
 * @returns {string} - Formatted CSV value
 */
const formatCSVValue = (value) => {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);

  // If value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
};

/**
 * Triggers browser download of CSV content
 * @param {string} csvContent - CSV content string
 * @param {string} filename - Filename for download
 */
const triggerDownload = (csvContent, filename) => {
  // Add UTF-8 BOM for Excel compatibility
  const BOM = '\ufeff';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Exports players data to CSV file
 * @param {Array} players - Array of player objects
 * @param {string} filename - Optional filename (defaults to players_export_YYYY-MM-DD.csv)
 */
export const exportPlayersToCSV = (players, filename) => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const defaultFilename = `players_export_${today}.csv`;

  // CSV headers matching PlayersTable columns
  const headers = ['AGA ID', 'Name', 'Rank', 'Age', 'Games Played', 'Won', 'Lost'];

  // Convert players to CSV rows
  const rows = players.map((player) => [
    formatCSVValue(player.aga_id),
    formatCSVValue(player.name),
    formatCSVValue(player.aga_rank),
    formatCSVValue(player.age),
    formatCSVValue(player.games_played ?? 0),
    formatCSVValue(player.games_won ?? 0),
    formatCSVValue(player.games_lost ?? 0),
  ]);

  // Combine headers and rows
  const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\r\n');

  triggerDownload(csvContent, filename || defaultFilename);
};

/**
 * Exports games data to CSV file
 * @param {Array} games - Array of game objects
 * @param {string} filename - Optional filename (defaults to games_export_YYYY-MM-DD.csv)
 */
export const exportGamesToCSV = (games, filename) => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const defaultFilename = `games_export_${today}.csv`;

  // CSV headers matching GamesTable columns
  const headers = [
    'Black Player',
    'Black AGA ID',
    'Black Rank',
    'Black Age',
    'White Player',
    'White AGA ID',
    'White Rank',
    'White Age',
    'Age Diff',
    'Handicap',
    'Winner',
    'Rated',
    'Valid for Prizes',
    'Date',
  ];

  // Convert games to CSV rows
  const rows = games.map((game) => {
    const ageDiff = Math.abs(game.player_black.age - game.player_white.age);
    const winner = game.winner === 'black' ? 'Black' : 'White';
    const rated = game.rated ? 'Yes' : 'No';
    const validForPrizes = game.valid_for_prizes ? 'Yes' : 'No';
    const date = new Date(game.created_at).toISOString();

    return [
      formatCSVValue(game.player_black.name),
      formatCSVValue(game.player_black.id),
      formatCSVValue(game.player_black.rank),
      formatCSVValue(game.player_black.age),
      formatCSVValue(game.player_white.name),
      formatCSVValue(game.player_white.id),
      formatCSVValue(game.player_white.rank),
      formatCSVValue(game.player_white.age),
      formatCSVValue(ageDiff),
      formatCSVValue(game.handicap),
      formatCSVValue(winner),
      formatCSVValue(rated),
      formatCSVValue(validForPrizes),
      formatCSVValue(date),
    ];
  });

  // Combine headers and rows
  const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\r\n');

  triggerDownload(csvContent, filename || defaultFilename);
};
