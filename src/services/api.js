/**
 * api.js
 * ------
 * Central Axios instance for all backend calls.
 *
 * HOW IT WORKS:
 *   - baseURL points to our FastAPI server
 *   - Request interceptor: attaches the JWT token to every request automatically
 *   - Response interceptor: redirects to /login if the server returns 401
 *
 * Usage in any component:
 *   import api from '../services/api'
 *   const response = await api.get('/potholes')
 */

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  timeout: 15000,
});

// ── Attach token to every outgoing request ───────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ph_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Handle 401 globally (token expired) ─────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ph_token');
      localStorage.removeItem('ph_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
