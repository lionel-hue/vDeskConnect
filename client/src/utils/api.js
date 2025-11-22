// src/utils/api.js
// Utility function for making authenticated API requests

export const apiRequest = async (url, options = {}) => {
  const token = localStorage.getItem('vdesk_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle token expiration or invalid token
    if (response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('vdesk_token');
      localStorage.removeItem('vdesk_user');
      window.location.href = '/';
      throw new Error('Authentication failed. Please login again.');
    }

    return response;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Helper to get the current user ID from localStorage
export const getCurrentUserId = () => {
  const user = localStorage.getItem('vdesk_user');
  if (user) {
    return JSON.parse(user).id;
  }
  return null;
};

// Helper to get the current user role from localStorage
export const getCurrentUserRole = () => {
  const user = localStorage.getItem('vdesk_user');
  if (user) {
    return JSON.parse(user).role;
  }
  return null;
};