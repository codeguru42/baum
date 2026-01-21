import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

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
};

export default api;
