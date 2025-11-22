// auth/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const storedUser = localStorage.getItem('vdesk_user');
    const token = localStorage.getItem('vdesk_token');
    
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  };

  const login = (userData) => {
    // Store in localStorage with app-specific keys
    localStorage.setItem('vdesk_user', JSON.stringify(userData));
    localStorage.setItem('vdesk_token', userData.token);
    
    // Update state
    setUser(userData);
  };

  const logout = () => {
    // Clear storage
    localStorage.removeItem('vdesk_user');
    localStorage.removeItem('vdesk_token');
    
    // Update state
    setUser(null);
  };

  // Get auth token for API requests
  const getToken = () => {
    return localStorage.getItem('vdesk_token');
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user?.role === role;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      loading,
      getToken,
      hasRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};