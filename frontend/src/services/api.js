import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const playerService = {
  getAll: () => api.get('/players/'),
  getByAgaId: (agaId) => api.get(`/players/${agaId}/`),
  create: (playerData) => api.post('/players/', playerData),
  update: (agaId, playerData) => api.put(`/players/${agaId}/`, playerData),
  delete: (agaId) => api.delete(`/players/${agaId}/`),
};

export const gameService = {
  getAll: () => api.get('/games/'),
  getById: (id) => api.get(`/games/${id}/`),
  create: (gameData) => api.post('/games/', gameData),
  update: (id, gameData) => api.patch(`/games/${id}/`, gameData),
};

export default api;
