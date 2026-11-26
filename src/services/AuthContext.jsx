/**
 * AuthContext  (updated for Phase 2)
 * -----------
 * Now calls the real FastAPI /api/auth/login endpoint.
 * Stores the JWT token in localStorage alongside the user object.
 */

import { createContext, useContext, useState } from 'react';
import api from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('ph_user');
    return stored ? JSON.parse(stored) : null;
  });

  async function login(username, password) {
    try {
      const response = await api.post('/auth/login', { username, password });
      const { access_token, user: userData } = response.data;

      // Store both the token (for API calls) and user info (for display)
      localStorage.setItem('ph_token', access_token);
      localStorage.setItem('ph_user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.detail || 'Login failed. Please try again.';
      return { success: false, message };
    }
  }

  function logout() {
    setUser(null);
    localStorage.removeItem('ph_token');
    localStorage.removeItem('ph_user');
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
