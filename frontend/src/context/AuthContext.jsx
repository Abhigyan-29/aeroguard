import React, { createContext, useState, useEffect, useContext } from 'react';
import { loginUser, registerUser } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('terrapulse_user');
    const token = localStorage.getItem('terrapulse_token');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email, password) => {
    const data = await loginUser(email, password);
    localStorage.setItem('terrapulse_token', data.token);
    localStorage.setItem('terrapulse_user', JSON.stringify(data.user));
    setUser(data.user);
    setIsAuthModalOpen(false);
  };

  const register = async (email, password) => {
    const data = await registerUser(email, password);
    localStorage.setItem('terrapulse_token', data.token);
    localStorage.setItem('terrapulse_user', JSON.stringify(data.user));
    setUser(data.user);
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    localStorage.removeItem('terrapulse_token');
    localStorage.removeItem('terrapulse_user');
    setUser(null);
  };

  const updateUserWatchlist = (newWatchlist) => {
    const updatedUser = { ...user, watchlist: newWatchlist };
    localStorage.setItem('terrapulse_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthModalOpen, setIsAuthModalOpen, updateUserWatchlist }}>
      {children}
    </AuthContext.Provider>
  );
};
