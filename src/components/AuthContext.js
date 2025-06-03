import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (userName, password, navigate) => {
    try {
      const response = await fetch('https://localhost:7015/api/authen/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName, password }),
      });
      console.log('API Response Status:', response.status);
      let responseData;
      try {
        responseData = await response.json();
      } catch (e) {
        responseData = {};
      }
      if (response.ok) {
        localStorage.setItem('authToken', responseData.token);
        setIsAuthenticated(true);
        navigate('/dashboard');
      } else {
        let errorMessage = 'Login failed';
        if (response.status === 404) {
          errorMessage = 'Login endpoint not found. Please check the backend server.';
        } else if (response.status === 401) {
          errorMessage = responseData.message || 'Invalid username or password';
        } else {
          errorMessage = responseData.message || 'An error occurred during login';
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, loading }}>
      {children}
    </AuthContext.Provider>
  );
};