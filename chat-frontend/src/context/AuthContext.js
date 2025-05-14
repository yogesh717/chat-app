// src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [userId, setUserId] = useState(localStorage.getItem('userId') || null);

  useEffect(() => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');

    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');

    if (userId) localStorage.setItem('userId', userId);
    else localStorage.removeItem('userId');
  }, [token, user, userId]);

  const login = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    setUserId(newUser._id || newUser.id);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);





