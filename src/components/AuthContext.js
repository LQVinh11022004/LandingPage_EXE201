import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // đúng cú pháp cho v4+

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
      const response = await fetch(
        'https://mom-and-baby-e7dnhsgjcpgdb8cc.southeastasia-01.azurewebsites.net/api/authen/login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userName, password }),
        }
      );


      let responseData;
      try {
        responseData = await response.json();
      } catch (e) {
        responseData = {};
      }

      if (response.ok) {
        const token = responseData.accessToken; // ✅ lấy token đúng từ accessToken

        if (!token || typeof token !== 'string') {
          throw new Error('Invalid token received from server.');
        }

        const decodedToken = jwtDecode(token);
        const userRole = decodedToken.role;

        if (userRole !== 'ADMIN') {
          throw new Error('Access denied: Only ADMIN users can log in.');
        }

        localStorage.setItem('authToken', token);
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
